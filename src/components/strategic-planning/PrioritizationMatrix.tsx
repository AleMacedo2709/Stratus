import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  useTheme
} from '@mui/material';
import { StrategicObjective } from '@/types/strategic-planning';
import { StrategicIcon } from '../common/StrategicIcon';

interface PrioritizationMatrixProps {
  objectives: Array<StrategicObjective & {
    impact: number;
    effort: number;
  }>;
  onUpdatePriority: (
    objectiveId: string,
    updates: { impact?: number; effort?: number }
  ) => void;
}

interface ObjectiveDialogProps {
  open: boolean;
  onClose: () => void;
  objective: StrategicObjective & {
    impact: number;
    effort: number;
  };
  onUpdate: (updates: { impact?: number; effort?: number }) => void;
}

const ObjectiveDialog: React.FC<ObjectiveDialogProps> = ({
  open,
  onClose,
  objective,
  onUpdate
}) => {
  const [impact, setImpact] = React.useState(objective.impact);
  const [effort, setEffort] = React.useState(objective.effort);

  const handleSave = () => {
    onUpdate({ impact, effort });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Avaliar Objetivo</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {objective.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {objective.description}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Impacto</Typography>
            <Slider
              value={impact}
              onChange={(_, value) => setImpact(value as number)}
              min={0}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Esforço</Typography>
            <Slider
              value={effort}
              onChange={(_, value) => setEffort(value as number)}
              min={0}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const PrioritizationMatrix: React.FC<PrioritizationMatrixProps> = ({
  objectives,
  onUpdatePriority
}) => {
  const theme = useTheme();
  const [selectedObjective, setSelectedObjective] = React.useState<(typeof objectives)[0] | null>(null);

  const getQuadrant = (impact: number, effort: number) => {
    if (impact >= 5 && effort < 5) return 'quick-wins';
    if (impact >= 5 && effort >= 5) return 'strategic';
    if (impact < 5 && effort < 5) return 'fill-ins';
    return 'thankless';
  };

  const quadrantColors = {
    'quick-wins': theme.palette.success.main,
    'strategic': theme.palette.primary.main,
    'fill-ins': theme.palette.warning.main,
    'thankless': theme.palette.error.main
  };

  const quadrantLabels = {
    'quick-wins': 'Quick Wins',
    'strategic': 'Estratégicos',
    'fill-ins': 'Preenchimento',
    'thankless': 'Baixa Prioridade'
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Matriz de Priorização
      </Typography>

      <Paper 
        sx={{ 
          p: 2,
          height: 600,
          position: 'relative',
          bgcolor: 'background.default'
        }}
      >
        {/* Eixos */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            bgcolor: 'divider'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            bgcolor: 'divider'
          }}
        />

        {/* Labels dos eixos */}
        <Typography
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Alto Impacto
        </Typography>
        <Typography
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Baixo Impacto
        </Typography>
        <Typography
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%) rotate(-90deg)',
            transformOrigin: 'left center'
          }}
        >
          Baixo Esforço
        </Typography>
        <Typography
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            transformOrigin: 'right center'
          }}
        >
          Alto Esforço
        </Typography>

        {/* Objetivos */}
        {objectives.map(objective => {
          const quadrant = getQuadrant(objective.impact, objective.effort);
          return (
            <Tooltip
              key={objective.id}
              title={
                <Box>
                  <Typography variant="subtitle2">{objective.name}</Typography>
                  <Typography variant="body2">
                    Impacto: {objective.impact}/10
                  </Typography>
                  <Typography variant="body2">
                    Esforço: {objective.effort}/10
                  </Typography>
                </Box>
              }
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${(objective.effort / 10) * 100}%`,
                  bottom: `${(objective.impact / 10) * 100}%`,
                  transform: 'translate(-50%, 50%)',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedObjective(objective)}
              >
                <Paper
                  sx={{
                    p: 1,
                    bgcolor: quadrantColors[quadrant],
                    color: 'white',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    boxShadow: 2
                  }}
                >
                  <StrategicIcon type="objective" size="small" />
                </Paper>
              </Box>
            </Tooltip>
          );
        })}

        {/* Legenda */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          {Object.entries(quadrantLabels).map(([key, label]) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
                '&:last-child': { mb: 0 }
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: quadrantColors[key as keyof typeof quadrantColors]
                }}
              />
              <Typography variant="caption">{label}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {selectedObjective && (
        <ObjectiveDialog
          open={true}
          onClose={() => setSelectedObjective(null)}
          objective={selectedObjective}
          onUpdate={(updates) => {
            onUpdatePriority(selectedObjective.id, updates);
            setSelectedObjective(null);
          }}
        />
      )}
    </Box>
  );
}; 