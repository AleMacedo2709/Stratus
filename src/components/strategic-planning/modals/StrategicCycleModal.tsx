'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { StrategicCycleForm } from '../forms/StrategicCycleForm';
import type { StrategicCycleFormData } from '../forms/StrategicCycleForm';

interface StrategicCycleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StrategicCycleFormData) => void;
  initialData?: StrategicCycleFormData;
  title?: string;
}

export const StrategicCycleModal: React.FC<StrategicCycleModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  title = 'Novo Ciclo Estratégico',
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <StrategicCycleForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}; 