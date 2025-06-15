import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Search, SlidersHorizontal, User, Calendar, Package2, Star, MessageSquare } from 'lucide-react';
import { TextField, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { WhatsApp } from '@mui/icons-material';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  total_bookings: number;
  total_spent: number;
  last_booking: string | null;
  average_rating: number;
}

const ClientList: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'bookings' | 'spent' | 'recent'>('name');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [user]);

  useEffect(() => {
    filterClients();
  }, [searchTerm, sortBy, clients]);

  const fetchClients = async () => {
    try {
      // Get all profiles with role 'cliente'
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'cliente');

      if (profilesError) throw profilesError;

      // Get all bookings with equipment information
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          total_price,
          created_at,
          equipment_id,
          equipment (
            user_id
          )
        `);

      if (bookingsError) throw bookingsError;

      // Filter bookings to only include those for equipment owned by the current user
      const userBookings = bookingsData?.filter(booking => booking.equipment?.user_id === user?.id) || [];

      // Get reviews for calculating average ratings
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          user_id,
          rating,
          equipment (
            user_id
          )
        `);

      if (reviewsError) throw reviewsError;

      // Filter reviews to only include those for equipment owned by the current user
      const userReviews = reviewsData?.filter(review => review.equipment?.user_id === user?.id) || [];

      // Process client data
      const clientsWithStats = (profilesData || []).map(profile => {
        const clientBookings = userBookings.filter(b => b.user_id === profile.id);
        const clientReviews = userReviews.filter(r => r.user_id === profile.id);
        
        const totalSpent = clientBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        const lastBooking = clientBookings.length > 0 
          ? new Date(Math.max(...clientBookings.map(b => new Date(b.created_at).getTime()))).toISOString()
          : null;
        
        const averageRating = clientReviews.length > 0
          ? clientReviews.reduce((sum, r) => sum + r.rating, 0) / clientReviews.length
          : 0;

        return {
          id: profile.id,
          name: profile.name || 'Unknown',
          email: profile.email || '',
          phone: profile.phone,
          role: profile.role,
          total_bookings: clientBookings.length,
          total_spent: totalSpent,
          last_booking: lastBooking,
          average_rating: averageRating,
        };
      });

      setClients(clientsWithStats);
      setFilteredClients(clientsWithStats);
    } catch (err) {
      console.error('Error fetching clients:', err);
      showNotification('error', 'Erro ao carregar lista de clientes');
      setError('Falha ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(client => 
        (client.name?.toLowerCase().includes(searchLower) || false) ||
        (client.email?.toLowerCase().includes(searchLower) || false) ||
        (client.phone?.toLowerCase().includes(searchLower) || false)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'bookings':
          return b.total_bookings - a.total_bookings;
        case 'spent':
          return b.total_spent - a.total_spent;
        case 'recent':
          if (!a.last_booking && !b.last_booking) return 0;
          if (!a.last_booking) return 1;
          if (!b.last_booking) return -1;
          return new Date(b.last_booking).getTime() - new Date(a.last_booking).getTime();
        default:
          return 0;
      }
    });

    setFilteredClients(filtered);
  };

  const viewClientDetails = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  const handleWhatsAppClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation(); // Impede que o clique se propague para o card
    
    if (client.phone) {
      // Formatar número para padrão WhatsApp (removendo caracteres não numéricos)
      const formattedPhone = client.phone.replace(/\D/g, '');
      // Adicionar código do país se necessário (Brasil 55)
      const phoneWithCountry = formattedPhone.startsWith('55') 
        ? formattedPhone 
        : `55${formattedPhone}`;
      
      // Abrir WhatsApp com mensagem padrão
      const message = `Olá, ${client.name}! Sou da equipe de aluguel de equipamentos.`;
      const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      showNotification('warning', 'Cliente não possui número de telefone cadastrado');
    }
  };

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
        <h2 className="text-2xl font-semibold">Clientes</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Buscar cliente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <Search className="h-4 w-4 text-gray-400 mr-2" />,
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                label="Ordenar por"
              >
                <MenuItem value="name">Nome</MenuItem>
                <MenuItem value="recent">Última reserva</MenuItem>
                <MenuItem value="bookings">Total de reservas</MenuItem>
                <MenuItem value="spent">Total gasto</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
            onClick={() => viewClientDetails(client.id)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">{client.name || client.email}</h3>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                </div>
                {client.total_bookings > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Cliente Ativo
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total de Reservas</span>
                  <span className="font-medium">{client.total_bookings}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Gasto</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(client.total_spent)}
                  </span>
                </div>

                {client.last_booking && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Última Reserva</span>
                    <span className="font-medium">
                      {new Date(client.last_booking).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Telefone</span>
                    <span className="font-medium">{client.phone}</span>
                  </div>
                )}

                {client.average_rating > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avaliação Média</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{client.average_rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => handleWhatsAppClick(e, client)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  disabled={!client.phone}
                >
                  <WhatsApp className="h-4 w-4 mr-2" />
                  {client.phone ? 'Contatar via WhatsApp' : 'Sem telefone cadastrado'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nenhum cliente encontrado</p>
        </div>
      )}
    </div>
  );
};

export default ClientList;