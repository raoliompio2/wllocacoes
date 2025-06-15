import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { isUserOwner } from '../../utils/authHelpers';

interface DiagnosticItem {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
}

const ConnectionDiagnostic: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);

  const runDiagnostics = async () => {
    setLoading(true);
    setDiagnostics([]);

    // Verificar autenticação
    const authDiagnostic: DiagnosticItem = {
      name: 'Autenticação',
      status: 'pending',
      message: 'Verificando autenticação...'
    };
    setDiagnostics(prev => [...prev, authDiagnostic]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setDiagnostics(prev => prev.map(item => 
          item.name === 'Autenticação' 
            ? { ...item, status: 'success', message: `Autenticado como ${user.email}` }
            : item
        ));
      } else {
        setDiagnostics(prev => prev.map(item => 
          item.name === 'Autenticação' 
            ? { ...item, status: 'error', message: 'Usuário não autenticado' }
            : item
        ));
      }
    } catch (error: any) {
      setDiagnostics(prev => prev.map(item => 
        item.name === 'Autenticação' 
          ? { ...item, status: 'error', message: `Erro de autenticação: ${error.message}` }
          : item
      ));
    }

    // Verificar permissões
    const permissionDiagnostic: DiagnosticItem = {
      name: 'Permissões',
      status: 'pending',
      message: 'Verificando permissões...'
    };
    setDiagnostics(prev => [...prev, permissionDiagnostic]);

    try {
      const owner = await isUserOwner();
      
      if (owner) {
        setDiagnostics(prev => prev.map(item => 
          item.name === 'Permissões' 
            ? { ...item, status: 'success', message: 'Usuário tem permissão de proprietário' }
            : item
        ));
      } else {
        setDiagnostics(prev => prev.map(item => 
          item.name === 'Permissões' 
            ? { ...item, status: 'warning', message: 'Usuário não é proprietário - não pode gerenciar equipamentos' }
            : item
        ));
      }
    } catch (error: any) {
      setDiagnostics(prev => prev.map(item => 
        item.name === 'Permissões' 
          ? { ...item, status: 'error', message: `Erro ao verificar permissões: ${error.message}` }
          : item
      ));
    }

    // Verificar conexão com o banco de dados
    const dbDiagnostic: DiagnosticItem = {
      name: 'Banco de Dados',
      status: 'pending',
      message: 'Verificando conexão com o banco de dados...'
    };
    setDiagnostics(prev => [...prev, dbDiagnostic]);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (error) throw error;
      
      setDiagnostics(prev => prev.map(item => 
        item.name === 'Banco de Dados' 
          ? { ...item, status: 'success', message: 'Conexão com o banco de dados estabelecida' }
          : item
      ));
    } catch (error: any) {
      setDiagnostics(prev => prev.map(item => 
        item.name === 'Banco de Dados' 
          ? { ...item, status: 'error', message: `Erro de conexão: ${error.message}` }
          : item
      ));
    }

    // Verificar extensões do navegador
    const extensionDiagnostic: DiagnosticItem = {
      name: 'Extensões do Navegador',
      status: 'pending',
      message: 'Verificando potenciais conflitos...'
    };
    setDiagnostics(prev => [...prev, extensionDiagnostic]);

    try {
      // Não podemos detectar extensões diretamente por limitações de segurança,
      // mas podemos verificar se existe o objeto overrideMethod que causa o erro
      const hasOverrideMethod = (window as any).overrideMethod !== undefined;
      
      if (hasOverrideMethod) {
        setDiagnostics(prev => prev.map(item => 
          item.name === 'Extensões do Navegador' 
            ? { ...item, status: 'warning', message: 'Detectada possível extensão conflitante (overrideMethod). Considere desativar extensões.' }
            : item
        ));
      } else {
        setDiagnostics(prev => prev.map(item => 
          item.name === 'Extensões do Navegador' 
            ? { ...item, status: 'success', message: 'Nenhum conflito de extensão detectado' }
            : item
        ));
      }
    } catch (error) {
      setDiagnostics(prev => prev.map(item => 
        item.name === 'Extensões do Navegador' 
          ? { ...item, status: 'warning', message: 'Não foi possível verificar extensões' }
          : item
      ));
    }

    setLoading(false);
  };

  useEffect(() => {
    // Executar automaticamente ao montar o componente
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="green" />;
      case 'error':
        return <XCircle color="red" />;
      case 'warning':
        return <AlertCircle color="orange" />;
      default:
        return <HelpCircle color="gray" />;
    }
  };

  return (
    <Box p={3} border="1px solid #e0e0e0" borderRadius={1} mt={2}>
      <Typography variant="h6" gutterBottom>
        Diagnóstico de Conexão
      </Typography>
      
      {loading && (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CircularProgress size={20} />
          <Typography>Executando diagnóstico...</Typography>
        </Box>
      )}
      
      <List>
        {diagnostics.map((item, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              {getStatusIcon(item.status)}
            </ListItemIcon>
            <ListItemText 
              primary={item.name} 
              secondary={item.message} 
            />
          </ListItem>
        ))}
      </List>
      
      <Button 
        variant="outlined" 
        onClick={runDiagnostics}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? 'Executando...' : 'Executar Novamente'}
      </Button>
    </Box>
  );
};

export default ConnectionDiagnostic; 