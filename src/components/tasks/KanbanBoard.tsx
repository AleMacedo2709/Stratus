'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Card, Chip, Avatar } from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Status = 'Não iniciado' | 'Em andamento' | 'Concluído';

interface TaskItem {
  id: string;
  name: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  progress: number;
  status: Status;
  startDate: string;
  endDate: string;
  assignee: {
    name: string;
    avatar?: string;
  };
  tags: string[];
}

interface Column {
  id: Status;
  title: string;
  items: TaskItem[];
}

type Columns = Record<Status, Column>;

const STATUS_COLORS: Record<Status, string> = {
  'Não iniciado': '#ff9800',
  'Em andamento': '#2196f3',
  'Concluído': '#4caf50'
};

const initialColumns: Columns = {
  'Não iniciado': {
    id: 'Não iniciado',
    title: 'Não Iniciado',
    items: [
      {
        id: '1',
        name: 'Implementar autenticação',
        description: 'Implementar sistema de login com Azure AD',
        priority: 'Alta',
        progress: 0,
        status: 'Não iniciado',
        startDate: '2024-03-01',
        endDate: '2024-03-20',
        assignee: {
          name: 'João Silva',
          avatar: 'https://i.pravatar.cc/150?u=joao'
        },
        tags: ['Backend', 'Segurança']
      },
      {
        id: '2',
        name: 'Criar interface do usuário',
        description: 'Desenvolver componentes da interface',
        priority: 'Média',
        progress: 0,
        status: 'Não iniciado',
        startDate: '2024-03-15',
        endDate: '2024-04-15',
        assignee: {
          name: 'Maria Santos',
          avatar: 'https://i.pravatar.cc/150?u=maria'
        },
        tags: ['Frontend', 'UI/UX']
      }
    ]
  },
  'Em andamento': {
    id: 'Em andamento',
    title: 'Em Andamento',
    items: [
      {
        id: '3',
        name: 'Testes de integração',
        description: 'Realizar testes de integração do sistema',
        priority: 'Baixa',
        progress: 50,
        status: 'Em andamento',
        startDate: '2024-02-15',
        endDate: '2024-03-10',
        assignee: {
          name: 'Pedro Costa',
          avatar: 'https://i.pravatar.cc/150?u=pedro'
        },
        tags: ['QA', 'Testes']
      }
    ]
  },
  'Concluído': {
    id: 'Concluído',
    title: 'Concluído',
    items: []
  }
};

const PRIORITY_COLORS = {
  'Baixa': '#66bb6a',
  'Média': '#ffa726',
  'Alta': '#f44336'
} as const;

export const KanbanBoard = () => {
  const [columns, setColumns] = useState<Columns>(initialColumns);

  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumnId: Status) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: Status) => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId') as Status;
    
    if (sourceColumnId === targetColumnId) return;

    const sourceColumn = columns[sourceColumnId];
    const targetColumn = columns[targetColumnId];
    
    if (!sourceColumn || !targetColumn) return;

    const taskToMove = sourceColumn.items.find(item => item.id === taskId);
    if (!taskToMove) return;

    // Atualizar o status e progresso da tarefa
    const updatedTask: TaskItem = {
      ...taskToMove,
      status: targetColumnId,
      progress: targetColumnId === 'Concluído' ? 100 : 
               targetColumnId === 'Em andamento' ? Math.max(10, taskToMove.progress) : 
               targetColumnId === 'Não iniciado' ? 0 : 
               taskToMove.progress
    };

    setColumns({
      ...columns,
      [sourceColumnId]: {
        ...sourceColumn,
        items: sourceColumn.items.filter(item => item.id !== taskId)
      },
      [targetColumnId]: {
        ...targetColumn,
        items: [...targetColumn.items, updatedTask]
      }
    });

    console.log(`Task ${taskId} status updated to: ${targetColumnId}`);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return '#4caf50';
    if (progress >= 50) return '#ff9800';
    if (progress >= 25) return '#ff5722';
    return '#f44336';
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, overflowX: 'auto', minHeight: '80vh' }}>
      {(Object.entries(columns) as [Status, Column][]).map(([columnId, column]) => (
        <Paper 
          key={columnId} 
          sx={{ 
            width: 300,
            minWidth: 300,
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column'
          }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, columnId)}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider', 
            bgcolor: 'background.paper',
            borderLeft: 4,
            borderLeftColor: STATUS_COLORS[columnId]
          }}>
            <Typography variant="h6">
              {column.title} ({column.items.length})
            </Typography>
          </Box>
          
          <Box sx={{ p: 1, flexGrow: 1, overflowY: 'auto' }}>
            {column.items.map((item: TaskItem) => (
              <Card
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id, columnId)}
                sx={{ 
                  p: 2, 
                  mb: 1,
                  cursor: 'move',
                  borderLeft: 4,
                  borderLeftColor: STATUS_COLORS[item.status],
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  {item.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      bgcolor: `${PRIORITY_COLORS[item.priority]}20`,
                      color: PRIORITY_COLORS[item.priority],
                      border: 1,
                      borderColor: `${PRIORITY_COLORS[item.priority]}40`
                    }}
                  >
                    {item.priority}
                  </Box>

                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      bgcolor: `${STATUS_COLORS[item.status]}20`,
                      color: STATUS_COLORS[item.status],
                      border: 1,
                      borderColor: `${STATUS_COLORS[item.status]}40`
                    }}
                  >
                    {item.status}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                    <Avatar
                      src={item.assignee.avatar}
                      alt={item.assignee.name}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                    <Typography variant="caption">
                      {item.assignee.name}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box
                    sx={{
                      flex: 1,
                      height: 4,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${item.progress}%`,
                        height: '100%',
                        bgcolor: getProgressColor(item.progress),
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {item.progress}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Início: {formatDate(item.startDate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Fim: {formatDate(item.endDate)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {item.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </Card>
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};