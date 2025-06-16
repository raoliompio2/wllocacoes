import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Phone,
  Email,
  LocationOn,
  WhatsApp,
  Send,
  AccessTime,
  Home as HomeIcon
} from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';
import BusinessHours from '../common/BusinessHours';
import ContactPageSkeleton from './ContactPageSkeleton';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  contactPreference: 'email' | 'phone' | 'whatsapp';
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

const subjectOptions = [
  'Orçamento de Equipamento',
  'Dúvidas sobre Locação',
  'Agendamento de Visita',
  'Manutenção de Equipamentos',
  'Outros'
];

const ContactPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Dados da empresa
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'NOME DA EMPRESA',
    address: 'Endereço da Empresa, Número - Bairro\nCidade - UF, 00000-000',
    phone: '(00) 0000-0000',
    whatsapp: '(00) 0000-0000',
    email: 'contato@seudominio.com.br'
  });

  // Segunda unidade
  const secondBranch = {
    address: 'Endereço da Segunda Unidade, Número - Bairro\nCidade – UF, 00000-000',
    phone: '(00) 0000-0000',
    whatsapp: '(00) 0000-0000'
  };
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
    subject: subjectOptions[0],
    message: '',
    contactPreference: 'email'
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Efeito para carregar dados e definir loading como false
  useEffect(() => {
    // Simulação de carregamento de dados da empresa
    const fetchCompanyInfo = async () => {
      try {
        // Aqui você poderia buscar os dados da empresa do Supabase
        // Por enquanto, apenas simulamos um delay
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  // Validação de formulário
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formValues.name.trim()) {
      errors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (!formValues.email.trim()) {
      errors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    if (formValues.contactPreference === 'phone' || formValues.contactPreference === 'whatsapp') {
      if (!formValues.phone.trim()) {
        errors.phone = 'Telefone é obrigatório para este tipo de contato';
        isValid = false;
      } else if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(formValues.phone)) {
        errors.phone = 'Formato inválido. Use (xx) xxxxx-xxxx';
        isValid = false;
      }
    }

    if (!formValues.subject) {
      errors.subject = 'Assunto é obrigatório';
      isValid = false;
    }

    if (!formValues.message.trim()) {
      errors.message = 'Mensagem é obrigatória';
      isValid = false;
    } else if (formValues.message.trim().length < 20) {
      errors.message = 'Mensagem muito curta (mínimo 20 caracteres)';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormValues({
      ...formValues,
      [name]: value
    });

    // Limpar erro específico quando o usuário digita
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      // Formatar como (xx) xxxxx-xxxx ou (xx) xxxx-xxxx
      if (value.length > 2) {
        value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      }
      if (value.length > 9) {
        const hasNineDigits = value.length > 13;
        const position = hasNineDigits ? 10 : 9;
        value = `${value.substring(0, position)}-${value.substring(position)}`;
      }
      
      setFormValues({
        ...formValues,
        phone: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Enviar os dados para o banco de dados
      const { data, error } = await supabase
        .from('contact_messages' as any)
        .insert([
          {
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone || null,
            subject: formValues.subject,
            message: formValues.message,
            contact_preference: formValues.contactPreference,
            status: 'pendente'
          }
        ]);
      
      if (error) throw error;
      
      // Sucesso
      setSuccess(true);
      
      // Resetar formulário
      setFormValues({
        name: '',
        email: '',
        phone: '',
        subject: subjectOptions[0],
        message: '',
        contactPreference: 'email'
      });
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setError('Ocorreu um erro ao enviar sua mensagem. Tente novamente ou entre em contato por telefone.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  // Formatação de telefone para exibição
  const formatPhoneLink = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  // Se estiver carregando, mostra o skeleton
  if (loading && !submitting) {
    return <ContactPageSkeleton />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Entre em Contato
        </Typography>
        <Divider sx={{ width: 100, borderColor: 'primary.main', borderWidth: 2, mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Estamos prontos para atender suas necessidades
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Informações de Contato */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: 2,
              bgcolor: 'secondary.main',
              color: 'white'
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Informações de Contato
            </Typography>
            
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress color="inherit" size={30} />
              </Box>
            ) : (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {companyInfo.name}
                </Typography>
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Unidade Cidade 1
                  </Typography>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <LocationOn sx={{ fontSize: 24, mr: 2 }} />
                    <Typography variant="body1">
                      {companyInfo.address}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Phone sx={{ fontSize: 24, mr: 2 }} />
                    <Box>
                      <Typography variant="body1" gutterBottom>
                        {companyInfo.phone}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{ 
                          color: 'white', 
                          borderColor: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                        href={`tel:${formatPhoneLink(companyInfo.phone || '')}`}
                      >
                        Ligar agora
                      </Button>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <WhatsApp sx={{ fontSize: 24, mr: 2 }} />
                    <Box>
                      <Typography variant="body1" gutterBottom>
                        {companyInfo.whatsapp}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{ 
                          color: 'white', 
                          borderColor: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                        href={`https://api.whatsapp.com/send?phone=55${formatPhoneLink(companyInfo.whatsapp || '')}`}
                        target="_blank"
                      >
                        Enviar mensagem
                      </Button>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 4 }} />

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Unidade Cidade 2
                  </Typography>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <LocationOn sx={{ fontSize: 24, mr: 2 }} />
                    <Typography variant="body1">
                      {secondBranch.address}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Phone sx={{ fontSize: 24, mr: 2 }} />
                    <Box>
                      <Typography variant="body1" gutterBottom>
                        {secondBranch.phone}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{ 
                          color: 'white', 
                          borderColor: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                        href={`tel:${formatPhoneLink(secondBranch.phone || '')}`}
                      >
                        Ligar agora
                      </Button>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <WhatsApp sx={{ fontSize: 24, mr: 2 }} />
                    <Box>
                      <Typography variant="body1" gutterBottom>
                        {secondBranch.whatsapp}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{ 
                          color: 'white', 
                          borderColor: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                        href={`https://api.whatsapp.com/send?phone=55${formatPhoneLink(secondBranch.whatsapp || '')}`}
                        target="_blank"
                      >
                        Enviar mensagem
                      </Button>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 4 }} />
                  
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Email sx={{ fontSize: 24, mr: 2 }} />
                    <Box>
                      <Typography variant="body1" gutterBottom>
                        {companyInfo.email}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{ 
                          color: 'white', 
                          borderColor: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                        href={`mailto:${companyInfo.email}`}
                      >
                        Enviar email
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Componente de horário de atendimento */}
                  <BusinessHours color="white" iconColor="white" />
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Formulário de Contato */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Envie sua Mensagem
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Preencha o formulário abaixo e entraremos em contato o mais breve possível.
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label="Nome completo"
                    value={formValues.name}
                    onChange={handleInputChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    fullWidth
                    required
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    fullWidth
                    required
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="phone"
                    label="Telefone / WhatsApp"
                    value={formValues.phone}
                    onChange={handlePhoneInput}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone || "Formato: (xx) xxxxx-xxxx"}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="subject"
                    label="Assunto"
                    select
                    value={formValues.subject}
                    onChange={handleInputChange}
                    error={!!formErrors.subject}
                    helperText={formErrors.subject}
                    fullWidth
                    required
                    variant="outlined"
                    margin="normal"
                  >
                    {subjectOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="message"
                    label="Mensagem"
                    value={formValues.message}
                    onChange={handleInputChange}
                    error={!!formErrors.message}
                    helperText={formErrors.message}
                    fullWidth
                    required
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={6}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl component="fieldset" sx={{ mt: 1 }}>
                    <FormLabel component="legend">Como prefere ser contatado?</FormLabel>
                    <RadioGroup
                      row
                      name="contactPreference"
                      value={formValues.contactPreference}
                      onChange={handleInputChange}
                    >
                      <FormControlLabel value="email" control={<Radio />} label="Email" />
                      <FormControlLabel value="phone" control={<Radio />} label="Telefone" />
                      <FormControlLabel value="whatsapp" control={<Radio />} label="WhatsApp" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                    sx={{ mt: 2, py: 1.5, px: 4 }}
                  >
                    {submitting ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar de sucesso */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Mensagem enviada com sucesso! Entraremos em contato em breve.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContactPage; 