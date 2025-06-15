import React, { useEffect } from 'react';
import { SkeletonLoader } from './SkeletonLoadingProvider';
import { Box, CircularProgress } from '@mui/material';

/**
 * Componente que substitui todos os elementos de loading padrão 
 * por skeleton loaders automaticamente usando CSS
 */
const LoadingReplacement: React.FC = () => {
  useEffect(() => {
    // Adicionar estilos globais para substituir loadings
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Ocultar spinners e indicadores de loading padrão */
      .MuiCircularProgress-root,
      .animate-spin,
      [role="progressbar"],
      .loading-indicator {
        display: none !important;
      }
      
      /* Adicionar classe de skeleton para containers de loading */
      .MuiCircularProgress-root:after,
      .animate-spin:after,
      [role="progressbar"]:after,
      .loading-indicator:after {
        content: '';
        display: block;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
        background-size: 400% 100%;
        animation: skeleton-loading 1.4s ease infinite;
        border-radius: 4px;
        height: 100%;
        min-height: 20px;
        min-width: 100px;
      }
      
      @keyframes skeleton-loading {
        0% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0 50%;
        }
      }
      
      /* Estilo para containers de loading específicos */
      .loading-container {
        min-height: 200px;
        position: relative;
      }
      
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
    
    // Substituir dinamicamente os loaders quando aparecerem no DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Verificar se é um elemento de loading
              const element = node as HTMLElement;
              if (
                element.classList.contains('MuiCircularProgress-root') ||
                element.classList.contains('animate-spin') ||
                element.getAttribute('role') === 'progressbar' ||
                element.classList.contains('loading-indicator')
              ) {
                // Substituir pelo skeleton loader
                const parent = element.parentElement;
                if (parent) {
                  // Identificar o tipo de conteúdo para usar o skeleton adequado
                  let type: 'cards' | 'list' | 'details' | 'form' | 'table' = 'cards';
                  
                  if (parent.classList.contains('MuiTable-root') || 
                      parent.querySelector('table') ||
                      parent.closest('table')) {
                    type = 'table';
                  } else if (parent.classList.contains('MuiFormControl-root') || 
                            parent.querySelector('form') ||
                            parent.closest('form')) {
                    type = 'form';
                  } else if (parent.classList.contains('MuiListItem-root') || 
                            parent.querySelector('ul') ||
                            parent.closest('ul')) {
                    type = 'list';
                  } else if (parent.classList.contains('MuiCard-root') || 
                            parent.querySelector('[class*="card"]') ||
                            parent.closest('[class*="card"]')) {
                    type = 'cards';
                  }
                  
                  // Inserir um skeleton loader
                  const skeleton = document.createElement('div');
                  skeleton.classList.add('skeleton-replacement');
                  parent.appendChild(skeleton);
                  
                  // Esconder o loading original
                  element.style.display = 'none';
                  
                  // Renderizar o Skeleton
                  const skeletonRoot = document.createElement('div');
                  parent.appendChild(skeletonRoot);
                  
                  // Dificuldade: não podemos renderizar componentes React diretamente aqui
                  // Em vez disso, adicionamos a classe de estilo
                  skeletonRoot.classList.add('skeleton-loading');
                  skeletonRoot.setAttribute('data-skeleton-type', type);
                }
              }
            }
          });
        }
      });
    });
    
    // Iniciar observação do DOM
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Limpar o observador quando o componente for desmontado
    return () => {
      observer.disconnect();
      document.head.removeChild(styleEl);
    };
  }, []);
  
  return null; // Este componente não renderiza nada visualmente
};

export default LoadingReplacement; 