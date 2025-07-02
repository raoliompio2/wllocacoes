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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Engineering,
  Construction,
  CheckCircle,
  Timeline,
  Groups,
  Home as HomeIcon,
  Architecture,
  Build,
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
      title: 'Confiabilidade',
      description: 'Comprometimento com a qualidade e pontualidade em todos os serviços'
    },
    {
      icon: <Engineering color="primary" />,
      title: 'Perspicácia',
      description: 'Olhar atento e estratégico para encontrar as melhores soluções'
    },
    {
      icon: <Timeline color="primary" />,
      title: 'Equilíbrio',
      description: 'Relações harmoniosas com clientes, fornecedores e colaboradores'
    },
    {
      icon: <Construction color="primary" />,
      title: 'Espírito Analítico',
      description: 'Análise criteriosa de cada projeto para garantir os melhores resultados'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Sobre a Panda Locações | Locação de Equipamentos em Limeira</title>
        <meta name="description" content="Conheça a Panda Locações, empresa especializada em locação de equipamentos para construção civil em Limeira e região. Atendemos desde pequenas obras até grandes construções com eficiência e qualidade." />
        <meta name="keywords" content="sobre panda locações, história panda locações, empresa de locação de equipamentos, locadora de equipamentos Limeira, quem somos panda locações" />
        <link rel="canonical" href="https://pandalocacoes.com.br/empresa" />
        
        {/* Meta tags para redes sociais */}
        <meta property="og:title" content="Sobre a Panda Locações | Empresa de Aluguel de Equipamentos" />
        <meta property="og:description" content="Conheça a história da Panda Locações, especializada em aluguel de equipamentos para construção civil e industrial em Limeira e região." />
        <meta property="og:url" content="https://pandalocacoes.com.br/empresa" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://pandalocacoes.com.br/images/Logo Panda.png" />
        
        {/* Meta tags Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Sobre a Panda Locações | Empresa de Aluguel de Equipamentos" />
        <meta name="twitter:description" content="Conheça a história da Panda Locações, especializada em aluguel de equipamentos para construção em Limeira e região." />
        <meta name="twitter:image" content="https://pandalocacoes.com.br/images/Logo Panda.png" />
      </Helmet>

      {/* Adiciona Schema.org para About Page */}
      <AboutPageSchema 
        companyName="Panda Locações"
        foundingDate="2015-01-01" 
        description="Especializada em aluguel de equipamentos para construção civil e industrial em Limeira e região, a Panda Locações atende com excelência empresas e pessoas físicas, oferecendo os melhores equipamentos com preços justos."
        imageUrl="/images/Logo Panda.png"
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
              Sobre a Panda Locações
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 800 }}>
              Especialistas em locação de equipamentos para construção civil em Limeira e região
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
                    A PANDA LOCAÇÕES é uma empresa voltada para o ramo da construção civil, desde pequenas obras e consertos até grandes obras!
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Você Sabia?</strong> Nosso nome fantasia é inspirado em um animal que sempre em busca da paz, não é capaz sequer de se imaginar vivendo ao lado de pessoas que se relacionam na base de tapas e berros, independente de quem seja. É sinônimo de.. CONFIABILIDADE, PERSPICÁCIA, EQUILÍBRIO E ESPÍRITO ANALÍTICO.
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
                    src="/images/Empresa/2024-08-15 (1).webp"
                    alt="Panda Locações - Equipamentos para construção civil"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/images/Logo Panda.png';
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Seção de Missão, Visão e Valores */}
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
                      A panda locações tem como missão realizar os sonhos de seus clientes! Sejam sua primeira moradia, sua melhor moradia, seja a construção de sua empresa ou para seus investimentos!
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
                      A panda locações tem como visão ser a melhor empresa de locações de Limeira, sendo referencia em seu ramo!
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
                      A Panda locações tem como seu maior valor o atendimento ao cliente, com rapidez, eficácia e com preços justos! Assim com seus fornecedores e parceiros ter um relacionamento estreito e transparente!
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
                    src="/images/Empresa/2024-08-15 (2).webp"
                    alt="Equipe Panda Locações"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/images/Logo Panda.png';
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
                    Nossa equipe é altamente qualificada e comprometida com a excelência no atendimento. Trabalhamos diariamente para oferecer as melhores soluções em locação de equipamentos para construção civil, com preços competitivos e um serviço de alta qualidade.
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
                    src="/images/Empresa/images (9).jpeg"
                    alt="Equipamentos Panda Locações"
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
                    src="/images/Empresa/images (10).jpeg"
                    alt="Serviços Panda Locações"
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
              Pronto para realizar seu projeto?
            </Typography>
            <Typography variant="body1" paragraph sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              A Panda Locações está pronta para fornecer todos os equipamentos necessários para sua obra. Entre em contato conosco e solicite um orçamento sem compromisso!
            </Typography>
            <Link to="/contato" style={{ textDecoration: 'none' }}>
              <MuiLink
                component="button"
                variant="contained"
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'secondary.dark'
                  }
                }}
              >
                Entre em Contato
              </MuiLink>
            </Link>
          </Paper>
        </Container>
      </main>
    </>
  );
};

export default AboutPage;