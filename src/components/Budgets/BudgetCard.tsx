import React from 'react';
import { BudgetRequest } from '../../types/types';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Button, 
  Avatar, 
  Chip, 
  Divider,
  Grid
} from '@mui/material';
import { 
  MessageSquare, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  MapPin,
  User
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/format';

// Mapeamento de status para exibição que será reutilizado
const statusConfig = {
  pending: { 
    label: 'Pendente', 
    color: 'warning', 
    colorHex: '#FF9800',
    icon: <Clock size={16} /> 
  },
  responded: { 
    label: 'Respondido', 
    color: 'info', 
    colorHex: '#2196F3',
    icon: <MessageSquare size={16} /> 
  },
  approved: { 
    label: 'Aprovado', 
    color: 'success', 
    colorHex: '#4CAF50',
    icon: <CheckCircle size={16} /> 
  },
  converted: { 
    label: 'Convertido em Reserva', 
    color: 'primary', 
    colorHex: '#9C27B0',
    icon: <CheckCircle size={16} /> 
  },
  rejected: { 
    label: 'Rejeitado', 
    color: 'error', 
    colorHex: '#F44336',
    icon: <XCircle size={16} /> 
  }
};

// Componente para exibir o status do orçamento com chip colorido
const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const config = statusConfig[status as keyof typeof statusConfig] || 
    { label: status, color: 'default', colorHex: '#757575', icon: <AlertCircle size={16} /> };

  return (
    <Chip 
      icon={config.icon} 
      label={config.label} 
      color={config.color as any} 
      size="small" 
      variant="filled" 
    />
  );
};

interface BudgetCardProps {
  budget: BudgetRequest;
  onViewDetails: (budget: BudgetRequest) => void;
  highlight?: boolean;
  isOwnerView?: boolean;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onViewDetails, highlight = false, isOwnerView = false }) => {
  // Calcular a duração do orçamento em dias
  const startDate = parseISO(budget.start_date);
  const endDate = parseISO(budget.end_date);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determinar o status e cor
  const status = statusConfig[budget.status as keyof typeof statusConfig] || { 
    label: 'Desconhecido', 
    color: 'default',
    colorHex: '#757575',
    icon: <AlertCircle size={14} /> 
  };

  return (
    <Card 
      variant="outlined"
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        border: highlight ? `2px solid ${status.colorHex}` : '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: highlight ? `0 4px 8px rgba(0, 0, 0, 0.1)` : 'none',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Chip 
            label={status.label}
            size="small"
            icon={status.icon}
            sx={{ 
              bgcolor: `${status.colorHex}15`, 
              color: status.colorHex,
              borderColor: `${status.colorHex}30`,
              '& .MuiChip-icon': {
                color: status.colorHex
              }
            }}
          />
          
          {budget.total_amount && (
            <Typography variant="body2" fontWeight={600} color="primary">
              {formatCurrency(budget.total_amount)}
            </Typography>
          )}
        </Box>
        
        <Typography variant="h6" gutterBottom noWrap>
          {budget.equipment?.name || 'Equipamento'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Calendar size={16} style={{ marginRight: 8, opacity: 0.7 }} />
          <Typography variant="body2" color="text.secondary">
            {format(startDate, 'dd/MM/yyyy', { locale: ptBR })}
            {' → '}
            {format(endDate, 'dd/MM/yyyy', { locale: ptBR })}
            <Box component="span" sx={{ display: 'inline-block', ml: 1, color: 'text.primary', fontWeight: 500 }}>
              ({durationDays} {durationDays !== 1 ? 'dias' : 'dia'})
            </Box>
          </Typography>
        </Box>
        
        {budget.delivery_address && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
            <MapPin size={16} style={{ marginRight: 8, marginTop: 3, opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
              {budget.delivery_address}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <User size={16} style={{ marginRight: 8, opacity: 0.7 }} />
          <Typography variant="body2" color="text.secondary">
            {isOwnerView ? (
              <>Cliente: <Box component="span" sx={{ fontWeight: 500 }}>{budget.client?.name || 'Não disponível'}</Box></>
            ) : (
              <>Proprietário: <Box component="span" sx={{ fontWeight: 500 }}>{budget.ownerName || 'Não disponível'}</Box></>
            )}
          </Typography>
        </Box>
        
        {budget.special_requirements && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Requisitos especiais:
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              "{budget.special_requirements}"
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 1.5, justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => onViewDetails(budget)}
          startIcon={<MessageSquare size={16} />}
        >
          Detalhes
        </Button>
      </CardActions>
    </Card>
  );
};

export default BudgetCard;
export { StatusChip }; 