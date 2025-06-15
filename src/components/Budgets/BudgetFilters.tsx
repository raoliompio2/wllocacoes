import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  useTheme,
  useMediaQuery,
  Grid
} from '@mui/material';
import { Search, Filter, Clock, X, CreditCard, CheckCircle, MessageSquare, XCircle } from 'lucide-react';

interface BudgetFiltersProps {
  filterStatus: string;
  onFilterChange: (value: string) => void;
  onRefresh: () => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

const BudgetFilters: React.FC<BudgetFiltersProps> = ({ 
  filterStatus, 
  onFilterChange, 
  onRefresh,
  searchTerm = '',
  onSearchChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Opções de status com ícones correspondentes
  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendentes', icon: <Clock size={16} /> },
    { value: 'responded', label: 'Respondidos', icon: <MessageSquare size={16} /> },
    { value: 'approved', label: 'Aprovados', icon: <CheckCircle size={16} /> },
    { value: 'converted', label: 'Convertidos', icon: <CreditCard size={16} /> },
    { value: 'rejected', label: 'Rejeitados', icon: <XCircle size={16} /> }
  ];

  return (
    <Box 
      sx={{ 
        mb: 3, 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 1,
        boxShadow: 'rgba(0, 0, 0, 0.04) 0px 2px 8px'
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {onSearchChange && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Pesquisar orçamentos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <Button 
                      size="small" 
                      onClick={() => onSearchChange('')}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <X size={16} />
                    </Button>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="filter-status-label">Status</InputLabel>
            <Select
              labelId="filter-status-label"
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
              label="Status"
              startAdornment={<Filter size={16} style={{ marginRight: 8 }} />}
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.icon && (
                    <Box component="span" sx={{ mr: 1, display: 'inline-flex', alignItems: 'center' }}>
                      {option.icon}
                    </Box>
                  )}
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={onRefresh}
            startIcon={<Clock size={16} />}
          >
            Atualizar
          </Button>
        </Grid>
      </Grid>

      {filterStatus !== 'all' && (
        <Box mt={2} display="flex" alignItems="center">
          <Typography variant="body2" color="text.secondary" mr={1}>
            Filtros:
          </Typography>
          <Chip 
            label={
              statusOptions.find(opt => opt.value === filterStatus)?.label || filterStatus
            }
            size="small"
            onDelete={() => onFilterChange('all')}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}
    </Box>
  );
};

export default BudgetFilters; 