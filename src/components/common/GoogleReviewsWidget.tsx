import React, { useEffect } from 'react';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';

interface GoogleReviewsWidgetProps {
  title?: string;
  subtitle?: string;
  widgetId: string;
  minHeight?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  showHeader?: boolean;
}

/**
 * Componente reutilizável para exibir o widget de avaliações do Google
 * 
 * @param {string} widgetId - ID do widget Elfsight 
 * @param {string} title - Título opcional acima do widget
 * @param {string} subtitle - Subtítulo opcional acima do widget
 * @param {number|object} minHeight - Altura mínima do widget (pode ser responsivo)
 * @param {boolean} showHeader - Se deve mostrar o cabeçalho com título e subtítulo
 */
const GoogleReviewsWidget: React.FC<GoogleReviewsWidgetProps> = ({
  widgetId,
  title = 'O Que Nossos Clientes Dizem',
  subtitle = 'Confira as avaliações dos nossos clientes no Google',
  minHeight = { xs: 400, md: 500 },
  showHeader = true
}) => {
  const theme = useTheme();
  
  // Recria o script quando o componente é montado para garantir que o widget seja inicializado
  useEffect(() => {
    // Verifica se o script já existe
    const existingScript = document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://static.elfsight.com/platform/platform.js';
      script.async = true;
      document.head.appendChild(script);
      
      return () => {
        // Não é necessário remover o script global ao desmontar o componente
      };
    }
  }, []);
  
  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      {showHeader && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      )}
      
      <Paper elevation={1} sx={{ 
        borderRadius: theme.shape.borderRadius, 
        p: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.7)
      }}>
        <Box
          sx={{
            '& iframe': { width: '100%' },
            minHeight: minHeight
          }}
          className={`elfsight-app-${widgetId}`}
          data-elfsight-app-lazy
        />
      </Paper>
    </Box>
  );
};

export default GoogleReviewsWidget; 