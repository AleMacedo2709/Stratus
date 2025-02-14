export type Status = 'No prazo' | 'Em risco' | 'Atrasado' | 'Concluído' | 'Ativo' | 'Planejado';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type ObjectiveType = 'strategic' | 'tactical' | 'operational';

interface BaseStrategicItem {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: Status;
  startDate: string;
  endDate: string;
  responsible: string;
  order?: number;
}

export interface Perspective extends BaseStrategicItem {
  programs: Program[];
}

export interface Program extends BaseStrategicItem {
  perspectiveId: string;
  strategicActions: StrategicAction[];
}

export interface StrategicAction extends BaseStrategicItem {
  programId: string;
  indicators: Indicator[];
  annualInitiatives: Initiative[];
}

export interface Indicator {
  id: string;
  actionId: string;
  name: string;
  description: string;
  unit: string;
  frequency: Frequency;
  baseline: number;
  target: number;
  current: number;
  status: Status;
  responsible: string;
  lastUpdate: string;
  formula?: string;
  history?: IndicatorHistory[];
}

export interface IndicatorHistory {
  indicatorId: string;
  date: string;
  value: number;
}

export interface Initiative {
  id: string;
  actionId: string;
  name: string;
  description: string;
  type: 'PLANNING' | 'NON_PLANNING' | 'CONTINUOUS';
  status: Status;
  progress: number;
  responsible: string;
  startDate: string;
  endDate: string;
}

export interface StrategicCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: Status;
  progress?: number;
  mission?: string;
  vision?: string;
  values?: string[];
}

export const strategicCycle2025_2030: StrategicCycle = {
  id: 'cycle-2025-2030',
  name: 'Ciclo 2025-2030',
  startDate: '2025-01-01',
  endDate: '2030-12-31',
  status: 'planned'
};

export type Priority = 'Baixa' | 'Média' | 'Alta';

export type ObjectiveStatus = 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Cancelado';

export type RiskSeverity = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type RiskProbability = 'Baixa' | 'Média' | 'Alta';

export type RiskStatus = 'Ativo' | 'Reconhecido' | 'Resolvido';