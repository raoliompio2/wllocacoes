import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  schema?: Record<string, any> | Record<string, any>[];
  keywords?: string;
  alternateLanguages?: { hrefLang: string; href: string }[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  ogUrl,
  twitterCard = 'summary_large_image',
  schema,
  keywords,
  alternateLanguages,
}) => {
  const baseUrl = 'https://pandalocacoes.com.br';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;
  const fullOgUrl = ogUrl ? `${baseUrl}${ogUrl}` : fullCanonicalUrl;
  const fullOgImage = ogImage ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`) : `${baseUrl}/images/Logo Panda.png`;
  
  // Cidades da região para SEO local
  const cities = [
    'Limeira', 'Americana', 'Piracicaba', 'Campinas', 'Santa Bárbara d\'Oeste',
    'Rio Claro', 'Sumaré', 'Araras', 'Nova Odessa', 'Iracemápolis',
    'Cosmópolis', 'Artur Nogueira', 'Hortolândia', 'Paulínia', 'Cordeirópolis'
  ];
  
  // Adiciona localização nas keywords
  let enhancedKeywords = keywords || '';
  enhancedKeywords = `${enhancedKeywords}, ${cities.join(', ')}`;
  
  // Adiciona termos específicos do negócio
  const businessTerms = [
    'Aluguel de equipamentos', 'Locação de equipamentos para construção', 
    'Máquinas para construção civil', 'Equipamentos para obra', 
    'Locadora de equipamentos', 'Aluguel de betoneira', 
    'Locação de andaimes', 'Aluguel de martelete', 
    'Locação de compactadores', 'Aluguel de ferramentas'
  ];
  
  enhancedKeywords = `${enhancedKeywords}, ${businessTerms.join(', ')}`;
  
  // Schema.org padrão para LocalBusiness
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "ConstructionEquipmentRental",
    "name": "Panda Locações",
    "description": "Aluguel e locação de equipamentos para construção civil e industrial em Limeira e região. Atendemos Americana, Piracicaba, Campinas e cidades vizinhas.",
    "url": baseUrl,
    "logo": `${baseUrl}/images/Logo Panda.png`,
    "image": `${baseUrl}/images/Logo Panda.png`,
    "telephone": "(19) 3703-0363",
    "email": "contato@pandalocacoes.com.br",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rua Mário Soares de Campos",
      "addressLocality": "Limeira",
      "addressRegion": "SP",
      "postalCode": "13484-656",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -22.5936,  // Coordenadas aproximadas de Limeira
      "longitude": -47.4141
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "07:00",
        "closes": "17:00"
      }
    ],
    "areaServed": cities.map(city => ({
      "@type": "City",
      "name": city,
      "containedInPlace": {
        "@type": "State",
        "name": "São Paulo"
      }
    }))
  };

  // Combinar schema personalizado com o padrão
  const finalSchema = schema ? 
    (Array.isArray(schema) ? [...schema, defaultSchema] : [schema, defaultSchema]) : 
    defaultSchema;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Panda Locações" />
      
      <meta name="keywords" content={enhancedKeywords} />
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="Panda Locações" />
      {fullOgUrl && <meta property="og:url" content={fullOgUrl} />}
      {fullOgImage && <meta property="og:image" content={fullOgImage} />}
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {fullOgImage && <meta name="twitter:image" content={fullOgImage} />}
      
      {/* Geo Tags para Limeira */}
      <meta name="geo.region" content="BR-SP" />
      <meta name="geo.placename" content="Limeira" />
      <meta name="geo.position" content="-22.5936;-47.4141" />
      <meta name="ICBM" content="-22.5936, -47.4141" />
      
      {/* Alternate Languages */}
      {alternateLanguages?.map((lang) => (
        <link 
          key={lang.hrefLang} 
          rel="alternate" 
          hrefLang={lang.hrefLang} 
          href={lang.href} 
        />
      ))}
      
      {/* Meta tags adicionais para melhorar o SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Meta tags para dispositivos móveis */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#FF5722" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      
      {/* Schema.org JSON-LD */}
      {Array.isArray(finalSchema) ? (
        finalSchema.map((schemaItem, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schemaItem)}
          </script>
        ))
      ) : (
        <script type="application/ld+json">
          {JSON.stringify(finalSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead; 