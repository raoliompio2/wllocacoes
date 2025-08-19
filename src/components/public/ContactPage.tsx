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
  useMediaQuery,
  Stack
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
import SEOHead from '../SEO/SEOHead';
import { useTheme as useCustomTheme } from '../../theme/ThemeContext';

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
  const { themePreferences } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Dados da empresa
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'WL Locações Locadora de Equipamentos Para Construção',
    address: 'Av. Dep. Paulino Rocha, 1881 - Cajazeiras, Fortaleza - CE, 60864-311',
    phone: '(85) 98610-1415',
    whatsapp: '(85) 98610-1415',
    email: 'contato@wllocacoes.com.br'
  });
  
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
      setError('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError('');
  };

  // Formata número de telefone para link
  const formatPhoneLink = (phone: string) => {
    return `tel:${phone.replace(/\D/g, '')}`;
  };
  
  // Formata número de WhatsApp para link
  const formatWhatsAppLink = (phone: string) => {
    return `https://wa.me/55${phone.replace(/\D/g, '')}`;
  };

  if (loading) {
    return <ContactPageSkeleton />;
  }

  // Usar diretamente as cores do tema para evitar problemas com a tipagem do ThemePreferences
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;

  // Schema para a página de contato
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Entre em Contato - WL Locações",
    "description": "Entre em contato com a WL Locações para aluguel de equipamentos para construção civil e industrial. Atendemos Fortaleza e toda região com equipamentos de qualidade.",
    "url": "https://wllocacoes.com.br/contato",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "WL Locações",
      "description": "Aluguel de equipamentos para construção civil e industrial em Fortaleza e região.",
      "telephone": "(85) 98610-1415",
      "email": "contato@wllocacoes.com.br",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "07:00",
          "closes": "17:00"
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Endereço da Empresa",
        "addressLocality": "Cidade",
        "addressRegion": "UF",
        "postalCode": "00000-000",
        "addressCountry": "BR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 0,
        "longitude": 0
      }
    }
  };

  return (
    <>
      <SEOHead 
        title="Entre em Contato | WL Locações | Aluguel de Equipamentos em Fortaleza"
        description="Entre em contato com a WL Locações Locadora para aluguel de equipamentos para construção civil e industrial. Atendemos Fortaleza, Dourados e região com equipamentos de qualidade para sua obra ou evento."
        canonicalUrl="/contato"
        schema={contactPageSchema}
        keywords="contato WL Locações, aluguel equipamentos Fortaleza, locação equipamentos construção MS, andaimes Fortaleza, betoneira aluguel Dourados, compactadores MS, martelete Fortaleza, locadora equipamentos Mato Grosso do Sul"
      />
      
      <Box 
        sx={{ 
          py: { xs: 4, md: 8 },
          backgroundColor: theme.palette.background.default
        }}
        itemScope
        itemType="http://schema.org/LocalBusiness"
      >
        {/* Metadados ocultos para SEO */}
        <meta itemProp="name" content="WL Locações Locadora de Equipamentos Para Construção" />
        <meta itemProp="description" content="Entre em contato com a WL Locações para aluguel de equipamentos para construção civil e industrial em Fortaleza e região." />
        <meta itemProp="telephone" content="(85) 98610-1415" />
        <meta itemProp="email" content="contato@wllocacoes.com.br" />
        <div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">
          <meta itemProp="streetAddress" content="Av. Dep. Paulino Rocha, 1881 - Cajazeiras" />
          <meta itemProp="addressLocality" content="Fortaleza" />
          <meta itemProp="addressRegion" content="MS" />
          <meta itemProp="postalCode" content="60864-311" />
          <meta itemProp="addressCountry" content="BR" />
        </div>
        <meta itemProp="openingHours" content="Mo-Fr 07:00-11:00,13:00-17:00" />
        <meta itemProp="openingHours" content="Sa 07:00-11:30" />
      
        <Container maxWidth="xl">
          {/* Cabeçalho da página */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              component="h1"
              sx={{ 
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 'bold',
                mb: 2,
                color: primaryColor
              }}
            >
              Entre em Contato
            </Typography>
            
            <Typography variant="subtitle1" sx={{ maxWidth: '800px', mx: 'auto', color: 'text.secondary' }}>
              Estamos à disposição para ajudar com aluguel de equipamentos em sua região. 
              Envie uma mensagem, ligue ou visite nossa loja.
            </Typography>
            
            {/* Navegação breadcrumb */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 1,
                mt: 3
              }}
            >
              <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: primaryColor }}>
                <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">Home</Typography>
              </Link>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>/</Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>Contato</Typography>
            </Box>
          </Box>
          
          <Grid container spacing={4}>
            {/* Coluna de informações */}
            <Grid item xs={12} md={5} lg={4} order={{ xs: 2, md: 1 }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3,
                  height: '100%',
                  borderRadius: themePreferences?.borderRadius || 1,
                  backgroundColor: theme.palette.background.paper,
                  borderTop: `4px solid ${primaryColor}`
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: primaryColor }}>
                  Informações de Contato
                </Typography>
                
                <Divider sx={{ mb: 3, borderColor: `${primaryColor}30` }} />
                
                <Stack spacing={3}>
                  {/* Endereço */}
                  <Box sx={{ display: 'flex' }}>
                    <LocationOn sx={{ color: primaryColor, fontSize: 28, mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: primaryColor }}>
                        Endereço
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                        Av. Dep. Paulino Rocha, 1881<br />
                        Cajazeiras<br />
                        Fortaleza – CE<br />
                        CEP: 60864-311
                      </Typography>
                      
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 1 }}
                        href="https://maps.google.com/?q=-3.7275,-38.5434"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver no mapa
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Telefone */}
                  <Box sx={{ display: 'flex' }}>
                    <Phone sx={{ color: primaryColor, fontSize: 28, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: primaryColor }}>
                        Telefone
                      </Typography>
                      <Button 
                        href={formatPhoneLink(companyInfo.phone)} 
                        sx={{ 
                          color: 'text.secondary',
                          textTransform: 'none',
                          fontWeight: 'normal',
                          p: 0,
                          minWidth: 'auto',
                          justifyContent: 'flex-start',
                          '&:hover': { 
                            backgroundColor: 'transparent',
                            color: primaryColor
                          }
                        }}
                      >
                        {companyInfo.phone}
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* WhatsApp */}
                  <Box sx={{ display: 'flex' }}>
                    <WhatsApp sx={{ color: primaryColor, fontSize: 28, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: primaryColor }}>
                        WhatsApp
                      </Typography>
                      <Button 
                        href={formatWhatsAppLink(companyInfo.whatsapp)} 
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          color: 'text.secondary',
                          textTransform: 'none',
                          fontWeight: 'normal',
                          p: 0,
                          minWidth: 'auto',
                          justifyContent: 'flex-start',
                          '&:hover': { 
                            backgroundColor: 'transparent',
                            color: primaryColor
                          }
                        }}
                      >
                        {companyInfo.whatsapp}
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Email */}
                  <Box sx={{ display: 'flex' }}>
                    <Email sx={{ color: primaryColor, fontSize: 28, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: primaryColor }}>
                        Email
                      </Typography>
                      <Button 
                        href={`mailto:${companyInfo.email}`} 
                        sx={{ 
                          color: 'text.secondary',
                          textTransform: 'none',
                          fontWeight: 'normal',
                          p: 0,
                          minWidth: 'auto',
                          justifyContent: 'flex-start',
                          '&:hover': { 
                            backgroundColor: 'transparent',
                            color: primaryColor
                          }
                        }}
                      >
                        {companyInfo.email}
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Horário de Funcionamento */}
                  <Box sx={{ display: 'flex' }}>
                    <AccessTime sx={{ color: primaryColor, fontSize: 28, mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: primaryColor }}>
                        Horário de Funcionamento
                      </Typography>
                      <BusinessHours 
                        weekdays="Segunda a Sexta: 07:00 às 11:00, 13:00 às 17:00" 
                        saturday="Sábado: 07:00 às 11:30"
                        sunday="Domingo: Fechado"
                      />
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            
            {/* Formulário de contato */}
            <Grid item xs={12} md={7} lg={8} order={{ xs: 1, md: 2 }}>
              <Paper 
                elevation={3}
                component="form"
                onSubmit={handleSubmit}
                sx={{ 
                  p: { xs: 3, md: 4 },
                  borderRadius: themePreferences?.borderRadius || 1,
                  backgroundColor: theme.palette.background.paper,
                  borderTop: `4px solid ${secondaryColor}`
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: secondaryColor }}>
                  Envie uma Mensagem
                </Typography>
                
                <Typography variant="body2" paragraph sx={{ color: 'text.secondary' }}>
                  Preencha o formulário abaixo e entraremos em contato o mais breve possível.
                </Typography>
                
                <Divider sx={{ mb: 4, borderColor: `${secondaryColor}30` }} />
                
                <Grid container spacing={3}>
                  {/* Nome */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nome"
                      name="name"
                      value={formValues.name}
                      onChange={handleInputChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name || ''}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  {/* Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleInputChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email || ''}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  {/* Telefone */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      name="phone"
                      value={formValues.phone}
                      onChange={handlePhoneInput}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone || ''}
                      placeholder="(00) 00000-0000"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  {/* Assunto */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Assunto"
                      name="subject"
                      value={formValues.subject}
                      onChange={handleInputChange}
                      error={!!formErrors.subject}
                      helperText={formErrors.subject || ''}
                      required
                      InputLabelProps={{ shrink: true }}
                    >
                      {subjectOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  {/* Mensagem */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Mensagem"
                      name="message"
                      value={formValues.message}
                      onChange={handleInputChange}
                      error={!!formErrors.message}
                      helperText={formErrors.message || ''}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  {/* Preferência de Contato */}
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ color: 'text.secondary' }}>
                        Como prefere ser contatado?
                      </FormLabel>
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
                  
                  {/* Botão de Enviar */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      size="large"
                      startIcon={submitting ? <CircularProgress size={24} color="inherit" /> : <Send />}
                      disabled={submitting}
                      sx={{ 
                        mt: 2, 
                        px: 4,
                        py: 1.2,
                        borderRadius: themePreferences?.borderRadius * 2 || 4
                      }}
                    >
                      {submitting ? 'Enviando...' : 'Enviar Mensagem'}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Snackbar para sucesso e erro */}
      <Snackbar
        open={success || !!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={success ? "success" : "error"}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {success ? 'Mensagem enviada com sucesso! Em breve entraremos em contato.' : error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContactPage; 