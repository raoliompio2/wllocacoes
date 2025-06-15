import React from 'react';

export type LocationType = 'teresina' | 'parnaiba' | 'ambos';

interface LocationSchemaProps {
  locationType: LocationType;
}

// Define o tipo para um schema JSON-LD de estruturação de dados
export type SchemaObject = Record<string, any>;

// Componente modificado para retornar um array de objetos de schema, não um React.FC
const LocationSchema = ({ locationType }: LocationSchemaProps): SchemaObject[] => {
  const schemas: SchemaObject[] = [];
  
  if (locationType === 'teresina' || locationType === 'ambos') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://seusite.com.br/unidade/cidade1',
      'name': 'NOME DA EMPRESA - Unidade Cidade 1',
      'image': 'https://seusite.com.br/images/unidade-cidade1.jpg',
      'url': 'https://seusite.com.br/unidade/cidade1',
      'telephone': '+5500000000000',
      'priceRange': '$$',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Endereço da Unidade Cidade 1',
        'addressLocality': 'Cidade 1',
        'addressRegion': 'UF',
        'postalCode': '00000-000',
        'addressCountry': 'BR'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '0.0000',
        'longitude': '0.0000'
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
          ],
          'opens': '08:00',
          'closes': '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': 'Saturday',
          'opens': '08:00',
          'closes': '12:00'
        }
      ],
      'sameAs': [
        'https://www.facebook.com/suaempresa',
        'https://www.instagram.com/suaempresa'
      ],
      'description': 'Empresa especializada em locação de equipamentos para construção civil e indústria em Cidade 1. Categorias de produtos e serviços oferecidos.',
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': 'Equipamentos para Locação em Cidade 1',
        'itemListElement': [
          {
            '@type': 'OfferCatalog',
            'name': 'Categoria 1 em Cidade 1',
            'url': 'https://seusite.com.br/equipamentos/categoria1'
          },
          {
            '@type': 'OfferCatalog',
            'name': 'Categoria 2 em Cidade 1',
            'url': 'https://seusite.com.br/equipamentos/categoria2'
          },
          {
            '@type': 'OfferCatalog',
            'name': 'Categoria 3 em Cidade 1',
            'url': 'https://seusite.com.br/equipamentos/categoria3'
          },
          {
            '@type': 'OfferCatalog',
            'name': 'Categoria 4 em Cidade 1',
            'url': 'https://seusite.com.br/equipamentos/categoria4'
          }
        ]
      }
    });
  }
  
  if (locationType === 'parnaiba' || locationType === 'ambos') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://seusite.com.br/unidade/cidade2',
      'name': 'NOME DA EMPRESA - Unidade Cidade 2',
      'image': 'https://seusite.com.br/images/unidade-cidade2.jpg',
      'url': 'https://seusite.com.br/unidade/cidade2',
      'telephone': '+5500000000000',
      'priceRange': '$$',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Endereço da Unidade Cidade 2',
        'addressLocality': 'Cidade 2',
        'addressRegion': 'UF',
        'postalCode': '00000-000',
        'addressCountry': 'BR'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '0.0000',
        'longitude': '0.0000'
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
          ],
          'opens': '08:00',
          'closes': '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': 'Saturday',
          'opens': '08:00',
          'closes': '12:00'
        }
      ],
      'sameAs': [
        'https://www.facebook.com/suaempresa',
        'https://www.instagram.com/suaempresa'
      ],
      'description': 'Empresa especializada em locação de equipamentos para construção civil e indústria em Cidade 2. Categorias de produtos e serviços oferecidos.',
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': 'Equipamentos para Locação em Cidade 2',
        'itemListElement': [
          {
            '@type': 'OfferCatalog',
            'name': 'Categoria 1 em Cidade 2',
            'url': 'https://seusite.com.br/equipamentos/categoria1'
          },
          {
            '@type': 'OfferCatalog',
            'name': 'Categoria 2 em Cidade 2',
            'url': 'https://seusite.com.br/equipamentos/categoria2'
          },
          {
            '@type': 'OfferCatalog',
            'name': 'Categoria 3 em Cidade 2',
            'url': 'https://seusite.com.br/equipamentos/categoria3'
          },
          {
            '@type': 'OfferCatalog',
            'name': 'Categoria 4 em Cidade 2',
            'url': 'https://seusite.com.br/equipamentos/categoria4'
          }
        ]
      }
    });
  }
  
  if (locationType === 'ambos') {
    // Adiciona um esquema de Organization com departamentos para ambas unidades
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'NOME DA EMPRESA',
      'url': 'https://seusite.com.br',
      'logo': 'https://seusite.com.br/images/logo.jpg',
      'description': 'Empresa especializada em locação de equipamentos para construção civil e indústria. Atuamos em diferentes cidades e regiões com as melhores soluções para sua obra.',
      'sameAs': [
        'https://www.facebook.com/suaempresa',
        'https://www.instagram.com/suaempresa'
      ],
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'telephone': '+5500000000000',
          'contactType': 'customer service',
          'areaServed': 'Cidade 1',
          'availableLanguage': 'Portuguese'
        },
        {
          '@type': 'ContactPoint',
          'telephone': '+5500000000000',
          'contactType': 'customer service',
          'areaServed': 'Cidade 2',
          'availableLanguage': 'Portuguese'
        }
      ],
      'department': [
        {
          '@type': 'LocalBusiness',
          '@id': 'https://seusite.com.br/unidade/cidade1'
        },
        {
          '@type': 'LocalBusiness',
          '@id': 'https://seusite.com.br/unidade/cidade2'
        }
      ]
    });
  }
  
  return schemas;
};

export default LocationSchema; 