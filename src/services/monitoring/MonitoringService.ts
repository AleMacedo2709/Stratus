import { logger } from './logger';
import { DatabaseService } from '../database/DatabaseService';
import { environment } from '@/config/environment';
import { 
  AuditEntry, 
  MonitoringMetric, 
  SystemHealth, 
  MonitoringAlert,
  MonitoringConfig,
  PerformanceMetrics 
} from './types';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

const browserHistory = createBrowserHistory();
const reactPlugin = new ReactPlugin();

export class MonitoringService {
  private static instance: ApplicationInsights;
  private config: MonitoringConfig;
  private metricsInterval: NodeJS.Timer | null = null;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.config = this.loadConfig();
    this.initialize();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private loadConfig(): MonitoringConfig {
    // Load from environment or default values
    return {
      metrics: {
        enabled: environment.monitoring?.metricsEnabled ?? true,
        interval: environment.monitoring?.metricsInterval ?? 60000,
        retention: environment.monitoring?.metricsRetention ?? 30
      },
      alerts: {
        enabled: environment.monitoring?.alertsEnabled ?? true,
        channels: environment.monitoring?.alertChannels ?? ['email'],
        thresholds: environment.monitoring?.alertThresholds ?? {}
      },
      audit: {
        enabled: environment.monitoring?.auditEnabled ?? true,
        detailedLogging: environment.monitoring?.detailedLogging ?? true,
        retention: environment.monitoring?.auditRetention ?? 90
      }
    };
  }

  private initialize(): void {
    if (this.config.metrics.enabled) {
      this.startMetricsCollection();
    }
    logger.info('MonitoringService initialized');
  }

  private startMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.metricsInterval = setInterval(
      () => this.collectMetrics(),
      this.config.metrics.interval
    );
  }

  private async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.gatherPerformanceMetrics();
      await this.saveMetrics(metrics);
      await this.checkAlertThresholds(metrics);
    } catch (error) {
      logger.error('Error collecting metrics:', error);
    }
  }

  private async gatherPerformanceMetrics(): Promise<PerformanceMetrics> {
    // Implement actual metrics collection logic
    return {
      responseTime: 0,
      errorRate: 0,
      successRate: 100,
      resourceUsage: {
        cpu: 0,
        memory: 0,
        disk: 0
      }
    };
  }

  private async saveMetrics(metrics: PerformanceMetrics): Promise<void> {
    const monitoringMetric: MonitoringMetric = {
      id: crypto.randomUUID(),
      name: 'system_performance',
      value: metrics.successRate,
      unit: 'percentage',
      timestamp: new Date(),
      tags: {
        type: 'performance',
        environment: environment.nodeEnv
      },
      source: 'monitoring_service',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.create('monitoring_metrics', monitoringMetric);
  }

  private async checkAlertThresholds(metrics: PerformanceMetrics): Promise<void> {
    if (!this.config.alerts.enabled) return;

    const thresholds = this.config.alerts.thresholds;
    
    if (metrics.errorRate > (thresholds.errorRate ?? 5)) {
      await this.createAlert({
        type: 'performance',
        severity: 'high',
        message: `High error rate detected: ${metrics.errorRate}%`,
        source: 'monitoring_service',
        metric: {
          name: 'error_rate',
          value: metrics.errorRate,
          threshold: thresholds.errorRate ?? 5
        }
      });
    }
  }

  public async createAlert(alert: Omit<MonitoringAlert, keyof BaseEntity>): Promise<void> {
    const newAlert: MonitoringAlert = {
      id: crypto.randomUUID(),
      ...alert,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.create('monitoring_alerts', newAlert);
    logger.warn(`Monitoring alert created: ${alert.message}`);
  }

  public async createAuditEntry(entry: Omit<AuditEntry, keyof BaseEntity>): Promise<void> {
    if (!this.config.audit.enabled) return;

    const auditEntry: AuditEntry = {
      id: crypto.randomUUID(),
      ...entry,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.create('audit_entries', auditEntry);
    
    if (this.config.audit.detailedLogging) {
      logger.info(`Audit entry created: ${entry.action} on ${entry.entityType} ${entry.entityId}`);
    }
  }

  public async getSystemHealth(): Promise<SystemHealth> {
    const metrics = await this.gatherPerformanceMetrics();
    const components = await this.checkComponentsHealth();

    return {
      status: this.determineOverallHealth(components),
      components,
      metrics,
      lastUpdate: new Date()
    };
  }

  private async checkComponentsHealth(): Promise<SystemHealth['components']> {
    const components: SystemHealth['components'] = {};
    
    // Check database health
    try {
      await this.db.ping();
      components.database = {
        status: 'up',
        lastCheck: new Date()
      };
    } catch (error) {
      components.database = {
        status: 'down',
        lastCheck: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return components;
  }

  private determineOverallHealth(components: SystemHealth['components']): SystemHealth['status'] {
    const statuses = Object.values(components).map(c => c.status);
    
    if (statuses.some(s => s === 'down')) {
      return 'unhealthy';
    }
    if (statuses.some(s => s === 'degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }

  public async cleanup(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    // Cleanup old data based on retention settings
    const metricsRetention = new Date();
    metricsRetention.setDate(metricsRetention.getDate() - this.config.metrics.retention);
    
    const auditRetention = new Date();
    auditRetention.setDate(auditRetention.getDate() - this.config.audit.retention);

    await Promise.all([
      this.db.deleteMany('monitoring_metrics', { createdAt: { $lt: metricsRetention } }),
      this.db.deleteMany('audit_entries', { createdAt: { $lt: auditRetention } })
    ]);
  }

  static initialize(): void {
    if (!process.env.APPLICATION_INSIGHTS_KEY) {
      console.warn('Application Insights key not found');
      return;
    }

    this.instance = new ApplicationInsights({
      config: {
        instrumentationKey: process.env.APPLICATION_INSIGHTS_KEY,
        enableAutoRouteTracking: true,
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        extensions: [reactPlugin],
        extensionConfig: {
          [reactPlugin.identifier]: { history: browserHistory }
        }
      }
    });

    this.instance.loadAppInsights();
    this.instance.trackPageView();
  }

  static trackEvent(name: string, properties?: { [key: string]: string }): void {
    this.instance?.trackEvent({ name, properties });
  }

  static trackException(error: Error, properties?: { [key: string]: string }): void {
    this.instance?.trackException({ error, properties });
  }

  static trackMetric(name: string, value: number): void {
    this.instance?.trackMetric({ name, average: value });
  }

  static trackTrace(message: string, properties?: { [key: string]: string }): void {
    this.instance?.trackTrace({ message, properties });
  }

  static trackPageView(name?: string, properties?: { [key: string]: string }): void {
    this.instance?.trackPageView({ name, properties });
  }

  static trackPerformance(name: string, duration: number): void {
    this.instance?.trackMetric({
      name: `Performance.${name}`,
      average: duration
    });
  }

  static trackApiCall(name: string, duration: number, success: boolean, properties?: { [key: string]: string }): void {
    this.instance?.trackDependencyData({
      id: `API.${name}`,
      duration,
      success,
      resultCode: success ? '200' : '500',
      name: `API Call - ${name}`,
      type: 'HTTP',
      properties
    });
  }

  static flush(): void {
    this.instance?.flush();
  }
}

export const withMonitoring = reactPlugin.withAITracking; 