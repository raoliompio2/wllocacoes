import React from 'react';
import { Box, Typography } from '@mui/material';
import SkeletonLoader from '../common/SkeletonLoader';

interface ClientSkeletonProps {
  count?: number;
  showTitle?: boolean;
}

/**
 * Componente de Skeleton Loading específico para Clientes
 */
const ClientSkeleton: React.FC<ClientSkeletonProps> = ({ 
  count = 5,
  showTitle = false 
}) => {
  return (
    <Box sx={{ my: 2 }}>
      {showTitle && (
        <Typography variant="h6" component="h2" sx={{ mb: 2, opacity: 0.7 }}>
          Carregando clientes...
        </Typography>
      )}
      
      <SkeletonLoader
        type="client"
        count={count}
        animation="wave"
      />
    </Box>
  );
};

export default ClientSkeleton; 