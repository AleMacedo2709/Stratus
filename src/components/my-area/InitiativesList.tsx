'use client';

import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@/components/common/Icons';

interface Initiative {
  id: number;
  name: string;
  description: string;
  status: 'Not_Started' | 'In_Progress' | 'Completed' | 'Delayed' | 'Cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  resources: string[];
}

interface InitiativesListProps {
  initiatives: Initiative[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Not_Started':
      return 'default';
    case 'In_Progress':
      return 'primary';
    case 'Completed':
      return 'success';
    case 'Delayed':
      return 'warning';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Not_Started':
      return 'pending';
    case 'In_Progress':
      return 'in_progress';
    case 'Completed':
      return 'completed';
    case 'Delayed':
      return 'delayed';
    case 'Cancelled':
      return 'cancelled';
    default:
      return 'info';
  }
};

export const InitiativesList: React.FC<InitiativesListProps> = ({ initiatives }) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Minhas Iniciativas</Typography>
        <Tooltip title="Atualizar">
          <IconButton size="small">
            <Icon name="sync" size="sm" />
          </IconButton>
        </Tooltip>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progresso</TableCell>
              <TableCell>Prazo</TableCell>
              <TableCell>Recursos</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {initiatives.map((initiative) => (
              <TableRow key={initiative.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {initiative.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {initiative.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    icon={<Icon name={getStatusIcon(initiative.status)} size="sm" />}
                    label={initiative.status.replace('_', ' ')}
                    color={getStatusColor(initiative.status)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 150 }}>
                    <LinearProgress
                      variant="determinate"
                      value={initiative.progress}
                      sx={{
                        flexGrow: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getStatusColor(initiative.status),
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ minWidth: 35 }}>
                      {initiative.progress}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="caption" color="text.secondary">
                      Início: {new Date(initiative.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fim: {new Date(initiative.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {initiative.resources.map((resource, index) => (
                      <Chip
                        key={index}
                        size="small"
                        label={resource}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="Ver detalhes">
                      <IconButton size="small">
                        <Icon name="eye" size="sm" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small">
                        <Icon name="edit" size="sm" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}; 