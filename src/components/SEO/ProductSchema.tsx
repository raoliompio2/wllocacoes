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
  brand = 'Panda Locações',
  productId,
  ratingValue,
  reviewCount
}) => {
  const baseUrl = 'https://pandalocacoes.com.br';
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
        description: `Aluguel de ${name} em Limeira e região`,
        areaServed: [
          { '@type': 'City', name: 'Limeira' },
          { '@type': 'City', name: 'Americana' },
          { '@type': 'City', name: 'Piracicaba' },
          { '@type': 'City', name: 'Campinas' }
        ],
        seller: {
          '@type': 'LocalBusiness',
          name: 'Panda Locações',
          telephone: '(19) 3703-0363',
          email: 'contato@pandalocacoes.com.br'
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