import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Button, 
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Pagination,
  CircularProgress,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Fade,
  alpha,
  Skeleton,
  SelectChangeEvent
} from '@mui/material';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  FilterList, 
  Close, 
  Sort, 
  GridView, 
  ViewList
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../utils/supabaseClient';
import EquipmentCard from './EquipmentCard';
import SEOHead from '../SEO/SEOHead';
import EquipmentFiltersFloating from './EquipmentFiltersFloating';
import FilterPanel from '../common/FilterPanel';
import EquipmentListSchema from '../SEO/EquipmentListSchema';

// Tipos
interface Equipment {
  id: string;
  name: string;
  image: string | null;
  category: string;
  daily_rate: string | null;
  weekly_rate: string | null;
  monthly_rate: string | null;
  description: string | null;
  available?: boolean;
  average_rating?: number;
  total_reviews?: number;
  specifications?: Record<string, string> | any;
  construction_phase_id?: string;
  technical_specs?: any;
}

interface Category {
  id: string;
  name: string | null;
  icon: string | null;
}

interface ConstructionPhase {
  id: string;
  name: string | null;
  description?: string | null;
}

const EquipmentPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const params = useParams<{categoryId?: string}>();
  const navigate = useNavigate();
  
  // Função para criar slug a partir do nome do equipamento
  const createSlug = (name: string) => {
    return encodeURIComponent(
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()
    );
  };
  
  // Estados
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [constructionPhases, setConstructionPhases] = useState<ConstructionPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<string>('name-asc');
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 12;

  // Obter parâmetros da URL
  useEffect(() => {
    // Verificar primeiro se temos categoryId do parâmetro da rota
    if (params.categoryId) {
      console.log('Categoria recebida do parâmetro da URL:', params.categoryId);
      
      // Verificar se o parâmetro é um UUID (ID) ou um slug de nome
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.categoryId);
      
      if (isUUID) {
        // Se for um UUID, usa diretamente
        console.log('Parâmetro detectado como UUID, usando diretamente:', params.categoryId);
        setSelectedCategory(params.categoryId);
        
        // Não aplicamos o filtro imediatamente aqui porque estamos no useEffect que
        // detecta a mudança de parâmetros, então deixamos o useEffect das categorias
        // aplicar o filtro depois que as categorias forem carregadas
      } else {
        // Se for um slug, armazenamos para resolvê-lo depois de carregar as categorias
        console.log('Parâmetro detectado como slug de nome:', params.categoryId);
        // Não definimos o selectedCategory aqui, será definido depois que 
        // carregarmos as categorias do banco
      }
      
      setShowFilters(true);
    } else {
      // Se não tiver na rota, verificar nos parâmetros de consulta
      const searchParams = new URLSearchParams(location.search);
      const categoryParam = searchParams.get('categoria');
      if (categoryParam) {
        console.log('Categoria selecionada do query param:', categoryParam);
        setSelectedCategory(categoryParam);
        setShowFilters(true);
      }
    }
    
    // Verificar se há outros parâmetros que você queira usar
    const searchParams = new URLSearchParams(location.search);
    const phaseParam = searchParams.get('fase');
    if (phaseParam) {
      setSelectedPhase(phaseParam);
    }
    
    const searchParam = searchParams.get('busca');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search, params.categoryId]);

  // Carregar dados
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // @ts-ignore
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        if (data) {
          console.log('Categorias carregadas:', data.length);
          setCategories(data as unknown as Category[]);
          
          // Se temos um categoryId que não é UUID, tentamos encontrar a categoria correspondente
          if (params.categoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.categoryId)) {
            const categorySlug = params.categoryId;
            console.log('Buscando categoria com slug:', categorySlug);
            
            // Log de todas as categorias e seus slugs
            data.forEach(cat => {
              const catName = cat.name || '';
              const catSlug = createSlug(catName);
              console.log(`Categoria: "${catName}" -> Slug: "${catSlug}" -> Comparação: "${catSlug === categorySlug}"`);
            });
            
            // Encontra a categoria correspondente ao slug
            const category = data.find(cat => {
              const catSlug = createSlug(cat.name || '');
              return catSlug === categorySlug;
            });
            
            if (category) {
              console.log('Categoria encontrada pelo slug:', category.name, 'com ID:', category.id);
              setSelectedCategory(category.id);
              
              // Agora podemos buscar equipamentos filtrados por esta categoria
              fetchEquipment(category.id);
            } else {
              console.log('Não foi encontrada nenhuma categoria com o slug:', categorySlug);
              // Nenhuma categoria encontrada, carregar todos os equipamentos
              fetchEquipment();
            }
          } else if (params.categoryId) {
            // Se é um UUID, usamos diretamente
            fetchEquipment(params.categoryId);
          } else {
            // Sem categoria na URL, carregar todos os equipamentos
            fetchEquipment();
          }
          
          // Carregar fases de construção (independente da categoria)
          fetchConstructionPhases();
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Mesmo em caso de erro, continuar carregando outros dados
        fetchConstructionPhases();
        fetchEquipment();
      }
    };

    const fetchConstructionPhases = async () => {
      try {
        // @ts-ignore
        const { data, error } = await supabase
          .from('construction_phases')
          .select('*')
          .order('name');
        
        if (error) throw error;
        if (data) setConstructionPhases(data as unknown as ConstructionPhase[]);
      } catch (error) {
        console.error('Erro ao carregar fases de construção:', error);
      }
    };

    const fetchEquipment = async (categoryId?: string) => {
      setLoading(true);
      try {
        console.log(`Buscando equipamentos${categoryId ? ` com categoria ${categoryId}` : ''}`);
        
        let query = supabase
          .from('equipment')
          .select('*')
          .eq('available', true);
        
        // Se temos uma categoria específica, filtrar por ela na consulta
        if (categoryId) {
          console.log('Filtrando equipamentos pela categoria ID:', categoryId);
          query = query.eq('category', categoryId);
        }
        
        // @ts-ignore - Supabase tipo ignorado para equipment
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          console.log(`Equipamentos carregados${categoryId ? ' (filtrados por categoria)' : ''}:`, data.length);
          if (data.length > 0) {
            console.log('Exemplo de equipamento - categoria:', data[0].category);
            console.log('Equipamento de exemplo:', data[0].name);
          } else {
            console.log('Nenhum equipamento encontrado com os filtros aplicados');
          }
          setEquipment(data as unknown as Equipment[]);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        }
      } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    // Iniciar carregando as categorias primeiro
    fetchCategories();
  }, [params.categoryId]);

  // Ordenar equipamentos
  const sortEquipment = (equipmentList: Equipment[]) => {
    const [field, direction] = sortOrder.split('-');
    
    return [...equipmentList].sort((a, b) => {
      if (field === 'name') {
        return direction === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (field === 'price') {
        const priceA = parseFloat(a.daily_rate || '0');
        const priceB = parseFloat(b.daily_rate || '0');
        return direction === 'asc' ? priceA - priceB : priceB - priceA;
      } else if (field === 'rating') {
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;
        return direction === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      }
      return 0;
    });
  };

  // Filtrar equipamentos
  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro de categoria
    let matchesCategory = true;
    if (selectedCategory) {
      matchesCategory = (item.category === selectedCategory);
      // Apenas logar alguns equipamentos para não sobrecarregar o console
      if (Math.random() < 0.1) { // Mostrar apenas ~10% dos logs para não inundar o console
        console.log(`Equipamento: ${item.name} - Categoria: ${item.category} - Match com ${selectedCategory}: ${matchesCategory}`);
      }
    }
    
    const matchesPhase = selectedPhase ? item.construction_phase_id === selectedPhase : true;
    
    return matchesSearch && matchesCategory && matchesPhase;
  });

  // Adicionar log para debugging
  useEffect(() => {
    if (selectedCategory) {
      const categoryInfo = categories.find(cat => cat.id === selectedCategory);
      console.log(`[EquipmentPage] Categoria selecionada: ID=${selectedCategory}, Nome="${categoryInfo?.name || 'Desconhecido'}"`);
      console.log(`[EquipmentPage] Número de equipamentos filtrados: ${filteredEquipment.length}`);
    }
  }, [selectedCategory, filteredEquipment.length, categories]);

  // Ordenar e paginar equipamentos
  const sortedEquipment = sortEquipment(filteredEquipment);
  const paginatedEquipment = sortedEquipment.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // Handlers
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const newCategoryId = event.target.value;
    setSelectedCategory(newCategoryId);
    setPage(1);
    
    // Atualizar a URL com base na categoria selecionada
    if (newCategoryId) {
      // Encontrar a categoria para obter o nome
      const category = categories.find(cat => cat.id === newCategoryId);
      if (category && category.name) {
        // Criar slug do nome e navegar para a URL com o slug
        const categorySlug = createSlug(category.name);
        navigate(`/equipamentos/${categorySlug}`);
      }
    } else {
      // Se nenhuma categoria selecionada, voltar para a página de equipamentos sem filtro
      navigate('/equipamentos');
    }
  };

  const handlePhaseChange = (event: SelectChangeEvent<string>) => {
    setSelectedPhase(event.target.value);
    setPage(1);
    
    // Ao mudar a fase, mantemos a categoria na URL se estiver selecionada
    if (selectedCategory) {
      // Preservar o filtro de categoria na URL
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category && category.name) {
        const categorySlug = createSlug(category.name);
        navigate(`/equipamentos/${categorySlug}`);
      }
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
    
    // Se estiver filtrando por categoria, manter a URL da categoria
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category && category.name) {
        const categorySlug = createSlug(category.name);
        // Não atualizamos a URL para manter a categoria na URL
      }
    }
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOrder(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    console.log('Limpando todos os filtros');
    
    // Limpar todos os estados de filtro
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPhase('');
    setPage(1);
    setSortOrder('name-asc');
    
    // Não precisamos chamar fetchEquipment diretamente,
    // pois a navegação para /equipamentos vai recarregar o componente
    
    // Navegar para a URL sem filtros
    navigate('/equipamentos');
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? (category.name || '') : '';
  };

  const getPhaseName = (phaseId?: string) => {
    if (!phaseId) return '';
    const phase = constructionPhases.find(p => p.id === phaseId);
    return phase ? (phase.name || '') : '';
  };

  // Função para preparar dados para o schema da listagem de equipamentos
  const prepareEquipmentForSchema = () => {
    return equipment.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || `Aluguel de ${item.name} em Limeira e região`,
      imageUrl: item.image || '',
      url: `/equipamento/${item.id}/${createSlug(item.name)}`,
      category: getCategoryName(item.category)
    }));
  };

  // Função para gerar título da página baseado nos filtros
  const generatePageTitle = () => {
    if (selectedCategory) {
      const categoryName = getCategoryName(selectedCategory);
      return `Aluguel de ${categoryName} em Limeira e Região | Panda Locações`;
    }
    return 'Equipamentos para Locação | Aluguel em Limeira, Americana e Região | Panda Locações';
  };

  // Função para gerar descrição da página baseado nos filtros
  const generatePageDescription = () => {
    if (selectedCategory) {
      const categoryName = getCategoryName(selectedCategory);
      return `Locação de ${categoryName} em Limeira, Americana, Piracicaba e região. A Panda Locações oferece os melhores ${categoryName} para sua obra ou evento com preços justos e equipamentos de qualidade.`;
    }
    return 'Aluguel de equipamentos para construção civil e industrial em Limeira e região. Compactadores, betoneiras, andaimes, geradores e muito mais com os melhores preços e qualidade.';
  };

  // Gerar schema para a página de categorias
  const generateCategoriesSchema = () => {
    // Função para criar URLs de forma segura
    const createSafeUrl = (name: string) => {
      return encodeURIComponent(
        name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim()
      );
    };
    
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'itemListElement': paginatedEquipment.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Product',
          'name': item.name,
          'url': `https://seusite.com.br/alugar/${createSafeUrl(item.name)}`,
          'image': item.image,
          ...(item.daily_rate && {
            'offers': {
              '@type': 'Offer',
              'price': typeof item.daily_rate === 'string' ? item.daily_rate.replace(/[^\d.,]/g, '') : String(item.daily_rate),
              'priceCurrency': 'BRL',
              'availability': 'https://schema.org/InStock'
            }
          })
        }
      }))
    };
  };
  
  // Gerar schema para organização
  const generateOrganizationSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
                          'name': 'NOME DA EMPRESA',      'url': 'https://seusite.com.br',      'logo': 'https://seusite.com.br/logo.png',
              'description': 'Locação de equipamentos leves para construção civil e indústria. Projetos mecânicos, laudos e responsabilidade técnica.',        'address': {          '@type': 'PostalAddress',          'streetAddress': 'Endereço da Empresa, Número',          'addressLocality': 'Cidade',          'addressRegion': 'UF',          'postalCode': '00000-000',          'addressCountry': 'BR'        },
              'contactPoint': {          '@type': 'ContactPoint',          'telephone': '+55-00-0000-0000',          'contactType': 'customer service'        }
    };
  };

  // Schema combinado para a página
  const combinedSchema = [generateCategoriesSchema(), generateOrganizationSchema()];

  return (
    <>
      <Helmet>
        <title>{generatePageTitle()}</title>
        <meta name="description" content={generatePageDescription()} />
        <meta name="keywords" content={`aluguel de equipamentos, locação de máquinas, ${selectedCategory ? getCategoryName(selectedCategory) + ',' : ''} Limeira, Americana, Piracicaba, construção civil, betoneira, compactador, andaimes`} />
        <link rel="canonical" href={`https://pandalocacoes.com.br/equipamentos${selectedCategory ? `/${createSlug(getCategoryName(selectedCategory))}` : ''}`} />
        
        {/* Meta tags para redes sociais */}
        <meta property="og:title" content={generatePageTitle()} />
        <meta property="og:description" content={generatePageDescription()} />
        <meta property="og:url" content={`https://pandalocacoes.com.br/equipamentos${selectedCategory ? `/${createSlug(getCategoryName(selectedCategory))}` : ''}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://pandalocacoes.com.br/images/Logo Panda.png" />
        
        {/* Meta tags Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={generatePageTitle()} />
        <meta name="twitter:description" content={generatePageDescription()} />
        <meta name="twitter:image" content="https://pandalocacoes.com.br/images/Logo Panda.png" />
      </Helmet>
      
      {/* Schema.org para listagem de equipamentos */}
      <EquipmentListSchema 
        equipmentList={prepareEquipmentForSchema()}
        title={generatePageTitle()}
        description={generatePageDescription()}
        currentCategory={selectedCategory ? getCategoryName(selectedCategory) : undefined}
      />

      <main>
        {/* Cabeçalho da Página */}
        <Box 
          sx={{ 
            bgcolor: 'background.paper', 
            py: { xs: 4, md: 6 },
            position: 'relative'
          }}
        >
          <Container maxWidth="xl" sx={{ py: 4, mt: 1 }}>
            {/* Cabeçalho */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Equipamentos para Locação
              </Typography>
              <Divider sx={{ maxWidth: 100, borderColor: 'primary.main', borderWidth: 2, mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Encontre o equipamento ideal para sua obra
              </Typography>
            </Box>

            {/* Barra de pesquisa e controles */}
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 3, 
                display: { xs: 'none', sm: 'flex' }, 
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(20px)'
              }}
            >
              <TextField
                placeholder="Buscar equipamentos..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: '200px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="sort-order-label">Ordenar por</InputLabel>
                  <Select
                    labelId="sort-order-label"
                    id="sort-order"
                    value={sortOrder}
                    onChange={handleSortChange}
                    label="Ordenar por"
                  >
                    <MenuItem value="name-asc">Nome (A-Z)</MenuItem>
                    <MenuItem value="name-desc">Nome (Z-A)</MenuItem>
                    <MenuItem value="price-asc">Preço (menor-maior)</MenuItem>
                    <MenuItem value="price-desc">Preço (maior-menor)</MenuItem>
                    <MenuItem value="rating-desc">Melhor avaliação</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                  <IconButton 
                    color={viewMode === 'grid' ? 'primary' : 'default'} 
                    onClick={() => setViewMode('grid')}
                    size="small"
                  >
                    <GridView />
                  </IconButton>
                  <IconButton 
                    color={viewMode === 'list' ? 'primary' : 'default'} 
                    onClick={() => setViewMode('list')}
                    size="small"
                  >
                    <ViewList />
                  </IconButton>
                </Box>
                
                <Button 
                  variant={showFilters ? "contained" : "outlined"}
                  color="primary"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                  size="small"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Filtros
                </Button>
              </Box>
            </Paper>

            {/* Filtros integrados */}
            <FilterPanel 
              showFilters={showFilters && !isMobile}
              filters={[
                {
                  id: 'category-select',
                  label: 'Categoria',
                  value: selectedCategory,
                  items: categories,
                  onChange: handleCategoryChange
                },
                {
                  id: 'phase-select',
                  label: 'Fase da Obra',
                  value: selectedPhase,
                  items: constructionPhases,
                  onChange: handlePhaseChange
                }
              ]}
            />

            {/* Chips de filtros ativos */}
            {(selectedCategory || selectedPhase) && !isMobile && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Filtros ativos:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {selectedCategory && (
                    <Chip 
                      label={`Categoria: ${getCategoryName(selectedCategory)}`}
                      onDelete={() => {
                        setSelectedCategory('');
                        // Atualizar URL ao remover o filtro de categoria
                        navigate('/equipamentos');
                      }}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}
                  
                  {selectedPhase && (
                    <Chip 
                      label={`Fase: ${getPhaseName(selectedPhase)}`}
                      onDelete={() => setSelectedPhase('')}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}
                  
                  <Button 
                    size="small" 
                    onClick={clearFilters}
                    sx={{ mb: 1 }}
                  >
                    Limpar todos
                  </Button>
                </Stack>
              </Box>
            )}

            <Grid container spacing={3} sx={{ pb: { xs: 10, sm: 0 } }}>
              {/* Lista de equipamentos (agora ocupa toda a largura) */}
              <Grid item xs={12}>
                {loading ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Skeleton variant="text" width="200px" height={24} />
                    </Box>
                    
                    <Grid container spacing={3}>
                      {Array.from(new Array(6)).map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                          {/* @ts-ignore */}
                          <EquipmentCard loading={true} equipment={{} as Equipment} />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                ) : filteredEquipment.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Nenhum equipamento encontrado
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Tente ajustar seus filtros ou faça uma nova busca
                    </Typography>
                    <Button variant="contained" color="primary" onClick={clearFilters}>
                      Limpar Filtros
                    </Button>
                  </Paper>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Mostrando {filteredEquipment.length} equipamentos
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={3}>
                      {paginatedEquipment.map((item) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={viewMode === 'list' ? 12 : 6} 
                          md={viewMode === 'list' ? 12 : 4} 
                          lg={viewMode === 'list' ? 12 : 3} 
                          key={item.id}
                        >
                          <EquipmentCard 
                            // @ts-ignore - Propriedades compatíveis com o componente
                            equipment={item} 
                            categoryName={getCategoryName(item.category)}
                            constructionPhaseName={getPhaseName(item.construction_phase_id)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    
                    {/* Paginação */}
                    {totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                        <Pagination 
                          count={Math.ceil(filteredEquipment.length / itemsPerPage)} 
                          page={page} 
                          onChange={handlePageChange}
                          color="primary"
                          size={isMobile ? 'small' : 'medium'}
                          showFirstButton
                          showLastButton
                        />
                      </Box>
                    )}
                  </>
                )}
              </Grid>
            </Grid>
          </Container>

          {/* Filtros flutuantes para mobile */}
          <EquipmentFiltersFloating 
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedPhase={selectedPhase}
            categories={categories}
            constructionPhases={constructionPhases}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onPhaseChange={handlePhaseChange}
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            onClearFilters={clearFilters}
          />
        </Box>
      </main>
    </>
  );
};

export default EquipmentPage; 