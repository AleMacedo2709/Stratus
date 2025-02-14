'use client';

import React from 'react';
import { Box, Paper, Typography, useTheme, IconButton, Chip } from '@mui/material';
import { Icon, iconColors } from '@/components/common/Icons';
import { colors } from '@/styles/colors';

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  description: string;
  date: string;
  isRead: boolean;
}

interface AlertsSectionProps {
  alerts: Alert[];
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({
  alerts,
  onMarkAsRead,
  onDismiss,
}) => {
  const theme = useTheme();

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return iconColors.warning;
      case 'danger':
        return iconColors.error;
      case 'success':
        return iconColors.success;
      default:
        return iconColors.info;
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Alertas</Typography>
        <IconButton size="small">
          <Icon name="refresh" size="small" />
        </IconButton>
      </Box>

      {alerts.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            color: 'text.secondary',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 1,
          }}
        >
          <Icon
            name="info"
            size="large"
            color={theme.palette.text.secondary}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Nenhum alerta no momento
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {alerts.map((alert) => (
            <Box
              key={alert.id}
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: `${getAlertColor(alert.type)}10`,
                border: `1px solid ${getAlertColor(alert.type)}20`,
                opacity: alert.isRead ? 0.7 : 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Icon
                  name={getAlertIcon(alert.type)}
                  size="medium"
                  color={getAlertColor(alert.type)}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={500}>
                      {alert.title}
                    </Typography>
                    {!alert.isRead && (
                      <Chip
                        label="Novo"
                        size="small"
                        color="primary"
                        sx={{ height: 20 }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {alert.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {new Date(alert.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!alert.isRead && onMarkAsRead && (
                    <IconButton
                      size="small"
                      onClick={() => onMarkAsRead(alert.id)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <Icon name="check" size="small" />
                    </IconButton>
                  )}
                  {onDismiss && (
                    <IconButton
                      size="small"
                      onClick={() => onDismiss(alert.id)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <Icon name="close" size="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}; 