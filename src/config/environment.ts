import { developmentConfig } from './environments/development';
import { stagingConfig } from './environments/staging';
import { productionConfig } from './environments/production';

export interface EnvironmentConfig {
  name: 'development' | 'staging' | 'production';
  isProduction: boolean;
  apiUrl: string;
  useMockData: boolean;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    enableSsl: boolean;
  };
  monitoring: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableDetailedLogs: boolean;
    sentryDsn?: string;
    metricsEnabled: boolean;
    metricsInterval: number;
    metricsRetention: number;
    alertsEnabled: boolean;
    alertChannels: string[];
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      cpuUsage: number;
      memoryUsage: number;
    };
    auditEnabled: boolean;
    auditRetention: number;
  };
  security: {
    enableSsl: boolean;
    corsOrigins: string[];
    rateLimit: {
      windowMs: number;
      max: number;
    };
    auth: {
      provider: 'azure-ad';
      tenantId?: string;
      clientId?: string;
      clientSecret?: string;
      redirectUri?: string;
    };
  };
  features: {
    enableCache: boolean;
    enableRealTimeUpdates: boolean;
    enableDataExport: boolean;
    enableAdvancedAnalytics: boolean;
    enableAuditLog: boolean;
    enableUserActivity: boolean;
    enableDebugTools?: boolean;
    enableMockServices?: boolean;
  };
  integrations: {
    siafi: {
      enabled: boolean;
      url?: string;
      token?: string;
    };
    sei: {
      enabled: boolean;
      url?: string;
      token?: string;
    };
    transparencyPortal: {
      enabled: boolean;
      url?: string;
      token?: string;
    };
  };
  mockData?: {
    delay: number;
    errorRate: number;
    dataPath: string;
  };
}

// Carrega as variáveis de ambiente uma única vez
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_PASSWORD = process.env.DB_PASSWORD;
const SENTRY_DSN = process.env.SENTRY_DSN;

// Seleciona a configuração baseada no ambiente
export const environment: EnvironmentConfig = (() => {
  const config = (() => {
    switch (NODE_ENV) {
      case 'production':
        return productionConfig;
      case 'staging':
        return stagingConfig;
      default:
        return developmentConfig;
    }
  })();

  // Injeta as variáveis de ambiente sensíveis
  return {
    ...config,
    database: {
      ...config.database,
      password: DB_PASSWORD || config.database.password
    },
    monitoring: {
      ...config.monitoring,
      sentryDsn: SENTRY_DSN || config.monitoring.sentryDsn
    }
  };
})(); 