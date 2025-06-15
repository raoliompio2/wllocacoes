import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { BudgetRequest, BudgetMessage } from '../../types/types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Send, Package2, User, RefreshCw } from 'lucide-react';

interface BudgetChatProps {
  budgetRequest: BudgetRequest;
  open: boolean;
  onClose: () => void;
}

const BudgetChat: React.FC<BudgetChatProps> = ({
  budgetRequest,
  open,
  onClose,
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState<BudgetMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, [budgetRequest.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      // Buscar as mensagens sem usar a relação com profiles
      const { data: messagesData, error } = await supabase
        .from('budget_messages')
        .select('*')
        .eq('budget_request_id', budgetRequest.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
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
      console.error('Error fetching messages:', err);
      showNotification('error', 'Erro ao carregar mensagens');
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('budget_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'budget_messages',
          filter: `budget_request_id=eq.${budgetRequest.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as BudgetMessage;
          
          // Buscar detalhes do remetente
          try {
            const { data: senderData, error: senderError } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();
              
            if (senderError) {
              console.warn("Erro ao buscar perfil do remetente:", senderError);
              setMessages((prev) => [...prev, { ...newMessage, sender: null }]);
            } else {
              setMessages((prev) => [...prev, { ...newMessage, sender: senderData }]);
            }
          } catch (err) {
            console.error("Erro ao processar dados do remetente:", err);
            setMessages((prev) => [...prev, { ...newMessage, sender: null }]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    // Criar mensagem local com status temporário
    const tempMessage: BudgetMessage = {
      id: `temp-${Date.now()}`,
      budget_request_id: budgetRequest.id,
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
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('budget_messages')
        .insert({
          budget_request_id: budgetRequest.id,
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
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Marcar a mensagem como falha
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' } 
            : msg
        )
      );
      
      showNotification('error', 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <div className="flex items-center">
          {budgetRequest.equipment?.image ? (
            <img
              src={budgetRequest.equipment.image}
              alt={budgetRequest.equipment?.name}
              className="w-10 h-10 object-cover rounded-lg mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
              <Package2 className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="font-semibold">{budgetRequest.equipment?.name}</h3>
            <p className="text-sm text-gray-600">
              {new Date(budgetRequest.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </DialogTitle>

      <DialogContent>
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start mb-4 ${
                  message.sender_id === user?.id ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 ${message.sender_id === user?.id ? 'ml-3' : 'mr-3'}`}>
                  {message.sender?.avatar_url ? (
                    <img
                      src={message.sender.avatar_url}
                      alt={message.sender.name || ''}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </div>
                <div
                  className={`flex flex-col max-w-[70%] ${
                    message.sender_id === user?.id ? 'items-end' : 'items-start'
                  }`}
                  style={{ opacity: message.status === 'sending' ? 0.7 : 1 }}
                >
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <span>{message.sender?.name || 'Usuário'}</span>
                    <span>•</span>
                    <span>
                      {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {message.status === 'sending' && <span>• Enviando...</span>}
                    {message.status === 'failed' && (
                      <span className="flex items-center text-red-500 gap-1">
                        • Falha no envio 
                        <RefreshCw 
                          className="h-3 w-3 cursor-pointer ml-1" 
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            // Reenviar mensagem
                            const msgToResend = message.message;
                            setMessages(prev => prev.filter(m => m.id !== message.id));
                            setNewMessage(msgToResend);
                          }}
                        />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="mt-auto">
            <div className="flex items-center space-x-2">
              <TextField
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                fullWidth
                disabled={loading}
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !newMessage.trim()}
                className="min-w-[40px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetChat;