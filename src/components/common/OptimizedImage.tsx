import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface OptimizedImageProps extends BoxProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  lazy?: boolean;
  priority?: boolean;
}

/**
 * Componente de imagem otimizado que aplica as melhores práticas
 * para performance, incluindo dimensões explícitas e carregamento diferido
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  lazy = true,
  priority = false,
  sx,
  ...props
}) => {
  // Processa o caminho da imagem
  const imagePath = src;
  
  // Define o comportamento de carregamento
  const loadingStrategy = priority ? 'eager' : lazy ? 'lazy' : 'eager';
  
  return (
    <Box
      component="img"
      src={imagePath}
      alt={alt}
      width={width}
      height={height}
      loading={loadingStrategy}
      fetchpriority={priority ? "high" : "auto"}
      sx={{
        display: 'block',
        objectFit: 'contain',
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
        ...sx
      }}
      {...props}
    />
  );
};

export default OptimizedImage; 