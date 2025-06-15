import React, { useEffect } from 'react';

interface GoogleTagManagerProps {
  id: string;
}

/**
 * Componente que carrega o Google Tag Manager de forma otimizada
 * Carrega o script de forma assíncrona para não bloquear o carregamento da página
 */
const GoogleTagManager: React.FC<GoogleTagManagerProps> = ({ id }) => {
  useEffect(() => {
    // Carregar GTM apenas quando a página estiver 100% carregada e ociosa
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        loadGTM();
      });
    } else {
      // Fallback para navegadores que não suportam requestIdleCallback
      window.addEventListener('load', () => {
        setTimeout(loadGTM, 1500); // Atraso de 1.5s após o carregamento
      });
    }
    
    // Função para injetar o script do GTM
    const loadGTM = () => {
      // Não recarregar se já foi carregado
      if (window.dataLayer) return;
  
      // Criar a tag script para GTM
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
      
      // Adicionar observador para verificar se o script carregou corretamente
      script.onload = () => {
        console.log('Google Tag Manager carregado com sucesso');
      };
      
      // Adicionar o script ao document
      document.head.appendChild(script);
      
      // Inicializar dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
    };
    
    // Cleanup - remover listener se existir
    return () => {
      window.removeEventListener('load', loadGTM);
    };
  }, [id]);
  
  return null; // Não renderiza nada visualmente
};

export default GoogleTagManager;

// Declare o tipo da propriedade dataLayer no objeto window
declare global {
  interface Window {
    dataLayer: any[];
    // Não precisamos redeclarar requestIdleCallback pois já está definido no lib.dom.d.ts
  }
} 