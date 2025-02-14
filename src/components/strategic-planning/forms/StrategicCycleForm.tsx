'use client';

import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';

export interface StrategicCycleFormData {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  status: 'Active' | 'Completed' | 'Pending';
  mission: string;
  vision: string;
  values: string[];
}

interface StrategicCycleFormProps {
  initialData?: StrategicCycleFormData;
  onSubmit: (data: StrategicCycleFormData) => void;
  onCancel: () => void;
}

export const StrategicCycleForm: React.FC<StrategicCycleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState<StrategicCycleFormData>(
    initialData || {
      name: '',
      startDate: null,
      endDate: null,
      status: 'Pending',
      mission: '',
      vision: '',
      values: [''],
    }
  );

  const handleChange = (field: keyof StrategicCycleFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleValueChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValues = [...formData.values];
    newValues[index] = event.target.value;
    setFormData({ ...formData, values: newValues });
  };

  const addValue = () => {
    setFormData({ ...formData, values: [...formData.values, ''] });
  };

  const removeValue = (index: number) => {
    const newValues = formData.values.filter((_, i) => i !== index);
    setFormData({ ...formData, values: newValues });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Nome do Ciclo */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Nome do Ciclo"
              value={formData.name}
              onChange={handleChange('name')}
            />
          </Grid>

          {/* Período */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Data de Início"
              value={formData.startDate}
              onChange={(date) => setFormData({ ...formData, startDate: date })}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Data de Término"
              value={formData.endDate}
              onChange={(date) => setFormData({ ...formData, endDate: date })}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                }
              }}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(event) => setFormData({ ...formData, status: event.target.value as any })}
              >
                <MenuItem value="Active">Ativo</MenuItem>
                <MenuItem value="Completed">Concluído</MenuItem>
                <MenuItem value="Pending">Pendente</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Missão */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              label="Missão"
              value={formData.mission}
              onChange={handleChange('mission')}
            />
          </Grid>

          {/* Visão */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              label="Visão"
              value={formData.vision}
              onChange={handleChange('vision')}
            />
          </Grid>

          {/* Valores */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Valores
            </Typography>
            {formData.values.map((value, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  required
                  label={`Valor ${index + 1}`}
                  value={value}
                  onChange={handleValueChange(index)}
                />
                {formData.values.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeValue(index)}
                  >
                    Remover
                  </Button>
                )}
              </Box>
            ))}
            <Button variant="outlined" onClick={addValue}>
              Adicionar Valor
            </Button>
          </Grid>

          {/* Botões de Ação */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={onCancel}>
                Cancelar
              </Button>
              <Button variant="contained" type="submit">
                Salvar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}; 