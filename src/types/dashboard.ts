// Tipos para o CycleStatus
export interface CycleData {
  currentCycle: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'Em andamento' | 'Concluído' | 'Pendente';
  lastUpdate: string;
}

// Tipos para o KPISection
export interface KPIData {
  id: string;
  title: string;
  value: number;
  target: number;
  trend: 'up' | 'down';
  variation: number;
  history: number[];
}

// Tipos para o PAASection
export interface PAAData {
  currentYear: string;
  progress: number;
  initiatives: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    delayed: number;
  };
  goals: {
    total: number;
    achieved: number;
    onTrack: number;
    atRisk: number;
  };
  performance: Array<{
    month: string;
    value: number;
  }>;
}

// Tipos para o StrategicSection
export interface StrategicData {
  perspectives: Array<{
    name: string;
    progress: number;
    objectives: Array<{
      name: string;
      progress: number;
    }>;
  }>;
  indicators: {
    total: number;
    onTarget: number;
    warning: number;
    critical: number;
  };
}

// Tipos para Alertas
export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  description: string;
  date: string;
  isRead: boolean;
}

// Props dos Componentes
export interface CycleStatusProps {
  data: CycleData;
}

export interface KPISectionProps {
  data: KPIData[];
  period: string;
  onPeriodChange: (period: string) => void;
}

export interface PAAMetricsProps {
  data: PAAData;
}

export interface StrategicOverviewProps {
  data: StrategicData;
}

export interface AlertsSectionProps {
  alerts: Alert[];
  onMarkAsRead: (id: string) => void;
}

// Métricas do Dashboard
export interface DashboardMetrics {
  initiatives: {
    total: number;
    concluidas: number;
    emAndamento: number;
    atrasadas: number;
  };
  tasks: {
    total: number;
    concluidas: number;
    emAndamento: number;
    atrasadas: number;
  };
  indicators: {
    total: number;
    naMeta: number;
    atencao: number;
    critico: number;
  };
}

// Tipos para Atividades
export interface Activity {
  id: number;
  type: 'Tarefa' | 'Iniciativa' | 'Indicador';
  description: string;
  user: string;
  date: string;
  status: 'Em andamento' | 'Concluído' | 'Pendente';
}

// Tipos para Prazos
export interface Deadline {
  id: number;
  type: 'Tarefa' | 'Iniciativa';
  name: string;
  dueDate: string;
  owner: string;
  status: 'Em andamento' | 'Atrasado' | 'Concluído';
}

// Tipos para Dados de Progresso
export interface ProgressData {
  week: string;
  planejado: number;
  realizado: number;
}

// Tipos para Conclusão de Tarefas
export interface TaskCompletionData {
  noPrazo: number;
  atrasadas: number;
}

// Interface Principal do Dashboard
export interface DashboardData {
  metrics: DashboardMetrics;
  recentActivities: Activity[];
  upcomingDeadlines: Deadline[];
  progressHistory: ProgressData[];
  taskCompletion: TaskCompletionData;
  resourceUtilization: number;
} 