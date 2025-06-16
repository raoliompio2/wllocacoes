import React from 'react';
import { Box } from '@mui/material';
import SkeletonLoader from '../common/SkeletonLoader';

interface NotificationSkeletonProps {
  count?: number;
}

/**
 * Componente de Skeleton Loading específico para Notificações
 */
const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({ count = 5 }) => {
  return (
    <Box sx={{ my: 2 }}>
      <SkeletonLoader
        type="notification"
        count={count}
        animation="wave"
      />
    </Box>
  );
};

export default NotificationSkeleton; 