import React, { useState } from 'react';
import { BookingWithEquipment } from '../../types/types';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { supabase } from '../../utils/supabaseClient';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Paper,
  Grid,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import {
  Calendar,
  DollarSign,
  Package2,
  Truck,
  User,
  X,
  Phone,
  MapPin,
  AlertTriangle,
  Star,
  Clock,
  ArrowDown,
  CheckCircle
} from 'lucide-react';
import { StatusChip } from './BookingCard';

interface BookingDetailsDialogProps {
  booking: BookingWithEquipment | null;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (bookingId: string, newStatus: string) => Promise<void>;
  userType: 'client' | 'owner';
}

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
  booking,
  open,
  onClose,
  onStatusChange,
  userType
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!booking) return null;

  // Calcular duração em dias
  const startDate = new Date(booking.start_date);
  const endDate = new Date(booking.end_date);
  const durationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

  const handleStatusChange = async (newStatus: string) => {
    if (!booking || !onStatusChange) return;
    
    try {
      setUpdating(true);
      setError(null);
      await onStatusChange(booking.id, newStatus);
      showNotification('success', 'Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError('Falha ao atualizar o status. Tente novamente.');
      showNotification('error', 'Erro ao atualizar status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusButtons = () => {
    if (userType === 'owner') {
      switch (booking.status) {
        case 'pendente':
          return (
            <>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<CheckCircle size={18} />}
                disabled={updating}
                onClick={() => handleStatusChange('confirmado')}
              >
                Confirmar
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                disabled={updating}
                onClick={() => handleStatusChange('cancelado')}
              >
                Cancelar
              </Button>
            </>
          );
        case 'confirmado':
          return (
            <Button 
              variant="contained" 
              color="info" 
              startIcon={<ArrowDown size={18} />}
              disabled={updating}
              onClick={() => handleStatusChange('em_andamento')}
            >
              Iniciar
            </Button>
          );
        case 'em_andamento':
          return (
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<CheckCircle size={18} />}
              disabled={updating}
              onClick={() => handleStatusChange('finalizado')}
            >
              Finalizar
            </Button>
          );
        default:
          return null;
      }
    } else {
      // Opções para o cliente
      if (booking.status === 'pendente') {
        return (
          <Button 
            variant="outlined" 
            color="error"
            disabled={updating}
            onClick={() => handleStatusChange('cancelado')}
          >
            Cancelar Reserva
          </Button>
        );
      }
      return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={updating ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ pr: 8 }}>
        Detalhes da Reserva
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={updating}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {updating && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            {/* Informações do equipamento */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Package2 size={20} style={{ marginRight: 8, marginTop: 4 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Equipamento
                    </Typography>
                    <Typography variant="body1">
                      {booking.equipment?.name}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Calendar size={20} style={{ marginRight: 8, marginTop: 4 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Período
                    </Typography>
                    <Typography variant="body2">
                      {startDate.toLocaleDateString()} até {endDate.toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {durationDays} {durationDays === 1 ? 'dia' : 'dias'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <DollarSign size={20} style={{ marginRight: 8, marginTop: 4 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Valor
                    </Typography>
                    <Typography variant="body2">
                      Total: {formatCurrency(booking.total_price || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(booking.equipment?.daily_rate || 0)}/dia × {durationDays} dias
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Status e informações adicionais */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Clock size={20} style={{ marginRight: 8, opacity: 0.7 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <StatusChip status={booking.status} />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {userType === 'owner' ? (
                  // Informações do cliente (para o proprietário)
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <User size={20} style={{ marginRight: 8, marginTop: 4 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Cliente
                      </Typography>
                      <Typography variant="body2">
                        {booking.clientName || 'Nome não disponível'}
                      </Typography>
                      {booking.clientContact && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Phone size={16} style={{ marginRight: 4 }} />
                          <Typography variant="body2">
                            {booking.clientContact}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  // Informações do proprietário (para o cliente)
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <User size={20} style={{ marginRight: 8, marginTop: 4 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Proprietário
                      </Typography>
                      <Typography variant="body2">
                        {booking.ownerName || 'Nome não disponível'}
                      </Typography>
                      {booking.ownerContact && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Phone size={16} style={{ marginRight: 4 }} />
                          <Typography variant="body2">
                            {booking.ownerContact}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Histórico de Status (poderia ser implementado no futuro) */}
        {/* <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Histórico de Status
          </Typography>
          <Timeline position="right">
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2">Reserva criada</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(booking.created_at || '').toLocaleString()}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </Paper> */}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end', gap: 1 }}>
        {getStatusButtons()}
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={onClose}
          disabled={updating}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDetailsDialog; 