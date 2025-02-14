import { DatabaseService } from '../database';
import { logger } from '../monitoring/logger';
import { environment } from '@/config/environment';
import { 
  StrategicObjective, 
  Indicator,
  ProgressRecord 
} from '@/types/strategic-planning';
import { mockStrategicObjectives } from '@/data/mock/strategic-planning';
import { StrategicValidations } from '../validations/StrategicValidations';
import { 
  mockIndicators, 
  mockStrategicCycles,
  mockPAAs,
  mockRisks,
  mockProgressHistory 
} from '@/data/mock/strategic-planning';

export class StrategicPlanningService {
  static async getStrategicObjectives(): Promise<StrategicObjective[]> {
    try {
      if (environment.useMockData) {
        return mockStrategicObjectives;
      }

      const query = `
        SELECT 
          o.ObjectiveID as id,
          o.Name as name,
          o.Description as description,
          o.Type as type,
          o.ParentID as parentId,
          o.TargetProgress as targetProgress,
          o.CurrentProgress as currentProgress,
          o.StartDate as startDate,
          o.EndDate as endDate,
          STRING_AGG(r.Name, ',') as responsible,
          (
            SELECT JSON_AGG(json_build_object(
              'id', i.IndicatorID,
              'name', i.Name,
              'formula', i.Formula,
              'baselineValue', i.BaselineValue,
              'targetValue', i.TargetValue,
              'currentValue', i.CurrentValue,
              'measurementFrequency', i.MeasurementFrequency,
              'dataSource', i.DataSource,
              'responsible', (
                SELECT JSON_AGG(ir.Name)
                FROM IndicatorResponsible ir
                WHERE ir.IndicatorID = i.IndicatorID
              )
            ))
            FROM Indicators i
            WHERE i.ObjectiveID = o.ObjectiveID
          ) as indicators
        FROM StrategicObjectives o
        LEFT JOIN ObjectiveResponsible r ON o.ObjectiveID = r.ObjectiveID
        GROUP BY o.ObjectiveID
      `;

      const result = await DatabaseService.query(query);
      
      // Transform the result to match the StrategicObjective interface
      return result.map((row: any) => ({
        ...row,
        responsible: row.responsible.split(','),
        indicators: row.indicators || []
      }));
    } catch (error) {
      logger.error('Failed to fetch strategic objectives', error as Error);
      throw error;
    }
  }

  static async createStrategicObjective(objective: StrategicObjective): Promise<string> {
    try {
      // Validate objective before creation
      const validation = StrategicValidations.validateObjectiveAlignment(
        objective,
        objective.parentId ? await this.getObjectiveById(objective.parentId) : undefined
      );

      if (!validation.isValid) {
        throw new Error(`Invalid objective: ${JSON.stringify(validation.errors)}`);
      }

      if (environment.useMockData) {
        mockStrategicObjectives.push(objective);
        return objective.id;
      }

      const query = `
        INSERT INTO StrategicObjectives (
          Name, Description, Type, ParentID,
          TargetProgress, CurrentProgress, StartDate, EndDate
        ) VALUES (
          @name, @description, @type, @parentId,
          @targetProgress, @currentProgress, @startDate, @endDate
        ) RETURNING ObjectiveID;
      `;

      const result = await DatabaseService.query(query, [
        objective.name,
        objective.description,
        objective.type,
        objective.parentId,
        objective.targetProgress,
        objective.currentProgress,
        objective.startDate,
        objective.endDate
      ]);

      const objectiveId = result[0].ObjectiveID;

      // Insert responsible people
      if (objective.responsible.length > 0) {
        const responsibleQuery = `
          INSERT INTO ObjectiveResponsible (ObjectiveID, Name)
          VALUES ${objective.responsible.map((_, i) => `(@objectiveId, @responsible${i})`).join(',')}
        `;

        await DatabaseService.query(responsibleQuery, [
          objectiveId,
          ...objective.responsible
        ]);
      }

      // Insert indicators
      if (objective.indicators.length > 0) {
        for (const indicator of objective.indicators) {
          await this.createIndicator(objectiveId, indicator);
        }
      }

      logger.info('Strategic objective created successfully', { objectiveId });
      return objectiveId;
    } catch (error) {
      logger.error('Failed to create strategic objective', error as Error);
      throw error;
    }
  }

