import { BaseRepository } from './BaseRepository';
import { Indicator } from '@/types/strategic-planning';
import { environment } from '@/config/environment';
import { DatabaseService } from '../database/DatabaseService';
import { logger } from '../monitoring/logger';
import { mockIndicators } from '@/config/mockData';
import { IndicatorEntity } from './types';

export class IndicatorRepository extends BaseRepository<IndicatorEntity> {
  protected tableName = 'Indicators';
  protected mockData: IndicatorEntity[] = mockIndicators.map(({ id, ...rest }) => ({
    ...rest,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  async findByObjective(objectiveId: string): Promise<IndicatorEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(ind => ind.objectiveId === objectiveId);
    }

    try {
      const query = `
        SELECT i.* 
        FROM ${this.tableName} i
        INNER JOIN ObjectiveIndicators oi ON i.id = oi.indicatorId
        WHERE oi.objectiveId = @param0 
        AND i.deletedAt IS NULL
      `;
      return await DatabaseService.query<IndicatorEntity>(query, [objectiveId]);
    } catch (error) {
      logger.error(`Error fetching indicators by objective`, { error });
      throw error;
    }
  }

  async updateValue(id: string, value: number): Promise<IndicatorEntity> {
    if (environment.useMockData) {
      return this.update(id, { currentValue: value });
    }

    try {
      const query = `
        UPDATE ${this.tableName}
        SET currentValue = @param0, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @param1 AND deletedAt IS NULL;
      `;
      const results = await DatabaseService.query<IndicatorEntity>(query, [value, id]);
      if (!results[0]) throw new Error('Indicator not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating indicator value`, { error });
      throw error;
    }
  }

  async getHistory(id: string, startDate?: Date, endDate?: Date): Promise<Array<{ date: Date; value: number }>> {
    if (environment.useMockData) {
      return [];
    }

    try {
      let query = `
        SELECT recordDate as date, value 
        FROM IndicatorHistory 
        WHERE indicatorId = @param0
      `;

      const params: any[] = [id];

      if (startDate) {
        query += ` AND recordDate >= @param1`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND recordDate <= @param${params.length}`;
        params.push(endDate);
      }

      query += ` ORDER BY recordDate DESC`;

      return await DatabaseService.query(query, params);
    } catch (error) {
      logger.error(`Error fetching indicator history`, { error });
      throw error;
    }
  }

  async calculateProgress(id: string): Promise<number> {
    if (environment.useMockData) {
      const indicator = await this.findById(id);
      if (!indicator) throw new Error('Indicator not found');
      return (indicator.currentValue / indicator.targetValue) * 100;
    }

    try {
      const query = `
        SELECT 
          CASE 
            WHEN targetValue = 0 THEN 0 
            ELSE (currentValue / targetValue) * 100 
          END as progress
        FROM ${this.tableName}
        WHERE id = @param0 AND deletedAt IS NULL;
      `;
      const results = await DatabaseService.query<{ progress: number }>(query, [id]);
      if (!results[0]) throw new Error('Indicator not found');
      return results[0].progress;
    } catch (error) {
      logger.error(`Error calculating indicator progress`, { error });
      throw error;
    }
  }
} 