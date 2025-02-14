export const tasksData = {
  tasks: [
    {
      id: '1',
      name: 'Implementar autenticação',
      description: 'Implementar sistema de login com Azure AD',
      priority: 'Alta',
      status: 'Em andamento',
      startDate: '2024-03-01',
      endDate: '2024-03-20',
      progress: 75,
      assignee: {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@exemplo.com',
        unit: {
          id: 1,
          name: 'TI'
        }
      },
      unit: {
        id: 1,
        name: 'TI'
      },
      tags: ['Backend', 'Segurança']
    },
    {
      id: '2',
      name: 'Criar interface do usuário',
      description: 'Desenvolver componentes da interface',
      priority: 'Média',
      status: 'Não iniciado',
      startDate: '2024-03-15',
      endDate: '2024-04-15',
      progress: 0,
      assignee: {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@exemplo.com',
        unit: {
          id: 1,
          name: 'TI'
        }
      },
      unit: {
        id: 1,
        name: 'TI'
      },
      tags: ['Frontend', 'UI/UX']
    },
    {
      id: '3',
      name: 'Testes de integração',
      description: 'Realizar testes de integração do sistema',
      priority: 'Média',
      status: 'Em andamento',
      startDate: '2024-02-15',
      endDate: '2024-03-10',
      progress: 100,
      assignee: {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro.costa@exemplo.com',
        unit: {
          id: 1,
          name: 'TI'
        }
      },
      unit: {
        id: 1,
        name: 'TI'
      },
      tags: ['QA', 'Testes']
    }
  ],
  kanbanColumns: [
    {
      id: 'Não iniciado',
      title: 'Não Iniciado',
      tasks: []
    },
    {
      id: 'Em andamento',
      title: 'Em Andamento',
      tasks: []
    },
    {
      id: 'Concluído',
      title: 'Concluído',
      tasks: []
    },
    {
      id: 'Suspenso',
      title: 'Suspenso',
      tasks: []
    }
  ]
}; 