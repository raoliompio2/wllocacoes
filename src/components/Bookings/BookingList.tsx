import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { BookingWithEquipment } from '../../types/types';
import BookingDetails from './BookingDetails';
import { Calendar, Package2, AlertCircle, Search, MapPin, Star, SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { TextField, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithEquipment[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithEquipment | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string; end: string}>({
    start: '',
    end: ''
  });
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'price_desc' | 'price_asc'>('date_desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, dateRange, sortBy, bookings]);

  const filterBookings = () => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(booking => 
        new Date(booking.start_date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(booking => 
        new Date(booking.end_date) <= new Date(dateRange.end)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
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

    setFilteredBookings(filtered);
  };

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          equipment (
            id,
            name,
            image,
            category,
            daily_rate
          )
        `)
        .eq('user_id', user.id)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'finalizado':
        return 'bg-gray-100 text-gray-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>{error}</span>
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

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <TextField
              type="date"
              label="Data Inicial"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="date"
              label="Data Final"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />

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

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Você ainda não tem nenhuma reserva</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedBooking(booking)}
            >
              {booking.equipment?.image && (
                <img
                  src={booking.equipment.image}
                  alt={booking.equipment.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">
                    {booking.equipment?.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Package2 className="h-4 w-4 mr-2" />
                    <span>{booking.equipment?.category}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {formatCurrency(booking.total_price || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
              <BookingDetails
                booking={selectedBooking}
                onReviewSubmit={() => {
                  setSelectedBooking(null);
                  fetchBookings();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;