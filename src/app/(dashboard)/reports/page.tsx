'use client';

import React, { useState } from 'react';
import { Box, Container, Tabs, Tab } from '@mui/material';
import { StrategicReport } from '@/components/reports/StrategicReport';
import { AnalyticsDashboard } from '@/components/reports/AnalyticsDashboard';
import { ProgressHistory } from '@/components/reports/ProgressHistory';
import { Icon } from '@/components/common/Icons';

// Mock data for strategic report
const mockKPIs = [
  {
    id: 1,
    name: 'Taxa de Conclusão',
    value: 75,
    target: 100,
    unit: '%',
    trend: 'up' as const,
    status: 'success' as const,
  },
  {
    id: 2,
    name: 'Prazo Médio',
    value: 45,
    target: 30,
    unit: ' dias',
    trend: 'down' as const,
    status: 'warning' as const,
  },
  {
    id: 3,
    name: 'Qualidade',
    value: 92,
    target: 95,
    unit: '%',
    trend: 'up' as const,
    status: 'success' as const,
  },
  {
    id: 4,
    name: 'Eficiência',
    value: 68,
    target: 80,
    unit: '%',
    trend: 'stable' as const,
    status: 'warning' as const,
  },
];

const mockPerformanceData = [
  { period: 'Jan', actual: 65, target: 70, variance: -5 },
  { period: 'Fev', actual: 68, target: 70, variance: -2 },
  { period: 'Mar', actual: 72, target: 75, variance: -3 },
  { period: 'Abr', actual: 75, target: 75, variance: 0 },
  { period: 'Mai', actual: 78, target: 80, variance: -2 },
  { period: 'Jun', actual: 82, target: 80, variance: 2 },
];

const mockPerspectiveProgress = [
  { name: 'Financeira', progress: 85, target: 90 },
  { name: 'Clientes', progress: 72, target: 80 },
  { name: 'Processos', progress: 68, target: 75 },
  { name: 'Aprendizado', progress: 78, target: 85 },
];

// Mock data for analytics dashboard
const mockAnalyticsData = {
  timeSeriesData: [
    { period: 'Jan', value: 65 },
    { period: 'Fev', value: 68 },
    { period: 'Mar', value: 72 },
    { period: 'Abr', value: 75 },
    { period: 'Mai', value: 78 },
    { period: 'Jun', value: 82 },
  ],
  distributionData: [
    { name: 'Financeira', value: 35 },
    { name: 'Clientes', value: 25 },
    { name: 'Processos', value: 20 },
    { name: 'Aprendizado', value: 20 },
  ],
  radarData: [
    { subject: 'Eficiência', value: 85, fullMark: 100 },
    { subject: 'Qualidade', value: 92, fullMark: 100 },
    { subject: 'Inovação', value: 78, fullMark: 100 },
    { subject: 'Produtividade', value: 88, fullMark: 100 },
    { subject: 'Satisfação', value: 75, fullMark: 100 },
  ],
};

// Mock data for progress history
const mockMilestones = [
  {
    id: 1,
    title: 'Início do Projeto',
    description: 'Lançamento oficial do projeto estratégico',
    date: '2024-01-15',
    status: 'completed' as const,
    progress: 100,
    impact: ['Todos os Setores'],
  },
  {
    id: 2,
    title: 'Fase de Planejamento',
    description: 'Definição de metas e indicadores',
    date: '2024-02-01',
    status: 'completed' as const,
    progress: 100,
    impact: ['Planejamento', 'Gestão'],
  },
  {
    id: 3,
    title: 'Implementação',
    description: 'Execução das ações estratégicas',
    date: '2024-03-15',
    status: 'in_progress' as const,
    progress: 65,
    impact: ['Operações', 'TI'],
  },
  {
    id: 4,
    title: 'Avaliação de Resultados',
    description: 'Análise dos indicadores e ajustes',
    date: '2024-06-30',
    status: 'planned' as const,
    progress: 0,
    impact: ['Gestão', 'Qualidade'],
  },
];

const mockProgressData = [
  { period: 'Jan', planned: 20, actual: 18 },
  { period: 'Fev', planned: 40, actual: 35 },
  { period: 'Mar', planned: 60, actual: 55 },
  { period: 'Abr', planned: 80, actual: 72 },
  { period: 'Mai', planned: 90, actual: 85 },
  { period: 'Jun', planned: 100, actual: 92 },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `reports-tab-${index}`,
    'aria-controls': `reports-tabpanel-${index}`,
  };
}

export default function ReportsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="reports views"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<Icon name="cycleGoal" size="sm" />}
            iconPosition="start"
            label="Estratégico"
            {...a11yProps(0)}
          />
          <Tab
            icon={<Icon name="report" size="sm" />}
            iconPosition="start"
            label="Analítico"
            {...a11yProps(1)}
          />
          <Tab
            icon={<Icon name="progress" size="sm" />}
            iconPosition="start"
            label="Histórico"
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <StrategicReport
          kpis={mockKPIs}
          performanceData={mockPerformanceData}
          perspectiveProgress={mockPerspectiveProgress}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AnalyticsDashboard data={mockAnalyticsData} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <ProgressHistory
          milestones={mockMilestones}
          progressData={mockProgressData}
        />
      </TabPanel>
    </Container>
  );
} 