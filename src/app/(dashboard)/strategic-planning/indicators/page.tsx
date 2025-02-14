'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';
import { StrategicBreadcrumb } from '@/components/strategic-planning/StrategicBreadcrumb';

interface Indicator {
  id: string;
  name: string;
  description: string;
  value: number;
  target: number;
  unit: string;
  status: 'success' | 'warning' | 'error';
  progress: number;
  frequency: string;
  responsible: string;
  lastUpdate: string;
}

// Mock data
const mockIndicators: Indicator[] = [
  {
    id: 'i1',
    name: 'Faturamento Mensal',
    description: 'Valor total do faturamento mensal da empresa',
    value: 850000,
    target: 1000000,
    unit: 'R$',
    status: 'warning',
    progress: 85,
    frequency: 'Mensal',
    responsible: 'João Silva',
    lastUpdate: '2024-02-15'
  },
  {
    id: 'i2',
    name: 'Margem de Lucro',
    description: 'Percentual de lucro sobre o faturamento',
    value: 25,
    target: 30,
    unit: '%',
    status: 'success',
    progress: 83,
    frequency: 'Mensal',
    responsible: 'Maria Santos',
    lastUpdate: '2024-02-15'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

export default function IndicatorsPage() {
  const searchParams = useSearchParams();
  const objectiveId = searchParams.get('objectiveId');

  return (
    <Container maxWidth={false}>
      <Box sx={{ mb: 4 }}>
        <StrategicBreadcrumb
          items={[
            { type: 'dashboard', id: 'home', name: 'Home', href: '/dashboard' },
            { type: 'perspective', id: 'perspective', name: 'Financeiro', href: '/strategic/perspectives' },
            { type: 'objective', id: objectiveId || '', name: 'Aumentar Faturamento', href: `/strategic/objectives/${objectiveId}` },
            { type: 'indicator', id: 'indicators', name: 'Indicadores', href: '' }
          ]}
        />
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Indicadores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhamento dos indicadores do objetivo estratégico
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Indicador</TableCell>
                <TableCell align="right">Meta do Ciclo</TableCell>
                <TableCell align="right">Realizado</TableCell>
                <TableCell>Progresso</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Frequência</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell>Última Atualização</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockIndicators.map((indicator) => (
                <TableRow key={indicator.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {indicator.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {indicator.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {indicator.target.toLocaleString()} {indicator.unit}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {indicator.value.toLocaleString()} {indicator.unit}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 150 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {indicator.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={indicator.progress}
                        color={getStatusColor(indicator.status)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={indicator.status === 'success' ? 'No Alvo' : indicator.status === 'warning' ? 'Atenção' : 'Crítico'}
                      color={getStatusColor(indicator.status)}
                      icon={<Icon name={indicator.status} size="small" />}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{indicator.frequency}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{indicator.responsible}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(indicator.lastUpdate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
} 