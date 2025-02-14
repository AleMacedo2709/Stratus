import { EnvironmentConfig } from '../environment';

export const productionConfig: EnvironmentConfig = {
  name: 'production',
  isProduction: true,
  apiUrl: process.env.API_URL || 'https://api.planmp.org.br',
  useMockData: false,
  database: {
    host: process.env.DB_HOST || 'db.planmp.org.br',
    port: Number(process.env.DB_PORT) || 1433,
    name: process.env.DB_NAME || 'strategic_planning',
    user: process.env.DB_USER || 'app_user',
    password: '',
    enableSsl: true
  },
  monitoring: {
    logLevel: 'warn',
    enableDetailedLogs: false,
    sentryDsn: process.env.SENTRY_DSN,
    metricsEnabled: true,
    metricsInterval: 60000,
    metricsRetention: 365,
    alertsEnabled: true,
    alertChannels: ['email', 'sms', 'teams'],
    alertThresholds: {
      errorRate: 1,
      responseTime: 5000,
      cpuUsage: 80,
      memoryUsage: 80
    },
    auditEnabled: true,
    auditRetention: 730
  },
  security: {
    enableSsl: true,
    corsOrigins: [
      'https://planmp.org.br',
      'https://admin.planmp.org.br'
    ],
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    },
    auth: {
      provider: 'azure-ad',
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI || 'https://planmp.org.br/auth/callback'
    }
  },
  features: {
    enableCache: true,
    enableRealTimeUpdates: true,
    enableDataExport: true,
    enableAdvancedAnalytics: true,
    enableAuditLog: true,
    enableUserActivity: true
  },
  integrations: {
    siafi: {
      enabled: true,
      url: process.env.SIAFI_URL,
      token: process.env.SIAFI_TOKEN
    },
    sei: {
      enabled: true,
      url: process.env.SEI_URL,
      token: process.env.SEI_TOKEN
    },
    transparencyPortal: {
      enabled: true,
      url: process.env.TRANSPARENCY_URL,
      token: process.env.TRANSPARENCY_TOKEN
    }
  }
}; 