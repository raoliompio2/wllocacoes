import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Breadcrumbs
} from '@mui/material';
import { 
  Home, 
  Info, 
  Construction, 
  Email, 
  Gavel, 
  Security,
  ArrowRight,
  Category
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../utils/supabaseClient';

interface Equipment {
  id: string;
  name: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
}

const SitemapPage: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar categorias
        const { data: categoriesData, error: categoriesError } = await (supabase as any)
          .from('categories')
          .select('id, name')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        
        // Buscar equipamentos
        const { data: equipmentsData, error: equipmentsError } = await (supabase as any)
          .from('equipment')
          .select('id, name, category')
          .order('name');
        
        if (equipmentsError) throw equipmentsError;
        
        // Criar mapa de categorias
        const catMap: Record<string, string> = {};
        if (categoriesData) {
          categoriesData.forEach((cat: Category) => {
            catMap[cat.id] = cat.name;
          });
        }
        
        setCategories(categoriesData || []);
        setEquipments(equipmentsData || []);
        setCategoryMap(catMap);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Função para criar slug
  const createSlug = (name: string) => {
    return encodeURIComponent(
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()
    );
  };
  
  // Agrupar equipamentos por categoria
  const equipmentsByCategory: Record<string, Equipment[]> = {};
  
  equipments.forEach(equipment => {
    if (!equipmentsByCategory[equipment.category]) {
      equipmentsByCategory[equipment.category] = [];
    }
    equipmentsByCategory[equipment.category].push(equipment);
  });

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Helmet>
        <title>Mapa do Site - WL Locações</title>
        <meta name="description" content="Mapa do site completo da WL Locações, locadora de máquinas e equipamentos para construção em Ponta Porã e região." />
        <link rel="canonical" href="https://wllocacoes.com.br/mapa-do-site" />
      </Helmet>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Mapa do Site
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Navegue facilmente por todas as páginas do nosso site
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {/* Páginas principais */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              Páginas Principais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem button component={Link} to="/">
                <ListItemIcon>
                  <Home color="primary" />
                </ListItemIcon>
                <ListItemText primary="Página Inicial" />
              </ListItem>
              
              <ListItem button component={Link} to="/empresa">
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText primary="Empresa" />
              </ListItem>
              
              <ListItem button component={Link} to="/equipamentos">
                <ListItemIcon>
                  <Construction color="primary" />
                </ListItemIcon>
                <ListItemText primary="Equipamentos" />
              </ListItem>
              
              <ListItem button component={Link} to="/contato">
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText primary="Contato" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Páginas Legais e Informativas */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              Informações Legais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem button component={Link} to="/termos-de-uso">
                <ListItemIcon>
                  <Gavel color="primary" />
                </ListItemIcon>
                <ListItemText primary="Termos de Uso" />
              </ListItem>
              
              <ListItem button component={Link} to="/politica-de-privacidade">
                <ListItemIcon>
                  <Security color="primary" />
                </ListItemIcon>
                <ListItemText primary="Política de Privacidade" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Categorias */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              Categorias de Equipamentos
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {categories.map(category => (
                <ListItem 
                  key={category.id}
                  button 
                  component={Link} 
                  to={`/equipamentos/${createSlug(category.name || '')}`}
                >
                  <ListItemIcon>
                    <Category color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={category.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Equipamentos por categoria */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              Todos os Equipamentos
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {Object.keys(equipmentsByCategory).map(categoryId => (
                <Grid item xs={12} md={6} lg={4} key={categoryId}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" component="h3" gutterBottom color="primary.main">
                      {categoryMap[categoryId] || 'Categoria não especificada'}
                    </Typography>
                    
                    <List dense>
                      {equipmentsByCategory[categoryId].map(equipment => (
                        <ListItem 
                          key={equipment.id}
                          button 
                          component={Link} 
                          to={`/equipamento/${createSlug(equipment.name)}`}
                        >
                          <ListItemIcon>
                            <ArrowRight fontSize="small" color="action" />
                          </ListItemIcon>
                          <ListItemText primary={equipment.name} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SitemapPage; 