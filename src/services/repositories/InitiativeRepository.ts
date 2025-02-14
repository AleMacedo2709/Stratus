import { BaseRepository, BaseEntity } from './BaseRepository';
import { Initiative } from '@/types/strategic-planning';
import { environment } from '@/config/environment';
import { DatabaseService } from '../database/DatabaseService';
import { logger } from '../monitoring/logger';
import { mockInitiatives } from '@/config/mockData';

interface InitiativeEntity extends BaseEntity, Omit<Initiative, 'id'> {}

export class InitiativeRepository extends BaseRepository<InitiativeEntity> {
  protected tableName = 'Initiatives';
  protected mockData: InitiativeEntity[] = mockInitiatives.map(({ id, ...rest }) => rest);

  async findByObjective(objectiveId: string): Promise<InitiativeEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(init => init.objectiveId === objectiveId);
    }

    try {
      const query = `
        SELECT i.* 
        FROM ${this.tableName} i
        INNER JOIN ObjectiveInitiatives oi ON i.id = oi.initiativeId
        WHERE oi.objectiveId = @param0 
        AND i.deletedAt IS NULL
      `;
      return await DatabaseService.query<InitiativeEntity>(query, [objectiveId]);
    } catch (error) {
      logger.error(`Error fetching initiatives by objective`, { error });
      throw error;
    }
  }

  async findByStatus(status: Initiative['status']): Promise<InitiativeEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(init => init.status === status);
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE status = @param0 
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<InitiativeEntity>(query, [status]);
    } catch (error) {
      logger.error(`Error fetching initiatives by status`, { error });
      throw error;
    }
  }

  async updateProgress(id: string, progress: number): Promise<InitiativeEntity> {
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
      const results = await DatabaseService.query<InitiativeEntity>(query, [progress, id]);
      if (!results[0]) throw new Error('Initiative not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating initiative progress`, { error });
      throw error;
    }
  }

  async updateStatus(id: string, status: Initiative['status']): Promise<InitiativeEntity> {
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
      const results = await DatabaseService.query<InitiativeEntity>(query, [status, id]);
      if (!results[0]) throw new Error('Initiative not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating initiative status`, { error });
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<InitiativeEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(init => {
        const initStartDate = new Date(init.startDate);
        const initEndDate = new Date(init.endDate);
        return initStartDate >= startDate && initEndDate <= endDate;
      });
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE startDate >= @param0 
        AND endDate <= @param1
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<InitiativeEntity>(query, [startDate, endDate]);
    } catch (error) {
      logger.error(`Error fetching initiatives by date range`, { error });
      throw error;
    }
  }

  async findByResponsible(responsibleId: string): Promise<InitiativeEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(init => init.responsible === responsibleId);
    }

    try {
      const query = `
        SELECT i.* 
        FROM ${this.tableName} i
        INNER JOIN InitiativeResponsibles ir ON i.id = ir.initiativeId
        WHERE ir.userId = @param0 
        AND i.deletedAt IS NULL
      `;
      return await DatabaseService.query<InitiativeEntity>(query, [responsibleId]);
    } catch (error) {
      logger.error(`Error fetching initiatives by responsible`, { error });
      throw error;
    }
  }
} 