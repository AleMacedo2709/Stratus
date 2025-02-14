import { BaseRepository, BaseEntity } from './BaseRepository';
import { StrategicCycle } from '@/types/strategic-planning';
import { environment } from '@/config/environment';
import { DatabaseService } from '../database/DatabaseService';
import { logger } from '../monitoring/logger';
import { mockStrategicCycles } from '@/config/mockData';

interface StrategicCycleEntity extends BaseEntity, Omit<StrategicCycle, 'id'> {}

export class StrategicCycleRepository extends BaseRepository<StrategicCycleEntity> {
  protected tableName = 'StrategicCycles';
  protected mockData: StrategicCycleEntity[] = mockStrategicCycles.map(({ id, ...rest }) => rest);

  async findActive(): Promise<StrategicCycleEntity | null> {
    if (environment.useMockData) {
      return this.mockData.find(cycle => cycle.status === 'in_progress') || null;
    }

    try {
      const query = `
        SELECT TOP 1 * FROM ${this.tableName}
        WHERE status = 'in_progress'
        AND deletedAt IS NULL
        ORDER BY startDate DESC
      `;
      const results = await DatabaseService.query<StrategicCycleEntity>(query);
      return results[0] || null;
    } catch (error) {
      logger.error(`Error fetching active strategic cycle`, { error });
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<StrategicCycleEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(cycle => {
        const cycleStart = new Date(cycle.startDate);
        const cycleEnd = new Date(cycle.endDate);
        return cycleStart >= startDate && cycleEnd <= endDate;
      });
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE startDate >= @param0 
        AND endDate <= @param1
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<StrategicCycleEntity>(query, [startDate, endDate]);
    } catch (error) {
      logger.error(`Error fetching strategic cycles by date range`, { error });
      throw error;
    }
  }

  async updateStatus(id: string, status: StrategicCycle['status']): Promise<StrategicCycleEntity> {
    if (environment.useMockData) {
      return this.update(id, { status });
    }

    try {
      const query = `
        UPDATE ${this.tableName}
        SET status = @param0, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @param1 AND deletedAt IS NULL;
      `;
      const results = await DatabaseService.query<StrategicCycleEntity>(query, [status, id]);
      if (!results[0]) throw new Error('Strategic cycle not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating strategic cycle status`, { error });
      throw error;
    }
  }

  async updateProgress(id: string, progress: number): Promise<StrategicCycleEntity> {
    if (environment.useMockData) {
      return this.update(id, { progress });
    }

    try {
      const query = `
        UPDATE ${this.tableName}
        SET progress = @param0, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @param1 AND deletedAt IS NULL;
      `;
      const results = await DatabaseService.query<StrategicCycleEntity>(query, [progress, id]);
      if (!results[0]) throw new Error('Strategic cycle not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating strategic cycle progress`, { error });
      throw error;
    }
  }

  async calculateProgress(id: string): Promise<number> {
    if (environment.useMockData) {
      return 0;
    }

    try {
      const query = `
        WITH ObjectiveProgress AS (
          SELECT 
            o.strategicCycleId,
            AVG(o.currentProgress) as avgProgress
          FROM Objectives o
          WHERE o.strategicCycleId = @param0
          AND o.deletedAt IS NULL
          GROUP BY o.strategicCycleId
        )
        SELECT COALESCE(avgProgress, 0) as progress
        FROM ObjectiveProgress;
      `;
      const results = await DatabaseService.query<{ progress: number }>(query, [id]);
      return results[0]?.progress || 0;
    } catch (error) {
      logger.error(`Error calculating strategic cycle progress`, { error });
      throw error;
    }
  }
} 