import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Divider, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Rating,
  Container
} from '@mui/material';
import { 
  Search, 
  FilterIcon, 
  Star, 
  Calendar, 
  Package2, 
  User 
} from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  equipment_id: string;
  equipment: {
    id: string;
    name: string;
    image: string | null;
    category: string;
  };
  user_profile?: {
    name: string;
    avatar_url: string | null;
  };
}

const OwnerReviews: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | ''>('');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [equipments, setEquipments] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (user) {
      fetchReviews();
      fetchEquipments();
    }
  }, [user]);

  const fetchEquipments = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .eq('user_id', user?.id || '')
        .order('name');

      if (error) throw error;
      setEquipments(data || []);
    } catch (err) {
      console.error('Erro ao buscar equipamentos:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar os equipamentos do proprietário
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id')
        .eq('user_id', user?.id || '');

      if (equipmentError) throw equipmentError;
      
      if (!equipmentData || equipmentData.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const equipmentIds = equipmentData.map(e => e.id);

      // Buscar avaliações para esses equipamentos
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          equipment (
            id,
            name,
            image,
            category
          )
        `)
        .in('equipment_id', equipmentIds)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      
      // Buscar perfis dos usuários que fizeram as avaliações
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('id', review.user_id)
              .single();

            if (profileError) throw profileError;
            
            return {
              ...review,
              user_profile: profileData
            };
          } catch (err) {
            console.error(`Erro ao buscar perfil para avaliação ${review.id}:`, err);
            return {
              ...review,
              user_profile: { name: 'Usuário', avatar_url: null }
            };
          }
        })
      );

      setReviews(reviewsWithProfiles);
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
      setError('Falha ao carregar avaliações');
      showNotification('error', 'Não foi possível carregar as avaliações');
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  };

  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = searchTerm === '' || 
        review.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = ratingFilter === '' || review.rating === ratingFilter;
      
      const matchesEquipment = equipmentFilter === '' || review.equipment_id === equipmentFilter;
      
      return matchesSearch && matchesRating && matchesEquipment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rating_asc':
          return a.rating - b.rating;
        case 'rating_desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" mb={2}>
          Avaliações dos Equipamentos
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="body1">
              Total de avaliações: <strong>{reviews.length}</strong>
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <Typography variant="body1" mr={1}>
                Média geral:
              </Typography>
              <Rating value={getAverageRating()} precision={0.5} readOnly />
              <Typography variant="body1" ml={1}>
                ({getAverageRating().toFixed(1)})
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
          </Button>
        </Box>
        
        {showFilters && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Buscar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nome do equipamento ou comentário"
                    InputProps={{
                      startAdornment: <Search size={20} className="mr-2 text-gray-400" />,
                    }}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Avaliação</InputLabel>
                    <Select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value as number | '')}
                      label="Avaliação"
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <MenuItem key={rating} value={rating}>
                          {rating} {rating === 1 ? 'estrela' : 'estrelas'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Equipamento</InputLabel>
                    <Select
                      value={equipmentFilter}
                      onChange={(e) => setEquipmentFilter(e.target.value)}
                      label="Equipamento"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {equipments.map((equipment) => (
                        <MenuItem key={equipment.id} value={equipment.id}>
                          {equipment.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ordenar por</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Ordenar por"
                    >
                      <MenuItem value="date_desc">Mais recentes</MenuItem>
                      <MenuItem value="date_asc">Mais antigas</MenuItem>
                      <MenuItem value="rating_desc">Maior avaliação</MenuItem>
                      <MenuItem value="rating_asc">Menor avaliação</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>

      {error && (
        <Box mb={4} p={2} bgcolor="error.light" borderRadius={1}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {filteredReviews.length === 0 ? (
        <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Star size={48} className="mx-auto text-gray-300 mb-2" />
          <Typography variant="h6" color="textSecondary">
            Nenhuma avaliação encontrada
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {reviews.length > 0 
              ? 'Tente ajustar os filtros para ver mais resultados' 
              : 'Seus equipamentos ainda não receberam avaliações dos clientes'}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredReviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        src={review.user_profile?.avatar_url || undefined} 
                        alt={review.user_profile?.name || 'Usuário'}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      >
                        {!review.user_profile?.avatar_url && <User />}
                      </Avatar>
                      
                      <Box>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {review.user_profile?.name || 'Usuário'}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Rating value={review.rating} precision={0.5} readOnly size="small" />
                          <Typography variant="body2" color="textSecondary" ml={1}>
                            ({review.rating})
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <Calendar size={16} className="mr-1 text-gray-400" />
                      <Typography variant="body2" color="textSecondary">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100'
                      }}
                    >
                      {review.equipment?.image ? (
                        <img 
                          src={review.equipment.image} 
                          alt={review.equipment.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Package2 size={24} className="text-gray-400" />
                      )}
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle1">
                        {review.equipment?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" textTransform="capitalize">
                        {review.equipment?.category?.replace('_', ' ')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1">
                    {review.comment}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default OwnerReviews; 