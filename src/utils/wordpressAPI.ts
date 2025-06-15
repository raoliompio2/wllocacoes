import axios from 'axios';

// URL base da API WordPress
const WP_API_URL = 'https://seusite.com/wp-json/wp/v2';

/**
 * Interface para o objeto de mídia do WordPress
 */
interface WordPressMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: { rendered: string };
  author: number;
  source_url: string; // URL direta para o arquivo de mídia
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        source_url: string;
      };
    };
  };
}

/**
 * Busca imagens da API do WordPress
 * @param search Termo opcional para buscar imagens específicas
 * @param perPage Número de imagens por página
 * @param page Número da página
 */
export const fetchWordPressImages = async (
  search?: string,
  perPage: number = 50,
  page: number = 1
): Promise<WordPressMedia[]> => {
  try {
    const params: Record<string, any> = {
      per_page: perPage,
      page,
      media_type: 'image',
    };

    if (search) {
      params.search = search;
    }

    const response = await axios.get(`${WP_API_URL}/media`, { params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar imagens do WordPress:', error);
    throw error;
  }
};

/**
 * Busca uma imagem específica pelo nome/slug
 * @param imageName Nome ou parte do nome da imagem para buscar
 */
export const findImageByName = async (imageName: string): Promise<WordPressMedia | null> => {
  try {
    const images = await fetchWordPressImages(imageName);
    return images.length > 0 ? images[0] : null;
  } catch (error) {
    console.error(`Erro ao buscar imagem "${imageName}":`, error);
    return null;
  }
};

/**
 * Verifica se uma URL é do site WordPress
 * @param url URL para verificar
 */
export const isWordPressUrl = (url: string): boolean => {
  return url.includes('seusite.com');
};

/**
 * Obtém URL direta da imagem a partir de uma URL do WordPress
 * Se já for uma URL direta da imagem, retorna a mesma
 * Se não for uma URL do WordPress, retorna a URL original
 * @param url URL para processar
 */
export const getWordPressImageUrl = async (url: string): Promise<string> => {
  // Se não for uma URL do WordPress, retorna a mesma URL
  if (!isWordPressUrl(url)) {
    return url;
  }
  
  // Se já for uma URL direta para a imagem, retorna a mesma
  if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
    return url;
  }
  
  try {
    // Tenta extrair o slug da URL
    const urlParts = url.split('/');
    const potentialSlug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    
    if (!potentialSlug) {
      return url;
    }
    
    // Busca a imagem pelo nome/slug
    const image = await findImageByName(potentialSlug);
    
    if (image && image.source_url) {
      return image.source_url;
    }
    
    return url;
  } catch (error) {
    console.error('Erro ao processar URL do WordPress:', error);
    return url;
  }
}; 