import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';

interface Category {
  id: string;
  name: string;
  icon: string;
  image_url?: string;
  description?: string;
  slug?: string;
}

const FeaturedCategories: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Imagens de fallback para categorias sem imagens
  const fallbackImages = [
    '/images/categories/excavator.webp',
    '/images/categories/concrete-mixer.webp',
    '/images/categories/loader.webp',
    '/images/categories/scaffolding.webp',
    '/images/categories/compactor.webp',
    '/images/categories/generator.webp',
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Dados mockados para evitar erros com o Supabase
        const mockCategories: Category[] = [
          { id: '1', name: 'Escavadeiras', icon: 'engineering', image_url: fallbackImages[0], slug: 'escavadeiras', description: 'Escavadeiras potentes para todo tipo de terreno.' },
          { id: '2', name: 'Betoneiras', icon: 'mix', image_url: fallbackImages[1], slug: 'betoneiras', description: 'Betoneiras de alta capacidade para sua obra.' },
          { id: '3', name: 'Carregadeiras', icon: 'construction', image_url: fallbackImages[2], slug: 'carregadeiras', description: 'Carregadeiras eficientes para movimentação de materiais.' },
          { id: '4', name: 'Andaimes', icon: 'architecture', image_url: fallbackImages[3], slug: 'andaimes', description: 'Andaimes seguros para trabalhos em altura.' },
          { id: '5', name: 'Compactadores', icon: 'hardware', image_url: fallbackImages[4], slug: 'compactadores', description: 'Compactadores para diferentes tipos de solo.' },
          { id: '6', name: 'Geradores', icon: 'electrical_services', image_url: fallbackImages[5], slug: 'geradores', description: 'Geradores potentes para garantir energia em sua obra.' }
        ];
        
        setCategories(mockCategories);
        
        // Comentado para evitar erros com o schema do Supabase
        /*
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, icon, image_url, description, slug')
          .order('name')
          .limit(6);

        if (error) throw error;

        const categoriesWithImages = data?.map((category, index) => ({
          ...category,
          image_url: category.image_url || fallbackImages[index % fallbackImages.length]
        })) || [];

        setCategories(categoriesWithImages);
        */
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        // Dados estáticos de fallback em caso de erro
        setCategories([
          { id: '1', name: 'Escavadeiras', icon: 'engineering', image_url: fallbackImages[0], slug: 'escavadeiras' },
          { id: '2', name: 'Betoneiras', icon: 'mix', image_url: fallbackImages[1], slug: 'betoneiras' },
          { id: '3', name: 'Carregadeiras', icon: 'construction', image_url: fallbackImages[2], slug: 'carregadeiras' },
          { id: '4', name: 'Andaimes', icon: 'architecture', image_url: fallbackImages[3], slug: 'andaimes' },
          { id: '5', name: 'Compactadores', icon: 'hardware', image_url: fallbackImages[4], slug: 'compactadores' },
          { id: '6', name: 'Geradores', icon: 'electrical_services', image_url: fallbackImages[5], slug: 'geradores' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Box sx={{ py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h2" 
            gutterBottom 
            fontWeight="bold"
          >
            Categorias de Equipamentos
          </Typography>
          <Divider sx={{ maxWidth: 100, mx: 'auto', mb: 2, borderColor: 'primary.main', borderWidth: 2 }} />
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Conheça nossa ampla variedade de equipamentos para sua obra.
          </Typography>
        </Box>

        <Grid container spacing={isMobile ? 1 : 3}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} key={category.id}>
              <Card
                component={Link}
                to={`/equipamentos/${category.id}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    '& .category-image': {
                      transform: 'scale(1.05)',
                    },
                  },
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden', paddingTop: '60%' }}>
                  <CardMedia
                    component="img"
                    image={category.image_url}
                    alt={category.name}
                    className="category-image"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: isMobile ? 1 : 2,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography 
                      variant={isMobile ? "subtitle1" : "h6"} 
                      component="h3" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.9rem' : undefined
                      }}
                    >
                      {category.name}
                    </Typography>
                    <ChevronRight sx={{ fontSize: isMobile ? 18 : 24 }} />
                  </Box>
                </Box>
                {!isMobile && (
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {category.description || `Confira nossa seleção de ${category.name.toLowerCase()} para sua obra.`}
                    </Typography>
                  </CardContent>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            component={Link}
            to="/equipamentos"
            variant="outlined"
            color="primary"
            size={isMobile ? "medium" : "large"}
            endIcon={<ChevronRight />}
            sx={{ fontWeight: 'medium', px: isMobile ? 2 : 4, py: isMobile ? 0.8 : 1.2 }}
          >
            Ver Todas Categorias
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedCategories; 