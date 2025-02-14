import React from 'react';
import { Box, Tooltip, Typography, Stack } from '@mui/material';
import { Icon, IconName } from './Icons';

export type StrategicElementType = 
  | 'perspective'
  | 'program'
  | 'action'
  | 'objective'
  | 'initiative'
  | 'indicator'
  | 'risk'
  | 'milestone'
  | 'task';

const labelMap = {
  perspective: 'Perspectiva',
  program: 'Programa',
  action: 'Ação',
  objective: 'Objetivo',
  initiative: 'Iniciativa',
  indicator: 'Indicador',
  risk: 'Risco',
  milestone: 'Marco',
  task: 'Tarefa',
};

interface StrategicIconProps {
  type: StrategicElementType;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const sizeMap: Record<'small' | 'medium' | 'large', {
  icon: 'small' | 'medium' | 'large';
  text: string;
}> = {
  small: {
    icon: 'small',
    text: '0.75rem',
  },
  medium: {
    icon: 'medium',
    text: '0.875rem',
  },
  large: {
    icon: 'large',
    text: '1rem',
  },
};

export const StrategicIcon: React.FC<StrategicIconProps> = ({
  type,
  showLabel = false,
  size = 'medium',
  color,
}) => {
  const label = labelMap[type];
  const dimensions = sizeMap[size];

  const iconElement = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={type as IconName} size={dimensions.icon} color={color} />
    </Box>
  );

  if (!showLabel) {
    return (
      <Tooltip title={label}>
        {iconElement}
      </Tooltip>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
    >
      {iconElement}
      <Typography
        variant="body2"
        sx={{
          fontSize: dimensions.text,
          fontWeight: 500,
          color: color,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};

interface StrategicLegendProps {
  types: StrategicElementType[];
}

export const StrategicLegend: React.FC<StrategicLegendProps> = ({ types }) => {
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      {types.map((type) => (
        <StrategicIcon
          key={type}
          type={type}
          showLabel
          size="small"
        />
      ))}
    </Stack>
  );
}; 