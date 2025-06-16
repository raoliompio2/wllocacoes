import React from 'react';
import { Box, Container, Typography, Divider, Grid, Skeleton } from '@mui/material';

const HomePageSkeleton: React.FC = () => {
  return (
    <main>
      {/* Hero Section Skeleton */}
      <Box
        sx={{
          height: { xs: '60vh', md: '80vh' },
          position: 'relative',
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height="100%" 
          animation="wave" 
          sx={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            zIndex: 1,
            p: 4
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: { xs: '100%', md: '50%' } }}>
              <Skeleton variant="text" width="80%" height={60} animation="wave" sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" height={24} animation="wave" />
              <Skeleton variant="text" width="90%" height={24} animation="wave" />
              <Skeleton variant="text" width="95%" height={24} animation="wave" sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Skeleton variant="rectangular" width={150} height={50} animation="wave" sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={150} height={50} animation="wave" sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Equipamentos em Destaque Skeleton */}
      <Box sx={{ bgcolor: 'background.default', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Skeleton variant="text" width={300} height={40} animation="wave" sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="rectangular" width={100} height={4} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width={400} height={24} animation="wave" sx={{ mx: 'auto' }} />
          </Box>

          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                {/* Card skeleton personalizado sem depender de SkeletonLoader */}
                <Box 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    bgcolor: 'background.paper'
                  }}
                >
                  <Skeleton 
                    variant="rectangular" 
                    height={220} 
                    animation="wave" 
                    width="100%"
                  />
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="text" width="70%" height={32} animation="wave" />
                    <Skeleton variant="text" width="100%" height={20} animation="wave" />
                    <Skeleton variant="text" width="90%" height={20} animation="wave" />
                    <Box sx={{ mt: 2 }}>
                      <Skeleton variant="text" width="40%" height={20} animation="wave" />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Skeleton variant="text" width="30%" height={30} animation="wave" />
                        <Skeleton variant="rectangular" width="35%" height={36} animation="wave" />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Skeleton variant="rectangular" width={220} height={50} animation="wave" sx={{ mx: 'auto', borderRadius: 1 }} />
          </Box>
        </Container>
      </Box>
    </main>
  );
};

export default HomePageSkeleton; 