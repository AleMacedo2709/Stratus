using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Quartz;
using Quartz.Spi;

namespace PlanMP.API.Infrastructure.BackgroundJobs;

public class BackgroundJobService : IHostedService
{
    private readonly ISchedulerFactory _schedulerFactory;
    private readonly IJobFactory _jobFactory;
    private readonly ILogger<BackgroundJobService> _logger;
    private IScheduler? _scheduler;

    public BackgroundJobService(
        ISchedulerFactory schedulerFactory,
        IJobFactory jobFactory,
        ILogger<BackgroundJobService> logger)
    {
        _schedulerFactory = schedulerFactory;
        _jobFactory = jobFactory;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            _scheduler = await _schedulerFactory.GetScheduler(cancellationToken);
            _scheduler.JobFactory = _jobFactory;

            // Configura jobs
            await ConfigureJobs(_scheduler, cancellationToken);

            await _scheduler.Start(cancellationToken);
            _logger.LogInformation("Background job service started successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting background job service");
            throw;
        }
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_scheduler != null)
        {
            await _scheduler.Shutdown(cancellationToken);
            _logger.LogInformation("Background job service stopped successfully");
        }
    }

    private async Task ConfigureJobs(IScheduler scheduler, CancellationToken cancellationToken)
    {
        // Backup automático diário
        await ScheduleBackupJob(scheduler, cancellationToken);

        // Limpeza de logs antigos
        await ScheduleLogCleanupJob(scheduler, cancellationToken);

        // Atualização de métricas
        await ScheduleMetricsUpdateJob(scheduler, cancellationToken);

        // Notificações
        await ScheduleNotificationJob(scheduler, cancellationToken);

        // Monitoramento de saúde
        await ScheduleHealthCheckJob(scheduler, cancellationToken);
    }

    private async Task ScheduleBackupJob(IScheduler scheduler, CancellationToken cancellationToken)
    {
        var job = JobBuilder.Create<DatabaseBackupJob>()
            .WithIdentity("DatabaseBackupJob", "maintenance")
            .Build();

        var trigger = TriggerBuilder.Create()
            .WithIdentity("DatabaseBackupTrigger", "maintenance")
            .WithSchedule(CronScheduleBuilder
                .DailyAtHourAndMinute(1, 0) // 1:00 AM
                .InTimeZone(TimeZoneInfo.Local))
            .Build();

        await scheduler.ScheduleJob(job, trigger, cancellationToken);
        _logger.LogInformation("Database backup job scheduled");
    }

    private async Task ScheduleLogCleanupJob(IScheduler scheduler, CancellationToken cancellationToken)
    {
        var job = JobBuilder.Create<LogCleanupJob>()
            .WithIdentity("LogCleanupJob", "maintenance")
            .Build();

        var trigger = TriggerBuilder.Create()
            .WithIdentity("LogCleanupTrigger", "maintenance")
            .WithSchedule(CronScheduleBuilder
                .WeeklyOnDayAndHourAndMinute(DayOfWeek.Sunday, 2, 0) // Sunday 2:00 AM
                .InTimeZone(TimeZoneInfo.Local))
            .Build();

        await scheduler.ScheduleJob(job, trigger, cancellationToken);
        _logger.LogInformation("Log cleanup job scheduled");
    }

    private async Task ScheduleMetricsUpdateJob(IScheduler scheduler, CancellationToken cancellationToken)
    {
        var job = JobBuilder.Create<MetricsUpdateJob>()
            .WithIdentity("MetricsUpdateJob", "monitoring")
            .Build();

        var trigger = TriggerBuilder.Create()
            .WithIdentity("MetricsUpdateTrigger", "monitoring")
            .WithSchedule(CronScheduleBuilder
                .CronSchedule("0 */15 * * * ?") // Every 15 minutes
                .InTimeZone(TimeZoneInfo.Local))
            .Build();

        await scheduler.ScheduleJob(job, trigger, cancellationToken);
        _logger.LogInformation("Metrics update job scheduled");
    }

    private async Task ScheduleNotificationJob(IScheduler scheduler, CancellationToken cancellationToken)
    {
        var job = JobBuilder.Create<NotificationJob>()
            .WithIdentity("NotificationJob", "notifications")
            .Build();

        var trigger = TriggerBuilder.Create()
            .WithIdentity("NotificationTrigger", "notifications")
            .WithSchedule(CronScheduleBuilder
                .CronSchedule("0 */5 * * * ?") // Every 5 minutes
                .InTimeZone(TimeZoneInfo.Local))
            .Build();

        await scheduler.ScheduleJob(job, trigger, cancellationToken);
        _logger.LogInformation("Notification job scheduled");
    }

    private async Task ScheduleHealthCheckJob(IScheduler scheduler, CancellationToken cancellationToken)
    {
        var job = JobBuilder.Create<HealthCheckJob>()
            .WithIdentity("HealthCheckJob", "monitoring")
            .Build();

        var trigger = TriggerBuilder.Create()
            .WithIdentity("HealthCheckTrigger", "monitoring")
            .WithSchedule(CronScheduleBuilder
                .CronSchedule("0 */10 * * * ?") // Every 10 minutes
                .InTimeZone(TimeZoneInfo.Local))
            .Build();

        await scheduler.ScheduleJob(job, trigger, cancellationToken);
        _logger.LogInformation("Health check job scheduled");
    }
}

