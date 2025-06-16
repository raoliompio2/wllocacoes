import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Button, 
  Chip,
  Skeleton,
  Rating,
  Tooltip,
  styled
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Construction, CalendarMonth, Bolt } from '@mui/icons-material';
import OptimizedImage from '../common/OptimizedImage';

// Estilizando o Card para efeitos de hover mais suaves
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)',
    },
  },
}));

// Estilizando a imagem para efeito de zoom suave
const StyledCardMedia = styled(Box)(({ theme }) => ({
  height: 220,
  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  transformOrigin: 'center',
  position: 'relative',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '&:hover img': {
    transform: 'scale(1.05)',
  }
}));

// Estilizando a categoria
const CategoryChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(4px)',
  fontWeight: 500,
  zIndex: 2,
}));

// Estilizando a etiqueta de disponibilidade
const AvailabilityChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  fontWeight: 500,
  zIndex: 2,
}));

// Props do componente
interface EquipmentCardProps {
  equipment: {
    id: string;
    name: string;
    image: string;
    category: string;
    daily_rate: string;
    description?: string;
    available?: boolean;
    average_rating?: number;
    total_reviews?: number;
    construction_phase_id?: string;
  };
  categoryName?: string;
  constructionPhaseName?: string;
  loading?: boolean;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ 
  equipment, 
  categoryName, 
  constructionPhaseName,
  loading = false 
}) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <StyledCard>
        <Skeleton variant="rectangular" height={220} animation="wave" />
        <CardContent>
          <Skeleton variant="text" width="70%" height={32} animation="wave" />
          <Skeleton variant="text" width="100%" height={20} animation="wave" />
          <Skeleton variant="text" width="90%" height={20} animation="wave" />
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="text" width="40%" height={20} animation="wave" />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Skeleton variant="text" width="30%" height={30} animation="wave" />
              <Skeleton variant="rectangular" width="35%" height={36} animation="wave" />
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  const truncateDescription = (text: string = '', maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text;
  };

  const formatCurrency = (value: string) => {
    if (!value || isNaN(parseFloat(value))) {
      return null;
    }
    
    const numValue = parseFloat(value);
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  // Converte o nome para um formato de URL (slug)
  const createSlug = (name: string) => {
    return encodeURIComponent(
      name
        .toLowerCase()
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/--+/g, '-') // Remove múltiplos hífens consecutivos
        .trim() // Remove espaços no início e fim
    );
  };
  
  // Função para navegar para a página de detalhes
  const handleCardClick = () => {
    navigate(`/equipamento/${createSlug(equipment.name)}`);
  };

  // Gera URL canônica para o equipamento
  const equipmentUrl = `/equipamento/${createSlug(equipment.name)}`;
  
  return (
    <StyledCard 
      onClick={handleCardClick} 
      role="article" 
      aria-label={`Equipamento: ${equipment.name}, Categoria: ${categoryName || 'Não especificada'}`}
    >
      {equipment.available !== undefined && (
        <AvailabilityChip 
          label={equipment.available ? "Disponível" : "Indisponível"}
          color={equipment.available ? "success" : "error"}
          size="small"
          variant="filled"
          aria-label={`Status: ${equipment.available ? "Disponível para locação" : "Indisponível para locação"}`}
        />
      )}
      
      {categoryName && (
        <CategoryChip 
          label={categoryName}
          size="small"
          icon={<Construction fontSize="small" />}
          aria-label={`Categoria: ${categoryName}`}
        />
      )}
      
      <StyledCardMedia>
        <OptimizedImage 
          src={equipment.image || '/images/equipment-placeholder.jpg'}
          alt={`Imagem do equipamento ${equipment.name}`}
          width="100%"
          height={220}
          lazy={true}
        />
      </StyledCardMedia>
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight="600">
          {equipment.name}
        </Typography>
        
        {equipment.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} component="p">
            {truncateDescription(equipment.description)}
          </Typography>
        )}
        
        <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {constructionPhaseName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarMonth fontSize="small" color="action" aria-hidden="true" />
              <Typography variant="caption" color="text.secondary" component="span">
                Fase: {constructionPhaseName}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating 
              value={5} 
              readOnly 
              size="small" 
              precision={0.5}
              aria-label="Avaliação: 5 de 5 estrelas" 
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Tooltip title="Valor diário de locação" arrow placement="top">
              <Typography variant="subtitle1" fontWeight="bold" color="primary" component="span">
                {formatCurrency(equipment.daily_rate) 
                  ? <>{formatCurrency(equipment.daily_rate)}<span style={{ fontSize: '0.75rem' }}>/dia</span></>
                  : "Sob consulta"}
              </Typography>
            </Tooltip>
            
            <Button 
              size="small" 
              variant="contained"
              color="primary"
              endIcon={<Bolt />}
              onClick={(e) => {
                e.stopPropagation(); // Evita que o clique do botão também acione o clique do card
                handleCardClick();
              }}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
              aria-label={`Ver detalhes do equipamento ${equipment.name}`}
              component={Link}
              to={equipmentUrl}
            >
              Ver Detalhes
            </Button>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default EquipmentCard; 