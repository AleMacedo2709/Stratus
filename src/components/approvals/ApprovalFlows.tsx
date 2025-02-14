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
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';
import { Icon } from '@/components/common/Icons';

interface ApprovalStep {
  id: number;
  role: string;
  approver?: {
    name: string;
    email: string;
    unit: {
      id: number;
      name: string;
    };
  };
  order: number;
  requiredProfiles: string[];
  requireUnitMatch: boolean;
  timeLimit?: number;
  notifications: boolean;
}

export interface ApprovalFlow {
  id: number;
  name: string;
  type: 'Planning' | 'Initiative' | 'Action' | 'Task' | 'Flow';
  status: 'Active' | 'Inactive';
  requiredProfiles: string[];
  requireUnitMatch: boolean;
  steps: ApprovalStep[];
}

interface ApprovalFlowsProps {
  flows: ApprovalFlow[];
  currentUser: {
    profile: string;
    unitId: number;
  };
  onUpdateFlow?: (flow: ApprovalFlow) => void;
  onDeleteFlow?: (id: number) => void;
}

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

export const ApprovalFlows: React.FC<ApprovalFlowsProps> = ({
  flows,
  currentUser,
  onUpdateFlow,
  onDeleteFlow,
}) => {
  const [selectedFlow, setSelectedFlow] = useState<ApprovalFlow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const authService = new AuthorizationService();

  const canManageFlows = currentUser.profile === 'Administrador';

  const canViewFlow = (flow: ApprovalFlow): boolean => {
    // Administrador pode ver todos os fluxos
    if (currentUser.profile === 'Administrador') {
      return true;
    }

    // Usuários podem ver fluxos que requerem seu perfil
    if (flow.requiredProfiles.includes(currentUser.profile)) {
      return true;
    }

    // Se o fluxo requer correspondência de unidade, verificar a unidade do usuário
    if (flow.requireUnitMatch && flow.steps.some(step => step.approver?.unit.id === currentUser.unitId)) {
      return true;
    }

    return false;
  };

  const getFlowTypeColor = (type: string) => {
    switch (type) {
      case 'Planning':
        return 'primary';
      case 'Initiative':
        return 'success';
      case 'Action':
        return 'warning';
      case 'Task':
        return 'info';
      case 'Flow':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const filteredFlows = flows.filter(flow => canViewFlow(flow));

  const handleOpenDialog = (flow: ApprovalFlow, edit: boolean = false) => {
    setSelectedFlow(flow);
    setEditMode(edit);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedFlow(null);
    setEditMode(false);
    setDialogOpen(false);
  };

  const handleSave = () => {
    if (selectedFlow && onUpdateFlow) {
      onUpdateFlow(selectedFlow);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    if (onDeleteFlow) {
      onDeleteFlow(id);
    }
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Fluxos de Aprovação</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canManageFlows && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Icon name="plus" size="small" />}
                onClick={() => handleOpenDialog(null, true)}
              >
                Novo Fluxo
              </Button>
            )}
            <Tooltip title="Atualizar">
              <IconButton size="small">
                <Icon name="sync" size="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Perfis Requeridos</TableCell>
                <TableCell>Unidade Requerida</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Etapas</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFlows.map((flow) => (
                <TableRow key={flow.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {flow.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={<Icon name={getTypeIcon(flow.type)} size="small" />}
                      label={flow.type}
                      color={getFlowTypeColor(flow.type)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {flow.requiredProfiles.map((profile, index) => (
                        <Chip
                          key={index}
                          size="small"
                          label={profile}
                          color={profile === currentUser.profile ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={flow.requireUnitMatch ? 'Sim' : 'Não'}
                      color={flow.requireUnitMatch ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={flow.status}
                      color={flow.status === 'Active' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      {flow.steps.map((step, index) => (
                        <Tooltip
                          key={step.id}
                          title={
                            <Box>
                              <Typography variant="caption" display="block">
                                {`${index + 1}. ${step.role}`}
                              </Typography>
                              {step.approver && (
                                <Typography variant="caption" display="block">
                                  {`${step.approver.name} (${step.approver.unit.name})`}
                                </Typography>
                              )}
                              {step.timeLimit && (
                                <Typography variant="caption" display="block">
                                  {`Prazo: ${step.timeLimit} dias`}
                                </Typography>
                              )}
                              <Typography variant="caption" display="block">
                                {`Perfis: ${step.requiredProfiles.join(', ')}`}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {`Unidade requerida: ${step.requireUnitMatch ? 'Sim' : 'Não'}`}
                              </Typography>
                            </Box>
                          }
                        >
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: step.requireUnitMatch ? 'primary.main' : 'action.hover',
                              color: step.requireUnitMatch ? 'primary.contrastText' : 'text.primary',
                              fontSize: '0.75rem',
                            }}
                          >
                            {index + 1}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Ver detalhes">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(flow, false)}
                        >
                          <Icon name="eye" size="small" />
                        </IconButton>
                      </Tooltip>
                      {canManageFlows && (
                        <>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(flow, true)}
                            >
                              <Icon name="edit" size="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(flow.id)}
                            >
                              <Icon name="trash" size="small" />
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Fluxo de Aprovação' : 'Detalhes do Fluxo de Aprovação'}
        </DialogTitle>
        <DialogContent>
          {selectedFlow && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={selectedFlow.name}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo"
                    value={selectedFlow.type}
                    disabled={!editMode}
                  >
                    <MenuItem value="Planning">Planning</MenuItem>
                    <MenuItem value="Initiative">Initiative</MenuItem>
                    <MenuItem value="Action">Action</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Descrição"
                    value={selectedFlow.description}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedFlow.status === 'Active'}
                        disabled={!editMode}
                      />
                    }
                    label="Ativo"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
                Etapas de Aprovação
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ordem</TableCell>
                      <TableCell>Função</TableCell>
                      <TableCell>Aprovador</TableCell>
                      <TableCell>Obrigatório</TableCell>
                      <TableCell>Prazo (dias)</TableCell>
                      <TableCell>Notificações</TableCell>
                      {editMode && <TableCell align="right">Ações</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedFlow.steps.map((step) => (
                      <TableRow key={step.id}>
                        <TableCell>{step.order}</TableCell>
                        <TableCell>{step.role}</TableCell>
                        <TableCell>
                          {step.approver ? (
                            <>
                              <Typography variant="body2">
                                {step.approver.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {step.approver.email}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Não definido
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={step.isRequired ? 'Sim' : 'Não'}
                            color={step.isRequired ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {step.timeLimit || 'Não definido'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={step.notifications ? 'Ativadas' : 'Desativadas'}
                            color={step.notifications ? 'success' : 'default'}
                          />
                        </TableCell>
                        {editMode && (
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Tooltip title="Editar">
                                <IconButton size="small">
                                  <Icon name="edit" size="sm" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir">
                                <IconButton size="small" color="error">
                                  <Icon name="trash" size="sm" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {editMode && (
                <Button
                  variant="outlined"
                  startIcon={<Icon name="plus" size="sm" />}
                  sx={{ mt: 2 }}
                >
                  Adicionar Etapa
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {editMode ? 'Cancelar' : 'Fechar'}
          </Button>
          {editMode && (
            <Button onClick={handleSave} variant="contained" color="primary">
              Salvar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}; 