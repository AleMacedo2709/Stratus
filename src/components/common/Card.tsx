import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import { Icon, IconName, iconColors } from './Icons';
import { colors } from '@/styles/colors';

interface CardProps extends Omit<MuiCardProps, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: IconName;
  actions?: React.ReactNode;
  noPadding?: boolean;
  variant?: 'default' | 'outlined' | 'elevation';
  headerBorder?: boolean;
  onClose?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  actions,
  children,
  noPadding = false,
  variant = 'default',
  headerBorder = false,
  onClose,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          border: `1px solid ${colors.neutral.light}`,
          boxShadow: 'none'
        };
      case 'elevation':
        return {
          boxShadow: 3
        };
      default:
        return {
          boxShadow: 1
        };
    }
  };

  return (
    <MuiCard
      {...props}
      sx={{
        ...getVariantStyles(),
        borderRadius: 2,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...props.sx
      }}
    >
      {(title || subtitle || icon || actions || onClose) && (
        <CardHeader
          avatar={icon && (
            <Icon
              name={icon}
              size="medium"
              color={iconColors[icon]}
            />
          )}
          title={
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          }
          subheader={subtitle}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {actions}
              {onClose && (
                <IconButton onClick={onClose} size="small">
                  <Icon name="close" size="small" />
                </IconButton>
              )}
            </Box>
          }
          sx={{
            p: 2,
            ...(headerBorder && {
              borderBottom: `1px solid ${colors.neutral.light}`
            })
          }}
        />
      )}
      <CardContent
        sx={{
          flexGrow: 1,
          p: noPadding ? 0 : 2,
          '&:last-child': {
            pb: noPadding ? 0 : 2
          }
        }}
      >
        {children}
      </CardContent>
    </MuiCard>
  );
}; 