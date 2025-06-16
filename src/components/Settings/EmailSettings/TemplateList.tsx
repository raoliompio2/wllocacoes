import React from 'react';
import {
  Box,
  Button,
  Divider,
  Alert,
  Typography
} from '@mui/material';
import { Mail } from 'lucide-react';

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  body: string;
  type: string;
}

interface TemplateListProps {
  templates: EmailTemplate[];
  currentTemplate: EmailTemplate;
  onSelectTemplate: (template: EmailTemplate) => void;
  onCreateNewTemplate: () => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  currentTemplate,
  onSelectTemplate,
  onCreateNewTemplate
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Templates Disponíveis
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={onCreateNewTemplate}
          startIcon={<Mail />}
        >
          Novo Template
        </Button>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {templates.length === 0 ? (
        <Alert severity="info">
          Nenhum template cadastrado. Crie seu primeiro template de email.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {templates.map((template) => (
            <Button
              key={template.id}
              variant={currentTemplate.id === template.id ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => onSelectTemplate(template)}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              {template.name}
            </Button>
          ))}
        </Box>
      )}
    </>
  );
};

export default TemplateList; 