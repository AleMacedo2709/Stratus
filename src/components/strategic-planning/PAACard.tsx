'use client';

import React from 'react';
import { Box, Paper, Typography, LinearProgress, Chip } from '@mui/material';
import { colors } from '@/styles/colors';

interface PAACardProps {
  year: number;
  status: 'active' | 'completed' | 'future';
  progress?: number;
  initiativeCount?: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
}

export const PAACard: React.FC<PAACardProps> = ({
  year,
  status,
  progress,
  initiativeCount,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return colors.status.success;
      case 'completed':
        return colors.info.main;
      default:
        return colors.neutral.main;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'active':
        return 'Em Vigor';
      case 'completed':
        return 'Concluído';
      default:
        return 'Ciclo Futuro';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          PAA {year}
        </Typography>
        <Chip
          label={getStatusLabel()}
          size="small"
          sx={{
            bgcolor: `${getStatusColor()}20`,
            color: getStatusColor(),
            fontWeight: 500,
          }}
        />
      </Box>

      {status === 'active' && progress !== undefined && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Progresso
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: `${getStatusColor()}20`,
              '& .MuiLinearProgress-bar': {
                bgcolor: getStatusColor(),
              },
            }}
          />
        </Box>
      )}

      {initiativeCount && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Iniciativas
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h6" color={colors.status.success}>
                {initiativeCount.completed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Concluídas
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color={colors.info.main}>
                {initiativeCount.inProgress}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Em Andamento
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color={colors.neutral.main}>
                {initiativeCount.notStarted}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Não Iniciadas
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6">
                {initiativeCount.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}; 