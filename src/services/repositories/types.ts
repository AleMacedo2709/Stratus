import { 
  StrategicCycle, 
  Perspective, 
  Program, 
  StrategicAction,
  StrategicObjective,
  Indicator,
  Initiative,
  Risk,
  PAA
} from '@/types/strategic-planning';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface InitiativeEntity extends BaseEntity {
  name: string;
  description?: string;
  type: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  responsible: string;
  objective_id: string;
  budget?: number;
}

export interface PerspectiveEntity extends BaseEntity {
  name: string;
  description?: string;
  type: string;
  status: string;
  progress: number;
  parent_id: string | null;
  responsible: string;
  cycle_id: string;
  start_date: string;
  end_date: string;
}

export interface ProgramEntity extends BaseEntity {
  name: string;
  description?: string;
  type: string;
  status: string;
  progress: number;
  parent_id: string | null;
  responsible: string;
  perspective_id: string;
  start_date: string;
  end_date: string;
}

export interface StrategicObjectiveEntity extends BaseEntity {
  name: string;
  description?: string;
  type: string;
  status: string;
  progress: number;
  parent_id: string | null;
  responsible: string;
  program_id: string;
  start_date: string;
  end_date: string;
  target_progress: number;
  current_progress: number;
  budget?: number;
}

export interface IndicatorEntity extends BaseEntity {
  name: string;
  description?: string;
  formula: string;
  measurement_frequency: string;
  data_source: string;
  target_value: number;
  current_value: number;
  unit: string;
  trend: string;
  objective_id: string;
  responsible: string;
}

export interface RiskEntity extends BaseEntity {
  name: string;
  description?: string;
  type: string;
  severity: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  probability: 'Baixa' | 'Média' | 'Alta';
  impact: 'Baixo' | 'Médio' | 'Alto';
  status: 'Identificado' | 'Em análise' | 'Mitigado' | 'Materializado' | 'Encerrado';
  mitigation_plan?: string;
  contingency_plan?: string;
  responsible: string;
  objective_id: string;
}

export interface StrategicActionEntity extends BaseEntity {
  name: string;
  description?: string;
  type: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  responsible: string;
  program_id: string;
  budget?: number;
}

export interface StrategicCycleEntity extends BaseEntity {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  progress: number;
}

export interface PAAEntity extends BaseEntity {
  name: string;
  description?: string;
  type: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  responsible: string;
  objective_id: string;
  budget?: number;
} 