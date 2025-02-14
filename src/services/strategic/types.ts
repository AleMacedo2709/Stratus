import { StrategicObjective, Indicator } from '@/types/strategic-planning';

export interface CalculationResult {
  value: number;
  metadata: {
    formula: string;
    variables: Record<string, number>;
    intermediateResults?: Record<string, number>;
  };
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

export interface RiskExposure {
  exposure: number;
  factors: Array<{
    id: string;
    name: string;
    impact: number;
    probability: number;
    contribution: number;
  }>;
}

export interface ResourceUtilization {
  utilization: number;
  breakdown: {
    human: number;
    financial: number;
    technological: number;
  };
  details: Array<{
    resourceId: string;
    type: 'human' | 'financial' | 'technological';
    allocated: number;
    used: number;
    efficiency: number;
  }>;
}

export interface PerformanceScore {
  score: number;
  components: {
    progress: number;
    efficiency: number;
    quality: number;
    impact: number;
  };
  details: Array<{
    metricId: string;
    name: string;
    weight: number;
    score: number;
    contribution: number;
  }>;
} 