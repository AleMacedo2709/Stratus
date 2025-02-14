import { BaseRepository, BaseEntity } from './BaseRepository';
import { PAA } from '@/types/strategic-planning';
import { environment } from '@/config/environment';
import { DatabaseService } from '../database/DatabaseService';
import { logger } from '../monitoring/logger';
import { mockPAAs } from '@/config/mockData';

interface PAAEntity extends BaseEntity, Omit<PAA, 'id'> {}

export class PAARepository extends BaseRepository<PAAEntity> {
  protected tableName = 'PAAs';
  protected mockData: PAAEntity[] = mockPAAs.map(({ id, ...rest }) => rest);

  async findByYear(year: number): Promise<PAAEntity | null> {
    if (environment.useMockData) {
      return this.mockData.find(paa => paa.year === year) || null;
    }

    try {
      const query = `
        SELECT TOP 1 * FROM ${this.tableName}
        WHERE year = @param0
        AND deletedAt IS NULL
      `;
      const results = await DatabaseService.query<PAAEntity>(query, [year]);
      return results[0] || null;
    } catch (error) {
      logger.error(`Error fetching PAA by year`, { error });
      throw error;
    }
  }

  async findActive(): Promise<PAAEntity | null> {
    if (environment.useMockData) {
      return this.mockData.find(paa => paa.status === 'in_progress') || null;
    }

    try {
      const query = `
        SELECT TOP 1 * FROM ${this.tableName}
        WHERE status = 'in_progress'
        AND deletedAt IS NULL
        ORDER BY year DESC
      `;
      const results = await DatabaseService.query<PAAEntity>(query);
      return results[0] || null;
    } catch (error) {
      logger.error(`Error fetching active PAA`, { error });
      throw error;
    }
  }

  async updateStatus(id: string, status: PAA['status']): Promise<PAAEntity> {
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
      const results = await DatabaseService.query<PAAEntity>(query, [status, id]);
      if (!results[0]) throw new Error('PAA not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating PAA status`, { error });
      throw error;
    }
  }

  async updateProgress(id: string, progress: number): Promise<PAAEntity> {
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
      const results = await DatabaseService.query<PAAEntity>(query, [progress, id]);
      if (!results[0]) throw new Error('PAA not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating PAA progress`, { error });
      throw error;
    }
  }

  async calculateProgress(id: string): Promise<number> {
    if (environment.useMockData) {
      return 0;
    }

    try {
      const query = `
        WITH InitiativeProgress AS (
          SELECT 
            i.paaId,
            AVG(i.currentProgress) as avgProgress
          FROM Initiatives i
          WHERE i.paaId = @param0
          AND i.deletedAt IS NULL
          GROUP BY i.paaId
        )
        SELECT COALESCE(avgProgress, 0) as progress
        FROM InitiativeProgress;
      `;
      const results = await DatabaseService.query<{ progress: number }>(query, [id]);
      return results[0]?.progress || 0;
    } catch (error) {
      logger.error(`Error calculating PAA progress`, { error });
      throw error;
    }
  }

  async getInitiativesProgress(id: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    delayed: number;
  }> {
    if (environment.useMockData) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        delayed: 0
      };
    }

    try {
      const query = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
          SUM(CASE WHEN status = 'not_started' THEN 1 ELSE 0 END) as notStarted,
          SUM(CASE 
            WHEN status = 'in_progress' 
            AND currentProgress < expectedProgress 
            THEN 1 ELSE 0 END) as delayed
        FROM Initiatives
        WHERE paaId = @param0
        AND deletedAt IS NULL;
      `;
      const results = await DatabaseService.query<{
        total: number;
        completed: number;
        inProgress: number;
        notStarted: number;
        delayed: number;
      }>(query, [id]);
      return results[0] || {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        delayed: 0
      };
    } catch (error) {
      logger.error(`Error getting PAA initiatives progress`, { error });
      throw error;
    }
  }
} 