import React, { useState, useEffect, useRef } from 'react';
import { Box, BoxProps, Skeleton } from '@mui/material';

interface ResponsiveImageProps extends BoxProps {
  src: string;
  alt: string;
  width: number | string;
  height: number | string;
  lazy?: boolean;
  priority?: boolean;
  sizes?: string;
}

/**
 * Componente de imagem responsiva que usa os múltiplos formatos e tamanhos
 * gerados pelo script de otimização de imagens
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  lazy = true,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  sx,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageManifest, setImageManifest] = useState<any>(null);
  const [error, setError] = useState(false);
  const primaryImgRef = useRef<HTMLImageElement>(null);
  const fallbackImgRef = useRef<HTMLImageElement>(null);
  
  // Formato do nome da imagem sem extensão
  const getImageBaseName = (path: string) => {
    const fileName = path.split('/').pop() || '';
    return fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  };
  
  // Diretório da imagem
  const getImageDir = (path: string) => {
    return path.substring(0, path.lastIndexOf('/') + 1) || '';
  };
  
  const imageName = getImageBaseName(src);
  const imageDir = getImageDir(src);
  
  // Aplica fetchpriority via DOM API
  useEffect(() => {
    // Aplicar no ref primário
    if (primaryImgRef.current) {
      if (priority) {
        primaryImgRef.current.setAttribute('fetchpriority', 'high');
      } else {
        primaryImgRef.current.setAttribute('fetchpriority', 'auto');
      }
    }
    
    // Aplicar no ref de fallback
    if (fallbackImgRef.current) {
      if (priority) {
        fallbackImgRef.current.setAttribute('fetchpriority', 'high');
      } else {
        fallbackImgRef.current.setAttribute('fetchpriority', 'auto');
      }
    }
  }, [priority]);
  
  useEffect(() => {
    const loadImageManifest = async () => {
      try {
        // Tentar carregar o manifesto específico desta imagem
        const manifestPath = `/images_optimized/${imageDir}${imageName}.json`;
        const response = await fetch(manifestPath);
        
        if (response.ok) {
          try {
            const data = await response.json();
            setImageManifest(data);
          } catch (jsonError) {
            console.error('Erro ao carregar manifesto da imagem:', jsonError);
            setError(true);
          }
        } else {
          throw new Error(`Manifesto não encontrado: status ${response.status}`);
        }
      } catch (err) {
        // Se falhar, usar a imagem original
        console.error('Erro ao carregar manifesto da imagem:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadImageManifest();
  }, [src, imageName, imageDir]);
  
  // Define o comportamento de carregamento
  const loadingStrategy = priority ? 'eager' : lazy ? 'lazy' : 'eager';
  
  // Converte dimensões para valores CSS
  const widthPx = typeof width === 'number' ? `${width}px` : width;
  const heightPx = typeof height === 'number' ? `${height}px` : height;
  
  // Calcula a proporção para evitar layout shifts
  const aspectRatio = 
    typeof width === 'number' && typeof height === 'number' 
      ? width / height
      : undefined;
  
  // Gera o conjunto de srcset para cada formato
  const generateSrcSet = (format: string) => {
    if (!imageManifest || !imageManifest.variants) return '';
    
    return imageManifest.variants
      .filter((variant: any) => variant.format === format)
      .map((variant: any) => 
        `/images_optimized/${imageDir}${variant.file} ${variant.width}w`
      )
      .join(', ');
  };
  
  // Gera as imagens alternativas para quando o navegador não suporta webp ou avif
  const getImageSources = () => {
    if (!imageManifest) return null;
    
    return (
      <>
        {/* AVIF - formato mais eficiente mas com menor suporte */}
        <source
          type="image/avif"
          srcSet={generateSrcSet('avif')}
          sizes={sizes}
        />
        {/* WebP - bom suporte e boa compressão */}
        <source
          type="image/webp"
          srcSet={generateSrcSet('webp')}
          sizes={sizes}
        />
        {/* Imagem de fallback com caminho original */}
        <img
          ref={primaryImgRef}
          src={src}
          alt={alt}
          loading={loadingStrategy}
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onLoad={() => setIsLoading(false)}
        />
      </>
    );
  };
  
  // Verifica se o placeholder existe antes de tentar usá-lo
  const shouldUseplaceholder = 
    imageManifest && 
    !error && 
    typeof imageManifest.original === 'object';
  
  const placeholderSrc = shouldUseplaceholder 
    ? `/images_optimized/${imageDir}${imageName}_placeholder.webp` 
    : undefined;
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: widthPx,
        height: heightPx,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        ...sx
      }}
      {...props}
    >
      {/* Mostrar placeholder enquanto a imagem principal carrega */}
      {isLoading && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Mostrar skeleton ao carregar se não houver placeholder */}
      {isLoading && !placeholderSrc && (
        <Skeleton 
          variant="rectangular"
          animation="wave"
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        />
      )}
      
      {/* Imagem principal com picture para múltiplos formatos */}
      <picture style={{ 
        opacity: isLoading ? 0 : 1,
        transition: 'opacity 0.3s ease',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}>
        {!error && imageManifest && getImageSources()}
        
        {/* Fallback quando não há manifest ou houve erro */}
        {(error || !imageManifest) && (
          <img
            ref={fallbackImgRef}
            src={src}
            alt={alt}
            loading={loadingStrategy}
            width={typeof width === 'number' ? width : undefined}
            height={typeof height === 'number' ? height : undefined}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onLoad={() => setIsLoading(false)}
          />
        )}
      </picture>
    </Box>
  );
};

export default ResponsiveImage; 