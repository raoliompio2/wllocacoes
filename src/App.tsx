import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './theme/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import Navbar from './components/Layout/Navbar';
import Home from './components/Home';
// import { updateCompanyWhatsapp } from './utils/updateWhatsapp';
import LcpMonitor from './components/common/LcpMonitor';
import { SkeletonLoadingProvider } from './components/common/SkeletonLoadingProvider';
import LoadingReplacement from './components/common/LoadingReplacement';

// Componente de loading para suspense
import { Box, CircularProgress } from '@mui/material';

// Componente de loading simples sem skeleton
const LoadingComponent = () => (
  <Box sx={{ 
    minHeight: '100vh', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    p: 3
  }}>
    <CircularProgress size={40} />
  </Box>
);

// Carregamento lazy dos componentes principais
const PublicLayout = lazy(() => import('./components/public/PublicLayout'));
const HomePage = lazy(() => import('./components/public/HomePage'));
const EquipmentPage = lazy(() => import('./components/public/EquipmentPage'));
const EquipmentDetailPage = lazy(() => import('./components/public/EquipmentDetailPage'));
const AboutPage = lazy(() => import('./components/public/AboutPage'));
const ContactPage = lazy(() => import('./components/public/ContactPage'));
const TermosDeUso = lazy(() => import('./components/public/TermosDeUso'));
const PoliticaDePrivacidade = lazy(() => import('./components/public/PoliticaDePrivacidade'));
const SitemapPage = lazy(() => import('./components/public/SitemapPage'));
const NotFoundPage = lazy(() => import('./components/public/NotFoundPage'));

