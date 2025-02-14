import React from 'react';
import { Box, Typography } from '@mui/material';
import { Icon, IconName } from './Icons';
import { colors } from '@/styles/colors';

type StatusType = 'ativo' | 'inativo' | 'pendente' | 'concluido' | 'cancelado' | 'em_andamento' | 'atrasado' | 'no_prazo' | 'planejado';

interface StatusConfig {
  label: string;
  color: string;
  icon: IconName;
}

const statusConfig: Record<StatusType, StatusConfig> = {
  ativo: {
    label: 'Ativo',
    color: colors.status.success,
    icon: 'success'
  },
  inativo: {
    label: 'Inativo',
    color: colors.status.danger,
    icon: 'error'
  },
  pendente: {
    label: 'Pendente',
    color: colors.status.warning,
    icon: 'pending'
  },
  concluido: {
    label: 'Concluído',
    color: colors.status.success,
    icon: 'completed'
  },
  cancelado: {
    label: 'Cancelado',
    color: colors.status.danger,
    icon: 'cancelled'
  },
  em_andamento: {
    label: 'Em Andamento',
    color: colors.status.info,
    icon: 'in_progress'
  },
  atrasado: {
    label: 'Atrasado',
    color: colors.status.danger,
    icon: 'delayed'
  },
  no_prazo: {
    label: 'No Prazo',
    color: colors.status.success,
    icon: 'on_track'
  },
  planejado: {
    label: 'Planejado',
    color: colors.status.info,
    icon: 'pending'
  }
};

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'medium'
}) => {
  const config = statusConfig[status];
  const isSmall = size === 'small';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        backgroundColor: `${config.color}20`,
        color: config.color,
        padding: isSmall ? '2px 8px' : '4px 12px',
        borderRadius: '16px',
        border: `1px solid ${config.color}40`
      }}
    >
      {showIcon && <Icon name={config.icon} size={isSmall ? 'small' : 'medium'} />}
      <Typography
        variant={isSmall ? 'caption' : 'body2'}
        sx={{ fontWeight: 500 }}
      >
        {config.label}
      </Typography>
    </Box>
  );
}; 