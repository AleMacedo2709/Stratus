import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { StrategicIcon } from '../common/StrategicIcon';

interface DrillDownModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    type: 'kpi' | 'objective' | 'initiative';
    id: string;
    name: string;
    description?: string;
    currentValue?: number;
    targetValue?: number;
    history?: Array<{ date: string; value: number }>;
    responsible?: {
      id: string;
      name: string;
      role: string;
    };
    status?: string;
    progress?: number;
    related?: Array<{
      type: 'objective' | 'initiative' | 'indicator';
      id: string;
      name: string;
      value?: number;
      status?: string;
    }>;
  };
}

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
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  open,
  onClose,
  data
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StrategicIcon type={data.type === 'kpi' ? 'indicator' : data.type} />
          <Typography variant="h6">
            {data.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Visão Geral" />
            <Tab label="Histórico" />
            <Tab label="Relacionamentos" />
          </Tabs>
        </Box>

        {/* Visão Geral */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Descrição
                </Typography>
                <Typography>
                  {data.description || 'Sem descrição disponível'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Responsável
                </Typography>
                <Typography>
                  {data.responsible?.name || 'Não atribuído'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.responsible?.role}
                </Typography>
              </Paper>
            </Grid>
            {data.currentValue !== undefined && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Progresso
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Box>
                      <Typography variant="h4">
                        {data.currentValue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Valor Atual
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4">
                        {data.targetValue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Meta
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Histórico */}
        <TabPanel value={tabValue} index={1}>
          {data.history && (
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={data.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </TabPanel>

        {/* Relacionamentos */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            {data.related?.map(item => (
              <Grid item xs={12} key={item.id}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StrategicIcon type={item.type} size="small" />
                    <Typography>
                      {item.name}
                    </Typography>
                    {item.value !== undefined && (
                      <Typography sx={{ ml: 'auto' }}>
                        {item.value}
                      </Typography>
                    )}
                    {item.status && (
                      <Typography
                        variant="body2"
                        sx={{
                          ml: 'auto',
                          color: item.status === 'on_track' ? 'success.main' : 'error.main'
                        }}
                      >
                        {item.status}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 