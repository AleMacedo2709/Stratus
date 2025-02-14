'use client';

import { Box, Typography, Button, Container } from '@mui/material';
import { StrategicIcon } from '@/components/common/StrategicIcon';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          Sistema de Planejamento Estratégico
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button variant="contained" color="primary">
            Iniciar
          </Button>
          <Button variant="outlined" color="secondary">
            Saiba mais
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <StrategicIcon type="perspective" showLabel size="large" />
          </Box>
          <Box>
            <StrategicIcon type="program" showLabel size="large" />
          </Box>
          <Box>
            <StrategicIcon type="objective" showLabel size="large" />
          </Box>
          <Box>
            <StrategicIcon type="initiative" showLabel size="large" />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
