import { logger } from './logger';
import { DatabaseService } from '../database';
import { environment } from '@/config/environment';

export interface AuditEntry {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  userId: string;
  timestamp: Date;
  changes: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

export interface ObjectiveProgress {
  objectiveId: string;
  currentProgress: number;
  targetProgress: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  lastUpdate: Date;
  indicators: Array<{
    id: string;
    name: string;
    currentValue: number;
    targetValue: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export class StrategicPlanningMonitor {
  private static async saveAuditEntry(entry: AuditEntry): Promise<void> {
    try {
      const query = `
        INSERT INTO AuditLog (
          EntityType, EntityId, Action, UserId,
          Timestamp, Changes, Metadata
        ) VALUES (
          @entityType, @entityId, @action, @userId,
          @timestamp, @changes, @metadata
        )`;

      await DatabaseService.query(query, [
        entry.entityType,
        entry.entityId,
        entry.action,
        entry.userId,
        entry.timestamp,
        JSON.stringify(entry.changes),
        entry.metadata ? JSON.stringify(entry.metadata) : null
      ]);

      logger.info('Audit entry saved successfully', { entry });
    } catch (error) {
      logger.error('Failed to save audit entry', error as Error, { entry });
      throw error;
    }
  }

  static async trackObjectiveProgress(objectiveId: string): Promise<ObjectiveProgress> {
    try {
      const query = `
        SELECT 
          o.ObjectiveID,
          o.Progress as CurrentProgress,
          o.TargetProgress,
          o.Status,
          o.LastUpdated,
          i.IndicatorID,
          i.Name as IndicatorName,
          i.CurrentValue,
          i.TargetValue,
          i.Trend
        FROM StrategicObjectives o
        LEFT JOIN Indicators i ON i.ObjectiveID = o.ObjectiveID
        WHERE o.ObjectiveID = @objectiveId
      `;

      const result = await DatabaseService.query(query, [objectiveId]);
      
      if (!result || result.length === 0) {
        throw new Error(`Objective not found: ${objectiveId}`);
      }

      const progress: ObjectiveProgress = {
        objectiveId,
        currentProgress: result[0].CurrentProgress,
        targetProgress: result[0].TargetProgress,
        status: result[0].Status,
        lastUpdate: result[0].LastUpdated,
        indicators: result.map(row => ({
          id: row.IndicatorID,
          name: row.IndicatorName,
          currentValue: row.CurrentValue,
          targetValue: row.TargetValue,
          trend: row.Trend
        }))
      };

      logger.info('Objective progress tracked successfully', { objectiveId, progress });
      return progress;
    } catch (error) {
      logger.error('Failed to track objective progress', error as Error, { objectiveId });
      throw error;
    }
  }

  static async auditChanges(
    entityType: string,
    entityId: string,
    userId: string,
    changes: Record<string, { old: any; new: any }>,
    metadata?: Record<string, any>
  ): Promise<void> {
    const auditEntry: AuditEntry = {
      entityType,
      entityId,
      action: 'update',
      userId,
      timestamp: new Date(),
      changes,
      metadata
    };

    await this.saveAuditEntry(auditEntry);
  }

  static async calculateRiskScore(objectiveId: string): Promise<number> {
    try {
      const query = `
        SELECT 
          o.Progress,
          o.TargetProgress,
          COUNT(r.RiskID) as RiskCount,
          AVG(r.Severity) as AvgRiskSeverity
        FROM StrategicObjectives o
        LEFT JOIN Risks r ON r.ObjectiveID = o.ObjectiveID
        WHERE o.ObjectiveID = @objectiveId
        GROUP BY o.Progress, o.TargetProgress
      `;

      const result = await DatabaseService.query(query, [objectiveId]);
      
      if (!result || result.length === 0) {
        throw new Error(`Objective not found: ${objectiveId}`);
      }

      const {
        Progress,
        TargetProgress,
        RiskCount,
        AvgRiskSeverity
      } = result[0];

      // Calculate risk score based on progress gap and risk factors
      const progressGap = Math.max(0, TargetProgress - Progress);
      const riskFactor = (RiskCount * (AvgRiskSeverity || 1)) / 10;
      const riskScore = Math.min(100, (progressGap * 0.6) + (riskFactor * 0.4));

      logger.info('Risk score calculated', {
        objectiveId,
        riskScore,
        factors: { progressGap, riskFactor }
      });

      return riskScore;
    } catch (error) {
      logger.error('Failed to calculate risk score', error as Error, { objectiveId });
      throw error;
    }
  }

  static async generatePerformanceReport(
    objectiveId: string,
    period: { start: Date; end: Date }
  ): Promise<any> {
    try {
      const query = `
        SELECT 
          o.Name as ObjectiveName,
          o.Progress,
          o.TargetProgress,
          o.Status,
          i.Name as IndicatorName,
          i.CurrentValue,
          i.TargetValue,
          i.Trend,
          pt.MeasurementDate,
          pt.ActualValue,
          pt.Analysis
        FROM StrategicObjectives o
        LEFT JOIN Indicators i ON i.ObjectiveID = o.ObjectiveID
        LEFT JOIN ProgressTracking pt ON pt.IndicatorID = i.IndicatorID
        WHERE o.ObjectiveID = @objectiveId
        AND pt.MeasurementDate BETWEEN @startDate AND @endDate
        ORDER BY pt.MeasurementDate DESC
      `;

      const result = await DatabaseService.query(query, [
        objectiveId,
        period.start,
        period.end
      ]);

      const report = {
        objectiveId,
        period,
        data: result,
        summary: {
          progressTrend: this.calculateTrend(result),
          recommendations: this.generateRecommendations(result)
        }
      };

      logger.info('Performance report generated', {
        objectiveId,
        period,
        reportSummary: report.summary
      });

      return report;
    } catch (error) {
      logger.error('Failed to generate performance report', error as Error, {
        objectiveId,
        period
      });
      throw error;
    }
  }

  private static calculateTrend(data: any[]): string {
    // Implement trend calculation logic
    return 'stable';
  }

  private static generateRecommendations(data: any[]): string[] {
    // Implement recommendations generation logic
    return ['Recommendation 1', 'Recommendation 2'];
  }
} 