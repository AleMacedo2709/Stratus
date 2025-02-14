using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.AspNetCore.Http;
using Serilog;
using System.Diagnostics;
using System.Security.Claims;

namespace PlanMP.API.Infrastructure.Monitoring;

public class MonitoringMiddleware
{
    private readonly RequestDelegate _next;
    private readonly TelemetryClient _telemetryClient;
    private readonly ILogger _logger;
    private readonly MonitoringOptions _options;

    public MonitoringMiddleware(
        RequestDelegate next,
        TelemetryClient telemetryClient,
        ILogger logger,
        MonitoringOptions options)
    {
        _next = next;
        _telemetryClient = telemetryClient;
        _logger = logger;
        _options = options;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        var requestId = Activity.Current?.Id ?? context.TraceIdentifier;

        try
        {
            // Log início da requisição
            LogRequestStart(context, requestId);

            // Monitora performance
            using (var operation = _telemetryClient.StartOperation<RequestTelemetry>("Request"))
            {
                operation.Telemetry.Context.User.Id = GetUserId(context);
                operation.Telemetry.Context.Session.Id = GetSessionId(context);

                try
                {
                    await _next(context);

                    // Registra métricas de performance
                    TrackPerformanceMetrics(context, sw.ElapsedMilliseconds);

                    // Log sucesso
                    LogRequestSuccess(context, requestId, sw.ElapsedMilliseconds);
                }
                catch (Exception ex)
                {
                    // Log erro
                    LogRequestError(context, requestId, ex, sw.ElapsedMilliseconds);
                    operation.Telemetry.Success = false;
                    throw;
                }
                finally
                {
                    operation.Telemetry.Duration = TimeSpan.FromMilliseconds(sw.ElapsedMilliseconds);
                    operation.Telemetry.ResponseCode = context.Response.StatusCode.ToString();
                    operation.Telemetry.Properties["RequestId"] = requestId;
                }
            }
        }
        finally
        {
            sw.Stop();
        }
    }

    private void LogRequestStart(HttpContext context, string requestId)
    {
        var endpoint = context.GetEndpoint()?.DisplayName;
        _logger.Information(
            "Request {RequestMethod} {RequestPath} started. RequestId: {RequestId}, Endpoint: {Endpoint}",
            context.Request.Method,
            context.Request.Path,
            requestId,
            endpoint);
    }

    private void LogRequestSuccess(HttpContext context, string requestId, long elapsedMs)
    {
        _logger.Information(
            "Request {RequestMethod} {RequestPath} completed successfully in {ElapsedMilliseconds}ms. " +
            "RequestId: {RequestId}, StatusCode: {StatusCode}",
            context.Request.Method,
            context.Request.Path,
            elapsedMs,
            requestId,
            context.Response.StatusCode);
    }

    private void LogRequestError(HttpContext context, string requestId, Exception ex, long elapsedMs)
    {
        _logger.Error(
            ex,
            "Request {RequestMethod} {RequestPath} failed after {ElapsedMilliseconds}ms. " +
            "RequestId: {RequestId}, Error: {ErrorMessage}",
            context.Request.Method,
            context.Request.Path,
            elapsedMs,
            requestId,
            ex.Message);

        // Track exception in Application Insights
        _telemetryClient.TrackException(ex, new Dictionary<string, string>
        {
            ["RequestId"] = requestId,
            ["RequestPath"] = context.Request.Path,
            ["RequestMethod"] = context.Request.Method
        });
    }

    private void TrackPerformanceMetrics(HttpContext context, long elapsedMs)
    {
        // Track request duration
        _telemetryClient.TrackMetric("RequestDuration", elapsedMs);

        // Track memory usage
        var currentMemory = Process.GetCurrentProcess().WorkingSet64;
        _telemetryClient.TrackMetric("MemoryUsage", currentMemory);

        // Alert if request is too slow
        if (elapsedMs > _options.SlowRequestThresholdMs)
        {
            _logger.Warning(
                "Slow request detected: {RequestMethod} {RequestPath} took {ElapsedMilliseconds}ms",
                context.Request.Method,
                context.Request.Path,
                elapsedMs);

            _telemetryClient.TrackEvent("SlowRequest", new Dictionary<string, string>
            {
                ["RequestPath"] = context.Request.Path,
                ["RequestMethod"] = context.Request.Method,
                ["Duration"] = elapsedMs.ToString()
            });
        }
    }

    private string GetUserId(HttpContext context)
    {
        return context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
    }

    private string GetSessionId(HttpContext context)
    {
        if (context.Request.Cookies.TryGetValue(".AspNetCore.Session", out var sessionId))
            return sessionId;

        return "unknown";
    }
}

public class MonitoringOptions
{
    public int SlowRequestThresholdMs { get; set; } = 5000; // 5 segundos
    public bool EnablePerformanceMonitoring { get; set; } = true;
    public bool EnableRequestLogging { get; set; } = true;
    public bool EnableMetrics { get; set; } = true;
}

public static class MonitoringMiddlewareExtensions
{
    public static IApplicationBuilder UseMonitoring(
        this IApplicationBuilder builder,
        Action<MonitoringOptions>? configureOptions = null)
    {
        var options = new MonitoringOptions();
        configureOptions?.Invoke(options);

        return builder.UseMiddleware<MonitoringMiddleware>(options);
    }
} 