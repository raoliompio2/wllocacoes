import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEOHead from '../SEO/SEOHead';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Página Não Encontrada | Panda Loc"
        description="A página que você está procurando não foi encontrada. Volte para a página inicial ou explore nossos equipamentos disponíveis para locação."
      />
      
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            textAlign: 'center',
            minHeight: '60vh',
          }}
        >
          <Typography variant="h1" component="h1" 
            sx={{ 
              fontSize: { xs: '4rem', md: '6rem' }, 
              fontWeight: 700, 
              color: 'primary.main',
              mb: 2 
            }}
          >
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Página Não Encontrada
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: '600px' }}>
            A página que você está procurando não existe ou foi removida.
            Verifique se a URL está correta ou retorne para nossa página inicial.
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              component={Link} 
              to="/" 
              variant="contained" 
              color="primary" 
              size="large"
            >
              Voltar para o Início
            </Button>
            
            <Button 
              component={Link} 
              to="/equipamentos" 
              variant="outlined" 
              color="primary" 
              size="large"
            >
              Ver Equipamentos
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default NotFoundPage; 