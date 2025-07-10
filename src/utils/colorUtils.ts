/**
 * Utilitário para análise de cores e escolha automática da logo
 */

// Definindo o tipo para os logos
export interface LogoUrls {
  webp: string;
  fallback: string;
}

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
// Usando WebP para navegadores modernos com fallback para PNG
const MAIN_LOGO: LogoUrls = {
  webp: '/images_optimized/Logo_fundo_claro/Logo_Locaja.webp',
  fallback: '/images/Logo_fundo_claro/Logo_Locaja.png'
};
const FOOTER_LOGO: LogoUrls = {
  webp: '/images_optimized/Logo_fundo_claro/Logo_Locaja.webp',
  fallback: '/images/Logo_fundo_claro/Logo_Locaja.png'
};
const SIDEBAR_LOGO: LogoUrls = {
  webp: '/images_optimized/Logo_fundo_escuro/Logo_Locaja (1).webp',
  fallback: '/images/Logo_fundo_escuro/Logo_Locaja (1).png'
};
const LOGO_FUNDO_CLARO: LogoUrls = {
  webp: '/images_optimized/Logo_fundo_claro/Logo_Locaja.webp',
  fallback: '/images/Logo_fundo_claro/Logo_Locaja.png'
};
const LOGO_FUNDO_ESCURO: LogoUrls = {
  webp: '/images_optimized/Logo_fundo_escuro/Logo_Locaja (1).webp',
  fallback: '/images/Logo_fundo_escuro/Logo_Locaja (1).png'
};
const LOGO_PAGINAS_SECUNDARIAS = MAIN_LOGO;

/**
 * Determina qual logo usar com base na cor de fundo
 * @param backgroundColor Cor de fundo em formato hexadecimal ou rgb/rgba
 * @returns Objeto com caminhos para as versões webp e fallback da logo apropriada
 */
export const getLogoByBackground = (backgroundColor: string): LogoUrls => {
  const luminance = getLuminance(backgroundColor);
  
  // Se o fundo for escuro (luminance < 0.5), usar logo para fundo escuro
  // Se o fundo for claro (luminance >= 0.5), usar logo para fundo claro
  return luminance < 0.5 ? LOGO_FUNDO_ESCURO : LOGO_FUNDO_CLARO;
};

/**
 * Retorna a logo especificamente para área de dashboard
 * @returns Objeto com caminhos para as versões webp e fallback da logo de dashboard
 */
export const getDashboardLogo = (): LogoUrls => {
  return LOGO_FUNDO_CLARO; // Logo para fundo claro no dashboard
};

/**
 * Retorna a logo especificamente para o sidebar
 * @returns Objeto com caminhos para as versões webp e fallback da logo do sidebar
 */
export const getSidebarLogo = (): LogoUrls => {
  return SIDEBAR_LOGO; // Logo específica para o sidebar (geralmente fundo escuro)
};

/**
 * Retorna a logo especificamente para header
 * @returns Objeto com caminhos para as versões webp e fallback da logo de header
 */
export const getHeaderFooterLogo = (): LogoUrls => {
  return LOGO_FUNDO_CLARO; // Logo para fundo claro no header
};

/**
 * Retorna a logo especificamente para footer
 * @returns Objeto com caminhos para as versões webp e fallback da logo de footer
 */
export const getFooterLogo = (): LogoUrls => {
  return LOGO_FUNDO_ESCURO; // Logo para fundo escuro no footer
}; 