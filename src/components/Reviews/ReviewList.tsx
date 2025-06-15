import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Star, User, Calendar, Search, SlidersHorizontal } from 'lucide-react';
import { FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  equipment: {
    id: string;
    name: string;
    image: string | null;
  };
  user_profile?: {
    name: string;
    avatar_url: string | null;
  };
}

const ReviewList: React.FC<{ equipmentId?: string }> = ({ equipmentId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | ''>('');

  useEffect(() => {
    fetchReviews();
  }, [equipmentId]);

  const fetchReviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      let query = supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          equipment (
            id,
            name,
            image
          )
        `)
        .order('created_at', { ascending: false });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data: reviewsData, error: reviewsError } = await query;

      if (reviewsError) throw reviewsError;

      // Fetch user profiles for each review
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', review.user_id)
            .maybeSingle();

          return {
            ...review,
            user_profile: profileData || { name: 'Usuário Anônimo', avatar_url: null }
          };
        })
      );

      setReviews(reviewsWithProfiles);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews
    .filter(review => 
      (review.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       review.comment.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRating === '' || review.rating === selectedRating)
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return b.rating - a.rating;
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
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar avaliações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            startIcon={<SlidersHorizontal />}
          >
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl fullWidth>
              <InputLabel>Avaliação</InputLabel>
              <Select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value as number | '')}
                label="Avaliação"
              >
                <MenuItem value="">Todas</MenuItem>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <MenuItem key={rating} value={rating}>
                    {rating} estrelas
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
                label="Ordenar por"
              >
                <MenuItem value="date">Data</MenuItem>
                <MenuItem value="rating">Avaliação</MenuItem>
              </Select>
            </FormControl>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {review.user_profile?.avatar_url ? (
                  <img
                    src={review.user_profile.avatar_url}
                    alt={review.user_profile.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{review.user_profile?.name}</h3>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(review.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  {review.equipment.image ? (
                    <img
                      src={review.equipment.image}
                      alt={review.equipment.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                      <Star className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">{review.equipment.name}</h4>
                </div>
              </div>
              
              <p className="text-gray-600 mt-2">{review.comment}</p>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhuma avaliação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;