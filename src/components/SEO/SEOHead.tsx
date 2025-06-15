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
  location?: 'teresina' | 'parnaiba' | 'ambos';
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
  location,
  alternateLanguages,
}) => {
  const baseUrl = 'https://seusite.com.br';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;
  const fullOgUrl = ogUrl ? `${baseUrl}${ogUrl}` : fullCanonicalUrl;
  const fullOgImage = ogImage ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`) : undefined;
  
  // Adiciona localização nas keywords
  let enhancedKeywords = keywords || '';
  if (location === 'teresina' || location === 'ambos') {
    enhancedKeywords = `${enhancedKeywords}, Cidade 1, Cidade 1-UF, Locação equipamentos Cidade 1`;
  }
  if (location === 'parnaiba' || location === 'ambos') {
    enhancedKeywords = `${enhancedKeywords}, Cidade 2, Cidade 2-UF, Locação equipamentos Cidade 2`;
  }
  
  // Adiciona termos regionais específicos
  enhancedKeywords = `${enhancedKeywords}, Estado, UF, Região, Palavras-chave do negócio`;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      <meta name="keywords" content={enhancedKeywords} />
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="NOME DA EMPRESA" />
      {fullOgUrl && <meta property="og:url" content={fullOgUrl} />}
      {fullOgImage && <meta property="og:image" content={fullOgImage} />}
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {fullOgImage && <meta name="twitter:image" content={fullOgImage} />}
      
      {/* Geo Tags */}
      {(location === 'teresina' || location === 'ambos') && (
        <>
          <meta name="geo.region" content="BR-UF" />
          <meta name="geo.placename" content="Cidade" />
          <meta name="geo.position" content="0.0000;0.0000" />
          <meta name="ICBM" content="0.0000, 0.0000" />
        </>
      )}
      
      {(location === 'parnaiba' || location === 'ambos') && (
        <>
          <meta name="geo.region" content="BR-UF" />
          <meta name="geo.placename" content="Cidade 2" />
          <meta name="geo.position" content="0.0000;0.0000" />
          <meta name="ICBM" content="0.0000, 0.0000" />
        </>
      )}
      
      {/* Alternate Languages */}
      {alternateLanguages?.map((lang) => (
        <link 
          key={lang.hrefLang} 
          rel="alternate" 
          hrefLang={lang.hrefLang} 
          href={lang.href} 
        />
      ))}
      
      {/* Schema.org JSON-LD */}
      {schema && Array.isArray(schema) ? (
        schema.map((schemaItem, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schemaItem)}
          </script>
        ))
      ) : schema ? (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ) : null}
    </Helmet>
  );
};

export default SEOHead; 