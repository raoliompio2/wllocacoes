import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';

interface BusinessHoursProps {
  variant?: 'default' | 'compact';
  color?: string;
  iconColor?: string;
  location?: 'teresina' | 'parnaiba' | undefined;
}

const BusinessHours: React.FC<BusinessHoursProps> = ({ 
  variant = 'default',
  color = 'inherit',
  iconColor,
  location
}) => {
  // Dados fixos para as duas unidades
  const teresinaHours = "Seg/Sex: 07:00–17:00";
  const parnaibaHours = "Seg/Sex: 07:15h –12:00h / 13:00h –17:00h";
  
  // Definir qual horário mostrar com base na localização
  const businessHours = location === 'parnaiba' ? parnaibaHours : teresinaHours;
  const [loading, setLoading] = useState(false);

  if (loading) {
    return null;
  }

  // Se nenhum local específico é fornecido, mas o chamador quer mostrar ambos
  if (!location) {
    return (
      <Box sx={{ display: 'flex', mb: variant === 'compact' ? 1 : 3 }}>
        <AccessTime sx={{ 
          fontSize: variant === 'compact' ? 18 : 24, 
          mr: variant === 'compact' ? 1 : 2,
          mt: variant === 'compact' ? 0.3 : 0,
          color: iconColor || 'inherit'
        }} />
        <Box>
          {variant !== 'compact' && (
            <Typography variant="body1" gutterBottom color={color}>
              Horário de Atendimento
            </Typography>
          )}
          
          <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }} color={color}>
            Cidade 1:
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }} color={color}>
            {teresinaHours}
          </Typography>
          
          <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }} color={color}>
            Cidade 2:
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }} color={color}>
            {parnaibaHours}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Para mostrar apenas um local específico
  return (
    <Box sx={{ display: 'flex', mb: variant === 'compact' ? 1 : 3 }}>
      <AccessTime sx={{ 
        fontSize: variant === 'compact' ? 18 : 24, 
        mr: variant === 'compact' ? 1 : 2,
        mt: variant === 'compact' ? 0.3 : 0,
        color: iconColor || 'inherit'
      }} />
      <Box>
        {variant !== 'compact' && (
          <Typography variant="body1" gutterBottom color={color}>
            Horário de Atendimento
          </Typography>
        )}
        
        <Typography variant="body2" sx={{ opacity: 0.9 }} color={color}>
          {businessHours}
        </Typography>
      </Box>
    </Box>
  );
};

export default BusinessHours; 