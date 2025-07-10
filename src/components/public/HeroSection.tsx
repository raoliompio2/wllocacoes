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
    imagePath: '/images_optimized/Banner/Sem-Titulo-1.webp',
    fallbackPath: '/images/Banner/Sem-Titulo-1.jpg',
    alt: 'Banner Lokajá - Equipamentos para construção'
  },
  {
    id: 2,
    imagePath: '/images_optimized/Banner/Sem-Titulo-2.webp',
    fallbackPath: '/images/Banner/Sem-Titulo-2.jpg',
    alt: 'Banner Lokajá - Aluguel de equipamentos'
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
        // Altura reduzida para melhor proporção do banner
        height: { xs: '250px', sm: '300px', md: '350px', lg: '400px' },
        minHeight: { xs: '250px', sm: '300px' },
        overflow: 'hidden',
        // Adicionando margem superior para afastar o banner do header
        mt: { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* Carrossel de Banners em tela cheia */}
      <div className="hero-fullscreen-swiper-container" style={{ width: '100%', height: '100%' }}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          slidesPerView={1}
          navigation={!isMobile}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          effect="fade"
          loop={true}
          className="hero-fullscreen-swiper"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    zIndex: 1,
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)',
                  }}
                />
                <picture>
                  <source srcSet={banner.imagePath} type="image/webp" />
                  <img
                    src={banner.fallbackPath}
                    alt={banner.alt}
                    loading={banner.id === 1 ? "eager" : "lazy"}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                </picture>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Barra de pesquisa flutuante posicionada para ficar metade no banner e metade no conteúdo abaixo */}
      <Container 
        maxWidth="lg"
        sx={{
          position: 'absolute',
          // Ajustando o bottom para posicionar o filtro metade no banner e metade fora
          bottom: { xs: -65, sm: -70, md: -75 },
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