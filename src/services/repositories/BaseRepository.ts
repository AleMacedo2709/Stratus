import { DatabaseService } from '../database';
import { environment } from '@/config/environment';
import { logger } from '../monitoring/logger';
import { BaseEntity } from './types';
import { QueryResult } from 'pg';

export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract tableName: string;
  protected abstract mockData: T[];

  protected async query<R = T>(queryString: string, params?: any[]): Promise<R[]> {
    if (environment.useMockData) {
      return [] as R[];
    }

    try {
      const result: QueryResult<R> = await DatabaseService.query<R>(queryString, params);
      return result.rows;
    } catch (error) {
      logger.error(`Error executing query on ${this.tableName}`, error);
      throw error;
    }
  }

  protected async queryOne<R = T>(queryString: string, params?: any[]): Promise<R | null> {
    if (environment.useMockData) {
      return null;
    }

    try {
      const result: QueryResult<R> = await DatabaseService.query<R>(queryString, params);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error executing query on ${this.tableName}`, error);
      throw error;
    }
  }

  async findAll(): Promise<T[]> {
    if (environment.useMockData) {
      return this.mockData;
    }

    const query = `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL`;
    return this.query(query);
  }

  async findById(id: string): Promise<T | null> {
    if (environment.useMockData) {
      return this.mockData.find(item => item.id === id) || null;
    }

    const query = `SELECT * FROM ${this.tableName} WHERE id = $1 AND deleted_at IS NULL`;
    return this.queryOne(query, [id]);
  }

  async create(entity: Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<T> {
    if (environment.useMockData) {
      const newEntity = {
        ...entity,
        id: Math.random().toString(36).substring(7),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as T;
      this.mockData.push(newEntity);
      return newEntity;
    }

    const columns = Object.keys(entity);
    const values = Object.values(entity);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await this.queryOne<T>(query, values);
    if (!result) {
      throw new Error('Failed to create entity');
    }
    return result;
  }

  async update(id: string, entity: Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<T> {
    if (environment.useMockData) {
      const index = this.mockData.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error('Entity not found');
      }
      
      this.mockData[index] = {
        ...this.mockData[index],
        ...entity,
        updated_at: new Date().toISOString()
      };
      return this.mockData[index];
    }

    const columns = Object.keys(entity);
    const values = Object.values(entity);
    const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');
    
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await this.queryOne<T>(query, [id, ...values]);
    if (!result) {
      throw new Error('Entity not found or update failed');
    }
    return result;
  }

  async delete(id: string): Promise<void> {
    if (environment.useMockData) {
      const index = this.mockData.findIndex(item => item.id === id);
      if (index !== -1) {
        this.mockData[index] = {
          ...this.mockData[index],
          deleted_at: new Date().toISOString()
        };
      }
      return;
    }

    const query = `
      UPDATE ${this.tableName}
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;
    
    await DatabaseService.query(query, [id]);
  }

  async hardDelete(id: string): Promise<void> {
    if (environment.useMockData) {
      const index = this.mockData.findIndex(item => item.id === id);
      if (index !== -1) {
        this.mockData.splice(index, 1);
      }
      return;
    }

    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    await DatabaseService.query(query, [id]);
  }
} 