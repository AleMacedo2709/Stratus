export const profilesData = {
  profiles: [
    {
      id: 1,
      code: 'PAA',
      name: 'Perfil de Administrador de Aplicação',
      description: 'Acesso total ao sistema',
      permissions: [
        'criar:tarefa',
        'ler:tarefa',
        'atualizar:tarefa',
        'excluir:tarefa',
        'aprovar:tarefa',
        'criar:iniciativa',
        'ler:iniciativa',
        'atualizar:iniciativa',
        'excluir:iniciativa',
        'aprovar:iniciativa',
        'gerenciar:usuarios',
        'gerenciar:perfis',
        'gerenciar:unidades',
        'visualizar:relatorios',
        'exportar:dados'
      ],
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      code: 'GES',
      name: 'Gestor',
      description: 'Perfil para gestores de unidade',
      permissions: [
        'criar:tarefa',
        'ler:tarefa',
        'atualizar:tarefa',
        'aprovar:tarefa',
        'criar:iniciativa',
        'ler:iniciativa',
        'atualizar:iniciativa',
        'aprovar:iniciativa',
        'visualizar:relatorios'
      ],
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      code: 'COL',
      name: 'Colaborador',
      description: 'Perfil padrão para colaboradores',
      permissions: [
        'criar:tarefa',
        'ler:tarefa',
        'atualizar:tarefa',
        'ler:iniciativa'
      ],
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  permissionGroups: [
    {
      id: 1,
      name: 'Tarefas',
      permissions: [
        'criar:tarefa',
        'ler:tarefa',
        'atualizar:tarefa',
        'excluir:tarefa',
        'aprovar:tarefa'
      ]
    },
    {
      id: 2,
      name: 'Iniciativas',
      permissions: [
        'criar:iniciativa',
        'ler:iniciativa',
        'atualizar:iniciativa',
        'excluir:iniciativa',
        'aprovar:iniciativa'
      ]
    },
    {
      id: 3,
      name: 'Administração',
      permissions: [
        'gerenciar:usuarios',
        'gerenciar:perfis',
        'gerenciar:unidades'
      ]
    },
    {
      id: 4,
      name: 'Relatórios',
      permissions: [
        'visualizar:relatorios',
        'exportar:dados'
      ]
    }
  ],
  profileMetrics: [
    {
      profileId: 1,
      totalUsers: 5,
      activeUsers: 5,
      lastUpdated: '2024-03-15T10:00:00Z'
    },
    {
      profileId: 2,
      totalUsers: 15,
      activeUsers: 14,
      lastUpdated: '2024-03-15T10:00:00Z'
    },
    {
      profileId: 3,
      totalUsers: 80,
      activeUsers: 75,
      lastUpdated: '2024-03-15T10:00:00Z'
    }
  ]
}; 