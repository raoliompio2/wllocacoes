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
  Alert
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
import { getHeaderFooterLogo } from '../../utils/colorUtils';
import BusinessHours from '../common/BusinessHours';

interface CompanyInfo {
  name: string;
  logo_url: string;
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const logoUrl = getHeaderFooterLogo();
  
  // Estado para armazenar informações da empresa
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'NOME DA EMPRESA',
    logo_url: logoUrl,
    phone: '(00) 0000-0000',
    email: 'contato@seudominio.com.br',
    address: 'Endereço da Empresa, Número - Bairro\nCidade - UF, 00000-000',
    whatsapp: '0000000000',
    facebook_url: null,
    instagram_url: null,
    linkedin_url: null,
    youtube_url: null,
    twitter_url: null
  });
  
  // Segunda unidade
  const secondBranch = {
    address: 'Endereço da Segunda Unidade, Número - Bairro\nCidade – UF, 00000-000',
    phone: '(00) 0000-0000',
    whatsapp: '0000000000'
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
          console.log('Categorias carregadas no footer:', data);
          setCategories(data as Category[]);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  // Função para criar slug a partir do nome da categoria
  const createSlug = (name: string) => {
    return encodeURIComponent(
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()
    );
  };

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
  const equipmentCategories = categories.map(category => {
    // Usar o nome da categoria para criar o slug
    const categoryName = category.name || '';
    const categorySlug = createSlug(categoryName);
    console.log(`[Footer] Criando link para categoria: ID=${category.id}, nome="${categoryName}", slug="${categorySlug}"`);
    
    return {
      text: categoryName,
      path: `/equipamentos/${categorySlug}`
    };
  }).slice(0, 5); // Limitar a 5 categorias para o footer

  // Dados estáticos caso não consiga carregar do banco
  const fallbackCompanyData: CompanyInfo = {
    name: 'NOME DA EMPRESA',
    phone: '(00) 0000-0000',
    whatsapp: '0000000000',
    email: 'contato@seudominio.com.br',
    address: 'Endereço da Empresa, Número - Bairro, Cidade - UF, 00000-000',
    logo_url: logoUrl,
    facebook_url: null,
    instagram_url: null,
    linkedin_url: null,
    youtube_url: null,
    twitter_url: null
  };

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'secondary.main', 
        color: 'white',
        pt: 6,
        pb: 4,
        mt: 'auto'
      }}
    >
      {/* Conteúdo principal do footer */}
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Coluna 1 - Informações da empresa */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              {/* Logo com fundo escuro - usar logo para fundo escuro */}
              <Box
                component="img"
                src={logoUrl}
                alt={companyInfo?.name || "Aluguel de Equipamentos"}
                sx={{
                  height: 127,
                  maxWidth: 510,
                  objectFit: 'contain',
                  mb: 2
                }}
              />
              
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                A NOME DA EMPRESA é uma empresa especializada com foco em seus produtos/serviços
                para seus clientes, com múltiplas unidades em diferentes locais.
              </Typography>
            </Box>
            
            <Stack spacing={2}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ opacity: 0.9 }}>
                Unidade 1:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationOn sx={{ mr: 1, fontSize: 20, color: 'secondary.light', mt: 0.5 }} />
                <Typography variant="body2">
                  {companyInfo?.address}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1, fontSize: 20, color: 'secondary.light' }} />
                <Typography variant="body2">
                  {companyInfo?.phone}
                </Typography>
              </Box>
              
              <Typography variant="subtitle2" fontWeight="bold" sx={{ opacity: 0.9, mt: 1 }}>
                Unidade 2:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationOn sx={{ mr: 1, fontSize: 20, color: 'secondary.light', mt: 0.5 }} />
                <Typography variant="body2">
                  {secondBranch?.address}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1, fontSize: 20, color: 'secondary.light' }} />
                <Typography variant="body2">
                  {secondBranch?.phone}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Email sx={{ mr: 1, fontSize: 20, color: 'secondary.light' }} />
                <Typography variant="body2">
                  {companyInfo?.email}
                </Typography>
              </Box>
            </Stack>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ opacity: 0.9 }}>
                Siga-nos nas redes sociais
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {companyInfo?.facebook_url && (
                  <IconButton 
                    size="small" 
                    component="a"
                    href={companyInfo.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                  >
                    <Facebook />
                  </IconButton>
                )}
                
                {companyInfo?.instagram_url && (
                  <IconButton 
                    size="small" 
                    component="a"
                    href={companyInfo.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                  >
                    <Instagram />
                  </IconButton>
                )}
                
                {companyInfo?.whatsapp && (
                  <IconButton 
                    size="small" 
                    component="a"
                    href={`https://wa.me/55${companyInfo.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                  >
                    <WhatsApp />
                  </IconButton>
                )}
                
                {companyInfo?.linkedin_url && (
                  <IconButton 
                    size="small" 
                    component="a"
                    href={companyInfo.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                  >
                    <LinkedIn />
                  </IconButton>
                )}
                
                {companyInfo?.youtube_url && (
                  <IconButton 
                    size="small" 
                    component="a"
                    href={companyInfo.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                  >
                    <YouTube />
                  </IconButton>
                )}
                
                {companyInfo?.twitter_url && (
                  <IconButton 
                    size="small" 
                    component="a"
                    href={companyInfo.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                  >
                    <Twitter />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Coluna 2 - Links rápidos e categorias */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              {/* Links rápidos */}
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Links Rápidos
                </Typography>
                <List dense disablePadding>
                  {quickLinks.map((link, index) => (
                    <ListItem 
                      key={index} 
                      disablePadding 
                      sx={{ py: 0.5 }}
                      component={Link}
                      to={link.path}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <ChevronRight sx={{ fontSize: 18, color: 'secondary.light' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              transition: 'all 0.2s',
                              '&:hover': { 
                                pl: 0.5,
                                color: 'secondary.light' 
                              }
                            }}
                          >
                            {link.text}
                          </Typography>
                        } 
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              {/* Categorias de equipamentos */}
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Categorias
                </Typography>
                {categories.length === 0 ? (
                  <Box sx={{ py: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? "Carregando..." : "Nenhuma categoria disponível"}
                    </Typography>
                  </Box>
                ) : (
                  <List dense disablePadding>
                    {equipmentCategories.map((category, index) => (
                      <ListItem 
                        key={index} 
                        disablePadding 
                        sx={{ py: 0.5 }}
                        component={Link}
                        to={category.path}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <ChevronRight sx={{ fontSize: 18, color: 'secondary.light' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                transition: 'all 0.2s',
                                '&:hover': { 
                                  pl: 0.5,
                                  color: 'secondary.light' 
                                }
                              }}
                            >
                              {category.text}
                            </Typography>
                          } 
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* Coluna 3 - Newsletter */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Receba Novidades
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              Cadastre-se para receber nossas ofertas e novidades
            </Typography>
            
            <Box component="form" onSubmit={handleSubscribe}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Seu email"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'secondary.light',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'error.light',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <Button
                      type="submit"
                      sx={{
                        minWidth: 'auto',
                        p: 0.5,
                        mr: -0.5,
                        color: 'white',
                      }}
                    >
                      <Send />
                    </Button>
                  ),
                }}
              />
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Horário de Atendimento
              </Typography>
              <BusinessHours variant="compact" color="white" iconColor="secondary.light" />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Separador */}
      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Copyright e infos legais */}
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ opacity: 0.7, textAlign: { xs: 'center', md: 'left' } }}>
              &copy; {new Date().getFullYear()} {companyInfo?.name || 'Aluguel de Equipamentos'}. Todos os direitos reservados.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, textAlign: { xs: 'center', md: 'left' }, mt: 1 }}>
              Desenvolvido por Open Dreams
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: { xs: 'center', md: 'flex-end' } 
              }}
            >
              <Typography 
                variant="body2" 
                component={Link} 
                to="/termos-de-uso"
                sx={{ 
                  opacity: 0.7, 
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': { 
                    opacity: 1,
                    textDecoration: 'underline' 
                  }
                }}
              >
                Termos de Uso
              </Typography>
              <Typography 
                variant="body2" 
                component={Link} 
                to="/politica-de-privacidade"
                sx={{ 
                  opacity: 0.7, 
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': { 
                    opacity: 1,
                    textDecoration: 'underline' 
                  }
                }}
              >
                Política de Privacidade
              </Typography>
              <Typography 
                variant="body2" 
                component={Link} 
                to="/mapa-do-site"
                sx={{ 
                  opacity: 0.7, 
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': { 
                    opacity: 1,
                    textDecoration: 'underline' 
                  }
                }}
              >
                Mapa do Site
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar para newsletter */}
      <Snackbar
        open={subscribeSuccess}
        autoHideDuration={5000}
        onClose={() => setSubscribeSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSubscribeSuccess(false)} 
          severity="success" 
          variant="filled"
        >
          Obrigado! Você foi inscrito em nossa newsletter.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Footer; 