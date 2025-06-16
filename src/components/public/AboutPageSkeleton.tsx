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
  Tabs,
  Tab,
} from '@mui/material';

const AboutPageSkeleton: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Breadcrumbs Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={200} height={20} animation="wave" />
      </Box>
      
      {/* Título da página */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Skeleton variant="text" width={300} height={60} animation="wave" sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton variant="rectangular" width={100} height={4} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
      </Box>
      
      {/* Seção Principal */}
      <Grid container spacing={5} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={400} animation="wave" sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="text" width="80%" height={40} animation="wave" sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={20} animation="wave" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={20} animation="wave" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="95%" height={20} animation="wave" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="90%" height={20} animation="wave" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={20} animation="wave" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="85%" height={20} animation="wave" sx={{ mb: 1 }} />
        </Grid>
      </Grid>
      
      {/* Seção de Missão, Visão e Valores */}
      <Paper elevation={0} sx={{ p: 4, mb: 8, borderRadius: 2 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Skeleton variant="text" width={250} height={40} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width={400} height={20} animation="wave" sx={{ mx: 'auto' }} />
        </Box>
        
        <Grid container spacing={4}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={4} key={item}>
              <Card elevation={0} sx={{ height: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Skeleton variant="circular" width={60} height={60} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" width="60%" height={28} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" width="100%" height={18} animation="wave" sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="90%" height={18} animation="wave" sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="95%" height={18} animation="wave" sx={{ mb: 0.5 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Seção de Diferenciais */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Skeleton variant="text" width={250} height={40} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width={400} height={20} animation="wave" sx={{ mx: 'auto' }} />
        </Box>
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} key={item}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="circular" width={50} height={50} animation="wave" />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="60%" height={28} animation="wave" sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={18} animation="wave" sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="95%" height={18} animation="wave" />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Linha do Tempo */}
      <Paper elevation={0} sx={{ p: 4, mb: 8, borderRadius: 2 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Skeleton variant="text" width={250} height={40} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width={400} height={20} animation="wave" sx={{ mx: 'auto' }} />
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3, justifyContent: 'space-between' }}>
          {[1, 2, 3, 4].map((item) => (
            <Box key={item} sx={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              <Skeleton variant="circular" width={80} height={80} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width="50%" height={24} animation="wave" sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="80%" height={20} animation="wave" sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="70%" height={16} animation="wave" sx={{ mx: 'auto' }} />
            </Box>
          ))}
        </Box>
      </Paper>
      
      {/* Tabs de Serviços */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Skeleton variant="text" width={250} height={40} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={48} animation="wave" />
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={300} animation="wave" sx={{ borderRadius: 2, mb: 2 }} />
              <Skeleton variant="text" width="70%" height={28} animation="wave" sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={18} animation="wave" sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="95%" height={18} animation="wave" sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="90%" height={18} animation="wave" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width="60%" height={24} animation="wave" sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={16} animation="wave" />
              </Box>
              {[1, 2, 3].map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={20} height={20} animation="wave" />
                  <Skeleton variant="text" width="90%" height={20} animation="wave" />
                </Box>
              ))}
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      {/* Equipe */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Skeleton variant="text" width={250} height={40} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
        <Skeleton variant="text" width={400} height={20} animation="wave" sx={{ mx: 'auto', mb: 4 }} />
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={6} sm={3} key={item}>
              <Skeleton variant="circular" width={120} height={120} animation="wave" sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width="70%" height={24} animation="wave" sx={{ mx: 'auto', mb: 0.5 }} />
              <Skeleton variant="text" width="50%" height={18} animation="wave" sx={{ mx: 'auto' }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default AboutPageSkeleton; 