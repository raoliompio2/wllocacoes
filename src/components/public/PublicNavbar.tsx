import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InstagramFeed from './InstagramFeed';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Container,
  Divider,
  useScrollTrigger,
  Slide,
  useTheme as useMuiTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Grid
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon, Construction, Phone, Info, Person, Login, AccountCircle, Dashboard, Settings, Logout, Instagram } from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { useTheme } from '../../theme/ThemeContext';
import { getLogoByBackground, getHeaderFooterLogo } from '../../utils/colorUtils';

interface CompanyInfo {
  name: string;
  logo_url: string | { webp: string; fallback: string };
}

interface Props {
  children: React.ReactElement;
}

// Componente para esconder a navbar durante o scroll
function HideOnScroll(props: Props) {
  const { children } = props;
  // Modificando para que a Navbar seja sempre visível inicialmente
  // e só esconda durante scroll para baixo
  const trigger = useScrollTrigger({
    disableHysteresis: false,
    threshold: 100 // Só esconde após rolar 100px
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const PublicNavbar: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { themePreferences, mode } = useTheme();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [instagramDrawerOpen, setInstagramDrawerOpen] = useState(false);
  
  // Verificar se estamos na página inicial
  const isHomePage = location.pathname === '/';

  // Obtendo as cores do tema atual
  const colors = mode === 'light' ? themePreferences.lightColors : themePreferences.darkColors;

  // Logo da empresa com suporte a WebP (usar logo para fundo escuro já que o header é vermelho)
  const logoUrl = getLogoByBackground('#fe2d24');
  
  const companyInfoMemo = useMemo(() => {
    return {
      name: 'NOME DA EMPRESA',
      logo_url: logoUrl
    };
  }, [logoUrl]);

  // Avatar padrão caso o usuário não tenha um
  const defaultAvatar = 'https://yjdrejifhfdasaxivsew.supabase.co/storage/v1/object/public/avatars/default-avatar.png';



  // Função para determinar a saudação baseada no horário
  const getSaudacao = () => {
    const hora = new Date().getHours();
    
    if (hora >= 5 && hora < 12) {
      return 'Bom dia';
    } else if (hora >= 12 && hora < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };

  // Nome do usuário para exibição
  const getUserName = () => {
    if (!user) return '';
    
    // Usa o nome do perfil se disponível, senão usa a primeira parte do email
    return user.user_metadata?.name || user.email?.split('@')[0] || '';
  };

  // Buscar informações da empresa
  useEffect(() => {
    // Como a tabela company_info não existe no banco de dados, usamos a URL fixa
    setCompanyInfo(companyInfoMemo);
    setLoading(false);
  }, [companyInfoMemo]);

  // Toggle do drawer para mobile
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Verificar página atual para destacar o link ativo
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Funções para o menu do usuário
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      handleUserMenuClose();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  // Links da navbar
  const navLinks = [
    { text: 'Home', path: '/', icon: null },
    { text: 'Equipamentos', path: '/equipamentos', icon: <Construction fontSize="small" /> },
    { text: 'Sobre Nós', path: '/empresa', icon: <Info fontSize="small" /> },
    { text: 'Contato', path: '/contato', icon: <Phone fontSize="small" /> }
  ];

  // Drawer para mobile
  const drawer = (
    <Box
      sx={{ width: 250, bgcolor: '#ffffff' }}
      role="presentation"
      onClick={toggleDrawer}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Menu
        </Typography>
        <IconButton onClick={toggleDrawer} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List>
        {navLinks.map((link) => (
          <ListItem
            key={link.text}
            component={Link}
            to={link.path}
            sx={{
              color: isActive(link.path) 
                ? (isHomePage ? 'secondary.main' : 'primary.main') 
                : 'text.primary',
              bgcolor: isActive(link.path) ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {link.icon && (
              <Box component="span" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {link.icon}
              </Box>
            )}
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
        
        {/* Instagram Link no Menu Mobile */}
        <ListItem
          button
          onClick={() => {
            setDrawerOpen(false);
            setInstagramDrawerOpen(true);
          }}
          sx={{
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Box component="span" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            <Instagram sx={{ color: '#E1306C' }} />
          </Box>
          <ListItemText primary="Siga-nos no Instagram" />
        </ListItem>
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        {user ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1 }}>
              <Avatar 
                src={user.user_metadata?.avatar_url || defaultAvatar}
                alt={getUserName()}
                sx={{ mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle2">
                  {`${getSaudacao()}, ${getUserName()}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              fullWidth
              component={Link}
              to="/dashboard"
              color={isHomePage ? "secondary" : "primary"}
              startIcon={<Dashboard />}
              sx={{ fontWeight: 'medium', py: 1, mb: 1 }}
            >
              Dashboard
            </Button>
            <Button
              variant="outlined"
              fullWidth
              color={isHomePage ? "secondary" : "primary"}
              startIcon={<Logout />}
              onClick={handleSignOut}
              sx={{ fontWeight: 'medium', py: 1 }}
            >
              Sair
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="contained" 
              fullWidth 
              component={Link} 
              to="/login" 
              color={isHomePage ? "secondary" : "primary"}
              startIcon={<Login />}
              sx={{ fontWeight: 'medium', py: 1, mb: 1 }}
            >
              Entrar
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              component={Link} 
              to="/signup" 
              color="primary"
              startIcon={<Person />}
              sx={{ fontWeight: 'medium', py: 1 }}
            >
              Cadastrar
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  // Definindo um estilo global para garantir que o header seja visível
  useEffect(() => {
    // Este código garante que o AppBar será visível imediatamente
    const style = document.createElement('style');
    style.textContent = `
      .MuiAppBar-root {
        transform: none !important;
        visibility: visible !important;
        opacity: 1 !important;
        transition: all 0.3s ease !important;
      }
      
      @supports (backdrop-filter: blur(10px)) {
        .navbar-glassmorphism {
          backdrop-filter: blur(10px);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Renderiza a imagem do logo com suporte a WebP
  const renderLogo = () => {
    const logo = companyInfo?.logo_url;
    
    if (typeof logo === 'string') {
      return (
        <img 
          src={logo}
          alt={companyInfo?.name || "Logo da Empresa"}
          style={{
            height: '104px',
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      );
    } else if (logo && typeof logo === 'object') {
      return (
        <picture>
          <source srcSet={`${logo.webp} 300w`} type="image/webp" />
          <img 
            src={logo.fallback}
            alt={companyInfo?.name || "Logo da Empresa"}
            style={{
              height: '104px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </picture>
      );
    } else {
      return (
        <Typography variant="h6" fontWeight="bold">
          {companyInfo?.name || 'Aluguel de Equipamentos'}
        </Typography>
      );
    }
  };

  return (
    <>
      {/* Componente do Feed do Instagram */}
      <InstagramFeed
        open={instagramDrawerOpen}
        onClose={() => setInstagramDrawerOpen(false)}
        username="wllocacoes"
        widgetId="456cd860-6522-42de-81c3-ce3d892ec785"
      />
      
      <HideOnScroll>
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            background: 'linear-gradient(135deg, #fe2d24 0%, #4a326e 100%)',
            color: '#ffffff',
            borderBottomLeftRadius: themePreferences.borderRadius * 4,
            borderBottomRightRadius: themePreferences.borderRadius * 4,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            mb: isHomePage ? -1 : 0, // Margem bottom negativa para página inicial
            mt: 0,
            zIndex: 1090, // Reduzido para ficar melhor integrado com o hero
            overflow: 'visible',
            clipPath: 'inset(0px -40px -40px -40px)' // Isso impede que as bordas arredondadas criem espaços vazios
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', py: 0.7, pb: 1 }}>
              {/* Logo */}
              <Box 
                component={Link} 
                to="/"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  mr: 2
                }}
              >
                {renderLogo()}
              </Box>

              {/* Links de navegação para desktop */}
              {!isMobile && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  flexGrow: 1
                }}>
                  {navLinks.map((link) => (
                    <Button
                      key={link.text}
                      component={Link}
                      to={link.path}
                      color="inherit"
                      sx={{
                        mx: 2,
                        fontWeight: 'medium',
                        fontSize: '1.05rem',
                        borderBottom: isActive(link.path) ? 3 : 0,
                        borderColor: isActive(link.path) ? '#ffffff' : 'transparent',
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: '#ffffff'
                        },
                        color: isActive(link.path) 
                          ? '#ffffff'
                          : 'rgba(255,255,255,0.9)',
                        py: 1,
                      }}
                    >
                      {link.text}
                    </Button>
                  ))}
                  
                  {/* Botão do Instagram */}
                  <Button
                    color="inherit"
                    startIcon={<Instagram sx={{ color: '#E1306C' }} />}
                    onClick={() => setInstagramDrawerOpen(true)}
                    sx={{
                      mx: 2,
                      fontWeight: 'medium',
                      fontSize: '1.05rem',
                      borderRadius: 0,
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.05)',
                        color: '#E1306C'
                      },
                      py: 1,
                    }}
                  >
                    Siga-nos
                  </Button>
                </Box>
              )}

              {/* Botões de login e cadastro para desktop ou Avatar do usuário logado */}
              {!isMobile && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  alignItems: 'center',
                  flexShrink: 0
                }}>
                  {user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}
                      >
                        {`${getSaudacao()}, ${getUserName()}`}
                      </Typography>
                      <IconButton
                        onClick={handleUserMenuOpen}
                        size="small"
                        edge="end"
                        color="inherit"
                        aria-label="menu do usuário"
                        aria-controls="user-menu"
                        aria-haspopup="true"
                      >
                        <Avatar 
                          src={user.user_metadata?.avatar_url || defaultAvatar}
                          alt={getUserName()}
                          sx={{ width: 32, height: 32 }}
                        />
                      </IconButton>
                      <Menu
                        id="user-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <MenuItem component={Link} to="/dashboard" onClick={handleUserMenuClose}>
                          <Dashboard fontSize="small" sx={{ mr: 1 }} /> 
                          Dashboard
                        </MenuItem>
                        <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>
                          <Person fontSize="small" sx={{ mr: 1 }} /> 
                          Perfil
                        </MenuItem>
                        <MenuItem component={Link} to="/settings" onClick={handleUserMenuClose}>
                          <Settings fontSize="small" sx={{ mr: 1 }} /> 
                          Configurações
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleSignOut}>
                          <Logout fontSize="small" sx={{ mr: 1 }} /> 
                          Sair
                        </MenuItem>
                      </Menu>
                    </Box>
                  ) : (
                    <>
                      <Button 
                        variant="outlined" 
                        component={Link} 
                        to="/signup"
                        startIcon={<Person />}
                        sx={{ 
                          fontWeight: 'medium',
                          color: '#ffffff',
                          borderColor: '#ffffff',
                          '&:hover': {
                            borderColor: '#ffffff',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        Cadastrar
                      </Button>
                      <Button 
                        variant="contained" 
                        component={Link} 
                        to="/login" 
                        color="secondary"
                        startIcon={<Login />}
                        sx={{ fontWeight: 'medium' }}
                      >
                        Entrar
                      </Button>
                    </>
                  )}
                </Box>
              )}

              {/* Menu mobile */}
              {isMobile && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  visibility: 'visible' // Forçando visibilidade
                }}>
                  {user && (
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {`${getSaudacao()}, ${getUserName()}`}
                    </Typography>
                  )}
                  <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    onClick={toggleDrawer}
                    sx={{ visibility: 'visible' }} // Forçando visibilidade do botão
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Drawer para mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default PublicNavbar; 