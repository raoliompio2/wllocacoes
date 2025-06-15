import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { BookingWithEquipment } from '../../types/types';
import {
  Calendar,
  Package2,
  Star,
  MapPin,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Ban
} from 'lucide-react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  Grid
} from '@mui/material';

interface BookingCardProps {
  booking: BookingWithEquipment;
  onClick?: () => void;
  showOwnerInfo?: boolean;
}

// Componente para exibir o status com cores diferentes
export const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente':
        return { label: 'Pendente', color: 'warning', icon: <Clock size={14} /> };
      case 'confirmado':
        return { label: 'Confirmado', color: 'success', icon: <CheckCircle size={14} /> };
      case 'em_andamento':
        return { label: 'Em andamento', color: 'info', icon: <Calendar size={14} /> };
      case 'finalizado':
        return { label: 'Finalizado', color: 'default', icon: <CheckCircle size={14} /> };
      case 'cancelado':
        return { label: 'Cancelado', color: 'error', icon: <Ban size={14} /> };
      default:
        return { label: status, color: 'default', icon: <AlertCircle size={14} /> };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <Chip
      icon={statusInfo.icon}
      label={statusInfo.label}
      size="small"
      color={statusInfo.color as any}
      variant="outlined"
    />
  );
};

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  onClick,
  showOwnerInfo = false 
}) => {
  if (!booking.equipment) {
    return null;
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          cursor: onClick ? 'pointer' : 'default'
        }
      }}
      onClick={onClick}
    >
      <Box 
        sx={{ 
          position: 'relative',
          paddingTop: '56.25%', // 16:9 aspect ratio
          bgcolor: 'background.default'
        }}
      >
        {booking.equipment.image ? (
          <Box
            component="img"
            src={booking.equipment.image}
            alt={booking.equipment.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}
          >
            <Package2 size={64} color="#ccc" />
          </Box>
        )}
        
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
          }}
        >
          <StatusChip status={booking.status} />
        </Box>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {booking.equipment.name}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Calendar size={16} style={{ marginRight: 8, opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />
        
        <Grid container spacing={1} sx={{ mt: 'auto' }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DollarSign size={18} style={{ marginRight: 4, opacity: 0.7 }} />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  {formatCurrency(booking.total_price || 0)}
                </Typography>
              </Box>
              
              {booking.equipment.daily_rate && (
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(booking.equipment.daily_rate)}/dia
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BookingCard; 