import React from 'react';
import { Helmet } from 'react-helmet-async';

interface EquipmentCategorySchemaProps {
  categoryName: string;
  categoryId: string;
  categoryDescription?: string;
  categoryImage?: string;
  companyName?: string;
  companyLogo?: string;
  equipmentCount?: number;
  parentUrl?: string;
}

/**
 * Componente para gerar esquemas estruturados para categorias de equipamento
 * Otimizado para anúncios dinâmicos de pesquisa do Google Ads
 */
const EquipmentCategorySchema: React.FC<EquipmentCategorySchemaProps> = ({
  categoryName,
  categoryId,
  categoryDescription,
  categoryImage,
  companyName = 'WL Locações de Equipamentos',
  companyLogo = 'https://wllocacoes.com.br/images_optimized/Logo_fundo_claro/WL_fundo_claro.webp',
  equipmentCount = 0,
  parentUrl = 'https://wllocacoes.com.br/equipamentos'
}) => {
  // Cria um slug a partir do nome da categoria
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const categorySlug = createSlug(categoryName);
  const categoryUrl = `${parentUrl}/categoria/${categorySlug}`;
  const defaultDescription = `Aluguel de ${categoryName.toLowerCase()} em Fortaleza e região. Equipamentos de qualidade com os melhores preços do mercado.`;
  
  // Schema para Categoria de Produto (CollectionPage)
  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${categoryUrl}#category`,
    'name': `${categoryName} para Locação - ${companyName}`,
    'description': categoryDescription || defaultDescription,
    'url': categoryUrl,
    'isPartOf': {
      '@type': 'WebSite',
      '@id': 'https://wllocacoes.com.br/#website',
      'url': 'https://wllocacoes.com.br',
      'name': companyName,
      'description': 'Locação de equipamentos para construção civil e industrial',
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://wllocacoes.com.br/#organization',
        'name': companyName,
        'logo': {
          '@type': 'ImageObject',
          '@id': 'https://wllocacoes.com.br/#logo',
          'url': companyLogo,
          'contentUrl': companyLogo,
          'width': 600,
          'height': 120,
          'caption': companyName
        },
        'image': {
          '@id': 'https://wllocacoes.com.br/#logo'
        }
      }
    },
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': equipmentCount,
      'itemListElement': []
    }
  };

  // Schema para Breadcrumb
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Início',
        'item': 'https://wllocacoes.com.br/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Equipamentos',
        'item': 'https://wllocacoes.com.br/equipamentos'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': categoryName,
        'item': categoryUrl
      }
    ]
  };

  // Schema para FAQPage (perguntas frequentes sobre a categoria)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': `Como funciona o aluguel de ${categoryName.toLowerCase()}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `Para alugar ${categoryName.toLowerCase()}, basta escolher o equipamento desejado, solicitar um orçamento através do site e aguardar nosso contato para confirmação de disponibilidade e valores. Oferecemos entrega em toda Fortaleza e região.`
        }
      },
      {
        '@type': 'Question',
        'name': `Qual o valor para alugar ${categoryName.toLowerCase()}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `Os valores para aluguel de ${categoryName.toLowerCase()} variam conforme o modelo, especificações e período de locação. Temos opções de diária, semanal e mensal com preços competitivos. Entre em contato para obter um orçamento personalizado.`
        }
      },
      {
        '@type': 'Question',
        'name': `A WL Locações oferece entrega de ${categoryName.toLowerCase()}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `Sim, oferecemos serviço de entrega e retirada para ${categoryName.toLowerCase()} em Fortaleza e cidades vizinhas. O valor do frete pode variar conforme a distância e o tipo de equipamento.`
        }
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(categorySchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

export default EquipmentCategorySchema; 