import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography
} from '@mui/material';
import { Save } from 'lucide-react';

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  body: string;
  type: string;
}

interface EmailTemplateFormProps {
  template: EmailTemplate;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({
  template,
  onChange,
  onSave,
  saving
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        {template.id ? 'Editar Template' : 'Novo Template'}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Nome do Template"
            name="name"
            value={template.name}
            onChange={onChange}
            fullWidth
            required
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Tipo"
            name="type"
            value={template.type}
            onChange={onChange}
            fullWidth
            required
            margin="normal"
            placeholder="budget_request"
            helperText="Identificador único para este template (ex: budget_request)"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Assunto"
            name="subject"
            value={template.subject}
            onChange={onChange}
            fullWidth
            required
            margin="normal"
            placeholder="Novo orçamento para {{equipment_name}}"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Conteúdo HTML"
            name="body"
            value={template.body}
            onChange={onChange}
            fullWidth
            required
            multiline
            rows={10}
            margin="normal"
            placeholder="<h1>Novo orçamento</h1><p>Um cliente solicitou orçamento para {{equipment_name}}.</p>"
            helperText="Use {{equipment_name}} e {{client_name}} como variáveis que serão substituídas."
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={onSave}
              disabled={saving || !template.name || !template.subject || !template.body || !template.type}
            >
              {saving ? 'Salvando...' : 'Salvar Template'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default EmailTemplateForm; 