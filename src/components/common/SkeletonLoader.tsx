import React from 'react';
import { 
  Box, 
  Skeleton, 
  Grid, 
  Paper,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';

interface SkeletonLoaderProps {
  type?: 'cards' | 'list' | 'details' | 'form' | 'table';
  count?: number;
  variant?: 'rectangular' | 'circular' | 'text';
  height?: number | string;
  width?: number | string;
  fullWidth?: boolean;
  animation?: 'pulse' | 'wave';
  gridProps?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  spacing?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'cards',
  count = 6,
  variant = 'rectangular',
  height = 'auto',
  width = '100%',
  fullWidth = true,
  animation = 'wave',
  gridProps = { xs: 12, sm: 6, md: 4, lg: 3 },
  spacing = 3
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Card skeleton (similar ao EquipmentCard)
  const renderCardSkeleton = () => (
    <Paper 
      elevation={0}
      sx={{ 
        height: '100%', 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Skeleton 
        variant="rectangular" 
        height={220} 
        animation={animation} 
        width="100%"
      />
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="70%" height={32} animation={animation} />
        <Skeleton variant="text" width="100%" height={20} animation={animation} />
        <Skeleton variant="text" width="90%" height={20} animation={animation} />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" width="40%" height={20} animation={animation} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Skeleton variant="text" width="30%" height={30} animation={animation} />
            <Skeleton variant="rectangular" width="35%" height={36} animation={animation} />
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  // Lista skeleton
  const renderListSkeleton = () => (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        mb: 1,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Skeleton 
          variant="rectangular" 
          width={100} 
          height={100} 
          animation={animation} 
          sx={{ borderRadius: 1 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="40%" height={28} animation={animation} />
          <Skeleton variant="text" width="100%" height={20} animation={animation} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Skeleton variant="text" width="20%" height={24} animation={animation} />
            <Skeleton variant="rectangular" width="25%" height={36} animation={animation} />
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  // Form skeleton
  const renderFormSkeleton = () => (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Skeleton variant="text" width="50%" height={40} animation={animation} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Skeleton variant="rectangular" height={56} animation={animation} sx={{ mb: 3, borderRadius: 1 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Skeleton variant="rectangular" height={56} animation={animation} sx={{ mb: 3, borderRadius: 1 }} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={56} animation={animation} sx={{ mb: 3, borderRadius: 1 }} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={120} animation={animation} sx={{ mb: 4, borderRadius: 1 }} />
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <Skeleton variant="rectangular" width={120} height={40} animation={animation} />
        </Grid>
      </Grid>
    </Paper>
  );

  // Details skeleton
  const renderDetailsSkeleton = () => (
    <Box>
      <Skeleton variant="text" width="60%" height={48} animation={animation} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={24} animation={animation} sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Skeleton variant="rectangular" height={400} animation={animation} sx={{ borderRadius: 2, mb: 3 }} />
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width="100%" height={24} animation={animation} />
            <Skeleton variant="text" width="100%" height={24} animation={animation} />
            <Skeleton variant="text" width="90%" height={24} animation={animation} />
          </Box>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Skeleton variant="text" width="50%" height={32} animation={animation} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="70%" height={52} animation={animation} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={56} animation={animation} sx={{ mb: 2, borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={56} animation={animation} sx={{ mb: 3, borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={48} animation={animation} sx={{ borderRadius: 2 }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Table skeleton
  const renderTableSkeleton = () => (
    <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={150} height={32} animation={animation} />
        <Skeleton variant="rectangular" width={120} height={40} animation={animation} />
      </Box>
      <Skeleton variant="rectangular" height={52} animation={animation} />
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton 
          key={index} 
          variant="rectangular" 
          height={52} 
          animation={animation} 
          sx={{ 
            opacity: 1 - (index * 0.1),
            display: index > 7 && isMobile ? 'none' : 'block'
          }} 
        />
      ))}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Skeleton variant="rectangular" width={300} height={40} animation={animation} />
      </Box>
    </Paper>
  );

  // Renderiza o tipo apropriado de skeleton com base no prop type
  const renderSkeletonType = () => {
    switch (type) {
      case 'cards':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'form':
        return renderFormSkeleton();
      case 'details':
        return renderDetailsSkeleton();
      case 'table':
        return renderTableSkeleton();
      default:
        return <Skeleton 
          variant={variant as any} 
          height={height} 
          width={width} 
          animation={animation} 
        />;
    }
  };

  // Skeleton individual (usado para tipos personalizados)
  if (type !== 'cards' && type !== 'list' && type !== 'form' && type !== 'details' && type !== 'table') {
    return (
      <Skeleton 
        variant={variant as any} 
        height={height} 
        width={fullWidth ? '100%' : width} 
        animation={animation} 
      />
    );
  }

  // Para tipos que precisam de um layout de grid (cards, list)
  if (type === 'cards' || type === 'list') {
    return (
      <Grid container spacing={spacing}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid 
            key={index} 
            item 
            xs={gridProps.xs || 12} 
            sm={gridProps.sm || 6} 
            md={gridProps.md || 4} 
            lg={gridProps.lg || 3}
          >
            {renderSkeletonType()}
          </Grid>
        ))}
      </Grid>
    );
  }

  // Para tipos que não precisam de grid (form, details, table)
  return renderSkeletonType();
};

export default SkeletonLoader; 