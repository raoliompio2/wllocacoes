import React from 'react';
import { Card, CardContent, CardHeader, CardMedia, CardActions, Typography, useTheme, useMediaQuery, Box } from '@mui/material';

interface ResponsiveCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  image?: string;
  imageHeight?: number | string;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  headerAction?: React.ReactNode;
  elevation?: number;
  variant?: 'outlined' | 'elevation';
  noPadding?: boolean;
  sx?: any;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  title,
  subtitle,
  children,
  image,
  imageHeight,
  actions,
  onClick,
  className = '',
  headerAction,
  elevation = 1,
  variant = 'elevation',
  noPadding = false,
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Altura da imagem adaptada para diferentes telas
  const adaptedImageHeight = imageHeight || (isMobile ? 160 : 200);
  
  // Estilo para o card
  const cardStyle = {
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    '&:hover': onClick ? {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[elevation + 2]
    } : {},
    ...sx
  };

  return (
    <Card 
      variant={variant}
      elevation={elevation}
      className={`responsive-card ${className}`}
      onClick={onClick}
      sx={cardStyle}
    >
      {image && (
        <CardMedia
          component="img"
          height={adaptedImageHeight}
          image={image}
          alt={typeof title === 'string' ? title : 'Card image'}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      {title && (
        <CardHeader
          title={
            <Typography 
              variant={isMobile ? 'subtitle1' : 'h6'} 
              sx={{ fontWeight: 600 }}
            >
              {title}
            </Typography>
          }
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          action={headerAction}
          sx={{ 
            p: isMobile ? 2 : 3,
            pb: children && !noPadding ? 0 : (isMobile ? 2 : 3)
          }}
        />
      )}
      
      {children && (
        <CardContent sx={{ p: noPadding ? 0 : (isMobile ? 2 : 3), pt: title && !noPadding ? 1 : (isMobile ? 2 : 3) }}>
          {children}
        </CardContent>
      )}
      
      {actions && (
        <CardActions 
          sx={{ 
            p: isMobile ? 1.5 : 2, 
            pt: (children || title) && !noPadding ? 0 : (isMobile ? 1.5 : 2) 
          }}
        >
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

export default ResponsiveCard; 