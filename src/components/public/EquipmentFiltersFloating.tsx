import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  KeyboardArrowDown as MinimizeIcon, 
  KeyboardArrowUp as ExpandIcon, 
  Search, 
  FilterAltOff 
} from '@mui/icons-material';

interface EquipmentFiltersFloatingProps {
  searchTerm: string;
  selectedCategory: string;
  selectedPhase: string;
  categories: Array<{id: string, name: string | null}>;
  constructionPhases: Array<{id: string, name: string | null}>;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (event: SelectChangeEvent<string>) => void;
  onPhaseChange: (event: SelectChangeEvent<string>) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  showFilters: boolean;
}

const EquipmentFiltersFloating: React.FC<EquipmentFiltersFloatingProps> = ({
  searchTerm,
  selectedCategory,
  selectedPhase,
  categories,
  constructionPhases,
  onSearchChange,
  onCategoryChange,
  onPhaseChange,
  onToggleFilters,
  onClearFilters,
  showFilters
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [minimized, setMinimized] = useState(false);

  // Verificar se há algum filtro ativo
  const hasActiveFilters = selectedCategory || selectedPhase || searchTerm;

  if (!isMobile) return null;

  // Versão minimizada do filtro (apenas uma barra para expandir)
  if (minimized) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
          zIndex: 1000,
          p: 1.5,
          backgroundColor: 'background.paper',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={() => setMinimized(false)}
      >
        <Typography 
          variant="subtitle2" 
          color="primary"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 'medium'
          }}
        >
          Filtrar Equipamentos
          <ExpandIcon fontSize="small" sx={{ ml: 1 }} />
        </Typography>
        
        {hasActiveFilters && (
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              position: 'absolute',
              right: '50%', 
              mr: -12,
            }} 
          />
        )}
      </Paper>
    );
  }

  // Versão expandida do filtro
  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        zIndex: 1000,
        p: 2,
        pb: 3,
        backgroundColor: 'background.paper',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        display: 'flex',
        justifyContent: 'center',
        cursor: 'pointer',
        py: 1,
      }}
      onClick={() => setMinimized(true)}
      >
        <Tooltip title="Minimizar filtros">
          <MinimizeIcon fontSize="small" color="action" />
        </Tooltip>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 2, mt: 1 }}>
        <Typography 
          variant="subtitle1" 
          component="h3" 
          fontWeight="bold" 
          color="primary"
          gutterBottom
        >
          Filtre os Equipamentos
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Buscar equipamentos..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <FormControl size="small" fullWidth>
          <InputLabel id="floating-category-label">Categoria</InputLabel>
          <Select
            labelId="floating-category-label"
            id="floating-category"
            value={selectedCategory}
            onChange={onCategoryChange}
            label="Categoria"
          >
            <MenuItem value="">Todas as categorias</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {hasActiveFilters && (
        <>
          <Divider sx={{ my: 2 }} />
          <Button 
            variant="outlined" 
            color="secondary"
            fullWidth
            onClick={onClearFilters}
            startIcon={<FilterAltOff />}
            size="small"
          >
            Limpar Filtros
          </Button>
        </>
      )}
    </Paper>
  );
};

export default EquipmentFiltersFloating; 