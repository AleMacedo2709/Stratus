'use client';

import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Card } from '@/components/common/Card';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Icon } from '@/components/common/Icons';
import { StrategicTree } from '@/components/strategic-planning/StrategicTree';
import { CycleSelector } from '@/components/strategic-planning/CycleSelector';
import { PAACards } from '@/components/strategic-planning/PAACards';
import { mockPerspectives, mockPrograms, mockActions } from '@/data/strategic-planning';
import { strategicCycle2025_2030, StrategicCycle } from '@/types/strategic-planning';
import { colors } from '@/styles/colors';
import { IndicatorsTable } from '@/components/strategic-planning/IndicatorsTable';
import { mockIndicators } from '@/data/strategic-planning';
import { StrategicCycleModal } from '@/components/strategic-planning/modals/StrategicCycleModal';
import { ActionButton } from '@/components/common/ActionButton';

// Mock data para os ciclos estratégicos
const mockCycles: StrategicCycle[] = [
  strategicCycle2025_2030,
  {
    id: '2019-2024',
    name: 'Ciclo Estratégico 2019-2024',
    startDate: '2019-01-01',
    endDate: '2024-12-31',
    status: 'completed' as const,
    mission: 'Missão anterior...',
    vision: 'Visão anterior...',
    values: ['Valor 1', 'Valor 2', 'Valor 3']
  }
];

// Mock data para os PAAs
const mockPAAs = [
  {
    id: 'paa-2025',
    year: 2025,
    progress: 65,
    totalInitiatives: 30,
    completedInitiatives: 12,
    inProgressInitiatives: 15,
    pendingInitiatives: 3
  },
  {
    id: 'paa-2026',
    year: 2026,
    progress: 25,
    totalInitiatives: 25,
    completedInitiatives: 5,
    inProgressInitiatives: 10,
    pendingInitiatives: 10
  }
];

export default function StrategicPlanningPage() {
  const [selectedCycle, setSelectedCycle] = useState(strategicCycle2025_2030.id);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const currentCycle = mockCycles.find(cycle => cycle.id === selectedCycle) || strategicCycle2025_2030;

  const handleCreateCycle = (data: any) => {
    console.log('Criar novo ciclo:', data);
    setIsNewCycleModalOpen(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Seletor de Ciclo e Botão Novo */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CycleSelector
          cycles={mockCycles}
          selectedCycle={selectedCycle}
          onCycleChange={setSelectedCycle}
        />
        <ActionButton
          icon="add"
          label="Novo Ciclo"
          onClick={() => setIsNewCycleModalOpen(true)}
        />
      </Box>

      {/* Missão, Visão e Valores */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            title="Missão"
            icon="mission"
            sx={{ height: '100%' }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="body1">
                {currentCycle.mission}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            title="Visão"
            icon="vision"
            sx={{ height: '100%' }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="body1">
                {currentCycle.vision}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            title="Valores"
            icon="values"
            sx={{ height: '100%' }}
          >
            <Box sx={{ p: 2 }}>
              <ul>
                {(currentCycle.values || []).map((value: string, index: number) => (
                  <li key={index}>
                    <Typography variant="body1">{value}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Controle de Ciclo Estratégico */}
      <Box sx={{ mb: 4 }}>
        <Card
          title={currentCycle.name}
          subtitle={`${currentCycle.startDate} - ${currentCycle.endDate}`}
          icon="cycleGoal"
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <StatusBadge status={currentCycle.status} />
            </Box>
            <ProgressBar
              value={65}
              label="Progresso Geral"
              variant="primary"
            />
          </Box>
        </Card>
      </Box>

      {/* Cards de PAA */}
      <Box sx={{ mb: 4 }}>
        <Card
          title="Planos Anuais de Ação"
          subtitle="Acompanhamento dos PAAs do ciclo"
          icon="calendar-check"
        >
          <Box sx={{ p: 2 }}>
            <PAACards paas={mockPAAs} />
          </Box>
        </Card>
      </Box>

      {/* Árvore Estratégica */}
      <Box sx={{ mb: 4 }}>
        <Card
          title="Mapa Estratégico"
          subtitle="Perspectivas, Programas e Ações Estratégicas"
          icon="perspective"
        >
          <Box sx={{ p: 2 }}>
            <StrategicTree data={{
              perspectives: mockPerspectives,
              programs: mockPrograms,
              actions: mockActions
            }} />
          </Box>
        </Card>
      </Box>

      {/* Metas e Indicadores */}
      <Box>
        <Card
          title="Metas e Indicadores"
          subtitle="Acompanhamento e revisão"
          icon="chart-line"
        >
          <Box sx={{ p: 2 }}>
            <IndicatorsTable indicators={mockIndicators} />
          </Box>
        </Card>
      </Box>

      {/* Modal de Novo Ciclo */}
      <StrategicCycleModal
        open={isNewCycleModalOpen}
        onClose={() => setIsNewCycleModalOpen(false)}
        onSubmit={handleCreateCycle}
      />
    </Box>
  );
} 