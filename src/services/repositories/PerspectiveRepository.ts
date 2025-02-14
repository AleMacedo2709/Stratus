import { BaseRepository, BaseEntity } from './BaseRepository';
import { Perspective } from '@/types/strategic-planning';
import { environment } from '@/config/environment';
import { DatabaseService } from '../database/DatabaseService';
import { logger } from '../monitoring/logger';
import { mockPerspectives } from '@/config/mockData';

interface PerspectiveEntity extends BaseEntity, Omit<Perspective, 'id'> {}

export class PerspectiveRepository extends BaseRepository<PerspectiveEntity> {
  protected tableName = 'Perspectives';
  protected mockData: PerspectiveEntity[] = mockPerspectives.map(({ id, ...rest }) => rest);

  async findByCycle(cycleId: string): Promise<PerspectiveEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(persp => persp.strategicCycleId === cycleId);
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE strategicCycleId = @param0 
        AND deletedAt IS NULL
        ORDER BY [order]
      `;
      return await DatabaseService.query<PerspectiveEntity>(query, [cycleId]);
    } catch (error) {
      logger.error(`Error fetching perspectives by cycle`, { error });
      throw error;
    }
  }

  async updateOrder(id: string, order: number): Promise<PerspectiveEntity> {
    if (environment.useMockData) {
      return this.update(id, { order });
    }

    try {
      const query = `
        UPDATE ${this.tableName}
        SET [order] = @param0, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @param1 AND deletedAt IS NULL;
      `;
      const results = await DatabaseService.query<PerspectiveEntity>(query, [order, id]);
      if (!results[0]) throw new Error('Perspective not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating perspective order`, { error });
      throw error;
    }
  }

  async getProgress(id: string): Promise<number> {
    if (environment.useMockData) {
      return 0;
    }

    try {
      const query = `
        WITH ProgramProgress AS (
          SELECT 
            p.perspectiveId,
            AVG(
              CASE 
                WHEN sa.currentProgress IS NOT NULL THEN sa.currentProgress
                ELSE 0 
              END
            ) as avgProgress
          FROM Programs p
          LEFT JOIN StrategicActions sa ON sa.programId = p.id
          WHERE p.perspectiveId = @param0
          AND p.deletedAt IS NULL
          AND (sa.id IS NULL OR sa.deletedAt IS NULL)
          GROUP BY p.perspectiveId
        )
        SELECT COALESCE(avgProgress, 0) as progress
        FROM ProgramProgress;
      `;
      const results = await DatabaseService.query<{ progress: number }>(query, [id]);
      return results[0]?.progress || 0;
    } catch (error) {
      logger.error(`Error calculating perspective progress`, { error });
      throw error;
    }
  }

  async findActive(): Promise<PerspectiveEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(persp => persp.isActive);
    }

    try {
      const query = `
        SELECT p.* 
        FROM ${this.tableName} p
        INNER JOIN StrategicCycles sc ON p.strategicCycleId = sc.id
        WHERE sc.status = 'in_progress'
        AND p.deletedAt IS NULL
        AND sc.deletedAt IS NULL
        ORDER BY p.[order]
      `;
      return await DatabaseService.query<PerspectiveEntity>(query);
    } catch (error) {
      logger.error(`Error fetching active perspectives`, { error });
      throw error;
    }
  }
} 