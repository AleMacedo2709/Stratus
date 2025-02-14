'use client';

import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { StrategicCycle } from '@/types/strategic-planning';

interface CycleSelectorProps {
  cycles: StrategicCycle[];
  selectedCycle: string;
  onCycleChange: (cycleId: string) => void;
}

export const CycleSelector: React.FC<CycleSelectorProps> = ({
  cycles,
  selectedCycle,
  onCycleChange,
}) => {
  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Ciclo Estratégico</InputLabel>
        <Select
          value={selectedCycle}
          label="Ciclo Estratégico"
          onChange={(e) => onCycleChange(e.target.value)}
        >
          {cycles.map((cycle) => (
            <MenuItem key={cycle.id} value={cycle.id}>
              {cycle.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}; 