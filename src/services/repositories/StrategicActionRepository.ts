import { BaseRepository, BaseEntity } from './BaseRepository';
import { StrategicAction } from '@/types/strategic-planning';
import { environment } from '@/config/environment';
import { DatabaseService } from '../database/DatabaseService';
import { logger } from '../monitoring/logger';
import { mockStrategicActions } from '@/config/mockData';

interface StrategicActionEntity extends BaseEntity, Omit<StrategicAction, 'id'> {}

export class StrategicActionRepository extends BaseRepository<StrategicActionEntity> {
  protected tableName = 'StrategicActions';
  protected mockData: StrategicActionEntity[] = mockStrategicActions.map(({ id, ...rest }) => rest);

  async findByProgram(programId: string): Promise<StrategicActionEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(action => action.programId === programId);
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE programId = @param0 
        AND deletedAt IS NULL
        ORDER BY [order]
      `;
      return await DatabaseService.query<StrategicActionEntity>(query, [programId]);
    } catch (error) {
      logger.error(`Error fetching strategic actions by program`, { error });
      throw error;
    }
  }

  async updateOrder(id: string, order: number): Promise<StrategicActionEntity> {
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
      const results = await DatabaseService.query<StrategicActionEntity>(query, [order, id]);
      if (!results[0]) throw new Error('Strategic action not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating strategic action order`, { error });
      throw error;
    }
  }

  async updateProgress(id: string, progress: number): Promise<StrategicActionEntity> {
    if (environment.useMockData) {
      return this.update(id, { currentProgress: progress });
    }

    try {
      const query = `
        UPDATE ${this.tableName}
        SET currentProgress = @param0, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @param1 AND deletedAt IS NULL;
      `;
      const results = await DatabaseService.query<StrategicActionEntity>(query, [progress, id]);
      if (!results[0]) throw new Error('Strategic action not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating strategic action progress`, { error });
      throw error;
    }
  }

  async findByStatus(status: StrategicAction['status']): Promise<StrategicActionEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(action => action.status === status);
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE status = @param0 
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<StrategicActionEntity>(query, [status]);
    } catch (error) {
      logger.error(`Error fetching strategic actions by status`, { error });
      throw error;
    }
  }

  async findByResponsible(responsibleId: string): Promise<StrategicActionEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(action => action.responsible === responsibleId);
    }

    try {
      const query = `
        SELECT sa.* 
        FROM ${this.tableName} sa
        INNER JOIN ActionResponsibles ar ON sa.id = ar.actionId
        WHERE ar.userId = @param0 
        AND sa.deletedAt IS NULL
      `;
      return await DatabaseService.query<StrategicActionEntity>(query, [responsibleId]);
    } catch (error) {
      logger.error(`Error fetching strategic actions by responsible`, { error });
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<StrategicActionEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(action => {
        const actionStart = new Date(action.startDate);
        const actionEnd = new Date(action.endDate);
        return actionStart >= startDate && actionEnd <= endDate;
      });
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE startDate >= @param0 
        AND endDate <= @param1
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<StrategicActionEntity>(query, [startDate, endDate]);
    } catch (error) {
      logger.error(`Error fetching strategic actions by date range`, { error });
      throw error;
    }
  }
} 