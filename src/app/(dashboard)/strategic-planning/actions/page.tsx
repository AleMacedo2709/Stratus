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

interface Action {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
  startDate: string;
  endDate: string;
  responsible: string;
  budget: number;
  lastUpdate: string;
}

// Mock data
const mockActions: Action[] = [
  {
    id: 'a1',
    name: 'Expandir para novos mercados',
    description: 'Implementar plano de expansão para novas regiões',
    progress: 60,
    status: 'on_track',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    responsible: 'Carlos Oliveira',
    budget: 500000,
    lastUpdate: '2024-02-15'
  },
  {
    id: 'a2',
    name: 'Desenvolver novos produtos',
    description: 'Criar e lançar nova linha de produtos',
    progress: 45,
    status: 'at_risk',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    responsible: 'Ana Paula',
    budget: 300000,
    lastUpdate: '2024-02-14'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'on_track':
      return 'success';
    case 'at_risk':
      return 'warning';
    case 'delayed':
      return 'error';
    case 'completed':
      return 'info';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'on_track':
      return 'No Prazo';
    case 'at_risk':
      return 'Em Risco';
    case 'delayed':
      return 'Atrasado';
    case 'completed':
      return 'Concluído';
    default:
      return status;
  }
};

export default function ActionsPage() {
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
            { type: 'action', id: 'actions', name: 'Ações', href: '' }
          ]}
        />
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Ações Estratégicas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhamento das ações do objetivo estratégico
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ação</TableCell>
                <TableCell>Progresso</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Prazo</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell align="right">Orçamento</TableCell>
                <TableCell>Última Atualização</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockActions.map((action) => (
                <TableRow key={action.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {action.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 150 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {action.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={action.progress}
                        color={getStatusColor(action.status)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusLabel(action.status)}
                      color={getStatusColor(action.status)}
                      icon={<Icon name={action.status === 'completed' ? 'success' : action.status} size="small" />}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Início: {new Date(action.startDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Fim: {new Date(action.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{action.responsible}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {action.budget.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(action.lastUpdate).toLocaleDateString()}
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