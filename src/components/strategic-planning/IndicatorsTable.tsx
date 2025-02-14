'use client';

import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  useTheme,
  IconButton,
  Collapse
} from '@mui/material';
import { Icon } from '@/components/common/Icons';
import { colors } from '@/styles/colors';
import { Indicator } from '@/types/strategic-planning';

interface IndicatorRowProps {
  indicator: Indicator;
}

const IndicatorRow: React.FC<IndicatorRowProps> = ({ indicator }) => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

  const getStatusColor = () => {
    const progress = (indicator.current / indicator.target) * 100;
    if (progress >= 90) return colors.status.success;
    if (progress >= 70) return colors.status.info;
    if (progress >= 50) return colors.status.warning;
    return colors.status.danger;
  };

  const formatValue = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <>
      <TableRow
        sx={{
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ mr: 1 }}
          >
            <Icon
              name={open ? 'chevron-down' : 'chevron-right'}
              size="small"
            />
          </IconButton>
          {indicator.name}
        </TableCell>
        <TableCell>
          <Chip
            label={indicator.frequency}
            size="small"
            sx={{
              backgroundColor: `${colors.primary.main}20`,
              color: colors.primary.main,
              fontWeight: 500,
            }}
          />
        </TableCell>
        <TableCell align="right">{formatValue(indicator.baseline)}</TableCell>
        <TableCell align="right">{formatValue(indicator.target)}</TableCell>
        <TableCell align="right">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: getStatusColor(), fontWeight: 500 }}
            >
              {formatValue(indicator.current)}
            </Typography>
            <Icon
              name={indicator.trend === 'up' ? 'trending-up' : 'trending-down'}
              size="small"
              color={getStatusColor()}
            />
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={5}
          sx={{ py: 0, borderBottom: 'none' }}
        >
          <Collapse in={open}>
            <Box sx={{ py: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Histórico
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {indicator.history?.map((entry, index) => (
                  <Box key={index}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </Typography>
                    <Typography variant="body2">
                      {formatValue(entry.value)}
                    </Typography>
                  </Box>
                ))}
                {(!indicator.history || indicator.history.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum histórico disponível
                  </Typography>
                )}
              </Box>
              {indicator.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Descrição
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {indicator.description}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

interface IndicatorsTableProps {
  indicators: Indicator[];
}

export const IndicatorsTable: React.FC<IndicatorsTableProps> = ({ indicators }) => {
  const theme = useTheme();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Indicador</TableCell>
            <TableCell>Frequência</TableCell>
            <TableCell align="right">Valor Inicial</TableCell>
            <TableCell align="right">Meta</TableCell>
            <TableCell align="right">Valor Atual</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {indicators.map((indicator) => (
            <IndicatorRow key={indicator.id} indicator={indicator} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 