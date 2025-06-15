import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Link as MuiLink, Box } from '@mui/material';
import { Home, ChevronRight } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

interface Route {
  path: string;
  label: string;
}

const routes: Record<string, Route> = {
  '/': { path: '/', label: 'Home' },
  '/equipamentos': { path: '/equipamentos', label: 'Equipamentos' },
  '/empresa': { path: '/empresa', label: 'Empresa' },
  '/contato': { path: '/contato', label: 'Contato' },
  '/termos-de-uso': { path: '/termos-de-uso', label: 'Termos de Uso' },
  '/politica-de-privacidade': { path: '/politica-de-privacidade', label: 'Política de Privacidade' },
  '/mapa-do-site': { path: '/mapa-do-site', label: 'Mapa do Site' },
};

// Regex para capturar os parâmetros da URL
const equipmentDetailRegex = /^\/lista\/(.+)$/;
const categoryRegex = /^\/equipamentos\/(.+)$/;

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Função para gerar a label de uma rota
  const getRouteLabel = (path: string): string => {
    // Caso especial para detalhes do equipamento
    if (equipmentDetailRegex.test(path)) {
      const match = path.match(equipmentDetailRegex);
      if (match && match[1]) {
        // Converter o slug de volta para um nome legível
        return decodeURIComponent(match[1])
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    // Caso especial para categoria
    if (categoryRegex.test(path)) {
      const match = path.match(categoryRegex);
      if (match && match[1]) {
        // Converter o slug de categoria para um nome legível
        return decodeURIComponent(match[1])
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    // Rota padrão
    const route = routes[path];
    return route ? route.label : path;
  };
  
  // Construir os links de breadcrumb
  const breadcrumbItems = [{ path: '/', label: 'Home' }];
  let currentPath = '';
  
  pathnames.forEach((name, index) => {
    currentPath += `/${name}`;
    
    // Verificar se é uma categoria
    if (index === 0 && name === 'equipamentos' && pathnames.length > 1) {
      // Adicionar link para a página de equipamentos
      breadcrumbItems.push({ path: '/equipamentos', label: 'Equipamentos' });
      
      // Se temos uma categoria específica
      if (pathnames.length > 1) {
        const categoryPath = `/equipamentos/${pathnames[1]}`;
        breadcrumbItems.push({
          path: categoryPath,
          label: getRouteLabel(categoryPath)
        });
      }
      
      // Pulamos o próximo item pois já o processamos
      return;
    }
    
    // Verificar se é um detalhe de equipamento
    const isEquipmentDetail = equipmentDetailRegex.test(currentPath);
    
    if (isEquipmentDetail) {
      // Adicionar link para a página de equipamentos
      breadcrumbItems.push({ path: '/equipamentos', label: 'Equipamentos' });
      
      // Adicionar o nome do equipamento
      breadcrumbItems.push({
        path: currentPath,
        label: getRouteLabel(currentPath)
      });
    } else if (routes[currentPath]) {
      breadcrumbItems.push({
        path: currentPath,
        label: routes[currentPath].label
      });
    }
  });
  
  // Se não temos nada além da home, não mostramos o breadcrumb
  if (breadcrumbItems.length <= 1) {
    return null;
  }
  
  // Construir o JSON-LD para Schema.org BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://seusite.com.br${item.path}`
    }))
  };
  
  return (
    <>
      {/* Schema.org Markup para Breadcrumbs */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
    
      <Box sx={{ 
        py: 2, 
        px: { xs: 2, md: 3 }, 
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        mt: 2
      }}>
        <MuiBreadcrumbs 
          separator={<ChevronRight fontSize="small" />} 
          aria-label="breadcrumb"
        >
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            
            return isLast ? (
              <Typography key={item.path} color="text.primary" aria-current="page">
                {item.label}
              </Typography>
            ) : (
              <MuiLink
                key={item.path}
                component={Link}
                to={item.path}
                color="inherit"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  '&:hover': { textDecoration: 'underline' } 
                }}
              >
                {index === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Home fontSize="small" sx={{ mr: 0.5 }} />
                    {item.label}
                  </Box>
                ) : (
                  item.label
                )}
              </MuiLink>
            );
          })}
        </MuiBreadcrumbs>
      </Box>
    </>
  );
};

export default Breadcrumbs; 