import React from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  useTheme,
  useMediaQuery 
} from '@mui/material';

// Interface para os itens genéricos de filtro (categorias, fases, etc)
interface FilterItem {
  id: string;
  name: string | null;
}

interface FilterPanelProps {
  title?: string;
  showFilters: boolean;
  filters: {
    label: string;
    id: string;
    value: string;
    items: FilterItem[];
    onChange: (event: SelectChangeEvent<string>) => void;
  }[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  title = 'Filtros',
  showFilters,
  filters
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!showFilters) return null;

  return (
    <Box sx={{ 
      width: '100%', 
      mb: 3, 
      p: 3, 
      bgcolor: 'background.paper',
      borderRadius: 2,
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: 2,
      alignItems: { xs: 'flex-start', md: 'center' },
      flexWrap: 'wrap'
    }}>
      {title && (
        <Typography variant="subtitle2" fontWeight="medium" color="text.secondary" sx={{ 
          mb: { xs: 1, md: 0 },
          width: { xs: '100%', md: 'auto' }
        }}>
          {title}
        </Typography>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 2,
        width: '100%',
        flexWrap: 'wrap'
      }}>
        {filters.map((filter) => (
          <FormControl 
            key={filter.id}
            size="small" 
            sx={{ 
              minWidth: { xs: '100%', md: 200 },
              flex: 1
            }}
          >
            <InputLabel id={`${filter.id}-label`}>{filter.label}</InputLabel>
            <Select
              labelId={`${filter.id}-label`}
              id={filter.id}
              value={filter.value}
              onChange={filter.onChange}
              label={filter.label}
            >
              <MenuItem value="">Todos</MenuItem>
              {filter.items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name || ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>
    </Box>
  );
};

export default FilterPanel; 