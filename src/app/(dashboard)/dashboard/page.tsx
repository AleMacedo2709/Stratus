'use client';

import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Paper, LinearProgress } from '@mui/material';
import { ActionStatusSummary } from '@/components/strategic-planning/ActionStatusSummary';
import { PAACard } from '@/components/strategic-planning/PAACard';
import { StrategicRadar } from '@/components/strategic-planning/StrategicRadar';
import { StrategicPanel } from '@/components/strategic-planning/StrategicPanel';
import { colors } from '@/styles/colors';
import { strategicPlanningData } from '@/data/production/strategic-planning';
import { CycleData, PAAData, StrategicData } from '@/types/dashboard';
import { Perspective } from '@/types/strategic-planning';

export default function DashboardPage() {
  const [cycleData, setCycleData] = useState<CycleData>({
    currentCycle: '2025-2030',
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    progress: 0,
    status: 'pending',
    lastUpdate: new Date().toISOString()
  });

  const [paaData, setPaaData] = useState<PAAData>({
    currentYear: new Date().getFullYear().toString(),
    progress: 0,
    initiatives: {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      delayed: 0
    },
    goals: {
      total: 0,
      achieved: 0,
      onTrack: 0,
      atRisk: 0
    },
    performance: []
  });

  const [strategicData, setStrategicData] = useState<StrategicData>({
    perspectives: strategicPlanningData.perspectives.map((p: Perspective) => ({
      name: p.name,
      progress: p.progress || 0,
      objectives: p.programs?.map(prog => ({
        name: prog.name,
        progress: prog.progress || 0
      })) || []
    })),
    indicators: {
      total: 0,
      onTarget: 0,
      warning: 0,
      critical: 0
    }
  });

  // Função para carregar dados do ciclo
  const loadCycleData = async () => {
    try {
      // TODO: Implementar chamada à API
      // const response = await fetch('/api/strategic/cycle/current');
      // const data = await response.json();
      // setCycleData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do ciclo:', error);
    }
  };

  // Função para carregar dados do PAA
  const loadPAAData = async () => {
    try {
      // TODO: Implementar chamada à API
      // const response = await fetch('/api/strategic/paa/current');
      // const data = await response.json();
      // setPaaData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do PAA:', error);
    }
  };

  // Função para carregar dados estratégicos
  const loadStrategicData = async () => {
    try {
      // TODO: Implementar chamada à API
      // const response = await fetch('/api/strategic/overview');
      // const data = await response.json();
      // setStrategicData(data);
    } catch (error) {
      console.error('Erro ao carregar dados estratégicos:', error);
    }
  };

  useEffect(() => {
    loadCycleData();
    loadPAAData();
    loadStrategicData();
  }, []);

  // Preparar dados para o radar
  const radarData = strategicData.perspectives.map(p => ({
    subject: p.name,
    atual: p.progress,
    meta: 100
  }));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Ciclo Estratégico {cycleData.currentCycle}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Acompanhamento do ciclo estratégico atual
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progresso Geral
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {cycleData.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={cycleData.progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: `${colors.status.success}20`,
              '& .MuiLinearProgress-bar': {
                bgcolor: colors.status.success,
              },
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ActionStatusSummary summary={{
            completed: paaData.initiatives.completed,
            inProgress: paaData.initiatives.inProgress,
            delayed: paaData.initiatives.delayed,
            total: paaData.initiatives.total
          }} />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Planos de Ação Anuais
          </Typography>
          <Grid container spacing={2}>
            {/* TODO: Implementar lógica para mostrar PAAs do ciclo */}
            <Grid item xs={12} sm={6} md={4}>
              <PAACard
                year={parseInt(paaData.currentYear)}
                status="active"
                progress={paaData.progress}
                initiativeCount={paaData.initiatives}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Radar Estratégico
          </Typography>
          <StrategicRadar data={radarData} />
        </Grid>

        {/* Missão, Visão e Valores */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Paper sx={{ flex: 1, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Missão
              </Typography>
              <Typography variant="body1">
                Promover soluções inovadoras e sustentáveis que impulsionem o crescimento e desenvolvimento de nossos clientes.
              </Typography>
            </Paper>

            <Paper sx={{ flex: 1, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Visão
              </Typography>
              <Typography variant="body1">
                Ser referência em excelência e inovação, reconhecida pela capacidade de transformar desafios em oportunidades.
              </Typography>
            </Paper>

            <Paper sx={{ flex: 1, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Valores
              </Typography>
              <Typography component="ul" sx={{ pl: 2 }}>
                <li>Inovação</li>
                <li>Integridade</li>
                <li>Excelência</li>
                <li>Sustentabilidade</li>
                <li>Colaboração</li>
              </Typography>
            </Paper>
          </Box>
        </Grid>

        {/* Estrutura Estratégica */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Estrutura Estratégica
          </Typography>
          <StrategicPanel cycle={cycleData.currentCycle} />
        </Grid>
      </Grid>
    </Box>
  );
}