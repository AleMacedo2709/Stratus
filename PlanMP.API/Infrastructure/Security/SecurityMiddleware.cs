using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace PlanMP.API.Infrastructure.Security;

public class SecurityMiddleware
{
    private readonly RequestDelegate _next;
    private readonly SecurityOptions _options;

    public SecurityMiddleware(RequestDelegate next, SecurityOptions options)
    {
        _next = next;
        _options = options;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Adiciona headers de segurança
        AddSecurityHeaders(context);

        // Valida o request
        if (!await ValidateRequest(context))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return;
        }

        await _next(context);
    }

    private void AddSecurityHeaders(HttpContext context)
    {
        var headers = context.Response.Headers;

        // Previne XSS
        headers["X-XSS-Protection"] = "1; mode=block";

        // Previne Clickjacking
        headers["X-Frame-Options"] = "DENY";

        // Previne MIME type sniffing
        headers["X-Content-Type-Options"] = "nosniff";

        // Habilita HSTS
        headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";

        // Content Security Policy
        headers["Content-Security-Policy"] = BuildContentSecurityPolicy();

        // Referrer Policy
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Permissions Policy
        headers["Permissions-Policy"] = BuildPermissionsPolicy();

        // Remove headers que podem expor informações sensíveis
        headers.Remove("Server");
        headers.Remove("X-Powered-By");
        headers.Remove("X-AspNet-Version");
    }

    private async Task<bool> ValidateRequest(HttpContext context)
    {
        // Valida tamanho do request
        if (context.Request.ContentLength > _options.MaxRequestSize)
            return false;

        // Valida origem do request
        if (!ValidateOrigin(context))
            return false;

        // Valida rate limiting
        if (!await ValidateRateLimit(context))
            return false;

        // Valida tokens
        if (!ValidateTokens(context))
            return false;

        return true;
    }

    private string BuildContentSecurityPolicy()
    {
        return "default-src 'self';" +
               "script-src 'self' 'unsafe-inline' 'unsafe-eval';" +
               "style-src 'self' 'unsafe-inline';" +
               "img-src 'self' data: https:;" +
               "font-src 'self';" +
               "connect-src 'self';" +
               "media-src 'self';" +
               "object-src 'none';" +
               "frame-src 'self';" +
               "worker-src 'self';" +
               "frame-ancestors 'none';" +
               "form-action 'self';" +
               "base-uri 'self';" +
               "manifest-src 'self'";
    }

    private string BuildPermissionsPolicy()
    {
        return "accelerometer=()," +
               "ambient-light-sensor=()," +
               "autoplay=()," +
               "battery=()," +
               "camera=()," +
               "display-capture=()," +
               "document-domain=()," +
               "encrypted-media=()," +
               "execution-while-not-rendered=()," +
               "execution-while-out-of-viewport=()," +
               "fullscreen=()," +
               "geolocation=()," +
               "gyroscope=()," +
               "layout-animations=()," +
               "legacy-image-formats=()," +
               "magnetometer=()," +
               "microphone=()," +
               "midi=()," +
               "navigation-override=()," +
               "payment=()," +
               "picture-in-picture=()," +
               "publickey-credentials-get=()," +
               "sync-xhr=()," +
               "usb=()," +
               "wake-lock=()," +
               "xr-spatial-tracking=()";
    }

    private bool ValidateOrigin(HttpContext context)
    {
        var origin = context.Request.Headers["Origin"].ToString();
        return string.IsNullOrEmpty(origin) || _options.AllowedOrigins.Contains(origin);
    }

    private async Task<bool> ValidateRateLimit(HttpContext context)
    {
        var clientIp = context.Connection.RemoteIpAddress?.ToString();
        if (string.IsNullOrEmpty(clientIp))
            return false;

        var key = $"rate_limit:{clientIp}";
        var requestCount = await _options.Cache.GetAsync<int>(key);

        if (requestCount >= _options.MaxRequestsPerMinute)
            return false;

        await _options.Cache.SetAsync(key, requestCount + 1, TimeSpan.FromMinutes(1));
        return true;
    }

    private bool ValidateTokens(HttpContext context)
    {
        // Valida CSRF token para métodos não seguros
        if (!IsGetRequest(context) && !ValidateCsrfToken(context))
            return false;

        return true;
    }

    private bool IsGetRequest(HttpContext context)
    {
        return HttpMethods.IsGet(context.Request.Method);
    }

    private bool ValidateCsrfToken(HttpContext context)
    {
        var cookieToken = context.Request.Cookies["XSRF-TOKEN"];
        var headerToken = context.Request.Headers["X-XSRF-TOKEN"].ToString();

        return !string.IsNullOrEmpty(cookieToken) &&
               !string.IsNullOrEmpty(headerToken) &&
               cookieToken == headerToken;
    }
}

public class SecurityOptions
{
    public long MaxRequestSize { get; set; } = 10 * 1024 * 1024; // 10MB
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
    public int MaxRequestsPerMinute { get; set; } = 60;
    public IDistributedCache Cache { get; set; } = null!;
}

public static class SecurityMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityMiddleware(
        this IApplicationBuilder builder,
        Action<SecurityOptions> configureOptions)
    {
        var options = new SecurityOptions();
        configureOptions(options);

        return builder.UseMiddleware<SecurityMiddleware>(options);
    }
} 