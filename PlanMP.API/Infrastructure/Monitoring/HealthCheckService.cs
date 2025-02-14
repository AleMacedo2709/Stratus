using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Net.Http;

namespace PlanMP.API.Infrastructure.Monitoring;

public interface IHealthCheckService
{
    Task<HealthCheckResult> CheckSystemHealth();
    Task<IDictionary<string, HealthStatus>> GetDetailedHealthStatus();
}

public class HealthCheckService : IHealthCheckService
{
    private readonly ILogger<HealthCheckService> _logger;
    private readonly string _connectionString;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public HealthCheckService(
        ILogger<HealthCheckService> logger,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _configuration = configuration;
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        _httpClient = httpClientFactory.CreateClient("HealthCheck");
    }

    public async Task<HealthCheckResult> CheckSystemHealth()
    {
        try
        {
            var healthChecks = new Dictionary<string, HealthStatus>();

            // Verifica banco de dados
            healthChecks["Database"] = await CheckDatabaseHealth();

            // Verifica uso de memória
            healthChecks["Memory"] = CheckMemoryHealth();

            // Verifica CPU
            healthChecks["CPU"] = await CheckCpuHealth();

            // Verifica espaço em disco
            healthChecks["Disk"] = CheckDiskSpace();

            // Verifica serviços externos
            healthChecks["ExternalServices"] = await CheckExternalServices();

            // Verifica certificados
            healthChecks["Certificates"] = CheckCertificates();

            // Analisa resultados
            var overallStatus = DetermineOverallStatus(healthChecks);
            var description = GenerateHealthDescription(healthChecks);

            return new HealthCheckResult(
                overallStatus,
                description,
                data: new Dictionary<string, object>
                {
                    { "Checks", healthChecks },
                    { "Timestamp", DateTime.UtcNow }
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing health check");
            return HealthCheckResult.Unhealthy("Error performing health check", ex);
        }
    }

    public async Task<IDictionary<string, HealthStatus>> GetDetailedHealthStatus()
    {
        var details = new Dictionary<string, HealthStatus>();

        try
        {
            // Coleta métricas detalhadas
            details["DatabaseConnections"] = await CheckDatabaseConnections();
            details["DatabaseLatency"] = await CheckDatabaseLatency();
            details["ApiEndpoints"] = await CheckApiEndpoints();
            details["BackgroundJobs"] = await CheckBackgroundJobs();
            details["CacheHealth"] = await CheckCacheHealth();
            details["MessageQueue"] = await CheckMessageQueue();
            details["StorageAccess"] = await CheckStorageAccess();
            details["SecurityServices"] = await CheckSecurityServices();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting detailed health status");
            details["Error"] = HealthStatus.Unhealthy;
        }

        return details;
    }

    private async Task<HealthStatus> CheckDatabaseHealth()
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SqlCommand("SELECT 1", connection);
            await command.ExecuteScalarAsync();

            return HealthStatus.Healthy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private HealthStatus CheckMemoryHealth()
    {
        try
        {
            var process = Process.GetCurrentProcess();
            var memoryUsage = process.WorkingSet64;
            var memoryThreshold = 1024L * 1024L * 1024L; // 1GB

            return memoryUsage < memoryThreshold
                ? HealthStatus.Healthy
                : HealthStatus.Degraded;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Memory health check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private async Task<HealthStatus> CheckCpuHealth()
    {
        try
        {
            var startTime = DateTime.UtcNow;
            var startCpuUsage = Process.GetCurrentProcess().TotalProcessorTime;

            await Task.Delay(100); // Amostra de 100ms

            var endTime = DateTime.UtcNow;
            var endCpuUsage = Process.GetCurrentProcess().TotalProcessorTime;

            var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
            var totalMsPassed = (endTime - startTime).TotalMilliseconds;
            var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);

            return cpuUsageTotal < 0.8 // 80% threshold
                ? HealthStatus.Healthy
                : HealthStatus.Degraded;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CPU health check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private HealthStatus CheckDiskSpace()
    {
        try
        {
            var drive = new DriveInfo(Path.GetPathRoot(Environment.CurrentDirectory)!);
            var freeSpacePercent = (double)drive.AvailableFreeSpace / drive.TotalSize;

            return freeSpacePercent > 0.1 // 10% free space minimum
                ? HealthStatus.Healthy
                : HealthStatus.Degraded;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Disk space check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private async Task<HealthStatus> CheckExternalServices()
    {
        try
        {
            var services = _configuration.GetSection("ExternalServices")
                .Get<string[]>() ?? Array.Empty<string>();

            foreach (var service in services)
            {
                var response = await _httpClient.GetAsync(service);
                if (!response.IsSuccessStatusCode)
                {
                    return HealthStatus.Degraded;
                }
            }

            return HealthStatus.Healthy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "External services check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private HealthStatus CheckCertificates()
    {
        try
        {
            var certPath = _configuration["Security:CertificatePath"];
            if (string.IsNullOrEmpty(certPath))
                return HealthStatus.Degraded;

            var cert = new X509Certificate2(certPath);
            return cert.NotAfter > DateTime.UtcNow.AddDays(30)
                ? HealthStatus.Healthy
                : HealthStatus.Degraded;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Certificate check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private async Task<HealthStatus> CheckDatabaseConnections()
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SqlCommand(
                "SELECT COUNT(*) FROM sys.dm_exec_connections",
                connection);
            var connections = (int)await command.ExecuteScalarAsync();

            return connections < 100 // Exemplo de threshold
                ? HealthStatus.Healthy
                : HealthStatus.Degraded;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database connections check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private async Task<HealthStatus> CheckDatabaseLatency()
    {
        try
        {
            var sw = Stopwatch.StartNew();

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SqlCommand("SELECT 1", connection);
            await command.ExecuteScalarAsync();

            sw.Stop();

            return sw.ElapsedMilliseconds < 100 // 100ms threshold
                ? HealthStatus.Healthy
                : HealthStatus.Degraded;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database latency check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private async Task<HealthStatus> CheckApiEndpoints()
    {
        try
        {
            var endpoints = _configuration.GetSection("Monitoring:Endpoints")
                .Get<string[]>() ?? Array.Empty<string>();

            foreach (var endpoint in endpoints)
            {
                var response = await _httpClient.GetAsync(endpoint);
                if (!response.IsSuccessStatusCode)
                {
                    return HealthStatus.Degraded;
                }
            }

            return HealthStatus.Healthy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "API endpoints check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private async Task<HealthStatus> CheckBackgroundJobs()
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SqlCommand(
                "SELECT COUNT(*) FROM BackgroundJobs WHERE Status = 'Failed' AND CreatedAt > @cutoff",
                connection);
            command.Parameters.AddWithValue("@cutoff", DateTime.UtcNow.AddHours(-1));

            var failedJobs = (int)await command.ExecuteScalarAsync();

            return failedJobs == 0
                ? HealthStatus.Healthy
                : HealthStatus.Degraded;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Background jobs check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private async Task<HealthStatus> CheckCacheHealth()
    {
        try
        {
            // Implementar verificação do Redis ou outro cache
            await Task.CompletedTask;
            return HealthStatus.Healthy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cache health check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private async Task<HealthStatus> CheckMessageQueue()
    {
        try
        {
            // Implementar verificação do Azure Service Bus ou outro message broker
            await Task.CompletedTask;
            return HealthStatus.Healthy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Message queue check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private async Task<HealthStatus> CheckStorageAccess()
    {
        try
        {
            // Implementar verificação do Azure Storage ou outro storage
            await Task.CompletedTask;
            return HealthStatus.Healthy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Storage access check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private async Task<HealthStatus> CheckSecurityServices()
    {
        try
        {
            // Implementar verificação dos serviços de segurança
            await Task.CompletedTask;
            return HealthStatus.Healthy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Security services check failed");
            return HealthStatus.Unhealthy;
        }
    }

    private HealthStatus DetermineOverallStatus(IDictionary<string, HealthStatus> checks)
    {
        if (checks.Any(c => c.Value == HealthStatus.Unhealthy))
            return HealthStatus.Unhealthy;

        if (checks.Any(c => c.Value == HealthStatus.Degraded))
            return HealthStatus.Degraded;

        return HealthStatus.Healthy;
    }

    private string GenerateHealthDescription(IDictionary<string, HealthStatus> checks)
    {
        var unhealthy = checks.Where(c => c.Value == HealthStatus.Unhealthy)
            .Select(c => c.Key);
        var degraded = checks.Where(c => c.Value == HealthStatus.Degraded)
            .Select(c => c.Key);

        var description = new List<string>();

        if (unhealthy.Any())
            description.Add($"Unhealthy components: {string.Join(", ", unhealthy)}");
        if (degraded.Any())
            description.Add($"Degraded components: {string.Join(", ", degraded)}");

        return description.Any()
            ? string.Join(". ", description)
            : "All systems operational";
    }
} 