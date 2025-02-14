import { EnvironmentConfig } from '../environment';

export const stagingConfig: EnvironmentConfig = {
  name: 'staging',
  isProduction: false,
  apiUrl: process.env.STAGING_API_URL || 'https://staging-api.planmp.org.br',
  useMockData: false,
  database: {
    host: process.env.STAGING_DB_HOST || 'staging-db.planmp.org.br',
    port: Number(process.env.STAGING_DB_PORT) || 1433,
    name: process.env.STAGING_DB_NAME || 'strategic_planning_staging',
    user: process.env.STAGING_DB_USER || 'app_user',
    password: '',
    enableSsl: true
  },
  monitoring: {
    logLevel: 'info',
    enableDetailedLogs: true,
    sentryDsn: process.env.STAGING_SENTRY_DSN,
    metricsEnabled: true,
    metricsInterval: 30000,
    metricsRetention: 90,
    alertsEnabled: true,
    alertChannels: ['email', 'teams'],
    alertThresholds: {
      errorRate: 5,
      responseTime: 10000,
      cpuUsage: 90,
      memoryUsage: 90
    },
    auditEnabled: true,
    auditRetention: 180
  },
  security: {
    enableSsl: true,
    corsOrigins: [
      'https://staging.planmp.org.br',
      'https://staging-admin.planmp.org.br'
    ],
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 200
    },
    auth: {
      provider: 'azure-ad',
      tenantId: process.env.STAGING_AZURE_TENANT_ID,
      clientId: process.env.STAGING_AZURE_CLIENT_ID,
      clientSecret: process.env.STAGING_AZURE_CLIENT_SECRET,
      redirectUri: process.env.STAGING_REDIRECT_URI || 'https://staging.planmp.org.br/auth/callback'
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
      url: process.env.STAGING_SIAFI_URL || 'https://siafi-homologacao.tesouro.gov.br',
      token: process.env.STAGING_SIAFI_TOKEN
    },
    sei: {
      enabled: true,
      url: process.env.STAGING_SEI_URL || 'https://sei-homologacao.planmp.org.br',
      token: process.env.STAGING_SEI_TOKEN
    },
    transparencyPortal: {
      enabled: true,
      url: process.env.STAGING_TRANSPARENCY_URL || 'https://transparencia-homologacao.planmp.org.br',
      token: process.env.STAGING_TRANSPARENCY_TOKEN
    }
  }
}; 