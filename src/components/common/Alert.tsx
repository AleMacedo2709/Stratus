import React from 'react';
import { Alert as MuiAlert, AlertProps as MuiAlertProps, Box, Typography } from '@mui/material';
import { Icon, iconColors } from './Icons';
import { colors } from '@/styles/colors';

interface AlertProps extends Omit<MuiAlertProps, 'severity'> {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  action,
  ...props
}) => {
  const getAlertStyles = () => {
    const baseStyles = {
      borderRadius: 1,
      padding: 2,
      '& .MuiAlert-icon': {
        alignItems: 'center'
      }
    };

    const color = iconColors[type] || colors.status[type] || colors.status.info;

    return {
      ...baseStyles,
      backgroundColor: `${color}10`,
      borderLeft: `4px solid ${color}`,
      '& .MuiAlert-icon': {
        color: color
      }
    };
  };

  return (
    <MuiAlert
      icon={<Icon name={type} size="medium" />}
      onClose={onClose}
      action={action}
      sx={getAlertStyles()}
      {...props}
    >
      <Box>
        {title && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </MuiAlert>
  );
}; 