# Documentação do Banco de Dados - Plataforma de Locação de Equipamentos

Este documento descreve a estrutura do banco de dados necessária para implementar uma plataforma de locação de equipamentos. Use esta documentação como referência para configurar novos projetos.

## Tabelas Principais

### Usuários e Perfis

#### `profiles`
- **Descrição**: Armazena informações de perfil dos usuários
- **Campos principais**:
  - `id`: UUID (referência a auth.users)
  - `name`: Nome do usuário
  - `email`: Email do usuário (único)
  - `role`: Papel do usuário ('cliente', 'proprietario', 'admin')
  - `phone`: Telefone do usuário
  - `address`: Endereço completo
  - `avatar_url`: URL da foto de perfil
  - `notification_settings`: Configurações de notificação (JSONB)
  - `privacy_settings`: Configurações de privacidade (JSONB)
  - `company_id`: Referência à empresa (para proprietários)

### Empresas e Filiais

#### `company_info`
- **Descrição**: Informações da empresa locadora
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `name`: Nome da empresa
  - `logo_url`: URL do logotipo
  - `phone`, `whatsapp`, `email`: Contatos
  - `address`: Endereço principal
  - `user_id`: Proprietário da empresa
  - `business_hours`: Horário de funcionamento
  - Campos para redes sociais: `facebook_url`, `instagram_url`, etc.

#### `company_branches`
- **Descrição**: Filiais da empresa
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `company_id`: Referência à empresa principal
  - `name`: Nome da filial
  - `phone`, `whatsapp`, `email`: Contatos
  - `address`: Endereço da filial
  - `is_main`: Indica se é a filial principal

#### `about_us`
- **Descrição**: Seções da página "Sobre Nós"
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `company_id`: Referência à empresa
  - `title`: Título da seção
  - `content`: Conteúdo da seção
  - `image_url`: URL da imagem
  - `section_order`: Ordem de exibição
  - `is_visible`: Visibilidade da seção

### Equipamentos

#### `categories`
- **Descrição**: Categorias de equipamentos
- **Campos principais**:
  - `id`: TEXT (chave primária)
  - `name`: Nome da categoria
  - `description`: Descrição da categoria
  - `icon`: Ícone para representar a categoria

#### `construction_phases`
- **Descrição**: Fases de construção
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `name`: Nome da fase
  - `description`: Descrição da fase

#### `equipment`
- **Descrição**: Equipamentos disponíveis para locação
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `name`: Nome do equipamento
  - `category`: Referência à categoria
  - `image`: Imagem principal
  - `description`: Descrição detalhada
  - `specifications`: Especificações técnicas (JSONB)
  - `daily_rate`, `weekly_rate`, `monthly_rate`: Valores de locação
  - `available`: Disponibilidade geral
  - `user_id`: Proprietário do equipamento
  - `construction_phase_id`: Fase de construção aplicável
  - `average_rating`: Avaliação média
  - `total_reviews`: Total de avaliações

#### `equipment_images`
- **Descrição**: Imagens adicionais dos equipamentos
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `url`: URL da imagem
  - `is_primary`: Indica se é a imagem principal

#### `equipment_specs`
- **Descrição**: Especificações técnicas detalhadas
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `name`: Nome da especificação
  - `value`: Valor da especificação
  - `display_order`: Ordem de exibição

#### `equipment_media`
- **Descrição**: Vídeos e outros tipos de mídia
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `name`: Nome da mídia
  - `url`: URL do recurso
  - `media_type`: Tipo de mídia (vídeo, etc.)
  - `description`: Descrição do conteúdo

#### `equipment_manuals`
- **Descrição**: Manuais dos equipamentos
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `name`: Nome do manual
  - `url`: URL do documento
  - `description`: Descrição do manual

#### `equipment_variations`
- **Descrição**: Variações disponíveis para equipamentos
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `name`: Nome da variação
  - `description`: Descrição da variação

#### `equipment_variation_options`
- **Descrição**: Opções para cada variação
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `variation_id`: Referência à variação
  - `name`: Nome da opção
  - `value`: Valor da opção

#### `equipment_prices`
- **Descrição**: Preços específicos para variações
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `price_type`: Tipo de preço (diário, semanal, mensal)
  - `price`: Valor
  - `currency`: Moeda (padrão 'BRL')
  - `variation_option_id`: Referência à opção de variação

#### `accessories`
- **Descrição**: Acessórios para equipamentos
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `name`: Nome do acessório
  - `description`: Descrição do acessório
  - `image`: Imagem do acessório
  - `technical_specs`: Especificações técnicas (JSONB)

#### `equipment_accessories`
- **Descrição**: Relacionamento entre equipamentos e acessórios
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `accessory_id`: Referência ao acessório

#### `equipment_availability`
- **Descrição**: Disponibilidade dos equipamentos
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `start_date`: Data inicial
  - `end_date`: Data final
  - `status`: Status ('disponível', 'reservado', 'manutenção')

#### `equipment_maintenance`
- **Descrição**: Registros de manutenção
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `description`: Descrição da manutenção
  - `maintenance_date`: Data da manutenção
  - `cost`: Custo da manutenção
  - `status`: Status ('agendada', 'em_andamento', 'concluída')

