import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  ArrowLeft, 
  User, 
  Package2, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  MessageSquare,
  AlertTriangle,
  Clock,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Button, Card, CardContent, Divider, Chip, Typography, Box, Avatar, Grid } from '@mui/material';
import { WhatsApp } from '@mui/icons-material';

interface ClientDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  created_at: string;
  role: string;
  total_bookings: number;
  total_spent: number;
  last_booking: string | null;
  average_rating: number;
  recent_bookings: any[];
}

const ClientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchClientDetails(id);
    }
  }, [id]);

  const fetchClientDetails = async (clientId: string) => {
    try {
      setLoading(true);

      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (profileError) throw profileError;

      // Buscar reservas do cliente relacionadas a equipamentos do locador atual
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          total_price,
          created_at,
          start_date,
          end_date,
          status,
          equipment_id,
          equipment (
            id,
            name,
            user_id
          )
        `)
        .eq('user_id', clientId)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Filtrar para pegar apenas reservas de equipamentos do locador atual
      const userBookings = bookingsData.filter(booking => booking.equipment?.user_id === user?.id) || [];

      // Buscar avaliações
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          rating,
          comment,
          created_at,
          equipment_id,
          equipment (
            id,
            name,
            user_id
          )
        `)
        .eq('user_id', clientId);

      if (reviewsError) throw reviewsError;

      // Filtrar para pegar avaliações de equipamentos do locador atual
      const userReviews = reviewsData.filter(review => review.equipment?.user_id === user?.id) || [];

      // Calcular estatísticas
      const totalSpent = userBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const lastBooking = userBookings.length > 0 ? userBookings[0].created_at : null;
      const averageRating = userReviews.length > 0
        ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
        : 0;

      // Construir objeto detalhado do cliente
      const clientDetails: ClientDetails = {
        id: profileData.id,
        name: profileData.name || 'Cliente',
        email: profileData.email || '',
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zip_code,
        created_at: profileData.created_at,
        role: profileData.role,
        total_bookings: userBookings.length,
        total_spent: totalSpent,
        last_booking: lastBooking,
        average_rating: averageRating,
        recent_bookings: userBookings.slice(0, 5), // Pegando as 5 reservas mais recentes
      };

      setClient(clientDetails);
    } catch (err) {
      console.error('Erro ao buscar detalhes do cliente:', err);
      setError('Falha ao carregar informações do cliente');
      showNotification('error', 'Erro ao carregar informações do cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (client?.phone) {
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

  if (error || !client) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium">Erro ao carregar dados</h3>
        <p className="text-gray-600 mt-2">{error || 'Cliente não encontrado'}</p>
        <Button 
          variant="outlined" 
          startIcon={<ArrowLeft />} 
          onClick={() => navigate('/clients')}
          sx={{ mt: 4 }}
        >
          Voltar para lista de clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button 
        variant="text" 
        startIcon={<ArrowLeft />} 
        onClick={() => navigate('/clients')}
        sx={{ mb: 4 }}
      >
        Voltar para lista de clientes
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <Avatar 
                  sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}
                >
                  {client.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom>{client.name}</Typography>
                <Typography variant="body2" color="text.secondary">{client.email}</Typography>
                
                {client.phone && (
                  <Typography variant="body2" color="text.secondary" className="flex items-center mt-1">
                    <Phone className="h-4 w-4 mr-1" />
                    {client.phone}
                  </Typography>
                )}

                {client.total_bookings > 0 && (
                  <Chip 
                    label="Cliente Ativo" 
                    color="success" 
                    size="small"
                    sx={{ mt: 2 }}
                  />
                )}
              </div>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Informações de Contato
              </Typography>

              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{client.email}</span>
                </div>
                
                {client.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{client.phone}</span>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                    <div>
                      <div>{client.address}</div>
                      {client.city && client.state && (
                        <div>{client.city}, {client.state}</div>
                      )}
                      {client.zip_code && <div>{client.zip_code}</div>}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                variant="contained" 
                color="success" 
                fullWidth 
                startIcon={<WhatsApp />}
                onClick={handleWhatsAppClick}
                disabled={!client.phone}
              >
                Contatar via WhatsApp
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estatísticas
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total de Reservas
                      </Typography>
                      <Typography variant="h5" className="flex items-center mt-2">
                        <Package2 className="mr-2 text-blue-500" />
                        {client.total_bookings}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Gasto
                      </Typography>
                      <Typography variant="h5" className="flex items-center mt-2 text-green-600">
                        <DollarSign className="mr-2 text-green-500" />
                        {formatCurrency(client.total_spent)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Avaliação Média
                      </Typography>
                      <Typography variant="h5" className="flex items-center mt-2">
                        <Star className="mr-2 text-yellow-500" />
                        {client.average_rating ? client.average_rating.toFixed(1) : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reservas Recentes
              </Typography>
              
              {client.recent_bookings.length > 0 ? (
                <div className="space-y-4">
                  {client.recent_bookings.map((booking) => (
                    <Card key={booking.id} variant="outlined" sx={{ p: 0 }}>
                      <CardContent>
                        <div className="flex justify-between items-start">
                          <div>
                            <Typography variant="subtitle1">
                              {booking.equipment?.name || 'Equipamento'}
                            </Typography>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(booking.start_date).toLocaleDateString('pt-BR')} - {new Date(booking.end_date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <div>
                            <Chip 
                              label={booking.status} 
                              color={
                                booking.status === 'confirmado' ? 'success' : 
                                booking.status === 'pendente' ? 'warning' : 
                                booking.status === 'cancelado' ? 'error' : 'default'
                              }
                              size="small"
                            />
                            <Typography variant="subtitle2" className="text-right mt-1 text-green-600">
                              {formatCurrency(booking.total_price || 0)}
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package2 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma reserva encontrada
                  </Typography>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ClientView; 