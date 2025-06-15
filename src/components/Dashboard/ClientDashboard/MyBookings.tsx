import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { BookingWithEquipment } from '../../../types/types';
import { formatCurrency } from '../../../utils/formatters';
import { Calendar, Package2, Star, Search, SlidersHorizontal } from 'lucide-react';
import { TextField, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'price_desc' | 'price_asc'>('date_desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          equipment (
            id,
            name,
            image,
            category,
            daily_rate,
            average_rating
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings
    .filter(booking => {
      const matchesSearch = booking.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        case 'date_desc':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'price_asc':
          return (a.total_price || 0) - (b.total_price || 0);
        case 'price_desc':
          return (b.total_price || 0) - (a.total_price || 0);
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
        <h2 className="text-2xl font-semibold">Minhas Reservas</h2>
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
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="confirmado">Confirmado</MenuItem>
                <MenuItem value="em_andamento">Em Andamento</MenuItem>
                <MenuItem value="finalizado">Finalizado</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
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
                <MenuItem value="price_desc">Valor (maior)</MenuItem>
                <MenuItem value="price_asc">Valor (menor)</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {booking.equipment?.image ? (
              <img
                src={booking.equipment.image}
                alt={booking.equipment.name}
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
                  <h3 className="text-lg font-semibold">{booking.equipment?.name}</h3>
                  <p className="text-sm text-gray-600">{booking.equipment?.category}</p>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm">{booking.equipment?.average_rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                    booking.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'finalizado' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(booking.total_price || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <Package2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhuma reserva encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;