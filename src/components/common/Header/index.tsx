'use client';

import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { 
  Box, 
  IconButton, 
  InputBase, 
  Typography, 
  useTheme, 
  useMediaQuery,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Divider,
  ListItemIcon
} from '@mui/material';
import { Icon } from '@/components/common/Icons';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleTheme, isDarkMode }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Estados para os menus
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [messagesAnchor, setMessagesAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  // Handlers para abrir/fechar menus
  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMessagesClick = (event: React.MouseEvent<HTMLElement>) => {
    setMessagesAnchor(event.currentTarget);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseMenus = () => {
    setNotificationsAnchor(null);
    setMessagesAnchor(null);
    setUserMenuAnchor(null);
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        height: 60,
        px: 4,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {!isDesktop && (
        <IconButton onClick={onToggleSidebar} sx={{ mr: 2 }}>
          <Icon name="menu" size="medium" />
        </IconButton>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          ml: 'auto',
        }}
      >
        {/* Tema */}
        <IconButton onClick={onToggleTheme}>
          <Icon name={isDarkMode ? 'light' : 'dark'} size="medium" />
        </IconButton>

        {/* Notificações */}
        <IconButton onClick={handleNotificationsClick}>
          <Badge badgeContent={3} color="error">
            <Icon name="notification" size="medium" />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleCloseMenus}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
        >
          <MenuItem>
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle2">Nova aprovação pendente</Typography>
              <Typography variant="body2" color="text.secondary">
                Há 5 minutos
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem>
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle2">Indicador atualizado</Typography>
              <Typography variant="body2" color="text.secondary">
                Há 30 minutos
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

        {/* Mensagens */}
        <IconButton onClick={handleMessagesClick}>
          <Badge badgeContent={1} color="error">
            <Icon name="message" size="medium" />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={messagesAnchor}
          open={Boolean(messagesAnchor)}
          onClose={handleCloseMenus}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
        >
          <MenuItem>
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle2">João Silva</Typography>
              <Typography variant="body2" color="text.secondary">
                Nova mensagem sobre o projeto...
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

        {/* Usuário */}
        <IconButton onClick={handleUserMenuClick}>
          <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
        </IconButton>
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleCloseMenus}
          PaperProps={{
            sx: { width: 220 }
          }}
        >
          <MenuItem>
            <ListItemIcon>
              <Icon name="account" size="small" />
            </ListItemIcon>
            Meu Perfil
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <Icon name="settings" size="small" />
            </ListItemIcon>
            Configurações
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemIcon>
              <Icon name="close" size="small" />
            </ListItemIcon>
            Sair
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;
