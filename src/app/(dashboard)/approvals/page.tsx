'use client';

import React, { useState } from 'react';
import { Box, Container, Tabs, Tab } from '@mui/material';
import { PendingRequests } from '@/components/approvals/PendingRequests';
import { ApprovalHistory } from '@/components/approvals/ApprovalHistory';
import { ApprovalFlows } from '@/components/approvals/ApprovalFlows';
import type { ApprovalFlow } from '@/components/approvals/ApprovalFlows';
import { Icon } from '@/components/common/Icons';

// Mock data for pending requests
const mockPendingRequests = [
  {
    id: 1,
    type: 'Initiative' as const,
    title: 'Nova Iniciativa de Digitalização',
    description: 'Proposta para modernização dos processos internos',
    requester: {
      name: 'João Silva',
      email: 'joao.silva@email.com',
    },
    requestDate: '2024-03-15',
    priority: 'High' as const,
    impact: ['Processos', 'Tecnologia', 'Pessoas'],
    attachments: ['proposta.pdf', 'cronograma.xlsx'],
  },
  {
    id: 2,
    type: 'Planning' as const,
    title: 'Revisão do Planejamento Estratégico',
    description: 'Atualização das metas para o próximo trimestre',
    requester: {
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
    },
    requestDate: '2024-03-18',
    priority: 'Medium' as const,
    impact: ['Estratégia', 'Metas', 'Indicadores'],
  },
];

// Mock data for approval history
const mockApprovalHistory = [
  {
    id: 1,
    type: 'Action' as const,
    title: 'Implementação de Sistema',
    description: 'Aprovação para início da implementação do novo sistema',
    requester: {
      name: 'Pedro Costa',
      email: 'pedro.costa@email.com',
    },
    approver: {
      name: 'Ana Oliveira',
      email: 'ana.oliveira@email.com',
    },
    requestDate: '2024-02-20',
    approvalDate: '2024-02-22',
    status: 'Approved' as const,
    comments: 'Aprovado conforme planejamento apresentado.',
    attachments: ['documento.pdf'],
  },
  {
    id: 2,
    type: 'Initiative' as const,
    title: 'Treinamento da Equipe',
    description: 'Programa de capacitação em novas tecnologias',
    requester: {
      name: 'Carlos Souza',
      email: 'carlos.souza@email.com',
    },
    approver: {
      name: 'Ana Oliveira',
      email: 'ana.oliveira@email.com',
    },
    requestDate: '2024-02-15',
    approvalDate: '2024-02-18',
    status: 'Rejected' as const,
    comments: 'Necessário revisar o orçamento e cronograma.',
  },
];

// Mock data for approval flows
const mockApprovalFlows = [
  {
    id: 1,
    name: 'Fluxo de Aprovação de Iniciativas',
    description: 'Processo de aprovação para novas iniciativas estratégicas',
    type: 'Initiative' as const,
    status: 'Active' as const,
    steps: [
      {
        id: 1,
        role: 'Gerente de Área',
        approver: {
          name: 'Ana Oliveira',
          email: 'ana.oliveira@email.com',
        },
        order: 1,
        isRequired: true,
        timeLimit: 2,
        notifications: true,
      },
      {
        id: 2,
        role: 'Diretor',
        order: 2,
        isRequired: true,
        timeLimit: 5,
        notifications: true,
      },
    ],
  },
  {
    id: 2,
    name: 'Fluxo de Aprovação de Planejamento',
    description: 'Processo de aprovação para alterações no planejamento estratégico',
    type: 'Planning' as const,
    status: 'Active' as const,
    steps: [
      {
        id: 3,
        role: 'Coordenador de Planejamento',
        approver: {
          name: 'Carlos Souza',
          email: 'carlos.souza@email.com',
        },
        order: 1,
        isRequired: true,
        timeLimit: 3,
        notifications: true,
      },
      {
        id: 4,
        role: 'Comitê Estratégico',
        order: 2,
        isRequired: true,
        notifications: true,
      },
    ],
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
      id={`approvals-tabpanel-${index}`}
      aria-labelledby={`approvals-tab-${index}`}
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
    id: `approvals-tab-${index}`,
    'aria-controls': `approvals-tabpanel-${index}`,
  };
}

export default function ApprovalsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApprove = (id: number, comments: string) => {
    console.log('Approved:', id, comments);
  };

  const handleReject = (id: number, comments: string) => {
    console.log('Rejected:', id, comments);
  };

  const handleUpdateFlow = (flow: ApprovalFlow) => {
    console.log('Updated flow:', flow);
  };

  const handleDeleteFlow = (id: number) => {
    console.log('Deleted flow:', id);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="approvals views"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<Icon name="clock" size="small" />}
            iconPosition="start"
            label="Pendentes"
            {...a11yProps(0)}
          />
          <Tab
            icon={<Icon name="progress" size="small" />}
            iconPosition="start"
            label="Histórico"
            {...a11yProps(1)}
          />
          <Tab
            icon={<Icon name="list" size="small" />}
            iconPosition="start"
            label="Fluxos"
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <PendingRequests
          requests={mockPendingRequests}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ApprovalHistory history={mockApprovalHistory} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <ApprovalFlows
          flows={mockApprovalFlows}
          onUpdateFlow={handleUpdateFlow}
          onDeleteFlow={handleDeleteFlow}
        />
      </TabPanel>
    </Container>
  );
} 