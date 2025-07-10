import React from 'react';
import { Helmet } from 'react-helmet-async';

interface Equipment {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  url: string;
  category?: string;
}

interface EquipmentListSchemaProps {
  equipmentList: Equipment[];
  title?: string;
  description?: string;
  currentCategory?: string;
}

const EquipmentListSchema: React.FC<EquipmentListSchemaProps> = ({
  equipmentList,
  title = 'Equipamentos para Locação - Rental Company',
  description = 'Locação de equipamentos para construção civil e industrial em sua região. Betoneiras, andaimes, compactadores, geradores e muito mais com preços justos.',
  currentCategory
}) => {
  const baseUrl = 'https://rentalcompany.com.br';
  
  // Schema da página de listagem de equipamentos
  const equipmentListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': title,
    'description': description,
    'url': `${baseUrl}/equipamentos${currentCategory ? `/${currentCategory}` : ''}`,
    'numberOfItems': equipmentList.length,
    'itemListElement': equipmentList.map((equipment, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Product',
        'name': equipment.name,
        'description': equipment.description || `Aluguel de ${equipment.name} em sua região`,
        'url': equipment.url.startsWith('http') ? equipment.url : `${baseUrl}${equipment.url}`,
        ...(equipment.imageUrl && { 
          'image': equipment.imageUrl.startsWith('http') 
            ? equipment.imageUrl 
            : `${baseUrl}${equipment.imageUrl}` 
        }),
        ...(equipment.category && { 'category': equipment.category }),
        'offers': {
          '@type': 'Offer',
          'availability': 'https://schema.org/InStock',
          'priceCurrency': 'BRL',
          'areaServed': [
            { '@type': 'City', 'name': 'Cidade Principal' },
            { '@type': 'City', 'name': 'Cidade Vizinha 1' },
            { '@type': 'City', 'name': 'Cidade Vizinha 2' },
            { '@type': 'City', 'name': 'Cidade Vizinha 3' }
          ],
          'seller': {
            '@type': 'LocalBusiness',
            'name': 'Rental Company',
            'telephone': '(00) 0000-0000',
            'email': 'contato@rentalcompany.com.br',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': 'Endereço da Empresa',
              'addressLocality': 'Cidade',
              'addressRegion': 'UF',
              'postalCode': '00000-000',
              'addressCountry': 'BR'
            }
          }
        }
      }
    }))
  };
  
  // Se for uma página de categoria específica
  if (currentCategory) {
    const categorySchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': `${currentCategory} - Equipamentos para Locação - Rental Company`,
      'description': `Aluguel de ${currentCategory} em sua região. A Rental Company oferece os melhores ${currentCategory} para sua obra ou evento.`,
      'url': `${baseUrl}/equipamentos/${currentCategory}`,
      'mainEntity': equipmentListSchema
    };
    
    return (
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(categorySchema)}
        </script>
      </Helmet>
    );
  }
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(equipmentListSchema)}
      </script>
    </Helmet>
  );
};

export default EquipmentListSchema; 