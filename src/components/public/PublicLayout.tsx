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
      <Helmet>
        {/* Google Tag Manager */}
        <script>
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-XXXXXXX');`}
        </script>
        {/* End Google Tag Manager */}
      </Helmet>
      
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe 
          src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
          height="0" 
          width="0" 
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
      {/* End Google Tag Manager (noscript) */}
      
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