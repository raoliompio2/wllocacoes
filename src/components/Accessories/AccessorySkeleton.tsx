import React from 'react';
import { Box } from '@mui/material';
import SkeletonLoader from '../common/SkeletonLoader';

interface AccessorySkeletonProps {
  count?: number;
  gridProps?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  spacing?: number;
}

/**
 * Componente de Skeleton Loading específico para Acessórios
 */
const AccessorySkeleton: React.FC<AccessorySkeletonProps> = ({ 
  count = 6, 
  gridProps = { xs: 12, sm: 6, md: 4, lg: 4 },
  spacing = 2
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <SkeletonLoader
        type="accessory"
        count={count}
        gridProps={gridProps}
        spacing={spacing}
        animation="wave"
      />
    </Box>
  );
};

export default AccessorySkeleton; 