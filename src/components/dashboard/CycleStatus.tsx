'use client';

import React from 'react';
import { Box, Paper, Typography, Grid, useTheme, LinearProgress } from '@mui/material';
import { Icon } from '@/components/common/Icons';
import { colors } from '@/styles/colors';
import { CycleStatusProps } from '@/types/dashboard';

export const CycleStatus: React.FC<CycleStatusProps> = ({ data }) => {
  const theme = useTheme();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.status.success;
      case 'in_progress':
        return colors.status.info;
      default:
        return colors.status.warning;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em Andamento';
      default:
        return 'Pendente';
    }
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
          Ciclo Estratégico
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Acompanhamento do ciclo atual
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={4}>
          {/* Cycle Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ciclo Atual
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 500 }}>
                  {data.currentCycle}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(data.status),
                    }}
                  />
                  <Typography variant="body1">
                    {getStatusLabel(data.status)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Progress */}
          <Grid item xs={12} md={4}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 500 }}>
                  {data.progress}%
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Progresso
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Última atualização: {formatDate(data.lastUpdate)}
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={data.progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: colors.primary.main,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Grid>

          {/* Period */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Início
                </Typography>
                <Typography variant="body1">
                  {formatDate(data.startDate)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Término
                </Typography>
                <Typography variant="body1">
                  {formatDate(data.endDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}; 