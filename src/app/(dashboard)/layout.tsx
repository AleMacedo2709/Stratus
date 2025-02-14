'use client';

import React, { useState, useEffect } from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { colors } from '@/styles/colors';
import Header from '@/components/common/Header/index';
import Sidebar from '@/components/common/Sidebar/index';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Criar tema baseado no modo atual
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: colors.primary.main,
            light: colors.primary.light,
            dark: colors.primary.dark,
          },
          secondary: {
            main: colors.secondary.main,
            light: colors.secondary.light,
            dark: colors.secondary.dark,
          },
          error: {
            main: colors.status.danger,
          },
          warning: {
            main: colors.status.warning,
          },
          info: {
            main: colors.info.main,
          },
          success: {
            main: colors.status.success,
          },
          background: {
            default: mode === 'dark' ? colors.neutral.darker : colors.neutral.lighter,
            paper: mode === 'dark' ? colors.neutral.dark : colors.neutral.white,
          },
          text: {
            primary: mode === 'dark' ? colors.neutral.white : colors.neutral.text,
            secondary: mode === 'dark' ? colors.neutral.light : colors.neutral.textLight,
          },
        },
      }),
    [mode]
  );

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark';
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex',
          minHeight: '100vh',
          overflow: 'hidden'
        }}
      >
        <Box
          component="nav"
          sx={{
            width: 280,
            flexShrink: 0,
            position: { xs: 'fixed', lg: 'sticky' },
            top: 0,
            height: '100vh',
            zIndex: theme => theme.zIndex.drawer
          }}
        >
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </Box>
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          <Header 
            onToggleSidebar={toggleSidebar} 
            onToggleTheme={toggleTheme}
            isDarkMode={mode === 'dark'}
          />

          <Box
            component="div"
            sx={{
              flexGrow: 1,
              p: 3,
              overflowX: 'hidden',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
} 