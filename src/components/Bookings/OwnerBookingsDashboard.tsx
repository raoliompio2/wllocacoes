import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { BookingWithEquipment } from '../../types/types';
import { 
  Box, 
  Typography, 
  Container,
  Grid,
  Fade,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  LinearProgress,
  Tab,
  Tabs,
  InputAdornment,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  BookingCard,
  BookingDetailsDialog
} from '../Bookings';
import { Search, Calendar, Package2, DollarSign, Users, CheckCircle, CalendarIcon } from 'lucide-react';

// Componente para o cabeçalho da seção
const SectionHeader: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h5" component="h2" fontWeight="bold">
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);

// Componente para estatísticas de reservas
const BookingStats: React.FC<{ bookings: BookingWithEquipment[] }> = ({ bookings }) => {
  // Calcular estatísticas
  const totalBookings = bookings.length;
  
  const activeBookings = bookings.filter(
    b => b.status === 'pendente' || b.status === 'confirmado' || b.status === 'em_andamento'
  ).length;
  
  const completedBookings = bookings.filter(b => b.status === 'finalizado').length;
  
  const canceledBookings = bookings.filter(b => b.status === 'cancelado').length;

  // Calcular receita total
  const totalRevenue = bookings.reduce((total, booking) => {
    return total + (booking.total_price || 0);
  }, 0);

  // Calcular clientes únicos
  const uniqueClients = new Set(bookings.map(b => b.user_id)).size;

  const stats = [
    { 
      label: "Reservas Ativas", 
      value: activeBookings, 
      total: totalBookings,
      icon: <Calendar className="h-6 w-6" />,
      color: "#1976d2"
    },
    { 
      label: "Reservas Concluídas", 
      value: completedBookings, 
      total: totalBookings,
      icon: <CheckCircle className="h-6 w-6" />,
      color: "#2e7d32"
    },
    { 
      label: "Total de Clientes", 
      value: uniqueClients,
      total: null,
      icon: <Users className="h-6 w-6" />,
      color: "#7b1fa2"
    },
    { 
      label: "Receita Total", 
      value: totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      total: null,
      icon: <DollarSign className="h-6 w-6" />,
      color: "#ed6c02"
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  bgcolor: stat.color,
                  mr: 1.5
                }}
              >
                {stat.icon}
              </Box>
              <Typography variant="h6" component="div">
                {stat.label}
              </Typography>
            </Box>
            
            {stat.total !== null ? (
              <>
                <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={stat.total > 0 ? (stat.value / stat.total) * 100 : 0} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(stat.total > 0 ? (stat.value / stat.total) * 100 : 0)}%
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

// Componente de filtros para reservas
const BookingFilters: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  equipmentFilter: string;
  setEquipmentFilter: (id: string) => void;
  equipments: { id: string, name: string }[];
}> = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  equipmentFilter,
  setEquipmentFilter,
  equipments
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 4,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            placeholder="Buscar por cliente ou equipamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search size={20} color="#666" style={{ marginRight: 8 }} />,
            }}
            variant="outlined"
            size="small"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pendente">Pendente</MenuItem>
              <MenuItem value="confirmado">Confirmado</MenuItem>
              <MenuItem value="em_andamento">Em Andamento</MenuItem>
              <MenuItem value="finalizado">Finalizado</MenuItem>
              <MenuItem value="cancelado">Cancelado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Equipamento</InputLabel>
            <Select
              value={equipmentFilter}
              label="Equipamento"
              onChange={(e) => setEquipmentFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {equipments.map(equipment => (
                <MenuItem key={equipment.id} value={equipment.id}>
                  {equipment.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const OwnerBookingsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [bookings, setBookings] = useState<BookingWithEquipment[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [equipments, setEquipments] = useState<{ id: string, name: string }[]>([]);
  
  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
  const [dateRangePreset, setDateRangePreset] = useState<string>('custom');
  
  // Estado para diálogo de detalhes
  const [selectedBooking, setSelectedBooking] = useState<BookingWithEquipment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEquipments();
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, equipmentFilter, startDateFilter, endDateFilter]);

  const fetchEquipments = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setEquipments(data || []);
    } catch (err) {
      console.error('Erro ao buscar equipamentos:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar o ID do usuário logado ou um ID fixo para testes
      const proprietarioId = user?.id || 'c78aafc8-6734-4e6b-8944-29cffa6424f1';
      console.log('ID do usuário atual:', user?.id);
      console.log('ID utilizado para busca:', proprietarioId);
      
      const { data, error } = await supabase.rpc('get_owner_bookings', { 
        p_owner_id: proprietarioId 
      }) as any;

      if (error) {
        console.error('Erro ao buscar reservas:', error);
        setError('Não foi possível carregar as reservas. Tente novamente.');
        showNotification('error', 'Erro ao carregar reservas');
        setLoading(false);
        return;
      }

      // Adicionar log de depuração
      console.log('Reservas encontradas (raw):', data);

      if (!data || data.length === 0) {
        console.log('Nenhuma reserva encontrada');
        setBookings([]);
        setLoading(false);
        return;
      }

      // Transformar os dados - agora com mais logging
      const formattedBookings: BookingWithEquipment[] = await Promise.all(data.map(async (booking: any) => {
        console.log('Processando reserva:', booking.id);
        
        // Buscar informações do equipamento
        const { data: equipmentData } = await supabase
          .from('equipment')
          .select('id, name, image, category, daily_rate')
          .eq('id', booking.equipment_id)
          .single();
          
        console.log('Informações do equipamento:', equipmentData);
        
        // Buscar informações do cliente
        const { data: clientData } = await supabase
          .from('profiles')
          .select('name, phone')
          .eq('id', booking.user_id)
          .single();
          
        console.log('Informações do cliente:', clientData);
        
        return {
          ...booking,
          equipment: equipmentData || {
            id: booking.equipment_id,
            name: 'Equipamento não encontrado',
            image: null,
            category: '',
            daily_rate: 0
          },
          clientName: clientData?.name || 'Cliente não encontrado',
          clientContact: clientData?.phone || ''
        };
      }));

      console.log('Reservas formatadas:', formattedBookings.length);
      setBookings(formattedBookings);
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
      setError('Não foi possível carregar as reservas. Tente novamente.');
      showNotification('error', 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar filtros de data
  const clearDateFilters = () => {
    setStartDateFilter(null);
    setEndDateFilter(null);
    setDateRangePreset('custom');
  };

  // Função para aplicar filtros de data predefinidos
  const applyDatePreset = (preset: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    switch(preset) {
      case 'today':
        setStartDateFilter(today);
        setEndDateFilter(tomorrow);
        break;
      case 'last7days':
        setStartDateFilter(oneWeekAgo);
        setEndDateFilter(tomorrow);
        break;
      case 'last30days':
        setStartDateFilter(oneMonthAgo);
        setEndDateFilter(tomorrow);
        break;
      case 'next7days':
        setStartDateFilter(today);
        setEndDateFilter(nextWeek);
        break;
      case 'next30days':
        setStartDateFilter(today);
        setEndDateFilter(nextMonth);
        break;
      case 'custom':
        // Não faz nada, mantém os valores atuais
        break;
      default:
        clearDateFilters();
    }
    
    setDateRangePreset(preset);
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Filtrar por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.equipment?.name.toLowerCase().includes(searchLower) ||
        booking.clientName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por status
    if (statusFilter) {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Filtrar por equipamento
    if (equipmentFilter) {
      filtered = filtered.filter(booking => booking.equipment_id === equipmentFilter);
    }

    // Filtrar por data de início
    if (startDateFilter) {
      filtered = filtered.filter(booking => {
        const bookingStart = new Date(booking.start_date);
        bookingStart.setHours(0, 0, 0, 0);
        const filterStart = new Date(startDateFilter);
        filterStart.setHours(0, 0, 0, 0);
        
        return bookingStart >= filterStart;
      });
    }
    
    // Filtrar por data de término
    if (endDateFilter) {
      filtered = filtered.filter(booking => {
        const bookingEnd = new Date(booking.end_date);
        bookingEnd.setHours(0, 0, 0, 0);
        const filterEnd = new Date(endDateFilter);
        filterEnd.setHours(0, 0, 0, 0);
        
        return bookingEnd <= filterEnd;
      });
    }
    
    setFilteredBookings(filtered);
  };

  const handleOpenDetails = (booking: BookingWithEquipment) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedBooking(null);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      // Atualizar o status da reserva
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Erro ao atualizar status da reserva:', error);
        throw error;
      }
      
      // Atualizar a lista local
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );

      // Criar notificação para o cliente
      const booking = bookings.find(b => b.id === bookingId);
      if (booking && booking.user_id) {
        const statusMessages: {[key: string]: string} = {
          confirmado: 'Sua reserva foi confirmada',
          em_andamento: 'Sua reserva foi iniciada',
          finalizado: 'Sua reserva foi finalizada',
          cancelado: 'Sua reserva foi cancelada'
        };
        
        try {
          // Inserir a notificação no banco de dados
          await supabase.rpc('insert_notification', {
            p_user_id: booking.user_id,
            p_title: `Atualização de Reserva: ${statusMessages[newStatus] || 'Status atualizado'}`,
            p_message: `A reserva do equipamento "${booking.equipment?.name}" teve seu status atualizado para "${newStatus}".`
          });
        } catch (notificationError) {
          console.error('Erro ao criar notificação:', notificationError);
          // Não lançamos o erro para não interromper o fluxo principal
        }
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return Promise.reject(error);
    }
  };

  // Renderização condicional para estados de loading e erro
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in={true} timeout={800}>
        <Box>
          <SectionHeader 
            title="Gerenciar Reservas" 
            subtitle="Acompanhe e gerencie as reservas dos seus equipamentos" 
          />
          
          {/* Estatísticas */}
          <BookingStats bookings={bookings} />
          
          {/* Filtros */}
          <BookingFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            equipmentFilter={equipmentFilter}
            setEquipmentFilter={setEquipmentFilter}
            equipments={equipments}
          />
          
          {/* Filtros de data aprimorados */}
          <Paper 
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Filtrar por período da reserva
            </Typography>
            
            {/* Presets de data */}
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button 
                size="small" 
                variant={dateRangePreset === 'today' ? 'contained' : 'outlined'}
                onClick={() => applyDatePreset('today')}
              >
                Hoje
              </Button>
              <Button 
                size="small" 
                variant={dateRangePreset === 'last7days' ? 'contained' : 'outlined'}
                onClick={() => applyDatePreset('last7days')}
              >
                Últimos 7 dias
              </Button>
              <Button 
                size="small" 
                variant={dateRangePreset === 'last30days' ? 'contained' : 'outlined'}
                onClick={() => applyDatePreset('last30days')}
              >
                Últimos 30 dias
              </Button>
              <Button 
                size="small" 
                variant={dateRangePreset === 'next7days' ? 'contained' : 'outlined'}
                onClick={() => applyDatePreset('next7days')}
              >
                Próximos 7 dias
              </Button>
              <Button 
                size="small" 
                variant={dateRangePreset === 'next30days' ? 'contained' : 'outlined'}
                onClick={() => applyDatePreset('next30days')}
              >
                Próximos 30 dias
              </Button>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <DatePicker
                  label="Data de início"
                  value={startDateFilter}
                  onChange={(newDate) => {
                    setStartDateFilter(newDate);
                    setDateRangePreset('custom');
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon size={18} />
                          </InputAdornment>
                        )
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <DatePicker
                  label="Data de término"
                  value={endDateFilter}
                  onChange={(newDate) => {
                    setEndDateFilter(newDate);
                    setDateRangePreset('custom');
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon size={18} />
                          </InputAdornment>
                        )
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Box display="flex" justifyContent="flex-end">
                  <Typography 
                    variant="body2" 
                    color="primary" 
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { textDecoration: 'underline' } 
                    }}
                    onClick={clearDateFilters}
                  >
                    Limpar datas
                  </Typography>
                </Box>
              </Grid>
              {(startDateFilter || endDateFilter) && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Filtro ativo: {startDateFilter?.toLocaleDateString() || '...'} até {endDateFilter?.toLocaleDateString() || '...'}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          {/* Abas para diferentes status */}
          <Paper elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Todas" />
              <Tab label={`Pendentes (${bookings.filter(b => b.status === 'pendente').length})`} />
              <Tab label={`Confirmadas (${bookings.filter(b => b.status === 'confirmado').length})`} />
              <Tab label={`Em Andamento (${bookings.filter(b => b.status === 'em_andamento').length})`} />
              <Tab label={`Finalizadas (${bookings.filter(b => b.status === 'finalizado').length})`} />
              <Tab label={`Canceladas (${bookings.filter(b => b.status === 'cancelado').length})`} />
            </Tabs>
          </Paper>
          
          {/* Lista de reservas com base na aba selecionada */}
          {filteredBookings.length === 0 ? (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 8, 
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <Package2 size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
              <Typography variant="h6" color="text.secondary">
                Nenhuma reserva encontrada
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mt: 1 }}>
                {searchTerm || statusFilter || equipmentFilter || startDateFilter || endDateFilter ? 
                  'Tente ajustar os filtros para ver mais resultados.' : 
                  'Você ainda não possui reservas para seus equipamentos.'}
              </Typography>
            </Box>
          ) : (
            <>
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  {filteredBookings.map(booking => (
                    <Grid item xs={12} sm={6} md={4} key={booking.id}>
                      <BookingCard 
                        booking={booking} 
                        onClick={() => handleOpenDetails(booking)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  {filteredBookings
                    .filter(booking => booking.status === 'pendente')
                    .map(booking => (
                      <Grid item xs={12} sm={6} md={4} key={booking.id}>
                        <BookingCard 
                          booking={booking} 
                          onClick={() => handleOpenDetails(booking)}
                        />
                      </Grid>
                    ))}
                </Grid>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  {filteredBookings
                    .filter(booking => booking.status === 'confirmado')
                    .map(booking => (
                      <Grid item xs={12} sm={6} md={4} key={booking.id}>
                        <BookingCard 
                          booking={booking} 
                          onClick={() => handleOpenDetails(booking)}
                        />
                      </Grid>
                    ))}
                </Grid>
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                  {filteredBookings
                    .filter(booking => booking.status === 'em_andamento')
                    .map(booking => (
                      <Grid item xs={12} sm={6} md={4} key={booking.id}>
                        <BookingCard 
                          booking={booking} 
                          onClick={() => handleOpenDetails(booking)}
                        />
                      </Grid>
                    ))}
                </Grid>
              </TabPanel>
              
              <TabPanel value={tabValue} index={4}>
                <Grid container spacing={3}>
                  {filteredBookings
                    .filter(booking => booking.status === 'finalizado')
                    .map(booking => (
                      <Grid item xs={12} sm={6} md={4} key={booking.id}>
                        <BookingCard 
                          booking={booking} 
                          onClick={() => handleOpenDetails(booking)}
                        />
                      </Grid>
                    ))}
                </Grid>
              </TabPanel>
              
              <TabPanel value={tabValue} index={5}>
                <Grid container spacing={3}>
                  {filteredBookings
                    .filter(booking => booking.status === 'cancelado')
                    .map(booking => (
                      <Grid item xs={12} sm={6} md={4} key={booking.id}>
                        <BookingCard 
                          booking={booking} 
                          onClick={() => handleOpenDetails(booking)}
                        />
                      </Grid>
                    ))}
                </Grid>
              </TabPanel>
            </>
          )}
          
          {/* Modal de detalhes */}
          <BookingDetailsDialog
            booking={selectedBooking}
            open={detailsOpen}
            onClose={handleCloseDetails}
            onStatusChange={handleStatusChange}
            userType="owner"
          />
        </Box>
      </Fade>
    </Container>
  );
};

export default OwnerBookingsDashboard; 