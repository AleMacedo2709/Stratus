import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Button,
  TextField,
  MenuItem,
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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface AnalyticsData {
  timeSeriesData: {
    period: string;
    value: number;
  }[];
  distributionData: {
    name: string;
    value: number;
  }[];
  radarData: {
    subject: string;
    value: number;
    fullMark: number;
  }[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

const COLORS = ['#1E4D8C', '#28A745', '#FFC107', '#DC3545', '#17A2B8'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState('1y');
  const [metricType, setMetricType] = useState('all');

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Dashboard Analítico</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            size="small"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="1m">Último Mês</MenuItem>
            <MenuItem value="3m">Últimos 3 Meses</MenuItem>
            <MenuItem value="6m">Últimos 6 Meses</MenuItem>
            <MenuItem value="1y">Último Ano</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={metricType}
            onChange={(e) => setMetricType(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">Todas as Métricas</MenuItem>
            <MenuItem value="performance">Performance</MenuItem>
            <MenuItem value="progress">Progresso</MenuItem>
            <MenuItem value="quality">Qualidade</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon name="file-pdf" size="sm" />}
          >
            Exportar PDF
          </Button>
          <Tooltip title="Atualizar">
            <IconButton size="small">
              <Icon name="sync" size="sm" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Time Series Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Evolução Temporal
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.timeSeriesData}
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
                    dataKey="value"
                    name="Valor"
                    stroke="#1E4D8C"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Distribuição
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Radar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Análise Multidimensional
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Valor"
                    dataKey="value"
                    stroke="#1E4D8C"
                    fill="#1E4D8C"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Meta"
                    dataKey="fullMark"
                    stroke="#28A745"
                    fill="#28A745"
                    fillOpacity={0.3}
                  />
                  <Legend />
                  <ChartTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 