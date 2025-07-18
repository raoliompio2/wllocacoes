import React from 'react';
import { Box, Container } from '@mui/material';
import PublicNavbar from './PublicNavbar';
import Footer from './Footer';
import Breadcrumbs from './Breadcrumbs';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FloatingCta from './FloatingCta';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <>
      
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <PublicNavbar />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            pb: 8,
            pt: isHomePage ? 0 : 3,
            mt: isHomePage ? -3 : 'auto'
          }}
        >
          {!isHomePage && (
            <Container maxWidth="xl" sx={{ mt: 2, mb: 1 }}>
              <Breadcrumbs />
            </Container>
          )}
          {!isHomePage && (
            <Container maxWidth="xl">
              {children}
            </Container>
          )}
          {isHomePage && children}
        </Box>
        
        <Footer />
      </Box>
      
      {/* Adicionando o botão flutuante de WhatsApp */}
      <FloatingCta />
    </>
  );
};

export default PublicLayout; 