  private static async createIndicator(objectiveId: string, indicator: Indicator): Promise<string> {
    const validation = StrategicValidations.validateIndicatorFormula(indicator);
    if (!validation.isValid) {
      throw new Error(`Invalid indicator: ${JSON.stringify(validation.errors)}`);
    }

    const query = `
      INSERT INTO Indicators (
        ObjectiveID, Name, Formula, BaselineValue,
        TargetValue, CurrentValue, MeasurementFrequency, DataSource
      ) VALUES (
        @objectiveId, @name, @formula, @baselineValue,
        @targetValue, @currentValue, @measurementFrequency, @dataSource
      ) RETURNING IndicatorID;
    `;

    const result = await DatabaseService.query(query, [
      objectiveId,
      indicator.name,
      indicator.formula,
      indicator.baselineValue,
      indicator.targetValue,
      indicator.currentValue,
      indicator.measurementFrequency,
      indicator.dataSource
    ]);

    const indicatorId = result[0].IndicatorID;

    // Insert responsible people
    if (indicator.responsible.length > 0) {
      const responsibleQuery = `
        INSERT INTO IndicatorResponsible (IndicatorID, Name)
        VALUES ${indicator.responsible.map((_, i) => `(@indicatorId, @responsible${i})`).join(',')}
      `;

      await DatabaseService.query(responsibleQuery, [
        indicatorId,
        ...indicator.responsible
      ]);
    }

    return indicatorId;
  }

  static async getObjectiveById(id: string): Promise<StrategicObjective | null> {
    try {
      if (environment.useMockData) {
        return mockStrategicObjectives.find(obj => obj.id === id) || null;
      }

      const query = `
        SELECT 
          o.ObjectiveID as id,
          o.Name as name,
          o.Description as description,
          o.Type as type,
          o.ParentID as parentId,
          o.TargetProgress as targetProgress,
          o.CurrentProgress as currentProgress,
          o.StartDate as startDate,
          o.EndDate as endDate,
          STRING_AGG(r.Name, ',') as responsible,
          (
            SELECT JSON_AGG(json_build_object(
              'id', i.IndicatorID,
              'name', i.Name,
              'formula', i.Formula,
              'baselineValue', i.BaselineValue,
              'targetValue', i.TargetValue,
              'currentValue', i.CurrentValue,
              'measurementFrequency', i.MeasurementFrequency,
              'dataSource', i.DataSource,
              'responsible', (
                SELECT JSON_AGG(ir.Name)
                FROM IndicatorResponsible ir
                WHERE ir.IndicatorID = i.IndicatorID
              )
            ))
            FROM Indicators i
            WHERE i.ObjectiveID = o.ObjectiveID
          ) as indicators
        FROM StrategicObjectives o
        LEFT JOIN ObjectiveResponsible r ON o.ObjectiveID = r.ObjectiveID
        WHERE o.ObjectiveID = @id
        GROUP BY o.ObjectiveID
      `;

      const result = await DatabaseService.query(query, [id]);
      
      if (!result || result.length === 0) {
        return null;
      }

      return {
        ...result[0],
        responsible: result[0].responsible.split(','),
        indicators: result[0].indicators || []
      };
    } catch (error) {
      logger.error('Failed to fetch objective by ID', error as Error, { id });
      throw error;
    }
  }

  static async updateObjectiveProgress(
    id: string,
    progress: number,
    status: string,
    comments: string
  ): Promise<void> {
    try {
      if (environment.useMockData) {
        const objective = mockStrategicObjectives.find(obj => obj.id === id);
        if (objective) {
          objective.currentProgress = progress;
          mockProgressHistory.push({
            objectiveId: id,
            date: new Date().toISOString().split('T')[0],
            progress,
            status,
            comments
          });
        }
        return;
      }

      const updateQuery = `
        UPDATE StrategicObjectives
        SET CurrentProgress = @progress,
            Status = @status,
            LastUpdated = CURRENT_TIMESTAMP
        WHERE ObjectiveID = @id;

        INSERT INTO ProgressHistory (
          ObjectiveID, Progress, Status, Comments, UpdatedAt
        ) VALUES (
          @id, @progress, @status, @comments, CURRENT_TIMESTAMP
        );
      `;

      await DatabaseService.query(updateQuery, [
        progress,
        status,
        id,
        comments
      ]);

      logger.info('Objective progress updated successfully', {
        objectiveId: id,
        progress,
        status
      });
    } catch (error) {
      logger.error('Failed to update objective progress', error as Error, {
        id,
        progress,
        status
      });
      throw error;
    }
  }

  static async getProgressHistory(objectiveId: string): Promise<any[]> {
    try {
      if (environment.useMockData) {
        return mockProgressHistory.filter(h => h.objectiveId === objectiveId);
      }

      const query = `
        SELECT
          ObjectiveID as objectiveId,
          Progress as progress,
          Status as status,
          Comments as comments,
          UpdatedAt as date
        FROM ProgressHistory
        WHERE ObjectiveID = @objectiveId
        ORDER BY UpdatedAt DESC
      `;

      return await DatabaseService.query(query, [objectiveId]);
    } catch (error) {
      logger.error('Failed to fetch progress history', error as Error, { objectiveId });
      throw error;
    }
  }
} 