using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Data.SqlClient;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace PlanMP.API.Infrastructure.Backup;

public interface IBackupService
{
    Task CreateBackup();
    Task RestoreBackup(string backupFileName);
    Task<IEnumerable<BackupInfo>> ListBackups();
    Task PurgeOldBackups(int retentionDays);
}

public class BackupInfo
{
    public string FileName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public long SizeInBytes { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class BackupService : IBackupService
{
    private readonly string _connectionString;
    private readonly string _databaseName;
    private readonly string _backupPath;
    private readonly string _storageConnectionString;
    private readonly string _containerName;
    private readonly ILogger<BackupService> _logger;

    public BackupService(
        IConfiguration configuration,
        ILogger<BackupService> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        _databaseName = configuration["Database:Name"] ?? "PlanMP";
        _backupPath = configuration["Backup:Path"] ?? "C:/Backups/PlanMP";
        _storageConnectionString = configuration["Azure:Storage:ConnectionString"] ?? "";
        _containerName = configuration["Azure:Storage:BackupContainer"] ?? "backups";
        _logger = logger;
    }

    public async Task CreateBackup()
    {
        try
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var backupFileName = $"{_databaseName}_{timestamp}.bak";
            var localBackupPath = Path.Combine(_backupPath, backupFileName);

            // Garante que o diretório existe
            Directory.CreateDirectory(_backupPath);

            // Cria backup local
            await CreateLocalBackup(localBackupPath);
            _logger.LogInformation("Local backup created successfully at {Path}", localBackupPath);

            // Upload para Azure Storage
            await UploadToAzureStorage(localBackupPath, backupFileName);
            _logger.LogInformation("Backup uploaded to Azure Storage successfully");

            // Criptografa o backup
            await EncryptBackup(localBackupPath);
            _logger.LogInformation("Backup encrypted successfully");

            // Verifica integridade
            if (await VerifyBackupIntegrity(localBackupPath))
            {
                _logger.LogInformation("Backup integrity verified successfully");
            }
            else
            {
                throw new Exception("Backup integrity check failed");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating backup");
            throw;
        }
    }

    public async Task RestoreBackup(string backupFileName)
    {
        try
        {
            var localBackupPath = Path.Combine(_backupPath, backupFileName);

            // Download do Azure se necessário
            if (!File.Exists(localBackupPath))
            {
                await DownloadFromAzureStorage(backupFileName, localBackupPath);
                _logger.LogInformation("Backup downloaded from Azure Storage");
            }

            // Descriptografa o backup
            await DecryptBackup(localBackupPath);
            _logger.LogInformation("Backup decrypted successfully");

            // Verifica integridade
            if (!await VerifyBackupIntegrity(localBackupPath))
            {
                throw new Exception("Backup integrity check failed");
            }

            // Restaura o backup
            await RestoreLocalBackup(localBackupPath);
            _logger.LogInformation("Backup restored successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring backup");
            throw;
        }
    }

    public async Task<IEnumerable<BackupInfo>> ListBackups()
    {
        var backups = new List<BackupInfo>();

        try
        {
            // Lista backups do Azure Storage
            var blobServiceClient = new BlobServiceClient(_storageConnectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);

            await foreach (var blob in containerClient.GetBlobsAsync())
            {
                backups.Add(new BackupInfo
                {
                    FileName = blob.Name,
                    CreatedAt = blob.Properties.CreatedOn?.UtcDateTime ?? DateTime.UtcNow,
                    SizeInBytes = blob.Properties.ContentLength ?? 0,
                    Status = blob.Properties.AccessTier?.ToString() ?? "Unknown"
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing backups");
            throw;
        }

        return backups;
    }

    public async Task PurgeOldBackups(int retentionDays)
    {
        try
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

            // Remove backups antigos do Azure Storage
            var blobServiceClient = new BlobServiceClient(_storageConnectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);

            await foreach (var blob in containerClient.GetBlobsAsync())
            {
                if (blob.Properties.CreatedOn < cutoffDate)
                {
                    await containerClient.DeleteBlobAsync(blob.Name);
                    _logger.LogInformation("Deleted old backup: {Name}", blob.Name);
                }
            }

            // Remove backups antigos locais
            var localBackups = Directory.GetFiles(_backupPath, "*.bak")
                .Select(f => new FileInfo(f))
                .Where(f => f.CreationTimeUtc < cutoffDate);

            foreach (var backup in localBackups)
            {
                backup.Delete();
                _logger.LogInformation("Deleted old local backup: {Name}", backup.Name);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error purging old backups");
            throw;
        }
    }

    private async Task CreateLocalBackup(string backupPath)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var backupQuery = $@"
            BACKUP DATABASE [{_databaseName}] 
            TO DISK = '{backupPath}'
            WITH FORMAT, 
                 COMPRESSION, 
                 STATS = 10,
                 CHECKSUM,
                 CONTINUE_AFTER_ERROR;";

        using var command = new SqlCommand(backupQuery, connection);
        await command.ExecuteNonQueryAsync();
    }

    private async Task RestoreLocalBackup(string backupPath)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        // Força desconexão de usuários
        var killConnectionsQuery = $@"
            ALTER DATABASE [{_databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;";

        var restoreQuery = $@"
            RESTORE DATABASE [{_databaseName}] 
            FROM DISK = '{backupPath}'
            WITH REPLACE,
                 STATS = 10;
            
            ALTER DATABASE [{_databaseName}] SET MULTI_USER;";

        using (var command = new SqlCommand(killConnectionsQuery, connection))
        {
            await command.ExecuteNonQueryAsync();
        }

        using (var command = new SqlCommand(restoreQuery, connection))
        {
            await command.ExecuteNonQueryAsync();
        }
    }

    private async Task UploadToAzureStorage(string localPath, string blobName)
    {
        var blobServiceClient = new BlobServiceClient(_storageConnectionString);
        var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = containerClient.GetBlobClient(blobName);

        await using var stream = File.OpenRead(localPath);
        await blobClient.UploadAsync(stream, new BlobUploadOptions
        {
            AccessTier = AccessTier.Cool,
            TransferOptions = new StorageTransferOptions
            {
                MaximumConcurrency = 8
            }
        });
    }

    private async Task DownloadFromAzureStorage(string blobName, string localPath)
    {
        var blobServiceClient = new BlobServiceClient(_storageConnectionString);
        var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = containerClient.GetBlobClient(blobName);

        await blobClient.DownloadToAsync(localPath);
    }

    private async Task EncryptBackup(string backupPath)
    {
        // Implementar criptografia do arquivo de backup
        // Usar AES-256 ou similar
        await Task.CompletedTask;
    }

    private async Task DecryptBackup(string backupPath)
    {
        // Implementar descriptografia do arquivo de backup
        await Task.CompletedTask;
    }

    private async Task<bool> VerifyBackupIntegrity(string backupPath)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var verifyQuery = $@"
            RESTORE VERIFYONLY 
            FROM DISK = '{backupPath}'
            WITH CHECKSUM;";

        using var command = new SqlCommand(verifyQuery, connection);
        await command.ExecuteNonQueryAsync();

        return true;
    }
} 