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
  const baseUrl = 'https://lokaja.com.br';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;
  const fullOgUrl = ogUrl ? `${baseUrl}${ogUrl}` : fullCanonicalUrl;
  const fullOgImage = ogImage ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`) : `${baseUrl}/images/logo.png`;
  
  // Cidades da região para SEO local
  const cities = [
    'Ponta Porã', 'Dourados', 'Maracaju', 'Sidrolândia', 'Itaporã', 
    'Amambai', 'Caarapó', 'Itaquiraí', 'Rio Brilhante', 'Paranhos', 
    'Laguna Carapã', 'Antonio João', 'Aral Moreira', 'Naviraí',
    'Coronel Sapucaia', 'Mundo Novo', 'Tacuru', 'Sete Quedas',
    'Bela Vista', 'Jardim'
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
    "name": "Lokajá Locadora de Equipamentos Para Construção",
    "description": "Aluguel e locação de equipamentos para construção civil e industrial em Ponta Porã e região.",
    "url": baseUrl,
    "logo": `${baseUrl}/images/logo.png`,
    "image": `${baseUrl}/images/logo.png`,
    "telephone": "(67) 99338-1010",
    "email": "contato@lokaja.com.br",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. da Flora, 374",
      "addressLocality": "Ponta Porã",
      "addressRegion": "MS",
      "postalCode": "79901-128",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -22.5361,
      "longitude": -55.7225
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": ["07:00", "13:00"],
        "closes": ["11:00", "17:00"]
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday"],
        "opens": "07:00",
        "closes": "11:30"
      }
    ],
    "areaServed": cities.map(city => ({
      "@type": "City",
      "name": city,
      "containedInPlace": {
        "@type": "State",
        "name": "Mato Grosso do Sul"
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
      <meta name="author" content="Lokajá Locadora de Equipamentos" />
      
      <meta name="keywords" content={enhancedKeywords} />
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="Lokajá Locadora de Equipamentos" />
      {fullOgUrl && <meta property="og:url" content={fullOgUrl} />}
      {fullOgImage && <meta property="og:image" content={fullOgImage} />}
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {fullOgImage && <meta name="twitter:image" content={fullOgImage} />}
      
      {/* Geo Tags para Cidade */}
      <meta name="geo.region" content="BR-MS" />
      <meta name="geo.placename" content="Ponta Porã" />
      <meta name="geo.position" content="-22.5361;-55.7225" />
      <meta name="ICBM" content="-22.5361, -55.7225" />
      
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
      <meta name="theme-color" content="#001745" />
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