import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { supabase } from '../../../utils/supabaseClient';
import SMTPSettingsForm from './SMTPSettingsForm';
import EmailTemplateForm from './EmailTemplateForm';
import TemplateList from './TemplateList';
import { SMTPSettings, EmailTemplate, NotificationType } from './types';

const EmailSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  
  // SMTP Settings
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: '',
    is_active: true
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
        setSmtpSettings(smtpData);
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
      [name]: type === 'checkbox' ? checked : name === 'port' ? parseInt(value) : value
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
            <SMTPSettingsForm
              settings={smtpSettings}
              onChange={handleSMTPChange}
              onSave={saveSMTPSettings}
              saving={saving}
            />
          </CardContent>
        </Card>
      )}
      
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <TemplateList
                  templates={templates}
                  currentTemplate={currentTemplate}
                  onSelectTemplate={selectTemplate}
                  onCreateNewTemplate={createNewTemplate}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <EmailTemplateForm
                  template={currentTemplate}
                  onChange={handleTemplateChange}
                  onSave={saveTemplate}
                  saving={saving}
                />
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