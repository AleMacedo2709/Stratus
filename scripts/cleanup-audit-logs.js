require('dotenv').config({ path: '.env.production' });
const { AuditService } = require('../dist/services/security/AuditService');
const { LoggingService } = require('../dist/services/logging/LoggingService');
const { MonitoringService } = require('../dist/services/monitoring/MonitoringService');

async function main() {
  try {
    // Inicializa serviços
    LoggingService.initialize();
    MonitoringService.initialize();

    // Obtém configuração de retenção
    const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90');

    // Executa limpeza
    const deletedCount = await AuditService.cleanOldAuditLogs(retentionDays);

    // Log do resultado
    LoggingService.info('Audit logs cleanup completed', {
      deletedCount,
      retentionDays,
      timestamp: new Date().toISOString()
    });

    process.exit(0);
  } catch (error) {
    LoggingService.error('Audit logs cleanup failed', error);
    MonitoringService.trackException(error);
    process.exit(1);
  }
}

main();