import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Equipment } from '../../types/types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, MapPin, FileText, Send } from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface BudgetRequestFormProps {
  equipment: Equipment;
  open: boolean;
  onClose: () => void;
}

const BudgetRequestForm: React.FC<BudgetRequestFormProps> = ({
  equipment,
  open,
  onClose,
}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('budget_requests')
        .insert({
          equipment_id: equipment.id,
          client_id: user.id,
          owner_id: equipment.user_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          special_requirements: specialRequirements,
          delivery_address: deliveryAddress,
        });

      if (error) throw error;

      showNotification('success', 'Solicitação de orçamento enviada com sucesso');
      onClose();
    } catch (err) {
      console.error('Error submitting budget request:', err);
      showNotification('error', 'Erro ao enviar solicitação de orçamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Solicitar Orçamento</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <img
                src={equipment.image || '/placeholder.png'}
                alt={equipment.name}
                className="w-16 h-16 object-cover rounded-lg mr-4"
              />
              <div>
                <h3 className="font-semibold">{equipment.name}</h3>
                <p className="text-sm text-gray-600">{equipment.category}</p>
              </div>
            </div>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <div className="grid grid-cols-2 gap-4">
                <DatePicker
                  label="Data Inicial"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  minDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
                <DatePicker
                  label="Data Final"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  minDate={startDate || new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </div>
            </LocalizationProvider>

            <TextField
              label="Requisitos Especiais"
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Descreva requisitos específicos, condições especiais ou outras necessidades..."
              InputProps={{
                startAdornment: (
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                ),
              }}
            />

            <TextField
              label="Endereço de Entrega"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              multiline
              rows={2}
              fullWidth
              required
              placeholder="Informe o endereço completo para entrega..."
              InputProps={{
                startAdornment: (
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
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
            disabled={loading || !startDate || !endDate}
            startIcon={<Send className="h-4 w-4" />}
          >
            {loading ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BudgetRequestForm;