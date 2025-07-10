import React from 'react';
import { Helmet } from 'react-helmet-async';

interface AboutPageSchemaProps {
  companyName?: string;
  foundingDate?: string;
  description?: string;
  imageUrl?: string;
}

const AboutPageSchema: React.FC<AboutPageSchemaProps> = ({
  companyName = 'Rental Company',
  foundingDate = '2020-01-01', // Substitua pela data real de fundação
  description = 'Especializada em aluguel de equipamentos para construção civil e industrial, a Rental Company atende com excelência empresas e pessoas físicas, oferecendo os melhores equipamentos com preços justos.',
  imageUrl = '/images/Logo_fundo_claro/Logo_Locaja.png'
}) => {
  const baseUrl = 'https://rentalcompany.com.br';
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;

  // Schema da página Sobre Nós
  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'mainEntity': {
      '@type': 'Organization',
      'name': companyName,
      'foundingDate': foundingDate,
      'description': description,
      'image': fullImageUrl,
      'url': `${baseUrl}/empresa`,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Endereço da Empresa',
        'addressLocality': 'Cidade',
        'addressRegion': 'UF',
        'postalCode': '00000-000',
        'addressCountry': 'BR'
      },
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+5500000000000',
        'contactType': 'customer service',
        'email': 'contato@rentalcompany.com.br',
        'areaServed': ['Cidade Principal', 'Cidade Vizinha 1', 'Cidade Vizinha 2', 'Cidade Vizinha 3', 'Cidade Vizinha 4'],
        'availableLanguage': ['Portuguese']
      },
      'sameAs': [
        'https://facebook.com/rentalcompany',
        'https://instagram.com/rentalcompany'
      ]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(aboutPageSchema)}
      </script>
    </Helmet>
  );
};

export default AboutPageSchema; 