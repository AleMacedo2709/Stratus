'use client';

import { environment } from '@/config/environment';
import { logger } from '../monitoring/logger';

export class DatabaseService {
  private static instance: DatabaseService | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async query<T>(queryString: string, params?: any[]): Promise<T[]> {
    if (environment.useMockData) {
      throw new Error('Cannot execute queries when using mock data');
    }

    try {
      const response = await fetch('/api/db/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryString, params }),
      });

      if (!response.ok) {
        throw new Error('Database query failed');
      }

      return await response.json();
    } catch (error) {
      logger.error('Database query failed', error);
      throw error;
    }
  }

  static async query<T>(queryString: string, params?: any[]): Promise<T[]> {
    return await DatabaseService.getInstance().query<T>(queryString, params);
  }
} 