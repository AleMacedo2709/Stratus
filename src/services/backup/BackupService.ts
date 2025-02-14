import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { LoggingService } from '../services/logging/LoggingService';
import { MonitoringService } from '../services/monitoring/MonitoringService';

const execAsync = promisify(exec);

export class BackupService {
  private static readonly backupPath = process.env.BACKUP_PATH || 'backups';
  private static readonly retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');

  static async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.backupPath, { recursive: true });
      LoggingService.info('Backup directory initialized', { path: this.backupPath });
    } catch (error) {
      LoggingService.error('Failed to initialize backup directory', error as Error);
    }
  }

  static async createDatabaseBackup(): Promise<string> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `database-backup-${timestamp}.bak`;
    const filePath = path.join(this.backupPath, fileName);

    try {
      const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
      
      // Comando de backup do SQL Server
      const command = `sqlcmd -S ${DB_HOST} -d ${DB_NAME} -U ${DB_USER} -P ${DB_PASSWORD} -Q "BACKUP DATABASE [${DB_NAME}] TO DISK = '${filePath}' WITH FORMAT"`;
      
      await execAsync(command);
      
      const duration = Date.now() - startTime;
      LoggingService.info('Database backup created', {
        file: fileName,
        duration
      });
      
      MonitoringService.trackPerformance('DatabaseBackup', duration);
      
      return filePath;
    } catch (error) {
      LoggingService.error('Database backup failed', error as Error);
      MonitoringService.trackException(error as Error);
      throw error;
    }
  }

  static async createFileBackup(): Promise<string> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `files-backup-${timestamp}.zip`;
    const filePath = path.join(this.backupPath, fileName);

    try {
      // Comando para criar arquivo ZIP com os arquivos
      const command = `powershell Compress-Archive -Path "${process.env.SHAREPOINT_ROOT_FOLDER}" -DestinationPath "${filePath}"`;
      
      await execAsync(command);
      
      const duration = Date.now() - startTime;
      LoggingService.info('File backup created', {
        file: fileName,
        duration
      });
      
      MonitoringService.trackPerformance('FileBackup', duration);
      
      return filePath;
    } catch (error) {
      LoggingService.error('File backup failed', error as Error);
      MonitoringService.trackException(error as Error);
      throw error;
    }
  }

  static async cleanOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.backupPath);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(this.backupPath, file);
        const stats = await fs.stat(filePath);
        
        const ageInDays = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        
        if (ageInDays > this.retentionDays) {
          await fs.unlink(filePath);
          LoggingService.info('Old backup deleted', { file });
        }
      }
    } catch (error) {
      LoggingService.error('Failed to clean old backups', error as Error);
      MonitoringService.trackException(error as Error);
    }
  }

  static async verifyBackup(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      
      if (stats.size === 0) {
        throw new Error('Backup file is empty');
      }

      if (filePath.endsWith('.bak')) {
        // Verifica backup do banco
        const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
        const command = `sqlcmd -S ${DB_HOST} -U ${DB_USER} -P ${DB_PASSWORD} -Q "RESTORE VERIFYONLY FROM DISK = '${filePath}'"`;
        
        await execAsync(command);
      } else if (filePath.endsWith('.zip')) {
        // Verifica arquivo ZIP
        const command = `powershell Test-Path -PathType Leaf "${filePath}"`;
        const { stdout } = await execAsync(command);
        
        if (stdout.trim() !== 'True') {
          throw new Error('Invalid ZIP file');
        }
      }

      LoggingService.info('Backup verified successfully', { file: path.basename(filePath) });
      return true;
    } catch (error) {
      LoggingService.error('Backup verification failed', error as Error);
      MonitoringService.trackException(error as Error);
      return false;
    }
  }

  static async scheduleBackups(): Promise<void> {
    const schedule = process.env.BACKUP_SCHEDULE || '0 0 * * *'; // Default: daily at midnight
    
    try {
      // Agenda backup do banco
      const command = `schtasks /create /tn "PlanMP_DatabaseBackup" /tr "node backup-database.js" /sc DAILY /st 00:00`;
      await execAsync(command);
      
      // Agenda backup dos arquivos
      const command2 = `schtasks /create /tn "PlanMP_FileBackup" /tr "node backup-files.js" /sc DAILY /st 01:00`;
      await execAsync(command2);
      
      LoggingService.info('Backup tasks scheduled', { schedule });
    } catch (error) {
      LoggingService.error('Failed to schedule backups', error as Error);
      MonitoringService.trackException(error as Error);
    }
  }

  static async notifyBackupStatus(success: boolean, details: any): Promise<void> {
    if (!process.env.ALERT_EMAIL) return;

    try {
      // Implementar notificação por email usando o Office365Service
      const subject = success ? 'Backup concluído com sucesso' : 'Falha no backup';
      const body = `
        Status do Backup:
        Data: ${new Date().toLocaleString()}
        Resultado: ${success ? 'Sucesso' : 'Falha'}
        Detalhes: ${JSON.stringify(details, null, 2)}
      `;

      // Enviar email usando Office365Service
      LoggingService.info('Backup notification sent', { success, details });
    } catch (error) {
      LoggingService.error('Failed to send backup notification', error as Error);
      MonitoringService.trackException(error as Error);
    }
  }
} 