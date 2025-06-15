import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Box, Container, Typography, Paper, Divider, Button } from '@mui/material';

const DebugBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const proprietarioId = 'c78aafc8-6734-4e6b-8944-29cffa6424f1';

  const fetchBookingsDirect = async () => {
    setLoading(true);
    try {
      // Consulta SQL direta que ignora qualquer política RLS
      const { data, error } = await supabase.from('bookings').select('*');
      
      if (error) throw error;
      console.log('Todas as reservas (ignorando proprietário):', data);
      setBookings(data || []);
    } catch (err) {
      console.error('Erro ao buscar reservas diretamente:', err);
      setError('Erro ao buscar reservas');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsForOwner = async () => {
    setLoading(true);
    try {
      // Consulta direta com JOIN na tabela de equipamentos
      const { data, error } = await supabase.from('bookings')
        .select(`
          *,
          equipment!inner (
            id,
            name,
            user_id
          )
        `)
        .eq('equipment.user_id', proprietarioId);
      
      if (error) throw error;
      console.log('Reservas do proprietário (com JOIN):', data);
      setBookings(data || []);
    } catch (err) {
      console.error('Erro ao buscar reservas do proprietário:', err);
      setError('Erro ao buscar reservas');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsWithRPC = async () => {
    setLoading(true);
    try {
      // Usar a função RPC correta get_owner_bookings
      const { data, error } = await supabase.rpc('get_owner_bookings', {
        p_owner_id: proprietarioId
      });
      
      if (error) throw error;
      console.log('Reservas do proprietário (via RPC):', data);
      setBookings(data || []);
    } catch (err) {
      console.error('Erro ao buscar reservas via RPC:', err);
      setError('Erro ao buscar reservas');
    } finally {
      setLoading(false);
    }
  };

  // Chamar a função de buscas na inicialização
  useEffect(() => {
    fetchBookingsDirect();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Diagnóstico de Reservas
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" gutterBottom>
          ID do Proprietário para teste: <strong>{proprietarioId}</strong>
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchBookingsDirect}
            disabled={loading}
          >
            Buscar Todas as Reservas
          </Button>
          
          <Button 
            variant="contained"
            color="secondary"
            onClick={fetchBookingsForOwner}
            disabled={loading}
          >
            Buscar com Join
          </Button>
          
          <Button 
            variant="contained"
            color="info"
            onClick={fetchBookingsWithRPC}
            disabled={loading}
          >
            Buscar com RPC
          </Button>
        </Box>
      </Box>
      
      {loading && <Typography>Carregando...</Typography>}
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {bookings.length === 0 && !loading ? (
        <Typography>Nenhuma reserva encontrada</Typography>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>
            {bookings.length} Reserva(s) encontrada(s)
          </Typography>
          
          {bookings.map(booking => (
            <Paper key={booking.id} sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6">
                Reserva ID: {booking.id}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Status: <strong>{booking.status}</strong></Typography>
              <Typography>Equipamento ID: {booking.equipment_id}</Typography>
              <Typography>Cliente ID: {booking.user_id}</Typography>
              <Typography>
                Período: {new Date(booking.start_date).toLocaleDateString()} até {new Date(booking.end_date).toLocaleDateString()}
              </Typography>
              <Typography>Valor: R$ {booking.total_price}</Typography>
              
              {booking.equipment && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2">Detalhes do Equipamento:</Typography>
                  <Typography>Nome: {booking.equipment.name}</Typography>
                  <Typography>Proprietário: {booking.equipment.user_id}</Typography>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default DebugBookings; 