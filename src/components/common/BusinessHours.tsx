import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';

interface BusinessHoursProps {
  variant?: 'default' | 'compact';
  color?: string;
  iconColor?: string;
  location?: 'main' | undefined;
  weekdays?: string;
  saturday?: string;
  sunday?: string;
}

const BusinessHours: React.FC<BusinessHoursProps> = ({ 
  variant = 'default',
  color = 'inherit',
  iconColor,
  location,
  weekdays = "Segunda a Sexta: 07:00 às 11:00, 13:00 às 17:00",
  saturday = "Sábado: 07:00 às 11:30",
  sunday = "Domingo: Fechado"
}) => {
  // Dados fixos para a unidade
  const mainHours = "Segunda a Sexta: 07:00 às 11:00, 13:00 às 17:00";
  const mainSaturday = "Sábado: 07:00 às 11:30";
  const mainSunday = "Domingo: Fechado";
  
  const [loading, setLoading] = useState(false);

  if (loading) {
    return null;
  }

  // Para mostrar a unidade com o layout padrão
  if (!location || location === 'main') {
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
            {mainHours}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }} color={color}>
            {mainSaturday}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }} color={color}>
            {mainSunday}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Para mostrar horários personalizados
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body2" sx={{ opacity: 0.9 }} color={color}>
        {weekdays}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.9 }} color={color}>
        {saturday}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.9 }} color={color}>
        {sunday}
      </Typography>
    </Box>
  );
};

export default BusinessHours; 