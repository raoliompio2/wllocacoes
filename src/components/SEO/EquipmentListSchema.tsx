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
  title = 'Equipamentos para Locação - Panda Locações',
  description = 'Locação de equipamentos para construção civil e industrial em Limeira e região. Betoneiras, andaimes, compactadores, geradores e muito mais com preços justos.',
  currentCategory
}) => {
  const baseUrl = 'https://pandalocacoes.com.br';
  
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
        'description': equipment.description || `Aluguel de ${equipment.name} em Limeira e região`,
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
            { '@type': 'City', 'name': 'Limeira' },
            { '@type': 'City', 'name': 'Americana' },
            { '@type': 'City', 'name': 'Piracicaba' },
            { '@type': 'City', 'name': 'Campinas' }
          ],
          'seller': {
            '@type': 'LocalBusiness',
            'name': 'Panda Locações',
            'telephone': '(19) 3703-0363',
            'email': 'contato@pandalocacoes.com.br',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': 'Rua Mário Soares de Campos',
              'addressLocality': 'Limeira',
              'addressRegion': 'SP',
              'postalCode': '13484-656',
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
      'name': `${currentCategory} - Equipamentos para Locação - Panda Locações`,
      'description': `Aluguel de ${currentCategory} em Limeira, Americana, Piracicaba e região. A Panda Locações oferece os melhores ${currentCategory} para sua obra ou evento.`,
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