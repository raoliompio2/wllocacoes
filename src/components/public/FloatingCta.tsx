import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
  Fab,
  Snackbar,
  Alert
} from '@mui/material';
import { Close as CloseIcon, WhatsApp } from '@mui/icons-material';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { sendBudgetRequestEmail } from '../../utils/emailService';

const FloatingCta: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showCta, setShowCta] = useState(false);
  const [closed, setClosed] = useState(false);
  const { companyInfo } = useCompany();
  const { user } = useAuth();
  const location = useLocation();
  
  // Estado para o alerta de feedback
  const [feedback, setFeedback] = useState({
    show: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Verifica se está na página de detalhes do produto
  const isEquipmentDetailPage = 
    location.pathname.includes('/equipamento/') || 
    location.pathname.includes('/alugar/') || 
    location.pathname.includes('/aluguel/');

  // Exibir o CTA após rolagem de página
  useEffect(() => {
    if (closed) return;
    if (isEquipmentDetailPage) return; // Não mostrar na página de detalhes do produto

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
  }, [closed, isEquipmentDetailPage]);

  const handleClose = () => {
    setShowCta(false);
    setClosed(true);
    
    // Salvar no localStorage para não mostrar novamente por 24 horas
    localStorage.setItem('ctaClosed', Date.now().toString());
  };

  const handleWhatsAppClick = () => {
    // Número do WhatsApp correto da Panda Locações
    const whatsappNumber = '1937030363';
    const currentPage = window.location.href;
    const pageName = document.title;
    
    // Mensagem que inclui a página atual
    const message = `Olá, gostaria de solicitar um orçamento. Estava navegando na página: ${pageName}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir o WhatsApp imediatamente para melhorar a experiência do usuário
    window.open(whatsappUrl, '_blank');
    
    // Em seguida, registrar a solicitação em segundo plano - EXATAMENTE COMO NA PÁGINA DE PRODUTO
    setTimeout(async () => {
      try {
        // Definir datas de início (hoje) e fim (7 dias depois) já que são obrigatórias
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // Final fictício padrão: 7 dias
        
        // Buscar o ID de qualquer admin para ser o proprietário
        const { data: adminData, error: adminError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .single();
          
        if (adminError) {
          console.error('Erro ao buscar administrador:', adminError);
          return;
        }
        
        if (!adminData) {
          console.error('Nenhum administrador encontrado');
          return;
        }
        
        // Registrar a solicitação de orçamento no banco de dados - ESTRUTURA IDÊNTICA
        const { error } = await supabase.from('budget_requests').insert({
          equipment_id: null, // Sem equipamento específico
          client_id: user?.id || null,
          client_name: user?.user_metadata?.name || 'Cliente WhatsApp',
          client_email: user?.email || null,
          client_phone: null,
          client_type: user ? 'user' : 'guest',
          owner_id: adminData.id, // ID do administrador como proprietário
          status: 'pending',
          created_at: new Date().toISOString(),
          contact_method: 'whatsapp',
          // Campos obrigatórios
          start_date: startDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
          end_date: endDate.toISOString().split('T')[0],     // Formato YYYY-MM-DD
          request_details: `Solicitação via WhatsApp da página: ${pageName}`
        });

        if (error) {
          console.error('Erro ao registrar solicitação de orçamento:', error);
          setFeedback({
            show: true,
            message: "Erro ao registrar orçamento",
            severity: "error"
          });
        } else {
          console.log('Solicitação de orçamento registrada com sucesso');
          
          // Enviar email de notificação
          await sendBudgetRequestEmail(
            'Solicitação via WhatsApp - ' + pageName,
            user?.user_metadata?.name || 'Cliente WhatsApp',
            'default-image.png'
          );
          
          setFeedback({
            show: true,
            message: "Orçamento enviado com sucesso",
            severity: "success"
          });
        }
      } catch (error) {
        console.error('Erro ao registrar solicitação de orçamento:', error);
        setFeedback({
          show: true,
          message: "Erro ao processar a solicitação",
          severity: "error"
        });
      }
    }, 0);
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

  // Se estiver na página de detalhes do produto, não mostrar o componente completo
  if (isEquipmentDetailPage) {
    return null;
  }

  // Renderizar o botão flutuante do WhatsApp para dispositivos móveis
  if (isMobile) {
    return (
      <>
        <Box
          sx={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 1000,
            display: isEquipmentDetailPage ? 'none' : 'block',
          }}
        >
          <Fab
            color="success"
            aria-label="WhatsApp"
            onClick={handleWhatsAppClick}
            sx={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <WhatsApp />
          </Fab>
        </Box>
        
        <Snackbar 
          open={feedback.show} 
          autoHideDuration={6000} 
          onClose={() => setFeedback(prev => ({...prev, show: false}))}
        >
          <Alert 
            severity={feedback.severity} 
            onClose={() => setFeedback(prev => ({...prev, show: false}))}
          >
            {feedback.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      {/* Botão flutuante do WhatsApp para desktop */}
      <Box
        sx={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 999,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Fab
          color="success"
          aria-label="WhatsApp"
          onClick={handleWhatsAppClick}
          sx={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <WhatsApp />
        </Fab>
      </Box>
      
      {/* CTA Flutuante tradicional */}
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
      
      <Snackbar 
        open={feedback.show} 
        autoHideDuration={6000} 
        onClose={() => setFeedback(prev => ({...prev, show: false}))}
      >
        <Alert 
          severity={feedback.severity} 
          onClose={() => setFeedback(prev => ({...prev, show: false}))}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FloatingCta; 