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
  InputAdornment,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  BookingCard,
  BookingDetailsDialog
} from '../Bookings';
import { Search, Calendar, Package2, DollarSign, CheckCircle, CalendarIcon } from 'lucide-react';

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
      label: "Reservas Canceladas", 
      value: canceledBookings, 
      total: totalBookings,
      icon: <Package2 className="h-6 w-6" />,
      color: "#d32f2f"
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
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
}> = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
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
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            placeholder="Buscar por nome do equipamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search size={20} color="#666" style={{ marginRight: 8 }} />,
            }}
            variant="outlined"
            size="small"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
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
      </Grid>
    </Paper>
  );
};

const ClientBookingsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [bookings, setBookings] = useState<BookingWithEquipment[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
  const [dateRangePreset, setDateRangePreset] = useState<string>('custom');
  
  // Estado para diálogo de detalhes
  const [selectedBooking, setSelectedBooking] = useState<BookingWithEquipment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, startDateFilter, endDateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Consulta principal para obter as reservas com informações de equipamento
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          equipment (
            id,
            name,
            image,
            category,
            daily_rate,
            average_rating,
            user_id
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Para cada reserva, buscar informações do proprietário
      const bookingsWithOwnerInfo = await Promise.all((bookingsData || []).map(async (booking) => {
        if (booking.equipment?.user_id) {
          const { data: ownerData } = await supabase
            .from('profiles')
            .select('name, phone')
            .eq('id', booking.equipment.user_id)
            .single();

          return {
            ...booking,
            ownerName: ownerData?.name,
            ownerContact: ownerData?.phone
          };
        }
        return booking;
      }));

      setBookings(bookingsWithOwnerInfo);
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
      setError('Não foi possível carregar suas reservas. Tente novamente.');
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
      filtered = filtered.filter(booking => 
        booking.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por status
    if (statusFilter) {
      filtered = filtered.filter(booking => booking.status === statusFilter);
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
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Atualizar a lista local
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );
      
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
            title="Minhas Reservas" 
            subtitle="Gerencie suas reservas de equipamentos" 
          />
          
          {/* Estatísticas */}
          <BookingStats bookings={bookings} />
          
          {/* Filtros */}
          <BookingFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
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
              Filtrar por período
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
          
          {/* Lista de reservas */}
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
                {searchTerm || statusFilter || startDateFilter || endDateFilter ? 
                  'Tente ajustar os filtros para ver mais resultados.' : 
                  'Você ainda não possui reservas de equipamentos.'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredBookings.map((booking) => (
                <Grid item xs={12} sm={6} md={4} key={booking.id}>
                  <BookingCard 
                    booking={booking} 
                    onClick={() => handleOpenDetails(booking)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Modal de detalhes */}
          <BookingDetailsDialog
            booking={selectedBooking}
            open={detailsOpen}
            onClose={handleCloseDetails}
            onStatusChange={handleStatusChange}
            userType="client"
          />
        </Box>
      </Fade>
    </Container>
  );
};

export default ClientBookingsDashboard; 