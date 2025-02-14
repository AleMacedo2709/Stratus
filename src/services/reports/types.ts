import { BaseEntity } from '../repositories/types';
import { ChartOptions } from './ChartService';

export interface ReportParameters {
  period?: {
    start: Date;
    end: Date;
  };
  objectiveTypes?: string[];
  indicators?: string[];
  comparison?: {
    enabled: boolean;
    previousPeriod?: boolean;
    customPeriod?: {
      start: Date;
      end: Date;
    };
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  sections: {
    id: string;
    type: 'summary' | 'data' | 'chart' | 'table' | 'text';
    title?: string;
    content?: any;
    chartOptions?: ChartOptions;
  }[];
}

export interface ReportFormat {
  type: 'pdf' | 'excel' | 'powerpoint';
  options?: {
    paperSize?: 'A4' | 'letter';
    orientation?: 'portrait' | 'landscape';
    template?: string;
    includeCharts?: boolean;
    includeTables?: boolean;
  };
}

export interface ReportSchedule extends BaseEntity {
  reportId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  day?: number | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  time: string;
  timezone: string;
  parameters: ReportParameters;
  format: ReportFormat;
  recipients: {
    email: string;
    name?: string;
  }[];
  lastRun?: Date;
  nextRun?: Date;
  status?: 'active' | 'paused' | 'error';
  errorMessage?: string;
}

export interface ReportContent {
  summary?: {
    text: string;
    highlights?: {
      metric: string;
      value: number | string;
      trend?: 'up' | 'down' | 'stable';
      change?: number;
    }[];
  };
  data?: {
    tables: {
      headers: string[];
      rows: any[][];
    }[];
    charts: {
      type: string;
      data: any;
      options: ChartOptions;
    }[];
  };
  recommendations?: {
    text: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }[];
}

export interface Report extends BaseEntity {
  name: string;
  description?: string;
  template: ReportTemplate;
  parameters: ReportParameters;
  format: ReportFormat;
  schedule?: ReportSchedule;
  content?: ReportContent;
  status: 'draft' | 'generated' | 'error';
  generatedAt?: Date;
  generatedBy?: string;
  errorMessage?: string;
} 