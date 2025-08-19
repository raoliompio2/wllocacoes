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
  companyName = 'WL Locações',
  foundingDate = '2020-01-01',
  description = 'Especializada em aluguel de equipamentos para construção civil e industrial, a WL Locações atende com excelência empresas e pessoas físicas em Ponta Porã e região, oferecendo os melhores equipamentos com preços justos.',
  imageUrl = '/images/Logo_fundo_claro/WL_fundo_claro.png'
}) => {
  const { companyInfo } = useCompany();
  
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'mainEntity': {
      '@type': 'Organization',
      'name': companyName,
      'url': 'https://wllocacoes.com.br',
      'logo': {
        '@type': 'ImageObject',
        'url': `https://wllocacoes.com.br${imageUrl}`
      },
      'image': {
        '@type': 'ImageObject',
        'url': `https://wllocacoes.com.br${imageUrl}`
      },
      'description': description,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': companyInfo.address.split(',')[0],
        'addressLocality': 'Ponta Porã',
        'addressRegion': 'MS',
        'postalCode': '60864-311',
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
        'https://www.facebook.com/wllocacoes',
        'https://www.instagram.com/wllocacoes'
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