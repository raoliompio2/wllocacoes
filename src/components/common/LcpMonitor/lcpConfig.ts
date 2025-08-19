/**
 * Configuração para otimização do Largest Contentful Paint (LCP)
 * Identifica os elementos críticos que precisam ser carregados com prioridade
 */

// Elementos críticos do LCP
export const lcpSelectors = [
  'h1.MuiTypography-h3', // Título principal da página
  'h1.MuiTypography-h2',
  '.hero-image',
  '.logo-container img',
  'img[alt="NOME DA EMPRESA"]',
  'img[src*="WL_fundo_claro"]',
  'picture img', // Imagens dentro de tags picture
  'main img' // Imagens principais
];

// Elementos de LCP conhecidos por página
export const lcpElementsByPage = {
  // Página inicial
  '/': [
    'h1.MuiTypography-h2', // Título do hero
    'img[alt="NOME DA EMPRESA"]',
    'img[src*="WL_fundo_claro"]'
  ],
  
  // Página de equipamentos
  '/equipamentos': [
    'h1.MuiTypography-h4', // Título da lista de equipamentos
    '.equipment-list img:nth-child(1)', // Primeira imagem da lista
    '.equipment-list img:nth-child(2)' // Segunda imagem da lista
  ],
  
  // Detalhe do equipamento
  '/equipamento': [
    '.equipment-detail-image img', // Imagem principal do equipamento
    'h1.MuiTypography-h4' // Título do equipamento
  ],
  
  // Sobre a empresa
  '/empresa': [
    'h1.MuiTypography-h3', // Título da página
    '.company-image img' // Imagem da empresa
  ]
};

// Configuração para otimizar o LCP 
export const lcpOptimizationConfig = {
  // Tempo máximo aceitável para LCP (em milissegundos)
  targetLcpMs: 2500,
  
  // Prioridade de carregamento para elementos LCP
  priorityImages: [
    '/images_optimized/Banner/WL-LOCACOES-Dezembro-Banner.webp',
    '/images/Logo_fundo_claro/WL_fundo_claro.webp'
  ],
  
  // Scripts que devem ser carregados de forma diferida
  deferScripts: [
    'gtm.js',
    'analytics',
    'tracking'
  ],
  
  // Atributos a serem adicionados aos elementos LCP
  lcpAttributes: {
    'img': {
      fetchpriority: 'high',
      loading: 'eager',
      decoding: 'async'
    },
    'picture': {
      'data-priority': 'true'
    }
  }
};

/**
 * Função para aplicar atributos de otimização a um elemento LCP
 * @param element Elemento DOM a ser otimizado
 */
export function optimizeLcpElement(element: HTMLElement): void {
  const tagName = element.tagName.toLowerCase();
  
  // Aplicar atributos específicos para o tipo de elemento
  const attributes = lcpAttributes[tagName] || {};
  
  // Aplicar os atributos ao elemento
  Object.entries(attributes).forEach(([key, value]) => {
    // Usar setAttribute para contornar problemas com propriedades não reconhecidas pelo TypeScript
    element.setAttribute(key, value as string);
  });
  
  // Para imagens, precarregar se estiver no viewport inicial
  if (tagName === 'img' || tagName === 'picture') {
    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;
    
    if (isInViewport) {
      // Usar setAttribute para atributos não padronizados como fetchpriority
      element.setAttribute('fetchpriority', 'high');
      
      // Se for uma tag picture, otimizar também as tags source internas
      if (tagName === 'picture') {
        const sources = element.querySelectorAll('source');
        sources.forEach(source => {
          source.setAttribute('fetchpriority', 'high');
        });
      }
    }
  }
}

// Atributos para otimização de LCP por tipo de elemento
const lcpAttributes: Record<string, Record<string, string>> = {
  'img': {
    fetchpriority: 'high',
    loading: 'eager',
    decoding: 'async'
  },
  'picture': {
    'data-priority': 'true'
  },
  'h1': {
    'data-lcp': 'true'
  },
  'h2': {
    'data-lcp': 'true'
  },
  'h3': {
    'data-lcp': 'true'
  }
}; 