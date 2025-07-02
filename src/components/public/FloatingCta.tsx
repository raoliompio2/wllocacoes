import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, WhatsApp } from '@mui/icons-material';
import { useCompany } from '../../context/CompanyContext';

const FloatingCta: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showCta, setShowCta] = useState(false);
  const [closed, setClosed] = useState(false);
  const { companyInfo } = useCompany();

  // Exibir o CTA após rolagem de página
  useEffect(() => {
    if (closed) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Mostrar quando o usuário tiver rolado 50% da página inicial
      if (scrollPosition > windowHeight * 0.5) {
        setShowCta(true);
      } else {
        setShowCta(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [closed]);

  const handleClose = () => {
    setShowCta(false);
    setClosed(true);
    
    // Salvar no localStorage para não mostrar novamente por 24 horas
    localStorage.setItem('ctaClosed', Date.now().toString());
  };

  const handleWhatsAppClick = () => {
    // Número do WhatsApp correto da Panda Locações
    const whatsappNumber = '1937030363'; // Número correto da Panda Locações
    const message = encodeURIComponent('Olá! Gostaria de solicitar um orçamento para locação de equipamentos.');
    window.open(`https://api.whatsapp.com/send?phone=55${whatsappNumber}&text=${message}`, '_blank');
  };

  // Verificar se deve mostrar baseado no localStorage
  useEffect(() => {
    const lastClosed = localStorage.getItem('ctaClosed');
    if (lastClosed) {
      const lastClosedTime = parseInt(lastClosed, 10);
      const currentTime = Date.now();
      const hoursDiff = (currentTime - lastClosedTime) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setClosed(true);
      } else {
        localStorage.removeItem('ctaClosed');
      }
    }
  }, []);

  return (
    <Slide direction="up" in={showCta && !closed} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 0 : 30,
          left: isMobile ? 0 : '50%',
          width: isMobile ? '100%' : 'auto',
          maxWidth: isMobile ? '100%' : 520,
          transform: isMobile ? 'none' : 'translateX(-50%)',
          borderRadius: isMobile ? '16px 16px 0 0' : 2,
          overflow: 'hidden',
          zIndex: 1000,
          p: isMobile ? 2 : 3,
          pb: isMobile ? 3 : 3,
          backgroundColor: 'primary.main',
          color: 'white',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <IconButton
          size="small"
          aria-label="fechar"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            opacity: 0.8,
            '&:hover': {
              opacity: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ textAlign: 'center', mb: 2, mt: isMobile ? 1 : 0 }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            component="h3" 
            fontWeight="bold" 
            gutterBottom
          >
            Precisa de equipamentos para sua obra?
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
            Solicite agora um orçamento personalizado!
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
          <Button
            component={Link}
            to="/contato"
            variant="contained"
            color="secondary"
            fullWidth
            sx={{
              py: isMobile ? 1 : 1.5,
              fontWeight: 'bold',
            }}
          >
            Solicitar Orçamento
          </Button>

          <Button
            variant="outlined"
            onClick={handleWhatsAppClick}
            startIcon={<WhatsApp />}
            fullWidth
            sx={{
              py: isMobile ? 1 : 1.5,
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            WhatsApp
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
};

export default FloatingCta; 