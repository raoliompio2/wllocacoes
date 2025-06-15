import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../utils/supabaseClient';
import { useNotification } from '../../context/NotificationContext';

interface MaintenanceFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  equipmentId: string;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  open,
  onClose,
  onSave,
  equipmentId,
}) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    description: '',
    maintenance_date: new Date(),
    cost: '',
    status: 'agendada',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!equipmentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(equipmentId)) {
      setError('ID do equipamento inválido');
    } else {
      setError(null);
    }
  }, [equipmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipmentId) {
      showNotification('error', 'ID do equipamento inválido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: saveError } = await supabase
        .from('equipment_maintenance')
        .insert([{
          equipment_id: equipmentId,
          description: formData.description,
          maintenance_date: formData.maintenance_date.toISOString(),
          cost: parseFloat(formData.cost) || null,
          status: formData.status,
        }]);

      if (saveError) throw saveError;

      showNotification('success', 'Manutenção agendada com sucesso');
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
      showNotification('error', 'Erro ao agendar manutenção');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agendar Manutenção</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Descrição"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                required
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data da Manutenção"
                  value={formData.maintenance_date}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData(prev => ({ ...prev, maintenance_date: newValue }));
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="cost"
                label="Custo Estimado"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="agendada">Agendada</MenuItem>
                  <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  <MenuItem value="concluída">Concluída</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {error && (
            <Box mt={2} color="error.main">
              {error}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !!error}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MaintenanceForm;