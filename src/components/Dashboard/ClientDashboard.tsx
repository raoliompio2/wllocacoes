import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { BookingWithEquipment, BudgetRequest } from '../../types/types';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, Package2, Clock, AlertCircle, Search, MapPin, Star, MessageSquare, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BudgetChat from '../Equipment/BudgetChat';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { useTheme, useMediaQuery } from '@mui/material';
import DashboardSkeleton from './DashboardSkeleton';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithEquipment[]>([]);
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRequest | null>(null);
  const [showChat, setShowChat] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Analytics states
  const [spendingData, setSpendingData] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeBookings, setActiveBookings] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Função para criar slug a partir do nome do equipamento
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

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchBookings(),
        fetchBudgetRequests(),
        fetchAnalytics()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const startDate = startOfMonth(subMonths(new Date(), 6));
      const endDate = endOfMonth(new Date());

      // Fetch bookings with equipment details
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          equipment (
            id,
            name,
            category,
            image,
            daily_rate
          )
        `)
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (bookingsError) throw bookingsError;

      // Process spending over time
      const spendingByMonth = (bookingsData || []).reduce((acc: any, booking: any) => {
        const month = format(new Date(booking.created_at), 'MMM yyyy');
        if (!acc[month]) {
          acc[month] = {
            name: month,
            amount: 0
          };
        }
        acc[month].amount += booking.total_price || 0;
        return acc;
      }, {});

      setSpendingData(Object.values(spendingByMonth));

      // Process category distribution
      const categoriesDistribution = (bookingsData || []).reduce((acc: any, booking: any) => {
        const category = booking.equipment?.category || 'Outros';
        if (!acc[category]) {
          acc[category] = {
            name: category,
            value: 0
          };
        }
        acc[category].value++;
        return acc;
      }, {});

      setCategoryDistribution(Object.values(categoriesDistribution));

      // Process status distribution
      const statuses = (bookingsData || []).reduce((acc: any, booking: any) => {
        if (!acc[booking.status]) {
          acc[booking.status] = {
            name: booking.status,
            value: 0
          };
        }
        acc[booking.status].value++;
        return acc;
      }, {});

      setStatusDistribution(Object.values(statuses));

      // Calculate totals
      setTotalSpent((bookingsData || []).reduce((sum, booking) => sum + (booking.total_price || 0), 0));
      setActiveBookings((bookingsData || []).filter(b => b.status === 'em_andamento').length);

      // Fetch recommendations based on user's booking history
      const categories = [...new Set((bookingsData || []).map(b => b.equipment?.category))];
      if (categories.length > 0) {
        const { data: recommendedEquipment } = await supabase
          .from('equipment')
          .select('*')
          .in('category', categories)
          .not('id', 'in', (bookingsData || []).map(b => b.equipment_id))
          .limit(5);

        setRecommendations(recommendedEquipment || []);
      }

    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

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
            daily_rate,
            category,
            average_rating
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchBudgetRequests = async () => {
    try {
      const { data: requestsData, error: requestsError } = await supabase
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
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setBudgetRequests(requestsData || []);
    } catch (err) {
      console.error('Error fetching budget requests:', err);
    }
  };

  if (loading) {    return <DashboardSkeleton />;  }

  return (
    <div className="p-4 sm:p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-2 sm:p-3">
                <Package2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-500">Aluguéis Ativos</p>
                <p className="text-lg sm:text-xl font-semibold">{activeBookings}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-2 sm:p-3">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-500">Total de Aluguéis</p>
                <p className="text-lg sm:text-xl font-semibold">{bookings.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-2 sm:p-3">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-500">Orçamentos</p>
                <p className="text-lg sm:text-xl font-semibold">{budgetRequests.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Chart */}
      <div className="bg-white rounded-lg shadow mb-6 sm:mb-8">
        <div className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Gastos ao Longo do Tempo</h2>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#1976d2"
                  fill="#1976d2"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Categorias Mais Alugadas</h2>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    label={{fontSize: 12}}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Status dos Aluguéis</h2>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 80 : 100}
                    fill="#82ca9d"
                    label={{fontSize: 12}}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45 + 120}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow mb-6 sm:mb-8">
        <div className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Recomendados para Você</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {recommendations.map((equipment) => (
              <div
                key={equipment.id}
                className="bg-white border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/alugar/${createSlug(equipment.name)}`)}
              >
                {/* Equipment card content */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;