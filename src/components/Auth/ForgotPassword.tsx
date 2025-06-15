import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { MailOutline } from '@mui/icons-material';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError('Houve um erro ao processar sua solicitação. Verifique se o email está correto e tente novamente.');
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
              <MailOutline sx={{ color: 'white', fontSize: 30 }} />
            </Box>
          </Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Recuperar senha
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Digite seu email e enviaremos instruções para redefinir sua senha
          </Typography>
        </Box>

        {success ? (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              Enviamos um email com instruções para redefinir sua senha. 
              Por favor, verifique sua caixa de entrada e spam.
            </Alert>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Voltar para login
              </Button>
            </Box>
          </>
        ) : (
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
              sx={{ mb: 3 }}
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
              {loading ? 'Enviando...' : 'Enviar instruções'}
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

export default ForgotPassword; 