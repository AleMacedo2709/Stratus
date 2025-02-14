require('dotenv').config({ path: '.env.production' });
const { BackupService } = require('../dist/services/backup/BackupService');
const { LoggingService } = require('../dist/services/logging/LoggingService');
const { MonitoringService } = require('../dist/services/monitoring/MonitoringService');

async function main() {
  try {
    // Inicializa serviços
    await BackupService.initialize();
    LoggingService.initialize();
    MonitoringService.initialize();

    // Cria backup
    const backupPath = await BackupService.createDatabaseBackup();
    
    // Verifica backup
    const isValid = await BackupService.verifyBackup(backupPath);
    
    if (!isValid) {
      throw new Error('Backup verification failed');
    }

    // Limpa backups antigos
    await BackupService.cleanOldBackups();

    // Notifica sucesso
    await BackupService.notifyBackupStatus(true, {
      path: backupPath,
      size: require('fs').statSync(backupPath).size,
      timestamp: new Date().toISOString()
    });

    process.exit(0);
  } catch (error) {
    // Notifica erro
    await BackupService.notifyBackupStatus(false, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    process.exit(1);
  }
}

main(); 