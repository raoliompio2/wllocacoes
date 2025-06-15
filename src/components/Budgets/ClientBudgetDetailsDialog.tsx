import React, { useState, useEffect, useRef } from 'react';
import { BudgetRequest, BudgetMessage } from '../../types/types';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography, 
  Avatar, 
  Divider, 
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  MessageSquare,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Loader,
  User,
  CheckCircle,
  XCircle,
  Phone,
  Edit2,
  MapPin,
  Save,
  Tag,
  RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusChip } from './BudgetCard';

interface BudgetChatSectionProps {
  budgetId: string;
  onSendMessage: () => void;
}

const BudgetChatSection: React.FC<BudgetChatSectionProps> = ({ budgetId, onSendMessage }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState<BudgetMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!budgetId) return;
    
    fetchMessages();
    
    // Inscreve-se em atualizações em tempo real
    const subscription = supabase
      .channel(`budget_messages:${budgetId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'budget_messages',
        filter: `budget_request_id=eq.${budgetId}`
      }, async (payload) => {
        const newMessage = payload.new as BudgetMessage;
        const messageWithSender = await fetchMessageSender(newMessage);
        setMessages(prev => [...prev, messageWithSender]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [budgetId]);

  // Rolar para a última mensagem quando as mensagens mudam
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchMessages = async () => {
    if (!budgetId) return;
    
    setLoading(true);
    try {
      // Buscar as mensagens sem usar a relação com profiles
      const { data: messagesData, error } = await supabase
        .from('budget_messages')
        .select('*')
        .eq('budget_request_id', budgetId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Buscar os detalhes dos remetentes para cada mensagem
      const messagesWithSenders = await Promise.all(
        messagesData.map(async (message) => {
          try {
            const { data: senderData, error: senderError } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', message.sender_id)
              .single();
            
            if (senderError) {
              console.warn("Erro ao buscar perfil do remetente:", senderError);
              return { ...message, sender: null };
            }
            
            return { ...message, sender: senderData };
          } catch (err) {
            console.error("Erro ao processar dados do remetente:", err);
            return { ...message, sender: null };
          }
        })
      );
      
      setMessages(messagesWithSenders);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
      showNotification('error', 'Não foi possível carregar as mensagens');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageSender = async (message: BudgetMessage): Promise<BudgetMessage> => {
    if (!message || !message.sender_id) {
      return { ...message, sender: null };
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', message.sender_id)
        .single();

      if (error) {
        console.warn("Erro ao buscar perfil do remetente:", error);
        return { ...message, sender: null };
      }
      
      return { ...message, sender: data };
    } catch (err) {
      console.error('Erro ao buscar dados do remetente:', err);
      return { ...message, sender: null };
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !budgetId) return;

    // Criar mensagem local com status temporário
    const tempMessage: BudgetMessage = {
      id: `temp-${Date.now()}`,
      budget_request_id: budgetId,
      sender_id: user.id,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      attachment_url: null,
      sender: {
        id: user.id,
        name: 'Você',
        avatar_url: null
      },
      status: 'sending'
    };

    // Adicionar a mensagem localmente primeiro (optimistic update)
    setMessages(prev => [...prev, tempMessage]);
    
    // Limpar o campo de mensagem imediatamente
    setNewMessage('');
    
    try {
      const { data, error } = await supabase
        .from('budget_messages')
        .insert({
          budget_request_id: budgetId,
          sender_id: user.id,
          message: tempMessage.message,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar a mensagem temporária com dados reais
      if (data) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...data, sender: tempMessage.sender, status: 'sent' } 
              : msg
          )
        );
      }
      
      onSendMessage();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      
      // Marcar a mensagem como falha
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' } 
            : msg
        )
      );
      
      showNotification('error', 'Não foi possível enviar a mensagem');
    }
  };

  return (
    <Box>
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 2, 
          maxHeight: '400px', 
          height: '400px',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
          },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardContent sx={{ flexGrow: 1, overflowY: 'auto', pb: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <Loader size={24} className="animate-spin" />
            </Box>
          ) : messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Nenhuma mensagem ainda. Inicie a conversa com o locador.
            </Typography>
          ) : (
            <Box>
              {messages.map((message) => {
                const isCurrentUser = message.sender_id === user?.id;
                const isSending = message.status === 'sending';
                const isFailed = message.status === 'failed';
                
                return (
                  <Box 
                    key={message.id} 
                    mb={2}
                    display="flex"
                    flexDirection="column"
                    alignItems={isCurrentUser ? 'flex-end' : 'flex-start'}
                    sx={{ opacity: isSending ? 0.7 : 1 }}
                  >
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      mb={0.5}
                      flexDirection={isCurrentUser ? 'row-reverse' : 'row'}
                    >
                      <Avatar 
                        src={message.sender?.avatar_url || ''} 
                        sx={{ width: 24, height: 24, mr: isCurrentUser ? 0 : 1, ml: isCurrentUser ? 1 : 0 }}
                      >
                        {message.sender?.name ? message.sender.name[0] : 'U'}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {message.sender?.name || 'Usuário'} • {format(parseISO(message.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        {isSending && " • Enviando..."}
                        {isFailed && " • Falha no envio"}
                      </Typography>
                    </Box>
                    <Box 
                      bgcolor={isCurrentUser ? 'primary.light' : 'grey.100'} 
                      color={isCurrentUser ? 'white' : 'inherit'}
                      p={1.5} 
                      borderRadius={2}
                      maxWidth="80%"
                      position="relative"
                    >
                      <Typography variant="body2">{message.message}</Typography>
                      {isFailed && (
                        <Box 
                          position="absolute" 
                          right={-8} 
                          bottom={0}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          sx={{ color: 'error.main', cursor: 'pointer' }}
                          onClick={() => {
                            // Reenviar mensagem
                            const msgToResend = message.message;
                            setMessages(prev => prev.filter(m => m.id !== message.id));
                            setNewMessage(msgToResend);
                          }}
                        >
                          <RefreshCw size={16} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </CardContent>
      </Card>
      <Box display="flex">
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ ml: 1 }}
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          Enviar
        </Button>
      </Box>
    </Box>
  );
};

interface ClientBudgetDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  budget: BudgetRequest | null;
  onApproveBudget: () => Promise<void>;
  onRejectBudget: () => Promise<void>;
  onMessageSent: () => void;
}

const ClientBudgetDetailsDialog: React.FC<ClientBudgetDetailsDialogProps> = ({
  open,
  onClose,
  budget,
  onApproveBudget,
  onRejectBudget,
  onMessageSent
}) => {
  const [loading, setLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [updatingAddress, setUpdatingAddress] = useState(false);
  const { showNotification } = useNotification();
  const [categoryName, setCategoryName] = useState<string | null>(null);

  useEffect(() => {
    if (budget?.delivery_address) {
      setDeliveryAddress(budget.delivery_address);
    }

    // Buscar o nome da categoria se tivermos apenas o ID
    if (budget?.equipment?.category && !categoryName) {
      fetchCategoryName(budget.equipment.category);
    }
  }, [budget]);

  // Função para buscar o nome da categoria pelo ID
  const fetchCategoryName = async (categoryId: string) => {
    try {
      // Verificar se temos o nome na estrutura categories
      if (budget?.equipment?.categories?.name) {
        setCategoryName(budget.equipment.categories.name);
        return;
      }

      // Caso contrário, buscar do banco de dados
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();

      if (error) {
        console.error('Erro ao buscar categoria:', error);
        return;
      }

      if (data) {
        setCategoryName(data.name);
      }
    } catch (err) {
      console.error('Erro ao processar categoria:', err);
    }
  };

  if (!budget) return null;

  const isResponded = budget.status === 'responded';
  const canTakeAction = isResponded;
  const canEditAddress = ['pending', 'responded'].includes(budget.status);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApproveBudget();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onRejectBudget();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!deliveryAddress.trim()) {
      showNotification('error', 'O endereço de entrega não pode estar vazio');
      return;
    }

    setUpdatingAddress(true);
    try {
      const { error } = await supabase
        .from('budget_requests')
        .update({ delivery_address: deliveryAddress.trim() })
        .eq('id', budget.id);

      if (error) throw error;

      setEditingAddress(false);
      showNotification('success', 'Endereço de entrega atualizado com sucesso');

      // Enviar mensagem sobre a alteração
      const { error: msgError } = await supabase
        .from('budget_messages')
        .insert({
          budget_request_id: budget.id,
          sender_id: budget.client_id,
          message: `Endereço de entrega atualizado para: ${deliveryAddress.trim()}`,
        });

      if (msgError) {
        console.error('Erro ao enviar mensagem sobre alteração de endereço:', msgError);
      }

      // Atualizar o orçamento localmente
      budget.delivery_address = deliveryAddress.trim();
      onMessageSent();
    } catch (err) {
      console.error('Erro ao atualizar endereço de entrega:', err);
      showNotification('error', 'Falha ao atualizar o endereço de entrega. Tente novamente.');
    } finally {
      setUpdatingAddress(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Detalhes do Orçamento</Typography>
          <StatusChip status={budget.status} />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Informações do equipamento e locador */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Equipamento</Typography>
              <Box display="flex" mb={2}>
                <Avatar 
                  variant="rounded" 
                  src={budget.equipment?.image || ''} 
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">{budget.equipment?.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Tag size={16} color="#666" />
                    <Chip 
                      label={categoryName || 'Carregando...'}
                      size="small"
                      sx={{ ml: 1 }}
                      variant="outlined"
                    />
                  </Box>
                  {budget.equipment?.daily_rate && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Diária: R$ {budget.equipment?.daily_rate?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Proprietário</Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar 
                  sx={{ width: 48, height: 48, mr: 2 }}
                >
                  <User />
                </Avatar>
                <Box>
                  <Typography variant="body1">{budget.ownerName || 'Proprietário'}</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1, gap: 1 }}>
                    {budget.ownerAddress && (
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <MapPin size={14} style={{ marginRight: 6 }} />
                        {budget.ownerAddress}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {budget.ownerWhatsapp && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          startIcon={<MessageSquare size={16} />}
                          sx={{ fontSize: '0.75rem' }}
                          href={`https://wa.me/55${budget.ownerWhatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                        >
                          Chamar no WhatsApp
                        </Button>
                      )}
                      
                      {budget.ownerAddress && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          startIcon={<MapPin size={16} />}
                          sx={{ fontSize: '0.75rem' }}
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(budget.ownerAddress)}`}
                          target="_blank"
                        >
                          Ver Rota para Retirada
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Detalhes do Pedido</Typography>
              <Box>
                <Typography variant="body2" display="flex" alignItems="center" mb={0.5}>
                  <Calendar size={16} className="mr-1" />
                  <strong>Período:</strong> &nbsp;
                  {format(parseISO(budget.start_date), 'dd/MM/yyyy', { locale: ptBR })} até {' '}
                  {format(parseISO(budget.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                </Typography>
                
                {budget.special_requirements && (
                  <Typography variant="body2" display="flex" alignItems="flex-start" mb={0.5}>
                    <FileText size={16} className="mr-1" style={{ marginTop: 3 }} />
                    <Box>
                      <strong>Requisitos Especiais:</strong><br />
                      {budget.special_requirements}
                    </Box>
                  </Typography>
                )}
                
                {/* Endereço de entrega com opção de edição */}
                <Box sx={{ mb: 1, mt: 1 }}>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <MapPin size={16} className="mr-1" />
                    <Box display="flex" alignItems="center" width="100%">
                      <strong>Endereço de Entrega:</strong>
                      {canEditAddress && !editingAddress && (
                        <Button 
                          size="small" 
                          startIcon={<Edit2 size={16} />}
                          variant="outlined"
                          sx={{ ml: 2, py: 0.5 }}
                          onClick={() => setEditingAddress(true)}
                        >
                          Alterar
                        </Button>
                      )}
                    </Box>
                  </Box>
                  
                  {editingAddress ? (
                    <>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Informe o endereço completo para entrega"
                        disabled={updatingAddress}
                        autoFocus
                        sx={{ mt: 1, mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button 
                          variant="contained" 
                          color="success"
                          startIcon={updatingAddress ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                          onClick={handleUpdateAddress}
                          disabled={updatingAddress || !deliveryAddress.trim()}
                          sx={{ flex: 1 }}
                        >
                          Salvar endereço
                        </Button>
                        <Button 
                          variant="outlined"
                          onClick={() => setEditingAddress(false)}
                          disabled={updatingAddress}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    </>
                  ) : budget.delivery_address ? (
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      {budget.delivery_address}
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, fontStyle: 'italic' }}>
                        Nenhum endereço informado
                      </Typography>
                      {canEditAddress && (
                        <Button 
                          size="small" 
                          startIcon={<Edit2 size={16} />}
                          sx={{ ml: 2 }}
                          onClick={() => setEditingAddress(true)}
                        >
                          Adicionar
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
                
                <Typography variant="body2" display="flex" alignItems="center" mb={0.5}>
                  <Clock size={16} className="mr-1" />
                  <strong>Criado em:</strong> &nbsp;
                  {format(parseISO(budget.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </Typography>

                {budget.total_amount && (
                  <Box 
                    sx={{ 
                      mt: 2,
                      p: 2, 
                      bgcolor: 'primary.light', 
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Typography variant="subtitle1" color="white" fontWeight={600} gutterBottom>
                      Valor Total do Orçamento
                    </Typography>
                    <Typography 
                      variant="h4" 
                      color="white" 
                      fontWeight={700}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}
                    >
                      <DollarSign size={28} style={{ marginRight: 4 }} />
                      R$ {budget.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mt: 1,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      px: 2,
                      py: 0.5,
                      borderRadius: 10
                    }}>
                      <MessageSquare size={16} style={{ marginRight: 6 }} />
                      <Typography variant="caption" color="white">
                        Valor respondido pelo locador em {format(parseISO(budget.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
          
          {/* Ações e chat */}
          <Grid item xs={12} md={6}>
            {canTakeAction && (
              <>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Responder ao Orçamento</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  O locador respondeu seu orçamento com o valor de <strong>R$ {budget.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>. Você pode aprová-lo para confirmar a reserva ou rejeitá-lo.
                </Alert>
                <Box display="flex" gap={2} mb={3}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={<CheckCircle size={16} />}
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    {loading ? <Loader size={16} className="animate-spin" /> : 'Aprovar Orçamento'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<XCircle size={16} />}
                    onClick={handleReject}
                    disabled={loading}
                  >
                    Rejeitar
                  </Button>
                </Box>
              </>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Mensagens</Typography>
            <BudgetChatSection 
              budgetId={budget.id}
              onSendMessage={onMessageSent}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientBudgetDetailsDialog; 