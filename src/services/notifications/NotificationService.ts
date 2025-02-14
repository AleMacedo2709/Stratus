import { logger } from '../monitoring/logger';
import { DatabaseService } from '../database/DatabaseService';
import { environment } from '@/config/environment';
import { mockNotifications } from '@/data/mock/notifications';
import { 
  NotificationTemplate, 
  NotificationChannel, 
  NotificationPreferences,
  Notification 
} from './types';

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

export class NotificationService {
  private static instance: NotificationService;
  private channels: Map<string, NotificationChannel>;

  private constructor() {
    this.channels = new Map();
    this.initializeChannels();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private initializeChannels() {
    // Email Channel
    this.channels.set('email', {
      type: 'email',
      enabled: true,
      send: async (notification, user) => {
        // Implementar envio de email
        return true;
      }
    });

    // SMS Channel
    this.channels.set('sms', {
      type: 'sms',
      enabled: true,
      send: async (notification, user) => {
        // Implementar envio de SMS
        return true;
      }
    });

    // Push Notification Channel
    this.channels.set('push', {
      type: 'push',
      enabled: true,
      send: async (notification, user) => {
        // Implementar envio de push notification
        return true;
      }
    });

    // In-App Notification Channel
    this.channels.set('in-app', {
      type: 'in-app',
      enabled: true,
      send: async (notification, user) => {
        try {
          await DatabaseService.query(
            `INSERT INTO Notifications (UserID, Type, Title, Message, Priority, RelatedEntityType, RelatedEntityID, Metadata)
             VALUES (@userId, @type, @title, @message, @priority, @entityType, @entityId, @metadata)`,
            {
              userId: user.id,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              priority: notification.priority,
              entityType: notification.relatedEntityType,
              entityId: notification.relatedEntityID,
              metadata: JSON.stringify(notification.metadata)
            }
          );
          return true;
        } catch (error) {
          logger.error('Failed to save in-app notification', error as Error);
          return false;
        }
      }
    });
  }

  async createNotification(
    userId: number,
    type: string,
    title: string,
    message: string,
    options: Partial<Notification> = {}
  ): Promise<boolean> {
    try {
      // Get user notification preferences
      const preferences = await this.getUserPreferences(userId);
      
      if (!preferences[type]?.isEnabled) {
        logger.info('Notification type disabled for user', { userId, type });
        return false;
      }

      // Create notification object
      const notification: Notification = {
        type,
        title,
        message,
        priority: options.priority || 'normal',
        status: 'unread',
        ...options
      };

      // Get user channels
      const userChannels = await this.getUserChannels(userId);
      
      // Send through each enabled channel
      const results = await Promise.all(
        userChannels
          .filter(channel => channel.enabled)
          .map(async channel => {
            const channelHandler = this.channels.get(channel.type);
            if (!channelHandler) return false;

            try {
              const success = await channelHandler.send(notification, { id: userId });
              
              // Log delivery attempt
              await this.logDeliveryAttempt(notification.id!, channel.type, success);
              
              return success;
            } catch (error) {
              logger.error('Failed to send notification', error as Error, {
                userId,
                channelType: channel.type
              });
              return false;
            }
          })
      );

      return results.some(result => result);
    } catch (error) {
      logger.error('Failed to create notification', error as Error, { userId, type });
      return false;
    }
  }

  async getUserNotifications(
    userId: number,
    options: {
      status?: 'read' | 'unread' | 'all';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    try {
      const { status = 'all', limit = 10, offset = 0 } = options;

      let query = `
        SELECT *
        FROM Notifications
        WHERE UserID = @userId
      `;

      if (status !== 'all') {
        query += ` AND Status = @status`;
      }

      query += `
        ORDER BY CreatedAt DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;

      const notifications = await DatabaseService.query(query, {
        userId,
        status,
        limit,
        offset
      });

      return notifications.map(this.mapNotificationFromDb);
    } catch (error) {
      logger.error('Failed to get user notifications', error as Error, { userId });
      return [];
    }
  }

  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    try {
      const result = await DatabaseService.query(
        `UPDATE Notifications
         SET Status = 'read', ReadAt = GETDATE()
         WHERE NotificationID = @notificationId AND UserID = @userId`,
        { notificationId, userId }
      );

      return result.rowsAffected > 0;
    } catch (error) {
      logger.error('Failed to mark notification as read', error as Error, {
        notificationId,
        userId
      });
      return false;
    }
  }

  async updateUserPreferences(
    userId: number,
    preferences: NotificationPreferences
  ): Promise<boolean> {
    try {
      // Delete existing preferences
      await DatabaseService.query(
        `DELETE FROM NotificationPreferences WHERE UserID = @userId`,
        { userId }
      );

      // Insert new preferences
      for (const [type, prefs] of Object.entries(preferences)) {
        await DatabaseService.query(
          `INSERT INTO NotificationPreferences (UserID, NotificationType, IsEnabled, Frequency)
           VALUES (@userId, @type, @isEnabled, @frequency)`,
          {
            userId,
            type,
            isEnabled: prefs.isEnabled,
            frequency: prefs.frequency
          }
        );
      }

      return true;
    } catch (error) {
      logger.error('Failed to update user preferences', error as Error, { userId });
      return false;
    }
  }

  private async getUserPreferences(userId: number): Promise<NotificationPreferences> {
    try {
      const preferences = await DatabaseService.query(
        `SELECT NotificationType, IsEnabled, Frequency
         FROM NotificationPreferences
         WHERE UserID = @userId`,
        { userId }
      );

      return preferences.reduce((acc: NotificationPreferences, pref: any) => {
        acc[pref.NotificationType] = {
          isEnabled: pref.IsEnabled,
          frequency: pref.Frequency
        };
        return acc;
      }, {});
    } catch (error) {
      logger.error('Failed to get user preferences', error as Error, { userId });
      return {};
    }
  }

  private async getUserChannels(userId: number): Promise<NotificationChannel[]> {
    try {
      const channels = await DatabaseService.query(
        `SELECT ChannelType, IsEnabled
         FROM UserNotificationChannels
         WHERE UserID = @userId`,
        { userId }
      );

      return channels.map((channel: any) => ({
        type: channel.ChannelType,
        enabled: channel.IsEnabled
      }));
    } catch (error) {
      logger.error('Failed to get user channels', error as Error, { userId });
      return [];
    }
  }

  private async logDeliveryAttempt(
    notificationId: number,
    channelType: string,
    success: boolean
  ): Promise<void> {
    try {
      await DatabaseService.query(
        `INSERT INTO NotificationDeliveryHistory (NotificationID, ChannelType, Status, DeliveredAt)
         VALUES (@notificationId, @channelType, @status, @deliveredAt)`,
        {
          notificationId,
          channelType,
          status: success ? 'delivered' : 'failed',
          deliveredAt: success ? new Date() : null
        }
      );
    } catch (error) {
      logger.error('Failed to log delivery attempt', error as Error, {
        notificationId,
        channelType
      });
    }
  }

  private mapNotificationFromDb(dbNotification: any): Notification {
    return {
      id: dbNotification.NotificationID,
      type: dbNotification.Type,
      title: dbNotification.Title,
      message: dbNotification.Message,
      status: dbNotification.Status,
      priority: dbNotification.Priority,
      relatedEntityType: dbNotification.RelatedEntityType,
      relatedEntityID: dbNotification.RelatedEntityID,
      metadata: dbNotification.Metadata ? JSON.parse(dbNotification.Metadata) : undefined,
      createdAt: dbNotification.CreatedAt,
      readAt: dbNotification.ReadAt,
      expiresAt: dbNotification.ExpiresAt
    };
  }
} 