import React from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Divider,
  Skeleton,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const AboutPageSkeleton: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <main>
      {/* Banner da Página Skeleton */}
      <Box 
        sx={{ 
          bgcolor: 'primary.dark',
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="xl">
          <Skeleton variant="text" width={300} height={60} animation="wave" sx={{ mb: 2 }} />
          <Skeleton variant="text" width={500} height={30} animation="wave" />
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Seção Principal Skeleton */}
        <Box sx={{ mb: 8 }}>
          <Skeleton variant="text" width={200} height={40} animation="wave" sx={{ mb: 2, mx: isMobile ? 'auto' : 0 }} />
          <Skeleton variant="rectangular" width={80} height={4} animation="wave" sx={{ mb: 4, mx: isMobile ? 'auto' : 0 }} />
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="90%" height={24} animation="wave" sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" height={20} animation="wave" sx={{ mb: 1 }} />
              <Skeleton variant="text" width="95%" height={20} animation="wave" sx={{ mb: 1 }} />
              <Skeleton variant="text" width="98%" height={20} animation="wave" sx={{ mb: 1 }} />
              <Skeleton variant="text" width="90%" height={20} animation="wave" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={380} animation="wave" sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Box>
        
        {/* Seção de Missão, Visão e Valores Skeleton */}
        <Paper elevation={0} sx={{ p: 4, mb: 8, borderRadius: 2 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Skeleton variant="text" width={200} height={40} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="rectangular" width={80} height={4} animation="wave" sx={{ mx: 'auto', mb: 4 }} />
          </Box>
          
          <Grid container spacing={4}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} md={4} key={item}>
                <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Skeleton variant="circular" width={70} height={70} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="text" width="60%" height={28} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="text" width="100%" height={18} animation="wave" sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="90%" height={18} animation="wave" sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="95%" height={18} animation="wave" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
        
        {/* Seção de Diferenciais Skeleton */}
        <Box sx={{ mb: 8 }}>
          <Skeleton variant="text" width={200} height={40} animation="wave" sx={{ mb: 2, mx: isMobile ? 'auto' : 0 }} />
          <Skeleton variant="rectangular" width={80} height={4} animation="wave" sx={{ mb: 4, mx: isMobile ? 'auto' : 0 }} />
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={380} animation="wave" sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={12} sm={6} key={item}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} animation="wave" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" height={24} animation="wave" sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="100%" height={16} animation="wave" />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 4 }}>
                <Skeleton variant="text" width="100%" height={20} animation="wave" sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="95%" height={20} animation="wave" sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="90%" height={20} animation="wave" />
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Seção de Galeria Skeleton */}
        <Box sx={{ mb: 8 }}>
          <Skeleton variant="text" width={200} height={40} animation="wave" sx={{ mb: 2, mx: isMobile ? 'auto' : 0 }} />
          <Skeleton variant="rectangular" width={80} height={4} animation="wave" sx={{ mb: 4, mx: isMobile ? 'auto' : 0 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="rectangular" height={300} animation="wave" sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="rectangular" height={300} animation="wave" sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Box>
        
        {/* CTA Final Skeleton */}
        <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2, bgcolor: 'primary.main' }}>
          <Skeleton variant="text" width={300} height={40} animation="wave" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto' }} />
          <Skeleton variant="text" width="70%" height={20} animation="wave" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto' }} />
          <Skeleton variant="text" width="60%" height={20} animation="wave" sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto' }} />
          <Skeleton variant="rectangular" width={180} height={50} animation="wave" sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto' }} />
        </Paper>
      </Container>
    </main>
  );
};

export default AboutPageSkeleton; 