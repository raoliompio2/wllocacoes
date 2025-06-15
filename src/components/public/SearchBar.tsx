import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Box,
  Button,
  useTheme as useMuiTheme,
  useMediaQuery,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Search, Construction } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { supabase } from '../../utils/supabaseClient';

// Interfaces para tipagem
interface Categoria {
  id: string;
  name: string;
  icon?: string;
}

// Ajuste da interface FaseObra para corresponder à estrutura no banco de dados
interface FaseObra {
  id: string; // UUID no formato string
  name: string;
  description?: string | null;
  created_at?: string;
}

export const SearchBar = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { themePreferences, mode } = useTheme();
  
  // Obtendo as cores do tema atual
  const colors = mode === 'light' ? themePreferences.lightColors : themePreferences.darkColors;
  
  const [termo, setTermo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [faseObra, setFaseObra] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fasesObra, setFasesObra] = useState<FaseObra[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingFases, setLoadingFases] = useState(true);
  
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);
        // Usando any para contornar limitações de tipo
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
        // Mantenha as categorias vazias em caso de erro
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }
    };
    
    const fetchFasesObra = async () => {
      try {
        setLoadingFases(true);
        // Usando any para contornar limitações de tipo
        const { data, error } = await (supabase as any)
          .from('construction_phases')
          .select('id, name, description, created_at');
        
        if (error) throw error;
        
        if (data) {
          setFasesObra(data);
        }
      } catch (error) {
        console.error('Erro ao buscar fases da obra:', error);
        // Mantenha as fases vazias em caso de erro
        setFasesObra([]);
      } finally {
        setLoadingFases(false);
      }
    };
    
    fetchCategorias();
    fetchFasesObra();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (termo) params.append('q', termo);
    if (categoria) params.append('categoria', categoria);
    if (faseObra) params.append('fase', faseObra);
    
    navigate(`/equipamentos?${params.toString()}`);
  };
  
  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{
        borderRadius: 2,
        p: { xs: 1.5, sm: 2 },
        backdropFilter: 'blur(20px)',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        maxWidth: '100%',
        overflow: 'hidden',
        mb: { xs: 4, sm: 6, md: 8 },
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Grid 
        container 
        spacing={isMobile ? 1 : 2} 
        direction={isMobile ? 'column' : 'row'} 
        alignItems="center"
      >
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            placeholder="O que você precisa?"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            size={isMobile ? "small" : "medium"}
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
            <InputLabel>Categoria</InputLabel>
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
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
            <InputLabel>Fase da Obra</InputLabel>
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
        </Grid>
        
        <Grid item xs={12} sm={2}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size={isMobile ? "medium" : "large"}
            startIcon={<Construction />}
            sx={{
              height: isMobile ? 'auto' : '100%',
              minHeight: { xs: '40px', sm: '56px' },
              bgcolor: colors.secondary,
              '&:hover': {
                bgcolor: colors.secondary,
                opacity: 0.9,
              },
              fontWeight: 'bold',
              boxShadow: 2
            }}
          >
            {isMobile ? 'Buscar' : 'Pesquisar'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SearchBar; 