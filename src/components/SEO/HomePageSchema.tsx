import React from 'react';
import { Helmet } from 'react-helmet-async';

interface HomePageSchemaProps {
  companyName?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
}

const HomePageSchema: React.FC<HomePageSchemaProps> = ({
  companyName = 'WL Locações de Equipamentos',
  logo = '/images/Logo_fundo_claro/WL_fundo_claro.png',
  coverImage = '/images/Imagehero.png',
  description = 'Locação de equipamentos para construção civil e industrial em Fortaleza e região. Compactadores, betoneiras, andaimes, geradores e muito mais para sua obra.'
}) => {
  const baseUrl = 'https://wllocacoes.com.br';
  const fullLogoUrl = logo.startsWith('http') ? logo : `${baseUrl}${logo}`;
  const fullCoverUrl = coverImage.startsWith('http') ? coverImage : `${baseUrl}${coverImage}`;

  // Schema da página inicial
  const homePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': `${companyName} - Aluguel de Equipamentos em Fortaleza`,
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
        'streetAddress': 'Av. Dep. Paulino Rocha, 1881 - Cajazeiras',
        'addressLocality': 'Fortaleza',
        'addressRegion': 'CE',
        'postalCode': '60864-311',
        'addressCountry': 'BR'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': -3.7275,
        'longitude': -38.5434
      },
      'telephone': '+5585986101415',
      'email': 'contato@wllocacoes.com.br',
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
        { '@type': 'City', 'name': 'Fortaleza' },
        { '@type': 'City', 'name': 'Caucaia' },
        { '@type': 'City', 'name': 'Maracanaú' },
        { '@type': 'City', 'name': 'Maranguape' },
        { '@type': 'City', 'name': 'Aquiraz' }
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
          'name': 'Aluguel de Equipamentos para Construção em Fortaleza',
          'url': `${baseUrl}/equipamentos`
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Sobre a WL Locações',
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