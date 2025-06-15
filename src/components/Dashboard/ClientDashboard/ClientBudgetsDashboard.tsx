import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { BudgetRequest, BookingWithEquipment } from '../../../types/types';
import { 
  Box, 
  Typography, 
  Container,
  Grid,
  Fade,
  CircularProgress,
  Paper,
  Divider,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import {
  BudgetCard,
  BudgetFilters,
  BudgetStats,
  ClientBudgetDetailsDialog
} from '../../Budgets';
import {
  BookingCard,
  BookingDetailsDialog
} from '../../Bookings';

// Componente para o cabeçalho da seção
const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <Box mb={3}>
    <Typography variant="h5" fontWeight={600}>{title}</Typography>
    {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
  </Box>
);

// Componente principal para gerenciar orçamentos do cliente
const ClientBudgetsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
  const [dateRangePreset, setDateRangePreset] = useState<string>('custom');
  
  // Estados para reservas confirmadas
  const [bookings, setBookings] = useState<BookingWithEquipment[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithEquipment | null>(null);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user) {
      fetchBudgetRequests();
      fetchConfirmedBookings();
    }
  }, [user]);

  const fetchBudgetRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Obter os orçamentos com dados do equipamento
      const { data: budgetData, error: budgetError } = await supabase
        .from('budget_requests')
        .select(`
          *,
          equipment (
            id,
            name,
            image,
            category,
            daily_rate,
            weekly_rate,
            monthly_rate,
            user_id
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (budgetError) throw budgetError;
      
      // Buscar informações dos proprietários
      const budgetsWithOwnerInfo = await Promise.all(
        (budgetData || []).map(async (budget) => {
          try {
            const { data: ownerData, error: ownerError } = await supabase
              .from('profiles')
              .select('id, name, whatsapp, address')
              .eq('id', budget.owner_id)
              .single();
              
            if (ownerError) {
              console.warn(`Erro ao buscar dados do proprietário ${budget.owner_id}:`, ownerError);
              return { 
                ...budget, 
                ownerName: null,
                ownerWhatsapp: null,
                ownerAddress: null
              };
            }
            
            return { 
              ...budget, 
              ownerName: ownerData.name,
              ownerWhatsapp: ownerData.whatsapp,
              ownerAddress: ownerData.address
            };
          } catch (err) {
            console.warn(`Erro ao processar dados do proprietário ${budget.owner_id}:`, err);
            return { 
              ...budget, 
              ownerName: null,
              ownerWhatsapp: null,
              ownerAddress: null
            };
          }
        })
      );
      
      setBudgetRequests(budgetsWithOwnerInfo);
    } catch (err) {
      console.error('Erro ao buscar orçamentos:', err);
      showNotification('error', 'Não foi possível carregar os orçamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBudget = async () => {
    if (!selectedBudget || !user) return;
    
    try {
      // 1. Primeiro atualizamos o status para 'approved'
      const { error: updateError } = await supabase
        .from('budget_requests')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBudget.id);

      if (updateError) throw updateError;
      
      // 2. Criamos uma nova reserva na tabela de bookings
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          equipment_id: selectedBudget.equipment_id,
          user_id: user.id,
          start_date: selectedBudget.start_date,
          end_date: selectedBudget.end_date,
          total_price: selectedBudget.total_amount?.toString() || '0',
          status: 'confirmado',
          special_requirements: selectedBudget.special_requirements,
          delivery_address: selectedBudget.delivery_address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (bookingError) throw bookingError;
      
      // 3. Atualizamos o status do orçamento para 'converted'
      const { error: convertError } = await supabase
        .from('budget_requests')
        .update({
          status: 'converted',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBudget.id);

      if (convertError) throw convertError;
      
      // Atualiza a lista de orçamentos
      setBudgetRequests(prev => 
        prev.map(budget => 
          budget.id === selectedBudget.id 
            ? { ...budget, status: 'converted' } 
            : budget
        )
      );
      
      // Atualiza o orçamento selecionado
      setSelectedBudget(prev => prev ? { ...prev, status: 'converted' } : null);
      
      showNotification('success', 'Orçamento aprovado e convertido em reserva com sucesso!');
      setDialogOpen(false);
    } catch (err) {
      console.error('Erro ao aprovar orçamento:', err);
      showNotification('error', 'Não foi possível aprovar o orçamento');
    }
  };

  const handleRejectBudget = async () => {
    if (!selectedBudget || !user) return;
    
    try {
      const { error } = await supabase
        .from('budget_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBudget.id);

      if (error) throw error;
      
      // Atualiza a lista de orçamentos
      setBudgetRequests(prev => 
        prev.map(budget => 
          budget.id === selectedBudget.id 
            ? { ...budget, status: 'rejected' } 
            : budget
        )
      );
      
      // Atualiza o orçamento selecionado
      setSelectedBudget(prev => prev ? { ...prev, status: 'rejected' } : null);
      
      showNotification('success', 'Orçamento rejeitado com sucesso!');
      setDialogOpen(false);
    } catch (err) {
      console.error('Erro ao rejeitar orçamento:', err);
      showNotification('error', 'Não foi possível rejeitar o orçamento');
    }
  };

  const handleMessageSent = () => {
    // Apenas atualiza para ter os dados mais recentes
    fetchBudgetRequests();
  };

  // Filtragem de orçamentos por status, termo de pesquisa e datas
  const filteredBudgets = budgetRequests
    .filter(budget => {
      // Filtro por status
      if (filterStatus === 'all') return true;
      console.log('Comparando status:', budget.status, 'com filtro:', filterStatus);
      return budget.status === filterStatus;
    })
    .filter(budget => {
      // Filtro por termo de busca
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      
      return (
        budget.equipment?.name?.toLowerCase().includes(searchLower) ||
        budget.ownerName?.toLowerCase().includes(searchLower) ||
        budget.special_requirements?.toLowerCase().includes(searchLower) ||
        budget.delivery_address?.toLowerCase().includes(searchLower)
      );
    })
    .filter(budget => {
      // Filtro pelo período em que o orçamento foi enviado (created_at)
      if (startDateFilter || endDateFilter) {
        const budgetCreatedAt = new Date(budget.created_at);
        budgetCreatedAt.setHours(0, 0, 0, 0);
        
        // Verificar data inicial do filtro
        if (startDateFilter) {
          const filterStart = new Date(startDateFilter);
          filterStart.setHours(0, 0, 0, 0);
          
          if (budgetCreatedAt < filterStart) {
            return false;
          }
        }
        
        // Verificar data final do filtro
        if (endDateFilter) {
          const filterEnd = new Date(endDateFilter);
          filterEnd.setHours(0, 0, 0, 0);
          
          if (budgetCreatedAt > filterEnd) {
            return false;
          }
        }
      }
      
      return true;
    });

  // Função para buscar reservas confirmadas do cliente
  const fetchConfirmedBookings = async () => {
    if (!user) return;
    
    setLoadingBookings(true);
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
            daily_rate
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['confirmado', 'em_andamento'])
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      
      // Buscar informações dos proprietários
      const bookingsWithOwnerInfo = await Promise.all(
        (data || []).map(async (booking) => {
          try {
            // Buscar informações do proprietário via equipment.user_id
            const { data: equipData } = await supabase
              .from('equipment')
              .select('user_id')
              .eq('id', booking.equipment_id)
              .single();
              
            if (!equipData) return booking;
            
            const { data: ownerData } = await supabase
              .from('profiles')
              .select('name, phone')
              .eq('id', equipData.user_id)
              .single();
              
            return { 
              ...booking,
              ownerName: ownerData?.name || 'Proprietário não encontrado',
              ownerContact: ownerData?.phone || ''
            };
          } catch (err) {
            console.warn(`Erro ao buscar dados do proprietário para reserva ${booking.id}:`, err);
            return booking;
          }
        })
      );
      
      setBookings(bookingsWithOwnerInfo);
    } catch (err) {
      console.error('Erro ao buscar reservas confirmadas:', err);
      showNotification('error', 'Não foi possível carregar as reservas');
    } finally {
      setLoadingBookings(false);
    }
  };
  
  const handleOpenBookingDetails = (booking: BookingWithEquipment) => {
    setSelectedBooking(booking);
    setBookingDetailsOpen(true);
  };
  
  const handleCloseBookingDetails = () => {
    setBookingDetailsOpen(false);
    setSelectedBooking(null);
  };

  // Contagem de orçamentos por status
  const pendingCount = budgetRequests.filter(b => b.status === 'pending').length;
  const respondedCount = budgetRequests.filter(b => b.status === 'responded').length;
  const approvedCount = budgetRequests.filter(b => b.status === 'approved').length;
  const convertedCount = budgetRequests.filter(b => b.status === 'converted').length;
  const rejectedCount = budgetRequests.filter(b => b.status === 'rejected').length;

  // Log para depuração dos orçamentos e seus status
  useEffect(() => {
    console.log('Status dos orçamentos:', budgetRequests.map(b => ({ id: b.id, status: b.status })));
    console.log('Contagens: pendentes:', pendingCount, 'respondidos:', respondedCount, 
      'aprovados:', approvedCount, 'convertidos:', convertedCount, 'rejeitados:', rejectedCount);
  }, [budgetRequests]);

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
      case 'custom':
        // Não faz nada, mantém os valores atuais
        break;
      default:
        clearDateFilters();
    }
    
    setDateRangePreset(preset);
  };

  // Aplicar os filtros de data e imprimir informação para depuração
  useEffect(() => {
    if (startDateFilter || endDateFilter) {
      console.log('Filtros de data aplicados:', { 
        inicio: startDateFilter ? startDateFilter.toISOString() : 'não definido', 
        fim: endDateFilter ? endDateFilter.toISOString() : 'não definido'
      });
    }
  }, [startDateFilter, endDateFilter]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <SectionHeader 
        title="Orçamentos e Reservas" 
        subtitle="Gerencie orçamentos solicitados e acompanhe suas reservas confirmadas"
      />
      
      {/* Painel de estatísticas atualizados para incluir convertidos */}
      <BudgetStats
        pendingCount={pendingCount}
        respondedCount={respondedCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        convertedCount={convertedCount}
        totalCount={budgetRequests.length}
      />
      
      {/* Tabs para alternar entre orçamentos e reservas */}
      <Paper sx={{ borderRadius: 2, mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab label="Orçamentos" />
          <Tab label={`Reservas Confirmadas (${bookings.length})`} />
        </Tabs>
      </Paper>
      
      {/* Conteúdo da tab de orçamentos */}
      {tabValue === 0 && (
        <>
          {/* Filtros de orçamentos */}
          <BudgetFilters 
            filterStatus={filterStatus} 
            onFilterChange={(value) => {
              console.log('Mudando filtro de status para:', value);
              setFilterStatus(value);
            }}
            onRefresh={() => {
              console.log('Atualizando orçamentos...');
              fetchBudgetRequests();
              clearDateFilters();
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          
          {/* Filtros de data aprimorados */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Filtrar por período de envio
            </Typography>
            
            {/* Presets de data */}
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button 
                size="small" 
                variant={dateRangePreset === 'today' ? 'contained' : 'outlined'}
                onClick={() => applyDatePreset('today')}
              >
                Enviados hoje
              </Button>
              <Button 
                size="small" 
                variant={dateRangePreset === 'last7days' ? 'contained' : 'outlined'}
                onClick={() => applyDatePreset('last7days')}
              >
                Enviados últimos 7 dias
              </Button>
              <Button 
                size="small" 
                variant={dateRangePreset === 'last30days' ? 'contained' : 'outlined'}
                onClick={() => applyDatePreset('last30days')}
              >
                Enviados últimos 30 dias
              </Button>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <DatePicker
                  label="Data inicial de envio"
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
                  label="Data final de envio"
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
                      Filtro ativo: Orçamentos enviados entre {startDateFilter?.toLocaleDateString() || '...'} e {endDateFilter?.toLocaleDateString() || '...'}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : filteredBudgets.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum orçamento encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {(startDateFilter || endDateFilter) ? 
                  'Tente ajustar os filtros de data ou' : 
                  'Tente ajustar os filtros ou'} solicitar novos orçamentos.
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Orçamentos Aprovados e Convertidos */}
              {(filteredBudgets.some(b => b.status === 'approved' || b.status === 'converted')) && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle size={20} style={{ marginRight: 8 }} /> 
                    Orçamentos Aprovados e Convertidos
                  </Typography>
                  <Grid container spacing={3}>
                    {filteredBudgets
                      .filter(b => b.status === 'approved' || b.status === 'converted')
                      .map((budget) => (
                        <Grid item xs={12} sm={6} md={4} key={budget.id}>
                          <BudgetCard 
                            budget={budget}
                            highlight={true}
                            onViewDetails={() => {
                              setSelectedBudget(budget);
                              setDialogOpen(true);
                            }}
                          />
                        </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {/* Outros Orçamentos */}
              {filteredBudgets.some(b => b.status !== 'approved' && b.status !== 'converted') && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Outros Orçamentos
                  </Typography>
                  <Grid container spacing={3}>
                    {filteredBudgets
                      .filter(b => b.status !== 'approved' && b.status !== 'converted')
                      .map((budget) => (
                        <Grid item xs={12} sm={6} md={4} key={budget.id}>
                          <BudgetCard 
                            budget={budget}
                            onViewDetails={() => {
                              setSelectedBudget(budget);
                              setDialogOpen(true);
                            }}
                          />
                        </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
          
          {/* Diálogo de detalhes do orçamento */}
          <ClientBudgetDetailsDialog
            open={dialogOpen}
            budget={selectedBudget}
            onClose={() => setDialogOpen(false)}
            onApproveBudget={handleApproveBudget}
            onRejectBudget={handleRejectBudget}
            onMessageSent={handleMessageSent}
          />
        </>
      )}
      
      {/* Conteúdo da tab de reservas confirmadas */}
      {tabValue === 1 && (
        <>
          {loadingBookings ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : bookings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhuma reserva confirmada encontrada
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                As reservas criadas a partir de orçamentos aprovados aparecerão aqui.
              </Typography>
            </Paper>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" component="h3">
                  Reservas Confirmadas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estas são suas reservas confirmadas e ativas
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {bookings.map((booking) => (
                  <Grid item xs={12} sm={6} md={4} key={booking.id}>
                    <BookingCard 
                      booking={booking} 
                      onClick={() => handleOpenBookingDetails(booking)}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {/* Diálogo de detalhes da reserva */}
              <BookingDetailsDialog
                booking={selectedBooking}
                open={bookingDetailsOpen}
                onClose={handleCloseBookingDetails}
                userType="client"
              />
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default ClientBudgetsDashboard; 