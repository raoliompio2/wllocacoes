import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'cliente'>('cliente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      // 1. Criar o usuário na autenticação
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (signUpError) {
        if (signUpError.message === 'User already registered') {
          setError('Este email já está cadastrado. Por favor, faça login ou use outro email.');
          return;
        }
        throw signUpError;
      }

      if (user) {
        // 2. Fazer login para obter uma sessão autenticada
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        try {
          // 3. Verificar se o perfil já existe (agora com permissão autenticada)
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          // Se o erro for diferente de "nenhum registro encontrado", é um erro real
          if (profileCheckError && profileCheckError.code !== 'PGRST116') {
            console.error('Erro ao verificar perfil:', profileCheckError);
          }

          // 4. Criar o perfil somente se não existir
          if (!existingProfile) {
            console.log('Criando perfil para o usuário:', user.id);
            
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                name,
                email,
                role,
                updated_at: new Date().toISOString()
              });

            if (profileError) {
              console.error('Erro ao criar perfil:', profileError);
              
              // Mesmo com erro no perfil, podemos continuar já que o usuário está autenticado
              console.log('Continuando apesar do erro no perfil');
            } else {
              console.log('Perfil criado com sucesso');
            }
          }
        } catch (profileError) {
          console.error('Erro ao processar perfil:', profileError);
          // Continuar mesmo com erro no perfil
        }

        // 5. Redirecionar para o dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao criar conta. Por favor, tente novamente.');
      console.error('Error signing up:', err);
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
              <PersonAdd sx={{ color: 'white', fontSize: 30 }} />
            </Box>
          </Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Criar sua conta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Já tem uma conta?{' '}
            <Link 
              component="button"
              variant="body2" 
              color="primary"
              onClick={() => navigate('/login')}
              underline="hover"
            >
              Entrar
            </Link>
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Nome completo"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar senha"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              mb: 3 
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
            ) : null}
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>

          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="text.secondary" align="center">
            Ao criar uma conta, você concorda com nossos{' '}
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

export default SignUp;