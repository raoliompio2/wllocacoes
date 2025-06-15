import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
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
  Link
} from '@mui/material';
import { LockReset } from '@mui/icons-material';

const ResetPassword: React.FC = () => {
  const { setCurrentSession } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Verifica se foi redirecionado por email com token de redefinição
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const expiresIn = hashParams.get('expires_in');
  const tokenType = hashParams.get('token_type');

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Se tiver os tokens na URL, vamos armazená-los na sessão
        if (accessToken && refreshToken) {
          console.log('Tokens encontrados na URL, configurando sessão...');
          
          // Configura a sessão com os tokens recebidos
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Erro ao configurar sessão:', error);
            setError('Erro ao configurar sessão de autenticação. Tente novamente ou solicite uma nova redefinição de senha.');
          } else if (data.session) {
            console.log('Sessão configurada com sucesso:', data.session ? 'Válida' : 'Inválida');
            // Atualizar o contexto de autenticação com a nova sessão
            setCurrentSession(data.session);
            setSessionLoaded(true);
          } else {
            console.error('Tokens aceitos, mas nenhuma sessão retornada');
            setError('Erro ao processar o link de redefinição. Por favor, solicite um novo link.');
          }
        } else {
          // Verificar se já temos uma sessão válida
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('Sessão existente encontrada');
            setSessionLoaded(true);
          } else {
            console.error('Nenhum token na URL e nenhuma sessão ativa');
            setError('Link de redefinição de senha inválido ou expirado. Por favor, solicite uma nova redefinição de senha.');
          }
        }
      } catch (err) {
        console.error('Erro ao inicializar sessão:', err);
        setError('Ocorreu um erro ao processar seu link de redefinição de senha. Por favor, tente novamente.');
      }
    };

    initializeSession();
  }, [accessToken, refreshToken, expiresIn, tokenType, setCurrentSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Verificar se temos uma sessão válida antes de tentar atualizar a senha
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão de autenticação expirada ou inválida. Por favor, solicite uma nova redefinição de senha.');
      }
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setSuccess(true);
      // Redirecionamos após 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Senha atualizada com sucesso. Você já pode entrar com sua nova senha.' } 
        });
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir a senha. Tente novamente.');
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
              <LockReset sx={{ color: 'white', fontSize: 30 }} />
            </Box>
          </Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Redefinir sua senha
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Digite sua nova senha para continuar
          </Typography>
        </Box>

        {success ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Senha atualizada com sucesso! Você será redirecionado para a página de login.
          </Alert>
        ) : error && !sessionLoaded ? (
          <>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                color="primary"
                variant="contained"
                onClick={() => navigate('/forgot-password')}
                sx={{ mt: 2 }}
              >
                Solicitar nova redefinição
              </Button>
            </Box>
          </>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Nova senha"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              disabled={!sessionLoaded}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirme a nova senha"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              disabled={!sessionLoaded}
            />

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
              disabled={loading || !sessionLoaded}
              sx={{ 
                py: 1.5, 
                fontWeight: 'medium',
                mb: 2
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              ) : null}
              {loading ? 'Processando...' : 'Atualizar senha'}
            </Button>
            
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              <Link href="/login" color="primary" underline="hover">
                Voltar para login
              </Link>
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ResetPassword; 