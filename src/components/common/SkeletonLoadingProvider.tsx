import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import SkeletonLoader from './SkeletonLoader';

// Contexto para o Skeleton Loading
interface SkeletonLoadingContextProps {
  addLoading: (id: string) => void;
  removeLoading: (id: string) => void;
  isLoading: (id: string) => boolean;
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

const SkeletonLoadingContext = createContext<SkeletonLoadingContextProps>({
  addLoading: () => {},
  removeLoading: () => {},
  isLoading: () => false,
  globalLoading: false,
  setGlobalLoading: () => {},
});

// Props para o Provider
interface SkeletonLoadingProviderProps {
  children: ReactNode;
  defaultGlobalLoading?: boolean;
}

/**
 * Provider que gerencia os estados de carregamento para skeleton loading em toda a aplicação
 */
export const SkeletonLoadingProvider: React.FC<SkeletonLoadingProviderProps> = ({ 
  children, 
  defaultGlobalLoading = false 
}) => {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [globalLoading, setGlobalLoading] = useState<boolean>(defaultGlobalLoading);
  
  // Adiciona um componente à lista de componentes em carregamento
  const addLoading = useCallback((id: string) => {
    setLoadingIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, []);
  
  // Remove um componente da lista de componentes em carregamento
  const removeLoading = useCallback((id: string) => {
    setLoadingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);
  
  // Verifica se um componente específico está em carregamento
  const isLoading = useCallback((id: string) => {
    return loadingIds.has(id);
  }, [loadingIds]);
  
  const contextValue = {
    addLoading,
    removeLoading,
    isLoading,
    globalLoading,
    setGlobalLoading,
  };
  
  return (
    <SkeletonLoadingContext.Provider value={contextValue}>
      {children}
    </SkeletonLoadingContext.Provider>
  );
};

// Hook para usar o contexto do Skeleton Loading
export const useSkeletonLoadingContext = () => useContext(SkeletonLoadingContext);

// Exporta o componente SkeletonLoader
export { SkeletonLoader };

// Exporta um componente condicional para facilitar o uso
interface ConditionalSkeletonProps {
  loading: boolean;
  children: ReactNode;
  type?: 'cards' | 'list' | 'details' | 'form' | 'table';
  count?: number;
  skeletonProps?: Record<string, any>;
}

export const ConditionalSkeleton: React.FC<ConditionalSkeletonProps> = ({
  loading,
  children,
  type = 'cards',
  count = 6,
  skeletonProps = {},
}) => {
  return loading ? (
    <SkeletonLoader type={type} count={count} {...skeletonProps} />
  ) : (
    <>{children}</>
  );
};

// Função de utilidade para criar um ID de carregamento único
export const createLoadingId = (prefix: string = 'loading') => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}; 