### Reservas e Orçamentos

#### `bookings`
- **Descrição**: Reservas de equipamentos
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `user_id`: Usuário que fez a reserva
  - `start_date`, `end_date`: Período da reserva
  - `total_price`: Valor total
  - `status`: Status da reserva
  - `special_requirements`: Requisitos especiais
  - `delivery_address`: Endereço de entrega

#### `budget_requests`
- **Descrição**: Solicitações de orçamento
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `client_id`: Cliente autenticado
  - `owner_id`: Proprietário do equipamento
  - `start_date`, `end_date`: Período desejado
  - `status`: Status do orçamento
  - `total_amount`: Valor total
  - `client_type`: Tipo de cliente ('user', 'guest')
  - `client_name`, `client_email`, `client_phone`: Dados para clientes não autenticados

#### `budget_messages`
- **Descrição**: Mensagens trocadas em orçamentos
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `budget_request_id`: Referência ao orçamento
  - `sender_id`: Remetente da mensagem
  - `message`: Conteúdo da mensagem
  - `attachment_url`: URL de anexo

#### `temporary_budget_requests`
- **Descrição**: Orçamentos temporários (não autenticados)
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `equipment_id`: Referência ao equipamento
  - `equipment_name`: Nome do equipamento
  - `owner_id`: Proprietário do equipamento
  - `client_name`, `client_email`, `client_phone`: Dados do cliente
  - `start_date`, `end_date`: Período desejado
  - `status`: Status do orçamento

#### `guest_clients`
- **Descrição**: Clientes não autenticados
- **Campos principais**:
  - `id`: TEXT (chave primária)
  - `name`: Nome do cliente
  - `email`: Email do cliente
  - `phone`: Telefone do cliente

### Avaliações e Feedback

#### `reviews`
- **Descrição**: Avaliações de equipamentos
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `booking_id`: Referência à reserva
  - `equipment_id`: Referência ao equipamento
  - `user_id`: Usuário que avaliou
  - `rating`: Nota (1-5)
  - `comment`: Comentário

#### `contact_messages`
- **Descrição**: Mensagens do formulário de contato
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `name`: Nome do remetente
  - `email`: Email do remetente
  - `phone`: Telefone do remetente
  - `subject`: Assunto da mensagem
  - `message`: Conteúdo da mensagem
  - `contact_preference`: Preferência de contato
  - `status`: Status da mensagem
  - `responded_by`: Quem respondeu
  - `responded_at`: Quando foi respondida

### Notificações e Logs

#### `notifications`
- **Descrição**: Notificações para usuários
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `user_id`: Destinatário
  - `title`: Título da notificação
  - `message`: Conteúdo da notificação
  - `read`: Status de leitura

#### `email_logs`
- **Descrição**: Registros de emails enviados
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `email_to`: Destinatário
  - `subject`: Assunto
  - `type`: Tipo de email
  - `sent_at`: Data de envio

#### `analytics_config`
- **Descrição**: Configurações de analytics
- **Campos principais**:
  - `id`: UUID (chave primária)
  - `user_id`: Usuário proprietário
  - `view_id`: ID da view do analytics
  - `credentials`: Credenciais de acesso

## Views

### `all_budget_requests`
- **Descrição**: Unifica orçamentos com informações de clientes e equipamentos
- **Campos principais**: Combina dados de budget_requests, profiles e equipment

## Políticas de Segurança (RLS)

### Perfis
- Usuários podem ler e atualizar seus próprios perfis
- Informações públicas de perfis são visíveis para todos
- Perfis de proprietários são visíveis para facilitar orçamentos

### Equipamentos
- Equipamentos são visíveis para todos
- Apenas proprietários podem inserir, atualizar e excluir seus equipamentos
- Proprietários podem gerenciar imagens, disponibilidade e manutenção

### Reservas e Orçamentos
- Usuários podem ver suas próprias reservas
- Proprietários podem ver reservas de seus equipamentos
- Clientes e proprietários podem ver orçamentos em que estão envolvidos
- Clientes podem criar orçamentos para equipamentos disponíveis

### Mensagens e Avaliações
- Avaliações são públicas
- Clientes podem avaliar após concluir uma reserva
- Mensagens de orçamentos são visíveis apenas para as partes envolvidas

## Instruções para Novos Projetos

1. **Criar Tabelas**: Implemente todas as tabelas listadas acima
2. **Configurar RLS**: Configure as políticas de segurança para cada tabela
3. **Criar Funções**: Implemente funções para operações comuns (opcional)
4. **Triggers**: Configure triggers para manter dados consistentes (opcional)
5. **Índices**: Adicione índices para melhorar performance em consultas frequentes

## Recomendações de Manutenção

1. **Backup Regular**: Configure backups diários do banco de dados
2. **Monitoramento**: Implemente monitoramento de performance
3. **Atualizações**: Mantenha o Supabase atualizado
4. **Limpeza**: Implemente rotinas para limpar dados temporários ou obsoletos