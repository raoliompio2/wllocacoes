import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Switch,
  Collapse,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Container,
} from '@mui/material';
import { Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, ChevronRight, ChevronDown, Home, Settings, LogOut, User, Package, Calendar, Bell, Search, PenTool as Tool, Star, Wrench, Boxes, ClipboardList, MessageSquare, DollarSign, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useCustomTheme } from '../../theme/ThemeContext';
import { supabase } from '../../utils/supabaseClient';
import { getDashboardLogo } from '../../utils/colorUtils';

const drawerWidth = 240;
const collapsedDrawerWidth = 65;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: MenuItem[];
}

// Interface para o componente ResponsiveContainer
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  sx?: any;
  [key: string]: any;
}

// Componente responsivo para containers que respeitam o mobile-first
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Container
      maxWidth={false}
      disableGutters={isMobile}
      sx={{
        px: isMobile ? 2 : isTablet ? 3 : 4,
        py: isMobile ? 2 : 3,
        width: '100%',
        ...props.sx
      }}
      className={`responsive-container ${className}`}
      {...props}
    >
      {children}
    </Container>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mode, toggleColorMode, themePreferences } = useCustomTheme();
  const colors = mode === 'light' ? themePreferences.lightColors : themePreferences.darkColors;

  // Usar a logo específica para dashboard
  const dashboardLogos = getDashboardLogo();

  useEffect(() => {
    const getUserRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserRole(data.role);
        }
      }
    };

    getUserRole();
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        // Usando type assertion para contornar as limitações de tipagem
        const response = await (supabase as any)
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('read', false)
          .order('created_at', { ascending: false });
        
        const { data, error } = response;

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        setNotificationCount(data.length || 0);
      } catch (error) {
        console.error('Error in fetchNotifications:', error);
        setNotificationCount(0);
      }
    };

    fetchNotifications();

    // Adicionar listener para o evento customizado
    const handleNotificationsUpdated = () => {
      fetchNotifications();
    };

    // Registrar o listener para o evento
    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);

    // Configurar inscrição em tempo real para as notificações
    const notificationsSubscription = supabase
      .channel('dashboardNotifications')
      .on('postgres_changes', {
        event: '*', // Ouvir todos os eventos (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`,
      }, () => {
        // Recarregar contagem de notificações quando houver mudanças
        fetchNotifications();
      })
      .subscribe();

    // Limpar o listener e inscrição quando o componente for desmontado
    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
      notificationsSubscription.unsubscribe();
    };
  }, [user]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) setOpen(false);
    handleProfileMenuClose();
  };

  const handleExpandMenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const getMenuItems = (): MenuItem[] => {
    const commonItems: MenuItem[] = [
      { text: 'Home', icon: <Home />, path: '/dashboard' },
      { text: 'Buscar', icon: <Search />, path: '/search' },
    ];

    const ownerItems: MenuItem[] = [
      {
        text: 'Equipamentos',
        icon: <Package />,
        subItems: [
          { text: 'Gerenciar Equipamentos', icon: <Boxes />, path: '/equipment' },
          { text: 'Acessórios', icon: <Tool />, path: '/accessories' },
          { text: 'Manutenção', icon: <Wrench />, path: '/maintenance' },
        ]
      },
      {
        text: 'Locações',
        icon: <ClipboardList />,
        subItems: [
          { text: 'Reservas', icon: <Calendar />, path: '/bookings' },
          { text: 'Orçamentos', icon: <DollarSign />, path: '/owner-budgets' },
          { text: 'Avaliações', icon: <Star />, path: '/reviews' },
        ]
      },
      { text: 'Clientes', icon: <Users />, path: '/clients' },
      { text: 'Mensagens de Contato', icon: <MessageSquare />, path: '/contact-messages' },
    ];

    const clientItems: MenuItem[] = [
      { text: 'Minhas Reservas', icon: <Calendar />, path: '/bookings' },
      { text: 'Meus Orçamentos', icon: <DollarSign />, path: '/budget-requests' },
      { text: 'Minhas Avaliações', icon: <MessageSquare />, path: '/my-reviews' },
    ];

    return [
      ...commonItems,
      ...(userRole === 'proprietario' ? ownerItems : clientItems),
    ];
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    if (item.subItems) {
      return (
        <div key={item.text}>
          <ListItemButton
            onClick={() => handleExpandMenu(item.text)}
            sx={{
              pl: open ? depth * 3 + 2 : 2,
              py: 1.5,
              minHeight: 48,
              color: colors.menuText,
              justifyContent: open ? 'initial' : 'center',
              '&:hover': { 
                bgcolor: `${colors.primary}10`,
                '& .MuiListItemIcon-root': {
                  color: colors.primary,
                }
              },
            }}
            id={`menu-item-${item.text}`}
          >
            <ListItemIcon sx={{ 
              color: colors.menuText,
              minWidth: open ? 40 : 0,
              mr: open ? 'auto' : 'none',
              justifyContent: 'center',
            }}>
              {item.icon}
            </ListItemIcon>
            {open && (
              <>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: expandedMenu === item.text ? 600 : 400,
                  }}
                />
                {expandedMenu === item.text ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </>
            )}
          </ListItemButton>
          
          {!open && (
            <Menu
              anchorEl={document.getElementById(`menu-item-${item.text}`)}
              open={expandedMenu === item.text}
              onClose={() => setExpandedMenu(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              PaperProps={{
                sx: {
                  bgcolor: colors.surface,
                  color: colors.menuText,
                  minWidth: 200,
                  '& .MuiMenuItem-root': {
                    color: colors.menuText,
                    '&:hover': {
                      bgcolor: `${colors.primary}10`,
                      '& .MuiListItemIcon-root': {
                        color: colors.primary,
                      }
                    },
                    '& .MuiListItemIcon-root': {
                      color: colors.menuText,
                    }
                  }
                }
              }}
            >
              {item.subItems.map((subItem) => (
                <MenuItem
                  key={subItem.text}
                  onClick={() => {
                    if (subItem.path) {
                      handleMenuClick(subItem.path);
                      setExpandedMenu(null);
                    }
                  }}
                >
                  <ListItemIcon>
                    {subItem.icon}
                  </ListItemIcon>
                  <ListItemText primary={subItem.text} />
                </MenuItem>
              ))}
            </Menu>
          )}
          
          {open && (
            <Collapse in={expandedMenu === item.text}>
              {item.subItems.map((subItem) => renderMenuItem(subItem, depth + 1))}
            </Collapse>
          )}
        </div>
      );
    }

    return (
      <ListItemButton
        key={item.text}
        onClick={() => item.path && handleMenuClick(item.path)}
        sx={{
          pl: open ? depth * 3 + 2 : 2,
          py: 1.5,
          minHeight: 48,
          color: colors.menuText,
          justifyContent: open ? 'initial' : 'center',
          '&:hover': { 
            bgcolor: 'rgba(74, 50, 110, 0.1)',
            '& .MuiListItemIcon-root': {
              color: colors.primary,
            }
          },
          '&.Mui-selected': {
            bgcolor: 'rgba(74, 50, 110, 0.1)',
            borderRight: `3px solid ${colors.primary}`,
            '& .MuiListItemIcon-root': {
              color: colors.primary,
            },
            '&:hover': {
              bgcolor: 'rgba(74, 50, 110, 0.15)',
            }
          }
        }}
        selected={location.pathname === item.path}
        id={`menu-item-${item.text}`}
      >
        <ListItemIcon sx={{ 
          color: colors.menuText,
          minWidth: open ? 40 : 0,
          mr: open ? 'auto' : 'none',
          justifyContent: 'center',
        }}>
          {item.icon}
        </ListItemIcon>
        {open && (
          <ListItemText 
            primary={item.text}
            primaryTypographyProps={{
              fontSize: '0.95rem',
            }}
          />
        )}
      </ListItemButton>
    );
  };

  const drawer = (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: colors.surface,
      color: colors.menuText,
      overflowX: 'hidden',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      borderRight: '1px solid rgba(0,0,0,0.05)',
    }}>
      <Toolbar sx={{ 
        px: 2, 
        py: 2.1, // Reduzido em 30%
        minHeight: 45, // Reduzido em 30%
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {dashboardLogos ? (
          <Box 
            onClick={() => navigate('/')} 
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: 'rgba(74, 50, 110, 0.1)',
              }
            }}
          >
            <picture>
              <source srcSet={dashboardLogos.webp} type="image/webp" />
              <img 
                src={dashboardLogos.fallback} 
                alt="WL Locações - Dashboard"
                style={{ 
                  height: '60px',
                  maxWidth: open ? '200px' : '60px',
                  objectFit: 'contain',
                  // Logo normal, sem filtros
                }}
              />
            </picture>
          </Box>
        ) : (
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            {userRole === 'proprietario' ? 'Painel do Proprietário' : 'Painel do Cliente'}
          </Typography>
        )}
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Toolbar>
      
      <Divider sx={{ borderColor: `${colors.menuText}10` }} />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List component="nav" sx={{ px: 1 }}>
          {getMenuItems().map((item) => renderMenuItem(item))}
        </List>
      </Box>

      <Divider sx={{ borderColor: `${colors.menuText}10` }} />
      
      {open && (
        <Box sx={{ p: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'dark'}
                onChange={toggleColorMode}
                sx={{ 
                  '& .MuiSwitch-thumb': { bgcolor: colors.menuText },
                  '& .MuiSwitch-track': { bgcolor: `${colors.menuText}30` }
                }}
              />
            }
            label="Modo Escuro"
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedDrawerWidth}px)` },
          ml: { sm: `${open ? drawerWidth : collapsedDrawerWidth}px` },
          bgcolor: colors.surface,
          color: colors.menuText,
          borderBottom: `1px solid ${colors.menuText}10`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ py: 0.7 }}> {/* Reduzido em 30% */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              onClick={() => navigate('/notifications')}
            >
              <Badge badgeContent={notificationCount} color="error">
                <Bell />
              </Badge>
            </IconButton>

            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ 
                p: 0,
                '&:hover': {
                  bgcolor: `${colors.primary}10`,
                }
              }}
            >
              <Avatar 
                alt={user?.email || 'User'} 
                src="/path-to-avatar.jpg"
                sx={{ 
                  width: 35, 
                  height: 35,
                  bgcolor: colors.primary,
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            overflow: 'visible',
            bgcolor: colors.surface,
            color: colors.menuText,
            '& .MuiMenuItem-root': {
              color: colors.menuText,
              '&:hover': {
                bgcolor: `${colors.primary}10`,
                '& .MuiListItemIcon-root': {
                  color: colors.primary,
                }
              },
              '& .MuiListItemIcon-root': {
                color: colors.menuText,
              }
            },
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: colors.surface,
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={() => handleMenuClick('/profile')}>
          <ListItemIcon>
            <User size={18} />
          </ListItemIcon>
          Perfil
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('/settings')}>
          <ListItemIcon>
            <Settings size={18} />
          </ListItemIcon>
          Configurações
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogOut size={18} />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ 
          width: { sm: open ? drawerWidth : collapsedDrawerWidth },
          flexShrink: { sm: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={open}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                bgcolor: colors.surface,
                color: colors.menuText,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              width: open ? drawerWidth : collapsedDrawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: open ? drawerWidth : collapsedDrawerWidth,
                bgcolor: colors.surface,
                color: colors.menuText,
                borderRight: `1px solid ${colors.menuText}10`,
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                overflowX: 'hidden',
              },
            }}
            open={open}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedDrawerWidth}px)` },
          ml: { sm: 'auto' },
          mt: '64px',
          bgcolor: colors.background,
          minHeight: '100vh',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <ResponsiveContainer>
          {children}
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export { ResponsiveContainer };
export default DashboardLayout;