'use client';

import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAppTheme } from '@/contexts/ThemeContext';

const DarkModeSwitcher = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const isDark = mode === 'dark';

  return (
    <IconButton
      onClick={toggleTheme}
      color="inherit"
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      sx={{
        width: '40px',
        height: '40px',
        padding: '8px',
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default DarkModeSwitcher;
