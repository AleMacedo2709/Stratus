import { logger } from '../monitoring/logger';
import { environment } from '@/config/environment';
import { mockReports } from '@/data/mock/reports';
import { StrategicPlanningService } from '../strategic/StrategicPlanningService';
import { StrategicCalculationService } from '../strategic/StrategicCalculationService';
import { 
  ReportParameters, 
  ReportTemplate, 
  ReportFormat, 
  ReportContent 
} from './types';

export interface ReportParameters {
  period?: {
    start: Date;
    end: Date;
  };
  objectiveTypes?: string[];
  indicators?: string[];
  compareWithPrevious?: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  sections: Array<{
    name: string;
    content: string[];
  }>;
}

export interface ReportFormat {
  type: 'pdf' | 'excel' | 'powerpoint';
  options?: {
    template?: string;
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'A4' | 'letter';
    includeCharts?: boolean;
    includeRawData?: boolean;
  };
}

export class ReportService {
  static async generateReport(
    reportId: string,
    parameters: ReportParameters,
    format: ReportFormat,
    userId: string
  ): Promise<string> {
    try {
      // Get report configuration
      const reportConfig = await this.getReportConfiguration(reportId);
      
      // Gather data
      const data = await this.gatherReportData(reportConfig, parameters);
      
      // Apply template
      const template = await this.getReportTemplate(reportConfig.type, format.type);
      
      // Generate report content
      const content = await this.generateReportContent(data, template, format);
      
      // Save report
      const reportUrl = await this.saveReport(content, format, userId);

      logger.info('Report generated successfully', {
        reportId,
        userId,
        format: format.type
      });

      return reportUrl;
    } catch (error) {
      logger.error('Failed to generate report', error as Error, {
        reportId,
        parameters,
        format,
        userId
      });
      throw error;
    }
  }

  private static async getReportConfiguration(reportId: string): Promise<any> {
    if (environment.useMockData) {
      return mockReports.available.find(r => r.id === reportId);
    }

    const response = await fetch(`${environment.apiUrl}/reports/${reportId}/configuration`);
    return await response.json();
  }

  private static async gatherReportData(
    config: any,
    parameters: ReportParameters
  ): Promise<any> {
    const data: any = {};

    switch (config.type) {
      case 'strategic':
        data.objectives = await StrategicPlanningService.getStrategicObjectives();
        
        if (parameters.objectiveTypes) {
          data.objectives = data.objectives.filter((obj: any) =>
            parameters.objectiveTypes?.includes(obj.type)
          );
        }

        // Calculate performance scores
        data.performance = await Promise.all(
          data.objectives.map(async (obj: any) => ({
            objectiveId: obj.id,
            score: await StrategicCalculationService.calculatePerformanceScore(obj.id)
          }))
        );

        break;

      case 'indicators':
        if (!parameters.indicators?.length) {
          throw new Error('No indicators specified for indicators report');
        }

        data.indicators = await Promise.all(
          parameters.indicators.map(async (id) => {
            const values = await this.getIndicatorValues(id, parameters.period);
            return {
              id,
              values,
              trend: this.calculateTrend(values)
            };
          })
        );

        if (parameters.compareWithPrevious) {
          data.previousPeriod = await this.getPreviousPeriodData(
            parameters.indicators,
            parameters.period
          );
        }

        break;
    }

    return data;
  }

  private static async getIndicatorValues(
    indicatorId: string,
    period?: { start: Date; end: Date }
  ): Promise<any[]> {
    const query = `
      SELECT 
        MeasurementDate,
        Value,
        Target
      FROM IndicatorValues
      WHERE IndicatorID = @indicatorId
      ${period ? 'AND MeasurementDate BETWEEN @start AND @end' : ''}
      ORDER BY MeasurementDate
    `;

    if (environment.useMockData) {
      return [
        { date: '2024-01-01', value: 80, target: 100 },
        { date: '2024-02-01', value: 85, target: 100 },
        { date: '2024-03-01', value: 90, target: 100 }
      ];
    }

    const response = await fetch(
      `${environment.apiUrl}/indicators/${indicatorId}/values${
        period ? `?start=${period.start.toISOString()}&end=${period.end.toISOString()}` : ''
      }`
    );
    return await response.json();
  }

