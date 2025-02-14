using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PlanMP.API.Application.Common.Interfaces;
using PlanMP.API.Application.Common.Mappings;
using PlanMP.API.Application.Common.Models;
using PlanMP.API.Application.Tasks.DTOs;
using PlanMP.API.Domain.Enums;

namespace PlanMP.API.Application.Tasks.Queries;

public class GetTasksQuery : IRequest<PaginatedList<TaskDto>>
{
    public int? InitiativeId { get; set; }
    public string? AssigneeId { get; set; }
    public TaskStatus[]? Status { get; set; }
    public TaskPriority[]? Priority { get; set; }
    public RiskLevel[]? RiskLevel { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

public class GetTasksQueryHandler : IRequestHandler<GetTasksQuery, PaginatedList<TaskDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetTasksQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<TaskDto>> Handle(GetTasksQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var userArea = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => u.AreaId)
            .FirstOrDefaultAsync(cancellationToken);

        var query = _context.Tasks
            .Include(t => t.Initiative)
            .Include(t => t.Assignee)
            .Include(t => t.Tags)
                .ThenInclude(tt => tt.Tag)
            .Include(t => t.Dependencies)
                .ThenInclude(td => td.DependencyTask)
            .AsQueryable();

        // Filter by user's area or permissions
        query = query.Where(t =>
            t.Initiative.Action.AreaId == userArea ||
            _context.UnitPermissions.Any(p =>
                p.UserId == userId &&
                p.UnitId == t.Initiative.Action.AreaId &&
                p.Actions.Contains("View")));

        // Apply filters
        if (request.InitiativeId.HasValue)
        {
            query = query.Where(t => t.InitiativeId == request.InitiativeId);
        }

        if (!string.IsNullOrEmpty(request.AssigneeId))
        {
            query = query.Where(t => t.AssigneeId == request.AssigneeId);
        }

        if (request.Status?.Length > 0)
        {
            query = query.Where(t => request.Status.Contains(t.Status));
        }

        if (request.Priority?.Length > 0)
        {
            query = query.Where(t => request.Priority.Contains(t.Priority));
        }

        if (request.RiskLevel?.Length > 0)
        {
            query = query.Where(t => request.RiskLevel.Contains(t.RiskLevel));
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(t => t.StartDate >= request.StartDate);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(t => t.EndDate <= request.EndDate);
        }

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(t =>
                t.Name.ToLower().Contains(searchTerm) ||
                t.Description.ToLower().Contains(searchTerm) ||
                t.Tags.Any(tt => tt.Tag.Name.ToLower().Contains(searchTerm)));
        }

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDescending
                ? query.OrderByDescending(t => t.Name)
                : query.OrderBy(t => t.Name),
            "priority" => request.SortDescending
                ? query.OrderByDescending(t => t.Priority)
                : query.OrderBy(t => t.Priority),
            "status" => request.SortDescending
                ? query.OrderByDescending(t => t.Status)
                : query.OrderBy(t => t.Status),
            "enddate" => request.SortDescending
                ? query.OrderByDescending(t => t.EndDate)
                : query.OrderBy(t => t.EndDate),
            "progress" => request.SortDescending
                ? query.OrderByDescending(t => t.Progress)
                : query.OrderBy(t => t.Progress),
            _ => query.OrderByDescending(t => t.CreatedAt)
        };

        return await query
            .ProjectTo<TaskDto>(_mapper.ConfigurationProvider)
            .ToPaginatedListAsync(request.PageNumber, request.PageSize);
    }
} 