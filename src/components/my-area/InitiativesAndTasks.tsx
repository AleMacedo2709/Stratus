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
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Collapse,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@/components/common/Icons';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Task {
  id: number;
  name: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  status: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Atrasado';
  dueDate: string;
  dependencies: string[];
  assignee: User;
}

interface Initiative {
  id: number;
  name: string;
  description: string;
  status: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Atrasado' | 'Cancelado';
  progress: number;
  startDate: string;
  endDate: string;
  resources: string[];
  tasks: Task[];
}

interface InitiativesAndTasksProps {
  initiatives: Initiative[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Não iniciado':
      return colors.status.default;
    case 'Em andamento':
      return colors.status.info;
    case 'Concluído':
      return colors.status.success;
    case 'Atrasado':
      return colors.status.danger;
    case 'Cancelado':
      return colors.status.warning;
    default:
      return colors.status.default;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Baixa':
      return colors.priority.low;
    case 'Média':
      return colors.priority.medium;
    case 'Alta':
      return colors.priority.high;
    default:
      return colors.priority.default;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Não iniciado':
      return 'pending';
    case 'Em andamento':
      return 'in_progress';
    case 'Concluído':
      return 'completed';
    case 'Atrasado':
      return 'delayed';
    case 'Cancelado':
      return 'cancelled';
    default:
      return 'pending';
  }
};

export const InitiativesAndTasks: React.FC<InitiativesAndTasksProps> = ({ initiatives }) => {
  const theme = useTheme();
  const [expandedInitiative, setExpandedInitiative] = useState<number | null>(null);

  const toggleInitiative = (initiativeId: number) => {
    setExpandedInitiative(expandedInitiative === initiativeId ? null : initiativeId);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Minhas Iniciativas e Tarefas</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Adicionar iniciativa">
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
              <TableCell style={{ width: '40px' }}></TableCell>
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
              <React.Fragment key={initiative.id}>
                {/* Initiative Row */}
                <TableRow
                  hover
                  onClick={() => toggleInitiative(initiative.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <IconButton size="small">
                      <Icon
                        name={expandedInitiative === initiative.id ? 'chevron-down' : 'chevron-right'}
                        size="small"
                      />
                    </IconButton>
                  </TableCell>
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
                      icon={<Icon name={getStatusIcon(initiative.status)} size="small" />}
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
                    <Typography variant="body2">
                      {new Date(initiative.startDate).toLocaleDateString()} - {new Date(initiative.endDate).toLocaleDateString()}
                    </Typography>
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
                      <Tooltip title="Visualizar">
                        <IconButton size="small">
                          <Icon name="eye" size="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small">
                          <Icon name="edit" size="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>

                {/* Tasks Rows */}
                <TableRow>
                  <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={expandedInitiative === initiative.id} timeout="auto" unmountOnExit>
                      <Box sx={{ py: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ width: '40px' }}></TableCell>
                              <TableCell>Tarefa</TableCell>
                              <TableCell>Prioridade</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Prazo</TableCell>
                              <TableCell>Responsável</TableCell>
                              <TableCell>Dependências</TableCell>
                              <TableCell align="right">Ações</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {initiative.tasks.map((task) => (
                              <TableRow key={task.id} hover>
                                <TableCell></TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    {task.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {task.description}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={task.priority}
                                    color={getPriorityColor(task.priority)}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={task.status.replace('_', ' ')}
                                    color={getStatusColor(task.status)}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar
                                      src={task.assignee.avatar}
                                      alt={task.assignee.name}
                                      sx={{ width: 24, height: 24 }}
                                    />
                                    <Typography variant="body2">
                                      {task.assignee.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {task.dependencies.map((dep, index) => (
                                      <Chip
                                        key={index}
                                        size="small"
                                        label={dep}
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Tooltip title="Editar">
                                      <IconButton size="small">
                                        <Icon name="edit" size="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Excluir">
                                      <IconButton size="small">
                                        <Icon name="trash" size="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
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