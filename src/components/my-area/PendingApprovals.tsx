'use client';

import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';

interface Approval {
  id: number;
  type: 'Planning' | 'Initiative' | 'Action';
  title: string;
  description: string;
  requester: string;
  requestDate: string;
  priority: 'Low' | 'Medium' | 'High';
  impact: string[];
}

interface PendingApprovalsProps {
  approvals: Approval[];
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Low':
      return 'info';
    case 'Medium':
      return 'warning';
    case 'High':
      return 'error';
    default:
      return 'default';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Planning':
      return 'report';
    case 'Initiative':
      return 'initiative';
    case 'Action':
      return 'action';
    default:
      return 'info';
  }
};

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({ approvals }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Aprovações Pendentes</Typography>
        <Tooltip title="Atualizar">
          <IconButton size="small">
            <Icon name="sync" size="sm" />
          </IconButton>
        </Tooltip>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Solicitante</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Impacto</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvals.map((approval) => (
              <TableRow key={approval.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {approval.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {approval.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    icon={<Icon name={getTypeIcon(approval.type)} size="sm" />}
                    label={approval.type}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{approval.requester}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(approval.requestDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={approval.priority}
                    color={getPriorityColor(approval.priority)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {approval.impact.map((item, index) => (
                      <Chip
                        key={index}
                        size="small"
                        label={item}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<Icon name="check" size="sm" />}
                    >
                      Aprovar
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      startIcon={<Icon name="times" size="sm" />}
                    >
                      Rejeitar
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}; 