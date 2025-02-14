export const approvalsData = {
  pendingRequests: [
    {
      id: 1,
      type: 'Iniciativa',
      title: 'Nova iniciativa de modernização',
      description: 'Proposta de iniciativa para modernização dos sistemas',
      requester: {
        name: 'João Silva',
        email: 'joao.silva@exemplo.com',
        unit: {
          id: 1,
          name: 'TI'
        }
      },
      requestDate: '2024-03-15',
      priority: 'Alta',
      impact: ['Sistemas', 'Processos', 'Usuários'],
      attachments: ['proposta.pdf', 'cronograma.xlsx'],
      unitId: 1,
      status: 'Aguardando aprovação'
    },
    {
      id: 2,
      type: 'Tarefa',
      title: 'Alteração de prazo - Desenvolvimento',
      description: 'Solicitação de extensão de prazo para desenvolvimento',
      requester: {
        name: 'Maria Santos',
        email: 'maria.santos@exemplo.com',
        unit: {
          id: 1,
          name: 'TI'
        }
      },
      requestDate: '2024-03-14',
      priority: 'Média',
      impact: ['Cronograma', 'Entregas'],
      unitId: 1,
      status: 'Aguardando aprovação'
    }
  ],
  approvalHistory: [
    {
      id: 1,
      type: 'Planejamento',
      title: 'Plano Anual 2024',
      description: 'Aprovação do plano anual de trabalho',
      requester: {
        name: 'Carlos Santos',
        email: 'carlos.santos@exemplo.com'
      },
      approver: {
        name: 'Ana Costa',
        email: 'ana.costa@exemplo.com'
      },
      requestDate: '2024-01-10',
      approvalDate: '2024-01-15',
      status: 'Concluído',
      comments: 'Plano aprovado conforme apresentado',
      attachments: ['plano_2024.pdf']
    }
  ],
  approvalFlows: [
    {
      id: 1,
      name: 'Fluxo de Aprovação - Iniciativas',
      description: 'Fluxo padrão para aprovação de novas iniciativas',
      type: 'Iniciativa',
      status: 'Ativo',
      requiredProfiles: ['PAA', 'Planejamento'],
      requireUnitMatch: true,
      steps: [
        {
          id: 1,
          role: 'Gestor da Unidade',
          order: 1,
          requiredProfiles: ['PAA'],
          requireUnitMatch: true,
          timeLimit: 48,
          notifications: true,
          status: 'Aguardando aprovação'
        },
        {
          id: 2,
          role: 'Planejamento',
          order: 2,
          requiredProfiles: ['Planejamento'],
          requireUnitMatch: false,
          timeLimit: 72,
          notifications: true,
          status: 'Pendente'
        }
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ]
}; 