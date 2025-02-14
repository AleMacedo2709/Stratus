import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  ButtonGroup,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Task {
  id: number;
  name: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  status: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Atrasado' | 'Suspenso' | 'Descontinuado';
  dueDate: string;
  assignee: string;
  tags: string[];
}

interface TaskCalendarProps {
  tasks: Task[];
}

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
    default:
      return 'default';
  }
};

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.dueDate), date));
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </Typography>
            <ButtonGroup size="small">
              <Button
                variant={view === 'month' ? 'contained' : 'outlined'}
                onClick={() => setView('month')}
              >
                Mês
              </Button>
              <Button
                variant={view === 'week' ? 'contained' : 'outlined'}
                onClick={() => setView('week')}
              >
                Semana
              </Button>
            </ButtonGroup>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Mês anterior">
              <IconButton size="small" onClick={handlePreviousMonth}>
                <Icon name="back" size="sm" />
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              variant="outlined"
              onClick={handleToday}
              sx={{ minWidth: 'auto' }}
            >
              Hoje
            </Button>
            <Tooltip title="Próximo mês">
              <IconButton size="small" onClick={handleNextMonth}>
                <Icon name="next" size="sm" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={1}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <Grid item xs key={day}>
              <Typography
                variant="subtitle2"
                align="center"
                sx={{ fontWeight: 'medium', mb: 1 }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={1}>
          {daysInMonth.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isCurrentDay = isToday(date);

            return (
              <Grid item xs key={date.toISOString()}>
                <Paper
                  sx={{
                    p: 1,
                    height: 120,
                    bgcolor: theme => isCurrentDay
                      ? theme.palette.primary.main + '10'
                      : !isCurrentMonth
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.02)'
                      : 'transparent',
                    border: theme => isCurrentDay
                      ? `1px solid ${theme.palette.primary.main}`
                      : '1px solid transparent',
                    '&:hover': {
                      bgcolor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.05)',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      color: theme => !isCurrentMonth
                        ? theme.palette.text.disabled
                        : isCurrentDay
                        ? theme.palette.primary.main
                        : 'inherit',
                    }}
                  >
                    {format(date, 'd')}
                  </Typography>
                  <Box sx={{ mt: 1, overflow: 'auto', maxHeight: 80 }}>
                    {dayTasks.map(task => (
                      <Card
                        key={task.id}
                        sx={{
                          mb: 0.5,
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 1,
                          },
                        }}
                      >
                        <CardContent sx={{ p: '4px 8px !important' }}>
                          <Typography variant="caption" noWrap>
                            {task.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            <Chip
                              size="small"
                              label={task.priority}
                              color={getPriorityColor(task.priority)}
                              sx={{ height: 16, fontSize: '0.65rem' }}
                            />
                            <Chip
                              size="small"
                              label={task.status.replace('_', ' ')}
                              color={getStatusColor(task.status)}
                              sx={{ height: 16, fontSize: '0.65rem' }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
}; 