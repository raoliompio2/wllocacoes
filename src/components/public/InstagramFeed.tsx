import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Instagram } from '@mui/icons-material';
import { useTheme } from '../../theme/ThemeContext';

interface InstagramFeedProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

/**
 * Componente que exibe o feed do Instagram em uma gaveta lateral
 * Usa o widget do Elfsight exatamente como fornecido
 */
const InstagramFeed: React.FC<InstagramFeedProps> = ({
  open,
  onClose,
  username
}) => {
  const { themePreferences } = useTheme();
  const [loading, setLoading] = useState(true);

  // Carrega o script do Elfsight e controla o estado de carregamento
  useEffect(() => {
    if (open) {
      // Verifica se o script já existe
      if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://static.elfsight.com/platform/platform.js';
        script.async = true;
        document.head.appendChild(script);
      }
      
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(true);
    }
  }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 370 },
          maxWidth: '100%',
          borderTopLeftRadius: themePreferences.borderRadius,
          borderBottomLeftRadius: themePreferences.borderRadius,
          bgcolor: 'background.paper'
        }
      }}
    >
      {/* Cabeçalho */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        width: '100%',
        maxWidth: '370px',
        mx: 'auto'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Instagram sx={{ color: '#E1306C', mr: 1 }} />
          <Typography variant="h6" fontWeight="medium">
            @{username}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Conteúdo */}
      <Box sx={{ 
        p: 0, 
        height: 'calc(100% - 64px)', 
        overflow: 'auto'
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            p: 4
          }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Carregando feed do Instagram...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            height: '100%', 
            width: '100%', 
            display: 'flex',
            justifyContent: 'center'
          }}>
            {/* Widget do Elfsight Instagram Feed - Exatamente como fornecido */}
            <div 
              className="elfsight-app-554885df-4999-4e82-b39d-68999e3432dc" 
              data-elfsight-app-lazy
              style={{ width: '100%', maxWidth: '370px' }}
            ></div>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default InstagramFeed; 