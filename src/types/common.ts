// Status
export type Status = 
  | 'Aguardando aprovação'
  | 'Não iniciado'
  | 'Em andamento'
  | 'Concluído'
  | 'Suspenso'
  | 'Descontinuado';

// Prioridades
export type Priority = 'Baixa' | 'Média' | 'Alta';

// Tipos de Aprovação
export type ApprovalType = 
  | 'Planejamento'
  | 'Iniciativa'
  | 'Ação'
  | 'Tarefa'
  | 'Fluxo';

// Perfis
export type Profile = 
  | 'Administrador'
  | 'Planejamento'
  | 'PAA'
  | 'Usuário';

// Tipos de Referência
export type ReferenceType = 
  | 'Estratégico'
  | 'Iniciativa'
  | 'Ação'
  | 'Anual';

// Frequências de Medição
export type MeasurementFrequency = 
  | 'Diária'
  | 'Semanal'
  | 'Mensal'
  | 'Trimestral'
  | 'Semestral'
  | 'Anual';

// Tipos de Indicador
export type IndicatorType = 
  | 'Quantitativo'
  | 'Qualitativo';

// Unidade
export interface Unit {
  id: number;
  name: string;
  code: string;
  description: string;
}

// Usuário Base
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  unit: Unit;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Usuário com Perfil
export interface User extends BaseUser {
  profile: Profile;
  permissions: string[];
}

// Aprovador
export interface Approver extends BaseUser {
  role: string;
  timeLimit?: number;
  notifications: boolean;
}

// Medição de Indicador
export interface Measurement {
  id: number;
  value: number;
  date: string;
  observations?: string;
  attachments?: string[];
  responsible: string;
}

// Meta de Indicador
export interface Goal {
  id: number;
  targetValue: number;
  startDate: string;
  endDate: string;
  referenceType: ReferenceType;
  referenceId: number;
  minimumTolerance: number;
  maximumTolerance: number;
}

// Peso para Cálculos
export interface Weight {
  id: number;
  value: number;
  type: string;
  referenceId: number;
}

// Configurações do Sistema
export interface SystemConfig {
  measurementPrecision: number;
  timezone: string;
  dateFormat: string;
  calculationRules: {
    progressWeight: number;
    qualityWeight: number;
    deadlineWeight: number;
  };
  notificationLimits: {
    daysInAdvance: number;
    criticalPercentage: number;
  };
}

// Histórico de Alterações
export interface ChangeHistory {
  id: number;
  entity: string;
  entityId: number;
  changeType: 'Criação' | 'Atualização' | 'Exclusão';
  changeDate: string;
  userId: string;
  previousValue?: any;
  newValue?: any;
}

// Cálculos de Progresso
export interface ProgressCalculation {
  progress: number;
  quality: number;
  deadline: number;
  totalProgress: number;
  calculationDate: string;
}

// Histórico de Alterações
export type ChangeType = 'Criação' | 'Atualização' | 'Exclusão';

// Status do Sistema
export type SystemStatus = 'Ativo' | 'Manutenção' | 'Erro';