import React, { useEffect } from 'react';

/**
 * Componente que substitui elementos de loading padrão específicos
 * para elementos que não possuem skeletons dedicados
 */
const LoadingReplacement: React.FC = () => {
  useEffect(() => {
    // Adicionar estilos globais para substituir loadings específicos
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Estilos para loading genéricos que NÃO estão nas páginas principais */
      .loading-container:empty::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
      }
    `;
    
    document.head.appendChild(styleEl);
    
    // Limpar quando o componente for desmontado
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  return null; // Este componente não renderiza nada visualmente
};

export default LoadingReplacement; 