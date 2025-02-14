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
  Avatar,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';

const messages = [
  {
    id: 1,
    sender: {
      name: 'João Silva',
      avatar: '/images/user/user-01.png',
      role: 'Gerente de Projetos',
    },
    message: 'Preciso da sua aprovação para o novo projeto de digitalização.',
    time: '5 minutos atrás',
    read: false,
  },
  {
    id: 2,
    sender: {
      name: 'Maria Santos',
      avatar: '/images/user/user-02.png',
      role: 'Analista de Processos',
    },
    message: 'Atualizei o fluxo de aprovação conforme solicitado.',
    time: '1 hora atrás',
    read: false,
  },
  {
    id: 3,
    sender: {
      name: 'Carlos Souza',
      avatar: '/images/user/user-03.png',
      role: 'Coordenador',
    },
    message: 'O relatório mensal está disponível para revisão.',
    time: '2 horas atrás',
    read: true,
  },
];

const DropdownMessage = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadCount = messages.filter(m => !m.read).length;

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
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '10px',
              height: '16px',
              minWidth: '16px',
            }
          }}
        >
          <Icon name="envelope" size="sm" />
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
            Mensagens
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

        {messages.map((message) => (
          <MenuItem
            key={message.id}
            onClick={handleClose}
            sx={{
              py: 2,
              px: 3,
              borderLeft: '3px solid transparent',
              ...(message.read
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
              <Avatar
                src={message.sender.avatar}
                alt={message.sender.name}
                sx={{ width: 40, height: 40 }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {message.sender.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {message.time}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {message.sender.role}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {message.message}
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
              Ver todas as mensagens
            </Typography>
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
};

export default DropdownMessage;
