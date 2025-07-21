import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ProductSchemaProps {
  name: string;
  description: string;
  imageUrl?: string;
  category?: string;
  price?: number;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  brand?: string;
  productId?: string;
  ratingValue?: number;
  reviewCount?: number;
}

const ProductSchema: React.FC<ProductSchemaProps> = ({
  name,
  description,
  imageUrl,
  category,
  price,
  availability = 'InStock',
  sku,
  brand = 'Lokajá',
  productId,
  ratingValue,
  reviewCount
}) => {
  const baseUrl = 'https://lokaja.com.br';
  const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`) : undefined;

  // Construir o objeto Schema.org para produto
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    description: description,
    ...(fullImageUrl && { image: fullImageUrl }),
    ...(brand && { brand: { '@type': 'Brand', name: brand } }),
    ...(sku && { sku }),
    ...(productId && { productId }),
    ...(category && { category }),
    offers: {
      '@type': 'Offer',
      availability: `https://schema.org/${availability}`,
      ...(price && { 
        price: price,
        priceCurrency: 'BRL'
      }),
      // Adiciona detalhes sobre locação
      itemOffered: {
        '@type': 'RentalOffer',
        description: `Aluguel de ${name} em sua região`,
        areaServed: [
          { '@type': 'City', name: 'Cidade Principal' },
          { '@type': 'City', name: 'Cidade Vizinha 1' },
          { '@type': 'City', name: 'Cidade Vizinha 2' },
          { '@type': 'City', name: 'Cidade Vizinha 3' }
        ],
        seller: {
          '@type': 'LocalBusiness',
          name: 'Lokajá',
          telephone: '(67) 99338-1010',
          email: 'contato@lokaja.com.br'
        }
      }
    }
  };

  // Adicionar avaliações se disponíveis
  if (ratingValue && reviewCount) {
    Object.assign(productSchema, {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingValue,
        reviewCount: reviewCount
      }
    });
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
    </Helmet>
  );
};

export default ProductSchema; 