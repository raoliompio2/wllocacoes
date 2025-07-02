import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  useTheme as useMuiTheme,
  useMediaQuery,
  keyframes,
} from '@mui/material';
import { ConstructionOutlined, WhatsApp } from '@mui/icons-material';
import { SearchBar } from './SearchBar';
import MobileSearchBar from './MobileSearchBar';
import { useCompany } from '../../context/CompanyContext';
import { useTheme } from '../../theme/ThemeContext';

// Animações
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.6; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const HeroSection: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { companyInfo } = useCompany();
  const { themePreferences, mode } = useTheme();
  
  // Obtendo as cores do tema atual
  const colors = mode === 'light' ? themePreferences.lightColors : themePreferences.darkColors;

  const handleWhatsAppClick = () => {
    // Usar o número do WhatsApp padrão da empresa
    const whatsappNumber = '00000000000'; // Número do WhatsApp da empresa
    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre locação de equipamentos.');
    window.open(`https://api.whatsapp.com/send?phone=55${whatsappNumber}&text=${message}`, '_blank');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #252525 100%)',
        color: 'white',
        mt: -2,
        pt: { xs: 0, sm: 0, md: 0 },
        pb: { xs: 16, sm: 20, md: 6 },
        minHeight: { xs: 'auto', md: '80vh' },
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.7,
          zIndex: 1,
        }
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          pt: 0,
          width: '100%'
        }}>
        <Grid container spacing={0} alignItems="center" sx={{ pt: { xs: '8%', md: '4%' } }}>
          {/* Texto e call-to-action */}
          <Grid item xs={12} md={5} sx={{ px: 0 }}>
            <Box sx={{ 
              pl: 0,
              maxWidth: { xs: '100%', md: '450px', lg: '500px' }
            }}>
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component="h1"
                fontWeight="bold"
                sx={{
                  mb: 1,
                  lineHeight: 1.2,
                  color: '#FF7700', // Cor laranja para o título
                  textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                  fontSize: { xs: '2.5rem', md: '2.8rem', lg: '3.2rem' }
                }}
              >
                Sua Obra Completa,
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mb: 2,
                  opacity: 0.95,
                  maxWidth: { xs: '100%', md: '400px' },
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.25)',
                  fontSize: { xs: '1.5rem', md: '1.7rem', lg: '2rem' }
                }}
              >
                do Inicio ao Fim
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ 
                  mb: { xs: 2, md: 3 },
                  maxWidth: { xs: '100%', md: '400px' }
                }}
              >
                <Button
                  component={Link}
                  to="/equipamentos"
                  variant="contained"
                  size="large"
                  startIcon={<ConstructionOutlined />}
                  sx={{
                    fontWeight: 'bold',
                    px: { xs: 3, md: 3 },
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: '#FF7700',
                    color: '#FFF',
                    '&:hover': {
                      bgcolor: '#E66B00',
                      opacity: 0.95,
                    },
                    fontSize: { xs: '0.9rem', md: '0.95rem' }
                  }}
                >
                  Ver Equipamentos
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsAppClick}
                  sx={{
                    color: 'white',
                    borderColor: '#FF7700',
                    borderWidth: 2,
                    fontWeight: 'bold',
                    px: { xs: 3, md: 3 },
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#E66B00',
                      bgcolor: 'rgba(255,119,0,0.1)',
                    },
                    fontSize: { xs: '0.9rem', md: '0.95rem' }
                  }}
                >
                  Fale Conosco
                </Button>
              </Stack>

              {/* Tags de benefícios */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  maxWidth: { xs: '100%', md: '400px' }
                }}
              >
                {['Equipamentos de Qualidade', 'Atendimento Rápido', 'Manutenção em Dia', 'Preços Competitivos'].map((tag, index) => (
                  <Box
                    key={index}
                    sx={{
                      bgcolor: 'rgba(255,119,0,0.15)',
                      borderRadius: 5,
                      px: 2,
                      py: 0.7,
                      fontSize: '0.85rem',
                      fontWeight: 'medium',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      '&:before': {
                        content: '""',
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#FF7700',
                        mr: 1,
                      },
                    }}
                  >
                    {tag}
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Imagem de equipamento */}
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'flex-end',
              alignItems: 'center',
              height: '100%',
              pr: { md: 0, lg: 2 }
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 'none',
                height: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                animation: `${float} 6s ease-in-out infinite`,
              }}
            >
              {/* Usando a imagem do hero */}
              <img
                src="/images/Imagehero.png?v=new"
                alt="Equipamentos de construção e locação"
                loading="eager"
                style={{
                  width: 'auto',
                  maxWidth: '120%',
                  height: 'auto',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  marginRight: 0,
                  transform: 'scale(1.05)',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Barra de pesquisa flutuante - apenas para tablets e desktops */}
      <Container 
        maxWidth="lg"
        sx={{
          position: 'absolute',
          bottom: { xs: -100, sm: -30 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          width: '100%',
          px: { xs: 2, sm: 3 },
          display: { xs: 'none', sm: 'block' } // Esconde em dispositivos móveis
        }}
      >
        <SearchBar />
      </Container>

      {/* Barra de pesquisa para dispositivos móveis */}
      {isMobile && (
        <Box 
          sx={{ 
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: 1100,
            px: 2,
            pb: 2
          }}
        >
          <MobileSearchBar />
        </Box>
      )}
    </Box>
  );
};

export default HeroSection; 