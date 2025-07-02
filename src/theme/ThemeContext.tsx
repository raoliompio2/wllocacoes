import React, { createContext, useState, useEffect, useContext } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

// Chaves para o localStorage
const THEME_CACHE_KEY = 'bolt_theme_preferences';
const THEME_CACHE_TIMESTAMP_KEY = 'bolt_theme_last_updated';
// Tempo de validade do cache em minutos (24 horas)
const CACHE_VALIDITY_MINUTES = 24 * 60;

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  menuText: string;
}

interface ThemePreferences {
  mode: PaletteMode;
  lightColors: ThemeColors;
  darkColors: ThemeColors;
  fontFamily: string;
  borderRadius: number;
  spacing: number;
}

interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
  themePreferences: ThemePreferences;
  updateThemePreferences: (preferences: Partial<ThemePreferences>) => void;
  isOwner: boolean;
}

const defaultLightColors: ThemeColors = {
  primary: '#171717',
  secondary: '#fe6700',
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#1a1a1a',
  menuText: '#1a1a1a'
};

const defaultDarkColors: ThemeColors = {
  primary: '#171717',
  secondary: '#fe6700',
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  menuText: '#ffffff'
};

const defaultThemePreferences: ThemePreferences = {
  mode: 'light',
  lightColors: defaultLightColors,
  darkColors: defaultDarkColors,
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: 8,
  spacing: 8,
};

// ID do proprietário fixo já que só teremos um
const OWNER_ID = 'e45fa350-6f9d-45b5-a74c-a2424cd64f48';

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
  themePreferences: defaultThemePreferences,
  updateThemePreferences: () => {},
  isOwner: false,
});

// Funções utilitárias para o cache
const saveThemeToCache = (themePreferences: ThemePreferences) => {
  try {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(themePreferences));
    localStorage.setItem(THEME_CACHE_TIMESTAMP_KEY, Date.now().toString());
    console.log('Tema salvo no cache');
  } catch (error) {
    console.error('Erro ao salvar o tema no cache:', error);
  }
};

