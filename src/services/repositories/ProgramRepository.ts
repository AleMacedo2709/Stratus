import { BaseRepository, BaseEntity } from './BaseRepository';
import { Program } from '@/types/strategic-planning';
import { environment } from '@/config/environment';
import { DatabaseService } from '../database/DatabaseService';
import { logger } from '../monitoring/logger';
import { mockPrograms } from '@/config/mockData';

interface ProgramEntity extends BaseEntity, Omit<Program, 'id'> {}

export class ProgramRepository extends BaseRepository<ProgramEntity> {
  protected tableName = 'Programs';
  protected mockData: ProgramEntity[] = mockPrograms.map(({ id, ...rest }) => rest);

  async findByPerspective(perspectiveId: string): Promise<ProgramEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(prog => prog.perspectiveId === perspectiveId);
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE perspectiveId = @param0 
        AND deletedAt IS NULL
        ORDER BY [order]
      `;
      return await DatabaseService.query<ProgramEntity>(query, [perspectiveId]);
    } catch (error) {
      logger.error(`Error fetching programs by perspective`, { error });
      throw error;
    }
  }

  async updateOrder(id: string, order: number): Promise<ProgramEntity> {
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
      const results = await DatabaseService.query<ProgramEntity>(query, [order, id]);
      if (!results[0]) throw new Error('Program not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating program order`, { error });
      throw error;
    }
  }

  async getProgress(id: string): Promise<number> {
    if (environment.useMockData) {
      return 0;
    }

    try {
      const query = `
        WITH ActionProgress AS (
          SELECT 
            a.programId,
            AVG(a.currentProgress) as avgProgress
          FROM StrategicActions a
          WHERE a.programId = @param0
          AND a.deletedAt IS NULL
          GROUP BY a.programId
        )
        SELECT COALESCE(avgProgress, 0) as progress
        FROM ActionProgress;
      `;
      const results = await DatabaseService.query<{ progress: number }>(query, [id]);
      return results[0]?.progress || 0;
    } catch (error) {
      logger.error(`Error calculating program progress`, { error });
      throw error;
    }
  }
} 