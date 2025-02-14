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
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  TableSortLabel,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';
import { AuthorizationService } from '@/services/auth/AuthorizationService';
import { colors } from '@/styles/colors';

interface Task {
  id: number;
  name: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  status: 'Aguardando aprovação' | 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Suspenso' | 'Descontinuado';
  dueDate: string;
  assignee: {
    id: string;
    name: string;
    unit: {
      id: number;
      name: string;
    };
  };
  unit: {
    id: number;
    name: string;
  };
  tags: string[];
}

interface TaskListProps {
  tasks: Task[];
  currentUser: {
    id: string;
    profile: string;
    unitId: number;
  };
}

type SortField = 'name' | 'priority' | 'status' | 'dueDate' | 'assignee';
type SortOrder = 'asc' | 'desc';

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
    case 'Aguardando aprovação':
      return 'warning';
    case 'Não iniciado':
      return 'default';
    case 'Em andamento':
      return 'info';
    case 'Concluído':
      return 'success';
    case 'Suspenso':
      return 'warning';
    case 'Descontinuado':
      return 'error';
    default:
      return 'default';
  }
};

export const TaskList: React.FC<TaskListProps> = ({ 
  tasks: initialTasks = [], 
  currentUser = { id: '', profile: '', unitId: 0 } 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const authService = new AuthorizationService();

  const canManageTask = (task: Task): boolean => {
    if (!currentUser?.id || !currentUser?.profile || !currentUser?.unitId) {
      return false;
    }

    // Usuário responsável pode atualizar a própria tarefa
    if (task.assignee.id === currentUser.id) {
      return true;
    }

    // PAA pode gerenciar tarefas da sua unidade
    if (currentUser.profile === 'PAA' && task.unit.id === currentUser.unitId) {
      return true;
    }

    return false;
  };

  const canCreateTask = (): boolean => {
    if (!currentUser?.profile) {
      return false;
    }
    return ['PAA', 'Usuário'].includes(currentUser.profile);
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const filteredAndSortedTasks = initialTasks
    .filter((task) => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'priority': {
          const priorityOrder = { Alta: 3, Média: 2, Baixa: 1 };
          return multiplier * (priorityOrder[a.priority] - priorityOrder[b.priority]);
        }
        case 'status': {
          const statusOrder = {
            'Aguardando aprovação': 1,
            'Não iniciado': 2,
            'Em andamento': 3,
            'Concluído': 4,
            'Suspenso': 5,
            'Descontinuado': 6
          };
          return multiplier * (statusOrder[a.status] - statusOrder[b.status]);
        }
        case 'dueDate':
          return multiplier * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        case 'assignee':
          return multiplier * a.assignee.name.localeCompare(b.assignee.name);
        default:
          return 0;
      }
    });

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Lista de Tarefas</Typography>
          {canCreateTask() && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon name="plus" size="small" />}
            >
              Nova Tarefa
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Pesquisar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon name="search" size="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="all">Todos os Status</MenuItem>
            <MenuItem value="Aguardando aprovação">Aguardando aprovação</MenuItem>
            <MenuItem value="Não iniciado">Não iniciado</MenuItem>
            <MenuItem value="Em andamento">Em andamento</MenuItem>
            <MenuItem value="Concluído">Concluído</MenuItem>
            <MenuItem value="Suspenso">Suspenso</MenuItem>
            <MenuItem value="Descontinuado">Descontinuado</MenuItem>
          </TextField>
          
          <TextField
            select
            size="small"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">Todas as Prioridades</MenuItem>
            <MenuItem value="Baixa">Baixa</MenuItem>
            <MenuItem value="Média">Média</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
          </TextField>
        </Box>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Nome
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'priority'}
                  direction={sortField === 'priority' ? sortOrder : 'asc'}
                  onClick={() => handleSort('priority')}
                >
                  Prioridade
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'dueDate'}
                  direction={sortField === 'dueDate' ? sortOrder : 'asc'}
                  onClick={() => handleSort('dueDate')}
                >
                  Prazo
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'assignee'}
                  direction={sortField === 'assignee' ? sortOrder : 'asc'}
                  onClick={() => handleSort('assignee')}
                >
                  Responsável
                </TableSortLabel>
              </TableCell>
              <TableCell>Unidade</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedTasks.map((task) => (
              <TableRow key={task.id} hover>
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
                    label={task.status}
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
                  <Typography variant="body2">{task.assignee.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{task.unit?.name || 'Sem unidade'}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {task.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        size="small"
                        label={tag}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="Ver detalhes">
                      <IconButton size="small">
                        <Icon name="eye" size="small" />
                      </IconButton>
                    </Tooltip>
                    {canManageTask(task) && (
                      <>
                        <Tooltip title="Editar">
                          <IconButton size="small">
                            <Icon name="edit" size="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error">
                            <Icon name="trash" size="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
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