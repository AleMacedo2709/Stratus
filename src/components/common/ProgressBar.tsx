import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { colors } from '@/styles/colors';

interface ProgressBarProps {
  value: number;
  total?: number;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  total = 100,
  showPercentage = true,
  size = 'medium',
  label,
  variant = 'primary'
}) => {
  const percentage = Math.round((value / total) * 100);

  const getProgressColor = () => {
    if (variant !== 'primary') {
      return colors.status[variant] || colors.primary.main;
    }

    // Cor baseada no progresso
    if (percentage >= 75) return colors.status.success;
    if (percentage >= 50) return colors.status.info;
    if (percentage >= 25) return colors.status.warning;
    return colors.status.danger;
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 4;
      case 'large':
        return 12;
      default:
        return 8;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {(label || showPercentage) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5
          }}
        >
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          {showPercentage && (
            <Typography variant="body2" color="text.secondary">
              {percentage}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: getHeight(),
          borderRadius: getHeight(),
          backgroundColor: `${getProgressColor()}20`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: getProgressColor(),
            borderRadius: getHeight()
          }
        }}
      />
    </Box>
  );
}; 