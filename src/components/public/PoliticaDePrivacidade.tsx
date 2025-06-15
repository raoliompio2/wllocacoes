import React, { useEffect } from 'react';
import { Container, Typography, Box, Breadcrumbs, Link, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronRight } from '@mui/icons-material';

const PoliticaDePrivacidade: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Política de Privacidade | Aluguel de Equipamentos';
  }, []);

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Política de Privacidade
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" paragraph>
              Esta política descreve como tratamos suas informações ao utilizar nossa plataforma de aluguel de equipamentos.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              1. Informações Coletadas
            </Typography>
            <Typography variant="body1" paragraph>
              Coletamos informações como nome, e-mail, telefone e endereço para facilitar as transações de aluguel. Também registramos dados técnicos como seu endereço IP e informações do dispositivo usado para acessar nosso site.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              2. Uso das Informações
            </Typography>
            <Typography variant="body1" paragraph>
              Usamos suas informações para:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 2 }}>
              <li>Permitir o aluguel de equipamentos</li>
              <li>Facilitar a comunicação entre usuários</li>
              <li>Melhorar nossos serviços</li>
              <li>Enviar comunicações sobre sua conta</li>
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              3. Compartilhamento
            </Typography>
            <Typography variant="body1" paragraph>
              Compartilhamos informações entre locadores e locatários para viabilizar as transações. Também podemos compartilhar dados com prestadores de serviços que nos ajudam a operar a plataforma.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              4. Cookies
            </Typography>
            <Typography variant="body1" paragraph>
              Usamos cookies para melhorar sua experiência em nosso site. Você pode gerenciar as configurações de cookies no seu navegador.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              5. Seus Direitos
            </Typography>
            <Typography variant="body1" paragraph>
              Você pode solicitar acesso, correção ou exclusão de seus dados pessoais entrando em contato conosco.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              6. Atualizações
            </Typography>
            <Typography variant="body1" paragraph>
              Esta política pode ser atualizada periodicamente. Recomendamos que você a revise com frequência.
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

export default PoliticaDePrivacidade;