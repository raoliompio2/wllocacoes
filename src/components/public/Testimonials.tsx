import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { ChevronLeft, ChevronRight, FormatQuote } from '@mui/icons-material';

interface Testimonial {
  id: number;
  name: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'João Silva',
    company: 'Construtora Silva & Filhos',
    avatar: '/images/avatars/avatar1.jpg',
    rating: 5,
    text: 'Excelente serviço! As máquinas chegaram no prazo e em perfeito estado. O suporte técnico foi muito prestativo quando precisamos de ajuda.'
  },
  {
    id: 2,
    name: 'Maria Oliveira',
    company: 'MO Engenharia',
    avatar: '/images/avatars/avatar2.jpg',
    rating: 5,
    text: 'Conseguimos finalizar nossa obra antes do prazo graças à qualidade dos equipamentos alugados. Recomendo fortemente!'
  },
  {
    id: 3,
    name: 'Carlos Santos',
    company: 'Santos Construções',
    avatar: '/images/avatars/avatar3.jpg',
    rating: 4,
    text: 'Preços justos e equipamentos bem conservados. A entrega foi pontual e a devolução foi simples e rápida.'
  },
  {
    id: 4,
    name: 'Fernanda Lima',
    company: 'FL Arquitetura',
    avatar: '/images/avatars/avatar4.jpg',
    rating: 5,
    text: 'Os equipamentos são modernos e muito bem mantidos. O time de atendimento é excepcional, sempre dispostos a ajudar.'
  },
  {
    id: 5,
    name: 'Roberto Almeida',
    company: 'Almeida Construções',
    avatar: '/images/avatars/avatar5.jpg',
    rating: 4,
    text: 'Estou muito satisfeito com o serviço. Os equipamentos são de qualidade e o processo de aluguel é simples e descomplicado.'
  }
];

const Testimonials: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(3);
  
  useEffect(() => {
    // Determinar quantos testimonials mostrar com base na largura da tela
    if (isMobile) {
      setDisplayCount(1);
    } else if (isTablet) {
      setDisplayCount(2);
    } else {
      setDisplayCount(3);
    }
  }, [isMobile, isTablet]);
  
  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - displayCount));
  };
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev < testimonials.length - displayCount ? prev + 1 : 0));
  };
  
  // Seleciona os testemunhos que serão exibidos
  const visibleTestimonials = testimonials.slice(activeIndex, activeIndex + displayCount);
  
  // Se não tivermos testemunhos suficientes, pegamos do início da array
  if (visibleTestimonials.length < displayCount) {
    const remaining = displayCount - visibleTestimonials.length;
    visibleTestimonials.push(...testimonials.slice(0, remaining));
  }

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            O que nossos clientes dizem
          </Typography>
          <Divider sx={{ maxWidth: 100, mx: 'auto', mb: 2, borderColor: 'primary.main', borderWidth: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Conheça a experiência de quem já utilizou nossos serviços
          </Typography>
        </Box>
        
        <Box sx={{ position: 'relative', px: { xs: 0, md: 6 } }}>
          {/* Controles de navegação */}
          {!isMobile && (
            <>
              <IconButton 
                onClick={handlePrev}
                sx={{ 
                  position: 'absolute', 
                  left: -20, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton 
                onClick={handleNext}
                sx={{ 
                  position: 'absolute', 
                  right: -20, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
          
          {/* Testimonials */}
          <Grid container spacing={3} justifyContent="center">
            {visibleTestimonials.map((testimonial) => (
              <Grid item xs={12} sm={6} md={4} key={testimonial.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ position: 'relative', mb: 3 }}>
                      <FormatQuote
                        sx={{
                          position: 'absolute',
                          top: -10,
                          left: -10,
                          color: 'primary.light',
                          opacity: 0.2,
                          fontSize: 60,
                          transform: 'rotate(180deg)'
                        }}
                      />
                      <Typography variant="body1" color="text.secondary" sx={{ minHeight: 100, zIndex: 1, position: 'relative' }}>
                        "{testimonial.text}"
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        sx={{ 
                          width: 56, 
                          height: 56,
                          mr: 2,
                          boxShadow: 2,
                          border: '2px solid',
                          borderColor: 'primary.light'
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.company}
                        </Typography>
                        <Rating value={testimonial.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Navegação mobile */}
          {isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <IconButton onClick={handlePrev}>
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={handleNext}>
                <ChevronRight />
              </IconButton>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonials; 