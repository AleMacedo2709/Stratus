'use client';

import React from 'react';
import { Box, Paper, Typography, Grid, useTheme, LinearProgress } from '@mui/material';
import { Icon } from '@/components/common/Icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { colors } from '@/styles/colors';

interface StrategicData {
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

interface StrategicOverviewProps {
  data: StrategicData;
}

export const StrategicOverview: React.FC<StrategicOverviewProps> = ({ data }) => {
  const theme = useTheme();

  // Dados para o gráfico de pizza dos indicadores
  const indicatorData = [
    { name: 'No Alvo', value: data.indicators.onTarget, color: colors.status.success },
    { name: 'Atenção', value: data.indicators.warning, color: colors.status.warning },
    { name: 'Crítico', value: data.indicators.critical, color: colors.status.danger },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
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
            {payload[0].name}: {payload[0].value}
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
          Visão Geral Estratégica
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Perspectivas, objetivos e indicadores
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={4}>
          {/* Perspectivas e Objetivos */}
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon name="perspective" size="sm" />
              Perspectivas e Objetivos
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {data.perspectives.map((perspective, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {perspective.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {perspective.progress}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={perspective.progress}
                      sx={{
                        flexGrow: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: colors.primary.main,
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ pl: 3 }}>
                    {perspective.objectives.map((objective, objIndex) => (
                      <Box
                        key={objIndex}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Icon name="objective" size="sm" />
                        <Typography variant="body2">
                          {objective.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {objective.progress}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={objective.progress}
                          sx={{
                            flexGrow: 1,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: colors.secondary.main,
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Indicadores */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon name="chart-line" size="sm" />
              Status dos Indicadores
            </Typography>

            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={indicatorData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {indicatorData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ mt: 2 }}>
              {indicatorData.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography variant="body2">{item.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}; 