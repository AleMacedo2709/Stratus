export const userData = {
  currentUser: {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    profile: 'PAA',
    unit: {
      id: 1,
      name: 'TI',
      code: 'TI-01',
      description: 'Tecnologia da Informação'
    },
    permissions: [
      'criar:tarefa',
      'ler:tarefa',
      'atualizar:tarefa',
      'excluir:tarefa',
      'aprovar:tarefa',
      'ler:iniciativa',
      'atualizar:iniciativa'
    ],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  myTasks: [
    {
      id: 1,
      name: 'Implementar autenticação',
      description: 'Implementar sistema de login com Azure AD',
      priority: 'High',
      status: 'In_Progress',
      dueDate: '2024-03-20',
      dependencies: ['Configuração do Azure AD']
    },
    {
      id: 2,
      name: 'Documentar API',
      description: 'Criar documentação da API usando Swagger',
      priority: 'Medium',
      status: 'Not_Started',
      dueDate: '2024-03-25',
      dependencies: ['Implementação dos endpoints']
    }
  ],
  myIndicators: [
    {
      id: 1,
      name: 'Taxa de Conclusão',
      value: 85,
      target: 90,
      unit: '%',
      trend: 'up',
      status: 'warning'
    },
    {
      id: 2,
      name: 'Prazo Médio',
      value: 12,
      target: 10,
      unit: 'dias',
      trend: 'down',
      status: 'error'
    }
  ],
  historicalData: [
    {
      month: 'Janeiro',
      actual: 82,
      target: 85
    },
    {
      month: 'Fevereiro',
      actual: 85,
      target: 87
    },
    {
      month: 'Março',
      actual: 88,
      target: 90
    }
  ]
}; 