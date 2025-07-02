import React from 'react';
import { Helmet } from 'react-helmet-async';

interface HomePageSchemaProps {
  companyName?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
}

const HomePageSchema: React.FC<HomePageSchemaProps> = ({
  companyName = 'Panda Locações',
  logo = '/images/Logo Panda.png',
  coverImage = '/images/Imagehero.png',
  description = 'Locação de equipamentos para construção civil e industrial em Limeira, Americana, Piracicaba e região. Compactadores, betoneiras, andaimes, geradores e muito mais.'
}) => {
  const baseUrl = 'https://pandalocacoes.com.br';
  const fullLogoUrl = logo.startsWith('http') ? logo : `${baseUrl}${logo}`;
  const fullCoverUrl = coverImage.startsWith('http') ? coverImage : `${baseUrl}${coverImage}`;

  // Schema da página inicial
  const homePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': `${companyName} - Aluguel de Equipamentos em Limeira e Região`,
    'description': description,
    'url': baseUrl,
    'image': fullCoverUrl,
    'publisher': {
      '@type': 'LocalBusiness',
      'name': companyName,
      'logo': {
        '@type': 'ImageObject',
        'url': fullLogoUrl
      },
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Rua Mário Soares de Campos',
        'addressLocality': 'Limeira',
        'addressRegion': 'SP',
        'postalCode': '13484-656',
        'addressCountry': 'BR'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': -22.5908, // Substitua pelas coordenadas reais
        'longitude': -47.4106
      },
      'telephone': '+551937030363',
      'email': 'contato@pandalocacoes.com.br',
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
          ],
          'opens': '07:00',
          'closes': '17:00'
        }
      ],
      'priceRange': '$$',
      'areaServed': [
        { '@type': 'City', 'name': 'Limeira' },
        { '@type': 'City', 'name': 'Americana' },
        { '@type': 'City', 'name': 'Piracicaba' },
        { '@type': 'City', 'name': 'Campinas' },
        { '@type': 'City', 'name': 'Santa Bárbara d\'Oeste' },
        { '@type': 'City', 'name': 'Cosmópolis' },
        { '@type': 'City', 'name': 'Rio Claro' }
      ]
    },
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['header', 'article h1', '.hero-section h1']
    },
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Aluguel de Equipamentos para Construção',
          'url': `${baseUrl}/equipamentos`
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Sobre a Panda Locações',
          'url': `${baseUrl}/empresa`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Contato',
          'url': `${baseUrl}/contato`
        }
      ]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(homePageSchema)}
      </script>
    </Helmet>
  );
};

export default HomePageSchema; 