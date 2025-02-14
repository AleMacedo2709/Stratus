import { environment } from '@/config/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private enableDetailedLogs: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.enableDetailedLogs = process.env.NODE_ENV !== 'production';
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, error?: Error, data?: any): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(error ? { error: { message: error.message, stack: error.stack } } : {}),
      ...(this.enableDetailedLogs && data ? { data } : {})
    };
  }

  private log(level: LogLevel, message: string, error?: Error, data?: any) {
    if (!this.shouldLog(level)) return;

    const logMessage = this.formatMessage(level, message, error, data);

    switch (level) {
      case 'debug':
        console.debug(JSON.stringify(logMessage));
        break;
      case 'info':
        console.info(JSON.stringify(logMessage));
        break;
      case 'warn':
        console.warn(JSON.stringify(logMessage));
        break;
      case 'error':
        console.error(JSON.stringify(logMessage));
        break;
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, undefined, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, undefined, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, undefined, data);
  }

  error(message: string, errorOrData?: Error | any, data?: any) {
    if (errorOrData instanceof Error) {
      this.log('error', message, errorOrData, data);
    } else {
      this.log('error', message, undefined, errorOrData);
    }
  }
}

export const logger = new Logger(); 