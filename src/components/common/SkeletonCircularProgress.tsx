import React from 'react';
import { CircularProgress, CircularProgressProps, Box } from '@mui/material';
import { SkeletonLoader } from './SkeletonLoadingProvider';

interface SkeletonCircularProgressProps extends CircularProgressProps {
  useSkeleton?: boolean;
  skeletonType?: 'cards' | 'list' | 'details' | 'form' | 'table';
  count?: number;
  width?: string | number;
  height?: string | number;
  skeletonProps?: Record<string, any>;
}

/**
 * Drop-in replacement para CircularProgress que usa SkeletonLoader
 * quando a prop useSkeleton está ativada.
 */
const SkeletonCircularProgress: React.FC<SkeletonCircularProgressProps> = ({
  useSkeleton = true,
  skeletonType = 'cards',
  count = 3,
  width = '100%',
  height = 'auto',
  skeletonProps = {},
  ...props
}) => {
  // Quando useSkeleton está habilitado, usa o SkeletonLoader
  if (useSkeleton) {
    return (
      <Box sx={{ width, height }}>
        <SkeletonLoader 
          type={skeletonType}
          count={count}
          {...skeletonProps}
        />
      </Box>
    );
  }
  
  // Caso contrário, renderiza o CircularProgress normalmente
  return <CircularProgress {...props} />;
};

export default SkeletonCircularProgress; 