const getThemeFromCache = (): { theme: ThemePreferences | null, isValid: boolean } => {
  try {
    const cachedTheme = localStorage.getItem(THEME_CACHE_KEY);
    const timestamp = localStorage.getItem(THEME_CACHE_TIMESTAMP_KEY);
    
    if (!cachedTheme || !timestamp) return { theme: null, isValid: false };
    
    // Verificar se o cache ainda é válido
    const lastUpdated = parseInt(timestamp);
    const now = Date.now();
    const diffMinutes = (now - lastUpdated) / (1000 * 60);
    const isValid = diffMinutes < CACHE_VALIDITY_MINUTES;
    
    return { 
      theme: JSON.parse(cachedTheme) as ThemePreferences, 
      isValid 
    };
  } catch (error) {
    console.error('Erro ao ler o tema do cache:', error);
    return { theme: null, isValid: false };
  }
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Verificar o cache imediatamente para o valor inicial
  const { theme: cachedTheme } = getThemeFromCache();
  const initialTheme = cachedTheme || defaultThemePreferences;
  
  const [themePreferences, setThemePreferences] = useState<ThemePreferences>(initialTheme);
  const [isLoading, setIsLoading] = useState(!cachedTheme); // Rastreia se estamos carregando o tema pela primeira vez
  
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  // Verificar se o usuário é proprietário
  useEffect(() => {
    const checkIfUserIsOwner = async () => {
      if (!user) {
        setIsOwner(false);
        return;
      }

      try {
        // Verificar se é o ID específico
        if (user.id === OWNER_ID) {
          setIsOwner(true);
          return;
        }

        // Verificar a role do usuário
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar role do usuário:', error);
          setIsOwner(false);
          return;
        }

        // Verificar se a role é proprietário ou variações
        setIsOwner(
          data?.role === 'proprietario' || 
          data?.role === 'owner' || 
          data?.role === 'admin' || 
          data?.role === 'dono'
        );
      } catch (error) {
        console.error('Erro ao verificar se o usuário é proprietário:', error);
        setIsOwner(false);
      }
    };

    checkIfUserIsOwner();
  }, [user]);

  // Carregar o tema do banco de dados
  useEffect(() => {
    const initializeTheme = async () => {
      const { theme: cachedTheme, isValid } = getThemeFromCache();
      
      // Se temos um cache válido, podemos pular a requisição imediata
      if (cachedTheme && isValid && !isLoading) {
        console.log('Usando tema em cache válido');
        return;
      }
      
      try {
        await loadOwnerThemePreferences();
        setIsLoading(false);
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying theme preferences load (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, RETRY_DELAY);
        } else {
          console.error('Failed to load theme preferences after maximum retries. Using cached or default theme.');
          setIsLoading(false);
        }
      }
    };

    initializeTheme();
  }, [retryCount]);

  const loadOwnerThemePreferences = async () => {
    try {
      // Proceed with loading theme preferences
      const { data, error } = await supabase
        .from('profiles')
        .select('theme_preferences')
        .eq('id', OWNER_ID)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to load theme preferences: ${error.message}`);
      }

      if (data?.theme_preferences) {
        const newThemePreferences = {
          ...defaultThemePreferences,
          ...data.theme_preferences,
        } as ThemePreferences;
        
        setThemePreferences(newThemePreferences);
        
        // Salvar o tema no cache
        saveThemeToCache(newThemePreferences);
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      throw error; // Re-throw to trigger retry mechanism
    }
  };

  useEffect(() => {
    const colors = themePreferences.mode === 'light' 
      ? themePreferences.lightColors 
      : themePreferences.darkColors;

    document.documentElement.style.setProperty('--color-primary', colors.primary);
    document.documentElement.style.setProperty('--color-secondary', colors.secondary);
    document.documentElement.style.setProperty('--color-background', colors.background);
    document.documentElement.style.setProperty('--color-surface', colors.surface);
    document.documentElement.style.setProperty('--color-text', colors.text);
    document.documentElement.style.setProperty('--color-menu-text', colors.menuText);
    
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text;
    
    if (themePreferences.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themePreferences]);

  const theme = React.useMemo(() => {
    const colors = themePreferences.mode === 'light' 
      ? themePreferences.lightColors 
      : themePreferences.darkColors;

    return createTheme({
      palette: {
        mode: themePreferences.mode,
        primary: {
          main: colors.primary,
          contrastText: '#ffffff',
        },
        secondary: {
          main: colors.secondary,
          contrastText: '#ffffff',
        },
        background: {
          default: colors.background,
          paper: colors.surface,
        },
        text: {
          primary: colors.text,
          secondary: colors.text === '#ffffff' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        },
      },
      typography: {
        fontFamily: themePreferences.fontFamily,
      },
      shape: {
        borderRadius: themePreferences.borderRadius,
      },
      spacing: themePreferences.spacing,
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: themePreferences.borderRadius,
              textTransform: 'none',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: colors.surface,
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: colors.surface,
              color: colors.menuText,
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: colors.surface,
              color: colors.menuText,
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              color: colors.menuText,
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: themePreferences.mode === 'light' 
                  ? 'rgba(0, 0, 0, 0.04)' 
                  : 'rgba(255, 255, 255, 0.08)',
              },
            },
          },
        },
      },
    });
  }, [themePreferences]);

  const toggleColorMode = async () => {
    if (!isOwner) return;

    const newMode = themePreferences.mode === 'light' ? 'dark' : 'light';
    const newPreferences = { ...themePreferences, mode: newMode } as ThemePreferences;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          theme_preferences: newPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', OWNER_ID);

      if (error) throw error;
      setThemePreferences(newPreferences);
      
      // Atualizar o cache
      saveThemeToCache(newPreferences);
    } catch (error) {
      console.error('Error updating theme preferences:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
    }
  };

  const updateThemePreferences = async (preferences: Partial<ThemePreferences>) => {
    if (!isOwner) return;

    const newPreferences = { ...themePreferences, ...preferences } as ThemePreferences;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          theme_preferences: newPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', OWNER_ID);

      if (error) throw error;
      setThemePreferences(newPreferences);
      
      // Atualizar o cache
      saveThemeToCache(newPreferences);
    } catch (error) {
      console.error('Error updating theme preferences:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
    }
  };

  // Exibir um indicador de carregamento apenas no primeiro acesso quando não temos cache
  if (isLoading && !cachedTheme) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: defaultThemePreferences.mode === 'light' 
          ? defaultLightColors.background 
          : defaultDarkColors.background,
        color: defaultThemePreferences.mode === 'light'
          ? defaultLightColors.text
          : defaultDarkColors.text
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid rgba(0,0,0,0.1)', 
          borderTop: `3px solid ${defaultThemePreferences.mode === 'light' ? defaultLightColors.primary : defaultDarkColors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        mode: themePreferences.mode,
        toggleColorMode,
        themePreferences,
        updateThemePreferences,
        isOwner,
      }}
    >
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};