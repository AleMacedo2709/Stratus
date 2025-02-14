import { PrismaClient } from '@prisma/client';
import { LoggingService } from '../logging/LoggingService';
import { MonitoringService } from '../monitoring/MonitoringService';

export class AuditService {
  private static prisma = new PrismaClient();

  static async logAccess(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any>
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          details: JSON.stringify(details),
          ipAddress: details.ipAddress || 'unknown',
          userAgent: details.userAgent || 'unknown',
          timestamp: new Date(),
        },
      });

      MonitoringService.trackMetric('audit.log.success', 1);
      MonitoringService.trackDependency(
        'Database',
        'Create',
        'AuditLog',
        performance.now() - startTime,
        true
      );
    } catch (error) {
      LoggingService.error('Failed to create audit log', error as Error);
      MonitoringService.trackMetric('audit.log.failure', 1);
      MonitoringService.trackException(error as Error);
    }
  }

  static async searchAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    pageSize: number = 50
  ) {
    const startTime = performance.now();

    try {
      const where: any = {};
      if (filters.userId) where.userId = filters.userId;
      if (filters.action) where.action = filters.action;
      if (filters.resource) where.resource = filters.resource;
      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = filters.startDate;
        if (filters.endDate) where.timestamp.lte = filters.endDate;
      }

      const [total, logs] = await Promise.all([
        this.prisma.auditLog.count({ where }),
        this.prisma.auditLog.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { timestamp: 'desc' },
        }),
      ]);

      MonitoringService.trackMetric('audit.search.success', 1);
      MonitoringService.trackDependency(
        'Database',
        'Search',
        'AuditLog',
        performance.now() - startTime,
        true
      );

      return {
        data: logs,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      LoggingService.error('Failed to search audit logs', error as Error);
      MonitoringService.trackMetric('audit.search.failure', 1);
      MonitoringService.trackException(error as Error);
      throw error;
    }
  }

  static async getAuditSummary(
    startDate: Date,
    endDate: Date
  ) {
    const startTime = performance.now();

    try {
      const summary = await this.prisma.auditLog.groupBy({
        by: ['action', 'resource'],
        _count: true,
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      MonitoringService.trackMetric('audit.summary.success', 1);
      MonitoringService.trackDependency(
        'Database',
        'Summary',
        'AuditLog',
        performance.now() - startTime,
        true
      );

      return summary;
    } catch (error) {
      LoggingService.error('Failed to get audit summary', error as Error);
      MonitoringService.trackMetric('audit.summary.failure', 1);
      MonitoringService.trackException(error as Error);
      throw error;
    }
  }

  static async cleanOldAuditLogs(retentionDays: number): Promise<number> {
    const startTime = performance.now();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { count } = await this.prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      MonitoringService.trackMetric('audit.cleanup.success', 1);
      MonitoringService.trackDependency(
        'Database',
        'Delete',
        'AuditLog',
        performance.now() - startTime,
        true
      );

      return count;
    } catch (error) {
      LoggingService.error('Failed to clean old audit logs', error as Error);
      MonitoringService.trackMetric('audit.cleanup.failure', 1);
      MonitoringService.trackException(error as Error);
      throw error;
    }
  }
} 