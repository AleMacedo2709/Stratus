import { BaseEntity } from '../repositories/types';

export interface NotificationTemplate {
  subject?: string;
  body: string;
  title?: string;
}

export interface NotificationChannel {
  type: 'email' | 'push' | 'inApp';
  enabled: boolean;
  frequency: 'immediate' | 'realtime' | 'daily' | 'weekly';
  types: string[];
}

export interface NotificationPreferences {
  channels: {
    email: NotificationChannel;
    push: NotificationChannel;
    inApp: NotificationChannel;
  };
  schedules: {
    workdays: {
      start: string;
      end: string;
      timezone: string;
    };
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    time: string;
    includeSummary: boolean;
    includeDetails: boolean;
  };
}

export interface Notification extends BaseEntity {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'unread' | 'read' | 'archived';
  metadata?: Record<string, any>;
  actions?: Array<{
    label: string;
    url: string;
  }>;
  userId: string;
  readAt?: Date;
  archivedAt?: Date;
} 