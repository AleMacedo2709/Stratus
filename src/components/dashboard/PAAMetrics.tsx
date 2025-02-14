'use client';

import React from 'react';
import { Box, Paper, Typography, Grid, useTheme, LinearProgress } from '@mui/material';
import { Icon } from '@/components/common/Icons';
import { colors } from '@/styles/colors';
import { PAAMetricsProps } from '@/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const PAAMetrics: React.FC<PAAMetricsProps> = ({ data }) => {
  const theme = useTheme();

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'completed':
        return colors.status.success;
      case 'inProgress':
        return colors.status.info;
      case 'notStarted':
        return colors.status.warning;
      case 'delayed':
        return colors.status.danger;
      case 'achieved':
        return colors.status.success;
      case 'onTrack':
        return colors.status.info;
      case 'atRisk':
        return colors.status.warning;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getInitiativesData = () => [
    { label: 'Concluídas', value: data.initiatives.completed, color: getStatusColor('completed') },
    { label: 'Em Andamento', value: data.initiatives.inProgress, color: getStatusColor('inProgress') },
    { label: 'Não Iniciadas', value: data.initiatives.notStarted, color: getStatusColor('notStarted') },
    { label: 'Atrasadas', value: data.initiatives.delayed, color: getStatusColor('delayed') },
  ];

  const getGoalsData = () => [
    { label: 'Alcançadas', value: data.goals.achieved, color: getStatusColor('achieved') },
    { label: 'No Prazo', value: data.goals.onTrack, color: getStatusColor('onTrack') },
    { label: 'Em Risco', value: data.goals.atRisk, color: getStatusColor('atRisk') },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            p: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2">
            {label}: {payload[0].value}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(19, 47, 76, 0.4)'
          : 'rgba(0, 0, 0, 0.02)',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Plano de Ação Anual
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data.currentYear} - Progresso: {data.progress}%
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={4}>
          {/* Initiatives */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Iniciativas ({data.initiatives.total})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {getInitiativesData().map((item, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2">
                      {item.value}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.value / data.initiatives.total) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: item.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Goals */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Metas ({data.goals.total})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {getGoalsData().map((item, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2">
                      {item.value}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.value / data.goals.total) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: item.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Performance Chart */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Desempenho Mensal
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.performance} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="month"
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill={colors.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}; 