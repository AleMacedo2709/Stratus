import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { colors } from '@/styles/colors';
import { Icon, IconName, iconColors } from './Icons';

// Grupos de ícones para exibição
const iconGroups = {
  'Elementos Estratégicos': [
    'perspective',
    'program',
    'action',
    'objective',
    'initiative',
    'indicator',
    'risk',
    'milestone',
    'task'
  ],
  'Documentos': [
    'download',
    'pdf',
    'excel',
    'powerpoint',
    'report',
    'document',
    'file-pdf',
    'file-alt',
    'file-excel'
  ],
  'Navegação': [
    'next',
    'more',
    'menu',
    'dashboard',
    'expand_less',
    'expand_more',
    'back',
    'chevron-right',
    'chevron-down'
  ],
  'Ações': [
    'edit',
    'delete',
    'view',
    'add',
    'search',
    'filter',
    'sort',
    'refresh',
    'close',
    'check',
    'share',
    'settings',
    'sync',
    'trash',
    'plus',
    'minus',
    'times',
    'eye',
    'pen'
  ],
  'Status': [
    'warning',
    'error',
    'info',
    'help',
    'success',
    'pending',
    'in_progress',
    'completed',
    'delayed',
    'cancelled',
    'on_track',
    'at_risk',
    'behind'
  ],
  'Análise': [
    'chart',
    'timeline',
    'trend',
    'analytics',
    'performance',
    'goal',
    'trending-up',
    'trending-down',
    'chart-line',
    'cycleGoal'
  ],
  'Organizacional': [
    'team',
    'department',
    'organization',
    'notification'
  ],
  'Header': [
    'dark',
    'light',
    'message',
    'account'
  ],
  'Outros': [
    'calendar',
    'calendar-check',
    'values',
    'mission',
    'vision',
    'priority',
    'drag',
    'arrow-up',
    'arrow-down'
  ]
} as const;

export const StyleGuide: React.FC = () => {
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Guia de Estilos</Typography>

      {/* Cores */}
      <Typography variant="h5" gutterBottom>Cores</Typography>
      <Grid container spacing={2}>
        {/* Cores Primárias */}
        <Grid item xs={12}>
          <Typography variant="h6">Cores Primárias</Typography>
          <Box display="flex" gap={2} mb={2}>
            {Object.entries(colors.primary).map(([key, value]) => (
              <Paper
                key={key}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: value,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: colors.neutral.white,
                }}
              >
                <Typography variant="caption">{key}</Typography>
                <Typography variant="caption">{value}</Typography>
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Status */}
        <Grid item xs={12}>
          <Typography variant="h6">Status</Typography>
          <Box display="flex" gap={2} mb={2}>
            {Object.entries(colors.status).map(([key, value]) => (
              <Paper
                key={key}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: value,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: colors.neutral.white,
                }}
              >
                <Typography variant="caption">{key}</Typography>
                <Typography variant="caption">{value}</Typography>
              </Paper>
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Ícones */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Ícones</Typography>
      {Object.entries(iconGroups).map(([groupName, icons]) => (
        <Box key={groupName} mb={4}>
          <Typography variant="h6" gutterBottom>{groupName}</Typography>
          <Grid container spacing={2}>
            {icons.map((iconName) => (
              <Grid item key={iconName}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    width: 120,
                    height: 120,
                  }}
                >
                  <Icon
                    name={iconName as IconName}
                    size="large"
                  />
                  <Typography variant="caption" align="center">
                    {iconName}
                  </Typography>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: iconColors[iconName as IconName],
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}; 