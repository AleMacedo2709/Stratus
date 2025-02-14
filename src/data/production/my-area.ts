export const myAreaData = {
  initiatives: [
    {
      id: 1,
      name: 'Implementação do Sistema de Gestão Eletrônica',
      description: 'Modernização dos processos através de sistema digital',
      status: 'Em andamento',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      progress: 65,
      tasks: [
        {
          id: 1,
          name: 'Levantamento de Requisitos',
          description: 'Análise e documentação dos requisitos do sistema',
          priority: 'Alta',
          status: 'Em andamento',
          dueDate: '2024-03-30',
          progress: 80,
          responsible: 'Maria Santos',
          weight: 2
        },
        {
          id: 2,
          name: 'Definição de Arquitetura',
          description: 'Planejamento da arquitetura do sistema',
          priority: 'Média',
          status: 'Não iniciado',
          dueDate: '2024-04-15',
          progress: 0,
          responsible: 'Pedro Costa',
          weight: 1.5
        },
        {
          id: 3,
          name: 'Desenvolvimento do Protótipo',
          description: 'Criação do protótipo inicial do sistema',
          priority: 'Alta',
          status: 'Não iniciado',
          dueDate: '2024-05-15',
          progress: 0,
          responsible: 'Ana Silva',
          weight: 2.5
        }
      ]
    },
    {
      id: 2,
      name: 'Capacitação da Equipe em Novas Tecnologias',
      description: 'Programa de treinamento em ferramentas modernas',
      status: 'Não iniciado',
      startDate: '2024-04-01',
      endDate: '2024-09-30',
      progress: 0,
      tasks: [
        {
          id: 4,
          name: 'Planejamento do Programa',
          description: 'Definição do conteúdo e cronograma de treinamentos',
          priority: 'Alta',
          status: 'Não iniciado',
          dueDate: '2024-04-10',
          progress: 0,
          responsible: 'Mariana Costa',
          weight: 1
        },
        {
          id: 5,
          name: 'Preparação do Material',
          description: 'Elaboração do material didático',
          priority: 'Média',
          status: 'Não iniciado',
          dueDate: '2024-05-01',
          progress: 0,
          responsible: 'Roberto Alves',
          weight: 1.5
        }
      ]
    },
    {
      id: 3,
      name: 'Otimização de Processos Internos',
      description: 'Revisão e melhoria dos processos operacionais',
      status: 'Em andamento',
      startDate: '2024-02-01',
      endDate: '2024-07-31',
      progress: 45,
      tasks: [
        {
          id: 6,
          name: 'Mapeamento de Processos',
          description: 'Documentação dos processos atuais',
          priority: 'Alta',
          status: 'Concluído',
          dueDate: '2024-03-15',
          progress: 100,
          responsible: 'Fernando Lima',
          weight: 1
        },
        {
          id: 7,
          name: 'Análise de Gargalos',
          description: 'Identificação de pontos de melhoria',
          priority: 'Alta',
          status: 'Em andamento',
          dueDate: '2024-04-30',
          progress: 60,
          responsible: 'Patricia Santos',
          weight: 1.5
        },
        {
          id: 8,
          name: 'Implementação de Melhorias',
          description: 'Execução das melhorias identificadas',
          priority: 'Média',
          status: 'Não iniciado',
          dueDate: '2024-06-30',
          progress: 0,
          responsible: 'Ricardo Silva',
          weight: 2
        }
      ]
    }
  ]
}; 