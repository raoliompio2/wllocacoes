import React from 'react';
import { SchemaObject } from './LocationSchema';

interface EquipmentCategorySchemaProps {
  categoryName: string;
  categoryUrl: string;
  categoryDescription: string;
  categoryImage: string;
  location?: 'teresina' | 'parnaiba' | 'ambos';
}

const EquipmentCategorySchema = ({
  categoryName,
  categoryUrl,
  categoryDescription,
  categoryImage,
  location = 'ambos'
}: EquipmentCategorySchemaProps): SchemaObject => {
  const baseUrl = 'https://seusite.com.br';
  const fullUrl = categoryUrl.startsWith('http') ? categoryUrl : `${baseUrl}${categoryUrl}`;
  const fullImageUrl = categoryImage.startsWith('http') ? categoryImage : `${baseUrl}${categoryImage}`;
  
  // Adiciona a localização à descrição se especificada
  let enhancedDescription = categoryDescription;
  if (location === 'teresina') {
    enhancedDescription = `${categoryDescription} Disponível em nossa unidade de Cidade 1.`;
  } else if (location === 'parnaiba') {
    enhancedDescription = `${categoryDescription} Disponível em nossa unidade de Cidade 2.`;
  } else if (location === 'ambos') {
    enhancedDescription = `${categoryDescription} Disponível em nossas unidades de Cidade 1 e Cidade 2.`;
  }
  
  // Constrói o nome otimizado para SEO local
  let enhancedName = categoryName;
  if (location === 'teresina') {
    enhancedName = `${categoryName} em Cidade 1 | NOME DA EMPRESA`;
  } else if (location === 'parnaiba') {
    enhancedName = `${categoryName} em Cidade 2 | NOME DA EMPRESA`;
  } else if (location === 'ambos') {
    enhancedName = `${categoryName} na Região | NOME DA EMPRESA`;
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': enhancedName,
    'description': enhancedDescription,
    'url': fullUrl,
    'image': fullImageUrl,
    'numberOfItems': 4, // Este valor deve ser atualizado de acordo com o número real de itens
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'item': {
          '@type': 'Product',
          'name': `${categoryName} Tipo 1`,
          'description': `Locação de ${categoryName} Tipo 1 para construção civil e indústria.`,
          'url': `${fullUrl}/tipo-1`,
          'image': fullImageUrl,
          'brand': {
            '@type': 'Brand',
            'name': 'NOME DA EMPRESA'
          },
          'offers': {
            '@type': 'Offer',
            'price': '',
            'priceCurrency': 'BRL',
            'availability': 'https://schema.org/InStock',
            'seller': {
              '@type': 'Organization',
              'name': 'NOME DA EMPRESA',
              'url': baseUrl
            },
            'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
          }
        }
      },
      // Outros itens seriam adicionados com dados reais
    ]
  };
};

/**
 * Schema JSON-LD para o catálogo de categorias de equipamentos
 */
export const EquipmentCatalogSchema = (): SchemaObject => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Catálogo de Equipamentos para Locação | NOME DA EMPRESA',
    'description': 'Confira nosso catálogo completo de equipamentos para locação. Atendemos diferentes regiões com as melhores soluções para sua obra.',
    'url': 'https://seusite.com.br/equipamentos',
    'numberOfItems': 4,  // Atualizar com número real de categorias
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'url': 'https://seusite.com.br/equipamentos/categoria1',
        'name': 'Categoria 1'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'url': 'https://seusite.com.br/equipamentos/categoria2',
        'name': 'Categoria 2'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'url': 'https://seusite.com.br/equipamentos/categoria3',
        'name': 'Categoria 3'
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'url': 'https://seusite.com.br/equipamentos/categoria4',
        'name': 'Categoria 4'
      }
    ]
  };
};

export default EquipmentCategorySchema; 