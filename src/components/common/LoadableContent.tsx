import React, { ReactNode } from 'react';
import { Box, Typography, Alert, AlertTitle } from '@mui/material';
import { ConditionalSkeleton } from './SkeletonLoadingProvider';

interface LoadableContentProps {
  loading: boolean;
  error?: Error | null;
  children: ReactNode;
  skeletonType?: 'cards' | 'list' | 'details' | 'form' | 'table';
  count?: number;
  emptyMessage?: string;
  isEmpty?: boolean;
  skeletonProps?: Record<string, any>;
  noDataComponent?: ReactNode;
}

/**
 * Componente que mostra um skeleton loading durante o carregamento,
 * uma mensagem de erro em caso de falha ou o conteúdo quando estiver carregado
 */
const LoadableContent: React.FC<LoadableContentProps> = ({
  loading,
  error,
  children,
  skeletonType = 'cards',
  count = 6,
  emptyMessage = "Nenhum item encontrado",
  isEmpty = false,
  skeletonProps = {},
  noDataComponent,
}) => {
  // Se estiver carregando, mostra o skeleton
  if (loading) {
    return (
      <ConditionalSkeleton 
        loading={true} 
        type={skeletonType} 
        count={count}
        skeletonProps={skeletonProps}
      >
        {null}
      </ConditionalSkeleton>
    );
  }

  // Se tiver erro, mostra a mensagem de erro
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        {error.message || 'Ocorreu um erro inesperado. Tente novamente mais tarde.'}
      </Alert>
    );
  }

  // Se não tiver dados, mostra a mensagem de "sem dados"
  if (isEmpty) {
    if (noDataComponent) {
      return <>{noDataComponent}</>;
    }
    
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  // Se estiver tudo ok, mostra o conteúdo
  return <>{children}</>;
};

export default LoadableContent; 