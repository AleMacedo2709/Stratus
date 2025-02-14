'use client';

import React, { useState } from 'react';
import { Box, Container, Tabs, Tab } from '@mui/material';
import { TaskList } from '@/components/tasks/TaskList';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskCalendar } from '@/components/tasks/TaskCalendar';
import { Icon } from '@/components/common/Icons';

// Mock data for tasks
const mockTasks = [
  {
    id: 1,
    name: 'Implementar Sistema de Autenticação',
    description: 'Desenvolver sistema de login com Azure AD',
    priority: 'High' as const,
    status: 'In_Progress' as const,
    dueDate: '2024-03-30',
    assignee: 'João Silva',
    tags: ['Backend', 'Segurança', 'Azure'],
  },
  {
    id: 2,
    name: 'Criar Interface de Usuário',
    description: 'Desenvolver componentes da interface do usuário',
    priority: 'Medium' as const,
    status: 'Not_Started' as const,
    dueDate: '2024-04-15',
    assignee: 'Maria Santos',
    tags: ['Frontend', 'UI/UX', 'React'],
  },
  {
    id: 3,
    name: 'Testes de Integração',
    description: 'Realizar testes de integração do sistema',
    priority: 'Low' as const,
    status: 'Completed' as const,
    dueDate: '2024-03-25',
    assignee: 'Pedro Costa',
    tags: ['QA', 'Testes', 'Automação'],
  },
  {
    id: 4,
    name: 'Documentação da API',
    description: 'Documentar endpoints e modelos da API',
    priority: 'Medium' as const,
    status: 'Delayed' as const,
    dueDate: '2024-03-20',
    assignee: 'Ana Oliveira',
    tags: ['Documentação', 'API', 'Swagger'],
  },
  {
    id: 5,
    name: 'Otimização de Performance',
    description: 'Melhorar o desempenho do sistema',
    priority: 'High' as const,
    status: 'In_Progress' as const,
    dueDate: '2024-04-05',
    assignee: 'Carlos Souza',
    tags: ['Performance', 'Backend', 'Frontend'],
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tasks-tabpanel-${index}`}
      aria-labelledby={`tasks-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tasks-tab-${index}`,
    'aria-controls': `tasks-tabpanel-${index}`,
  };
}

export default function TasksPage() {
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState(mockTasks);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTaskMove = (taskId: number, newStatus: string) => {
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus as typeof task.status }
          : task
      )
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="tasks views"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<Icon name="list" size="small" />}
            iconPosition="start"
            label="Lista"
            {...a11yProps(0)}
          />
          <Tab
            icon={<Icon name="kanban" size="small" />}
            iconPosition="start"
            label="Kanban"
            {...a11yProps(1)}
          />
          <Tab
            icon={<Icon name="calendar" size="small" />}
            iconPosition="start"
            label="Calendário"
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TaskList tasks={tasks} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <TaskCalendar tasks={tasks} />
      </TabPanel>
    </Container>
  );
} 