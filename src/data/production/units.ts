export const unitsData = {
  units: [
    {
      id: 1,
      name: 'TI',
      code: 'TI-01',
      description: 'Tecnologia da Informação',
      manager: {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@exemplo.com'
      },
      parentUnit: null,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'RH',
      code: 'RH-01',
      description: 'Recursos Humanos',
      manager: {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@exemplo.com'
      },
      parentUnit: null,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Desenvolvimento',
      code: 'TI-DEV',
      description: 'Equipe de Desenvolvimento',
      manager: {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro.costa@exemplo.com'
      },
      parentUnit: 1,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  unitHierarchy: [
    {
      id: 1,
      name: 'TI',
      children: [
        {
          id: 3,
          name: 'Desenvolvimento',
          children: []
        }
      ]
    },
    {
      id: 2,
      name: 'RH',
      children: []
    }
  ],
  unitMetrics: [
    {
      unitId: 1,
      metrics: {
        totalEmployees: 25,
        activeProjects: 8,
        completedTasks: 156,
        pendingTasks: 42,
        performanceIndex: 0.85
      }
    },
    {
      unitId: 2,
      metrics: {
        totalEmployees: 15,
        activeProjects: 5,
        completedTasks: 98,
        pendingTasks: 23,
        performanceIndex: 0.92
      }
    }
  ]
}; 