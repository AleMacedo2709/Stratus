'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  useTheme
} from '@mui/material';
import { Icon } from '@/components/common/Icons';
import { colors } from '@/styles/colors';

interface PAACardProps {
  id: string;
  year: number;
  progress: number;
  totalInitiatives: number;
  completedInitiatives: number;
  inProgressInitiatives: number;
  pendingInitiatives: number;
}

export const PAACard: React.FC<PAACardProps> = ({
  id,
  year,
  progress,
  totalInitiatives,
  completedInitiatives,
  inProgressInitiatives,
  pendingInitiatives,
}) => {
  const router = useRouter();
  const theme = useTheme();

  const handleClick = () => {
    router.push(`/strategic-planning/paa/${id}`);
  };

  const getStatusColor = (value: number) => {
    if (value >= 75) return colors.status.success;
    if (value >= 50) return colors.status.warning;
    return colors.status.danger;
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
      onClick={handleClick}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          PAA {year}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Progresso Geral:
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: getStatusColor(progress), fontWeight: 500 }}
          >
            {progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: getStatusColor(progress),
              borderRadius: 3,
            },
          }}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: colors.status.success }}>
              {completedInitiatives}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Concluídas
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: colors.status.warning }}>
              {inProgressInitiatives}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Em Andamento
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: colors.status.danger }}>
              {pendingInitiatives}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pendentes
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

interface PAACardsProps {
  paas: PAACardProps[];
}

export const PAACards: React.FC<PAACardsProps> = ({ paas }) => {
  return (
    <Grid container spacing={3}>
      {paas.map((paa) => (
        <Grid item xs={12} sm={6} md={4} key={paa.id}>
          <PAACard {...paa} />
        </Grid>
      ))}
    </Grid>
  );
}; 