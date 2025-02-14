import React from 'react';
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
} from '@mui/material';
import { Icon } from '@/components/common/Icons';

interface ApprovalHistoryItem {
  id: number;
  type: 'Planning' | 'Initiative' | 'Action';
  title: string;
  description: string;
  requester: {
    name: string;
    email: string;
  };
  approver: {
    name: string;
    email: string;
  };
  requestDate: string;
  approvalDate: string;
  status: 'Approved' | 'Rejected';
  comments: string;
  attachments?: string[];
}

interface ApprovalHistoryProps {
  history: ApprovalHistoryItem[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return 'success';
    case 'Rejected':
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

export const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({ history }) => {
  const [selectedItem, setSelectedItem] = React.useState<ApprovalHistoryItem | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const handleOpenDetails = (item: ApprovalHistoryItem) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
    setDetailsOpen(false);
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Histórico de Aprovações</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Icon name="file-excel" size="sm" />}
            >
              Exportar
            </Button>
            <Tooltip title="Atualizar">
              <IconButton size="small">
                <Icon name="sync" size="sm" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Solicitante</TableCell>
                <TableCell>Aprovador</TableCell>
                <TableCell>Data Solicitação</TableCell>
                <TableCell>Data Aprovação</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={<Icon name={getTypeIcon(item.type)} size="sm" />}
                      label={item.type}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.requester.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.requester.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.approver.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.approver.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(item.requestDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(item.approvalDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.status}
                      color={getStatusColor(item.status)}
                      icon={<Icon
                        name={item.status === 'Approved' ? 'check' : 'times'}
                        size="small"
                      />}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Ver detalhes">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetails(item)}
                        >
                          <Icon name="eye" size="small" />
                        </IconButton>
                      </Tooltip>
                      {item.attachments && item.attachments.length > 0 && (
                        <Tooltip title="Ver anexos">
                          <IconButton size="small">
                            <Icon name="file-alt" size="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes da Aprovação</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {selectedItem.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedItem.description}
                </Typography>
                <Chip
                  size="small"
                  label={selectedItem.status}
                  color={getStatusColor(selectedItem.status)}
                  icon={<Icon
                    name={selectedItem.status === 'Approved' ? 'check' : 'times'}
                    size="small"
                  />}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Comentários
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedItem.comments || 'Nenhum comentário.'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Solicitante
                </Typography>
                <Typography variant="body2">
                  {selectedItem.requester.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedItem.requester.email}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Aprovador
                </Typography>
                <Typography variant="body2">
                  {selectedItem.approver.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedItem.approver.email}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Datas
                </Typography>
                <Typography variant="body2">
                  Solicitação: {new Date(selectedItem.requestDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Aprovação: {new Date(selectedItem.approvalDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 