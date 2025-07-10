import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCompany } from '../../context/CompanyContext';

interface AboutPageSchemaProps {
  companyName?: string;
  foundingDate?: string;
  description?: string;
  imageUrl?: string;
}

const AboutPageSchema: React.FC<AboutPageSchemaProps> = ({
  companyName = 'Lokajá',
  foundingDate = '2020-01-01',
  description = 'Especializada em aluguel de equipamentos para construção civil e industrial, a Lokajá atende com excelência empresas e pessoas físicas em Ponta Porã e região, oferecendo os melhores equipamentos com preços justos.',
  imageUrl = '/images/Logo_fundo_claro/Logo_Locaja.png'
}) => {
  const { companyInfo } = useCompany();
  
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'mainEntity': {
      '@type': 'Organization',
      'name': companyName,
      'url': 'https://lokaja.com.br',
      'logo': {
        '@type': 'ImageObject',
        'url': `https://lokaja.com.br${imageUrl}`
      },
      'image': {
        '@type': 'ImageObject',
        'url': `https://lokaja.com.br${imageUrl}`
      },
      'description': description,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': companyInfo.address.split(',')[0],
        'addressLocality': 'Ponta Porã',
        'addressRegion': 'MS',
        'postalCode': '79901-128',
        'addressCountry': 'BR'
      },
      'telephone': companyInfo.phone,
      'email': companyInfo.email,
      'foundingDate': foundingDate,
      'foundingLocation': {
        '@type': 'Place',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Ponta Porã',
          'addressRegion': 'MS',
          'addressCountry': 'BR'
        }
      },
      'sameAs': [
        'https://www.facebook.com/lokaja',
        'https://www.instagram.com/lokaja'
      ]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default AboutPageSchema; 