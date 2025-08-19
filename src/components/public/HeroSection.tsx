import React from 'react';
import {
  Box,
  Container,
  useTheme as useMuiTheme,
  useMediaQuery,
  keyframes,
} from '@mui/material';
import { SearchBar } from './SearchBar';
import MobileSearchBar from './MobileSearchBar';
import { useTheme } from '../../theme/ThemeContext';

// Importações do Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Animações
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Array de banners
const banners = [
  {
    id: 1,
    imagePath: '/images_optimized/Banner/WL-LOCACOES-Dezembro-Banner.webp',
    fallbackPath: '/images/Banner/WL-LOCACOES-Dezembro-Banner.png',
    alt: 'Banner WL Locações - Tudo o que você precisa para sua obra'
  }
];

// Estilo para o Swiper
const swiperStyles = {
  '.swiper-pagination-bullet': {
    width: '12px',
    height: '12px',
    background: 'rgba(255, 255, 255, 0.6)',
    opacity: 0.6,
  },
  '.swiper-pagination-bullet-active': {
    opacity: 1,
    background: 'white',
  },
  '.swiper-button-next, .swiper-button-prev': {
    color: 'white',
    background: 'rgba(0, 0, 0, 0.3)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    '&:after': {
      fontSize: '18px',
    },
  },
};

const HeroSection: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { themePreferences, mode } = useTheme();
  
  // Obtendo as cores do tema atual
  const colors = mode === 'light' ? themePreferences.lightColors : themePreferences.darkColors;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        // Altura proporcional baseada na resolução original do banner (1200x800 aprox.)
        height: { xs: '300px', sm: '400px', md: '500px', lg: '600px' },
        minHeight: { xs: '300px', sm: '400px' },
        maxHeight: '600px',
        overflow: 'visible', // Mudado para visible para permitir que o filtro apareça sobre a imagem
        // Hero fica atrás do menu com z-index menor
        zIndex: 1,
        // Margem superior negativa para sobrepor o header
        mt: { xs: -12, sm: -12, md: -12 }
      }}
    >
      {/* Carrossel de Banners em tela cheia */}
      <div className="hero-fullscreen-swiper-container" style={{ width: '100%', height: '100%' }}>
        <Swiper
          modules={[EffectFade]}
          slidesPerView={1}
          navigation={false}
          pagination={false}
          autoplay={false}
          effect="fade"
          loop={false}
          className="hero-fullscreen-swiper"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  // BORDAS ARREDONDADAS VISÍVEIS NO CONTAINER
                  borderRadius: { xs: '24px', sm: '32px', md: '40px', lg: '48px' },
                  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                  border: '4px solid rgba(255,255,255,0.4)',
                  // Background gradient para destacar as bordas
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                  padding: '8px', // Padding interno para criar espaço entre borda e imagem
                  overflow: 'visible', // Permite a sombra ser visível
                }}
              >
                {/* Overlay removido para manter a imagem nítida e clara */}
                <picture style={{ width: '100%', height: '100%', display: 'block' }}>
                  <source srcSet={banner.imagePath} type="image/webp" />
                  <img
                    src={banner.fallbackPath}
                    alt={banner.alt}
                    loading={banner.id === 1 ? "eager" : "lazy"}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain', // VOLTOU: mantém imagem completa sem cortar
                      objectPosition: 'center',
                      // Bordas arredondadas na imagem também para harmonizar
                      borderRadius: '32px',
                    }}
                  />
                </picture>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Barra de pesquisa flutuante posicionada no FINAL da imagem - metade sobre e metade fora */}
      <Container 
        maxWidth="lg"
        sx={{
          position: 'absolute',
          // AJUSTANDO para REALMENTE ficar metade sobre a imagem (SearchBar tem ~140px de altura)
          bottom: { xs: -40, sm: -45, md: -50, lg: -55 }, // Valores menores para mais sobreposição
          left: '50%',
          transform: 'translateX(-50%)', 
          zIndex: 100, // Z-index MUITO alto para garantir que apareça SOBRE TUDO
          width: '100%',
          px: { xs: 2, sm: 3 },
          display: { xs: 'none', sm: 'block' }, // Esconde em dispositivos móveis
          // Removendo a margin-bottom da SearchBar quando ela está flutuante
          '& .MuiPaper-root': {
            mb: 0, // Remove margin-bottom para posicionamento preciso
            position: 'relative',
            zIndex: 101, // Z-index ainda maior para o Paper da SearchBar
          }
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