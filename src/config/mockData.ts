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

export const mockStrategicCycles: StrategicCycle[] = [
  {
    id: '1',
    name: 'Ciclo Estratégico 2024-2027',
    description: 'Ciclo estratégico principal',
    startDate: '2024-01-01',
    endDate: '2027-12-31',
    status: 'in_progress',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockPerspectives: Perspective[] = [
  {
    id: '1',
    name: 'Sociedade',
    description: 'Impacto na sociedade',
    order: 1,
    strategicCycleId: '1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Processos Internos',
    description: 'Melhoria dos processos',
    order: 2,
    strategicCycleId: '1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockPrograms: Program[] = [
  {
    id: '1',
    name: 'Programa de Modernização',
    description: 'Modernização dos serviços',
    order: 1,
    perspectiveId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockStrategicActions: StrategicAction[] = [
  {
    id: '1',
    name: 'Implementar Sistema Digital',
    description: 'Digitalização dos processos',
    order: 1,
    programId: '1',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'in_progress',
    currentProgress: 0,
    expectedProgress: 25,
    responsible: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockStrategicObjectives: StrategicObjective[] = [
  {
    id: '1',
    name: 'Aumentar Eficiência',
    description: 'Melhorar a eficiência operacional',
    type: 'strategic',
    status: 'in_progress',
    progress: 0,
    parentId: null,
    responsible: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockIndicators: Indicator[] = [
  {
    id: '1',
    name: 'Taxa de Digitalização',
    description: 'Percentual de processos digitalizados',
    unit: 'percentage',
    currentValue: 0,
    targetValue: 100,
    baselineValue: 0,
    frequency: 'monthly',
    responsible: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockInitiatives: Initiative[] = [
  {
    id: '1',
    name: 'Projeto de Digitalização',
    description: 'Implementação da digitalização',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'in_progress',
    currentProgress: 0,
    expectedProgress: 25,
    responsible: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockRisks: Risk[] = [
  {
    id: '1',
    name: 'Resistência à Mudança',
    description: 'Resistência dos usuários',
    probability: 'medium',
    impact: 'high',
    severity: 'high',
    status: 'active',
    mitigation: 'Treinamento e comunicação',
    contingency: 'Suporte intensivo',
    responsible: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockPAAs: PAA[] = [
  {
    id: '1',
    name: 'PAA 2024',
    description: 'Plano Anual de Ação 2024',
    year: 2024,
    status: 'in_progress',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]; 