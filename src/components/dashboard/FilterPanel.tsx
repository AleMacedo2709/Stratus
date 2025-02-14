import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Button,
  Divider
} from '@mui/material';

interface FilterPanelProps {
  open: boolean;
  anchor: HTMLElement | null;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  open,
  onClose
}) => {
  const [filters, setFilters] = React.useState({
    perspectives: [] as string[],
    objectives: [] as string[],
    status: [] as string[],
    responsible: [] as string[]
  });

  const handleFilterChange = (category: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleApplyFilters = () => {
    // Implementar lógica de aplicação dos filtros
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({
      perspectives: [],
      objectives: [],
      status: [],
      responsible: []
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 320, p: 3 }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Filtros Avançados
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Perspectivas */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Perspectivas
            </Typography>
            <FormGroup>
              {['Financeira', 'Clientes', 'Processos', 'Aprendizado'].map(perspective => (
                <FormControlLabel
                  key={perspective}
                  control={
                    <Checkbox
                      checked={filters.perspectives.includes(perspective)}
                      onChange={() => handleFilterChange('perspectives', perspective)}
                    />
                  }
                  label={perspective}
                />
              ))}
            </FormGroup>
          </FormControl>

          {/* Status */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Status
            </Typography>
            <FormGroup>
              {['Em Andamento', 'Concluído', 'Atrasado', 'Em Risco'].map(status => (
                <FormControlLabel
                  key={status}
                  control={
                    <Checkbox
                      checked={filters.status.includes(status)}
                      onChange={() => handleFilterChange('status', status)}
                    />
                  }
                  label={status}
                />
              ))}
            </FormGroup>
          </FormControl>

          {/* Responsáveis */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Responsáveis
            </Typography>
            <Select
              multiple
              value={filters.responsible}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                responsible: e.target.value as string[]
              }))}
              renderValue={(selected) => (selected as string[]).join(', ')}
              size="small"
            >
              {['Ana Silva', 'Carlos Mendes', 'Mariana Costa'].map(name => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={filters.responsible.includes(name)} />
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ pt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            sx={{ mr: 1 }}
          >
            Limpar
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
          >
            Aplicar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}; 