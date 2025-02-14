'use client';

import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { AssignedTasks } from '@/components/my-area/AssignedTasks';
import { AreaIndicators } from '@/components/my-area/AreaIndicators';
import { myAreaData } from '@/data/production/my-area';

export default function MyAreaPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Minha Área
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AreaIndicators 
              kpis={[]} 
              historicalData={[]} 
              annualGoals={[]} 
            />
          </Grid>
          
          <Grid item xs={12}>
            <AssignedTasks initiatives={myAreaData.initiatives} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 