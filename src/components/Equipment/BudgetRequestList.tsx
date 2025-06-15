import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Package2, Calendar, Search, SlidersHorizontal, Phone, MessageSquare, Clock, MapPin } from 'lucide-react';
import { TextField, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';
import BudgetResponseForm from '../Equipment/BudgetResponseForm';
import BudgetChat from '../Equipment/BudgetChat';
import { BudgetRequest } from '../../types/types';

const BudgetRequestList: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [budgetRequests, setBudgetRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string; end: string}>({
    start: '',
    end: ''
  });
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc'>('date_desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      checkUserRole();
      fetchBudgetRequests();
    }
  }, [user]);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, dateRange, sortBy, budgetRequests]);

  const checkUserRole = async () => {
    try {
      // Verificar se o usuário está autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Erro na sessão:", sessionError);
        setError("Erro de autenticação. Por favor, faça login novamente.");
        return;
      }
      
      console.log("Sessão válida:", session.user.id);
      
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', user?.id || '')
        .single();
      
      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        return;
      }
      
      console.log("Perfil do usuário:", profileData);
      setUserRole(profileData?.role || null);
      
      if (profileData?.role !== 'proprietario') {
        setError("Você precisa ser um proprietário para visualizar orçamentos.");
      }
    } catch (err) {
      console.error("Erro ao verificar perfil:", err);
    }
  };

  const filterRequests = () => {
    if (!budgetRequests.length) {
      setFilteredRequests([]);
      return;
    }
    
    let filtered = [...budgetRequests];

    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter(request => 
        new Date(request.start_date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(request => 
        new Date(request.end_date) <= new Date(dateRange.end)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date_asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredRequests(filtered);
  };

  const fetchBudgetRequests = async () => {
    if (!user) {
      setError("Usuário não encontrado. Por favor, faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Se o user.id for undefined, vamos usar uma string vazia
      // que não vai corresponder a nenhum registro no banco
      const ownerId = user.id || '';
      console.log("Buscando orçamentos para proprietário:", ownerId);
      
      // Verificar se o usuário está na tabela de profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', ownerId)
        .single();
      
      console.log("Perfil do proprietário:", { profileData, profileError });
      
      // Usar a abordagem correta - mesma usada no Dashboard
      const { data: requestsData, error: requestsError } = await supabase
        .from('budget_requests')
        .select(`
          *,
          equipment(id, name, image, category)
        `)
        .eq('owner_id', ownerId);

      console.log("Resultado da consulta de orçamentos:", { 
        requestsData, 
        requestsError,
        totalEncontrados: requestsData?.length || 0
      });

      if (requestsError) {
        console.error("Erro na consulta de orçamentos:", requestsError);
        setError("Erro ao buscar orçamentos: " + requestsError.message);
        return;
      }

      if (!requestsData || requestsData.length === 0) {
        console.log("Nenhum orçamento encontrado para este proprietário");
        setBudgetRequests([]);
        setLoading(false);
        return;
      }
      
      // Buscar dados dos clientes
      const enrichedRequests = await Promise.all(
        requestsData.map(async (request) => {
          const { data: clientProfile, error: clientError } = await supabase
            .from('profiles')
            .select('id, name, email, whatsapp')
            .eq('id', request.client_id)
            .single();
          
          if (clientError) {
            console.error("Erro ao buscar perfil do cliente:", clientError);
          }

          console.log("Perfil do cliente para orçamento:", {
            requestId: request.id,
            clientId: request.client_id,
            clientProfile,
            clientError
          });

          // Usar o valor padrão caso não encontre o cliente
          const client = clientProfile || {
            id: request.client_id,
            name: 'Cliente não encontrado',
            email: '',
            whatsapp: null
          };

          return {
            ...request,
            client
          };
        })
      );

      console.log("Dados processados dos orçamentos:", enrichedRequests);
      setBudgetRequests(enrichedRequests);
    } catch (err) {
      console.error('Erro ao buscar orçamentos:', err);
      setError(`Erro ao buscar orçamentos: ${err instanceof Error ? err.message : String(err)}`);
      showNotification('error', 'Erro ao carregar solicitações de orçamento');
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'responded':
        return 'Respondido';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'converted':
        return 'Convertido';
      default:
        return status;
    }
  };

  const getWhatsAppLink = (request: any) => {
    const whatsapp = request.client?.whatsapp;
    if (!whatsapp) return '';

    const message = encodeURIComponent(
      `Olá${request.client?.name ? ` ${request.client.name}` : ''}! Sobre seu orçamento para o equipamento ${request.equipment?.name || 'solicitado'} no período de ${new Date(request.start_date).toLocaleDateString()} a ${new Date(request.end_date).toLocaleDateString()}`
    );
    
    return `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${message}`;
  };

  const handleResponseSubmit = async () => {
    await fetchBudgetRequests(); 
    setSelectedRequest(null);
    setShowResponseForm(false);
  };

  // Função para recarregar os dados
  const handleRefresh = () => {
    fetchBudgetRequests();
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
      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Orçamentos Recebidos</h2>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              onClick={handleRefresh}
            >
              Atualizar
            </Button>
            <Button
              variant="outlined"
              startIcon={<SlidersHorizontal />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
            </Button>
          </div>
        </div>
        
        {userRole && (
          <div className="text-sm text-gray-500 mt-1">
            Você está logado como: <span className="font-medium">{userRole}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">Erro ao carregar orçamentos:</p>
          <p>{error}</p>
        </div>
      )}

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
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="responded">Respondido</MenuItem>
                <MenuItem value="approved">Aprovado</MenuItem>
                <MenuItem value="rejected">Rejeitado</MenuItem>
                <MenuItem value="converted">Convertido</MenuItem>
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
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {request.equipment?.image ? (
                      <img
                        src={request.equipment.image}
                        alt={request.equipment.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package2 className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="font-semibold">{request.equipment?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Cliente: {request.client?.name || request.client?.email || request.client_id}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(request.start_date).toLocaleDateString()} até{' '}
                      {new Date(request.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  {request.delivery_address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{request.delivery_address}</span>
                    </div>
                  )}

                  {request.special_requirements && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{request.special_requirements}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3">
                    {request.client?.whatsapp && (
                      <a
                        href={getWhatsAppLink(request)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 mr-2 fill-current"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowChat(true);
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </button>

                    {request.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowResponseForm(true);
                        }}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Responder
                      </button>
                    )}
                    
                    {(request.status === 'responded' || request.status === 'approved' || request.status === 'rejected') && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowResponseForm(true);
                        }}
                        className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Editar Resposta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhum orçamento encontrado</p>
            <p className="text-sm text-gray-500 mt-2">
              Aguarde solicitações de orçamento de seus clientes ou verifique os filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* Modal para resposta de orçamento */}
      {selectedRequest && showResponseForm && (
        <BudgetResponseForm
          budgetRequest={selectedRequest}
          open={showResponseForm}
          onClose={() => setShowResponseForm(false)}
          onSuccess={handleResponseSubmit}
        />
      )}

      {/* Modal para chat */}
      {selectedRequest && showChat && (
        <BudgetChat
          budgetRequest={selectedRequest}
          open={showChat}
          onClose={() => {
            setShowChat(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default BudgetRequestList;