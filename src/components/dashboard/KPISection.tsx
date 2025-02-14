'use client';

import React from 'react';
import { Box, Paper, Typography, Grid, useTheme, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Icon } from '@/components/common/Icons';
import { colors } from '@/styles/colors';
import { KPISectionProps } from '@/types/dashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const KPISection: React.FC<KPISectionProps> = ({ data, period, onPeriodChange }) => {
  const theme = useTheme();

  const handlePeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string) => {
    if (newPeriod !== null) {
      onPeriodChange(newPeriod);
    }
  };

  const getChartData = (history: number[]) => {
    return history.map((value, index) => ({
      name: `T${index + 1}`,
      value,
    }));
  };

  const getTrendIcon = (trend: 'up' | 'down', variation: number) => {
    const color = trend === 'up' ? colors.status.success : colors.status.danger;
    const icon = trend === 'up' ? 'trending-up' : 'trending-down';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color }}>
        <Icon name={icon} size="sm" />
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          {variation}%
        </Typography>
      </Box>
    );
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
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Indicadores Chave
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Principais métricas de desempenho
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={handlePeriodChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.5,
              typography: 'body2',
              '&.Mui-selected': {
                backgroundColor: `${colors.primary.main}20`,
                color: colors.primary.main,
                '&:hover': {
                  backgroundColor: `${colors.primary.main}30`,
                },
              },
            },
          }}
        >
          <ToggleButton value="weekly">Semanal</ToggleButton>
          <ToggleButton value="monthly">Mensal</ToggleButton>
          <ToggleButton value="quarterly">Trimestral</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={4}>
          {data.map((kpi) => (
            <Grid key={kpi.id} item xs={12} md={4}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* KPI Header */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {kpi.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 500 }}>
                      {kpi.value}%
                    </Typography>
                    {getTrendIcon(kpi.trend, kpi.variation)}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Meta: {kpi.target}%
                  </Typography>
                </Box>

                {/* Chart */}
                <Box sx={{ height: 100 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData(kpi.history)} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis
                        dataKey="name"
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 4,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={colors.primary.main}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
}; 