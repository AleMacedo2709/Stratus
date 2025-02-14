'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  LinearProgress,
  useTheme
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Icon } from '@/components/common/Icons';
import { colors } from '@/styles/colors';

// Interfaces
interface KPI {
  id: string;
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down';
  status: 'success' | 'warning' | 'danger';
}

interface AreaInitiatives {
  area: string;
  count: number;
}

interface TreeItem {
  id: string;
  name: string;
  type: 'action' | 'initiative';
  progress: number;
  children?: TreeItem[];
}

interface PAADetailsProps {
  year: number;
  kpis: KPI[];
  areaInitiatives: AreaInitiatives[];
  treeData: TreeItem[];
}

// Componente KPI Card
const KPICard: React.FC<{ kpi: KPI }> = ({ kpi }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        height: '100%',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {kpi.title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
        <Typography variant="h4" component="span" sx={{ mr: 1 }}>
          {kpi.value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {kpi.unit}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Meta: {kpi.target} {kpi.unit}
        </Typography>
        <Icon
          name={kpi.trend === 'up' ? 'trending-up' : 'trending-down'}
          size="sm"
          color={colors.status[kpi.status]}
        />
      </Box>
    </Paper>
  );
};

// Componente de Tabela Cascata
const CascadeTable: React.FC<{ data: TreeItem[] }> = ({ data }) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const theme = useTheme();

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 75) return colors.status.success;
    if (progress >= 50) return colors.status.warning;
    return colors.status.danger;
  };

  const renderTreeItem = (item: TreeItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded[item.id];

    return (
      <React.Fragment key={item.id}>
        <TableRow
          sx={{
            '& > *': { borderBottom: 'unset' },
            bgcolor: theme.palette.mode === 'dark'
              ? `rgba(255,255,255,${0.02 * level})`
              : `rgba(0,0,0,${0.02 * level})`,
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark'
                ? `rgba(255,255,255,${0.05 * level})`
                : `rgba(0,0,0,${0.05 * level})`,
            },
          }}
        >
          <TableCell 
            sx={{ 
              pl: level * 4,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 2
            }}
          >
            {hasChildren && (
              <IconButton 
                size="small" 
                onClick={() => toggleExpand(item.id)}
                sx={{
                  transition: 'transform 0.2s',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                <Icon name="chevron-right" size="sm" />
              </IconButton>
            )}
            <Icon
              name={item.type === 'action' ? 'action' : 'initiative'}
              size="sm"
              color={theme.palette.text.secondary}
            />
            <Typography>
              {item.name}
            </Typography>
          </TableCell>
          <TableCell align="right" width={200}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={item.progress}
                sx={{
                  flexGrow: 1,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getStatusColor(item.progress),
                    borderRadius: 3,
                  },
                }}
              />
              <Typography variant="body2" sx={{ minWidth: 40 }}>
                {item.progress}%
              </Typography>
            </Box>
          </TableCell>
        </TableRow>
        {hasChildren && (
          <TableRow>
            <TableCell colSpan={2} sx={{ p: 0, border: 0 }}>
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box>
                  <Table size="small">
                    <TableBody>
                      {item.children?.map(child => renderTreeItem(child, level + 1))}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell align="right">Progresso</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(item => renderTreeItem(item))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Componente Principal
export const PAADetails: React.FC<PAADetailsProps> = ({
  year,
  kpis,
  areaInitiatives,
  treeData,
}) => {
  const theme = useTheme();

  return (
    <Box>
      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map(kpi => (
          <Grid item xs={12} sm={6} md={3} key={kpi.id}>
            <KPICard kpi={kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Gráfico de Iniciativas por Área */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Iniciativas por Área
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={areaInitiatives}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="area" type="category" width={80} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill={colors.primary.main}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Tabela Cascata */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ações e Iniciativas
        </Typography>
        <CascadeTable data={treeData} />
      </Paper>
    </Box>
  );
}; 