import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  MessageSquare,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Loader,
  Phone,
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
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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
      }, (payload) => {
        const newMessage = payload.new as BudgetMessage;
        fetchMessageSender(newMessage).then(messageWithSender => {
          setMessages(prev => [...prev, messageWithSender]);
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [budgetId]);

  // Rola para a última mensagem quando as mensagens mudam
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
      // Buscar as mensagens sem tentar usar a relação com profiles
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
              Nenhuma mensagem ainda. Inicie a conversa com o cliente.
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

interface BudgetResponseFormProps {
  budget: BudgetRequest;
  onSubmit: (amount: number, status: string) => Promise<void>;
  onConvertToBooking?: () => Promise<void>;
}

const BudgetResponseForm: React.FC<BudgetResponseFormProps> = ({ budget, onSubmit, onConvertToBooking }) => {
  const [totalAmount, setTotalAmount] = useState(budget.total_amount || 0);
  const [status, setStatus] = useState<string>(budget.status || 'responded');
  const [loading, setLoading] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const isEditing = ['responded', 'approved', 'rejected'].includes(budget.status);
  const canConvert = budget.status === 'approved' && onConvertToBooking;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(totalAmount, status);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToBooking = async () => {
    if (!onConvertToBooking) return;
    
    setConvertLoading(true);
    try {
      await onConvertToBooking();
    } finally {
      setConvertLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Valor Total (R$)"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(Number(e.target.value))}
            InputProps={{
              startAdornment: <DollarSign size={16} />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="responded">Responder</MenuItem>
              <MenuItem value="approved">Aprovar</MenuItem>
              <MenuItem value="rejected">Rejeitar</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader size={16} className="animate-spin" /> : isEditing ? 'Atualizar Resposta' : 'Enviar Resposta'}
          </Button>
        </Grid>
        
        {canConvert && (
          <Grid item xs={12}>
            <Button 
              variant="outlined" 
              color="success" 
              fullWidth 
              onClick={handleConvertToBooking}
              disabled={convertLoading}
              startIcon={convertLoading ? <Loader size={16} className="animate-spin" /> : <Calendar size={16} />}
            >
              Converter em Reserva
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

interface BudgetDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  budget: BudgetRequest | null;
  onRespondBudget: (amount: number, status: string) => Promise<void>;
  onMessageSent: () => void;
  onConvertToBooking?: (budgetId: string) => Promise<void>;
}

const BudgetDetailsDialog: React.FC<BudgetDetailsDialogProps> = ({
  open,
  onClose,
  budget,
  onRespondBudget,
  onMessageSent,
  onConvertToBooking
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [categoryName, setCategoryName] = useState<string | null>(null);

  useEffect(() => {
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
  
  const isRespondedOrFinalized = ['responded', 'approved', 'rejected', 'converted'].includes(budget.status);

  const handleConvertToBooking = async () => {
    if (onConvertToBooking && budget) {
      await onConvertToBooking(budget.id);
      onClose();
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
          {/* Informações do equipamento */}
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
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Diária: R$ {budget.equipment?.daily_rate?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Cliente</Typography>
              <Box display="flex" alignItems="flex-start" mb={2}>
                <Avatar 
                  src={budget.client?.avatar_url || ''} 
                  sx={{ width: 48, height: 48, mr: 2, mt: 0.5 }}
                >
                  {(budget.client?.name || 'C')[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {budget.client?.name || (budget.contact_method === 'whatsapp' ? 'Cliente via WhatsApp' : 'Cliente')}
                    {budget.contact_method === 'whatsapp' && (
                      <Chip 
                        label="WhatsApp" 
                        size="small" 
                        color="success" 
                        icon={<MessageSquare size={12} />} 
                        sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1 } }} 
                      />
                    )}
                  </Typography>
                  {budget.client?.email && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <MessageSquare size={14} style={{ marginRight: 6 }} />
                      {budget.client.email}
                    </Typography>
                  )}
                  {budget.client?.phone && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Phone size={14} style={{ marginRight: 6 }} />
                        {budget.client.phone}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        startIcon={<MessageSquare size={14} />}
                        href={`https://wa.me/55${budget.client.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Chamar no WhatsApp
                      </Button>
                    </Box>
                  )}
                  
                  {/* Botão de WhatsApp para orçamentos via WhatsApp sem telefone do cliente */}
                  {budget.contact_method === 'whatsapp' && !budget.client?.phone && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="success"
                      startIcon={<MessageSquare size={14} />}
                      href="https://wa.me/5585986101415"
                      target="_blank"
                      sx={{ fontSize: '0.75rem', mt: 1 }}
                    >
                      Abrir WhatsApp
                    </Button>
                  )}
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
                
                {budget.delivery_address && (
                  <Typography variant="body2" display="flex" alignItems="flex-start" mb={0.5}>
                    <FileText size={16} className="mr-1" style={{ marginTop: 3 }} />
                    <Box>
                      <strong>Endereço de Entrega:</strong><br />
                      {budget.delivery_address}
                    </Box>
                  </Typography>
                )}
                
                <Typography variant="body2" display="flex" alignItems="center" mb={0.5}>
                  <Clock size={16} className="mr-1" />
                  <strong>Criado em:</strong> &nbsp;
                  {format(parseISO(budget.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Formulário de resposta e chat */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              {isRespondedOrFinalized ? 'Editar Resposta do Orçamento' : 'Responder ao Orçamento'}
            </Typography>
            <BudgetResponseForm 
              budget={budget} 
              onSubmit={onRespondBudget} 
              onConvertToBooking={budget.status === 'approved' && onConvertToBooking ? handleConvertToBooking : undefined}
            />
            
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

export default BudgetDetailsDialog; 