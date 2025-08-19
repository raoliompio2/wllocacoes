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
  Tooltip,
  Typography
} from '@mui/material';
import { Search, Construction } from '@mui/icons-material';
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sempre usar o termo original do usuário para garantir que a busca fuzzy funcione
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
  };
  
  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={6} // Aumentado para dar mais destaque
      sx={{
        borderRadius: '12px',
        p: { xs: 2, sm: 2.5 }, // Padding aumentado
        backdropFilter: 'blur(20px)',
        bgcolor: 'rgba(74, 50, 110, 0.95)', // Roxo do tema WL Locações
        color: '#ffffff', // Texto branco para contraste
        maxWidth: '100%',
        overflow: 'hidden',
        mb: { xs: 4, sm: 6, md: 8 },
        boxShadow: '0 12px 35px rgba(74, 50, 110, 0.3), 0 2px 5px rgba(0,0,0,0.08)', // Sombra roxa
        border: '1px solid rgba(74, 50, 110, 0.6)', // Borda roxa
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 18px 45px rgba(74, 50, 110, 0.4), 0 2px 6px rgba(0,0,0,0.12)', // Efeito hover roxo
          transform: 'translateY(-3px)',
          bgcolor: 'rgba(74, 50, 110, 1)' // Mais sólido no hover
        }
      }}
    >
      <Grid 
        container 
        spacing={isMobile ? 1 : 2} 
        direction={isMobile ? 'column' : 'row'} 
        alignItems="center"
      >
        <Grid item xs={12} sm={4}>
          <Tooltip 
            title={suggestedTerm ? `Você quis dizer: ${suggestedTerm}?` : ''}
            open={!!suggestedTerm}
            placement="bottom-start"
            arrow
          >
            <TextField
              fullWidth
              placeholder="O que você precisa?"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
                ...(suggestedTerm && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button 
                        size="small" 
                        onClick={() => setTermo(suggestedTerm)}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {`Você quis dizer: ${suggestedTerm}?`}
                      </Button>
                    </InputAdornment>
                  )
                }),
                sx: {
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fe2d24',
                  }
                }
              }}
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              }}
            />
          </Tooltip>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
            <InputLabel shrink sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Categoria</InputLabel>
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
              sx={{
                borderRadius: '8px',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fe2d24',
                },
                '& .MuiSelect-icon': {
                  color: 'rgba(255, 255, 255, 0.8)',
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: 'rgba(74, 50, 110, 0.95)',
                    color: '#ffffff',
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      '&:hover': {
                        bgcolor: 'rgba(254, 45, 36, 0.1)',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(254, 45, 36, 0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(254, 45, 36, 0.3)',
                        },
                      },
                    },
                  },
                },
              }}
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
            <InputLabel shrink sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Fase da Obra</InputLabel>
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
              sx={{
                borderRadius: '8px',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fe2d24',
                },
                '& .MuiSelect-icon': {
                  color: 'rgba(255, 255, 255, 0.8)',
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: 'rgba(74, 50, 110, 0.95)',
                    color: '#ffffff',
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      '&:hover': {
                        bgcolor: 'rgba(254, 45, 36, 0.1)',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(254, 45, 36, 0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(254, 45, 36, 0.3)',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="">Todas as fases</MenuItem>
              {fasesObra.map((fase) => (
                <MenuItem 
                  key={fase.id} 
                  value={fase.id}
                  title={fase.description || undefined}
                >
                  {fase.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={2}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<Construction />}
            sx={{
              py: { xs: 1, sm: 1.5 },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              bgcolor: '#fe2d24', // Vermelho WL Locações
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(254, 45, 36, 0.3)',
              '&:hover': {
                bgcolor: '#ff4d42',
                boxShadow: '0 6px 15px rgba(254, 45, 36, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
            size={isMobile ? "medium" : "large"}
          >
            Pesquisar
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SearchBar; 