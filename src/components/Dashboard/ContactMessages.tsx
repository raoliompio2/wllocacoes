import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  contact_preference: string;
  status: string;
  created_at: string;
  updated_at: string;
  responded_by: string | null;
  responded_at: string | null;
}

const ContactMessages: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [status, setStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [authenticated, setAuthenticated] = useState(false);

  // Verificar autenticação e permissões do usuário
  useEffect(() => {
    const checkAuth = async () => {
      const session = await supabase.auth.getSession();
      console.log('Sessão atual:', session);
      
      if (session.data.session) {
        console.log('Usuário autenticado:', session.data.session.user.id);
        // Verificar se é o usuário específico que deve ter acesso
        const isTargetUser = session.data.session.user.id === 'c78aafc8-6734-4e6b-8944-29cffa6424f1';
        
        if (isTargetUser) {
          console.log('Usuário com acesso confirmado');
        } else {
          console.log('Verificando se o usuário é proprietário...');
          // Verificar se o usuário tem o papel de proprietário
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.data.session.user.id)
            .single();
            
          if (error) {
            console.error('Erro ao verificar perfil:', error);
          } else {
            console.log('Perfil do usuário:', data);
            if (data?.role === 'proprietario' || data?.role === 'owner') {
              console.log('Usuário é proprietário, acesso concedido');
            }
          }
        }
        
        setAuthenticated(true);
      } else {
        console.log('Usuário não autenticado');
        setAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchContactMessages();
    }
  }, [page, rowsPerPage, statusFilter, authenticated]);

  const fetchContactMessages = async () => {
    setLoading(true);
    try {
      console.log('Buscando mensagens de contato...');
      // Consulta principal para obter as mensagens paginadas
      let query = supabase
        .from('contact_messages' as any)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * rowsPerPage, (page + 1) * rowsPerPage - 1);

      // Aplicar filtro de status se não for 'all'
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      console.log('Usuário atual:', user?.id);
      const { data, error, count } = await query;

      if (error) {
        console.error('Erro detalhado:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Dados recebidos:', data);
      // Convertendo explicitamente os dados para o tipo ContactMessage[]
      const typedData = (data || []) as any as ContactMessage[];
      setMessages(typedData);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error('Erro ao buscar mensagens de contato:', error);
      const errorMessage = error.message || 'Erro desconhecido';
      showNotification('error', `Erro ao carregar mensagens: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setStatus(message.status);
    setOpenDialog(true);

    // Se a mensagem estiver pendente, marcar como lida
    if (message.status === 'pendente') {
      updateMessageStatus(message.id, 'lida');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMessage(null);
  };

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages' as any)
        .update({ 
          status: newStatus,
          ...(newStatus === 'respondida' ? {
            responded_by: user?.id,
            responded_at: new Date().toISOString()
          } : {})
        })
        .eq('id', messageId);

      if (error) throw error;

      // Atualiza estado local
      setMessages(messages.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              status: newStatus,
              ...(newStatus === 'respondida' ? {
                responded_by: user?.id || null,
                responded_at: new Date().toISOString()
              } : {})
            } 
          : msg
      ));

      // Se estiver visualizando a mensagem, atualizar o status no diálogo
      if (selectedMessage?.id === messageId) {
        setStatus(newStatus);
        setSelectedMessage(prev => 
          prev ? { 
            ...prev, 
            status: newStatus,
            ...(newStatus === 'respondida' ? {
              responded_by: user?.id || null,
              responded_at: new Date().toISOString()
            } : {})
          } : null
        );
      }

      showNotification('success', 'Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status da mensagem:', error);
      showNotification('error', 'Erro ao atualizar status');
    }
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    
    if (selectedMessage) {
      updateMessageStatus(selectedMessage.id, newStatus);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'warning';
      case 'lida':
        return 'info';
      case 'respondida':
        return 'success';
      case 'arquivada':
        return 'default';
      default:
        return 'default';
    }
  };

  const getContactIcon = (preference: string) => {
    switch (preference) {
      case 'email':
        return <MailIcon fontSize="small" />;
      case 'phone':
        return <PhoneIcon fontSize="small" />;
      case 'whatsapp':
        return <WhatsAppIcon fontSize="small" />;
      default:
        return <MailIcon fontSize="small" />;
    }
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Mensagens de Contato
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Visualize e gerencie as mensagens recebidas através do formulário de contato.
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl variant="outlined" size="small" sx={{ width: 200 }}>
          <InputLabel>Filtrar por Status</InputLabel>
          <Select<string>
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Filtrar por Status"
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="pendente">Pendentes</MenuItem>
            <MenuItem value="lida">Lidas</MenuItem>
            <MenuItem value="respondida">Respondidas</MenuItem>
            <MenuItem value="arquivada">Arquivadas</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="tabela de mensagens de contato">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Assunto</TableCell>
                <TableCell>Pref. Contato</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={40} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      Nenhuma mensagem encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow 
                    key={message.id}
                    hover
                    sx={{ 
                      '&:hover': { cursor: 'pointer' },
                      bgcolor: message.status === 'pendente' ? 'rgba(255, 152, 0, 0.1)' : 'inherit'
                    }}
                    onClick={() => handleViewMessage(message)}
                  >
                    <TableCell>
                      {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{message.name}</TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getContactIcon(message.contact_preference)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {message.contact_preference}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={message.status} 
                        size="small" 
                        color={getStatusColor(message.status)} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Visualizar mensagem">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMessage(message);
                          }}
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Diálogo de visualização da mensagem */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedMessage.subject}</Typography>
              <Typography variant="subtitle2" color="textSecondary">
                De: {selectedMessage.name} | {format(new Date(selectedMessage.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mr: 1 }}>Status:</Typography>
                  <FormControl size="small" sx={{ width: 150 }}>
                    <Select<string>
                      value={status}
                      onChange={handleStatusChange}
                      displayEmpty
                    >
                      <MenuItem value="pendente">Pendente</MenuItem>
                      <MenuItem value="lida">Lida</MenuItem>
                      <MenuItem value="respondida">Respondida</MenuItem>
                      <MenuItem value="arquivada">Arquivada</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MailIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{selectedMessage.email}</Typography>
                  </Box>
                  
                  {selectedMessage.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">{selectedMessage.phone}</Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                      Preferência de contato:
                    </Typography>
                    <Chip
                      size="small"
                      icon={getContactIcon(selectedMessage.contact_preference)}
                      label={selectedMessage.contact_preference}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </Typography>

              {selectedMessage.status === 'respondida' && selectedMessage.responded_at && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    Marcada como respondida em: {format(new Date(selectedMessage.responded_at), "dd/MM/yyyy 'às' HH:mm")}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => updateMessageStatus(selectedMessage.id, 'arquivada')} 
                color="inherit"
                startIcon={<ArchiveIcon />}
                sx={{ mr: 'auto' }}
              >
                Arquivar
              </Button>
              <Button onClick={handleCloseDialog} color="primary" variant="contained">
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ContactMessages; 