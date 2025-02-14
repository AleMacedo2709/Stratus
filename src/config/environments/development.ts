import { EnvironmentConfig } from '../environment';

export const developmentConfig: EnvironmentConfig = {
  name: 'development',
  isProduction: false,
  apiUrl: process.env.DEV_API_URL || 'http://localhost:3000/api',
  useMockData: process.env.USE_MOCK_DATA === 'true' || true,
  database: {
    host: process.env.DEV_DB_HOST || 'localhost',
    port: Number(process.env.DEV_DB_PORT) || 1433,
    name: process.env.DEV_DB_NAME || 'strategic_planning_dev',
    user: process.env.DEV_DB_USER || 'sa',
    password: process.env.DEV_DB_PASSWORD || 'Dev123!@#',
    enableSsl: false
  },
  monitoring: {
    logLevel: 'debug',
    enableDetailedLogs: true,
    sentryDsn: process.env.DEV_SENTRY_DSN,
    metricsEnabled: true,
    metricsInterval: 15000,
    metricsRetention: 30,
    alertsEnabled: true,
    alertChannels: ['console', 'email'],
    alertThresholds: {
      errorRate: 10,
      responseTime: 15000,
      cpuUsage: 95,
      memoryUsage: 95
    },
    auditEnabled: true,
    auditRetention: 90
  },
  security: {
    enableSsl: false,
    corsOrigins: [
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 1000
    },
    auth: {
      provider: 'none',
      tenantId: undefined,
      clientId: undefined,
      clientSecret: undefined,
      redirectUri: undefined
    }
  },
  features: {
    enableCache: true,
    enableRealTimeUpdates: true,
    enableDataExport: true,
    enableAdvancedAnalytics: true,
    enableAuditLog: true,
    enableUserActivity: true,
    enableDebugTools: true,
    enableMockServices: true,
    enableAzureAD: false
  },
  integrations: {
    siafi: {
      enabled: process.env.ENABLE_SIAFI === 'true' || false,
      url: process.env.DEV_SIAFI_URL || 'http://localhost:3002/siafi',
      token: process.env.DEV_SIAFI_TOKEN || 'dev-token'
    },
    sei: {
      enabled: process.env.ENABLE_SEI === 'true' || false,
      url: process.env.DEV_SEI_URL || 'http://localhost:3003/sei',
      token: process.env.DEV_SEI_TOKEN || 'dev-token'
    },
    transparencyPortal: {
      enabled: process.env.ENABLE_TRANSPARENCY === 'true' || false,
      url: process.env.DEV_TRANSPARENCY_URL || 'http://localhost:3004/transparency',
      token: process.env.DEV_TRANSPARENCY_TOKEN || 'dev-token'
    }
  },
  mockData: {
    delay: Number(process.env.MOCK_DELAY) || 500,
    errorRate: Number(process.env.MOCK_ERROR_RATE) || 0.1,
    dataPath: process.env.MOCK_DATA_PATH || './src/data/mock'
  }
}; 