// Carregamento lazy dos componentes de autenticação - carregados apenas quando necessário
const Login = lazy(() => import('./components/Auth/Login'));
const SignUp = lazy(() => import('./components/Auth/SignUp'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword'));

// Carregamento lazy dos componentes de dashboard - carregados apenas quando o usuário estiver logado
const DashboardLayout = lazy(() => import('./components/Layout/DashboardLayout'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Profile = lazy(() => import('./components/Profile/Profile'));
const SearchEquipment = lazy(() => import('./components/Search/SearchEquipment'));
const NotificationCenter = lazy(() => import('./components/Notifications/NotificationCenter'));
const Settings = lazy(() => import('./components/Settings/Settings'));
const EquipmentProfile = lazy(() => import('./components/Equipment/EquipmentProfile'));

// Carregamento lazy de componentes adicionais
const ClientBookingsDashboard = lazy(() => import('./components/Bookings/ClientBookingsDashboard'));
const ClientBudgetsDashboard = lazy(() => import('./components/Dashboard/ClientDashboard/ClientBudgetsDashboard'));
const MyReviews = lazy(() => import('./components/Dashboard/ClientDashboard/MyReviews'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const DebugBookings = lazy(() => import('./components/DebugBookings'));
const OwnerBudgetsDashboard = lazy(() => import('./components/Dashboard/OwnerBudgetsDashboard'));
const OwnerBookingsDashboard = lazy(() => import('./components/Bookings/OwnerBookingsDashboard'));
const EquipmentManagement = lazy(() => import('./components/Equipment/EquipmentManagement'));
const AccessoriesManagement = lazy(() => import('./components/Accessories/AccessoriesManagement'));
const MaintenanceCalendar = lazy(() => import('./components/Equipment/MaintenanceCalendar'));
const ClientList = lazy(() => import('./components/Equipment/ClientList'));
const ClientView = lazy(() => import('./components/Clients/ClientView'));
const OwnerReviews = lazy(() => import('./components/Dashboard/OwnerReviews'));
const ContactMessages = lazy(() => import('./components/Dashboard/ContactMessages'));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Rolar para o topo sempre que a rota mudar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Redirect effects for old URLs to new URLs
  useEffect(() => {
    const path = location.pathname;
    
    // Redirecionamentos de URLs antigas para /equipamento/
    const redirectMappings = [
      { from: '/alugar/', to: '/equipamento/' },
      { from: '/produto/', to: '/equipamento/' },
      { from: '/produtos/', to: '/equipamentos' },  // Lista de produtos -> lista de equipamentos
      { from: '/maquina/', to: '/equipamento/' },
      { from: '/maquinas/', to: '/equipamentos' },
      { from: '/item/', to: '/equipamento/' },
      { from: '/itens/', to: '/equipamentos' },
      { from: '/ferramenta/', to: '/equipamento/' },
      { from: '/ferramentas/', to: '/equipamentos' }
    ];

    for (const mapping of redirectMappings) {
      if (path.startsWith(mapping.from)) {
        const slug = path.replace(mapping.from, '');
        
        // Se é redirecionamento para lista (sem slug)
        if (mapping.to.endsWith('/equipamentos') && !slug) {
          navigate(mapping.to, { replace: true });
          return;
        }
        
        // Se é redirecionamento para item específico (com slug)
        if (slug && mapping.to.endsWith('/')) {
          // Replace encoded forward slashes with hyphens
          const cleanedSlug = slug.replace(/%2F/g, '-');
          navigate(`${mapping.to}${cleanedSlug}`, { replace: true });
          return;
        }
      }
    }
  }, [location.pathname, navigate]);
  
  // Executar a atualização do WhatsApp quando o aplicativo iniciar (apenas em desenvolvimento)
  // Comentado para evitar erros de autenticação com o Supabase
  // useEffect(() => {
  //   if (import.meta.env.MODE === 'development') {
  //     updateCompanyWhatsapp();
  //   }
  // }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <SkeletonLoadingProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <CssBaseline />
            <LoadingReplacement />
            <Suspense fallback={<LoadingComponent />}>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              } />
              
              <Route path="/equipamentos" element={
                <PublicLayout>
                  <EquipmentPage />
                </PublicLayout>
              } />
              
              <Route path="/equipamentos/:categoryId" element={
                <PublicLayout>
                  <EquipmentPage />
                </PublicLayout>
              } />
              
              <Route path="/equipamento/:id" element={
                <PublicLayout>
                  <EquipmentDetailPage />
                </PublicLayout>
              } />
              
              <Route path="/equipamento/:slug" element={
                <PublicLayout>
                  <EquipmentDetailPage />
                </PublicLayout>
              } />
              
              <Route path="/aluguel/:slug" element={
                <PublicLayout>
                  <EquipmentDetailPage />
                </PublicLayout>
              } />
              
              <Route path="/alugar/:slug" element={
                <PublicLayout>
                  <EquipmentDetailPage />
                </PublicLayout>
              } />
              
              <Route path="/lista/:slug" element={
                <PublicLayout>
                  <EquipmentDetailPage />
                </PublicLayout>
              } />
              
              <Route path="/empresa" element={
                <PublicLayout>
                  <AboutPage />
                </PublicLayout>
              } />
              
              <Route path="/contato" element={
                <PublicLayout>
                  <ContactPage />
                </PublicLayout>
              } />
              
              <Route path="/termos-de-uso" element={
                <PublicLayout>
                  <TermosDeUso />
                </PublicLayout>
              } />
              
              <Route path="/politica-de-privacidade" element={
                <PublicLayout>
                  <PoliticaDePrivacidade />
                </PublicLayout>
              } />
              
              <Route path="/mapa-do-site" element={
                <PublicLayout>
                  <SitemapPage />
                </PublicLayout>
              } />
              
              {/* Rota adicional para sitemap em inglês */}
              <Route path="/sitemap" element={
                <PublicLayout>
                  <SitemapPage />
                </PublicLayout>
              } />
              
              {/* Rotas de Autenticação */}
              <Route path="/login" element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              } />
              
              <Route path="/signup" element={
                <PublicLayout>
                  <SignUp />
                </PublicLayout>
              } />
              
              <Route path="/forgot-password" element={
                <PublicLayout>
                  <ForgotPassword />
                </PublicLayout>
              } />
              
              <Route path="/reset-password" element={
                <PublicLayout>
                  <ResetPassword />
                </PublicLayout>
              } />
              
              {/* Rota de Diagnóstico - acesso direto sem proteção */}
              <Route path="/debug-bookings" element={<DebugBookings />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/search" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SearchEquipment />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/view-equipment/:id" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <EquipmentProfile />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <NotificationCenter />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Client Dashboard Routes */}
              <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ClientBookingsDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/budget-requests" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ClientBudgetsDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/my-reviews" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MyReviews />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Proprietário - Página de Orçamentos */}
              <Route 
                path="/owner-budgets" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <OwnerBudgetsDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Proprietário - Página de Reservas */}
              <Route 
                path="/owner-bookings" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <OwnerBookingsDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Proprietário - Gerenciamento de Equipamentos */}
              <Route 
                path="/equipment" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <EquipmentManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Proprietário - Gerenciamento de Acessórios */}
              <Route 
                path="/accessories" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AccessoriesManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Proprietário - Gerenciamento de Manutenção */}
              <Route 
                path="/maintenance" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MaintenanceCalendar />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Proprietário - Lista de Clientes */}
              <Route 
                path="/clients" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ClientList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Proprietário - Visualização individual de cliente */}
              <Route 
                path="/client/:id" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ClientView />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Proprietário - Avaliações Recebidas */}
              <Route 
                path="/reviews" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <OwnerReviews />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Proprietário - Mensagens de Contato */}
              <Route 
                path="/contact-messages" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ContactMessages />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Página 404 - Rota de fallback para URLs não encontradas */}
              <Route 
                path="*" 
                element={
                  <PublicLayout>
                    <NotFoundPage />
                  </PublicLayout>
                }
              />
            </Routes>
          </Suspense>
          <LcpMonitor />
                  </LocalizationProvider>
        </SkeletonLoadingProvider>
        </NotificationProvider>
      </ThemeProvider>
  );
}

export default App;