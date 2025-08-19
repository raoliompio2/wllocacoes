import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
// Removendo a importação do FilterPanel que não está sendo usada corretamente
// import FilterPanel from '../common/FilterPanel';
import EquipmentListSchema from '../SEO/EquipmentListSchema';
import EquipmentCategorySchema from '../SEO/EquipmentCategorySchema';
import { fuzzySearch, sortByRelevance, correctCommonTypos, normalizeText } from '../../utils/searchUtils';

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
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
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

  // Função de pesquisa - definida como useCallback para evitar problemas
  const handleSearch = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    // Resetar página quando fizer uma nova pesquisa
    setPage(1);
    
    // Atualizar URL com parâmetros de pesquisa
    const queryParams = new URLSearchParams();
    
    if (searchTerm) {
      queryParams.set('q', searchTerm);
    }
    
    if (selectedCategory) {
      queryParams.set('categoria', selectedCategory);
    }
    
    if (selectedPhase) {
      queryParams.set('fase', selectedPhase);
    }
    
    const queryString = queryParams.toString();
    navigate({
      pathname: '/equipamentos',
      search: queryString ? `?${queryString}` : ''
    });
  }, [searchTerm, selectedCategory, selectedPhase, navigate]);

  // Obter parâmetros da URL
  useEffect(() => {
    // Verificar primeiro se temos categoryId do parâmetro da rota
    if (params.categoryId) {
      // Verificar se o parâmetro é um UUID (ID) ou um slug de nome
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.categoryId);
      
      if (isUUID) {
        // Se for um UUID, usa diretamente
        setSelectedCategory(params.categoryId);
      } else {
        // Se for um slug, armazenamos para resolvê-lo depois de carregar as categorias
        // Não definimos o selectedCategory aqui, será definido depois que 
        // carregarmos as categorias do banco
      }
      
      setShowFilters(true);
    } else {
      // Se não tiver na rota, verificar nos parâmetros de consulta
      const searchParams = new URLSearchParams(location.search);
      const categoryParam = searchParams.get('categoria') || searchParams.get('category');
      if (categoryParam) {
        setSelectedCategory(categoryParam);
        setShowFilters(true);
      }
    }
    
    // Verificar se há outros parâmetros que você queira usar
    const searchParams = new URLSearchParams(location.search);
    const phaseParam = searchParams.get('fase') || searchParams.get('phase');
    if (phaseParam) {
      setSelectedPhase(phaseParam);
    }
    
    // Buscar o termo de pesquisa no parâmetro 'q' (usado por ambos SearchBar e MobileSearchBar)
    const searchParam = searchParams.get('q') || searchParams.get('busca') || searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
      
      // Verificar se há correção para o termo
      const correctedTerm = correctCommonTypos(searchParam);
      if (correctedTerm !== searchParam && normalizeText(correctedTerm) !== normalizeText(searchParam)) {
        // Remover console.log
      }
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
          setCategories(data as unknown as Category[]);
          
          // Se temos um categoryId que não é UUID, tentamos encontrar a categoria correspondente
          if (params.categoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.categoryId)) {
            const categorySlug = params.categoryId;
            
            // Encontra a categoria correspondente ao slug
            const category = data.find(cat => {
              const catSlug = createSlug(cat.name || '');
              return catSlug === categorySlug;
            });
            
            if (category) {
              setSelectedCategory(category.id);
              
              // Agora podemos buscar equipamentos filtrados por esta categoria
              fetchEquipment(category.id);
            } else {
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
        // Obter o termo de busca da URL
        const searchParams = new URLSearchParams(location.search);
        const searchTerm = searchParams.get('q') || searchParams.get('busca') || '';
        const phaseParam = searchParams.get('fase') || searchParams.get('phase');
        
        let data, error;
        
        // Se temos um termo de busca, usar a função de busca com correção de erros
        if (searchTerm) {
          const result = await supabase.rpc('search_equipment_simple', {
            search_term: searchTerm,
            category_id: categoryId || '',
            phase_id: phaseParam || ''
          });
          data = result.data;
          error = result.error;
          
          // Atualizar o termo de pesquisa na interface
          if (searchTerm) {
            setSearchTerm(searchTerm);
          }
        } else {
          // Busca normal sem termo de pesquisa
          let query = supabase
            .from('equipment')
            .select('*')
            .eq('available', true);
          
          // Se temos uma categoria específica, filtrar por ela na consulta
          if (categoryId) {
            query = query.eq('category', categoryId);
          }
          
          // Se temos uma fase de obra específica, filtrar por ela também
          if (phaseParam) {
            query = query.eq('construction_phase_id', phaseParam);
            setSelectedPhase(phaseParam);
          }
          
          // @ts-ignore - Supabase tipo ignorado para equipment
          const result = await query;
          data = result.data;
          error = result.error;
        }
        
        if (error) throw error;
        
        if (data) {
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
  }, [params.categoryId, location.search]);

  // Ordenar equipamentos
  const sortEquipment = useCallback((equipmentList: Equipment[]) => {
    const [field, direction] = sortOrder.split('-');
    
    // Se tiver termo de busca, ordenar por relevância primeiro
    if (searchTerm) {
      // Usar função de ordenação por relevância
      const relevanceSorted = sortByRelevance(
        equipmentList, 
        searchTerm,
        ['name', 'description']
      );
      
      // Aplicar ordenação secundária se necessário
      if (field !== 'relevance') {
        return relevanceSorted;
      }
    }
    
    // Ordenação padrão
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
  }, [searchTerm, sortOrder]);

  // Filtrar equipamentos usando pesquisa avançada fuzzy
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      // Verificar se o termo de busca corresponde ao equipamento usando busca fuzzy
      const matchesSearch = !searchTerm || fuzzySearch(
        item, 
        searchTerm, 
        ['name', 'description']
      );
      
      // Filtro de categoria
      let matchesCategory = true;
      if (selectedCategory) {
        matchesCategory = (item.category === selectedCategory);
      }
      
      const matchesPhase = selectedPhase ? item.construction_phase_id === selectedPhase : true;
      
      return matchesSearch && matchesCategory && matchesPhase;
    });
  }, [equipment, searchTerm, selectedCategory, selectedPhase]);
  
  // Criar uma função para recarregar os equipamentos quando necessário
  const reloadEquipments = useCallback(async () => {
    setLoading(true);
    
    try {
      // Ler os parâmetros da URL para garantir valores atualizados
      const searchParams = new URLSearchParams(location.search);
      const searchTerm = searchParams.get('q') || '';
      const categoryId = selectedCategory || '';
      const phaseId = selectedPhase || '';
      
      // Usar a função search_equipment_simple que criamos no banco de dados
      let result = await supabase.rpc('search_equipment_simple', {
        search_term: searchTerm,
        category_id: categoryId,
        phase_id: phaseId
      });
      
      if (result.error) {
        console.error('Erro ao recarregar equipamentos:', result.error);
        // Fallback para busca simples em caso de erro
        result = await supabase.from('equipment').select('*').eq('available', true);
      }
      
      if (result.data) {
        setEquipment(result.data as unknown as Equipment[]);
        setTotalPages(Math.ceil(result.data.length / itemsPerPage));
      }
    } catch (error) {
      console.error('Erro fatal ao recarregar:', error);
    } finally {
      setLoading(false);
    }
  }, [location.search, selectedCategory, selectedPhase]);
  
  // Garantir que a pesquisa funcione quando vem direto do Hero com parâmetro 'q'
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchParam = searchParams.get('q');
    
    // Se temos um termo de busca na URL e não temos resultados, tentar fazer a busca novamente
    if (searchParam && equipment.length === 0 && !loading) {
      // Pequeno atraso para garantir que todos os estados estejam atualizados
      const timer = setTimeout(() => {
        reloadEquipments();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [location.search, equipment.length, loading, reloadEquipments]);

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

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const inputTerm = event.target.value;
    
    // Verificar se o termo tem correção de erro comum
    const correctedTerm = correctCommonTypos(inputTerm);
    
    // Se encontrou uma correção e não é muito diferente
    if (correctedTerm !== inputTerm && normalizeText(correctedTerm) !== normalizeText(inputTerm)) {
      // Remover console.log
    }
    
    // Sempre usar o termo original do usuário para manter a experiência natural
    setSearchTerm(inputTerm);
    setPage(1);
    
    // Atualizar a URL com o termo de pesquisa
    const searchParams = new URLSearchParams(location.search);
    
    if (inputTerm) {
      searchParams.set('q', inputTerm);
    } else {
      searchParams.delete('q');
    }
    
    // Preservar outros parâmetros
    if (selectedCategory) {
      searchParams.set('categoria', selectedCategory);
    }
    
    if (selectedPhase) {
      searchParams.set('fase', selectedPhase);
    }
    
    // Atualizar URL sem recarregar a página
    const newUrl = `${location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [location.pathname, location.search, selectedCategory, selectedPhase]);

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
    return paginatedEquipment.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || `Aluguel de ${item.name} para sua obra ou evento`,
      imageUrl: item.image || '',
      url: `/equipamento/${item.id}/${createSlug(item.name)}`,
      category: getCategoryName(item.category)
    }));
  };

  // Função para gerar título da página baseado nos filtros
  const generatePageTitle = () => {
    if (selectedCategory) {
      const categoryName = getCategoryName(selectedCategory);
      return `Aluguel de ${categoryName} | WL Locações`;
    }
    return 'Equipamentos para Locação | Aluguel de Equipamentos | WL Locações';
  };

  // Função para gerar descrição da página baseado nos filtros
  const generatePageDescription = () => {
    if (selectedCategory) {
      const categoryName = getCategoryName(selectedCategory);
      return `Locação de ${categoryName} para sua obra ou evento em Ponta Porã e região. A WL Locações oferece os melhores ${categoryName} com preços justos e equipamentos de qualidade.`;
    }
    return 'Aluguel de equipamentos para construção civil e industrial em Ponta Porã e região. Compactadores, betoneiras, andaimes, geradores e muito mais com os melhores preços e qualidade.';
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
          }),
          'description': item.description || `Aluguel de ${item.name} para sua obra ou evento`
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

  // Função para atualizar a URL com parâmetros de filtro
  const updateUrlWithFilters = useCallback(() => {
    const searchParams = new URLSearchParams();
    
    if (searchTerm) searchParams.set('q', searchTerm);
    if (selectedCategory && !params.categoryId) searchParams.set('categoria', selectedCategory);
    if (selectedPhase) searchParams.set('fase', selectedPhase);
    
    const queryString = searchParams.toString();
    
    // Atualizar a URL do navegador sem recarregar a página
    const newUrl = queryString ? 
      `${window.location.pathname}?${queryString}` : 
      window.location.pathname;
      
    window.history.replaceState(null, '', newUrl);
  }, [searchTerm, selectedCategory, selectedPhase, params.categoryId]);
  
  // Atualizar URL quando os filtros mudam
  useEffect(() => {
    updateUrlWithFilters();
  }, [updateUrlWithFilters]);

  // Renderizar página
  return (
    <>
      <SEOHead
        title={generatePageTitle()}
        description={generatePageDescription()}
        canonicalUrl={`${window.location.origin}${window.location.pathname}`}
      />
      
      {/* Esquema estruturado para página de listagem de equipamentos */}
      {selectedCategory && (
        <EquipmentCategorySchema 
          categoryName={getCategoryName(selectedCategory)} 
          categoryId={selectedCategory}
          categoryDescription={`Aluguel de ${getCategoryName(selectedCategory).toLowerCase()} em Ponta Porã e região. Equipamentos de alta qualidade com preços justos e entrega em toda região.`}
          equipmentCount={filteredEquipment.length}
        />
      )}
      
      {!selectedCategory && (
        <EquipmentListSchema
          equipmentList={filteredEquipment.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            imageUrl: item.image || '',
            url: `/equipamento/${createSlug(item.name)}`,
            category: getCategoryName(item.category)
          }))}
          title={generatePageTitle()}
          description={generatePageDescription()}
          currentCategory={selectedCategory ? getCategoryName(selectedCategory) : undefined}
        />
      )}

      {/* Conteúdo principal */}
      <Container maxWidth="xl" sx={{ pt: 2, pb: 8 }}>
        {/* Cabeçalho da Página */}
        <Box 
          sx={{
            backgroundImage: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.7)}, ${alpha(theme.palette.primary.dark, 0.8)})`,
            borderRadius: 2,
            color: 'white',
            mb: 4,
            py: 4,
            px: 2
          }}
        >
          {/* Cabeçalho */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              align="center" 
              gutterBottom
            >
              {selectedCategory 
                ? `${getCategoryName(selectedCategory)} para Locação` 
                : searchTerm 
                  ? `Resultados para "${searchTerm}"` 
                  : 'Todos os Equipamentos'
              }
            </Typography>
            
            {selectedCategory && (
              <Typography 
                variant="body1" 
                align="center"
                sx={{ 
                  maxWidth: 800, 
                  mx: 'auto',
                  opacity: 0.9
                }}
              >
                Aluguel de {getCategoryName(selectedCategory).toLowerCase()} em Ponta Porã e região. 
                Equipamentos de alta qualidade com os melhores preços do mercado.
              </Typography>
            )}

            {!selectedCategory && !searchTerm && (
              <Typography 
                variant="body1" 
                align="center"
                sx={{ 
                  maxWidth: 800, 
                  mx: 'auto',
                  opacity: 0.9
                }}
              >
                Conheça nossa ampla variedade de equipamentos para aluguel. Temos as melhores opções para sua obra com preços justos e entrega em toda região.
              </Typography>
            )}
          </Box>

          {/* Barra de pesquisa */}
          <Box 
            component="form" 
            onSubmit={handleSearch}
            sx={{ 
              display: 'flex', 
              width: '100%', 
              maxWidth: 600, 
              mx: 'auto',
              mb: 2
            }}
          >
            <TextField
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar equipamentos..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                sx: {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  }
                }
              }}
              sx={{
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                  opacity: 1,
                },
              }}
            />
            <Button 
              type="submit"
              variant="contained"
              color="primary"
              sx={{ ml: 1, px: 3, borderRadius: 2 }}
            >
              Buscar
            </Button>
          </Box>
        </Box>
            
        {/* Container dos filtros e resultados */}
        <Grid container spacing={3}>
          {/* Coluna de filtros */}
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper
              sx={{ 
                p: 3, 
                borderRadius: 2,
                position: 'sticky',
                top: 100, // Compensar a altura do header + um espaço extra
                maxHeight: 'calc(100vh - 120px)', // Ajustado para considerar o header
                overflowY: 'auto',
                zIndex: 10 // Garantir que fique acima de outros elementos
              }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>Filtros</Typography>
              
              {/* Filtro por categoria */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="category-filter-label">Categoria</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    id="category-filter"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    label="Categoria"
                  >
                    <MenuItem value="">Todas as Categorias</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Filtro por fase de construção */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="phase-filter-label">Fase de Construção</InputLabel>
                  <Select
                    labelId="phase-filter-label"
                    id="phase-filter"
                    value={selectedPhase}
                    onChange={handlePhaseChange}
                    label="Fase de Construção"
                  >
                    <MenuItem value="">Todas as Fases</MenuItem>
                    {constructionPhases.map((phase) => (
                      <MenuItem key={phase.id} value={phase.id}>
                        {phase.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Button 
                variant="outlined"
                fullWidth
                onClick={clearFilters}
                sx={{ mt: 1 }}
              >
                Limpar Filtros
              </Button>
            </Paper>
          </Grid>
          
          {/* Coluna principal com resultados */}
          <Grid item xs={12} md={9}>
            {/* Cabeçalho da seção de resultados */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              {/* Contador de resultados */}
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
                {loading ? (
                  <Skeleton width={150} />
                ) : (
                  `${filteredEquipment.length} equipamento${filteredEquipment.length === 1 ? '' : 's'} encontrado${filteredEquipment.length === 1 ? '' : 's'}`
                )}
              </Typography>
              
              {/* Controles de visualização e ordenação */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Botão para mostrar filtros em mobile */}
                <IconButton 
                  color="primary" 
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="Mostrar filtros"
                >
                  <FilterList />
                </IconButton>
                
                {/* Ordenação */}
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="sort-order-label">Ordenar por</InputLabel>
                  <Select
                    labelId="sort-order-label"
                    id="sort-order"
                    value={sortOrder}
                    onChange={handleSortChange}
                    label="Ordenar por"
                    startAdornment={<Sort sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    <MenuItem value="name-asc">Nome (A-Z)</MenuItem>
                    <MenuItem value="name-desc">Nome (Z-A)</MenuItem>
                    <MenuItem value="price-asc">Preço (menor-maior)</MenuItem>
                    <MenuItem value="price-desc">Preço (maior-menor)</MenuItem>
                    {searchTerm && <MenuItem value="relevance">Relevância</MenuItem>}
                  </Select>
                </FormControl>
                
                {/* Alternador de visão: grade ou lista */}
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
                  <IconButton 
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                    onClick={() => setViewMode('grid')}
                    aria-label="Visualização em grade"
                    size="small"
                  >
                    <GridView />
                  </IconButton>
                  <IconButton 
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewMode('list')}
                    aria-label="Visualização em lista"
                    size="small"
                  >
                    <ViewList />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            
            {/* Drawer de filtros para mobile */}
            <Drawer
              anchor="bottom"
              open={showFilters && isMobile}
              onClose={() => setShowFilters(false)}
              PaperProps={{
                sx: { 
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  pb: 2
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h3">Filtros</Typography>
                  <IconButton onClick={() => setShowFilters(false)}>
                    <Close />
                  </IconButton>
                </Box>
                
                {/* Filtros Mobile */}
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel id="mobile-category-filter-label">Categoria</InputLabel>
                    <Select
                      labelId="mobile-category-filter-label"
                      id="mobile-category-filter"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      label="Categoria"
                    >
                      <MenuItem value="">Todas as Categorias</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={`mobile-${category.id}`} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel id="mobile-phase-filter-label">Fase de Construção</InputLabel>
                    <Select
                      labelId="mobile-phase-filter-label"
                      id="mobile-phase-filter"
                      value={selectedPhase}
                      onChange={handlePhaseChange}
                      label="Fase de Construção"
                    >
                      <MenuItem value="">Todas as Fases</MenuItem>
                      {constructionPhases.map((phase) => (
                        <MenuItem key={`mobile-${phase.id}`} value={phase.id}>
                          {phase.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Button 
                  variant="contained"
                  fullWidth
                  onClick={() => setShowFilters(false)}
                >
                  Aplicar Filtros
                </Button>
                
                <Button 
                  variant="outlined"
                  fullWidth
                  onClick={clearFilters}
                  sx={{ mt: 1 }}
                >
                  Limpar Filtros
                </Button>
              </Box>
            </Drawer>
            
            {/* Resultados */}
            {loading ? (
              // Esqueletos de carregamento
              <Grid container spacing={viewMode === 'grid' ? 3 : 2}>
                {Array.from(new Array(6)).map((_, index) => (
                  <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={index}>
                    <Skeleton variant="rectangular" width="100%" height={viewMode === 'grid' ? 200 : 160} sx={{ borderRadius: 2 }} />
                    <Box sx={{ pt: 1 }}>
                      <Skeleton width="60%" height={28} />
                      <Skeleton width="40%" height={20} />
                      <Skeleton width="20%" height={20} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              // Resultados reais
              filteredEquipment.length > 0 ? (
                <>
                  <Grid container spacing={viewMode === 'grid' ? 3 : 2}>
                    {paginatedEquipment.map((item) => (
                      <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={item.id}>
                        <EquipmentCard 
                          equipment={{
                            id: item.id,
                            name: item.name,
                            image: item.image || '', // Garantindo que image seja sempre string, nunca null
                            category: item.category,
                            daily_rate: item.daily_rate || '',
                            description: item.description || '',
                            available: item.available,
                            average_rating: item.average_rating,
                            total_reviews: item.total_reviews,
                            construction_phase_id: item.construction_phase_id,
                          }}
                          categoryName={getCategoryName(item.category)} 
                          loading={false}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Paginação */}
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={handlePageChange} 
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Box>
                  )}
                </>
              ) : (
                // Mensagem de nenhum resultado
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: 'background.paper' 
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Nenhum equipamento encontrado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Não encontramos equipamentos com os filtros selecionados. Tente outras opções de busca.
                  </Typography>
                  <Button variant="outlined" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                </Paper>
              )
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default EquipmentPage;