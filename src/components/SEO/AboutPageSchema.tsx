import React from 'react';
import { Helmet } from 'react-helmet-async';

interface AboutPageSchemaProps {
  companyName?: string;
  foundingDate?: string;
  description?: string;
  imageUrl?: string;
}

const AboutPageSchema: React.FC<AboutPageSchemaProps> = ({
  companyName = 'Panda Locações',
  foundingDate = '2020-01-01', // Substitua pela data real de fundação
  description = 'Especializada em aluguel de equipamentos para construção civil e industrial em Limeira e região, a Panda Locações atende com excelência empresas e pessoas físicas, oferecendo os melhores equipamentos com preços justos.',
  imageUrl = '/images/Logo Panda.png'
}) => {
  const baseUrl = 'https://pandalocacoes.com.br';
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
        'streetAddress': 'Rua Mário Soares de Campos',
        'addressLocality': 'Limeira',
        'addressRegion': 'SP',
        'postalCode': '13484-656',
        'addressCountry': 'BR'
      },
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+551937030363',
        'contactType': 'customer service',
        'email': 'contato@pandalocacoes.com.br',
        'areaServed': ['Limeira', 'Americana', 'Piracicaba', 'Campinas', 'Santa Bárbara d\'Oeste'],
        'availableLanguage': ['Portuguese']
      },
      'sameAs': [
        // Substitua pelos links reais das redes sociais, se existirem
        'https://facebook.com/pandalocacoes',
        'https://instagram.com/pandalocacoes'
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