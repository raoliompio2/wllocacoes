import React from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Divider,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Engineering,
  Construction,
  CheckCircle,
  Timeline,
  Groups,
  Architecture,
  Handyman,
  LocalShipping,
  Support,
  StarRate,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import AboutPageSchema from '../SEO/AboutPageSchema';

const AboutPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Valores para os diferenciais
  const advantages = [
    {
      icon: <CheckCircle color="primary" />,
      title: 'Compromisso',
      description: 'Cumprimento de prazos e responsabilidade em cada projeto'
    },
    {
      icon: <StarRate color="primary" />,
      title: 'Qualidade',
      description: 'Equipamentos certificados e em excelente estado de conservação'
    },
    {
      icon: <Support color="primary" />,
      title: 'Atendimento',
      description: 'Suporte técnico especializado durante todo o período de locação'
    },
    {
      icon: <LocalShipping color="primary" />,
      title: 'Logística',
      description: 'Entrega e retirada em toda região de Fortaleza e cidades vizinhas'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Sobre a WL Locações | Locação de Equipamentos Para Construção em Fortaleza</title>
        <meta name="description" content="Conheça a WL Locações, especializada em locação de equipamentos para construção civil e industrial em Fortaleza e região. Atendemos desde pequenas obras até grandes construções com eficiência e qualidade." />
        <meta name="keywords" content="sobre WL Locações, história WL Locações, empresa de locação de equipamentos, locadora de equipamentos Fortaleza, quem somos WL Locações, aluguel de equipamentos Ceará, locação de betoneiras, andaimes para aluguel Fortaleza" />
        <link rel="canonical" href="https://wllocacoes.com.br/empresa" />
        
        {/* Meta tags para redes sociais */}
        <meta property="og:title" content="Sobre a WL Locações | Locação de Equipamentos Para Construção em Fortaleza" />
        <meta property="og:description" content="Conheça a história da WL Locações, especializada em aluguel de equipamentos para construção civil e industrial em Fortaleza e região." />
        <meta property="og:url" content="https://wllocacoes.com.br/empresa" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://wllocacoes.com.br/images/Logo_fundo_claro/Logo_WL.png" />
        
        {/* Meta tags Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Sobre a WL Locações | Locação de Equipamentos Para Construção em Fortaleza" />
        <meta name="twitter:description" content="Conheça a história da WL Locações, especializada em aluguel de equipamentos para construção civil e industrial em Fortaleza e região." />
        <meta name="twitter:image" content="https://wllocacoes.com.br/images/Logo_fundo_claro/WL_fundo_claro.png" />
      </Helmet>

      {/* Adiciona Schema.org para About Page */}
      <AboutPageSchema 
        companyName="WL Locações"
        foundingDate="2020-01-01" 
        description="Especializada em aluguel de equipamentos para construção civil e industrial, a WL Locações atende com excelência empresas e pessoas físicas em Fortaleza e região, oferecendo os melhores equipamentos com preços justos."
        imageUrl="/images/Logo_fundo_claro/WL_fundo_claro.png"
      />
      
      <main>
        {/* Banner da Página */}
        <Box 
          sx={{ 
            bgcolor: 'primary.dark',
            color: 'white',
            py: { xs: 6, md: 10 },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Sobre a WL Locações
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 800 }}>
              Especialistas em locação de equipamentos para construção civil em Fortaleza e região
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ py: 4, mt: 1 }}>
          {/* Seção Principal - Sobre a Empresa */}
          <Box sx={{ mb: 8 }} id="sobre-empresa">
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              gutterBottom 
              textAlign={isMobile ? 'center' : 'left'}
            >
              A Empresa
            </Typography>
            <Divider 
              sx={{ 
                width: 80, 
                borderColor: 'primary.main', 
                borderWidth: 2, 
                mb: 4,
                mx: isMobile ? 'auto' : 0
              }} 
            />
            
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body1" paragraph>
                    A WL Locações é uma empresa cearense especializada no setor de locação de equipamentos para construção civil, atendendo Fortaleza e toda a região metropolitana. Nosso foco é proporcionar soluções completas que tornam os projetos de nossos clientes mais eficientes e econômicos.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Com um estoque variado de equipamentos de alta qualidade e manutenção rigorosa, a WL Locações se destaca pelo atendimento personalizado, entrega pontual e assistência técnica durante todo o período de locação, garantindo que sua obra seja concluída dentro do prazo e com a qualidade esperada.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    overflow: 'hidden', 
                    borderRadius: 2,
                    height: { xs: 240, sm: 300, md: 380 }
                  }}
                >
                  <Box 
                    component="img"
                    src="/images_optimized/Empresa/instalacoes-wl-locacoes-1.webp"
                    alt="WL Locações - Instalações para locação de equipamentos em Fortaleza"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/images/logo.png';
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Seção de Nossa Essência */}
          <Paper elevation={0} sx={{ p: 4, mb: 8, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Nossa Essência
              </Typography>
              <Divider sx={{ width: 80, borderColor: 'secondary.main', borderWidth: 2, mb: 4, mx: 'auto' }} />
            </Box>
            
            <Grid container spacing={4}>
              {/* Missão */}
              <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%', borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 70, 
                        height: 70, 
                        bgcolor: 'primary.main', 
                        mx: 'auto', 
                        mb: 2,
                        boxShadow: 2
                      }}
                    >
                      <Architecture fontSize="large" />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Missão
                    </Typography>
                    <Typography variant="body1">
                      Fornecer soluções de qualidade em equipamentos para construção civil, contribuindo para o sucesso dos projetos de nossos clientes com eficiência, segurança e preço justo.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Visão */}
              <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%', borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 70, 
                        height: 70, 
                        bgcolor: 'secondary.main', 
                        mx: 'auto', 
                        mb: 2,
                        boxShadow: 2
                      }}
                    >
                      <Timeline fontSize="large" />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Visão
                    </Typography>
                    <Typography variant="body1">
                      Ser reconhecida como a melhor empresa de locação de equipamentos para construção do estado do Ceará, referência em qualidade de serviços e satisfação dos clientes.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Valores */}
              <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%', borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 70, 
                        height: 70, 
                        bgcolor: 'primary.main', 
                        mx: 'auto', 
                        mb: 2,
                        boxShadow: 2
                      }}
                    >
                      <Groups fontSize="large" />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Valores
                    </Typography>
                    <Typography variant="body1">
                      Integridade, excelência, comprometimento, inovação e foco no cliente são os pilares que sustentam todas as nossas ações e relacionamentos com clientes, colaboradores e fornecedores.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Seção de Diferenciais */}
          <Box sx={{ mb: 8 }}>
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              gutterBottom 
              textAlign={isMobile ? 'center' : 'left'}
            >
              Nossos Diferenciais
            </Typography>
            <Divider 
              sx={{ 
                width: 80, 
                borderColor: 'primary.main', 
                borderWidth: 2, 
                mb: 4,
                mx: isMobile ? 'auto' : 0
              }} 
            />
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    overflow: 'hidden', 
                    borderRadius: 2,
                    height: { xs: 240, sm: 300, md: 380 }
                  }}
                >
                  <Box 
                    component="img"
                    src="/images_optimized/Empresa/equipe-wl-locacoes-1.webp"
                    alt="Equipe especializada WL Locações - Profissionais em locação de equipamentos"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/images/logo.png';
                    }}
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Grid container spacing={3}>
                  {advantages.map((advantage, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
                        <Box sx={{ mt: 1 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {advantage.icon}
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {advantage.title}
                          </Typography>
                          <Typography variant="body2">
                            {advantage.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="body1" paragraph>
                    Nossa equipe é altamente qualificada e treinada para oferecer as melhores soluções em equipamentos para sua obra. Trabalhamos com as melhores marcas do mercado e realizamos manutenção preventiva constante, garantindo segurança e eficiência para todos os nossos clientes em Fortaleza, Caucaia, Maracanaú e toda região metropolitana de Fortaleza.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {/* Seção de Galeria */}
          <Box sx={{ mb: 8 }}>
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              gutterBottom 
              textAlign={isMobile ? 'center' : 'left'}
            >
              Galeria
            </Typography>
            <Divider 
              sx={{ 
                width: 80, 
                borderColor: 'primary.main', 
                borderWidth: 2, 
                mb: 4,
                mx: isMobile ? 'auto' : 0
              }} 
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    overflow: 'hidden', 
                    borderRadius: 2,
                    height: { xs: 200, sm: 250, md: 300 }
                  }}
                >
                  <Box 
                    component="img"
                    src="/images_optimized/Empresa/instalacoes-wl-locacoes-2.webp"
                    alt="Equipamentos WL Locações em Fortaleza - Instalações modernas"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    overflow: 'hidden', 
                    borderRadius: 2,
                    height: { xs: 200, sm: 250, md: 300 }
                  }}
                >
                  <Box 
                    component="img"
                    src="/images_optimized/Empresa/equipe-wl-locacoes-2.webp"
                    alt="Serviços WL Locações em Fortaleza - Equipe profissional"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
          
          {/* CTA Final */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, md: 6 }, 
              borderRadius: 2, 
              bgcolor: 'primary.main',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Pronto para iniciar seu projeto?
            </Typography>
            <Typography variant="body1" paragraph sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              A WL Locações está à disposição para fornecer todos os equipamentos necessários para sua obra em Fortaleza e região. Entre em contato conosco e solicite um orçamento personalizado!
            </Typography>
            <Link to="/contato" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Entre em Contato
              </Button>
            </Link>
          </Paper>
        </Container>
      </main>
    </>
  );
};

export default AboutPage; 