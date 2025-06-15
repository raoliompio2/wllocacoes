import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Engineering, 
  PeopleAlt, 
  CheckCircle, 
  Construction 
} from '@mui/icons-material';
import CountUp from 'react-countup';

interface StatItem {
  icon: React.ReactNode;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

const Stats: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [hasAnimated, setHasAnimated] = useState(false);
  const [inView, setInView] = useState(false);

  const stats: StatItem[] = [
    {
      icon: <Construction fontSize="large" color="primary" />,
      value: 500,
      label: 'Equipamentos Disponíveis',
      prefix: '+'
    },
    {
      icon: <CheckCircle fontSize="large" color="primary" />,
      value: 2500,
      label: 'Projetos Concluídos',
      prefix: '+'
    },
    {
      icon: <PeopleAlt fontSize="large" color="primary" />,
      value: 98,
      label: 'Satisfação dos Clientes',
      suffix: '%'
    },
    {
      icon: <Engineering fontSize="large" color="primary" />,
      value: 15,
      label: 'Anos de Experiência'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setInView(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [hasAnimated]);

  return (
    <Box 
      id="stats-section"
      sx={{ 
        py: { xs: 6, md: 10 }, 
        bgcolor: 'primary.dark',
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom 
          fontWeight="bold"
          sx={{ color: 'white', mb: 6 }}
        >
          Números que Falam por Nós
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper 
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                  boxShadow: 'none',
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {stat.icon}
                </Box>
                
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  component="p" 
                  fontWeight="bold" 
                  sx={{ mb: 1, color: 'white' }}
                >
                  {stat.prefix || ''}
                  {inView ? (
                    <CountUp 
                      end={stat.value} 
                      duration={2.5} 
                      separator="." 
                      decimals={0}
                      decimal=","
                    />
                  ) : (
                    '0'
                  )}
                  {stat.suffix || ''}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 'medium',
                    mt: 'auto'
                  }}
                >
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Stats; 