"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Icon, IconName } from '@/components/common/Icons';

interface MenuItem {
  title: string;
  path: string;
  icon: IconName;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard'
  },
  {
    title: 'Painel Estratégico',
    path: '/strategic-planning',
    icon: 'perspective'
  },
  {
    title: 'Relatórios',
    path: '/reports',
    icon: 'document'
  },
  {
    title: 'Minha Área',
    path: '/my-area',
    icon: 'account'
  },
  {
    title: 'Tarefas',
    path: '/tasks',
    icon: 'task'
  },
  {
    title: 'Aprovações',
    path: '/approvals',
    icon: 'check'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant={isDesktop ? 'permanent' : 'temporary'}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        },
      }}
    >
      <Box 
        sx={{ 
          height: 60, // Mesma altura do header
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Image
          src="/images/logo/logo.svg"
          alt="Logo"
          width={32}
          height={32}
          style={{ width: 'auto', height: 'auto' }}
          priority
        />
        <Typography variant="h6" fontWeight={600}>
          Stratus
        </Typography>
        {!isDesktop && (
          <IconButton
            onClick={onClose}
            sx={{
              ml: 'auto',
              color: 'text.secondary',
            }}
          >
            <Icon name="close" size="small" />
          </IconButton>
        )}
      </Box>

      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isSelected = pathname === item.path;

          return (
            <Link
              key={item.title}
              href={item.path as any}
              style={{ textDecoration: 'none' }}
              onClick={() => !isDesktop && onClose()}
            >
              <ListItem
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  color: isSelected ? 'primary.main' : 'text.primary',
                  backgroundColor: isSelected ? `${theme.palette.primary.main}10` : 'transparent',
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: 'inherit', // Usa a mesma cor do texto para todos os ícones
                  }}
                >
                  <Icon
                    name={item.icon}
                    size="small"
                    color={isSelected ? theme.palette.primary.main : theme.palette.text.primary} // Cor igual para todos quando não selecionados
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: isSelected ? 500 : 400,
                  }}
                />
              </ListItem>
            </Link>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