  private static calculateTrend(values: any[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';

    const last = values[values.length - 1].value;
    const previous = values[values.length - 2].value;

    if (last > previous * 1.05) return 'up';
    if (last < previous * 0.95) return 'down';
    return 'stable';
  }

  private static async getPreviousPeriodData(
    indicators: string[],
    period?: { start: Date; end: Date }
  ): Promise<any> {
    if (!period) return null;

    const periodLength = period.end.getTime() - period.start.getTime();
    const previousStart = new Date(period.start.getTime() - periodLength);
    const previousEnd = new Date(period.end.getTime() - periodLength);

    return await Promise.all(
      indicators.map(async (id) => {
        const values = await this.getIndicatorValues(id, {
          start: previousStart,
          end: previousEnd
        });
        return { id, values };
      })
    );
  }

  private static async getReportTemplate(
    type: string,
    format: string
  ): Promise<ReportTemplate> {
    if (environment.useMockData) {
      return mockReports.templates[0];
    }

    const response = await fetch(
      `${environment.apiUrl}/reports/templates/${type}/${format}`
    );
    return await response.json();
  }

  private static async generateReportContent(
    data: any,
    template: ReportTemplate,
    format: ReportFormat
  ): Promise<any> {
    // Process each section according to template
    const sections = await Promise.all(
      template.sections.map(async (section) => ({
        name: section.name,
        content: await this.generateSectionContent(section, data, format)
      }))
    );

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        template: template.id,
        format: format.type
      },
      sections
    };
  }

  private static async generateSectionContent(
    section: any,
    data: any,
    format: ReportFormat
  ): Promise<any> {
    // Generate content based on section type and format
    const content: any = {};

    for (const contentType of section.content) {
      switch (contentType) {
        case 'summary':
          content.summary = this.generateSummary(data);
          break;
        case 'progress_chart':
          content.progressChart = await this.generateChart(
            data,
            'progress',
            format.options?.includeCharts
          );
          break;
        case 'key_metrics':
          content.keyMetrics = this.generateKeyMetrics(data);
          break;
        case 'objectives_table':
          content.objectivesTable = this.generateObjectivesTable(data);
          break;
        case 'indicators_detail':
          content.indicatorsDetail = this.generateIndicatorsDetail(data);
          break;
        case 'risks_summary':
          content.risksSummary = this.generateRisksSummary(data);
          break;
      }
    }

    return content;
  }

  private static generateSummary(data: any): any {
    // Implement summary generation logic
    return {
      totalObjectives: data.objectives?.length || 0,
      averageProgress: this.calculateAverageProgress(data.objectives),
      keyAchievements: this.identifyKeyAchievements(data)
    };
  }

  private static calculateAverageProgress(objectives: any[]): number {
    if (!objectives?.length) return 0;
    return objectives.reduce((sum, obj) => sum + obj.currentProgress, 0) / objectives.length;
  }

  private static identifyKeyAchievements(data: any): string[] {
    const achievements = [];
    
    if (data.objectives) {
      const completedObjectives = data.objectives.filter(
        (obj: any) => obj.currentProgress >= 100
      );
      if (completedObjectives.length > 0) {
        achievements.push(
          `${completedObjectives.length} objetivos concluídos com sucesso`
        );
      }
    }

    if (data.indicators) {
      const achievedTargets = data.indicators.filter(
        (ind: any) => ind.values[ind.values.length - 1].value >= ind.values[ind.values.length - 1].target
      );
      if (achievedTargets.length > 0) {
        achievements.push(
          `${achievedTargets.length} indicadores atingiram suas metas`
        );
      }
    }

    return achievements;
  }

  private static async generateChart(
    data: any,
    type: string,
    includeCharts?: boolean
  ): Promise<any> {
    if (!includeCharts) return null;

    // Implement chart generation logic
    const chartData = {
      type,
      data: this.prepareChartData(data, type),
      options: this.getChartOptions(type)
    };

    return chartData;
  }

  private static prepareChartData(data: any, type: string): any {
    switch (type) {
      case 'progress':
        return {
          labels: data.objectives?.map((obj: any) => obj.name) || [],
          datasets: [
            {
              label: 'Progresso',
              data: data.objectives?.map((obj: any) => obj.currentProgress) || []
            }
          ]
        };
      default:
        return {};
    }
  }

  private static getChartOptions(type: string): any {
    // Implement chart options based on type
    return {
      responsive: true,
      maintainAspectRatio: false,
      // Add more options based on chart type
    };
  }

  private static generateKeyMetrics(data: any): any {
    return {
      performance: {
        average: this.calculateAverageProgress(data.objectives),
        trend: this.calculateTrend(data.performance || [])
      },
      risks: {
        total: data.risks?.length || 0,
        critical: data.risks?.filter((r: any) => r.severity > 0.7).length || 0
      },
      resources: {
        utilization: data.resources?.utilization || 0,
        efficiency: data.resources?.efficiency || 0
      }
    };
  }

  private static generateObjectivesTable(data: any): any {
    return data.objectives?.map((obj: any) => ({
      id: obj.id,
      name: obj.name,
      type: obj.type,
      progress: obj.currentProgress,
      status: this.calculateStatus(obj),
      responsible: obj.responsible
    }));
  }

  private static calculateStatus(objective: any): string {
    if (objective.currentProgress >= 100) return 'completed';
    if (objective.currentProgress >= objective.targetProgress) return 'on_track';
    if (objective.currentProgress >= objective.targetProgress * 0.8) return 'at_risk';
    return 'behind';
  }

  private static generateIndicatorsDetail(data: any): any {
    return data.indicators?.map((ind: any) => ({
      id: ind.id,
      name: ind.name,
      currentValue: ind.values[ind.values.length - 1].value,
      target: ind.values[ind.values.length - 1].target,
      trend: ind.trend,
      history: ind.values
    }));
  }

  private static generateRisksSummary(data: any): any {
    return {
      distribution: this.calculateRiskDistribution(data.risks),
      topRisks: this.identifyTopRisks(data.risks)
    };
  }

  private static calculateRiskDistribution(risks: any[]): any {
    if (!risks?.length) return {};

    return {
      high: risks.filter((r) => r.severity > 0.7).length,
      medium: risks.filter((r) => r.severity > 0.3 && r.severity <= 0.7).length,
      low: risks.filter((r) => r.severity <= 0.3).length
    };
  }

  private static identifyTopRisks(risks: any[]): any[] {
    if (!risks?.length) return [];

    return risks
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 5)
      .map((risk) => ({
        id: risk.id,
        description: risk.description,
        severity: risk.severity,
        mitigation: risk.mitigation
      }));
  }

  private static async saveReport(
    content: any,
    format: ReportFormat,
    userId: string
  ): Promise<string> {
    // Save report content and get download URL
    const response = await fetch(`${environment.apiUrl}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        format,
        userId
      })
    });

    const result = await response.json();
    return result.downloadUrl;
  }

  static async scheduleReport(
    reportId: string,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      day?: number;
      time: string;
      timezone: string;
    },
    parameters: ReportParameters,
    format: ReportFormat,
    recipients: Array<{ id: string; email: string }>,
    userId: string
  ): Promise<void> {
    try {
      await fetch(`${environment.apiUrl}/reports/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          schedule,
          parameters,
          format,
          recipients,
          userId
        })
      });

      logger.info('Report scheduled successfully', {
        reportId,
        schedule,
        userId
      });
    } catch (error) {
      logger.error('Failed to schedule report', error as Error, {
        reportId,
        schedule,
        userId
      });
      throw error;
    }
  }

  static async getScheduledReports(userId: string): Promise<any[]> {
    try {
      if (environment.useMockData) {
        return mockReports.scheduled;
      }

      const response = await fetch(`${environment.apiUrl}/reports/scheduled?userId=${userId}`);
      return await response.json();
    } catch (error) {
      logger.error('Failed to fetch scheduled reports', error as Error, { userId });
      throw error;
    }
  }

  static async updateReportSchedule(
    scheduleId: string,
    updates: any,
    userId: string
  ): Promise<void> {
    try {
      await fetch(`${environment.apiUrl}/reports/schedule/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      logger.info('Report schedule updated successfully', {
        scheduleId,
        userId
      });
    } catch (error) {
      logger.error('Failed to update report schedule', error as Error, {
        scheduleId,
        updates,
        userId
      });
      throw error;
    }
  }
} 