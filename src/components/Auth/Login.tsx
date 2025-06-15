import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Link,
  Divider,
  Grid
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

interface LocationState {
  message?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.message) {
      setSuccessMessage(state.message);
      // Clean up the location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Limpar espaços extras no email
      const trimmedEmail = email.trim();
      
      if (!trimmedEmail || !password) {
        setError('Por favor, preencha todos os campos.');
        setLoading(false);
        return;
      }
      
      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setError('Por favor, insira um email válido.');
        setLoading(false);
        return;
      }
      
      await signIn(trimmedEmail, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Tratamento de erros específicos
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
      } else if (err.message?.includes('network')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(`Falha no login: ${err.message || 'Erro desconhecido'}`);
      }
      
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 2 
            }}
          >
            <Box
              sx={{
                bgcolor: 'primary.light',
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LoginIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
          </Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Entrar na sua conta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ou{' '}
            <Link 
              component="button"
              variant="body2" 
              color="primary"
              onClick={() => navigate('/signup')}
              underline="hover"
            >
              criar uma nova conta
            </Link>
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Link 
              component="button"
              variant="body2" 
              color="primary"
              onClick={() => navigate('/forgot-password')}
              underline="hover"
              type="button"
            >
              Esqueceu sua senha?
            </Link>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ 
              py: 1.5, 
              fontWeight: 'medium',
              mb: 2
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
            ) : null}
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="text.secondary" align="center">
            Ao entrar, você concorda com nossos{' '}
            <Link href="/termos-de-uso" color="primary" underline="hover">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/politica-de-privacidade" color="primary" underline="hover">
              Política de Privacidade
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;