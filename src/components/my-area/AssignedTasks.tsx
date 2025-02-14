'use client';

import React, { useState } from 'react';
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
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Collapse,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';

interface Task {
  id: number;
  name: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  status: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Atrasado' | 'Suspenso' | 'Descontinuado';
  dueDate: string;
  progress: number;
  responsible: string;
  weight: number;
}

interface Initiative {
  id: number;
  name: string;
  description: string;
  status: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Atrasado';
  startDate: string;
  endDate: string;
  tasks: Task[];
  progress: number;
}

interface AssignedTasksProps {
  initiatives: Initiative[];
}

const calculateInitiativeProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;

  // Soma dos pesos das tarefas
  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
  
  // Se não houver pesos definidos, usar média simples
  if (totalWeight === 0) {
    return tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length;
  }

  // Cálculo ponderado do progresso
  const weightedProgress = tasks.reduce((sum, task) => {
    return sum + (task.progress * task.weight);
  }, 0);

  return weightedProgress / totalWeight;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Baixa':
      return 'info';
    case 'Média':
      return 'warning';
    case 'Alta':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Não iniciado':
      return 'default';
    case 'Em andamento':
      return 'primary';
    case 'Concluído':
      return 'success';
    case 'Atrasado':
      return 'error';
    case 'Suspenso':
      return 'warning';
    default:
      return 'default';
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 90) return 'success';
  if (progress >= 70) return 'primary';
  if (progress >= 50) return 'warning';
  return 'error';
};

export const AssignedTasks: React.FC<AssignedTasksProps> = ({ initiatives = [] }) => {
  const [expandedInitiatives, setExpandedInitiatives] = useState<number[]>([]);
  const [loading] = useState(false);

  const toggleInitiative = (initiativeId: number) => {
    setExpandedInitiatives(prev =>
      prev.includes(initiativeId)
        ? prev.filter(id => id !== initiativeId)
        : [...prev, initiativeId]
    );
  };

  // Renderiza estado de carregamento
  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  // Renderiza mensagem quando não há dados
  if (!initiatives || initiatives.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="info">
          Nenhuma tarefa encontrada. Clique no botão "+" para adicionar uma nova tarefa.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Minhas Tarefas</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Adicionar tarefa">
            <IconButton size="small">
              <Icon name="plus" size="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Atualizar">
            <IconButton size="small">
              <Icon name="sync" size="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Nome</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progresso</TableCell>
              <TableCell>Prazo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {initiatives.map((initiative) => (
              <React.Fragment key={initiative.id}>
                <TableRow
                  hover
                  onClick={() => toggleInitiative(initiative.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <IconButton size="small">
                      <Icon
                        name={expandedInitiatives.includes(initiative.id) ? 'expand_less' : 'expand_more'}
                        size="small"
                      />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{initiative.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {initiative.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={initiative.status}
                      color={getStatusColor(initiative.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={initiative.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'background.default',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: getProgressColor(initiative.progress)
                          }
                        }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {initiative.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(initiative.endDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{
                      py: 0,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Collapse
                      in={expandedInitiatives.includes(initiative.id)}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box sx={{ py: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Nome</TableCell>
                              <TableCell>Prioridade</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Progresso</TableCell>
                              <TableCell>Responsável</TableCell>
                              <TableCell>Prazo</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {initiative.tasks.map((task) => (
                              <TableRow key={task.id}>
                                <TableCell>
                                  <Typography variant="body2">{task.name}</Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {task.description}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: getPriorityColor(task.priority) }}
                                  >
                                    {task.priority}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={task.status}
                                    color={getStatusColor(task.status)}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ minWidth: 100 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={task.progress}
                                      sx={{
                                        height: 4,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        '& .MuiLinearProgress-bar': {
                                          borderRadius: 2,
                                          bgcolor: getProgressColor(task.progress)
                                        }
                                      }}
                                    />
                                    <Typography variant="caption" color="textSecondary">
                                      {task.progress}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{task.responsible}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}; 