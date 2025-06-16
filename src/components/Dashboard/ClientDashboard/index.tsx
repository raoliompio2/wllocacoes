import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { BookingWithEquipment, BudgetRequest } from '../../../types/types';
import { formatCurrency } from '../../../utils/formatters';
import { Package2, Calendar, Star, MessageSquare, Search } from 'lucide-react';
import { TextField, Button } from '@mui/material';
import BudgetChat from '../../Equipment/BudgetChat';
import DashboardSkeleton from '../DashboardSkeleton';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState<BookingWithEquipment[]>([]);
  const [recentBudgets, setRecentBudgets] = useState<BudgetRequest[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRequest | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchRecentBookings(),
        fetchRecentBudgets(),
        fetchRecommendations()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  const fetchRecentBookings = async () => {
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
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentBookings(data || []);
    } catch (err) {
      console.error('Error fetching recent bookings:', err);
    }
  };

  const fetchRecentBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_requests')
        .select(`
          *,
          equipment (
            id,
            name,
            image,
            category
          )
        `)
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentBudgets(data || []);
    } catch (err) {
      console.error('Error fetching recent budgets:', err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      // Get user's preferred categories based on booking history
      const { data: bookings } = await supabase
        .from('bookings')
        .select('equipment(category)')
        .eq('user_id', user?.id);

      const categories = [...new Set(bookings?.map(b => b.equipment?.category))];

      // Fetch recommended equipment from those categories
      if (categories.length > 0) {
        const { data: recommended } = await supabase
          .from('equipment')
          .select('*')
          .in('category', categories)
          .not('id', 'in', (bookings || []).map(b => b.equipment_id))
          .order('average_rating', { ascending: false })
          .limit(6);

        setRecommendations(recommended || []);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  // Função para criar um slug a partir do nome do equipamento
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD') // Normalização para decomposição de acentos
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/--+/g, '-') // Remove múltiplos hífens consecutivos
      .trim(); // Remove espaços no início e fim
  };

  const handleEquipmentClick = (equipment: any) => {
    // Usar a rota correta com o slug do nome
    navigate(`/equipamento/${createSlug(equipment.name)}`);
  };

  if (loading) {    return <DashboardSkeleton />;  }

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <TextField
            fullWidth
            placeholder="Buscar equipamentos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value) {
                navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
              }
            }}
            InputProps={{
              startAdornment: <div className="w-10" />,
            }}
          />
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Aluguéis Recentes</h2>
          <Button
            variant="text"
            onClick={() => navigate('/bookings')}
          >
            Ver Todos
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentBookings.map((booking) => (
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
        </div>
      </div>

      {/* Recent Budget Requests */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Orçamentos Recentes</h2>
          <Button
            variant="text"
            onClick={() => navigate('/budget-requests')}
          >
            Ver Todos
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentBudgets.map((budget) => (
            <div
              key={budget.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {budget.equipment?.image ? (
                <img
                  src={budget.equipment.image}
                  alt={budget.equipment.name}
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
                    <h3 className="text-lg font-semibold">{budget.equipment?.name}</h3>
                    <p className="text-sm text-gray-600">{budget.equipment?.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    budget.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    budget.status === 'responded' ? 'bg-blue-100 text-blue-800' :
                    budget.status === 'approved' ? 'bg-green-100 text-green-800' :
                    budget.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {budget.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  {budget.total_amount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Valor Proposto:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(budget.total_amount)}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedBudget(budget);
                        setShowChat(true);
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat com Proprietário
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recomendados para Você</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((equipment) => (
              <div
                key={equipment.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleEquipmentClick(equipment)}
              >
                {equipment.image ? (
                  <img
                    src={equipment.image}
                    alt={equipment.name}
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
                      <h3 className="text-lg font-semibold">{equipment.name}</h3>
                      <p className="text-sm text-gray-600">{equipment.category}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm">{equipment.average_rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Diária a partir de:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(equipment.daily_rate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {selectedBudget && showChat && (
        <BudgetChat
          budgetRequest={selectedBudget}
          open={showChat}
          onClose={() => {
            setSelectedBudget(null);
            setShowChat(false);
          }}
        />
      )}
    </div>
  );
};

export default ClientDashboard;