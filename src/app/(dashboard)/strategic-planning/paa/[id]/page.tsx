'use client';

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common/Icons';
import { PAADetails } from '@/components/strategic-planning/PAADetails';

// Mock data - Deve ser substituído por dados reais da API
const mockPAAData = {
  year: 2024,
  kpis: [
    {
      id: 'kpi1',
      title: 'Iniciativas Concluídas',
      value: 12,
      target: 20,
      unit: 'un',
      trend: 'up' as const,
      status: 'success' as const,
    },
    {
      id: 'kpi2',
      title: 'Progresso Geral',
      value: 65,
      target: 100,
      unit: '%',
      trend: 'up' as const,
      status: 'warning' as const,
    },
    {
      id: 'kpi3',
      title: 'Orçamento Utilizado',
      value: 850000,
      target: 1000000,
      unit: 'R$',
      trend: 'up' as const,
      status: 'success' as const,
    },
    {
      id: 'kpi4',
      title: 'Prazo Médio',
      value: 45,
      target: 30,
      unit: 'dias',
      trend: 'down' as const,
      status: 'danger' as const,
    },
  ],
  areaInitiatives: [
    { area: 'TI', count: 8 },
    { area: 'RH', count: 5 },
    { area: 'Financeiro', count: 4 },
    { area: 'Jurídico', count: 6 },
    { area: 'Administrativo', count: 7 },
  ],
  treeData: [
    {
      id: 'action1',
      name: 'Transformação Digital',
      type: 'action',
      progress: 75,
      children: [
        {
          id: 'init1',
          name: 'Digitalização de Processos',
          type: 'initiative',
          progress: 85,
        },
        {
          id: 'init2',
          name: 'Modernização da Infraestrutura',
          type: 'initiative',
          progress: 65,
        },
      ],
    },
    {
      id: 'action2',
      name: 'Desenvolvimento de Pessoas',
      type: 'action',
      progress: 60,
      children: [
        {
          id: 'init3',
          name: 'Programa de Capacitação',
          type: 'initiative',
          progress: 70,
        },
        {
          id: 'init4',
          name: 'Gestão por Competências',
          type: 'initiative',
          progress: 50,
        },
      ],
    },
  ],
};

export default function PAAPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => router.back()}
          sx={{ mr: 2 }}
        >
          <Icon name="back" />
        </IconButton>
        <Typography variant="h4">
          Plano Anual de Ação {mockPAAData.year}
        </Typography>
      </Box>

      {/* Conteúdo */}
      <PAADetails {...mockPAAData} />
    </Box>
  );
} 