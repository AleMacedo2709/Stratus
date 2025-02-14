export const strategicPlanningData = {
  cycle: {
    id: 1,
    name: 'Ciclo 2024-2027',
    startDate: '2024-01-01',
    endDate: '2027-12-31',
    status: 'Ativo',
    mission: 'Promover a excelência em gestão e inovação',
    vision: 'Ser referência em transformação digital até 2027',
    values: [
      {
        id: 1,
        name: 'Inovação',
        description: 'Buscar constantemente soluções criativas e disruptivas'
      },
      {
        id: 2,
        name: 'Excelência',
        description: 'Buscar os mais altos padrões de qualidade'
      },
      {
        id: 3,
        name: 'Colaboração',
        description: 'Trabalhar em conjunto para alcançar objetivos comuns'
      }
    ]
  },
  perspectives: [
    {
      id: 1,
      name: 'Sociedade',
      description: 'Impacto na sociedade e satisfação dos cidadãos',
      objectives: [
        {
          id: 1,
          name: 'Aumentar a satisfação dos usuários',
          description: 'Melhorar a experiência e satisfação dos usuários',
          indicators: [
            {
              id: 1,
              name: 'Índice de Satisfação',
              current: 85,
              target: 95,
              unit: '%',
              frequency: 'Mensal',
              trend: 'up',
              history: [
                { date: '2024-01-01', value: 82 },
                { date: '2024-02-01', value: 84 },
                { date: '2024-03-01', value: 85 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Processos Internos',
      description: 'Eficiência e qualidade dos processos',
      objectives: [
        {
          id: 2,
          name: 'Otimizar processos internos',
          description: 'Aumentar a eficiência operacional',
          indicators: [
            {
              id: 2,
              name: 'Tempo médio de atendimento',
              current: 25,
              target: 15,
              unit: 'minutos',
              frequency: 'Diário',
              trend: 'down',
              history: [
                { date: '2024-01-01', value: 30 },
                { date: '2024-02-01', value: 28 },
                { date: '2024-03-01', value: 25 }
              ]
            }
          ]
        }
      ]
    }
  ],
  initiatives: [
    {
      id: 1,
      name: 'Transformação Digital',
      description: 'Modernização dos sistemas e processos',
      status: 'Em andamento',
      progress: 45,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      owner: {
        id: 1,
        name: 'João Silva',
        email: 'joao.silva@exemplo.com'
      },
      tasks: [
        {
          id: 1,
          name: 'Análise de requisitos',
          status: 'Concluído',
          progress: 100,
          startDate: '2024-01-01',
          endDate: '2024-02-29'
        },
        {
          id: 2,
          name: 'Desenvolvimento do sistema',
          status: 'Em andamento',
          progress: 60,
          startDate: '2024-03-01',
          endDate: '2024-08-31'
        }
      ]
    }
  ],
  indicators: [
    {
      id: 1,
      name: 'Satisfação dos Usuários',
      description: 'Índice geral de satisfação',
      type: 'Quantitativo',
      unit: '%',
      frequency: 'Mensal',
      baseline: 80,
      target: 95,
      current: 85,
      trend: 'up',
      history: [
        { date: '2024-01-01', value: 82 },
        { date: '2024-02-01', value: 84 },
        { date: '2024-03-01', value: 85 }
      ]
    },
    {
      id: 2,
      name: 'Tempo de Resposta',
      description: 'Tempo médio de resposta a solicitações',
      type: 'Quantitativo',
      unit: 'minutos',
      frequency: 'Diário',
      baseline: 30,
      target: 15,
      current: 25,
      trend: 'down',
      history: [
        { date: '2024-01-01', value: 30 },
        { date: '2024-02-01', value: 28 },
        { date: '2024-03-01', value: 25 }
      ]
    }
  ]
};

export const perspectives = strategicPlanningData.perspectives;