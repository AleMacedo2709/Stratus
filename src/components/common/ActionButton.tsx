import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { Icon, IconName, iconColors } from './Icons';
import { colors } from '@/styles/colors';

interface ActionButtonProps extends Omit<ButtonProps, 'startIcon' | 'color'> {
  icon?: IconName;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  children?: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  onClick,
  children,
  disabled = false,
  ...props
}) => {
  const getButtonColor = () => {
    switch (color) {
      case 'secondary':
        return iconColors.secondary || colors.secondary.main;
      case 'success':
        return iconColors.success || colors.status.success;
      case 'error':
        return iconColors.error || colors.status.danger;
      case 'warning':
        return iconColors.warning || colors.status.warning;
      case 'info':
        return iconColors.info || colors.status.info;
      default:
        return iconColors.primary || colors.primary.main;
    }
  };

  const buttonColor = getButtonColor();

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      startIcon={icon && <Icon name={icon} size={getIconSize()} />}
      sx={{
        ...(variant === 'contained' && {
          backgroundColor: buttonColor,
          color: colors.neutral.white,
          '&:hover': {
            backgroundColor: `${buttonColor}CC`,
          },
        }),
        ...(variant === 'outlined' && {
          borderColor: buttonColor,
          color: buttonColor,
          '&:hover': {
            borderColor: buttonColor,
            backgroundColor: `${buttonColor}10`,
          },
        }),
        ...(variant === 'text' && {
          color: buttonColor,
          '&:hover': {
            backgroundColor: `${buttonColor}10`,
          },
        }),
        textTransform: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}; 