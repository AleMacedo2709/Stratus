export const dashboardData = {
  summary: {
    initiatives: {
      total: 12,
      completed: 5,
      inProgress: 6,
      delayed: 1
    },
    tasks: {
      total: 48,
      completed: 28,
      inProgress: 15,
      delayed: 5
    },
    indicators: {
      total: 24,
      onTarget: 18,
      warning: 4,
      critical: 2
    }
  },
  recentActivities: [
    {
      id: 1,
      type: 'Tarefa',
      description: 'Nova tarefa criada: Implementação do módulo de relatórios',
      user: 'Maria Silva',
      date: '2024-03-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'Indicador',
      description: 'Indicador atualizado: Satisfação dos usuários',
      user: 'João Santos',
      date: '2024-03-15T09:15:00Z'
    },
    {
      id: 3,
      type: 'Iniciativa',
      description: 'Iniciativa concluída: Modernização do atendimento',
      user: 'Ana Costa',
      date: '2024-03-14T16:45:00Z'
    }
  ],
  upcomingDeadlines: [
    {
      id: 1,
      type: 'Tarefa',
      name: 'Revisão de documentação',
      dueDate: '2024-03-20',
      owner: 'Pedro Oliveira',
      status: 'Em andamento'
    },
    {
      id: 2,
      type: 'Iniciativa',
      name: 'Implementação do novo sistema',
      dueDate: '2024-03-25',
      owner: 'Carlos Santos',
      status: 'Em andamento'
    }
  ],
  performanceMetrics: {
    weeklyProgress: [
      { week: '10-16 Mar', planned: 85, actual: 82 },
      { week: '03-09 Mar', planned: 70, actual: 73 },
      { week: '24 Feb-02 Mar', planned: 55, actual: 58 },
      { week: '17-23 Feb', planned: 40, actual: 42 }
    ],
    taskCompletion: {
      onTime: 85,
      delayed: 15
    },
    resourceUtilization: 78
  }
}; 