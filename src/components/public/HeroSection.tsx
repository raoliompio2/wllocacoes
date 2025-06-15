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
        background: colors.secondary,
        color: 'white',
        mt: -2,
        pt: { xs: 0, sm: 0, md: 0 },
        pb: { xs: 16, sm: 20, md: 22 },
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.7,
          zIndex: 1,
        }
      }}
    >
      {/* Círculos decorativos pulsantes - modificados para evitar destaque indesejado */}
      <Box
        sx={{
          position: 'absolute',
          top: 200,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}20 0%, ${colors.primary}05 70%, transparent 100%)`,
          zIndex: 1,
          animation: `${pulse} 8s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}10 0%, ${colors.primary}05 70%, transparent 100%)`,
          zIndex: 1,
          animation: `${pulse} 12s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '10%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}15 0%, ${colors.primary}05 70%, transparent 100%)`,
          zIndex: 1,
          animation: `${pulse} 5s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}15 0%, ${colors.primary}05 70%, transparent 100%)`,
          zIndex: 1,
          animation: `${pulse} 7s ease-in-out infinite`,
        }}
      />

      {/* Efeito de onda na parte inferior */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.1' d='M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,186.7C960,192,1056,224,1152,224C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
        }}
      />

      {/* Efeito de brilho diagonal animado - mais sutil */}
      <Box
        sx={{
          position: 'absolute',
          top: 120, // Abaixando para não interferir com o topo
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent, ${colors.primary}10, transparent)`,
          backgroundSize: '200% 100%',
          animation: `${shimmer} 15s infinite linear`,
          zIndex: 1,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: 0 }}>
        <Grid container spacing={2} alignItems="center" sx={{ pt: '10%' }}>
          {/* Texto e call-to-action */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component="h1"
                fontWeight="bold"
                sx={{
                  mb: 1,
                  lineHeight: 1.2,
                  color: '#FFD700', // Cor amarela para o #AQUITEM
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                #AQUITEM
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mb: 1,
                  opacity: 0.9,
                  maxWidth: 600,
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0px 1px 1px rgba(0,0,0,0.15)',
                }}
              >
                Tudo que você precisa para sua Obra!
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mb: { xs: 2, md: 3 } }}
              >
                <Button
                  component={Link}
                  to="/equipamentos"
                  variant="contained"
                  size="large"
                  startIcon={<ConstructionOutlined />}
                  sx={{
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: colors.primary,
                    '&:hover': {
                      bgcolor: colors.primary,
                      opacity: 0.9,
                    }
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
                    borderColor: 'white',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
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
                  maxWidth: 560,
                }}
              >
                {['Duas Unidades', 'Suporte Técnico', 'Equipamentos Novos', 'Engenheiros Mecânicos'].map((tag, index) => (
                  <Box
                    key={index}
                    sx={{
                      bgcolor: colors.primary,
                      borderRadius: 5,
                      px: 2,
                      py: 0.7,
                      fontSize: '0.85rem',
                      fontWeight: 'medium',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: 1,
                      '&:before': {
                        content: '""',
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'white',
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
            md={6}
            sx={{
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 500,
                mx: 'auto',
                animation: `${float} 6s ease-in-out infinite`,
              }}
            >
              {/* Usando a nova imagem do hero */}
              <picture>
                <source srcSet="/images/Imagehero.png" type="image/png" />
                <img
                  src="/images/Imagehero.png"
                  alt="Equipamentos de construção e locação"
                  width="500"
                  height="400"
                  loading="lazy"
                  onError={(e) => {
                    console.log('Erro ao carregar imagem do hero...');
                    // @ts-ignore
                    e.target.onerror = null; // Evita loop infinito
                    // @ts-ignore
                    e.target.src = "/images/placeholder.png";
                  }}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                    borderRadius: '12px',
                  }}
                />
              </picture>
              
              {/* Badge de desconto */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: -20,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 100,
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(15deg)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
                  zIndex: 2,
                }}
              >
                <Typography variant="caption" fontSize="0.7rem" textAlign="center">
                  #AQUITEM as melhores marcas do mercado.
                </Typography>
              </Box>
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