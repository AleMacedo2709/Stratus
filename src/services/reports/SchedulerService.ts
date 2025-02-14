import { logger } from '../monitoring/logger';
import { ReportSchedule, ReportParameters, ReportFormat } from './types';
import { DatabaseService } from '../database/DatabaseService';
import { environment } from '@/config/environment';

export class SchedulerService {
  private static tableName = 'ReportSchedules';

  static async scheduleReport(
    reportId: string,
    schedule: ReportSchedule,
    userId: string
  ): Promise<void> {
    if (environment.useMockData) {
      return;
    }

    try {
      const query = `
        INSERT INTO ${this.tableName} (
          reportId, frequency, day, time, timezone,
          parameters, format, recipients, createdBy
        )
        VALUES (
          @param0, @param1, @param2, @param3, @param4,
          @param5, @param6, @param7, @param8
        );
      `;

      const params = [
        reportId,
        schedule.frequency,
        schedule.day,
        schedule.time,
        schedule.timezone,
        JSON.stringify(schedule.parameters),
        JSON.stringify(schedule.format),
        JSON.stringify(schedule.recipients),
        userId
      ];

      await DatabaseService.query(query, params);
      logger.info('Report scheduled successfully', { reportId, schedule });
    } catch (error) {
      logger.error('Error scheduling report', { error });
      throw error;
    }
  }

  static async getScheduledReports(userId: string): Promise<ReportSchedule[]> {
    if (environment.useMockData) {
      return [];
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE createdBy = @param0
        AND deletedAt IS NULL;
      `;
      const results = await DatabaseService.query<any>(query, [userId]);
      
      return results.map(result => ({
        ...result,
        parameters: JSON.parse(result.parameters),
        format: JSON.parse(result.format),
        recipients: JSON.parse(result.recipients)
      }));
    } catch (error) {
      logger.error('Error fetching scheduled reports', { error });
      throw error;
    }
  }

  static async updateSchedule(
    scheduleId: string,
    updates: Partial<ReportSchedule>,
    userId: string
  ): Promise<void> {
    if (environment.useMockData) {
      return;
    }

    try {
      const setStatements = [];
      const params = [];
      let paramIndex = 0;

      if (updates.frequency) {
        setStatements.push(`frequency = @param${paramIndex}`);
        params.push(updates.frequency);
        paramIndex++;
      }

      if (updates.day !== undefined) {
        setStatements.push(`day = @param${paramIndex}`);
        params.push(updates.day);
        paramIndex++;
      }

      if (updates.time) {
        setStatements.push(`time = @param${paramIndex}`);
        params.push(updates.time);
        paramIndex++;
      }

      if (updates.timezone) {
        setStatements.push(`timezone = @param${paramIndex}`);
        params.push(updates.timezone);
        paramIndex++;
      }

      if (updates.parameters) {
        setStatements.push(`parameters = @param${paramIndex}`);
        params.push(JSON.stringify(updates.parameters));
        paramIndex++;
      }

      if (updates.format) {
        setStatements.push(`format = @param${paramIndex}`);
        params.push(JSON.stringify(updates.format));
        paramIndex++;
      }

      if (updates.recipients) {
        setStatements.push(`recipients = @param${paramIndex}`);
        params.push(JSON.stringify(updates.recipients));
        paramIndex++;
      }

      if (setStatements.length === 0) {
        return;
      }

      const query = `
        UPDATE ${this.tableName}
        SET ${setStatements.join(', ')}, updatedAt = GETDATE()
        WHERE id = @param${paramIndex} 
        AND createdBy = @param${paramIndex + 1}
        AND deletedAt IS NULL;
      `;

      params.push(scheduleId, userId);
      await DatabaseService.query(query, params);
      
      logger.info('Schedule updated successfully', { scheduleId, updates });
    } catch (error) {
      logger.error('Error updating schedule', { error });
      throw error;
    }
  }

  static async deleteSchedule(scheduleId: string, userId: string): Promise<void> {
    if (environment.useMockData) {
      return;
    }

    try {
      const query = `
        UPDATE ${this.tableName}
        SET deletedAt = GETDATE()
        WHERE id = @param0 
        AND createdBy = @param1
        AND deletedAt IS NULL;
      `;

      await DatabaseService.query(query, [scheduleId, userId]);
      logger.info('Schedule deleted successfully', { scheduleId });
    } catch (error) {
      logger.error('Error deleting schedule', { error });
      throw error;
    }
  }
} 