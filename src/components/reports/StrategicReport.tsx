import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface KPI {
  id: number;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'success' | 'warning' | 'error';
}

interface PerformanceData {
  period: string;
  actual: number;
  target: number;
  variance: number;
}

interface PerspectiveProgress {
  name: string;
  progress: number;
  target: number;
}

interface StrategicReportProps {
  kpis: KPI[];
  performanceData: PerformanceData[];
  perspectiveProgress: PerspectiveProgress[];
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'trending-up';
    case 'down':
      return 'trending-down';
    default:
      return 'minus';
  }
};

const getTrendColor = (trend: string, status: string) => {
  if (status === 'success') return 'success';
  if (status === 'error') return 'error';
  return 'warning';
};

export const StrategicReport: React.FC<StrategicReportProps> = ({
  kpis,
  performanceData,
  perspectiveProgress,
}) => {
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Relatório Estratégico</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon name="file-pdf" size="sm" />}
          >
            Exportar PDF
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon name="file-excel" size="sm" />}
          >
            Exportar Excel
          </Button>
          <Tooltip title="Atualizar">
            <IconButton size="small">
              <Icon name="sync" size="sm" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.id}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {kpi.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
                    <Typography variant="h4">
                      {kpi.value}
                      <Typography component="span" variant="body2" color="text.secondary">
                        {kpi.unit}
                      </Typography>
                    </Typography>
                    <Icon
                      name={getTrendIcon(kpi.trend)}
                      size="sm"
                      color={getTrendColor(kpi.trend, kpi.status)}
                    />
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Meta: {kpi.target}{kpi.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((kpi.value / kpi.target) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((kpi.value / kpi.target) * 100, 100)}
                    color={kpi.status}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Trend */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Tendência de Performance
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={performanceData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                name="Realizado"
                stroke="#1E4D8C"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Meta"
                stroke="#28A745"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="variance"
                name="Variação"
                stroke="#FFC107"
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Perspective Progress */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Progresso por Perspectiva
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={perspectiveProgress}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Bar
                dataKey="progress"
                name="Progresso"
                fill="#1E4D8C"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="target"
                name="Meta"
                fill="#28A745"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
}; 