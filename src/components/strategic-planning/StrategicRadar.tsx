'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RadarData {
  subject: string;
  atual: number;
  meta: number;
}

interface StrategicRadarProps {
  data: RadarData[];
}

export const StrategicRadar: React.FC<StrategicRadarProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Resolutividade do Planejamento Estratégico
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Análise comparativa entre resultados atuais e metas estabelecidas
      </Typography>

      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke={theme.palette.divider} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <Radar
              name="Meta"
              dataKey="meta"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.1}
            />
            <Radar
              name="Atual"
              dataKey="atual"
              stroke={theme.palette.secondary.main}
              fill={theme.palette.secondary.main}
              fillOpacity={0.3}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}; 