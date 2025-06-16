import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogContent,
  Alert,
  Rating,
  Tooltip,
  styled,
  Skeleton,
  Snackbar,
  alpha,
  TextField,
  InputAdornment,
  DialogTitle,
  DialogActions,
  Fab,
  AlertTitle
} from '@mui/material';
import {
  Star,
  CalendarMonth,
  LocalShipping,
  Construction,
  Share,
  ArrowBack,
  Close,
  WhatsApp,
  Info,
  ExpandMore,
  FileCopy,
  BookmarkBorder,
  Bolt,
  FavoriteBorder,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  Check,
  Dashboard
} from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';
import EquipmentCard from './EquipmentCard';
import { useAuth } from '../../context/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CalendarIcon } from 'lucide-react';
import SEOHead from '../SEO/SEOHead';
import ProductSchema from '../SEO/ProductSchema';
import * as stringSimilarityLib from 'string-similarity';
import { sendBudgetRequestEmail } from '../../utils/emailService';

// Número fixo do WhatsApp para redirecionamento
const WHATSAPP_NUMBER = '551937030363';

// Interfaces
interface Equipment {
  id: string;
  name: string;
  image: string;
  category: string;
  daily_rate: string;
  weekly_rate: string;
  monthly_rate: string;
  description: string;
  specifications: Record<string, any>;
  technical_specs?: Record<string, any>;
  available: boolean;
  average_rating?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
  construction_phase_id?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface ConstructionPhase {
  id: string;
  name: string;
  description?: string;
}

interface RelatedEquipment {
  id: string;
  name: string;
  image: string;
  daily_rate: string;
  category: string;
  available?: boolean;
  construction_phase_id?: string;
}

interface Accessory {
  id: string;
  name: string;
  description: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componentes estilizados
const StyledImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  cursor: 'pointer',
  '&:hover .zoom-overlay': {
    opacity: 1,
  },
}));

const ZoomOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.3)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  color: '#fff',
}));

const PriceCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.light, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
}));

// Botão fixo para dispositivos móveis
const MobileFixedButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'calc(100% - 32px)',
  zIndex: 10,
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  padding: theme.spacing(1.5),
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
}));

