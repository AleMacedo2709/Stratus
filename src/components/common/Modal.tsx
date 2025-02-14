import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { Icon, iconColors } from './Icons';
import { colors } from '@/styles/colors';
import { ActionButton } from './ActionButton';

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  actions?: React.ReactNode;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: string;
  };
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  onClose,
  maxWidth = 'sm',
  actions,
  closeOnBackdrop = true,
  showCloseButton = true,
  fullWidth = true,
  loading = false,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick' && !closeOnBackdrop) return;
        onClose();
      }}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2,
          m: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <Icon name="close" size="small" />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent
        sx={{
          p: 2,
          position: 'relative',
          minHeight: 100,
        }}
      >
        {loading ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          children
        )}
      </DialogContent>

      {(actions || primaryAction || secondaryAction) && (
        <DialogActions sx={{ p: 2, gap: 1 }}>
          {actions || (
            <>
              {secondaryAction && (
                <ActionButton
                  variant="text"
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.disabled}
                  icon={secondaryAction.icon as any}
                >
                  {secondaryAction.label}
                </ActionButton>
              )}
              {primaryAction && (
                <ActionButton
                  variant="contained"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled || primaryAction.loading}
                  icon={primaryAction.icon as any}
                >
                  {primaryAction.loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    primaryAction.label
                  )}
                </ActionButton>
              )}
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};