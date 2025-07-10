import React from 'react';
import { Helmet } from 'react-helmet-async';

interface HomePageSchemaProps {
  companyName?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
}

const HomePageSchema: React.FC<HomePageSchemaProps> = ({
  companyName = 'Lokajá Locadora de Equipamentos Para Construção',
  logo = '/images/Logo_fundo_claro/Logo_Locaja.png',
  coverImage = '/images/Imagehero.png',
  description = 'Locação de equipamentos para construção civil e industrial em Ponta Porã e região. Compactadores, betoneiras, andaimes, geradores e muito mais para sua obra.'
}) => {
  const baseUrl = 'https://lokaja.com.br';
  const fullLogoUrl = logo.startsWith('http') ? logo : `${baseUrl}${logo}`;
  const fullCoverUrl = coverImage.startsWith('http') ? coverImage : `${baseUrl}${coverImage}`;

  // Schema da página inicial
  const homePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': `${companyName} - Aluguel de Equipamentos em Ponta Porã`,
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
        'streetAddress': 'Av. da Flora, 374 - Jardim das Flores',
        'addressLocality': 'Ponta Porã',
        'addressRegion': 'MS',
        'postalCode': '79901-128',
        'addressCountry': 'BR'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': -22.5361,
        'longitude': -55.7225
      },
      'telephone': '+556793381010',
      'email': 'contato@lokaja.com.br',
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
          ],
          'opens': '07:00',
          'closes': '11:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
          ],
          'opens': '13:00',
          'closes': '17:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': 'Saturday',
          'opens': '07:00',
          'closes': '11:30'
        }
      ],
      'priceRange': '$$',
      'areaServed': [
        { '@type': 'City', 'name': 'Ponta Porã' },
        { '@type': 'City', 'name': 'Dourados' },
        { '@type': 'City', 'name': 'Maracaju' },
        { '@type': 'City', 'name': 'Sidrolândia' },
        { '@type': 'City', 'name': 'Rio Brilhante' }
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
          'name': 'Aluguel de Equipamentos para Construção em Ponta Porã',
          'url': `${baseUrl}/equipamentos`
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Sobre a Lokajá',
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