import React from 'react';
import { Box, Typography } from '@mui/material';
import SkeletonLoader from '../common/SkeletonLoader';

interface BudgetSkeletonProps {
  count?: number;
  showTitle?: boolean;
}

/**
 * Componente de Skeleton Loading específico para Orçamentos
 */
const BudgetSkeleton: React.FC<BudgetSkeletonProps> = ({ 
  count = 2,
  showTitle = true 
}) => {
  return (
    <Box sx={{ my: 3 }}>
      {showTitle && (
        <Typography variant="h5" component="h2" sx={{ mb: 2, opacity: 0.7 }}>
          Carregando orçamentos...
        </Typography>
      )}
      
      <SkeletonLoader
        type="budget"
        count={count}
        animation="wave"
      />
    </Box>
  );
};

export default BudgetSkeleton; 