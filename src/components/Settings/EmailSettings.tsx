import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Save, Send, Mail } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { sendEmail } from '../../utils/emailService';

interface SMTPSettings {
  id?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  is_active: boolean;
  notification_email: string;
  service_id: string;
  template_id: string;
  user_id: string;
}

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  body: string;
  type: string;
}

const EmailSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // SMTP Settings
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: '',
    is_active: true,
    notification_email: '',
    service_id: '',
    template_id: '',
    user_id: ''
  });
  
  // Email Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>({
    name: '',
    subject: '',
    body: '',
    type: ''
  });
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    setLoading(true);
    try {
      // Carregar configurações SMTP
      const { data: smtpData, error: smtpError } = await supabase
        .from('smtp_settings')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (!smtpError && smtpData) {
        setSmtpSettings({
          ...smtpData,
          notification_email: smtpData.notification_email || '',
          service_id: smtpData.service_id || '',
          template_id: smtpData.template_id || '',
          user_id: smtpData.user_id || ''
        });
      }
      
      // Carregar templates de email
      const { data: templatesData, error: templatesError } = await supabase
        .from('email_templates')
        .select('*')
        .order('name', { ascending: true });
      
      if (!templatesError && templatesData) {
        setTemplates(templatesData);
        if (templatesData.length > 0) {
          setCurrentTemplate(templatesData[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showNotification('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSMTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSmtpSettings({
      ...smtpSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTemplate({
      ...currentTemplate,
      [name]: value
    });
  };
  
  const selectTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template);
  };
  
  const saveSMTPSettings = async () => {
    setSaving(true);
    try {
      // Verificar se já existe uma configuração
      if (smtpSettings.id) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('smtp_settings')
          .update({
            host: smtpSettings.host,
            port: smtpSettings.port,
            username: smtpSettings.username,
            password: smtpSettings.password,
            from_email: smtpSettings.from_email,
            from_name: smtpSettings.from_name,
            notification_email: smtpSettings.notification_email,
            service_id: smtpSettings.service_id,
            template_id: smtpSettings.template_id,
            user_id: smtpSettings.user_id,
            is_active: smtpSettings.is_active
          })
          .eq('id', smtpSettings.id);
        
        if (error) throw error;
      } else {
        // Inserir nova configuração
        const { error } = await supabase
          .from('smtp_settings')
          .insert([{
            host: smtpSettings.host,
            port: smtpSettings.port,
            username: smtpSettings.username,
            password: smtpSettings.password,
            from_email: smtpSettings.from_email,
            from_name: smtpSettings.from_name,
            notification_email: smtpSettings.notification_email,
            service_id: smtpSettings.service_id,
            template_id: smtpSettings.template_id,
            user_id: smtpSettings.user_id,
            is_active: smtpSettings.is_active
          }]);
        
        if (error) throw error;
      }
      
      showNotification('Configurações SMTP salvas com sucesso', 'success');
      loadSettings(); // Recarregar para obter o ID se foi uma inserção
    } catch (error) {
      console.error('Erro ao salvar configurações SMTP:', error);
      showNotification('Erro ao salvar configurações SMTP', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const saveTemplate = async () => {
    setSaving(true);
    try {
      if (currentTemplate.id) {
        // Atualizar template existente
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: currentTemplate.name,
            subject: currentTemplate.subject,
            body: currentTemplate.body,
            type: currentTemplate.type
          })
          .eq('id', currentTemplate.id);
        
        if (error) throw error;
      } else {
        // Inserir novo template
        const { error } = await supabase
          .from('email_templates')
          .insert([{
            name: currentTemplate.name,
            subject: currentTemplate.subject,
            body: currentTemplate.body,
            type: currentTemplate.type
          }]);
        
        if (error) throw error;
      }
      
      showNotification('Template salvo com sucesso', 'success');
      loadSettings(); // Recarregar templates
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      showNotification('Erro ao salvar template', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const createNewTemplate = () => {
    setCurrentTemplate({
      name: '',
      subject: '',
      body: '',
      type: ''
    });
  };
  
  const testEmailConnection = async () => {
    setTesting(true);
    try {
      // Usar o email de notificação como destino, ou o email de origem se não houver
      const testEmail = smtpSettings.notification_email || smtpSettings.from_email;
      
      if (!testEmail) {
        showNotification('Configure um email de origem ou notificação para testar', 'error');
        setTesting(false);
        return;
      }
      
      // Verificar se o template foi configurado
      if (!smtpSettings.service_id || !smtpSettings.template_id || !smtpSettings.user_id) {
        showNotification('Configure todos os campos do EmailJS antes de testar', 'error');
        setTesting(false);
        return;
      }

      // Criar dados de exemplo para o teste
      const now = new Date();
      // Formatação da data no padrão brasileiro: DD/MM/YYYY HH:MM
      const formattedDate = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const testData = {
        equipment_name: 'Compactador de Solo (TESTE)',
        client_name: 'Teste do Sistema',
        date_time: formattedDate,
        equipment_image_url: 'equipamento-placeholder.png',
        normalized_equipment_name: 'compactador-de-solo'
      };

      const result = await sendEmail({
        to: testEmail,
        subject: 'Teste de Configuração SMTP',
        html: `
          <h1>Teste de Configuração SMTP</h1>
          <p>Este é um email de teste para verificar se as configurações SMTP estão funcionando corretamente.</p>
          <p>Se você recebeu este email, as configurações estão corretas!</p>
          <p>Configurações utilizadas:</p>
          <ul>
            <li>Host: ${smtpSettings.host}</li>
            <li>Porta: ${smtpSettings.port}</li>
            <li>Usuário: ${smtpSettings.username}</li>
            <li>De: ${smtpSettings.from_name} &lt;${smtpSettings.from_email}&gt;</li>
          </ul>
        `,
        params: testData
      });
      
      if (result) {
        showNotification('Email de teste enviado com sucesso! Verifique sua caixa de entrada.', 'success');
      } else {
        showNotification('Falha ao enviar email de teste. Verifique as configurações.', 'error');
      }
    } catch (error) {
      console.error('Erro ao testar conexão SMTP:', error);
      showNotification('Erro ao testar conexão SMTP', 'error');
    } finally {
      setTesting(false);
    }
  };
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configurações de Email
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Configurações SMTP" />
          <Tab label="Templates de Email" />
        </Tabs>
      </Box>
      
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configurações do Servidor SMTP
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Configure as informações do servidor SMTP para envio de emails automáticos.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Servidor SMTP"
                  name="host"
                  value={smtpSettings.host}
                  onChange={handleSMTPChange}
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
                  value={smtpSettings.port}
                  onChange={handleSMTPChange}
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
                  value={smtpSettings.username}
                  onChange={handleSMTPChange}
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
                  value={smtpSettings.password}
                  onChange={handleSMTPChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email de Origem"
                  name="from_email"
                  value={smtpSettings.from_email}
                  onChange={handleSMTPChange}
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
                  value={smtpSettings.from_name}
                  onChange={handleSMTPChange}
                  fullWidth
                  required
                  placeholder="Nome da Empresa"
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email para Receber Notificações e Orçamentos"
                  name="notification_email"
                  value={smtpSettings.notification_email}
                  onChange={handleSMTPChange}
                  fullWidth
                  helperText="Email padrão para receber orçamentos e notificações do sistema"
                  placeholder="orcamentos@seudominio.com.br"
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Configurações do EmailJS
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Configure as informações do EmailJS para envio direto de emails a partir do navegador. 
                  <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 5 }}>
                    Criar conta no EmailJS
                  </a>
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Service ID"
                  name="service_id"
                  value={smtpSettings.service_id}
                  onChange={handleSMTPChange}
                  fullWidth
                  helperText="ID do serviço configurado no EmailJS"
                  placeholder="service_xxxxxxx"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Template ID"
                  name="template_id"
                  value={smtpSettings.template_id}
                  onChange={handleSMTPChange}
                  fullWidth
                  helperText="ID do template configurado no EmailJS"
                  placeholder="template_xxxxxxx"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="User ID (Public Key)"
                  name="user_id"
                  value={smtpSettings.user_id}
                  onChange={handleSMTPChange}
                  fullWidth
                  helperText="Chave pública da sua conta no EmailJS"
                  placeholder="xxxxxxxxxxxxxx"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={smtpSettings.is_active}
                      onChange={handleSMTPChange}
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
                    onClick={saveSMTPSettings}
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Send />}
                    onClick={testEmailConnection}
                    disabled={testing || !smtpSettings.user_id || !smtpSettings.service_id || !smtpSettings.template_id}
                  >
                    {testing ? 'Enviando...' : 'Testar Conexão'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Templates Disponíveis
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={createNewTemplate}
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
                        onClick={() => selectTemplate(template)}
                        sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {currentTemplate.id ? 'Editar Template' : 'Novo Template'}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nome do Template"
                      name="name"
                      value={currentTemplate.name}
                      onChange={handleTemplateChange}
                      fullWidth
                      required
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tipo"
                      name="type"
                      value={currentTemplate.type}
                      onChange={handleTemplateChange}
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
                      value={currentTemplate.subject}
                      onChange={handleTemplateChange}
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
                      value={currentTemplate.body}
                      onChange={handleTemplateChange}
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
                        onClick={saveTemplate}
                        disabled={saving || !currentTemplate.name || !currentTemplate.subject || !currentTemplate.body || !currentTemplate.type}
                      >
                        {saving ? 'Salvando...' : 'Salvar Template'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
        message={notification?.message}
      >
        <Alert severity={notification?.type || 'info'} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailSettings; 