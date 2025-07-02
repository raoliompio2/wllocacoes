import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../utils/supabaseClient';
import { GoogleReviewsWidget } from '../common';
import HomePageSchema from '../SEO/HomePageSchema';

// Componentes
import HeroSection from './HeroSection';
import FloatingCta from './FloatingCta';
import EquipmentCard from './EquipmentCard';
import HomePageSkeleton from './HomePageSkeleton';

// Tipo para equipamentos
interface Equipment {
  id: string;
  name: string;
  image: string | null;
  category: string;
  daily_rate: string | null;
  description: string | null;
}

// Tipo para categorias
interface Category {
  id: string;
  name: string;
  icon: string;
}

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [featuredEquipment, setFeaturedEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});

  // Calcula o estado geral de carregamento
  const isLoading = loadingEquipment || loadingCategories;

  useEffect(() => {
    const fetchFeaturedEquipment = async () => {
      try {
        setLoadingEquipment(true);
        const { data, error } = await (supabase as any)
          .from('equipment')
          .select('id, name, image, category, daily_rate, description')
          .eq('available', true)
          .limit(8);
        
        if (error) throw error;
        if (data) setFeaturedEquipment(data as Equipment[]);
      } catch (error) {
        console.error('Erro ao buscar equipamentos em destaque:', error);
        setFeaturedEquipment([]);
      } finally {
        setLoadingEquipment(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data, error } = await (supabase as any)
          .from('categories')
          .select('id, name, icon')
          .order('name');
        
        if (error) throw error;
        if (data) {
          setCategories(data as Category[]);
          // Criar um mapa de id para nome da categoria
          const categoryMap: Record<string, string> = {};
          data.forEach((cat: Category) => {
            categoryMap[cat.id] = cat.name;
          });
          setCategoryNames(categoryMap);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchFeaturedEquipment();
    fetchCategories();
  }, []);

  // Se estiver carregando, mostra APENAS o skeleton da página Home
  if (isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <>
      <Helmet>
        <title>Panda Locações - Aluguel de Equipamentos para Construção em Limeira</title>
        <meta name="description" content="Aluguel de equipamentos para construção civil e industrial em Limeira, Americana, Piracicaba e região. Compactadores, betoneiras, andaimes, geradores e muito mais." />
        <meta name="keywords" content="aluguel de equipamentos, locação de máquinas, construção civil, equipamentos para construção, Limeira, Americana, Piracicaba, betoneira, compactador, gerador" />
        <link rel="canonical" href="https://pandalocacoes.com.br/" />
        
        {/* Meta tags para compartilhamento em redes sociais */}
        <meta property="og:title" content="Panda Locações - Aluguel de Equipamentos para Construção" />
        <meta property="og:description" content="Aluguel de equipamentos para construção civil e industrial em Limeira, Americana, Piracicaba e região. Os melhores equipamentos com os melhores preços." />
        <meta property="og:image" content="https://pandalocacoes.com.br/images/Logo Panda.png" />
        <meta property="og:url" content="https://pandalocacoes.com.br/" />
        <meta property="og:type" content="website" />
        
        {/* Meta tags específicas para Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Panda Locações - Aluguel de Equipamentos para Construção" />
        <meta name="twitter:description" content="Aluguel de equipamentos para construção civil e industrial em Limeira e região." />
        <meta name="twitter:image" content="https://pandalocacoes.com.br/images/Logo Panda.png" />
      </Helmet>
      
      {/* Adiciona o Schema.org para a página inicial */}
      <HomePageSchema 
        companyName="Panda Locações"
        logo="/images/Logo Panda.png"
        coverImage="/images/Imagehero.png"
        description="Locação de equipamentos para construção civil e industrial em Limeira, Americana, Piracicaba e região. Compactadores, betoneiras, andaimes, geradores e muito mais com preços justos."
      />
      
      <main>
        {/* Seção Hero */}
        <HeroSection />
        
        {/* Equipamentos em Destaque */}
        <section aria-labelledby="featured-equipment-title">
          <Box sx={{ bgcolor: 'background.default', py: { xs: 6, md: 8 } }}>
            <Container maxWidth="xl">
              <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h4" component="h2" id="featured-equipment-title" gutterBottom fontWeight="bold">
                  Equipamentos em Destaque
                </Typography>
                <Divider sx={{ maxWidth: 100, mx: 'auto', mb: 2, borderColor: 'primary.main', borderWidth: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Conheça nossos equipamentos mais alugados com condições especiais
                </Typography>
              </Box>

              <Grid container spacing={3} role="list" aria-label="Lista de equipamentos em destaque">
                {featuredEquipment.map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.id} role="listitem">
                    <EquipmentCard 
                      equipment={{
                        id: item.id,
                        name: item.name,
                        image: item.image || '',
                        category: item.category,
                        daily_rate: item.daily_rate || '',
                        description: item.description || '',
                        available: true
                      }}
                      categoryName={categoryNames[item.category]}
                      loading={false} // Sempre false para evitar skeleton duplicado
                    />
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button 
                  component={Link} 
                  to="/equipamentos" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  endIcon={<ChevronRight />}
                  sx={{ fontWeight: 'bold', px: 4, py: 1.2 }}
                  aria-label="Ver todos os equipamentos disponíveis para locação"
                >
                  Ver Todos os Equipamentos
                </Button>
              </Box>
            </Container>
          </Box>
        </section>
        
        {/* Avaliações do Google - Social Proof */}
        <section aria-labelledby="customer-reviews-title">
          <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
            <Container maxWidth="xl">
              <GoogleReviewsWidget 
                widgetId="3631a20c-7427-485c-994a-79b07d57b855"
                title="O Que Nossos Clientes Dizem"
                subtitle="Valorizamos a opinião de nossos clientes e trabalhamos constantemente para oferecer o melhor serviço"
                minHeight={{ xs: 450, md: 550 }}
                showHeader={true}
              />
            </Container>
          </Box>
        </section>
        
        {/* CTA Flutuante */}
        <FloatingCta />
      </main>
    </>
  );
};

export default HomePage; 