import React from 'react';
import SkeletonLoader from './SkeletonLoader';

// Define o tipo do HOC
interface WithSkeletonLoadingProps {
  loading?: boolean;
  skeletonType?: 'cards' | 'list' | 'details' | 'form' | 'table' | 'accessory' | 'review' | 'notification' | 'booking' | 'client' | 'budget';
  count?: number;
  skeletonProps?: Record<string, any>;
}

/**
 * Higher-Order Component que implementa o carregamento com esqueleto (skeleton loading)
 * para qualquer componente.
 * 
 * @param WrappedComponent O componente que será envolvido pelo skeleton loading
 * @param defaultOptions Opções padrão para o skeleton loading
 * @returns Um novo componente com skeleton loading implementado
 */
const withSkeletonLoading = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultOptions: {
    type?: 'cards' | 'list' | 'details' | 'form' | 'table' | 'accessory' | 'review' | 'notification' | 'booking' | 'client' | 'budget';
    count?: number;
    skeletonProps?: Record<string, any>;
  } = {}
) => {
  // O componente retornado pelo HOC
  const WithSkeleton: React.FC<P & WithSkeletonLoadingProps> = ({
    loading = false,
    skeletonType,
    count,
    skeletonProps = {},
    ...props
  }) => {
    // Se estiver carregando, mostra o skeleton
    if (loading) {
      return (
        <SkeletonLoader
          type={skeletonType || defaultOptions.type || 'cards'}
          count={count || defaultOptions.count || 6}
          {...defaultOptions.skeletonProps}
          {...skeletonProps}
        />
      );
    }

    // Caso contrário, renderiza o componente original
    return <WrappedComponent {...props as P} />;
  };

  // Define o displayName para facilitar a depuração
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithSkeleton.displayName = `WithSkeletonLoading(${displayName})`;

  return WithSkeleton;
};

export default withSkeletonLoading; 