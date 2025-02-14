using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace PlanMP.API.Infrastructure.Security;

public interface ISecurityValidationService
{
    Task<bool> ValidatePassword(string password);
    Task<bool> ValidateAccessToken(string token);
    Task<bool> ValidateUserAccess(ClaimsPrincipal user, string resource, string action);
    Task<bool> ValidateRequestOrigin(HttpContext context);
    Task<bool> CheckRateLimit(string key, int limit, TimeSpan window);
    Task<bool> ValidateInputData(string input, string pattern);
    Task LogSecurityEvent(string eventType, string description, string userId, string ipAddress);
}

public class SecurityValidationService : ISecurityValidationService
{
    private readonly IConfiguration _configuration;
    private readonly IDistributedCache _cache;
    private readonly ILogger<SecurityValidationService> _logger;
    private readonly IEncryptionService _encryptionService;

    public SecurityValidationService(
        IConfiguration configuration,
        IDistributedCache cache,
        ILogger<SecurityValidationService> logger,
        IEncryptionService encryptionService)
    {
        _configuration = configuration;
        _cache = cache;
        _logger = logger;
        _encryptionService = encryptionService;
    }

    public async Task<bool> ValidatePassword(string password)
    {
        try
        {
            // Requisitos mínimos de senha
            var hasMinLength = password.Length >= 12;
            var hasUpperCase = password.Any(char.IsUpper);
            var hasLowerCase = password.Any(char.IsLower);
            var hasDigit = password.Any(char.IsDigit);
            var hasSpecialChar = password.Any(c => !char.IsLetterOrDigit(c));

            // Verifica se a senha não está em uma lista de senhas comuns
            var isCommonPassword = await CheckCommonPasswords(password);

            // Verifica padrões de repetição
            var hasRepeatingPatterns = CheckRepeatingPatterns(password);

            return hasMinLength && hasUpperCase && hasLowerCase && 
                   hasDigit && hasSpecialChar && !isCommonPassword && !hasRepeatingPatterns;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating password");
            return false;
        }
    }

    public async Task<bool> ValidateAccessToken(string token)
    {
        try
        {
            // Verifica se o token está na blacklist
            var isBlacklisted = await _cache.GetStringAsync($"blacklist:{token}") != null;
            if (isBlacklisted)
                return false;

            // Adicione aqui validação adicional do token JWT
            // Exemplo: verificação de assinatura, expiração, etc.

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating access token");
            return false;
        }
    }

    public async Task<bool> ValidateUserAccess(ClaimsPrincipal user, string resource, string action)
    {
        try
        {
            // Verifica se o usuário está autenticado
            if (!user.Identity?.IsAuthenticated ?? true)
                return false;

            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return false;

            // Verifica se a conta está bloqueada
            var isLocked = await _cache.GetStringAsync($"lockout:{userId}") != null;
            if (isLocked)
                return false;

            // Verifica permissões específicas
            var permissions = user.FindAll(ClaimTypes.Role).Select(c => c.Value);
            var requiredPermission = $"{resource}:{action}";

            return permissions.Any(p => p == requiredPermission || p == "Admin");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating user access");
            return false;
        }
    }

    public async Task<bool> ValidateRequestOrigin(HttpContext context)
    {
        try
        {
            var origin = context.Request.Headers["Origin"].ToString();
            var allowedOrigins = _configuration.GetSection("Security:AllowedOrigins")
                .Get<string[]>() ?? Array.Empty<string>();

            // Verifica CORS
            if (!string.IsNullOrEmpty(origin) && !allowedOrigins.Contains(origin))
                return false;

            // Verifica User-Agent
            var userAgent = context.Request.Headers["User-Agent"].ToString();
            if (string.IsNullOrEmpty(userAgent) || IsSuspiciousUserAgent(userAgent))
                return false;

            // Verifica IP
            var ipAddress = context.Connection.RemoteIpAddress?.ToString();
            if (string.IsNullOrEmpty(ipAddress))
                return false;

            // Verifica se o IP está bloqueado
            var isBlocked = await _cache.GetStringAsync($"blockedip:{ipAddress}") != null;
            if (isBlocked)
                return false;

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating request origin");
            return false;
        }
    }

    public async Task<bool> CheckRateLimit(string key, int limit, TimeSpan window)
    {
        try
        {
            var counter = await _cache.GetStringAsync(key);
            var count = counter != null ? int.Parse(counter) : 0;

            if (count >= limit)
                return false;

            await _cache.SetStringAsync(
                key,
                (count + 1).ToString(),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = window
                });

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking rate limit for key {Key}", key);
            return false;
        }
    }

    public async Task<bool> ValidateInputData(string input, string pattern)
    {
        try
        {
            if (string.IsNullOrEmpty(input))
                return false;

            // Verifica tamanho máximo
            if (input.Length > 1000) // Configurable
                return false;

            // Verifica caracteres perigosos
            if (ContainsDangerousCharacters(input))
                return false;

            // Verifica padrão específico
            if (!string.IsNullOrEmpty(pattern) && !Regex.IsMatch(input, pattern))
                return false;

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating input data");
            return false;
        }
    }

    public async Task LogSecurityEvent(string eventType, string description, string userId, string ipAddress)
    {
        try
        {
            // Log detalhado do evento de segurança
            var securityEvent = new
            {
                EventType = eventType,
                Description = description,
                UserId = userId,
                IpAddress = ipAddress,
                Timestamp = DateTime.UtcNow,
                AdditionalInfo = new Dictionary<string, string>
                {
                    ["UserAgent"] = GetUserAgent(),
                    ["RequestPath"] = GetRequestPath(),
                    ["Method"] = GetRequestMethod()
                }
            };

            // Log para sistema de logging
            _logger.LogInformation(
                "Security Event: {EventType} - User: {UserId} - IP: {IpAddress} - {Description}",
                eventType, userId, ipAddress, description);

            // Aqui você pode adicionar lógica para salvar em banco de dados
            // ou enviar para um sistema de monitoramento de segurança
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging security event");
        }
    }

    private async Task<bool> CheckCommonPasswords(string password)
    {
        // Implementar verificação contra lista de senhas comuns
        return false;
    }

    private bool CheckRepeatingPatterns(string password)
    {
        // Verifica padrões de repetição (exemplo: "123123" ou "abcabc")
        return Regex.IsMatch(password, @"(.+?)\1+");
    }

    private bool IsSuspiciousUserAgent(string userAgent)
    {
        var suspiciousPatterns = new[]
        {
            "bot", "crawler", "spider", "scan", "exploit",
            "sqlmap", "nikto", "nmap", "burp", "wget"
        };

        return suspiciousPatterns.Any(p => 
            userAgent.Contains(p, StringComparison.OrdinalIgnoreCase));
    }

    private bool ContainsDangerousCharacters(string input)
    {
        var dangerousPatterns = new[]
        {
            @"<script", @"javascript:", @"vbscript:",
            @"data:", @"alert\(", @"onclick=", @"onerror=",
            @"document\.", @"eval\(", @"setTimeout\("
        };

        return dangerousPatterns.Any(p => 
            Regex.IsMatch(input, p, RegexOptions.IgnoreCase));
    }

    private string GetUserAgent()
    {
        // Implementar obtenção do User-Agent
        return string.Empty;
    }

    private string GetRequestPath()
    {
        // Implementar obtenção do caminho da requisição
        return string.Empty;
    }

    private string GetRequestMethod()
    {
        // Implementar obtenção do método HTTP
        return string.Empty;
    }
} 