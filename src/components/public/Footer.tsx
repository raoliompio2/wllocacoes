import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Link as MuiLink
} from '@mui/material';
import {
  Facebook,
  Instagram,
  WhatsApp,
  LinkedIn,
  YouTube,
  Phone,
  Email,
  LocationOn,
  Send,
  ChevronRight,
  Twitter,
  AccessTime
} from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';
import { getFooterLogo, LogoUrls } from '../../utils/colorUtils';
import BusinessHours from '../common/BusinessHours';
import { useTheme as useCustomTheme } from '../../theme/ThemeContext';

interface CompanyInfo {
  name: string;
  logo_url: string | LogoUrls;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
}

interface Category {
  id: string;
  name: string | null;
}

const Footer: React.FC = () => {
  const theme = useTheme();
  const { themePreferences } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const logoUrl = getFooterLogo();
  
  // Estado para armazenar informações da empresa
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'WL Locações de Equipamentos',
    logo_url: logoUrl,
    phone: '(85) 98610-1415',
    email: 'contato@wllocacoes.com.br',
    address: 'Av. Dep. Paulino Rocha, 1881 - Cajazeiras, Fortaleza - CE, 60864-311',
    whatsapp: '85 98610-1415',
    facebook_url: 'https://www.facebook.com/wllocacoes',
    instagram_url: 'https://www.instagram.com/wllocacoes',
    linkedin_url: null,
    youtube_url: null,
    twitter_url: null
  });
  
  // Horário de funcionamento
  const businessHours = {
    weekdays: "Segunda a Sexta: 07:00 às 11:00, 13:00 às 17:00",
    saturday: "Sábado: 07:00 às 11:30",
    sunday: "Domingo: Fechado"
  };
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Buscar categorias reais do banco de dados
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // @ts-ignore
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCategories(data as Category[]);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  // Função para criar slug a partir do nome da categoria
  const createSlug = useMemo(() => (name: string) => {
    return encodeURIComponent(
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()
    );
  }, []);

  // Handler para inscrição no newsletter
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples de email
    if (!email) {
      setEmailError('Por favor, insira seu email');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Por favor, insira um email válido');
      return;
    }
    
    // Simulação de inscrição
    setEmailError('');
    setSubscribeSuccess(true);
    setEmail('');
    
    // Fechar alerta após 5 segundos
    setTimeout(() => {
      setSubscribeSuccess(false);
    }, 5000);
  };

  // Links de navegação rápida
  const quickLinks = [
    { text: 'Home', path: '/' },
    { text: 'Equipamentos', path: '/equipamentos' },
    { text: 'Sobre Nós', path: '/empresa' },
    { text: 'Contato', path: '/contato' }
  ];

  // Links de categorias de equipamentos do banco de dados
  const equipmentCategories = useMemo(() => {
    return categories.map(category => {
      // Usar o nome da categoria para criar o slug
      const categoryName = category.name || '';
      const categorySlug = createSlug(categoryName);
      
      return {
        text: categoryName,
        path: `/equipamentos/${categorySlug}`
      };
    }).slice(0, 5); // Limitar a 5 categorias para o footer
  }, [categories, createSlug]);

  // Dados estáticos caso não consiga carregar do banco
  const fallbackCompanyData: CompanyInfo = {
    name: 'WL Locações',
    phone: '(85) 98610-1415',
    whatsapp: '85 98610-1415',
    email: 'contato@wllocacoes.com.br',
    address: 'Av. Dep. Paulino Rocha, 1881 - Cajazeiras, Fortaleza – CE, CEP: 60864-311',
    logo_url: logoUrl,
    facebook_url: 'https://www.facebook.com/wllocacoes',
    instagram_url: 'https://www.instagram.com/wllocacoes',
    linkedin_url: null,
    youtube_url: null,
    twitter_url: null
  };

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: themePreferences.lightColors.primary, // Usar cor primária do tema
        color: 'white',
        pt: 6,
        pb: 4,
        mt: 'auto',
        borderTopLeftRadius: themePreferences?.borderRadius * 4 || 16,
        borderTopRightRadius: themePreferences?.borderRadius * 4 || 16,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        overflow: 'visible',
        clipPath: 'inset(-40px -40px 0px -40px)'
      }}
      itemScope
      itemType="http://schema.org/LocalBusiness"
    >
      {/* Metadados ocultos para SEO */}
      <meta itemProp="name" content="WL Locações de Equipamentos" />
      <meta itemProp="description" content="A WL Locações oferece serviços de aluguel de equipamentos para construção civil e industrial em Fortaleza e região." />
      <meta itemProp="telephone" content="(85) 98610-1415" />
      <meta itemProp="email" content="contato@wllocacoes.com.br" />
      <div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">
        <meta itemProp="streetAddress" content="Av. Dep. Paulino Rocha, 1881" />
        <meta itemProp="addressLocality" content="Fortaleza" />
        <meta itemProp="addressRegion" content="CE" />
        <meta itemProp="postalCode" content="60864-311" />
        <meta itemProp="addressCountry" content="BR" />
      </div>
      <meta itemProp="openingHours" content="Mo-Fr 07:00-11:00, 13:00-17:00" />
      
      {/* Conteúdo principal do footer */}
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Coluna 1 - Informações da empresa */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              {/* Logo com fundo escuro - usar logo para fundo escuro */}
              {typeof companyInfo.logo_url === 'string' ? (
                                  <Box
                    component="img"
                    src={companyInfo.logo_url}
                    alt="WL Locações - Aluguel de Equipamentos para Construção"
                  sx={{
                    height: 127,
                    maxWidth: 510,
                    objectFit: 'contain',
                    mb: 2,
                    borderRadius: 4,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: 127,
                    maxWidth: 510,
                    mb: 2,
                    borderRadius: 4,
                  }}
                >
                  <picture>
                    <source srcSet={`${companyInfo.logo_url.webp} 510w`} type="image/webp" />
                    <img
                      src={companyInfo.logo_url.fallback}
                      alt="WL Locações - Aluguel de Equipamentos para Construção"
                      style={{
                        height: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        borderRadius: '16px',
                      }}
                    />
                  </picture>
                </Box>
              )}
              
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                A WL Locações é especializada no aluguel de equipamentos para construção civil e industrial, 
                atendendo Fortaleza e região com excelência e qualidade.
              </Typography>
            </Box>
            
            <Stack spacing={2}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ opacity: 0.9 }}>
                Endereço:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationOn sx={{ mr: 1, fontSize: 20, color: 'secondary.main', mt: 0.5 }} />
                <Typography variant="body2">
                  Av. Dep. Paulino Rocha, 1881 - Cajazeiras, Fortaleza - CE, 60864-311
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1, fontSize: 20, color: 'secondary.main' }} />
                <Typography variant="body2">
                  (85) 98610-1415
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 1, fontSize: 20, color: 'secondary.main' }} />
                <Typography variant="body2">
                  contato@wllocacoes.com.br
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <AccessTime sx={{ mr: 1, fontSize: 20, color: 'secondary.main', mt: 0.5 }} />
                <Box>
                  <Typography variant="body2">
                    Segunda a Sexta: 07:00 às 11:00, 13:00 às 17:00
                  </Typography>
                  <Typography variant="body2">
                    Sábado: 07:00 às 11:30
                  </Typography>
                  <Typography variant="body2">
                    Domingo: Fechado
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
          
          {/* Coluna 2 - Links Rápidos */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Links Rápidos
            </Typography>
            
            <List dense disablePadding>
              {quickLinks.map((link, index) => (
                <ListItem 
                  key={index} 
                  disablePadding 
                  sx={{ mb: 1 }}
                  component={Link} 
                  to={link.path}
                >
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <ChevronRight sx={{ color: 'secondary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={link.text} />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Coluna 3 - Categorias */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Categorias
            </Typography>
            
            <List dense disablePadding>
              {equipmentCategories.map((category, index) => (
                <ListItem 
                  key={index} 
                  disablePadding 
                  sx={{ mb: 1 }}
                  component={Link} 
                  to={category.path}
                >
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <ChevronRight sx={{ color: 'secondary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={category.text} />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Coluna 4 - Newsletter */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Newsletter
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Assine nossa newsletter para receber ofertas exclusivas e novidades sobre equipamentos para locação em sua região.
            </Typography>
            
            <Box component="form" onSubmit={handleSubscribe} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Seu e-mail"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'secondary.main',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '& input::placeholder': {
                    color: 'rgba(255,255,255,0.5)',
                  }
                }}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                endIcon={<Send />}
                fullWidth
              >
                Assinar
              </Button>
            </Box>
            
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Redes Sociais
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {companyInfo.facebook_url && (
                <IconButton 
                  href={companyInfo.facebook_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                                            aria-label="Facebook da WL Locações"
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                  size="small"
                >
                  <Facebook fontSize="small" />
                </IconButton>
              )}
              
              {companyInfo.instagram_url && (
                <IconButton 
                  href={companyInfo.instagram_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                                            aria-label="Instagram da WL Locações"
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                  size="small"
                >
                  <Instagram fontSize="small" />
                </IconButton>
              )}
              
              {companyInfo.linkedin_url && (
                <IconButton 
                  href={companyInfo.linkedin_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                                            aria-label="LinkedIn da WL Locações"
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                  size="small"
                >
                  <LinkedIn fontSize="small" />
                </IconButton>
              )}
              
              {companyInfo.youtube_url && (
                <IconButton 
                  href={companyInfo.youtube_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                                            aria-label="Canal do YouTube da WL Locações"
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                  size="small"
                >
                  <YouTube fontSize="small" />
                </IconButton>
              )}
              
              {companyInfo.whatsapp && (
                <IconButton 
                  href={`https://wa.me/55${companyInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                                            aria-label="WhatsApp da WL Locações"
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                  size="small"
                >
                  <WhatsApp fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        {/* Copyright e links de políticas */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="white" align={isMobile ? 'center' : 'left'}>
              © {new Date().getFullYear()} WL Locações. Todos os direitos reservados.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'center' }}>
            <Typography variant="body2" color="white" sx={{ display: 'flex', alignItems: 'center' }}>
              Desenvolvido por <MuiLink href="https://opendreams.com.br" target="_blank" rel="noopener" sx={{ ml: 0.5, color: 'white', '&:hover': { color: 'secondary.main' } }}>Open Dreams</MuiLink>
            </Typography>
            <IconButton 
              href={`https://wa.me/5514982135008`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Open Dreams"
              sx={{ 
                color: 'white',
                ml: 1,
                '&:hover': { color: 'secondary.main' }
              }}
              size="small"
            >
              <WhatsApp fontSize="small" />
            </IconButton>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent={isMobile ? 'center' : 'flex-end'}
            >
              <MuiLink component={Link} to="/politica-de-privacidade" color="white" underline="hover" sx={{ '&:hover': { color: 'secondary.main' } }}>
                Política de Privacidade
              </MuiLink>
              <MuiLink component={Link} to="/termos-de-uso" color="white" underline="hover" sx={{ '&:hover': { color: 'secondary.main' } }}>
                Termos de Uso
              </MuiLink>
              <MuiLink component={Link} to="/sitemap" color="white" underline="hover" sx={{ '&:hover': { color: 'secondary.main' } }}>
                Sitemap
              </MuiLink>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      
      {/* Alerta de sucesso */}
      <Snackbar 
        open={subscribeSuccess} 
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success">
          Inscrição realizada com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Footer; 