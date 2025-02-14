import Redis from 'ioredis';
import { MonitoringService } from '../monitoring/MonitoringService';

export class RedisService {
  private static instance: Redis;
  private static readonly defaultTTL = parseInt(process.env.REDIS_CACHE_TTL || '3600');

  static initialize(): void {
    if (!process.env.REDIS_URL) {
      console.warn('Redis URL not found');
      return;
    }

    this.instance = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true
    });

    this.instance.on('error', (error) => {
      console.error('Redis connection error:', error);
      MonitoringService.trackException(error);
    });

    this.instance.on('connect', () => {
      console.log('Redis connected successfully');
      MonitoringService.trackEvent('RedisConnected');
    });
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const startTime = Date.now();
      const value = await this.instance.get(key);
      
      MonitoringService.trackPerformance('RedisGet', Date.now() - startTime);
      
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      MonitoringService.trackException(error as Error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const startTime = Date.now();
      const serializedValue = JSON.stringify(value);
      
      await this.instance.setex(key, ttl, serializedValue);
      
      MonitoringService.trackPerformance('RedisSet', Date.now() - startTime);
    } catch (error) {
      MonitoringService.trackException(error as Error);
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      const startTime = Date.now();
      await this.instance.del(key);
      
      MonitoringService.trackPerformance('RedisDelete', Date.now() - startTime);
    } catch (error) {
      MonitoringService.trackException(error as Error);
    }
  }

  static async clear(): Promise<void> {
    try {
      const startTime = Date.now();
      await this.instance.flushall();
      
      MonitoringService.trackPerformance('RedisClear', Date.now() - startTime);
    } catch (error) {
      MonitoringService.trackException(error as Error);
    }
  }

  static generateKey(...parts: string[]): string {
    return parts.join(':');
  }

  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T | null> {
    try {
      const cached = await this.get<T>(key);
      if (cached) return cached;

      const value = await fetchFn();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      MonitoringService.trackException(error as Error);
      return null;
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const startTime = Date.now();
      const keys = await this.instance.keys(pattern);
      
      if (keys.length > 0) {
        await this.instance.del(...keys);
      }
      
      MonitoringService.trackPerformance('RedisInvalidatePattern', Date.now() - startTime);
    } catch (error) {
      MonitoringService.trackException(error as Error);
    }
  }
} 