// Job Factory para injeção de dependência
public class JobFactory : IJobFactory
{
    private readonly IServiceProvider _serviceProvider;

    public JobFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IJob NewJob(TriggerFiredBundle bundle, IScheduler scheduler)
    {
        var jobType = bundle.JobDetail.JobType;
        var job = _serviceProvider.GetRequiredService(jobType) as IJob;
        return job!;
    }

    public void ReturnJob(IJob job)
    {
        var disposable = job as IDisposable;
        disposable?.Dispose();
    }
}

// Jobs específicos
public class DatabaseBackupJob : IJob
{
    private readonly IBackupService _backupService;
    private readonly ILogger<DatabaseBackupJob> _logger;

    public DatabaseBackupJob(IBackupService backupService, ILogger<DatabaseBackupJob> logger)
    {
        _backupService = backupService;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            await _backupService.CreateBackup();
            await _backupService.PurgeOldBackups(30); // Mantém backups por 30 dias
            _logger.LogInformation("Database backup completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing database backup job");
            throw;
        }
    }
}

public class LogCleanupJob : IJob
{
    private readonly ILogger<LogCleanupJob> _logger;
    private readonly string _logPath;
    private readonly int _retentionDays;

    public LogCleanupJob(IConfiguration configuration, ILogger<LogCleanupJob> logger)
    {
        _logger = logger;
        _logPath = configuration["Logging:FilePath"] ?? "logs";
        _retentionDays = int.Parse(configuration["Logging:RetentionDays"] ?? "30");
    }

    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-_retentionDays);
            var oldLogs = Directory.GetFiles(_logPath, "*.log")
                .Select(f => new FileInfo(f))
                .Where(f => f.CreationTimeUtc < cutoffDate);

            foreach (var log in oldLogs)
            {
                log.Delete();
                _logger.LogInformation("Deleted old log file: {FileName}", log.Name);
            }

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing log cleanup job");
            throw;
        }
    }
}

public class MetricsUpdateJob : IJob
{
    private readonly ILogger<MetricsUpdateJob> _logger;
    private readonly IApplicationDbContext _context;

    public MetricsUpdateJob(IApplicationDbContext context, ILogger<MetricsUpdateJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            // Atualiza métricas do sistema
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdateSystemMetrics");
            _logger.LogInformation("System metrics updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing metrics update job");
            throw;
        }
    }
}

public class NotificationJob : IJob
{
    private readonly ILogger<NotificationJob> _logger;
    private readonly INotificationService _notificationService;

    public NotificationJob(INotificationService notificationService, ILogger<NotificationJob> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            await _notificationService.ProcessPendingNotifications();
            _logger.LogInformation("Notifications processed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing notification job");
            throw;
        }
    }
}

public class HealthCheckJob : IJob
{
    private readonly ILogger<HealthCheckJob> _logger;
    private readonly IHealthCheckService _healthCheckService;

    public HealthCheckJob(IHealthCheckService healthCheckService, ILogger<HealthCheckJob> logger)
    {
        _healthCheckService = healthCheckService;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            var result = await _healthCheckService.CheckSystemHealth();
            if (!result.IsHealthy)
            {
                _logger.LogWarning("System health check failed: {Reason}", result.Message);
            }
            else
            {
                _logger.LogInformation("System health check passed");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing health check job");
            throw;
        }
    }
} 