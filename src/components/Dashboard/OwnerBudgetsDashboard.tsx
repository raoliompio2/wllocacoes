import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { BudgetRequest } from '../../types/types';
import { 
  Box, 
  Typography, 
  Container,
  Grid,
  CircularProgress,
  Paper,
  InputAdornment,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CalendarIcon, CheckCircle, FileQuestion } from 'lucide-react';
import {
  BudgetCard,
  BudgetFilters,
  BudgetStats,
  BudgetDetailsDialog
} from '../Budgets';

// Componente para o cabeçalho da seção
const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <Box mb={3}>
    <Typography variant="h5" fontWeight={600}>{title}</Typography>
    {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
  </Box>
);

// Interface para o componente TabPanel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componente TabPanel
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`budget-tabpanel-${index}`}
      aria-labelledby={`budget-tab-${index}`}
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

// Componente EmptyState reutilizável
const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
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
    <Box sx={{ mb: 2, opacity: 0.3 }}>{icon}</Box>
    <Typography variant="h6" color="text.secondary">{title}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mt: 1 }}>
      {description}
    </Typography>
  </Box>
);

// Componente principal para gerenciar orçamentos
const OwnerBudgetsDashboard: React.FC = () => {
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
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBudgetRequests();
    }
  }, [user]);

  const fetchBudgetRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Buscar orçamentos do proprietário sem relações aninhadas
      const { data, error } = await supabase
        .from('budget_requests')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar orçamentos:', error);
        setError('Não foi possível carregar seus orçamentos.');
        showNotification('error', 'Erro ao carregar orçamentos');
        setLoading(false);
        return;
      }

      // Processamento manual dos orçamentos para buscar informações relacionadas
      if (data && data.length > 0) {
        const budgetsPromises = data.map(async (budget) => {
          try {
            // Buscar informações do equipamento
            const { data: equipmentData } = await supabase
              .from('equipment')
              .select('id, name, image, category')
              .eq('id', budget.equipment_id)
              .single();
            
            let clientData = null;
            
            // Se for orçamento via WhatsApp sem client_id, usar os dados do cliente salvos diretamente
            if (budget.contact_method === 'whatsapp' && !budget.client_id) {
              clientData = {
                id: null,
                name: budget.client_name || 'Cliente WhatsApp',
                email: budget.client_email || null,
                phone: budget.client_phone || null,
                avatar_url: null
              };
            } 
            // Caso contrário, buscar informações do cliente normalmente
            else if (budget.client_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('id, name, email, phone, avatar_url')
                .eq('id', budget.client_id)
                .single();
              
              clientData = profileData;
            }
            
            // Retornar o orçamento processado com informações relacionadas
            return {
              ...budget,
              equipment: equipmentData || null,
              client: clientData || null
            };
          } catch (err) {
            console.error(`Erro ao processar orçamento ${budget.id}:`, err);
            // Retornar o orçamento sem informações relacionadas em caso de erro
            return {
              ...budget,
              equipment: null,
              client: null
            };
          }
        });
        
        const processedBudgets = await Promise.all(budgetsPromises);
        setBudgetRequests(processedBudgets as BudgetRequest[]);
      } else {
        setBudgetRequests([]);
      }
    } catch (err) {
      console.error('Erro ao buscar orçamentos:', err);
      setError('Não foi possível carregar seus orçamentos.');
      showNotification('error', 'Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir os detalhes do orçamento
  const handleOpenBudgetDetails = (budget: BudgetRequest) => {
    setSelectedBudget(budget);
    setDialogOpen(true);
  };

  // Função para fechar o diálogo de detalhes
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBudget(null);
  };

  // Função para atualizar o status do orçamento
  const handleStatusUpdate = async (budgetId: string, newStatus: string, amount?: number): Promise<void> => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (amount !== undefined) {
        updateData.total_amount = amount;
      }
      
      const { error } = await supabase
        .from('budget_requests')
        .update(updateData)
        .eq('id', budgetId);

      if (error) throw error;
      
      // Atualiza a lista de orçamentos
      setBudgetRequests(prev => 
        prev.map(budget => 
          budget.id === budgetId 
            ? { ...budget, ...updateData } 
            : budget
        )
      );
      
      showNotification('success', `Orçamento atualizado com sucesso!`);
    } catch (err) {
      console.error('Erro ao atualizar orçamento:', err);
      showNotification('error', 'Não foi possível atualizar o orçamento');
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

  // Função para converter orçamento em reserva
  const handleConvertToBooking = async (budgetId: string): Promise<void> => {
    if (!user || !selectedBudget) return;
    
    try {
      // 1. Verificamos se o orçamento está aprovado
      if (selectedBudget.status !== 'approved') {
        showNotification('error', 'Apenas orçamentos aprovados podem ser convertidos em reservas');
        return;
      }
      
      // 2. Criamos uma nova reserva na tabela de bookings
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          equipment_id: selectedBudget.equipment_id,
          user_id: selectedBudget.client_id,
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
        .eq('id', budgetId);

      if (convertError) throw convertError;
      
      // Atualiza a lista de orçamentos
      setBudgetRequests(prev => 
        prev.map(budget => 
          budget.id === budgetId 
            ? { ...budget, status: 'converted' } 
            : budget
        )
      );
      
      // Atualiza o orçamento selecionado
      setSelectedBudget(prev => prev ? { ...prev, status: 'converted' } : null);
      
      showNotification('success', 'Orçamento convertido em reserva com sucesso!');
    } catch (err) {
      console.error('Erro ao converter orçamento em reserva:', err);
      showNotification('error', 'Não foi possível converter o orçamento em reserva');
    }
  };

  // Filtragem de orçamentos por status, termo de pesquisa e datas
  const filteredBudgets = budgetRequests
    .filter(budget => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      
      return (
        budget.equipment?.name?.toLowerCase().includes(searchLower) ||
        budget.client?.name?.toLowerCase().includes(searchLower) ||
        budget.special_requirements?.toLowerCase().includes(searchLower) ||
        budget.delivery_address?.toLowerCase().includes(searchLower)
      );
    })
    .filter(budget => {
      // Filtrar pelo período em que o orçamento foi recebido (created_at)
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

  // Contadores para os diferentes status
  const pendingCount = budgetRequests.filter(b => b.status === 'pending').length;
  const respondedCount = budgetRequests.filter(b => b.status === 'responded').length;
  const approvedCount = budgetRequests.filter(b => b.status === 'approved').length;
  const rejectedCount = budgetRequests.filter(b => b.status === 'rejected').length;
  const convertedCount = budgetRequests.filter(b => b.status === 'converted').length;

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
      <Box>
        <SectionHeader 
          title="Gerenciar Orçamentos" 
          subtitle="Visualize e responda aos orçamentos recebidos" 
        />
        
        {/* Estatísticas */}
        <BudgetStats 
          pendingCount={pendingCount}
          respondedCount={respondedCount}
          approvedCount={approvedCount}
          rejectedCount={rejectedCount}
          convertedCount={convertedCount}
          totalCount={budgetRequests.length}
        />
        
        {/* Filtros */}
        <BudgetFilters 
          filterStatus={filterStatus}
          onFilterChange={(status) => {
            setFilterStatus(status);
            // Sincronizar a aba com o status selecionado no filtro
            if (status === 'all') setTabValue(0);
            else if (status === 'pending') setTabValue(1);
            else if (status === 'responded') setTabValue(2);
            else if (status === 'approved') setTabValue(3);
            else if (status === 'converted') setTabValue(4);
          }}
          onRefresh={() => {
            fetchBudgetRequests();
            clearDateFilters();
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
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
            Filtrar por período de recebimento
          </Typography>
          
          {/* Presets de data */}
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button 
              size="small" 
              variant={dateRangePreset === 'today' ? 'contained' : 'outlined'}
              onClick={() => applyDatePreset('today')}
            >
              Recebidos hoje
            </Button>
            <Button 
              size="small" 
              variant={dateRangePreset === 'last7days' ? 'contained' : 'outlined'}
              onClick={() => applyDatePreset('last7days')}
            >
              Recebidos últimos 7 dias
            </Button>
            <Button 
              size="small" 
              variant={dateRangePreset === 'last30days' ? 'contained' : 'outlined'}
              onClick={() => applyDatePreset('last30days')}
            >
              Recebidos últimos 30 dias
            </Button>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <DatePicker
                label="Data inicial de recebimento"
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
                label="Data final de recebimento"
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
                    Filtro ativo: Orçamentos recebidos entre {startDateFilter?.toLocaleDateString() || '...'} e {endDateFilter?.toLocaleDateString() || '...'}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
        
        {/* Tabs para diferentes status */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 2, 
            mb: 3, 
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => {
                setTabValue(newValue);
                // Atualizar o filtro de status com base na aba selecionada
                switch(newValue) {
                  case 0: // Todos
                    setFilterStatus('all');
                    break;
                  case 1: // Pendentes
                    setFilterStatus('pending');
                    break;
                  case 2: // Respondidos
                    setFilterStatus('responded');
                    break;
                  case 3: // Aprovados
                    setFilterStatus('approved');
                    break;
                  case 4: // Convertidos
                    setFilterStatus('converted');
                    break;
                  default:
                    setFilterStatus('all');
                }
              }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Todos os Orçamentos" />
              <Tab label={`Pendentes (${pendingCount})`} />
              <Tab label={`Respondidos (${respondedCount})`} />
              <Tab label={`Aprovados (${approvedCount})`} />
              <Tab label={`Convertidos (${convertedCount})`} />
            </Tabs>
          </Box>
        </Paper>
        
        {/* Lista de orçamentos */}
        <>
          <TabPanel value={tabValue} index={0}>
            {filteredBudgets.length === 0 ? (
              <EmptyState 
                icon={<FileQuestion size={48} />}
                title="Nenhum orçamento encontrado" 
                description={
                  searchTerm || startDateFilter || endDateFilter
                    ? "Tente remover alguns filtros para ver mais resultados."
                    : "Você ainda não recebeu nenhum pedido de orçamento."
                }
              />
            ) : (
              <Grid container spacing={3}>
                {filteredBudgets.map((budget) => (
                  <Grid item xs={12} sm={6} md={4} key={budget.id}>
                    <BudgetCard 
                      budget={budget}
                      onViewDetails={() => handleOpenBudgetDetails(budget)}
                      highlight={budget.status === 'approved' || budget.status === 'converted'}
                      isOwnerView={true}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {filteredBudgets.filter(budget => budget.status === 'pending').length === 0 ? (
              <EmptyState 
                icon={<FileQuestion size={48} />}
                title="Nenhum orçamento pendente" 
                description={
                  searchTerm || startDateFilter || endDateFilter
                    ? "Tente remover alguns filtros para ver mais resultados."
                    : "Você não tem orçamentos pendentes no momento."
                }
              />
            ) : (
              <Grid container spacing={3}>
                {filteredBudgets.filter(budget => budget.status === 'pending').map((budget) => (
                  <Grid item xs={12} sm={6} md={4} key={budget.id}>
                    <BudgetCard 
                      budget={budget}
                      onViewDetails={() => handleOpenBudgetDetails(budget)}
                      highlight={false}
                      isOwnerView={true}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            {filteredBudgets.filter(budget => budget.status === 'responded').length === 0 ? (
              <EmptyState 
                icon={<FileQuestion size={48} />}
                title="Nenhum orçamento respondido" 
                description={
                  searchTerm || startDateFilter || endDateFilter
                    ? "Tente remover alguns filtros para ver mais resultados."
                    : "Você não tem orçamentos respondidos no momento."
                }
              />
            ) : (
              <Grid container spacing={3}>
                {filteredBudgets.filter(budget => budget.status === 'responded').map((budget) => (
                  <Grid item xs={12} sm={6} md={4} key={budget.id}>
                    <BudgetCard 
                      budget={budget}
                      onViewDetails={() => handleOpenBudgetDetails(budget)}
                      highlight={false}
                      isOwnerView={true}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            {filteredBudgets.filter(budget => budget.status === 'approved').length === 0 ? (
              <EmptyState 
                icon={<FileQuestion size={48} />}
                title="Nenhum orçamento aprovado" 
                description={
                  searchTerm || startDateFilter || endDateFilter
                    ? "Tente remover alguns filtros para ver mais resultados."
                    : "Você não tem orçamentos aprovados no momento."
                }
              />
            ) : (
              <Grid container spacing={3}>
                {filteredBudgets.filter(budget => budget.status === 'approved').map((budget) => (
                  <Grid item xs={12} sm={6} md={4} key={budget.id}>
                    <BudgetCard 
                      budget={budget}
                      onViewDetails={() => handleOpenBudgetDetails(budget)}
                      highlight={true}
                      isOwnerView={true}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            {filteredBudgets.filter(budget => budget.status === 'converted').length === 0 ? (
              <EmptyState 
                icon={<FileQuestion size={48} />}
                title="Nenhum orçamento convertido" 
                description={
                  searchTerm || startDateFilter || endDateFilter
                    ? "Tente remover alguns filtros para ver mais resultados."
                    : "Você não tem orçamentos convertidos em reservas no momento."
                }
              />
            ) : (
              <Grid container spacing={3}>
                {filteredBudgets.filter(budget => budget.status === 'converted').map((budget) => (
                  <Grid item xs={12} sm={6} md={4} key={budget.id}>
                    <BudgetCard 
                      budget={budget}
                      onViewDetails={() => handleOpenBudgetDetails(budget)}
                      highlight={true}
                      isOwnerView={true}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </>
        
        {/* Modal de detalhes */}
        <BudgetDetailsDialog
          budget={selectedBudget}
          open={dialogOpen}
          onClose={handleCloseDialog}
          onRespondBudget={async (amount, status) => {
            await handleStatusUpdate(selectedBudget?.id || '', status, amount);
          }}
          onMessageSent={() => {
            if (selectedBudget && selectedBudget.status === 'pending') {
              handleStatusUpdate(selectedBudget.id, 'responded');
            }
          }}
          onConvertToBooking={handleConvertToBooking}
        />
      </Box>
    </Container>
  );
};

export default OwnerBudgetsDashboard; 