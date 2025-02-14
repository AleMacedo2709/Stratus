'use client';

import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { colors } from '@/styles/colors';

interface ActionSummary {
  completed: number;
  inProgress: number;
  delayed: number;
  total: number;
}

interface ActionStatusSummaryProps {
  summary: ActionSummary;
}

export const ActionStatusSummary: React.FC<ActionStatusSummaryProps> = ({ summary }) => {
  const items = [
    {
      label: 'Concluídas',
      value: summary.completed,
      color: colors.status.success,
    },
    {
      label: 'Em Andamento',
      value: summary.inProgress,
      color: colors.info.main,
    },
    {
      label: 'Atrasadas',
      value: summary.delayed,
      color: colors.status.danger,
    },
    {
      label: 'Total',
      value: summary.total,
      color: colors.neutral.text,
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Ações Estratégicas por Status
      </Typography>
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={6} sm={3} key={item.label}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: item.color,
                  mb: 1,
                }}
              >
                {item.value}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {item.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}; 