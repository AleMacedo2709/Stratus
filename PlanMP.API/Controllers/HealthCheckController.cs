using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using PlanMP.API.Infrastructure.Monitoring;

namespace PlanMP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthCheckController : ControllerBase
{
    private readonly IHealthCheckService _healthCheckService;
    private readonly ILogger<HealthCheckController> _logger;

    public HealthCheckController(
        IHealthCheckService healthCheckService,
        ILogger<HealthCheckController> logger)
    {
        _healthCheckService = healthCheckService;
        _logger = logger;
    }

    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(HealthCheckResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetHealthStatus()
    {
        try
        {
            var result = await _healthCheckService.CheckSystemHealth();

            return result.Status == HealthStatus.Healthy
                ? Ok(result)
                : StatusCode(StatusCodes.Status503ServiceUnavailable, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking system health");
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new { status = "Error", message = "Error checking system health" });
        }
    }

    [HttpGet("detailed")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(IDictionary<string, HealthStatus>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetDetailedHealthStatus()
    {
        try
        {
            var result = await _healthCheckService.GetDetailedHealthStatus();

            return result.Any(r => r.Value == HealthStatus.Unhealthy)
                ? StatusCode(StatusCodes.Status503ServiceUnavailable, result)
                : Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking detailed system health");
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new { status = "Error", message = "Error checking detailed system health" });
        }
    }
} 