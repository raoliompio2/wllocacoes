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
    name: 'Panda Locações',
    address: 'Rua Mário Soares de Campos, Jardim Cidade Universitária I, Limeira – SP, CEP: 13484-656',
    phone: '(19) 3703-0363',
    whatsapp: '(19) 3703-0363',
    email: 'contato@pandalocacoes.com.br'
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
    "name": "Entre em Contato - Panda Locações",
    "description": "Entre em contato com a Panda Locações para aluguel de equipamentos em Limeira, Americana, Piracicaba e Campinas. Atendemos toda a região com equipamentos de qualidade para construção civil e industrial.",
    "url": "https://pandalocacoes.com.br/contato",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "Panda Locações",
      "description": "Aluguel de equipamentos para construção civil e industrial em Limeira e região.",
      "telephone": "(19) 3703-0363",
      "email": "contato@pandalocacoes.com.br",
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
        "streetAddress": "Rua Mário Soares de Campos",
        "addressLocality": "Limeira",
        "addressRegion": "SP",
        "postalCode": "13484-656",
        "addressCountry": "BR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -22.5936,
        "longitude": -47.4141
      }
    }
  };

  return (
    <>
      <SEOHead 
        title="Entre em Contato | Panda Locações | Aluguel de Equipamentos em Limeira e Região"
        description="Entre em contato com a Panda Locações para aluguel de equipamentos em Limeira, Americana, Piracicaba e Campinas. Atendemos toda a região com equipamentos de qualidade para sua obra ou evento."
        canonicalUrl="/contato"
        schema={contactPageSchema}
        keywords="contato Panda Locações, aluguel equipamentos Limeira, locação equipamentos construção, andaimes Limeira, betoneira aluguel Limeira, compactadores Americana, martelete Piracicaba, locadora equipamentos SP"
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
        <meta itemProp="name" content="Panda Locações - Aluguel de Equipamentos em Limeira e Região" />
        <meta itemProp="description" content="Entre em contato com a Panda Locações para aluguel de equipamentos em Limeira, Americana, Piracicaba, Campinas e toda região." />
        <meta itemProp="telephone" content="(19) 3703-0363" />
        <meta itemProp="email" content="contato@pandalocacoes.com.br" />
        <div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">
          <meta itemProp="streetAddress" content="Rua Mário Soares de Campos" />
          <meta itemProp="addressLocality" content="Limeira" />
          <meta itemProp="addressRegion" content="SP" />
          <meta itemProp="postalCode" content="13484-656" />
          <meta itemProp="addressCountry" content="BR" />
        </div>
        <meta itemProp="openingHours" content="Mo-Fr 07:00-17:00" />
      
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
              Estamos à disposição para ajudar com aluguel de equipamentos em Limeira e região. 
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
                        Rua Mário Soares de Campos,<br />
                        Jardim Cidade Universitária I,<br />
                        Limeira – SP<br />
                        CEP: 13484-656
                      </Typography>
                      
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 1 }}
                        href="https://maps.google.com/?q=Rua Mário Soares de Campos, Limeira, SP"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver no mapa
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Telefone */}
                  <Box sx={{ display: 'flex' }}>
                    <Phone sx={{ color: primaryColor, fontSize: 28, mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: primaryColor }}>
                        Telefone
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="a"
                        href={formatPhoneLink(companyInfo.phone)}
                        sx={{ textDecoration: 'none', color: 'text.secondary', '&:hover': { color: primaryColor } }}
                      >
                        {companyInfo.phone}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* WhatsApp */}
                  <Box sx={{ display: 'flex' }}>
                    <WhatsApp sx={{ color: primaryColor, fontSize: 28, mr: 2, mt: 0.5 }} />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: primaryColor }}>
                        WhatsApp
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography 
                          variant="body2" 
                          component="a"
                          href={formatWhatsAppLink(companyInfo.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textDecoration: 'none', color: 'text.secondary', '&:hover': { color: primaryColor } }}
                        >
                          {companyInfo.whatsapp}
                        </Typography>
                        
                        <Button 
                          variant="contained" 
                          size="small"
                          startIcon={<WhatsApp />}
                          sx={{ 
                            bgcolor: '#25D366',
                            '&:hover': { bgcolor: '#128C7E' },
                            ml: 2,
                            borderRadius: 0.5,
                            textTransform: 'none',
                            boxShadow: 1
                          }}
                          href={formatWhatsAppLink(companyInfo.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Conversar
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Email */}
                  <Box sx={{ display: 'flex' }}>
                    <Email sx={{ color: primaryColor, fontSize: 28, mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: primaryColor }}>
                        E-mail
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="a"
                        href={`mailto:${companyInfo.email}`}
                        sx={{ textDecoration: 'none', color: 'text.secondary', '&:hover': { color: primaryColor } }}
                      >
                        {companyInfo.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Horário de Funcionamento */}
                  <Box sx={{ display: 'flex' }}>
                    <AccessTime sx={{ color: primaryColor, fontSize: 28, mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: primaryColor }}>
                        Horário de Atendimento
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Segunda-feira a Sexta-feira
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        7:00 às 17:00
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            
            {/* Formulário de contato */}
            <Grid item xs={12} md={7} lg={8} order={{ xs: 1, md: 2 }}>
              <Paper 
                elevation={3} 
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
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Preencha o formulário abaixo para solicitar um orçamento ou tirar suas dúvidas sobre aluguel de equipamentos em Limeira e região.
                </Typography>
                
                {success ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Mensagem enviada com sucesso!
                    </Alert>
                    <Typography variant="body1" paragraph>
                      Obrigado por entrar em contato. Retornaremos o mais breve possível.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => setSuccess(false)}
                    >
                      Enviar outra mensagem
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                      {/* Nome */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          label="Nome"
                          name="name"
                          value={formValues.name}
                          onChange={handleInputChange}
                          error={!!formErrors.name}
                          helperText={formErrors.name}
                          disabled={submitting}
                          sx={{
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor,
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: primaryColor,
                            }
                          }}
                        />
                      </Grid>
                      
                      {/* Email */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          type="email"
                          label="Email"
                          name="email"
                          value={formValues.email}
                          onChange={handleInputChange}
                          error={!!formErrors.email}
                          helperText={formErrors.email}
                          disabled={submitting}
                          sx={{
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor,
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: primaryColor,
                            }
                          }}
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
                          helperText={formErrors.phone || '(xx) xxxxx-xxxx'}
                          disabled={submitting}
                          sx={{
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor,
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: primaryColor,
                            }
                          }}
                        />
                      </Grid>
                      
                      {/* Assunto */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          required
                          label="Assunto"
                          name="subject"
                          value={formValues.subject}
                          onChange={handleInputChange}
                          error={!!formErrors.subject}
                          helperText={formErrors.subject}
                          disabled={submitting}
                          sx={{
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor,
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: primaryColor,
                            }
                          }}
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
                          required
                          multiline
                          rows={4}
                          label="Mensagem"
                          name="message"
                          value={formValues.message}
                          onChange={handleInputChange}
                          error={!!formErrors.message}
                          helperText={formErrors.message || 'Mínimo 20 caracteres'}
                          disabled={submitting}
                          sx={{
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor,
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: primaryColor,
                            }
                          }}
                        />
                      </Grid>
                      
                      {/* Preferência de contato */}
                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend" sx={{ color: primaryColor }}>Como prefere ser contactado?</FormLabel>
                          <RadioGroup
                            row
                            name="contactPreference"
                            value={formValues.contactPreference}
                            onChange={handleInputChange}
                          >
                            <FormControlLabel
                              value="email"
                              control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                              label="Email"
                              disabled={submitting}
                            />
                            <FormControlLabel
                              value="phone"
                              control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                              label="Telefone"
                              disabled={submitting}
                            />
                            <FormControlLabel
                              value="whatsapp"
                              control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                              label="WhatsApp"
                              disabled={submitting}
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      
                      {/* Botão de envio */}
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          fullWidth
                          disabled={submitting}
                          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                          sx={{ 
                            mt: 2,
                            bgcolor: primaryColor,
                            '&:hover': { bgcolor: `${primaryColor}CC` },
                            borderRadius: 0.5,
                            py: 1.2
                          }}
                        >
                          {submitting ? 'Enviando...' : 'Enviar Mensagem'}
                        </Button>
                      </Grid>
                    </Grid>
                    
                    {error && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                      </Alert>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          {/* Mapa do Google (opcional) */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom align="center" sx={{ color: primaryColor }}>
              Nossa Localização
            </Typography>
            
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                mt: 3,
                borderRadius: themePreferences?.borderRadius || 1,
                height: 400,
                overflow: 'hidden',
                backgroundColor: theme.palette.background.paper,
                borderTop: `4px solid ${primaryColor}`
              }}
            >
              <Box
                component="iframe"
                sx={{
                  border: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 0
                }}
                src="https://maps.google.com/maps?q=Rua Mário Soares de Campos, Limeira, SP&t=&z=15&ie=UTF8&iwloc=&output=embed"
                title="Localização da Panda Locações"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Paper>
          </Box>
        </Container>
      </Box>
      
      {/* Alertas de sucesso/erro */}
      <Snackbar
        open={!!error || success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"}
          variant="filled"
          sx={{ 
            bgcolor: error ? '#d32f2f' : primaryColor
          }}
        >
          {error || "Mensagem enviada com sucesso!"}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContactPage; 