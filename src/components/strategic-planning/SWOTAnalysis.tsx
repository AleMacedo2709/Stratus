import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  useTheme
} from '@mui/material';
import { StrategicIcon } from '../common/StrategicIcon';

interface SWOTItem {
  id: string;
  text: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  impact: 1 | 2 | 3; // 1 = baixo, 2 = médio, 3 = alto
  relatedObjectives?: string[];
}

interface SWOTAnalysisProps {
  items: SWOTItem[];
  onAddItem: (item: Omit<SWOTItem, 'id'>) => void;
  onUpdateItem: (id: string, updates: Partial<SWOTItem>) => void;
  onDeleteItem: (id: string) => void;
}

interface ItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Omit<SWOTItem, 'id'>) => void;
  item?: SWOTItem;
  mode: 'add' | 'edit';
}

const ItemDialog: React.FC<ItemDialogProps> = ({
  open,
  onClose,
  onSave,
  item,
  mode
}) => {
  const [text, setText] = React.useState(item?.text || '');
  const [type, setType] = React.useState<SWOTItem['type']>(item?.type || 'strength');
  const [impact, setImpact] = React.useState<SWOTItem['impact']>(item?.impact || 2);

  const handleSave = () => {
    onSave({
      text,
      type,
      impact,
      relatedObjectives: item?.relatedObjectives || []
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'add' ? 'Adicionar Item' : 'Editar Item'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Descrição"
            value={text}
            onChange={(e) => setText(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Tipo</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(['strength', 'weakness', 'opportunity', 'threat'] as const).map((t) => (
                  <Chip
                    key={t}
                    label={t.charAt(0).toUpperCase() + t.slice(1)}
                    onClick={() => setType(t)}
                    color={type === t ? 'primary' : 'default'}
                    variant={type === t ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Impacto</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {([1, 2, 3] as const).map((i) => (
                  <Chip
                    key={i}
                    label={['Baixo', 'Médio', 'Alto'][i - 1]}
                    onClick={() => setImpact(i)}
                    color={impact === i ? 'primary' : 'default'}
                    variant={impact === i ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!text.trim()}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const SWOTAnalysis: React.FC<SWOTAnalysisProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<SWOTItem | undefined>();

  const getTypeColor = (type: SWOTItem['type']) => {
    switch (type) {
      case 'strength':
        return theme.palette.success.main;
      case 'weakness':
        return theme.palette.error.main;
      case 'opportunity':
        return theme.palette.info.main;
      case 'threat':
        return theme.palette.warning.main;
    }
  };

  const getImpactColor = (impact: SWOTItem['impact']) => {
    switch (impact) {
      case 1:
        return theme.palette.grey[400];
      case 2:
        return theme.palette.warning.main;
      case 3:
        return theme.palette.error.main;
    }
  };

  const quadrants = {
    strength: items.filter(i => i.type === 'strength'),
    weakness: items.filter(i => i.type === 'weakness'),
    opportunity: items.filter(i => i.type === 'opportunity'),
    threat: items.filter(i => i.type === 'threat')
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Análise SWOT</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditingItem(undefined);
            setDialogOpen(true);
          }}
          startIcon={<StrategicIcon type="objective" size="small" />}
        >
          Adicionar Item
        </Button>
      </Box>

      <Grid container spacing={2}>
        {(['strength', 'weakness', 'opportunity', 'threat'] as const).map((type) => (
          <Grid item xs={12} sm={6} key={type}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                borderTop: `4px solid ${getTypeColor(type)}`
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ color: getTypeColor(type) }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {quadrants[type].map((item) => (
                  <Paper
                    key={item.id}
                    sx={{
                      p: 1.5,
                      bgcolor: 'background.default',
                      borderLeft: `4px solid ${getImpactColor(item.impact)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {item.text}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingItem(item);
                          setDialogOpen(true);
                        }}
                      >
                        <StrategicIcon type="objective" size="small" />
                      </IconButton>
                    </Box>
                    {item.relatedObjectives?.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {item.relatedObjectives.map((obj, i) => (
                          <Chip
                            key={i}
                            label={obj}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <ItemDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(undefined);
        }}
        onSave={(item) => {
          if (editingItem) {
            onUpdateItem(editingItem.id, item);
          } else {
            onAddItem(item);
          }
        }}
        item={editingItem}
        mode={editingItem ? 'edit' : 'add'}
      />
    </Box>
  );
}; 