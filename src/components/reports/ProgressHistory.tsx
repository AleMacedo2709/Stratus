import React from 'react';
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
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { Icon } from '@/components/common/Icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Milestone {
  id: number;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in_progress' | 'planned';
  progress: number;
  impact: string[];
}

interface ProgressData {
  period: string;
  planned: number;
  actual: number;
}

interface ProgressHistoryProps {
  milestones: Milestone[];
  progressData: ProgressData[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'planned':
      return 'grey';
    default:
      return 'grey';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'in_progress';
    case 'planned':
      return 'pending';
    default:
      return 'info';
  }
};

export const ProgressHistory: React.FC<ProgressHistoryProps> = ({
  milestones,
  progressData,
}) => {
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Histórico de Progresso</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon name="file-pdf" size="small" />}
          >
            Exportar PDF
          </Button>
          <Tooltip title="Atualizar">
            <IconButton size="small">
              <Icon name="sync" size="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Progress Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Evolução do Progresso
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={progressData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    name="Planejado"
                    stackId="1"
                    stroke="#1E4D8C"
                    fill="#1E4D8C"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="Realizado"
                    stackId="2"
                    stroke="#28A745"
                    fill="#28A745"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Milestones Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Marcos do Projeto
            </Typography>
            <Timeline position="alternate">
              {milestones.map((milestone) => (
                <TimelineItem key={milestone.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {new Date(milestone.date).toLocaleDateString()}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getStatusColor(milestone.status)}>
                      <Icon name={getStatusIcon(milestone.status)} size="small" />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {milestone.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {milestone.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                          {milestone.impact.map((item, index) => (
                            <Tooltip key={index} title="Área de Impacto">
                              <Typography
                                variant="caption"
                                sx={{
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: 'action.hover',
                                }}
                              >
                                {item}
                              </Typography>
                            </Tooltip>
                          ))}
                        </Box>
                        {milestone.status === 'in_progress' && (
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flexGrow: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                              <Box
                                sx={{
                                  width: `${milestone.progress}%`,
                                  height: 4,
                                  bgcolor: 'primary.main',
                                  borderRadius: 1,
                                }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {milestone.progress}%
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 