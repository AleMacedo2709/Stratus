import { BaseRepository, BaseEntity } from './BaseRepository';
import { Risk } from '@/types/strategic-planning';
import { environment } from '@/config/environment';
import { DatabaseService } from '../database/DatabaseService';
import { logger } from '../monitoring/logger';
import { mockRisks } from '@/config/mockData';

interface RiskEntity extends BaseEntity, Omit<Risk, 'id'> {}

export class RiskRepository extends BaseRepository<RiskEntity> {
  protected tableName = 'Risks';
  protected mockData: RiskEntity[] = mockRisks.map(({ id, ...rest }) => rest);

  async findByObjective(objectiveId: string): Promise<RiskEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(risk => risk.objectiveId === objectiveId);
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE objectiveId = @param0 
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<RiskEntity>(query, [objectiveId]);
    } catch (error) {
      logger.error(`Error fetching risks by objective`, { error });
      throw error;
    }
  }

  async findBySeverity(severity: Risk['severity']): Promise<RiskEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(risk => risk.severity === severity);
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE severity = @param0 
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<RiskEntity>(query, [severity]);
    } catch (error) {
      logger.error(`Error fetching risks by severity`, { error });
      throw error;
    }
  }

  async findByStatus(status: Risk['status']): Promise<RiskEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(risk => risk.status === status);
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE status = @param0 
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<RiskEntity>(query, [status]);
    } catch (error) {
      logger.error(`Error fetching risks by status`, { error });
      throw error;
    }
  }

  async updateStatus(id: string, status: Risk['status']): Promise<RiskEntity> {
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
      const results = await DatabaseService.query<RiskEntity>(query, [status, id]);
      if (!results[0]) throw new Error('Risk not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating risk status`, { error });
      throw error;
    }
  }

  async updateSeverity(id: string, severity: Risk['severity']): Promise<RiskEntity> {
    if (environment.useMockData) {
      return this.update(id, { severity });
    }

    try {
      const query = `
        UPDATE ${this.tableName}
        SET severity = @param0, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @param1 AND deletedAt IS NULL;
      `;
      const results = await DatabaseService.query<RiskEntity>(query, [severity, id]);
      if (!results[0]) throw new Error('Risk not found');
      return results[0];
    } catch (error) {
      logger.error(`Error updating risk severity`, { error });
      throw error;
    }
  }

  async findByResponsible(responsibleId: string): Promise<RiskEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(risk => risk.responsible === responsibleId);
    }

    try {
      const query = `
        SELECT r.* 
        FROM ${this.tableName} r
        INNER JOIN RiskResponsibles rr ON r.id = rr.riskId
        WHERE rr.userId = @param0 
        AND r.deletedAt IS NULL
      `;
      return await DatabaseService.query<RiskEntity>(query, [responsibleId]);
    } catch (error) {
      logger.error(`Error fetching risks by responsible`, { error });
      throw error;
    }
  }

  async findCriticalRisks(): Promise<RiskEntity[]> {
    if (environment.useMockData) {
      return this.mockData.filter(risk => 
        risk.severity === 'high' && 
        risk.probability === 'high' && 
        risk.status === 'active'
      );
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE severity = 'high'
        AND probability = 'high'
        AND status = 'active'
        AND deletedAt IS NULL
      `;
      return await DatabaseService.query<RiskEntity>(query);
    } catch (error) {
      logger.error(`Error fetching critical risks`, { error });
      throw error;
    }
  }
} 