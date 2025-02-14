'use client';

import React from 'react';
import { Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  disabled?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  disabled = false
}) => {
  const handleStartDateChange = (date: Date | null) => {
    onChange({ start: date, end: endDate });
  };

  const handleEndDateChange = (date: Date | null) => {
    onChange({ start: startDate, end: date });
  };

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDateFns} 
      adapterLocale={ptBR}
      localeText={{
        start: 'Data Inicial',
        end: 'Data Final'
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <DatePicker
          label="Data Inicial"
          value={startDate}
          onChange={handleStartDateChange}
          maxDate={endDate || undefined}
          disabled={disabled}
          slotProps={{
            textField: {
              size: "small",
              sx: { width: 150 }
            }
          }}
        />
        <DatePicker
          label="Data Final"
          value={endDate}
          onChange={handleEndDateChange}
          minDate={startDate || undefined}
          disabled={disabled}
          slotProps={{
            textField: {
              size: "small",
              sx: { width: 150 }
            }
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}; 