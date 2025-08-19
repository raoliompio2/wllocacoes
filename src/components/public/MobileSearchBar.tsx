import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Box,
  Button,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Fab,
  CircularProgress,
  Typography,
  Tooltip,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { Search, Construction, FilterList, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { supabase } from '../../utils/supabaseClient';
import { correctCommonTypos, normalizeText } from '../../utils/searchUtils';

// Interfaces para tipagem
interface Categoria {
  id: string;
  name: string;
  icon?: string;
}

interface FaseObra {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

// Transição para o Dialog
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MobileSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { themePreferences, mode } = useTheme();
  const colors = mode === 'light' ? themePreferences.lightColors : themePreferences.darkColors;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [termo, setTermo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [faseObra, setFaseObra] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fasesObra, setFasesObra] = useState<FaseObra[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingFases, setLoadingFases] = useState(true);
  
  useEffect(() => {
    if (dialogOpen) {
      const fetchCategorias = async () => {
        try {
          setLoadingCategorias(true);
          const { data, error } = await (supabase as any)
            .from('categories')
            .select('id, name, icon')
            .order('name');
          
          if (error) throw error;
          
          if (data) {
            setCategorias(data);
          }
        } catch (error) {
          console.error('Erro ao buscar categorias:', error);
          setCategorias([]);
        } finally {
          setLoadingCategorias(false);
        }
      };
      
      const fetchFasesObra = async () => {
        try {
          setLoadingFases(true);
          const { data, error } = await (supabase as any)
            .from('construction_phases')
            .select('id, name, description, created_at');
          
          if (error) throw error;
          
          if (data) {
            setFasesObra(data);
          }
        } catch (error) {
          console.error('Erro ao buscar fases da obra:', error);
          setFasesObra([]);
        } finally {
          setLoadingFases(false);
        }
      };
      
      fetchCategorias();
      fetchFasesObra();
    }
  }, [dialogOpen]);
  
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Estado para armazenar a sugestão de correção
  const [suggestedTerm, setSuggestedTerm] = useState<string | null>(null);
  
  // Verificar correções ao digitar
  useEffect(() => {
    if (termo) {
      const corrected = correctCommonTypos(termo);
      if (corrected !== termo && normalizeText(corrected) !== normalizeText(termo)) {
        setSuggestedTerm(corrected);
      } else {
        setSuggestedTerm(null);
      }
    } else {
      setSuggestedTerm(null);
    }
  }, [termo]);

  const handleSubmit = () => {
    const params = new URLSearchParams();
    if (termo) {
      params.append('q', termo);
      console.log('Pesquisando por:', termo);
      
      // Se há uma sugestão, mostramos no log
      if (suggestedTerm) {
        console.log('Termo possivelmente corrigido para:', suggestedTerm);
      }
    }
    if (categoria) params.append('categoria', categoria);
    if (faseObra) params.append('fase', faseObra);
    
    navigate(`/equipamentos?${params.toString()}`);
    handleCloseDialog();
  };
  
  const handleQuickSearch = () => {
    if (termo) {
      const params = new URLSearchParams();
      params.append('q', termo);
      
      // Se há uma sugestão, mostramos no log
      if (suggestedTerm) {
        console.log('Termo possivelmente corrigido para:', suggestedTerm);
      }
      
      navigate(`/equipamentos?${params.toString()}`);
    } else {
      handleOpenDialog();
    }
  };
  
  return (
    <>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 2,
          p: 1.5,
          backdropFilter: 'blur(20px)',
          bgcolor: 'rgba(74, 50, 110, 0.95)', // Roxo do tema WL Locações
          color: '#ffffff', // Texto branco
          display: 'flex',
          boxShadow: '0 -4px 20px rgba(74, 50, 110, 0.3)',
        }}
      >
        <TextField
          fullWidth
          placeholder="O que você precisa?"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#ffffff' }} />
              </InputAdornment>
            ),
            sx: {
              color: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fe2d24',
              },
            }
          }}
          sx={{ 
            mr: 1,
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255, 255, 255, 0.7)',
              opacity: 1,
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={handleOpenDialog}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.25)'
              }
            }}
          >
            <FilterList />
          </IconButton>
          
          <Button
            variant="contained"
            onClick={handleQuickSearch}
            sx={{
              minWidth: 'auto',
              bgcolor: '#fe2d24', // Vermelho WL Locações
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(254, 45, 36, 0.3)',
              '&:hover': {
                bgcolor: '#ff4d42',
                boxShadow: '0 6px 15px rgba(254, 45, 36, 0.4)',
              }
            }}
          >
            <Search />
          </Button>
        </Box>
      </Paper>

      {/* Dialog para filtros avançados */}
      <Dialog
        fullScreen
        open={dialogOpen}
        onClose={handleCloseDialog}
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: colors.primary,
          color: 'white'
        }}>
          <Typography variant="h6">Busca Avançada</Typography>
          <IconButton edge="end" color="inherit" onClick={handleCloseDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="O que você procura?"
            placeholder="Ex: betoneira, martelete, andaime..."
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel shrink>Categoria</InputLabel>
            <Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              label="Categoria"
              disabled={loadingCategorias}
              startAdornment={
                loadingCategorias ? (
                  <InputAdornment position="start">
                    <CircularProgress size={20} color="inherit" />
                  </InputAdornment>
                ) : null
              }
            >
              <MenuItem value="">Todas as categorias</MenuItem>
              {categorias.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel shrink>Fase da Obra</InputLabel>
            <Select
              value={faseObra}
              onChange={(e) => setFaseObra(e.target.value)}
              label="Fase da Obra"
              disabled={loadingFases}
              startAdornment={
                loadingFases ? (
                  <InputAdornment position="start">
                    <CircularProgress size={20} color="inherit" />
                  </InputAdornment>
                ) : null
              }
            >
              <MenuItem value="">Todas as fases</MenuItem>
              {fasesObra.map((fase) => (
                <MenuItem 
                  key={fase.id} 
                  value={fase.id}
                >
                  {fase.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseDialog} 
            fullWidth
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            fullWidth
            startIcon={<Search />}
            sx={{
              bgcolor: colors.secondary,
              '&:hover': {
                bgcolor: colors.secondary,
                opacity: 0.9,
              }
            }}
          >
            Buscar Equipamentos
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MobileSearchBar; 