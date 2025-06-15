import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { Package2, Calendar, Search, SlidersHorizontal, Phone, MapPin } from 'lucide-react';
import { TextField, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';
import ClientBudgetDetailsDialog from '../../../components/Budgets/ClientBudgetDetailsDialog';

interface BudgetRequest {
  id: string;
  equipment_id: string;
  client_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number | null;
  special_requirements: string | null;
  delivery_address: string | null;
  created_at: string;
  equipment: {
    id: string;
    name: string;
    image: string | null;
    category: string;
    user_id: string;
  };
  ownerWhatsapp?: string | null;
  ownerName?: string | null;
  ownerAddress?: string | null;
}

const MyBudgets: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [budgets, setBudgets] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc'>('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  const fetchOwnerInfo = async (ownerId: string): Promise<{ whatsapp: string | null; name: string | null; address: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, whatsapp, address')
        .eq('id', ownerId)
        .single();

      if (error) {
        console.error('Error fetching owner info:', error);
        return { whatsapp: null, name: null, address: null };
      }

      return { 
        whatsapp: data?.whatsapp || null, 
        name: data?.name || null,
        address: data?.address || null
      };
    } catch (err) {
      console.error('Error fetching owner info:', err);
      return { whatsapp: null, name: null, address: null };
    }
  };

  const fetchBudgets = async () => {
    try {
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budget_requests')
        .select(`
          *,
          equipment (
            id,
            name,
            image,
            category,
            user_id
          )
        `)
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (budgetsError) throw budgetsError;

      // Fetch owner info for all budgets
      const budgetsWithOwnerInfo = await Promise.all(
        (budgetsData || []).map(async (budget) => {
          const ownerInfo = await fetchOwnerInfo(budget.owner_id);
          return {
            ...budget,
            ownerWhatsapp: ownerInfo.whatsapp,
            ownerName: ownerInfo.name,
            ownerAddress: ownerInfo.address
          };
        })
      );

      setBudgets(budgetsWithOwnerInfo);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      showNotification('error', 'Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWhatsAppLink = (budget: BudgetRequest) => {
    const whatsapp = budget.ownerWhatsapp;
    if (!whatsapp) return null;

    const message = encodeURIComponent(
      `Olá${budget.ownerName ? ` ${budget.ownerName}` : ''}! Gostaria de conversar sobre o orçamento do equipamento ${budget.equipment.name} para o período de ${new Date(budget.start_date).toLocaleDateString()} a ${new Date(budget.end_date).toLocaleDateString()}`
    );
    
    return `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${message}`;
  };

  const filteredBudgets = budgets
    .filter(budget => {
      const matchesSearch = budget.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || budget.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date_asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleViewDetails = (budget: BudgetRequest) => {
    setSelectedBudget(budget);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedBudget(null);
  };

  const handleApproveBudget = async () => {
    if (!selectedBudget || !user) return;
    
    try {
      // 1. Atualizamos o status para 'approved'
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
      
      showNotification('success', 'Orçamento aprovado e convertido em reserva com sucesso!');
      await fetchBudgets();
      handleCloseDetails();
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
      
      showNotification('success', 'Orçamento rejeitado com sucesso!');
      await fetchBudgets();
      handleCloseDetails();
    } catch (err) {
      console.error('Erro ao rejeitar orçamento:', err);
      showNotification('error', 'Não foi possível rejeitar o orçamento');
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
        <h2 className="text-2xl font-semibold">Meus Orçamentos</h2>
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
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="responded">Respondido</MenuItem>
                <MenuItem value="approved">Aprovado</MenuItem>
                <MenuItem value="rejected">Rejeitado</MenuItem>
                <MenuItem value="converted">Convertido</MenuItem>
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
              </Select>
            </FormControl>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.map((budget) => (
          <div
            key={budget.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="relative h-48">
              {budget.equipment?.image ? (
                <img
                  src={budget.equipment.image}
                  alt={budget.equipment.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Package2 className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-sm ${getStatusColor(budget.status)}`}>
                  {budget.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                {budget.equipment?.name}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                  <div className="text-sm">
                    <p className="text-gray-500">Período</p>
                    <p className="font-medium text-gray-900">
                      {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {budget.total_amount && (
                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <span className="text-gray-600">Valor Total</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(budget.total_amount)}
                    </span>
                  </div>
                )}

                {budget.ownerName && (
                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <span className="text-gray-600">Proprietário</span>
                    <span className="font-medium text-gray-900">{budget.ownerName}</span>
                  </div>
                )}

                <div className="flex mt-4 space-x-2">
                  {budget.ownerWhatsapp && (
                    <a
                      href={getWhatsAppLink(budget)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contato
                    </a>
                  )}
                  
                  {budget.ownerAddress && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(budget.ownerAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver Rota
                    </a>
                  )}

                  <button
                    onClick={() => handleViewDetails(budget)}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200 transition ml-auto"
                  >
                    Detalhes
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredBudgets.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <Package2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhum orçamento encontrado</p>
          </div>
        )}
      </div>

      {/* Diálogo de detalhes do orçamento */}
      <ClientBudgetDetailsDialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        budget={selectedBudget}
        onApproveBudget={handleApproveBudget}
        onRejectBudget={handleRejectBudget}
        onMessageSent={() => {
          // Recarregar os orçamentos após enviar uma mensagem
          fetchBudgets();
        }}
      />
    </div>
  );
};

export default MyBudgets;