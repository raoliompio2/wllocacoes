import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Divider,
  Card,
  CardContent,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link as MuiLink,
  Tabs,
  Tab,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Engineering,
  Construction,
  CheckCircle,
  Timeline,
  Groups,
  EmojiEvents,
  Home as HomeIcon,
  Architecture,
  Build,
  School
} from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';
import SEOHead from '../SEO/SEOHead';

interface AboutUsSection {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  image_alt: string | null;
  section_order: number;
}

interface CompanyInfo {
  name: string;
  logo_url: string | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`services-tabpanel-${index}`}
      aria-labelledby={`services-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `services-tab-${index}`,
    'aria-controls': `services-tabpanel-${index}`,
  };
}

const AboutPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [sections, setSections] = useState<AboutUsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar informações da empresa - ignorando erros de tipo com ts-ignore
        // @ts-ignore
        const { data: companyData, error: companyError } = await supabase
          .from('company_info')
          .select('id, name, logo_url')
          .limit(1)
          .single();
        
        if (companyError && companyError.code !== 'PGRST116') {
          console.error('Erro ao buscar informações da empresa:', companyError);
        }
        
        if (companyData) {
          setCompanyInfo({
            // @ts-ignore
            name: companyData.name || 'Nossa Empresa',
            // @ts-ignore
            logo_url: companyData.logo_url
          });
        } else {
          setCompanyInfo({
            name: 'Nossa Empresa',
            logo_url: null
          });
        }
        
        // Buscar todas as seções da tabela about_us sem filtrar por empresa específica
        // @ts-ignore
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('about_us')
          .select('id, title, content, image_url, image_alt, section_order')
          .eq('is_visible', true)
          .order('section_order');
        
        if (sectionsError) {
          console.error('Erro ao buscar seções da página Sobre Nós:', sectionsError);
        }
        
        if (sectionsData && sectionsData.length > 0) {
          // @ts-ignore
          setSections(sectionsData);
        } else {
          console.log('Nenhuma seção encontrada na tabela about_us');
          
          // Debug - listar todas as seções disponíveis (inclusive não visíveis)
          // @ts-ignore
          const { data: allSections } = await supabase
            .from('about_us')
            .select('*');
          
          console.log('Todas as seções disponíveis:', allSections);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const renderContent = (text: string) => {
    // Dividir o texto em parágrafos e renderizar cada um
    return text.split('\n').map((paragraph, index) => (
      paragraph.trim() ? (
        <Typography key={index} variant="body1" paragraph>
          {paragraph}
        </Typography>
      ) : null
    ));
  };
  
  // Valores para a linha do tempo
  const timelineItems = [
    {
      year: '2010',
      title: 'Fundação',
      description: 'Início das operações'
    },
    {
      year: '2013',
      title: 'Expansão',
      description: 'Ampliação do catálogo e aquisição de novos equipamentos'
    },
    {
      year: '2016',
      title: 'Crescimento',
      description: 'Abertura da segunda unidade e expansão da área de atuação'
    },
    {
      year: '2019',
      title: 'Serviços Técnicos',
      description: 'Implementação de serviços técnicos especializados'
    }
  ];
  
  // Valores para os diferenciais
  const advantages = [
    {
      icon: <CheckCircle color="primary" />,
      title: 'Qualidade Garantida',
      description: 'Todos os equipamentos passam por rigorosa manutenção preventiva'
    },
    {
      icon: <Engineering color="primary" />,
      title: 'Suporte Técnico',
      description: 'Equipe especializada com engenheiros mecânicos e técnicos'
    },
    {
      icon: <Timeline color="primary" />,
      title: 'Preços Competitivos',
      description: 'Melhores tarifas do mercado com planos flexíveis'
    },
    {
      icon: <Construction color="primary" />,
      title: 'Responsabilidade Técnica',
      description: 'Laudos técnicos e conformidade com normas NR-18, NR-10 e NR-12'
    }
  ];
  
  // Equipe
  const team = [
    {
      name: 'Equipe Técnica',
      position: 'Engenharia Mecânica',
      photo: '/images/team/equipe.jpg',
      bio: 'Profissionais qualificados com experiência no setor de construção civil e industrial.'
    },
    {
      name: 'Equipe Comercial',
      position: 'Atendimento e Vendas',
      photo: '/images/team/comercial.jpg',
      bio: 'Especialistas em locação de equipamentos para construção civil e indústria.'
    },
    {
      name: 'Equipe de Manutenção',
      position: 'Manutenção Preventiva e Corretiva',
      photo: '/images/team/manutencao.jpg',
      bio: 'Técnicos responsáveis pela manutenção e qualidade dos equipamentos.'
    },
    {
      name: 'Suporte ao Cliente',
      position: 'Atendimento',
      photo: '/images/team/suporte.jpg',
      bio: 'Especialistas em suporte ao cliente e resolução de problemas.'
    }
  ];

  // Dados das abas de serviços
  const projectsData = [
    'Andaimes Fachadeiros e Comuns',
    'Andaimes Suspensos (Balanças)',
    'Linha de Vida',
    'Projetos de Proteções Coletivas',
    'Projetos Elétricos e Laudos de Aterramento',
    'Adequação de Máquinas à NR18 e NR12',
    'Cabos de Aço',
    'Memória de Cálculo',
    'Projetos de Equipamentos Mecânicos Diversos',
    'Planos de Manutenção Preventiva e Preditiva'
  ];

  const montageData = [
    'Andaime Fachadeiro',
    'Andaime Tubular',
    'Andaime Suspenso (Balanças)',
    'Cadeira Suspensa',
    'Tela de Segurança',
    'Bandejas Primárias e Secundárias',
    'Elevadores Cremalheira',
    'Soldagem em geral'
  ];

  const trainingData = [
    'Operador de Guincho/Elevador de Cremalheira',
    'Operador de Andaime Suspenso (Balanças)',
    'Operador de Mini Grua',
    'Operador de Serra Circular',
    'Operador de Betoneira e equipamentos diversos',
    'Trabalho em Altura – NR35',
    'Operador de Mini Carregadeira "BOB CAT"',
    'Montador de Andaimes'
  ];
  
  const renderServicesSection = () => {
    return (
      <Box sx={{ width: '100%', mt: 8, mb: 8 }}>
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          gutterBottom 
          textAlign={isMobile ? 'center' : 'left'}
        >
          Nossos Serviços
        </Typography>
        <Divider 
          sx={{ 
            width: 80, 
            borderColor: 'primary.main', 
            borderWidth: 2, 
            mb: 4,
            mx: isMobile ? 'auto' : 0
          }} 
        />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="serviços da empresa" 
            variant={isMobile ? "fullWidth" : "standard"}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: '1rem',
              }
            }}
          >
            <Tab 
              label="Projetos" 
              icon={<Architecture />} 
              iconPosition="start" 
              {...a11yProps(0)} 
            />
            <Tab 
              label="Montagem" 
              icon={<Build />} 
              iconPosition="start" 
              {...a11yProps(1)} 
            />
            <Tab 
              label="Treinamentos" 
              icon={<School />} 
              iconPosition="start" 
              {...a11yProps(2)} 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Projetos Especializados
              </Typography>
              <Typography variant="body1" paragraph>
                Nossa equipe de engenheiros desenvolve projetos técnicos completos, garantindo segurança e conformidade com as normas vigentes.
              </Typography>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <List>
                    {projectsData.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Serviços de Montagem
              </Typography>
              <Typography variant="body1" paragraph>
                Oferecemos serviços de montagem e instalação com equipe especializada em sistemas de andaimes e estruturas temporárias.
              </Typography>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <List>
                    {montageData.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Treinamentos Técnicos
              </Typography>
              <Typography variant="body1" paragraph>
                Capacitamos profissionais com treinamentos específicos para operação de equipamentos e trabalho em altura, em conformidade com as normas regulamentadoras.
              </Typography>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <List>
                    {trainingData.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    );
  };
  
  // Dados para SEO
  const seoTitle = `Sobre Nós | Conheça Nossa Empresa | NOME DA EMPRESA`;
  const seoDescription = `Conheça a NOME DA EMPRESA: serviços especializados em seu ramo de atividade. Atendemos várias regiões.`;
  
  // Schema para JSON-LD
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NOME DA EMPRESA",
    "url": "https://seusite.com.br/empresa",
    "logo": "https://seusite.com.br/images/logo.png",
    "description": seoDescription,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cidade",
      "addressRegion": "UF",
      "addressCountry": "BR"
    },
    "service": [
      {
        "@type": "Service",
        "name": "Projetos Especializados",
        "serviceType": "Projetos Técnicos",
        "description": "Desenvolvimento de projetos técnicos como andaimes, linhas de vida, proteções coletivas e laudos técnicos."
      },
      {
        "@type": "Service",
        "name": "Serviços de Montagem",
        "serviceType": "Montagem de Estruturas",
        "description": "Montagem de andaimes fachadeiros, tubulares, suspensos, telas de segurança e outras estruturas temporárias."
      },
      {
        "@type": "Service",
        "name": "Treinamentos Técnicos",
        "serviceType": "Capacitação",
        "description": "Treinamentos para operadores de equipamentos e trabalho em altura conforme normas regulamentadoras."
      }
    ]
  };
  
  const seoKeywords = "andaimes, montagem de andaimes, treinamento operadores, NR35, projetos técnicos, andaimes fachadeiros, andaimes suspensos, elevadores cremalheira, linhas de vida, proteções coletivas, laudos técnicos, normas de segurança, equipamentos para construção";
  
  return (
    <>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        canonicalUrl="/empresa"
        ogType="website"
        ogUrl="/empresa"
        ogImage="/images/empresa.jpg"
        schema={serviceSchema}
        keywords={seoKeywords}
        location="ambos"
      />
      
      <Container maxWidth="lg" sx={{ py: 4, mt: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : sections.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Página em construção
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={2}>
              Estamos preparando conteúdo incrível sobre nossa empresa para compartilhar com você.
            </Typography>
          </Box>
        ) : (
          <Box>
            {sections.map((section, index) => (
              <Box 
                key={section.id} 
                sx={{ 
                  mb: 8,
                  scrollMarginTop: 80, 
                  // Alterna entre layouts para variedade visual
                  '&:nth-of-type(even)': {
                    '& .MuiGrid-container': {
                      flexDirection: { md: 'row-reverse' }
                    }
                  }
                }}
                id={`section-${section.id}`}
              >
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  gutterBottom 
                  textAlign={isMobile ? 'center' : 'left'}
                >
                  {section.title}
                </Typography>
                <Divider 
                  sx={{ 
                    width: 80, 
                    borderColor: 'primary.main', 
                    borderWidth: 2, 
                    mb: 4,
                    mx: isMobile ? 'auto' : 0
                  }} 
                />
                
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={section.image_url ? 6 : 12}>
                    <Box>
                      {renderContent(section.content)}
                    </Box>
                  </Grid>
                  
                  {section.image_url && (
                    <Grid item xs={12} md={6}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          overflow: 'hidden', 
                          borderRadius: 2,
                          height: { xs: 240, sm: 300, md: 380 }
                        }}
                      >
                        <Box 
                          component="img"
                          src={section.image_url}
                          alt={section.image_alt || section.title}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = '/images/placeholder.png';
                          }}
                        />
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
            
            {/* Seção de Serviços com abas */}
            {renderServicesSection()}
          </Box>
        )}
      </Container>
    </>
  );
};

export default AboutPage; 