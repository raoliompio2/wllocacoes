import React from 'react';
import { Box, Typography } from '@mui/material';
import SkeletonLoader from '../common/SkeletonLoader';

interface ReviewSkeletonProps {
  count?: number;
}

/**
 * Componente de Skeleton Loading específico para Avaliações
 */
const ReviewSkeleton: React.FC<ReviewSkeletonProps> = ({ count = 3 }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h3" sx={{ opacity: 0.7 }}>
          Carregando avaliações...
        </Typography>
      </Box>
      <SkeletonLoader
        type="review"
        count={count}
        animation="wave"
      />
    </Box>
  );
};

export default ReviewSkeleton; 