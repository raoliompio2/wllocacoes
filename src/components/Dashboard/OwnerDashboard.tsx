import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { DashboardSummary, Equipment, MaintenanceItem, BudgetRequest } from '../../types/types';
import { formatCurrency } from '../../utils/formatters';
import { Package2, Calendar, PenTool as Tool, Star, DollarSign, Users, MessageSquare, Link as LinkIcon, Rss } from 'lucide-react';
import BudgetResponseForm from '../Equipment/BudgetResponseForm';
import BudgetChat from '../Equipment/BudgetChat';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import BookingChart from './Analytics/BookingChart';
import RevenueChart from './Analytics/RevenueChart';
import AnalyticCard from './Analytics/AnalyticCard';
import TopEquipmentTable from './Analytics/TopEquipmentTable';
import DashboardSkeleton from './DashboardSkeleton';
import { Grid, Paper, Typography, Box, Link, Tabs, Tab } from '@mui/material';
import { EquipmentLinkExporter } from '../Equipment';
import ProductFeedGenerator from '../SEO/ProductFeedGenerator';

// Interface para as abas
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componente do painel de abas
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
      style={{ paddingTop: '20px' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRequest | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [tabValue, setTabValue] = useState(0); // Estado para controlar a aba ativa
  
  // Analytics states
  const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [bookingData, setBookingData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topEquipment, setTopEquipment] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<'last30' | 'last90' | 'lastYear' | 'custom'>('last30');

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchDashboardData(),
        fetchBudgetRequests(),
        fetchAnalytics()
      ]).finally(() => setLoading(false));
    }
  }, [user, startDate, endDate]);

  // Manipulador de alteração de abas
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (range: 'last30' | 'last90' | 'lastYear' | 'custom') => {
    setDateRange(range);
    const end = new Date();
    let start;
    
    switch (range) {
      case 'last30':
        start = subMonths(end, 1);
        break;
      case 'last90':
        start = subMonths(end, 3);
        break;
      case 'lastYear':
        start = subMonths(end, 12);
        break;
      default:
        return; // Don't change dates for custom range
    }
    
    setStartDate(startOfMonth(start));
    setEndDate(endOfMonth(end));
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          created_at,
          total_price,
          equipment_id,
          equipment (name)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (bookingsError) throw bookingsError;

      // Process bookings data for charts
      const bookingsByDate = bookings?.reduce((acc: any, booking: any) => {
        const date = format(new Date(booking.created_at), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = { date, value: 0 };
        acc[date].value++;
        return acc;
      }, {});

      setBookingData(Object.values(bookingsByDate || {}));

      // Process revenue data
      const revenueByMonth = bookings?.reduce((acc: any, booking: any) => {
        const month = format(new Date(booking.created_at), 'MMM yyyy');
        if (!acc[month]) {
          acc[month] = {
            name: month,
            bookings: 0,
            budgets: 0
          };
        }
        acc[month].bookings += booking.total_price || 0;
        return acc;
      }, {});

      setRevenueData(Object.values(revenueByMonth || {}));

      // Process top equipment
      const equipmentStats = bookings?.reduce((acc: any, booking: any) => {
        const id = booking.equipment_id;
        if (!acc[id]) {
          acc[id] = {
            name: booking.equipment?.name || 'Unknown',
            totalBookings: 0,
            totalRevenue: 0,
            rating: 0
          };
        }
        acc[id].totalBookings++;
        acc[id].totalRevenue += booking.total_price || 0;
        return acc;
      }, {});

      setTopEquipment(Object.values(equipmentStats || {})
        .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5));

    } catch (err) {
      console.error('Error fetching analytics:', err);
      showNotification('error', 'Erro ao carregar análises');
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard summary
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_owner_dashboard_summary');

      if (summaryError) {
        console.error('Error fetching dashboard summary:', summaryError);
        throw summaryError;
      }

      console.log('Dashboard summary data:', summaryData);

      // Fetch equipment - usar cast seguro para os tipos
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('user_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (equipmentError) throw equipmentError;

      // Não buscar dados de manutenção se a tabela não estiver disponível no schema
      setSummary(summaryData?.[0] || null);
      // Convertendo o daily_rate de string para number
      const formattedEquipment = (equipmentData || []).map(equip => ({
        ...equip,
        daily_rate: equip.daily_rate ? parseFloat(equip.daily_rate as unknown as string) : null,
        weekly_rate: equip.weekly_rate ? parseFloat(equip.weekly_rate as unknown as string) : null,
        monthly_rate: equip.monthly_rate ? parseFloat(equip.monthly_rate as unknown as string) : null,
        average_rating: 0, // Valor padrão
        total_reviews: 0 // Valor padrão
      }));
      setEquipment(formattedEquipment);
      setMaintenance([]); // Temporariamente definir como vazio
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    }
  };

  const fetchBudgetRequests = async () => {
    try {
      // First fetch budget requests with equipment data
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
        .eq('owner_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Simplificar temporariamente a estrutura do cliente para corresponder ao tipo esperado
      const enrichedRequests = (requestsData || []).map(request => {
        return {
          ...request,
          client: {
            id: request.client_id,
            name: 'Cliente',  // Valor padrão
            email: null
          }
        };
      });

      setBudgetRequests(enrichedRequests);
    } catch (err) {
      console.error('Error fetching budget requests:', err);
      showNotification('error', 'Erro ao carregar solicitações de orçamento');
    }
  };

  if (loading) {    
    return <DashboardSkeleton />;  
  }

  return (
    <div className="p-6 space-y-6">
      {/* Abas do Dashboard */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="dashboard tabs"
        >
          <Tab 
            icon={<Package2 size={18} />} 
            iconPosition="start" 
            label="Visão Geral" 
            {...a11yProps(0)} 
          />
          <Tab 
            icon={<LinkIcon size={18} />} 
            iconPosition="start" 
            label="Links para Google Ads" 
            {...a11yProps(1)} 
          />
          <Tab 
            icon={<Rss size={18} />} 
            iconPosition="start" 
            label="Feed de Produtos" 
            {...a11yProps(2)} 
          />
        </Tabs>
      </Paper>

      {/* Conteúdo das abas */}
      <TabPanel value={tabValue} index={0}>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticCard
            title="Equipamentos"
            value={equipment?.length || 0}
            icon={Package2}
            color="green"
          />
          <AnalyticCard
            title="Reservas Ativas"
            value={summary?.active_bookings || 0}
            icon={Calendar}
            color="blue"
          />
          <AnalyticCard
            title="Clientes"
            value={summary?.total_customers || 0}
            icon={Users}
            color="purple"
          />
          <AnalyticCard
            title="Orçamentos"
            value={budgetRequests?.length || 0}
            icon={DollarSign}
            color="amber"
          />
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <FormControl className="min-w-[200px]">
              <InputLabel>Período</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value as any)}
                label="Período"
              >
                <MenuItem value="last30">Últimos 30 dias</MenuItem>
                <MenuItem value="last90">Últimos 90 dias</MenuItem>
                <MenuItem value="lastYear">Último ano</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </Select>
            </FormControl>

            {dateRange === 'custom' && (
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data Inicial"
                  value={startDate}
                  onChange={(newValue) => newValue && setStartDate(newValue)}
                />
                <DatePicker
                  label="Data Final"
                  value={endDate}
                  onChange={(newValue) => newValue && setEndDate(newValue)}
                />
              </LocalizationProvider>
            )}
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BookingChart
            data={bookingData}
            title="Evolução de Aluguéis"
            color="#1976d2"
          />
          <RevenueChart
            data={revenueData}
            title="Receita por Período"
          />
        </div>

        {/* Top Equipment Table */}
        <div className="bg-white rounded-lg shadow">
          <TopEquipmentTable
            data={topEquipment}
            title="Top 5 Equipamentos"
          />
        </div>

        {/* Budget Requests Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Solicitações de Orçamento</h2>
          <div className="space-y-4">
            {budgetRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{request.equipment?.name}</h3>
                    <p className="text-sm text-gray-500">
                      Cliente: {request.client?.name || 'Cliente'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Período: {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {request.status === 'pending' ? (
                      <button
                        onClick={() => setSelectedBudget(request)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Responder
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedBudget(request)}
                        className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
                      >
                        Editar Resposta
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedBudget(request);
                        setShowChat(true);
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for Budget Response */}
        {selectedBudget && !showChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <BudgetResponseForm
                budgetRequest={selectedBudget}
                onClose={() => setSelectedBudget(null)}
                open={true}
                onSuccess={() => fetchBudgetRequests()}
              />
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChat && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full h-3/4">
              <BudgetChat
                budgetRequest={selectedBudget}
                onClose={() => {
                  setShowChat(false);
                  setSelectedBudget(null);
                }}
                open={true}
              />
            </div>
          </div>
        )}

        {/* Seção de Links Úteis */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Links Úteis
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Link href="/api/product-feed?token=lokaja-feed-token&format=xml" target="_blank" sx={{ display: 'block', mb: 1 }}>
                Feed de Produtos (XML)
              </Link>
              <Link href="/instrucoes-anuncios-dinamicos.html" target="_blank" sx={{ display: 'block', mb: 1 }}>
                Instruções para Anúncios Dinâmicos
              </Link>
              {/* Adicione mais links úteis aqui */}
            </Box>
          </Paper>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <EquipmentLinkExporter />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <ProductFeedGenerator />
      </TabPanel>
    </div>
  );
};

export default OwnerDashboard;