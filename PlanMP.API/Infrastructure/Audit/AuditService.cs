using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using PlanMP.API.Application.Common.Interfaces;
using PlanMP.API.Domain.Entities;
using System.Security.Claims;

namespace PlanMP.API.Infrastructure.Audit;

public interface IAuditService
{
    Task LogActivity(string action, string entityType, string entityId, object? oldValue = null, object? newValue = null);
    Task<IEnumerable<AuditLog>> GetAuditTrail(string entityType, string entityId);
    Task<IEnumerable<AuditLog>> GetUserActivities(string userId, DateTime? startDate = null, DateTime? endDate = null);
}

public class AuditService : IAuditService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTime _dateTime;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditService(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IDateTime dateTime,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _currentUserService = currentUserService;
        _dateTime = dateTime;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogActivity(
        string action,
        string entityType,
        string entityId,
        object? oldValue = null,
        object? newValue = null)
    {
        var auditLog = new AuditLog
        {
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Timestamp = _dateTime.Now,
            UserId = _currentUserService.UserId,
            UserName = _currentUserService.UserName,
            IpAddress = GetClientIpAddress(),
            UserAgent = GetUserAgent(),
            OldValue = oldValue != null ? JsonConvert.SerializeObject(oldValue) : null,
            NewValue = newValue != null ? JsonConvert.SerializeObject(newValue) : null,
            AdditionalInfo = new Dictionary<string, string>
            {
                { "UserRoles", GetUserRoles() },
                { "RequestPath", GetRequestPath() },
                { "RequestMethod", GetRequestMethod() }
            }
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetAuditTrail(string entityType, string entityId)
    {
        return await _context.AuditLogs
            .Where(log => log.EntityType == entityType && log.EntityId == entityId)
            .OrderByDescending(log => log.Timestamp)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetUserActivities(
        string userId,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var query = _context.AuditLogs
            .Where(log => log.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(log => log.Timestamp >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(log => log.Timestamp <= endDate.Value);

        return await query
            .OrderByDescending(log => log.Timestamp)
            .ToListAsync();
    }

    private string GetClientIpAddress()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return "Unknown";

        var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
            return forwardedFor.Split(',')[0].Trim();

        return httpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
    }

    private string GetUserAgent()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return "Unknown";

        return httpContext.Request.Headers["User-Agent"].ToString();
    }

    private string GetUserRoles()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null) return string.Empty;

        var roles = user.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value);

        return string.Join(",", roles);
    }

    private string GetRequestPath()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return "Unknown";

        return httpContext.Request.Path.Value ?? "Unknown";
    }

    private string GetRequestMethod()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return "Unknown";

        return httpContext.Request.Method;
    }
} 