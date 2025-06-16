import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import SkeletonLoader from '../common/SkeletonLoader';

interface BookingSkeletonProps {
  count?: number;
  showTitle?: boolean;
}

/**
 * Componente de Skeleton Loading específico para Reservas
 */
const BookingSkeleton: React.FC<BookingSkeletonProps> = ({ 
  count = 3,
  showTitle = true 
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {showTitle && (
        <>
          <Typography variant="h5" component="h2" sx={{ mb: 1, opacity: 0.7 }}>
            Carregando reservas...
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </>
      )}
      
      <SkeletonLoader
        type="booking"
        count={count}
        animation="wave"
      />
    </Box>
  );
};

export default BookingSkeleton; 