import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Equipment } from '../../types/types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface BookingFormProps {
  equipment: Equipment;
  onSubmit: () => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ equipment, onSubmit, onCancel }) => {
  const { showNotification } = useNotification();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<{
    start_date: string;
    end_date: string;
    status: string;
  }[]>([]);
  const [ownerContact, setOwnerContact] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { data, error } = await supabase
          .from('equipment_availability')
          .select('start_date, end_date, status')
          .eq('equipment_id', equipment.id)
          .gte('end_date', new Date().toISOString());

        if (error) throw error;
        setAvailability(data || []);
      } catch (err) {
        console.error('Error fetching availability:', err);
      }
    };

    const fetchOwnerContact = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', equipment.user_id)
          .single();

        if (error) throw error;
        setOwnerContact(data?.phone || null);
      } catch (err) {
        console.error('Error fetching owner contact:', err);
      }
    };

    fetchAvailability();
    fetchOwnerContact();
  }, [equipment.id, equipment.user_id]);

  const isDateAvailable = (date: Date) => {
    return !availability.some(period => {
      const start = new Date(period.start_date);
      const end = new Date(period.end_date);
      return date >= start && date <= end && period.status !== 'disponível';
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Criar solicitação de orçamento
      const { error: budgetError } = await supabase
        .from('budget_requests')
        .insert({
          equipment_id: equipment.id,
          client_id: user.id,
          owner_id: equipment.user_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'pending',
          delivery_address: deliveryAddress || null
        });

      if (budgetError) throw budgetError;

      // Criar mensagem de WhatsApp
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const startDateFormatted = startDate.toLocaleDateString('pt-BR');
      const endDateFormatted = endDate.toLocaleDateString('pt-BR');
      
      const whatsappMessage = encodeURIComponent(
        `Olá! Estou interessado em alugar o equipamento "${equipment.name}" por ${totalDays} dias, ` +
        `de ${startDateFormatted} até ${endDateFormatted}.` +
        `${deliveryAddress ? `\n\nEndereço para entrega: ${deliveryAddress}` : ''}\n\nPoderia me informar o valor e disponibilidade?`
      );

      // Abrir WhatsApp em nova janela e redirecionar para o painel
      if (ownerContact) {
        const phoneNumber = ownerContact.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');
        
        // Redirecionar para o painel do cliente após enviar para o WhatsApp
        window.location.href = '/dashboard/client';
      }

      showNotification('success', 'Solicitação de orçamento enviada com sucesso');
      onSubmit();
    } catch (err: any) {
      console.error('Error creating budget request:', err);
      showNotification('error', 'Erro ao enviar solicitação de orçamento');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Solicitar Orçamento</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início
              </label>
              <DatePicker
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                shouldDisableDate={(date) => !isDateAvailable(date)}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: false
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Término
              </label>
              <DatePicker
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                shouldDisableDate={(date) => !isDateAvailable(date)}
                minDate={startDate || new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: false
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço de Entrega
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Rua, número, bairro, cidade - UF"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          </div>
        </LocalizationProvider>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-700">
            <Calendar className="h-5 w-5 mr-2" />
            <span>Período Total:</span>
            <span className="ml-2 font-medium">
              {startDate && endDate
                ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} dias`
                : '-'}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            O valor total será informado pelo proprietário após análise do período solicitado.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !startDate || !endDate}
            className={`px-4 py-2 rounded-md text-white ${
              loading || !startDate || !endDate
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Enviando...' : 'Contatar via WhatsApp'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;