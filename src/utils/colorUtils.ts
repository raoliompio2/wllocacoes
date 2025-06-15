/**
 * Utilitário para análise de cores e escolha automática da logo
 */

/**
 * Determina a luminosidade de uma cor
 * @param color Cor em formato hexadecimal ou rgb/rgba
 * @returns Número entre 0 e 1, onde 0 é escuro e 1 é claro
 */
export const getLuminance = (color: string): number => {
  // Se a cor for undefined ou null, retornar valor padrão
  if (!color) return 0.5;
  
  // Converter string de cor para RGB
  let r, g, b;
  
  try {
    // Cor em formato hexadecimal
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    } 
    // Cor em formato rgba
    else if (color.startsWith('rgba')) {
      const rgba = color.match(/\d+(\.\d+)?/g);
      if (rgba && rgba.length >= 3) {
        r = parseInt(rgba[0]) / 255;
        g = parseInt(rgba[1]) / 255;
        b = parseInt(rgba[2]) / 255;
      } else {
        return 0.5; // Valor padrão em caso de formato inválido
      }
    }
    // Cor em formato rgb
    else if (color.startsWith('rgb')) {
      const rgb = color.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        r = parseInt(rgb[0]) / 255;
        g = parseInt(rgb[1]) / 255;
        b = parseInt(rgb[2]) / 255;
      } else {
        return 0.5; // Valor padrão em caso de formato inválido
      }
    } 
    // Nomes de cores comuns
    else if (color === 'white' || color === '#fff' || color === '#ffffff') {
      return 1;
    }
    else if (color === 'black' || color === '#000' || color === '#000000') {
      return 0;
    }
    else {
      console.warn(`Formato de cor não reconhecido: ${color}. Usando valor padrão.`);
      return 0.5; // Valor padrão para cores não reconhecidas
    }
    
    // Fórmula para calcular luminosidade percebida (baseada no padrão WCAG)
    // Dá mais peso para o verde pois os olhos humanos são mais sensíveis a ele
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  } catch (error) {
    console.error(`Erro ao calcular luminosidade para a cor: ${color}`, error);
    return 0.5; // Valor padrão em caso de erro
  }
};

// Caminhos para as logos
const LOGO_FUNDO_CLARO = '/images/Logo_fundo_claro/Logo mm (5).png';
const LOGO_FUNDO_ESCURO = '/images/Logo_fundo_escuro/Aluguel-de-Maquinas-8-768x307 (1).webp';
const LOGO_PAGINAS_SECUNDARIAS = '/images/Logo_fundo_claro/Logo mm (3).png';

/**
 * Determina qual logo usar com base na cor de fundo
 * @param backgroundColor Cor de fundo em formato hexadecimal ou rgb/rgba
 * @returns Caminho para a logo apropriada
 */
export const getLogoByBackground = (backgroundColor: string): string => {
  // Se a cor não for fornecida, usar logo para fundo escuro como padrão seguro
  if (!backgroundColor) {
    console.warn('Cor de fundo não fornecida para getLogoByBackground. Usando logo para fundo escuro como padrão.');
    return LOGO_FUNDO_ESCURO;
  }
  
  // Caso específico se o background for 'light', retornar logo para fundo claro
  if (backgroundColor === 'light') {
    return LOGO_FUNDO_CLARO;
  }
  
  // Caso específico se o background for 'dark', retornar logo para fundo escuro
  if (backgroundColor === 'dark') {
    return LOGO_FUNDO_ESCURO;
  }
  
  const luminance = getLuminance(backgroundColor);
  
  // Se a luminosidade for maior que 0.5, o fundo é considerado claro
  if (luminance > 0.5) {
    return LOGO_FUNDO_CLARO;
  } else {
    return LOGO_FUNDO_ESCURO;
  }
};

/**
 * Retorna a logo especificamente para área de dashboard
 * @returns Caminho para a logo de dashboard
 */
export const getDashboardLogo = (): string => {
  return LOGO_FUNDO_CLARO; // Logo para dashboard (fundo claro)
};

/**
 * Retorna a logo especificamente para header e footer
 * @returns Caminho para a logo de header/footer
 */
export const getHeaderFooterLogo = (): string => {
  return LOGO_PAGINAS_SECUNDARIAS; // Logo para páginas secundárias
}; 