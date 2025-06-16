import React from 'react';
import {
  Container,
  Grid,
  Box,
  Skeleton,
  Paper,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';

const ContactPageSkeleton: React.FC = () => {
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
        <Skeleton variant="text" width={400} height={24} animation="wave" sx={{ mx: 'auto' }} />
      </Box>
      
      {/* Conteúdo Principal - Formulário e Informações */}
      <Grid container spacing={4}>
        {/* Formulário de Contato */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
            <Skeleton variant="text" width="50%" height={32} animation="wave" sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width="40%" height={16} animation="wave" sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={56} animation="wave" sx={{ borderRadius: 1, mb: 3 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width="40%" height={16} animation="wave" sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={56} animation="wave" sx={{ borderRadius: 1, mb: 3 }} />
              </Grid>
              <Grid item xs={12}>
                <Skeleton variant="text" width="30%" height={16} animation="wave" sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={56} animation="wave" sx={{ borderRadius: 1, mb: 3 }} />
              </Grid>
              <Grid item xs={12}>
                <Skeleton variant="text" width="35%" height={16} animation="wave" sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={56} animation="wave" sx={{ borderRadius: 1, mb: 3 }} />
              </Grid>
              <Grid item xs={12}>
                <Skeleton variant="text" width="40%" height={16} animation="wave" sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Skeleton variant="rectangular" width={120} height={40} animation="wave" sx={{ borderRadius: 20 }} />
                  <Skeleton variant="rectangular" width={120} height={40} animation="wave" sx={{ borderRadius: 20 }} />
                  <Skeleton variant="rectangular" width={120} height={40} animation="wave" sx={{ borderRadius: 20 }} />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Skeleton variant="text" width="40%" height={16} animation="wave" sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={120} animation="wave" sx={{ borderRadius: 1, mb: 3 }} />
              </Grid>
              <Grid item xs={12}>
                <Skeleton variant="rectangular" width={150} height={48} animation="wave" sx={{ borderRadius: 1 }} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Informações de Contato */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
            <Skeleton variant="text" width="60%" height={32} animation="wave" sx={{ mb: 3 }} />
            
            {/* Endereço */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={24} height={24} animation="wave" />
                <Box>
                  <Skeleton variant="text" width={120} height={24} animation="wave" sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width={200} height={20} animation="wave" />
                </Box>
              </Box>
              
              <Skeleton variant="rectangular" height={200} animation="wave" sx={{ borderRadius: 1, mb: 3, width: '100%' }} />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Contatos */}
            <Box>
              {/* Telefone */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Skeleton variant="circular" width={24} height={24} animation="wave" />
                <Box>
                  <Skeleton variant="text" width={80} height={20} animation="wave" sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width={120} height={24} animation="wave" />
                </Box>
              </Box>
              
              {/* WhatsApp */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Skeleton variant="circular" width={24} height={24} animation="wave" />
                <Box>
                  <Skeleton variant="text" width={80} height={20} animation="wave" sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width={120} height={24} animation="wave" />
                </Box>
              </Box>
              
              {/* Email */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Skeleton variant="circular" width={24} height={24} animation="wave" />
                <Box>
                  <Skeleton variant="text" width={80} height={20} animation="wave" sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width={180} height={24} animation="wave" />
                </Box>
              </Box>
              
              {/* Horário de Funcionamento */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Skeleton variant="circular" width={24} height={24} animation="wave" />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width={160} height={20} animation="wave" sx={{ mb: 1.5 }} />
                  {[1, 2, 3].map((item) => (
                    <Box key={item} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Skeleton variant="text" width="40%" height={20} animation="wave" />
                      <Skeleton variant="text" width="40%" height={20} animation="wave" />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
          
          {/* Segunda Unidade */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
            <Skeleton variant="text" width="70%" height={28} animation="wave" sx={{ mb: 2 }} />
            
            {/* Endereço */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Skeleton variant="circular" width={24} height={24} animation="wave" />
              <Skeleton variant="text" width="80%" height={40} animation="wave" />
            </Box>
            
            {/* Telefone */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Skeleton variant="circular" width={24} height={24} animation="wave" />
              <Skeleton variant="text" width={120} height={24} animation="wave" />
            </Box>
            
            {/* WhatsApp */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={24} height={24} animation="wave" />
              <Skeleton variant="text" width={120} height={24} animation="wave" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactPageSkeleton; 