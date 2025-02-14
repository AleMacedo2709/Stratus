'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Collapse,
  IconButton,
  Grid,
  Chip,
  LinearProgress,
  Tooltip,
  Link as MuiLink,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';
import Link from 'next/link';

interface Indicator {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'success' | 'warning' | 'error';
}

interface Action {
  id: string;
  name: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
}

interface Objective {
  id: string;
  name: string;
  description: string;
  progress: number;
  indicators: Indicator[];
  actions: Action[];
}

interface Perspective {
  id: string;
  name: string;
  description: string;
  objectives: Objective[];
}

interface StrategicPanelProps {
  cycle: string;
}

const mockData: Perspective[] = [
  {
    id: 'p1',
    name: 'Financeiro',
    description: 'Perspectiva financeira da organização',
    objectives: [
      {
        id: 'o1',
        name: 'Aumentar Faturamento em 25%',
        description: 'Incrementar o faturamento anual em 25% através de novas vendas e expansão de mercado',
        progress: 75,
        indicators: [
          {
            id: 'i1',
            name: 'Faturamento Mensal',
            value: 850000,
            target: 1000000,
            unit: 'R$',
            status: 'warning'
          }
        ],
        actions: [
          {
            id: 'a1',
            name: 'Expandir para novos mercados',
            progress: 60,
            status: 'on_track'
          }
        ]
      }
    ]
  },
  {
    id: 'p2',
    name: 'Clientes',
    description: 'Perspectiva dos clientes e mercado',
    objectives: [
      {
        id: 'o2',
        name: 'Aumentar Base de Clientes',
        description: 'Expandir a base de clientes ativos em 30%',
        progress: 85,
        indicators: [
          {
            id: 'i2',
            name: 'Número de Clientes Ativos',
            value: 850,
            target: 1000,
            unit: 'clientes',
            status: 'success'
          }
        ],
        actions: [
          {
            id: 'a2',
            name: 'Implementar programa de indicações',
            progress: 90,
            status: 'completed'
          }
        ]
      }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'on_track':
    case 'success':
      return 'success';
    case 'at_risk':
    case 'warning':
      return 'warning';
    case 'delayed':
    case 'error':
      return 'error';
    case 'completed':
      return 'info';
    default:
      return 'default';
  }
};

const ObjectiveCard: React.FC<{ objective: Objective }> = ({ objective }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {objective.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {objective.description}
        </Typography>
        <Box sx={{ mt: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progresso
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {objective.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={objective.progress}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">
            Indicadores
          </Typography>
          <Link 
            href={`/strategic/indicators?objectiveId=${objective.id}`}
            passHref
            style={{ textDecoration: 'none' }}
          >
            <MuiLink
              component="span"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <Typography variant="body2">
                Ver todos ({objective.indicators.length})
              </Typography>
              <Icon name="next" size="small" />
            </MuiLink>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {objective.indicators.map((indicator) => (
            <Link
              key={indicator.id}
              href={`/strategic/indicators/${indicator.id}`}
              passHref
              style={{ textDecoration: 'none' }}
            >
              <Tooltip
                title={`Meta: ${indicator.target}${indicator.unit}`}
              >
                <Chip
                  label={`${indicator.name}: ${indicator.value}${indicator.unit}`}
                  color={getStatusColor(indicator.status)}
                  variant="outlined"
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              </Tooltip>
            </Link>
          ))}
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">
            Ações Estratégicas
          </Typography>
          <Link 
            href={`/strategic/actions?objectiveId=${objective.id}`}
            passHref
            style={{ textDecoration: 'none' }}
          >
            <MuiLink
              component="span"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <Typography variant="body2">
                Ver todas ({objective.actions.length})
              </Typography>
              <Icon name="next" size="small" />
            </MuiLink>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {objective.actions.map((action) => (
            <Link
              key={action.id}
              href={`/strategic/actions/${action.id}`}
              passHref
              style={{ textDecoration: 'none' }}
            >
              <Tooltip
                title={`Progresso: ${action.progress}%`}
              >
                <Chip
                  label={action.name}
                  color={getStatusColor(action.status)}
                  variant="outlined"
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              </Tooltip>
            </Link>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export const StrategicPanel: React.FC<StrategicPanelProps> = ({ cycle }) => {
  const [expandedPerspectives, setExpandedPerspectives] = useState<string[]>([]);

  const handleExpandPerspective = (perspectiveId: string) => {
    setExpandedPerspectives((prev) =>
      prev.includes(perspectiveId)
        ? prev.filter((id) => id !== perspectiveId)
        : [...prev, perspectiveId]
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Estrutura Estratégica
      </Typography>

      {mockData.map((perspective) => (
        <Paper key={perspective.id} sx={{ mb: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => handleExpandPerspective(perspective.id)}
          >
            <IconButton size="small">
              <Icon
                name={expandedPerspectives.includes(perspective.id) ? 'expand_less' : 'expand_more'}
                size="small"
              />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">
                {perspective.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {perspective.description}
              </Typography>
            </Box>
          </Box>

          <Collapse in={expandedPerspectives.includes(perspective.id)}>
            <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Grid container spacing={2}>
                {perspective.objectives.map((objective) => (
                  <Grid item xs={12} md={6} key={objective.id}>
                    <ObjectiveCard objective={objective} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        </Paper>
      ))}
    </Box>
  );
}; 