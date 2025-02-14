import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';
import { AuthorizationService } from '@/services/auth/AuthorizationService';

interface ApprovalRequest {
  id: number;
  type: 'Planning' | 'Initiative' | 'Action' | 'Task';
  title: string;
  description: string;
  requester: {
    name: string;
    email: string;
    unit: {
      id: number;
      name: string;
    };
  };
  requestDate: string;
  priority: 'Low' | 'Medium' | 'High';
  impact: string[];
  attachments?: string[];
  unitId: number;
  status: 'Aguardando aprovação' | 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Suspenso' | 'Descontinuada';
}

interface PendingRequestsProps {
  requests: ApprovalRequest[];
  currentUser: {
    profile: string;
    unitId: number;
  };
  onApprove?: (id: number, comments: string) => void;
  onReject?: (id: number, comments: string) => void;
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
      return 'document';
    case 'Initiative':
      return 'initiative';
    case 'Action':
      return 'action';
    default:
      return 'help';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Planning':
      return 'primary';
    case 'Initiative':
      return 'success';
    case 'Action':
      return 'warning';
    case 'Task':
      return 'info';
    default:
      return 'default';
  }
};

export const PendingRequests: React.FC<PendingRequestsProps> = ({
  requests,
  currentUser,
  onApprove,
  onReject,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | 'view'>('approve');
  const [comments, setComments] = useState('');
  const authService = new AuthorizationService();

  const canApproveRequest = (request: ApprovalRequest): boolean => {
    // Verificar permissões baseadas no perfil e unidade
    if (request.type === 'Task') {
      return currentUser.profile === 'PAA' && currentUser.unitId === request.unitId;
    }
    
    if (request.type === 'Initiative') {
      return ['Planejamento', 'Administrador'].includes(currentUser.profile);
    }
    
    if (['Planning', 'Action'].includes(request.type)) {
      return ['Planejamento', 'Administrador'].includes(currentUser.profile);
    }

    return false;
  };

  const filteredRequests = requests.filter(request => canApproveRequest(request));

  const handleOpenDialog = (request: ApprovalRequest, action: 'approve' | 'reject' | 'view') => {
    setSelectedRequest(request);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setDialogAction('approve');
    setDialogOpen(false);
    setComments('');
  };

  const handleSubmit = () => {
    if (!selectedRequest) return;

    if (dialogAction === 'approve' && onApprove) {
      onApprove(selectedRequest.id, comments);
    } else if (dialogAction === 'reject' && onReject) {
      onReject(selectedRequest.id, comments);
    }

    handleCloseDialog();
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Solicitações Pendentes</Typography>
          <Tooltip title="Atualizar">
            <IconButton size="small">
              <Icon name="sync" size="small" />
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
                <TableCell>Unidade</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Prioridade</TableCell>
                <TableCell>Impacto</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {request.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={<Icon name={getTypeIcon(request.type)} size="small" />}
                      label={request.type}
                      color={getTypeColor(request.type)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{request.requester.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.requester.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{request.requester.unit.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={request.priority}
                      color={getPriorityColor(request.priority)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {request.impact.map((item, index) => (
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
                      <Tooltip title="Ver detalhes">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(request, 'view')}
                        >
                          <Icon name="eye" size="small" />
                        </IconButton>
                      </Tooltip>
                      {canApproveRequest(request) && (
                        <>
                          <Tooltip title="Aprovar">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenDialog(request, 'approve')}
                            >
                              <Icon name="check" size="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeitar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDialog(request, 'reject')}
                            >
                              <Icon name="x" size="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogAction === 'approve' ? 'Aprovar Solicitação' : dialogAction === 'reject' ? 'Rejeitar Solicitação' : 'Ver Detalhes'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {selectedRequest.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedRequest.description}
              </Typography>
              {dialogAction === 'approve' || dialogAction === 'reject' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Comentários"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={dialogAction === 'approve'
                    ? 'Adicione comentários opcionais para a aprovação...'
                    : 'Explique o motivo da rejeição...'}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          {dialogAction === 'approve' && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="success"
            >
              Aprovar
            </Button>
          )}
          {dialogAction === 'reject' && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="error"
            >
              Rejeitar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}; 