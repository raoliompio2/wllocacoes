import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { Package2, Star, Search, SlidersHorizontal } from 'lucide-react';
import { TextField, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  equipment: {
    id: string;
    name: string;
    image: string | null;
    category: string;
  };
}

const MyReviews: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc'>('date_desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
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
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = review.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = ratingFilter === '' || review.rating === ratingFilter;
      return matchesSearch && matchesRating;
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Minhas Avaliações</h2>
        <Button
          variant="outlined"
          startIcon={<SlidersHorizontal />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtros
        </Button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="Buscar equipamento"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <Search className="h-4 w-4 text-gray-400 mr-2" />,
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Avaliação</InputLabel>
              <Select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as number | '')}
                label="Avaliação"
              >
                <MenuItem value="">Todas</MenuItem>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <MenuItem key={rating} value={rating}>{rating} estrelas</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                label="Ordenar por"
              >
                <MenuItem value="date_desc">Data (mais recente)</MenuItem>
                <MenuItem value="date_asc">Data (mais antiga)</MenuItem>
                <MenuItem value="rating_desc">Avaliação (maior)</MenuItem>
                <MenuItem value="rating_asc">Avaliação (menor)</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {review.equipment?.image ? (
              <img
                src={review.equipment.image}
                alt={review.equipment.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <Package2 className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{review.equipment?.name}</h3>
                  <p className="text-sm text-gray-600">{review.equipment?.category}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 ${
                        index < review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-600">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhuma avaliação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;