import React from 'react';

interface ProductSchemaProps {
  name: string;
  description: string;
  imageUrl: string;
  price?: string;
  priceType?: string;
  category?: string;
  brand?: string;
  url: string;
  availability?: 'InStock' | 'OutOfStock';
  reviewCount?: number;
  ratingValue?: number;
}

const ProductSchema = ({
  name,
  description,
  imageUrl,
  price,
  priceType = 'Diária',
  category,
  brand = 'NOME DA EMPRESA',
  url,
  availability = 'InStock',
  reviewCount,
  ratingValue,
}: ProductSchemaProps) => {
  const baseUrl = 'https://seusite.com.br';
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: fullImageUrl,
    url: fullUrl,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    ...(category && {
      category,
    }),
    offers: {
      '@type': 'Offer',
      price: price ? (typeof price === 'string' ? price.replace(/[^\d.,]/g, '') : String(price)) : '',
      priceCurrency: 'BRL',
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/UsedCondition',
      availability: availability === 'InStock' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'NOME DA EMPRESA',
        url: baseUrl
      },
      ...(priceType && {
        unitText: priceType
      })
    },
    ...(ratingValue && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue,
        reviewCount: reviewCount || 0,
        bestRating: '5',
        worstRating: '1'
      }
    })
  };

  return schema;
};

export default ProductSchema; 