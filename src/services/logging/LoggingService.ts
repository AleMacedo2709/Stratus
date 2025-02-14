import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { MonitoringService } from '../monitoring/MonitoringService';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogContext {
  userId?: string;
  action?: string;
  resource?: string;
  traceId?: string;
  [key: string]: any;
}

export class LoggingService {
  private static instance: winston.Logger;

  static initialize(): void {
    const logDir = process.env.LOG_FILE_PATH || 'logs';
    const logLevel = process.env.LOG_LEVEL || 'info';
    const logFormat = process.env.LOG_FORMAT || 'json';

    const formats = [
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      logFormat === 'json' 
        ? winston.format.json()
        : winston.format.simple()
    ];

    const transport = new DailyRotateFile({
      dirname: logDir,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(...formats)
    });

    this.instance = winston.createLogger({
      level: logLevel,
      transports: [
        transport,
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // Integração com Application Insights
    if (process.env.ENABLE_PERFORMANCE_MONITORING === 'true') {
      this.instance.on('data', (log) => {
        if (log.level === 'error') {
          MonitoringService.trackException(new Error(log.message), log.context);
        } else {
          MonitoringService.trackTrace(log.message, log.context);
        }
      });
    }
  }

  private static formatMessage(message: string, context?: LogContext): any {
    return {
      message,
      timestamp: new Date().toISOString(),
      ...context
    };
  }

  static error(message: string, error?: Error, context?: LogContext): void {
    const logContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    this.instance.error(this.formatMessage(message, logContext));
  }

  static warn(message: string, context?: LogContext): void {
    this.instance.warn(this.formatMessage(message, context));
  }

  static info(message: string, context?: LogContext): void {
    this.instance.info(this.formatMessage(message, context));
  }

  static debug(message: string, context?: LogContext): void {
    this.instance.debug(this.formatMessage(message, context));
  }

  static auditLog(action: string, userId: string, resource: string, details: any): void {
    if (process.env.ENABLE_AUDIT_LOGS !== 'true') return;

    const context: LogContext = {
      type: 'AUDIT',
      userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString()
    };

    this.info('Audit Log', context);
  }

  static apiLog(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    const context: LogContext = {
      type: 'API',
      method,
      path,
      statusCode,
      duration,
      userId
    };

    this.info('API Request', context);
    
    // Integração com monitoramento de performance
    MonitoringService.trackApiCall(
      `${method} ${path}`,
      duration,
      statusCode < 400,
      context
    );
  }

  static performanceLog(
    operation: string,
    duration: number,
    success: boolean,
    details?: any
  ): void {
    const context: LogContext = {
      type: 'PERFORMANCE',
      operation,
      duration,
      success,
      details
    };

    this.info('Performance Metric', context);
    MonitoringService.trackPerformance(operation, duration);
  }
} 