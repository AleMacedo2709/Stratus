import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import { Icon, IconName, iconColors } from '../common/Icons';
import { colors } from '@/styles/colors';

interface StrategicCardProps {
  type: StrategicElementType;
  title: string;
  description?: string;
  status?: 'on_track' | 'at_risk' | 'behind' | 'completed';
  progress?: number;
  responsible?: string;
  startDate?: string;
  endDate?: string;
  onClick?: () => void;
  onMenuClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  chipLabel?: string;
  chipColor?: string;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'on_track':
      return iconColors.success;
    case 'at_risk':
      return iconColors.warning;
    case 'behind':
      return iconColors.error;
    case 'completed':
      return iconColors.completed;
    default:
      return colors.neutral.main;
  }
};

const getStatusIcon = (status?: string): IconName => {
  switch (status) {
    case 'on_track':
      return 'success';
    case 'at_risk':
      return 'warning';
    case 'behind':
      return 'error';
    case 'completed':
      return 'completed';
    default:
      return 'info';
  }
};

export const StrategicCard: React.FC<StrategicCardProps> = ({
  type,
  title,
  description,
  status,
  progress,
  responsible,
  startDate,
  endDate,
  onClick,
  onMenuClick,
  chipLabel,
  chipColor,
}) => {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        } : {},
      }}
      onClick={onClick}
    >
      <CardHeader
        avatar={
          <Icon
            name={type as IconName}
            size="large"
            color={iconColors[type as IconName]}
          />
        }
        action={
          onMenuClick && (
            <IconButton onClick={onMenuClick}>
              <Icon name="more" size="medium" />
            </IconButton>
          )
        }
        title={title}
        titleTypographyProps={{ variant: 'h6' }}
      />
      
      {description && (
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      )}

      <CardContent>
        {progress !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                height: 8,
                borderRadius: 4,
                backgroundColor: `${getStatusColor(status)}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getStatusColor(status)
                }
              }}
            />
          </Box>
        )}

        {status && (
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Icon
              name={getStatusIcon(status)}
              size="small"
              color={getStatusColor(status)}
            />
            <Typography variant="body2" color="text.secondary">
              {status === 'on_track' ? 'No Prazo' :
               status === 'at_risk' ? 'Em Risco' :
               status === 'behind' ? 'Atrasado' :
               status === 'completed' ? 'Concluído' : ''}
            </Typography>
          </Box>
        )}

        {responsible && (
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Icon name="team" size="small" />
            <Typography variant="body2" color="text.secondary">
              {responsible}
            </Typography>
          </Box>
        )}

        {(startDate || endDate) && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Icon name="timeline" size="small" />
            <Typography variant="body2" color="text.secondary">
              {startDate && endDate ? `${startDate} - ${endDate}` :
               startDate ? `Início: ${startDate}` :
               endDate ? `Fim: ${endDate}` : ''}
            </Typography>
          </Box>
        )}
      </CardContent>

      {chipLabel && (
        <CardActions>
          <Chip
            label={chipLabel}
            size="small"
            sx={{
              backgroundColor: chipColor ? `${chipColor}20` : undefined,
              color: chipColor,
              borderRadius: '16px'
            }}
          />
        </CardActions>
      )}
    </Card>
  );
}; 