'use client';

import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@/components/common/Icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { colors } from '@/styles/colors';

interface KPI {
  id: number;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'success' | 'warning' | 'error';
}

interface HistoricalData {
  month: string;
  actual: number;
  target: number;
}

interface AnnualGoal {
  id: number;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'success' | 'warning' | 'error';
}

interface AreaIndicatorsProps {
  kpis: KPI[];
  historicalData: HistoricalData[];
  annualGoals: AnnualGoal[];
}

const iconColors = {
  success: '#4CAF50', // or your preferred green color
  error: '#F44336',   // or your preferred red color
  warning: '#FFC107', // or your preferred yellow color
  info: '#2196F3'     // or your preferred blue color
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'trending-up';
    case 'down':
      return 'trending-down';
    default:
      return 'trending-up';
  }
};

function getTrendColor(status: string) {
  switch (status) {
    case 'success':
      return colors.status.success;
    case 'warning':
      return colors.status.warning;
    case 'error':
      return colors.status.danger;
    default:
      return colors.status.completed;
  }
}

function getProgressColor(progress: number, target: number) {
  const percentage = (progress / target) * 100;
  if (percentage >= 90) return colors.status.success;
  if (percentage >= 70) return colors.status.warning;
  return colors.status.danger;
}

export const AreaIndicators: React.FC<AreaIndicatorsProps> = ({ kpis, historicalData, annualGoals }) => {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Indicadores da Área</Typography>
        <Tooltip title="Atualizar">
          <IconButton size="small">
            <Icon name="sync" size="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* KPIs */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Indicadores Chave
          </Typography>
          <Grid container spacing={2}>
            {kpis.map((kpi) => (
              <Grid item xs={12} sm={6} md={3} key={kpi.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      {kpi.name}
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                      <Typography variant="h4">
                        {kpi.value}{kpi.unit}
                      </Typography>
                      <Icon 
                        name={getTrendIcon(kpi.trend)} 
                        color={getTrendColor(kpi.status)}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Meta: {kpi.target}{kpi.unit}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Metas Anuais */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Metas Anuais
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Meta</TableCell>
                  <TableCell align="right">Valor Atual</TableCell>
                  <TableCell align="right">Meta Proposta</TableCell>
                  <TableCell align="right">Unidade</TableCell>
                  <TableCell>Progresso</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {annualGoals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell>
                      <Tooltip title={goal.description}>
                        <Typography variant="body2">{goal.name}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      {goal.currentValue.toLocaleString('pt-BR')} {goal.unit}
                    </TableCell>
                    <TableCell align="right">
                      {goal.targetValue.toLocaleString('pt-BR')} {goal.unit}
                    </TableCell>
                    <TableCell align="right">{goal.unit}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box width="100%" mr={1}>
                          <LinearProgress
                            variant="determinate"
                            value={goal.progress}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: `${getProgressColor(goal.currentValue, goal.targetValue)}20`,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getProgressColor(goal.currentValue, goal.targetValue)
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {goal.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Icon 
                        name={goal.status === 'success' ? 'success' : goal.status === 'warning' ? 'warning' : 'error'}
                        color={getTrendColor(goal.status)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Histórico */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Histórico de Desempenho
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mês</TableCell>
                  <TableCell align="right">Realizado</TableCell>
                  <TableCell align="right">Meta</TableCell>
                  <TableCell align="right">Variação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historicalData.map((data, index) => {
                  const variation = ((data.actual - data.target) / data.target) * 100;
                  return (
                    <TableRow key={index}>
                      <TableCell>{data.month}</TableCell>
                      <TableCell align="right">{data.actual.toLocaleString('pt-BR')}%</TableCell>
                      <TableCell align="right">{data.target.toLocaleString('pt-BR')}%</TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Typography
                            variant="body2"
                            color={variation >= 0 ? colors.status.success : colors.status.danger}
                          >
                            {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
                          </Typography>
                          <Icon
                            name={variation >= 0 ? 'trending-up' : 'trending-down'}
                            color={variation >= 0 ? colors.status.success : colors.status.danger}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          Evolução dos Indicadores
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={historicalData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip />
            <Legend />
            <Bar
              dataKey="actual"
              name="Realizado"
              fill={theme.palette.primary.main}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="target"
              name="Meta"
              fill={theme.palette.secondary.main}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}; 