import { BaseEntity } from '../repositories/types';

export interface AuditEntry extends BaseEntity {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  userId: string;
  changes: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

export interface MonitoringMetric extends BaseEntity {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  source: string;
}

export interface PerformanceMetrics {
  responseTime: number;
  errorRate: number;
  successRate: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, {
    status: 'up' | 'down' | 'degraded';
    lastCheck: Date;
    message?: string;
  }>;
  metrics: PerformanceMetrics;
  lastUpdate: Date;
}

export interface MonitoringAlert extends BaseEntity {
  type: 'performance' | 'error' | 'security' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  source: string;
  metric?: {
    name: string;
    value: number;
    threshold: number;
  };
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface MonitoringConfig {
  metrics: {
    enabled: boolean;
    interval: number;
    retention: number;
  };
  alerts: {
    enabled: boolean;
    channels: string[];
    thresholds: Record<string, number>;
  };
  audit: {
    enabled: boolean;
    detailedLogging: boolean;
    retention: number;
  };
} 