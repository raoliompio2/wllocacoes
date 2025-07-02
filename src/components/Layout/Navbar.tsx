import React, { useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut, User, Home, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { getLogoByBackground } from '../../utils/colorUtils';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  // Usar o tema do proprietário
  const { themePreferences, mode } = useTheme();
  const colors = mode === 'light' ? themePreferences.lightColors : themePreferences.darkColors;

  // Manter o navbar com fundo branco fixo, independente do tema ou navegação
  const navbarStyle = {
    backgroundColor: '#ffffff', // Sempre branco
    color: '#1a1a1a',  // Cor do texto escura para contrastar com o fundo branco
    borderBottom: `1px solid ${colors.primary}20`
  };

  // Determinar qual logo usar - como o fundo agora é sempre branco, usamos o logo para fundo claro
  const companyLogo = getLogoByBackground('#ffffff');

  const primaryButtonStyle = {
    backgroundColor: colors.primary,
    color: '#ffffff',
    borderRadius: `${themePreferences.borderRadius}px`
  };

  const primaryTextStyle = {
    color: colors.primary
  };

  const activeBorderStyle = {
    borderColor: colors.primary
  };

  const hoverBgStyle = {
    backgroundColor: `${colors.primary}10`
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Foto padrão para avatar caso o usuário não tenha uma
  const defaultAvatar = 'https://yjdrejifhfdasaxivsew.supabase.co/storage/v1/object/public/avatars/default-avatar.png';

  // Renderiza a imagem do logo com suporte a WebP
  const renderLogo = () => {
    if (typeof companyLogo === 'string') {
      return (
        <img 
          src={companyLogo} 
          alt="Company Logo"
          style={{ 
            height: '91px',  // aumentado em mais 30% (de 70px para 91px)
            maxWidth: '364px',  // aumentado em mais 30% (de 280px para 364px)
            objectFit: 'contain'
          }}
        />
      );
    } else if (companyLogo && typeof companyLogo === 'object') {
      return (
        <picture>
          <source srcSet={companyLogo.webp} type="image/webp" />
          <img 
            src={companyLogo.fallback} 
            alt="Company Logo"
            style={{ 
              height: '91px',  // aumentado em mais 30% (de 70px para 91px)
              maxWidth: '364px',  // aumentado em mais 30% (de 280px para 364px)
              objectFit: 'contain'
            }}
          />
        </picture>
      );
    }
  };

  return (
    <nav style={navbarStyle} className="shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-11"> {/* Reduzido em 30% (de h-16 para h-11) */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold flex items-center">
                {renderLogo()}
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                style={isActive('/') ? {...primaryTextStyle, ...activeBorderStyle} : {}}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-current text-current' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Home
              </Link>
              
              {user && (
                <Link
                  to="/dashboard"
                  style={isActive('/dashboard') ? {...primaryTextStyle, ...activeBorderStyle} : {}}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard') 
                      ? 'border-current text-current' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          
          {/* Desktop user menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-2 relative">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={toggleUserMenu}
                >
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-medium">Olá, {user.email?.split('@')[0]}</span>
                  </div>
                  <img 
                    src={user.user_metadata?.avatar_url || defaultAvatar} 
                    alt="Avatar do usuário" 
                    className="h-8 w-8 rounded-full object-cover border border-gray-300"
                  />
                  <ChevronDown className="h-4 w-4 ml-1" />
                </div>
                
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 top-10 w-48 py-1 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                  >
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Perfil
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left border-t border-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  style={primaryTextStyle}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md hover:bg-opacity-10"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  style={primaryButtonStyle}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            {user && (
              <div className="mr-2">
                <img 
                  src={user.user_metadata?.avatar_url || defaultAvatar} 
                  alt="Avatar do usuário" 
                  className="h-8 w-8 rounded-full object-cover border border-gray-300"
                />
              </div>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Home
            </Link>
            
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/dashboard')
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200 bg-white">
            {user ? (
              <div className="space-y-1">
                <div className="px-4 py-3">
                  <p className="text-base font-medium text-gray-800">Olá, {user.email?.split('@')[0]}</p>
                  <p className="text-sm font-medium text-gray-500">{user.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  <User className="h-5 w-5 mr-2" />
                  Perfil
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Configurações
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sair
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;