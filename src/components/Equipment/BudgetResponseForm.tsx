import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { BudgetRequest } from '../../types/types';
import { useNotification } from '../../context/NotificationContext';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { DollarSign, FileText } from 'lucide-react';

interface BudgetResponseFormProps {
  budgetRequest: BudgetRequest;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BudgetResponseForm: React.FC<BudgetResponseFormProps> = ({
  budgetRequest,
  open,
  onClose,
  onSuccess,
}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalAmount || !message) return;

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('budget_requests')
        .update({
          status: 'responded',
          total_amount: parseFloat(totalAmount),
        })
        .eq('id', budgetRequest.id);

      if (updateError) throw updateError;

      showNotification('success', 'Orçamento respondido com sucesso');
      onSuccess();
    } catch (err) {
      console.error('Error responding to budget request:', err);
      showNotification('error', 'Erro ao responder orçamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Responder Orçamento</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              {budgetRequest.equipment?.image ? (
                <img
                  src={budgetRequest.equipment.image}
                  alt={budgetRequest.equipment?.name}
                  className="w-16 h-16 object-cover rounded-lg mr-4"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                  <Package2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{budgetRequest.equipment?.name}</h3>
                <p className="text-sm text-gray-600">
                  Período: {new Date(budgetRequest.start_date).toLocaleDateString('pt-BR')} até{' '}
                  {new Date(budgetRequest.end_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <TextField
              label="Valor Total da Locação"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
              fullWidth
              helperText="Informe o valor total para todo o período de locação"
              InputProps={{
                startAdornment: (
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                ),
              }}
            />

            <TextField
              label="Observações"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              required
              fullWidth
              placeholder="Informe condições especiais, informações adicionais ou observações importantes..."
              InputProps={{
                startAdornment: (
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                ),
              }}
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !totalAmount || !message}
          >
            {loading ? 'Enviando...' : 'Enviar Resposta'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BudgetResponseForm;