'use client';

import React from 'react';
import { Box, Card, TextField, Typography, Button } from '@mui/material';
import { colors } from '@/styles/colors';

export default function LoginPage() {
  return (
    <Box sx={{ width: '100%', maxWidth: 400, p: 2 }}>
      <Card sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: colors.primary.main, fontWeight: 600 }}>
            Plan-MP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de Planejamento Estratégico
          </Typography>
        </Box>

        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
          />

          <TextField
            label="Senha"
            type="password"
            fullWidth
            required
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: colors.primary.main,
              '&:hover': {
                bgcolor: colors.primary.dark
              }
            }}
          >
            Entrar
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Esqueceu sua senha?{' '}
              <Button
                variant="text"
                sx={{ color: colors.primary.main, p: 0, minWidth: 'auto' }}
              >
                Clique aqui
              </Button>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
} 