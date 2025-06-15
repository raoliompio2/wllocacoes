import { useState, useCallback } from 'react';

interface UseSkeletonLoadingOptions {
  initialLoading?: boolean;
  delay?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

/**
 * Hook para gerenciar estados de carregamento com skeleton loading
 * 
 * @param options Opções para o hook
 * @returns Objeto com funções e estados para controlar o loading
 */
const useSkeletonLoading = (options: UseSkeletonLoadingOptions = {}) => {
  const { 
    initialLoading = false, 
    delay = 300,
    onLoadStart,
    onLoadEnd
  } = options;
  
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<Error | null>(null);
  
  // Função para iniciar o carregamento
  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
    if (onLoadStart) onLoadStart();
  }, [onLoadStart]);
  
  // Função para encerrar o carregamento
  const stopLoading = useCallback(() => {
    setTimeout(() => {
      setLoading(false);
      if (onLoadEnd) onLoadEnd();
    }, delay);
  }, [delay, onLoadEnd]);
  
  // Função para definir um erro
  const setLoadingError = useCallback((error: Error) => {
    setError(error);
    stopLoading();
  }, [stopLoading]);
  
  // Função para executar uma ação assíncrona com loading
  const executeWithLoading = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    options: { showLoadingDelay?: number } = {}
  ): Promise<T | null> => {
    let showLoadingTimeout: NodeJS.Timeout | null = null;
    
    // Definir um atraso mínimo para mostrar o skeleton loading
    // Isso evita flashes de skeleton para chamadas muito rápidas
    if (options.showLoadingDelay) {
      showLoadingTimeout = setTimeout(() => {
        startLoading();
      }, options.showLoadingDelay);
    } else {
      startLoading();
    }
    
    try {
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setLoadingError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      if (showLoadingTimeout) {
        clearTimeout(showLoadingTimeout);
      }
      stopLoading();
    }
  }, [startLoading, stopLoading, setLoadingError]);
  
  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    executeWithLoading
  };
};

export default useSkeletonLoading; 