// Componente TabPanel para as abas
function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`equipment-tabpanel-${index}`}
      aria-labelledby={`equipment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>{children}</Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `equipment-tab-${index}`,
    'aria-controls': `equipment-tabpanel-${index}`,
  };
}

const EquipmentDetailPage: React.FC = () => {
  const { id, slug } = useParams<{ id?: string, slug?: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  // Estados
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [constructionPhase, setConstructionPhase] = useState<ConstructionPhase | null>(null);
  const [relatedEquipment, setRelatedEquipment] = useState<RelatedEquipment[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
  
  // Estados do formulário de orçamento
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  // Estado para o diálogo de sucesso após envio do orçamento
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [ownerWhatsApp, setOwnerWhatsApp] = useState<string | null>(null);
  const [budgetRequestId, setBudgetRequestId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      // Determine if we're using slug or id
      const isSlugRoute = window.location.pathname.includes('/equipamento/') || 
                           window.location.pathname.includes('/alugar/') || 
                           window.location.pathname.includes('/aluguel/');
      
      // If we're on a slug route, treat param as slug even if it came through as id
      const paramSlug = slug || (isSlugRoute ? id : null);
      const paramId = isSlugRoute ? null : id;
      
      if (!paramId && !paramSlug) {
        setError('ID ou nome do equipamento não fornecido');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let equipmentData;

        if (paramSlug) {
          // Buscar por slug (nome)
          const decodedSlug = decodeURIComponent(paramSlug);
          // Converter todos os caracteres especiais e hífens para espaço, melhorando a busca
          const normalizedSlug = decodedSlug
            .replace(/-/g, ' ')  // Converte hífen para espaço
            .replace(/\//g, ' '); // Converte barra para espaço
          
          console.log(`Buscando equipamento: slug original="${paramSlug}", decodificado="${decodedSlug}", normalizado="${normalizedSlug}"`);
          
          // Usar %ILIKE% para uma correspondência mais flexível
          const { data, error } = await supabase
            .from('equipment')
            .select('*')
            .ilike('name', `%${normalizedSlug}%`) // Busca parcial para melhorar resultados
            .limit(1);

          if (error) throw error;
          if (!data || data.length === 0) {
            // Se não encontrar com correspondência parcial, tentar busca mais específica
            console.log(`Equipamento não encontrado com slug normalizado. Tentando busca alternativa com nome exato.`);
            
            // Tentar outra abordagem, removendo todos caracteres especiais e buscando por similaridade
            const cleanSlug = decodedSlug
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Remove acentos
              .replace(/[^\w\s]/g, ' ') // Remove caracteres especiais
              .replace(/\s+/g, ' ')     // Substitui múltiplos espaços por um
              .trim();
            
            console.log(`Tentando busca alternativa: "${cleanSlug}"`);
            
            const { data: altData, error: altError } = await supabase
              .from('equipment')
              .select('*')
              .order('name')
              .limit(10);
              
            if (!altError && altData && altData.length > 0) {
              // Encontrar o equipamento com nome mais similar
              const bestMatch = altData.reduce((best, equip) => {
                const currentSimilarity = stringSimilarityLib.compareTwoStrings(equip.name.toLowerCase(), decodedSlug.toLowerCase());
                const bestSimilarity = best ? stringSimilarityLib.compareTwoStrings(best.name.toLowerCase(), decodedSlug.toLowerCase()) : -1;
                
                return currentSimilarity > bestSimilarity ? equip : best;
              }, null);
              
              if (bestMatch) {
                console.log(`Melhor correspondência encontrada: "${bestMatch.name}" (similaridade aproximada)`);
                equipmentData = bestMatch;
              } else {
                setError('Equipamento não encontrado. Verifique se o nome está correto.');
                setLoading(false);
                return;
              }
            } else {
              setError('Equipamento não encontrado. Verifique se o nome está correto.');
              setLoading(false);
              return;
            }
          } else {
            equipmentData = data[0];
          }
        } else {
          // Buscar por ID
          const { data, error } = await supabase
            .from('equipment')
            .select('*')
            .eq('id', paramId);
          
          if (error) {
            console.error('Erro na consulta:', error);
            throw new Error('Erro ao buscar equipamento do banco de dados');
          }
          
          if (!data || data.length === 0) {
            setError('Equipamento não encontrado. O ID fornecido pode ser inválido ou o equipamento foi removido.');
            setLoading(false);
            return;
          }
          
          equipmentData = data[0];
        }

        if (equipmentData) {
          setEquipment(equipmentData);

          // Buscar detalhes da categoria
          if (equipmentData.category) {
            const { data: categoryData, error: categoryError } = await supabase
              .from('categories')
              .select('*')
              .eq('id', equipmentData.category)
              .single();

            if (!categoryError && categoryData) {
              setCategory(categoryData);
            }
          }

          // Buscar fase de construção se existir
          if (equipmentData.construction_phase_id) {
            const { data: phaseData, error: phaseError } = await supabase
              .from('construction_phases')
              .select('*')
              .eq('id', equipmentData.construction_phase_id)
              .single();

            if (!phaseError && phaseData) {
              setConstructionPhase(phaseData);
            }
          }

          // Buscar equipamentos relacionados (mesma categoria)
          const { data: relatedData, error: relatedError } = await supabase
            .from('equipment')
            .select('id, name, image, daily_rate, category, available, construction_phase_id')
            .eq('category', equipmentData.category)
            .neq('id', equipmentData.id)
            .eq('available', true)
            .limit(4);

          if (!relatedError && relatedData) {
            setRelatedEquipment(relatedData);
          }

          // Buscar acessórios disponíveis para este equipamento
          const { data: accessoriesData, error: accessoriesError } = await supabase
            .from('equipment_accessories')
            .select(`
              accessory_id,
              accessories (id, name, description)
            `)
            .eq('equipment_id', equipmentData.id);

          if (!accessoriesError && accessoriesData) {
            const formattedAccessories = accessoriesData.map(item => ({
              id: (item.accessories as any).id,
              name: (item.accessories as any).name,
              description: (item.accessories as any).description
            }));
            setAccessories(formattedAccessories);
          }
        }
      } catch (error: any) {
        console.error('Erro ao buscar detalhes do equipamento:', error);
        
        // Registrar informações adicionais para depuração
        if (paramId) {
          console.log(`Falha ao buscar equipamento com ID: ${paramId}`);
        } else if (paramSlug) {
          console.log(`Falha ao buscar equipamento com slug: ${paramSlug}`);
        }
        
        // Verificar se há conexão com o Supabase
        supabase.from('categories').select('id').limit(1)
          .then(({ data, error: testError }) => {
            if (testError) {
              console.error('Possível problema de conexão com o Supabase:', testError);
              setError('Erro de conexão com o banco de dados. Por favor, tente novamente mais tarde.');
            } else {
              setError(error.message || 'Erro ao carregar os detalhes do equipamento');
            }
          });
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentDetails();
  }, [id, slug, window.location.pathname]);

  // Carregar dados do usuário autenticado quando abrir o diálogo
  useEffect(() => {
    const loadUserData = async () => {
      if (contactDialogOpen && user) {
        try {
          setFormLoading(true);
          
          // Preencher nome e email a partir do usuário autenticado
          setName(user.user_metadata?.name || '');
          setEmail(user.email || '');
          
          // Buscar o telefone do perfil
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('phone, name')
            .eq('id', user.id)
            .single();
            
          if (!profileError && profileData) {
            setWhatsapp(profileData.phone || '');
            if (!user.user_metadata?.name && profileData.name) {
              setName(profileData.name);
            }
          }
        } catch (err) {
          console.error('Erro ao carregar dados do usuário:', err);
        } finally {
          setFormLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [contactDialogOpen, user]);

  // Verificar se o usuário já existe quando o email for alterado
  useEffect(() => {
    const checkUserExists = async () => {
      if (!email || user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
          
        if (!error && data) {
          setUserExists(true);
        } else {
          setUserExists(false);
        }
      } catch (err) {
        console.error('Erro ao verificar usuário:', err);
        setUserExists(false);
      }
    };
    
    if (email) {
      checkUserExists();
    }
  }, [email, user]);

  // Handlers para as tabs
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatPrice = (price: string) => {
    const numValue = parseFloat(price || '0');
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Verifica se o produto tem preço (não é zero)
  const hasPricing = () => {
    const daily = parseFloat(equipment?.daily_rate || '0');
    const weekly = parseFloat(equipment?.weekly_rate || '0');
    const monthly = parseFloat(equipment?.monthly_rate || '0');
    
    return daily > 0 || weekly > 0 || monthly > 0;
  };

  const shareViaWhatsApp = () => {
    if (!equipment) return;
    
    const message = `Confira esse equipamento: ${equipment.name} ${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyToClipboard = () => {
    if (!equipment) return;
    
    navigator.clipboard.writeText(window.location.href);
    setCopySnackbarOpen(true);
  };

  // Função que registra o clique no botão do WhatsApp
  const handleWhatsAppClick = () => {
    // Primeiro, abrir o WhatsApp imediatamente para melhorar a experiência do usuário
    const message = `Olá, gostaria de solicitar um orçamento para o equipamento: ${equipment?.name}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/551937030363?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Em seguida, registrar a solicitação em segundo plano
    setTimeout(async () => {
      try {
        // Definir datas de início (hoje) e fim (7 dias depois) já que são obrigatórias
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // Final fictício padrão: 7 dias
        
        // Buscar o ID do proprietário do equipamento
        const { data: equipData, error: equipError } = await supabase
          .from('equipment')
          .select('user_id')
          .eq('id', equipment?.id)
          .single();
          
        if (equipError) {
          console.error('Erro ao buscar proprietário do equipamento:', equipError);
          return;
        }
        
        // Registrar a solicitação de orçamento no banco de dados
        const { error } = await supabase.from('budget_requests').insert({
          equipment_id: equipment?.id,
          client_id: user?.id || null,
          client_name: user?.user_metadata?.name || 'Cliente WhatsApp',
          client_email: user?.email || null,
          client_phone: null,
          client_type: user ? 'user' : 'guest',
          owner_id: equipData.user_id, // ID do proprietário do equipamento
          status: 'pending',
          created_at: new Date().toISOString(),
          contact_method: 'whatsapp',
          // Campos obrigatórios
          start_date: startDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
          end_date: endDate.toISOString().split('T')[0]      // Formato YYYY-MM-DD
        });

        if (error) {
          console.error('Erro ao registrar solicitação de orçamento:', error);
        } else {
          console.log('Solicitação de orçamento registrada com sucesso');
          
          // Obter URL da imagem do equipamento
          const imageUrl = equipment?.image?.split('/').pop() || 'equipamento-placeholder.png';
          
          // Enviar email de notificação
          await sendBudgetRequestEmail(
            equipment?.name || 'Equipamento não especificado',
            user?.user_metadata?.name || null,
            imageUrl
          );
        }
      } catch (error) {
        console.error('Erro ao registrar solicitação de orçamento:', error);
      }
    }, 0);
  };

  // Gerar esquema para o produto
  const generateProductSchema = () => {
    if (!equipment) return null;
    
    // Garantir que o preço seja uma string
    const priceValue = equipment.daily_rate ? String(equipment.daily_rate) : '';
    
    // Criar slug preservando acentos e caracteres especiais
    const createSlug = (name: string) => {
      return encodeURIComponent(
        name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim()
      );
    };
    
    return ProductSchema({
      name: equipment.name,
      description: equipment.description || `Aluguel de ${equipment.name} em Porto Alegre e região`,
      imageUrl: equipment.image || '',
      price: priceValue,
      priceType: 'Diária',
      category: category?.name || '',
      url: `/equipamento/${createSlug(equipment.name)}`,
      availability: equipment.available ? 'InStock' : 'OutOfStock',
      reviewCount: equipment.total_reviews || 0,
      ratingValue: 5
    });
  };
  
  // Gerar esquema local business para a empresa
  const generateLocalBusinessSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'NOME DA EMPRESA', 'image': 'https://seusite.com.br/logo.png', 'url': 'https://seusite.com.br',
      'telephone': '+55-00-0000-0000',        'address': {          '@type': 'PostalAddress',          'streetAddress': 'Endereço da Empresa, Número',          'addressLocality': 'Cidade',          'addressRegion': 'UF',          'postalCode': '00000-000',          'addressCountry': 'BR'        },        'geo': {          '@type': 'GeoCoordinates',          'latitude': -0.0000,          'longitude': -0.0000        },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
          ],
          'opens': '07:00',
          'closes': '17:00'
        }
      ],
      'priceRange': '$$'
    };
  };
  
  // Combinando todos os esquemas
  const generateCombinedSchema = () => {
    const schemas = [];
    const productSchema = generateProductSchema();
    if (productSchema) schemas.push(productSchema);
    schemas.push(generateLocalBusinessSchema());
    return schemas;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !equipment) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            <AlertTitle>Erro ao carregar equipamento</AlertTitle>
            {error || 'Não foi possível carregar os detalhes do equipamento.'}
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            O equipamento que você está procurando pode ter sido removido ou o link está incorreto.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="outlined"
              color="primary"
              onClick={() => window.location.reload()}
              startIcon={<Bolt />}
              sx={{ mt: 2 }}
            >
              Tentar Novamente
            </Button>

            <Button 
              variant="contained" 
              color="primary"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/equipamentos')}
              sx={{ mt: 2 }}
            >
              Voltar para Equipamentos
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <>
            <SEOHead        title={`${equipment.name} - Aluguel | NOME DA EMPRESA`}        description={equipment.description || `Alugue ${equipment.name}. Equipamento de qualidade para sua obra com as melhores condições.`}        canonicalUrl={`/equipamento/${encodeURIComponent(equipment.name.toLowerCase().replace(/\s+/g, '-'))}`}        ogType="product"        ogImage={equipment.image}        keywords={`aluguel ${equipment.name}, locação ${equipment.name}, equipamentos construção, ${category?.name || ''}`}
        schema={generateCombinedSchema()}
      />
      
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4}>
          {/* Imagem principal e tags */}
          <Grid item xs={12} md={7}>
            <Box sx={{ position: 'relative' }}>
              {/* Disponibilidade */}
              <Chip 
                label={equipment.available ? "Disponível" : "Indisponível"} 
                color={equipment.available ? "success" : "error"}
                size="small"
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  left: 16, 
                  zIndex: 2,
                  fontWeight: 500
                }}
              />
              
              {/* Categoria */}
              {category && (
                <Chip 
                  label={category.name}
                  size="small"
                  icon={<Construction fontSize="small" />}
                  sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    zIndex: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(4px)',
                    fontWeight: 500
                  }}
                />
              )}
            
              {/* Imagem principal */}
              <StyledImageContainer onClick={() => setImageDialogOpen(true)}>
                <Box
                  component="img"
                  src={equipment.image || '/images/equipment-placeholder.jpg'}
                  alt={equipment.name}
                  sx={{
                    width: '100%',
                    height: { xs: 350, sm: 450, md: 500 },
                    objectFit: 'contain',
                    backgroundColor: 'rgba(245, 245, 245, 0.5)',
                    borderRadius: 2,
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'scale(1.03)'
                    }
                  }}
                />
                <ZoomOverlay className="zoom-overlay">
                  <ZoomIn />
                  <Typography variant="body2" sx={{ ml: 1 }}>Ampliar imagem</Typography>
                </ZoomOverlay>
              </StyledImageContainer>
            </Box>

            {/* Detalhes em abas (para telas grandes) */}
            <Box sx={{ mt: 4, display: { xs: 'none', md: 'block' } }}>
              <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  textColor="primary"
                  indicatorColor="primary"
                  aria-label="equipment details tabs"
                >
                  <Tab label="Descrição" {...a11yProps(0)} />
                  <Tab label="Especificações" {...a11yProps(1)} />
                  {accessories.length > 0 && <Tab label="Acessórios" {...a11yProps(2)} />}
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {equipment.description || 'Nenhuma descrição disponível.'}
                  </Typography>
                  
                  {constructionPhase && (
                    <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Fase da obra recomendada:
                      </Typography>
                      <Chip 
                        label={constructionPhase.name} 
                        size="small" 
                        icon={<CalendarMonth fontSize="small" />}
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  {(equipment.technical_specs && Object.keys(equipment.technical_specs).length > 0) ? (
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          {Object.entries(equipment.technical_specs).map(([key, value]) => (
                            <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 'medium', width: '40%' }}>
                                {key}
                              </TableCell>
                              <TableCell>{value as string}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Não há especificações técnicas disponíveis para este equipamento.
                    </Typography>
                  )}
                </TabPanel>
                
                {accessories.length > 0 && (
                  <TabPanel value={tabValue} index={2}>
                    {accessories.length > 0 ? (
                      <Grid container spacing={2}>
                        {accessories.map((accessory) => (
                          <Grid item xs={12} sm={6} key={accessory.id}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                              <CardContent>
                                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                  {accessory.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {accessory.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Não há acessórios disponíveis para este equipamento.
                      </Typography>
                    )}
                  </TabPanel>
                )}
              </Paper>
            </Box>
          </Grid>

          {/* Informações principais e preços */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'relative', height: '100%' }}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                {equipment.name}
              </Typography>
              
              {/* Avaliação */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating 
                  value={5} 
                  readOnly 
                  precision={0.5}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  5.0
                </Typography>
              </Box>

              {/* Descrição curta para telas pequenas */}
              <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {equipment.description}
                </Typography>
                <Button 
                  endIcon={<ExpandMore />} 
                  onClick={() => setTabValue(0)}
                  size="small"
                  sx={{ mt: 1, textTransform: 'none' }}
                >
                  Ler mais
                </Button>
              </Box>
              
              {/* Card de preços - agora com comportamento sticky */}
              <Box sx={{ 
                position: 'sticky', 
                top: theme.spacing(2), 
                zIndex: 10,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                },
                background: 'transparent',
                paddingTop: 1
              }}>
                <PriceCard elevation={0} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {hasPricing() ? 'Valores para locação' : 'Consulte valores'}
                  </Typography>
                  
                  {hasPricing() ? (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Diária
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {formatPrice(equipment.daily_rate)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Semanal
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatPrice(equipment.weekly_rate)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Mensal
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatPrice(equipment.monthly_rate)}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        Entre em contato para obter uma cotação personalizada para este equipamento.
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <AlertTitle>Preço sob consulta</AlertTitle>
                        Este equipamento tem valor variável dependendo das condições e período de locação.
                      </Alert>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Info fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {hasPricing() ? 
                        'Valores não incluem frete, montagem ou operador. Consulte disponibilidade.' : 
                        'Frete, montagem e operador podem ser negociados separadamente.'}
                    </Typography>
                  </Box>
                </PriceCard>
                
                {/* Botões de ação - Apenas visível em tablet e desktop */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    size="large" 
                    fullWidth
                    startIcon={<WhatsApp />}
                    onClick={handleWhatsAppClick}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      display: { xs: 'none', sm: 'flex' } // Oculto em dispositivos móveis
                    }}
                  >
                    Solicitar orçamento via WhatsApp
                  </Button>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<WhatsApp />} 
                      onClick={shareViaWhatsApp}
                      sx={{ flex: 1, borderRadius: 2 }}
                    >
                      Compartilhar
                    </Button>
                    
                    <Tooltip title="Copiar link" arrow>
                      <IconButton 
                        color="primary" 
                        onClick={copyToClipboard}
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
                      >
                        <FileCopy />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Salvar para depois" arrow>
                      <IconButton 
                        color="primary"
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
                      >
                        <BookmarkBorder />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Detalhes em abas para telas pequenas */}
        <Box sx={{ mt: 4, display: { xs: 'block', md: 'none' } }}>
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              aria-label="equipment details tabs mobile"
            >
              <Tab label="Descrição" {...a11yProps(0)} />
              <Tab label="Especificações" {...a11yProps(1)} />
              {accessories.length > 0 && <Tab label="Acessórios" {...a11yProps(2)} />}
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {equipment.description || 'Nenhuma descrição disponível.'}
              </Typography>
              
              {constructionPhase && (
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Fase da obra recomendada:
                  </Typography>
                  <Chip 
                    label={constructionPhase.name} 
                    size="small" 
                    icon={<CalendarMonth fontSize="small" />}
                    variant="outlined"
                    color="primary"
                  />
                </Box>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {(equipment.technical_specs && Object.keys(equipment.technical_specs).length > 0) ? (
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {Object.entries(equipment.technical_specs).map(([key, value]) => (
                        <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'medium', width: '40%' }}>
                            {key}
                          </TableCell>
                          <TableCell>{value as string}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Não há especificações técnicas disponíveis para este equipamento.
                </Typography>
              )}
            </TabPanel>
            
            {accessories.length > 0 && (
              <TabPanel value={tabValue} index={2}>
                {accessories.length > 0 ? (
                  <Grid container spacing={2}>
                    {accessories.map((accessory) => (
                      <Grid item xs={12} sm={6} key={accessory.id}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                              {accessory.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {accessory.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Não há acessórios disponíveis para este equipamento.
                  </Typography>
                )}
              </TabPanel>
            )}
          </Paper>
        </Box>

        {/* Equipamentos relacionados */}
        {relatedEquipment.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" fontWeight="bold">
                Equipamentos Relacionados
              </Typography>
              
              <Button 
                component={Link} 
                to={`/equipamentos/${equipment.category}`}
                endIcon={<ChevronRight />}
                color="primary"
              >
                Ver todos
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              {relatedEquipment.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.id}>
                  <EquipmentCard 
                    equipment={item} 
                    categoryName={category?.name || ''}
                    constructionPhaseName={
                      item.construction_phase_id && constructionPhase?.id === item.construction_phase_id 
                        ? constructionPhase.name 
                        : ''
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Diálogo para visualização da imagem */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: 2,
              overflow: 'hidden',
              height: { xs: 'auto', sm: 'auto', md: '90vh' },
              maxHeight: '90vh'
            }
          }}
        >
          <DialogContent sx={{ p: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IconButton
              onClick={() => setImageDialogOpen(false)}
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                bgcolor: 'background.paper', 
                zIndex: 2,
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'background.default'
                }
              }}
            >
              <Close />
            </IconButton>
            <Box
              component="img"
              src={equipment.image || '/images/equipment-placeholder.jpg'}
              alt={equipment.name}
              sx={{
                width: '100%',
                height: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                p: { xs: 1, sm: 3 }
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Diálogo de sucesso após envio do orçamento */}
        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            <Check color="success" sx={{ mr: 1 }} /> 
            Orçamento enviado com sucesso!
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Sua solicitação de orçamento para <strong>{equipment?.name}</strong> foi enviada com sucesso. 
              O proprietário analisará sua solicitação e entrará em contato em breve.
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Entre em contato diretamente via WhatsApp para obter mais informações.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            {ownerWhatsApp && (
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<WhatsApp />} 
                onClick={handleWhatsAppClick}
                fullWidth
              >
                Chamar no WhatsApp
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Snackbar de copiar link */}
        <Snackbar
          open={copySnackbarOpen}
          autoHideDuration={3000}
          onClose={() => setCopySnackbarOpen(false)}
          message="Link copiado para a área de transferência"
        />
      </Container>

      {/* Botão fixo para dispositivos móveis */}
      {isMobile && (
        <MobileFixedButton
          variant="contained"
          color="success"
          size="large"
          onClick={handleWhatsAppClick}
          startIcon={<WhatsApp />}
        >
          Solicitar orçamento via WhatsApp
        </MobileFixedButton>
      )}
    </>
  );
};

export default EquipmentDetailPage; 