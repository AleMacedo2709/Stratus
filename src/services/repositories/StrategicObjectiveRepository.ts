import { BaseRepository } from './BaseRepository';
import { StrategicObjective } from '@/types/strategic-planning';
import { environment } from '@/config/environment';
import { DatabaseService } from '../database/DatabaseService';
import { logger } from '../monitoring/logger';
import { mockStrategicObjectives } from '@/config/mockData';
import { StrategicObjectiveEntity } from './types';

export class StrategicObjectiveRepository extends BaseRepository<StrategicObjectiveEntity> {
  protected tableName = 'StrategicObjectives';
  protected mockData: StrategicObjectiveEntity[] = mockStrategicObjectives.map(({ id, ...rest }) => ({
    ...rest,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  async findByType(type: StrategicObjective['type']): Promise<StrategicObjectiveEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(obj => obj.type === type);
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName} 
        WHERE type = @param0 
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<StrategicObjectiveEntity>(query, [type]);
    } catch (error) {
      logger.error(`Error fetching objectives by type from ${this.tableName}`, { error });
      throw error;
    }
  }

  async findByParent(parentId: string): Promise<StrategicObjectiveEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(obj => obj.parentId === parentId);
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName} 
        WHERE parentId = @param0 
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<StrategicObjectiveEntity>(query, [parentId]);
    } catch (error) {
      logger.error(`Error fetching objectives by parent from ${this.tableName}`, { error });
      throw error;
    }
  }

  async updateProgress(
    id: string, 
    progress: number, 
    status: StrategicObjective['status']
  ): Promise<StrategicObjectiveEntity> {
    return this.update(id, { progress, status });
  }
} 