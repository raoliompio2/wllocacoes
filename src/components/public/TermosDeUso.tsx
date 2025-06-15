import React, { useEffect } from 'react';
import { Container, Typography, Box, Breadcrumbs, Link, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronRight } from '@mui/icons-material';

const TermosDeUso: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Termos de Uso | Aluguel de Equipamentos';
  }, []);

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* Breadcrumbs removidos */}

        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Termos de Uso
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" paragraph>
              Bem-vindo à nossa plataforma de aluguel de equipamentos. Ao utilizar nossos serviços, você concorda com os termos apresentados abaixo.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              1. Uso do Serviço
            </Typography>
            <Typography variant="body1" paragraph>
              Nossa plataforma conecta pessoas que precisam alugar equipamentos com proprietários que os disponibilizam. Procuramos oferecer informações precisas, mas não garantimos a disponibilidade ou qualidade dos equipamentos anunciados.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              2. Cadastro
            </Typography>
            <Typography variant="body1" paragraph>
              Para utilizar nossos serviços, é necessário criar uma conta e fornecer informações verdadeiras. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              3. Aluguel de Equipamentos
            </Typography>
            <Typography variant="body1" paragraph>
              Ao alugar um equipamento, você se compromete a usá-lo adequadamente e devolvê-lo nas mesmas condições em que foi recebido. É sua responsabilidade verificar o estado do equipamento antes de aceitá-lo.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              4. Pagamentos
            </Typography>
            <Typography variant="body1" paragraph>
              Os preços dos aluguéis são definidos pelos proprietários dos equipamentos. O uso da plataforma é gratuito.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              5. Cancelamentos
            </Typography>
            <Typography variant="body1" paragraph>
              As políticas de cancelamento podem variar de acordo com cada proprietário. Consulte as condições específicas antes de finalizar sua reserva.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              6. Modificações nos Termos
            </Typography>
            <Typography variant="body1" paragraph>
              Podemos atualizar estes termos periodicamente. Recomendamos verificá-los com frequência para estar ciente de possíveis alterações.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              7. Contato
            </Typography>
            <Typography variant="body1" paragraph>
              Para dúvidas ou informações adicionais, entre em contato conosco através dos canais disponíveis em nossa página de contato.
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mt: 6, textAlign: 'center', fontStyle: 'italic' }}>
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermosDeUso; 