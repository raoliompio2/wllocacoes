import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { lcpSelectors, lcpElementsByPage, optimizeLcpElement } from './lcpConfig';

// Estendendo a interface PerformanceEntry para incluir a propriedade element
interface LCPPerformanceEntry extends PerformanceEntry {
  element?: HTMLElement;
}

/**
 * Componente para monitorar e otimizar os elementos LCP
 * Identifica elementos críticos e aplica otimizações
 */
const LcpMonitor: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Iniciar monitoramento de LCP quando o componente montar
    setupLcpMonitoring();
    
    // Otimizar os elementos LCP conhecidos para a página atual
    optimizeLcpElementsForCurrentPage();
    
    // Observar mudanças no DOM para otimizar elementos que são adicionados dinamicamente
    setupMutationObserver();
    
    return () => {
      // Limpar o observador quando o componente desmontar
      if (window.lcpObserver) {
        window.lcpObserver.disconnect();
        delete window.lcpObserver;
      }
    };
  }, [location.pathname]);
  
  // Configurar monitoramento de LCP usando a Performance API
  const setupLcpMonitoring = () => {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length === 0) return;
        
        // Obter o elemento LCP mais recente
        const lcpEntry = entries[entries.length - 1] as LCPPerformanceEntry;
        
        // Registrar o elemento e tempo de LCP
        console.log('LCP element detected:', lcpEntry);
        
        // Se o elemento tiver um nodeType, otimizá-lo
        if (lcpEntry.element) {
          optimizeLcpElement(lcpEntry.element);
        }
      });
      
      // Começar a observar elementos candidatos a LCP
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // Armazenar referência ao observador para limpar depois
      window.lcpObserver = lcpObserver;
    } catch (e) {
      console.error('Error setting up LCP monitoring:', e);
    }
  };
  
  // Otimizar elementos LCP conhecidos para a página atual
  const optimizeLcpElementsForCurrentPage = () => {
    // Selecionar elementos de LCP relevantes para a página atual
    const currentPath = location.pathname;
    const pathKey = Object.keys(lcpElementsByPage).find(path => currentPath.startsWith(path)) || '/';
    
    // Type guard para garantir que pathKey é uma chave válida de lcpElementsByPage
    type PathKey = keyof typeof lcpElementsByPage;
    const typedPathKey = pathKey as PathKey;
    
    const pageSpecificSelectors = lcpElementsByPage[typedPathKey] || [];
    const selectors = [...lcpSelectors, ...pageSpecificSelectors];
    
    // Aplicar otimizações a todos os elementos
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        optimizeLcpElement(element as HTMLElement);
      });
    });
  };
  
  // Configurar observador para novas adições ao DOM
  const setupMutationObserver = () => {
    // Se já temos um observador, limpar primeiro
    if (window.domObserver) {
      window.domObserver.disconnect();
    }
    
    // Criar novo observador
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            // Verificar se é um elemento
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Verificar se o elemento corresponde a algum dos seletores LCP
              const element = node as HTMLElement;
              lcpSelectors.forEach(selector => {
                if (element.matches(selector)) {
                  optimizeLcpElement(element);
                }
              });
              
              // Também verificar filhos do elemento
              const children = element.querySelectorAll(lcpSelectors.join(','));
              children.forEach(child => {
                optimizeLcpElement(child as HTMLElement);
              });
            }
          });
        }
      });
    });
    
    // Iniciar observação
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Armazenar referência
    window.domObserver = observer;
  };
  
  // Este componente não renderiza nada visível
  return null;
};

export default LcpMonitor;

// Declaração para TypeScript
declare global {
  interface Window {
    lcpObserver?: PerformanceObserver;
    domObserver?: MutationObserver;
  }
} 