'use client';

import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  useTheme,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';

const notifications = [
  {
    id: 1,
    title: 'Nova solicitação de aprovação',
    description: 'João Silva enviou uma nova iniciativa para aprovação',
    time: '5 minutos atrás',
    type: 'approval',
    read: false,
  },
  {
    id: 2,
    title: 'Lembrete de prazo',
    description: 'O prazo para aprovação da iniciativa "Digitalização" está próximo',
    time: '1 hora atrás',
    type: 'deadline',
    read: false,
  },
  {
    id: 3,
    title: 'Atualização de fluxo',
    description: 'O fluxo de aprovação "Planejamento" foi atualizado',
    time: '2 horas atrás',
    type: 'update',
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'approval':
      return 'file-check';
    case 'deadline':
      return 'clock';
    case 'update':
      return 'refresh';
    default:
      return 'bell';
  }
};

const DropdownNotification = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color: theme.palette.text.secondary,
          padding: '8px',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(0, 0, 0, 0.03)',
          },
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '10px',
              height: '16px',
              minWidth: '16px',
            }
          }}
        >
          <Icon name="bell" size="sm" />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 480,
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            marginTop: '4px',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notificações
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.primary.main,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Marcar todas como lidas
          </Typography>
        </Box>

        <Divider />

        {notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={handleClose}
            sx={{
              py: 2,
              px: 3,
              borderLeft: '3px solid transparent',
              ...(notification.read
                ? {}
                : {
                    borderLeftColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(0, 0, 0, 0.02)',
                  }),
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                  color: theme.palette.primary.main,
                }}
              >
                <Icon name={getNotificationIcon(notification.type)} size="sm" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {notification.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {notification.time}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}

        <Divider />

        <Box sx={{ p: 1 }}>
          <MenuItem
            sx={{
              borderRadius: 1,
              justifyContent: 'center',
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Ver todas as notificações
            </Typography>
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
};

export default DropdownNotification;
