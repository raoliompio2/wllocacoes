import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Typography,
  Alert
} from '@mui/material';
import { Save } from 'lucide-react';

interface SMTPSettings {
  id?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  is_active: boolean;
}

interface SMTPSettingsFormProps {
  settings: SMTPSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const SMTPSettingsForm: React.FC<SMTPSettingsFormProps> = ({
  settings,
  onChange,
  onSave,
  saving
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Configurações do Servidor SMTP
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Configure as informações do servidor SMTP para envio de emails automáticos.
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Os emails serão registrados no sistema e enviados por um processo em segundo plano.
        Não é possível testar a conexão diretamente no navegador.
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Servidor SMTP"
            name="host"
            value={settings.host}
            onChange={onChange}
            fullWidth
            required
            placeholder="smtp.gmail.com"
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Porta"
            name="port"
            type="number"
            value={settings.port}
            onChange={onChange}
            fullWidth
            required
            placeholder="587"
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Usuário SMTP"
            name="username"
            value={settings.username}
            onChange={onChange}
            fullWidth
            required
            placeholder="seu.email@gmail.com"
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Senha SMTP"
            name="password"
            type="password"
            value={settings.password}
            onChange={onChange}
            fullWidth
            required
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email de Origem"
            name="from_email"
            value={settings.from_email}
            onChange={onChange}
            fullWidth
            required
            placeholder="contato@seudominio.com.br"
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Nome de Origem"
            name="from_name"
            value={settings.from_name}
            onChange={onChange}
            fullWidth
            required
            placeholder="Nome da Empresa"
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.is_active}
                onChange={onChange}
                name="is_active"
                color="primary"
              />
            }
            label="Ativar envio de emails"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={onSave}
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default SMTPSettingsForm; 