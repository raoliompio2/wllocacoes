# Documentação da Estrutura de Banco de Dados 

## Tabelas Principais

### 1. company_info
Armazena informações sobre a empresa proprietária do sistema.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da empresa |
| name | text | não | | Nome da empresa |
| logo_url | text | sim | | URL do logotipo da empresa |
| phone | text | sim | | Telefone da empresa |
| whatsapp | text | sim | | Número do WhatsApp da empresa |
| email | text | sim | | Email da empresa |
| address | text | sim | | Endereço da empresa |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |
| user_id | uuid | sim | | Referência ao usuário admin da empresa |
| facebook_url | varchar | sim | | URL do Facebook da empresa |
| instagram_url | varchar | sim | | URL do Instagram da empresa |
| linkedin_url | varchar | sim | | URL do LinkedIn da empresa |
| youtube_url | varchar | sim | | URL do YouTube da empresa |
| twitter_url | varchar | sim | | URL do Twitter da empresa |
| business_hours | varchar | sim | | Horário de funcionamento |
| notification_email | text | sim | | Email para receber notificações |

### 2. profiles
Gerencia perfis de usuários com informações estendidas além da autenticação básica.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | | Identificador único do perfil (mesmo da auth.users) |
| name | text | sim | | Nome do usuário |
| email | text | sim | | Email do usuário (único) |
| role | text | não | 'cliente' | Função do usuário (cliente, proprietario, admin) |
| phone | text | sim | | Telefone do usuário (único) |
| address | text | sim | | Endereço do usuário |
| avatar_url | text | sim | | URL da foto de perfil |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |
| notification_settings | jsonb | sim | | Configurações de notificação |
| privacy_settings | jsonb | sim | | Configurações de privacidade |
| company_id | uuid | sim | | Referência à empresa do usuário |
| theme_preferences | jsonb | sim | | Preferências de tema visual |
| whatsapp | text | sim | | Número do WhatsApp |
| cep | text | sim | | CEP do usuário |
| logradouro | text | sim | | Logradouro do endereço |
| numero | text | sim | | Número do endereço |
| complemento | text | sim | | Complemento do endereço |
| bairro | text | sim | | Bairro |
| cidade | text | sim | | Cidade |
| estado | text | sim | | Estado |

### 3. equipment
Armazena informações sobre os equipamentos disponíveis para locação.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único do equipamento |
| name | text | não | | Nome do equipamento |
| category | text | sim | | Categoria do equipamento |
| image | text | sim | | URL da imagem principal |
| description | text | sim | | Descrição do equipamento |
| specifications | jsonb | sim | | Especificações técnicas |
| daily_rate | integer | sim | | Valor da diária |
| weekly_rate | integer | sim | | Valor semanal |
| monthly_rate | integer | sim | | Valor mensal |
| available | boolean | sim | true | Se está disponível |
| user_id | uuid | sim | | Proprietário do equipamento |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |
| average_rating | numeric | sim | 0 | Avaliação média |
| total_reviews | integer | sim | 0 | Total de avaliações |
| construction_phase_id | uuid | sim | | Fase de construção associada |
| technical_specs | jsonb | sim | '{}' | Especificações técnicas estruturadas |

### 4. bookings
Gerencia as reservas de equipamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da reserva |
| equipment_id | uuid | não | | Referência ao equipamento |
| user_id | uuid | não | | Referência ao usuário cliente |
| start_date | date | não | | Data de início da reserva |
| end_date | date | não | | Data de término da reserva |
| total_price | integer | sim | | Preço total da reserva |
| status | text | sim | 'pendente' | Status da reserva |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |
| special_requirements | text | sim | | Requisitos especiais |
| delivery_address | text | sim | | Endereço de entrega |

### 5. budget_requests
Gerencia solicitações de orçamento para os equipamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da solicitação |
| equipment_id | uuid | sim | | Referência ao equipamento |
| client_id | uuid | sim | | Referência ao cliente (auth.users) |
| owner_id | uuid | sim | | Referência ao proprietário |
| start_date | date | não | | Data de início da locação |
| end_date | date | não | | Data de término da locação |
| status | text | não | 'pending' | Status da solicitação |
| total_amount | numeric | sim | | Valor total orçado |
| special_requirements | text | sim | | Requisitos especiais |
| delivery_address | text | sim | | Endereço de entrega |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |
| client_type | text | sim | 'user' | Tipo de cliente (user ou guest) |
| client_name | text | sim | | Nome do cliente (para guest) |
| client_email | text | sim | | Email do cliente (para guest) |
| client_phone | text | sim | | Telefone do cliente (para guest) |
| contact_method | varchar | sim | | Método de contato preferido |

### 6. categories
Categorias de equipamentos para organização.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | text | não | | Identificador único da categoria |
| name | text | não | | Nome da categoria |
| description | text | sim | | Descrição da categoria |
| icon | text | sim | | Ícone da categoria |
| created_at | timestamptz | sim | now() | Data de criação do registro |

### 7. construction_phases
Fases de construção associadas aos equipamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da fase |
| name | text | não | | Nome da fase de construção |
| description | text | sim | | Descrição da fase |
| created_at | timestamptz | sim | now() | Data de criação do registro |

### 8. reviews
Avaliações dos equipamentos pelos clientes.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da avaliação |
| booking_id | uuid | sim | | Referência à reserva |
| equipment_id | uuid | sim | | Referência ao equipamento |
| user_id | uuid | sim | | Referência ao usuário avaliador |
| rating | integer | sim | | Nota (1-5) |
| comment | text | sim | | Comentário da avaliação |
| created_at | timestamptz | sim | now() | Data de criação do registro |

## Tabelas de Suporte

### 9. about_us
Seções sobre a empresa para exibição no site.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | uuid_generate_v4() | Identificador único da seção |
| company_id | uuid | não | | Referência à empresa |
| title | varchar | não | | Título da seção |
| content | text | não | | Conteúdo da seção |
| image_url | text | sim | | URL da imagem da seção |
| image_alt | varchar | sim | | Texto alternativo da imagem |
| section_order | integer | não | 0 | Ordem de exibição da seção |
| is_visible | boolean | não | true | Se a seção está visível |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

### 10. accessories
Acessórios que podem ser associados aos equipamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único do acessório |
| name | text | não | | Nome do acessório |
| description | text | sim | | Descrição do acessório |
| image | text | sim | | URL da imagem do acessório |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| technical_specs | jsonb | sim | '[]' | Especificações técnicas |

### 11. equipment_accessories
Tabela de associação entre equipamentos e acessórios.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da associação |
| equipment_id | uuid | sim | | Referência ao equipamento |
| accessory_id | uuid | sim | | Referência ao acessório |
| created_at | timestamptz | sim | now() | Data de criação do registro |

### 12. budget_messages
Mensagens trocadas durante negociação de orçamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da mensagem |
| budget_request_id | uuid | sim | | Referência à solicitação de orçamento |
| sender_id | uuid | sim | | Referência ao remetente da mensagem |
| message | text | não | | Conteúdo da mensagem |
| attachment_url | text | sim | | URL do anexo |
| created_at | timestamptz | sim | now() | Data de criação do registro |

### 13. contact_messages
Mensagens do formulário de contato do site.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | uuid_generate_v4() | Identificador único da mensagem |
| name | varchar | não | | Nome do contato |
| email | varchar | não | | Email do contato |
| phone | varchar | sim | | Telefone do contato |
| subject | varchar | não | | Assunto da mensagem |
| message | text | não | | Conteúdo da mensagem |
| contact_preference | varchar | não | | Preferência de contato |
| status | varchar | sim | 'pendente' | Status da mensagem |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |
| responded_by | uuid | sim | | Referência ao usuário que respondeu |
| responded_at | timestamptz | sim | | Data da resposta |

### 14. company_branches
Filiais da empresa principal.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da filial |
| company_id | uuid | sim | | Referência à empresa principal |
| name | text | não | | Nome da filial |
| phone | text | sim | | Telefone da filial |
| whatsapp | text | sim | | WhatsApp da filial |
| email | text | sim | | Email da filial |
| address | text | sim | | Endereço da filial |
| is_main | boolean | sim | false | Se é a filial principal |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

### 15. equipment_availability
Disponibilidade dos equipamentos por período.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da disponibilidade |
| equipment_id | uuid | sim | | Referência ao equipamento |
| start_date | date | não | | Data de início do período |
| end_date | date | não | | Data de término do período |
| status | text | sim | | Status (disponível, reservado, manutenção) |
| created_at | timestamptz | sim | now() | Data de criação do registro |

### 16. equipment_maintenance
Registros de manutenção dos equipamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da manutenção |
| equipment_id | uuid | sim | | Referência ao equipamento |
| description | text | não | | Descrição da manutenção |
| maintenance_date | date | não | | Data da manutenção |
| cost | numeric | sim | | Custo da manutenção |
| status | text | sim | | Status (agendada, em_andamento, concluída) |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

## Tabelas Relacionadas a Imagens e Mídia

### 17. equipment_images
Imagens adicionais dos equipamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da imagem |
| equipment_id | uuid | sim | | Referência ao equipamento |
| url | text | não | | URL da imagem |
| is_primary | boolean | sim | false | Se é a imagem principal |
| created_at | timestamptz | sim | now() | Data de criação do registro |

### 18. equipment_manuals
Manuais associados aos equipamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | uuid_generate_v4() | Identificador único do manual |
| equipment_id | uuid | sim | | Referência ao equipamento |
| name | text | não | | Nome do manual |
| url | text | não | | URL do manual |
| description | text | sim | | Descrição do manual |
| display_order | integer | sim | 0 | Ordem de exibição |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

### 19. equipment_media
Vídeos e outras mídias associadas aos equipamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | uuid_generate_v4() | Identificador único da mídia |
| equipment_id | uuid | sim | | Referência ao equipamento |
| name | text | não | | Nome da mídia |
| url | text | não | | URL da mídia |
| media_type | text | sim | 'video' | Tipo de mídia |
| description | text | sim | | Descrição da mídia |
| display_order | integer | sim | 0 | Ordem de exibição |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

## Tabelas de Variações e Preços

### 20. equipment_variations
Variações disponíveis para os equipamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | uuid_generate_v4() | Identificador único da variação |
| equipment_id | uuid | sim | | Referência ao equipamento |
| name | text | não | | Nome da variação |
| description | text | sim | | Descrição da variação |
| display_order | integer | sim | 0 | Ordem de exibição |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

### 21. equipment_variation_options
Opções para cada variação de equipamento.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | uuid_generate_v4() | Identificador único da opção |
| variation_id | uuid | sim | | Referência à variação |
| name | text | não | | Nome da opção |
| value | text | não | | Valor da opção |
| display_order | integer | sim | 0 | Ordem de exibição |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

### 22. equipment_prices
Preços específicos para opções de variação.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | uuid_generate_v4() | Identificador único do preço |
| equipment_id | uuid | sim | | Referência ao equipamento |
| price_type | text | não | | Tipo de preço (diário, semanal, mensal) |
| price | numeric | não | | Valor do preço |
| currency | text | sim | 'BRL' | Moeda |
| variation_option_id | uuid | sim | | Referência à opção de variação |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

### 23. equipment_specs
Especificações técnicas dos equipamentos.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | uuid_generate_v4() | Identificador único da especificação |
| equipment_id | uuid | sim | | Referência ao equipamento |
| name | text | não | | Nome da especificação |
| value | text | não | | Valor da especificação |
| display_order | integer | sim | 0 | Ordem de exibição |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

## Tabelas para Notificações e Configurações

### 24. notifications
Notificações para usuários.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da notificação |
| user_id | uuid | sim | | Usuário destinatário |
| title | text | não | | Título da notificação |
| message | text | não | | Mensagem da notificação |
| read | boolean | sim | false | Se foi lida |
| created_at | timestamptz | sim | now() | Data de criação do registro |

### 25. analytics_config
Configurações para integração com análises.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | uuid_generate_v4() | Identificador único da configuração |
| user_id | uuid | não | | Usuário associado |
| view_id | text | não | | ID da view de análise |
| credentials | text | não | | Credenciais de autenticação |
| created_at | timestamptz | sim | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

### 26. email_logs
Registro de emails enviados.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único do log |
| email_to | varchar | não | | Destinatário do email |
| subject | varchar | não | | Assunto do email |
| type | varchar | não | | Tipo do email |
| sent_at | timestamptz | não | now() | Data de envio |
| created_at | timestamptz | não | now() | Data de criação do registro |
| body | text | sim | | Corpo do email |
| email_from | varchar | sim | | Remetente do email |

### 27. email_templates
Templates para envio de emails.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único do template |
| name | varchar | não | | Nome do template |
| subject | varchar | não | | Assunto padrão |
| body | text | não | | Corpo do template |
| type | varchar | não | | Tipo do template |
| created_at | timestamptz | não | now() | Data de criação do registro |
| updated_at | timestamptz | não | now() | Data de atualização do registro |

### 28. smtp_settings
Configurações SMTP para envio de emails.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | gen_random_uuid() | Identificador único da configuração |
| host | varchar | não | | Host SMTP |
| port | integer | não | | Porta SMTP |
| username | varchar | não | | Usuário SMTP |
| password | varchar | não | | Senha SMTP |
| from_email | varchar | não | | Email remetente |
| from_name | varchar | não | | Nome remetente |
| is_active | boolean | sim | true | Se está ativo |
| created_at | timestamptz | não | now() | Data de criação do registro |
| updated_at | timestamptz | não | now() | Data de atualização do registro |
| notification_email | varchar | sim | | Email para notificações |
| service_id | varchar | sim | | ID do serviço EmailJS |
| template_id | varchar | sim | | ID do template EmailJS |
| user_id | varchar | sim | | ID do usuário EmailJS |

### 29. temporary_budget_requests
Solicitações de orçamento temporárias para não-usuários.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | uuid | não | uuid_generate_v4() | Identificador único da solicitação |
| equipment_id | uuid | não | | Referência ao equipamento |
| equipment_name | text | não | | Nome do equipamento |
| owner_id | uuid | não | | Referência ao proprietário |
| client_name | text | não | | Nome do cliente |
| client_email | text | não | | Email do cliente |
| client_phone | text | não | | Telefone do cliente |
| start_date | date | não | | Data de início |
| end_date | date | não | | Data de término |
| status | text | não | 'pending' | Status da solicitação |
| delivery_address | text | sim | | Endereço de entrega |
| created_at | timestamptz | não | now() | Data de criação do registro |
| updated_at | timestamptz | sim | now() | Data de atualização do registro |

### 30. guest_clients
Clientes temporários não registrados.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| id | text | não | | Identificador único do cliente |
| name | text | não | | Nome do cliente |
| email | text | não | | Email do cliente |
| phone | text | não | | Telefone do cliente |
| created_at | timestamptz | não | now() | Data de criação do registro |

### 31. common_typos
Correção de erros ortográficos comuns para busca.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| correct_term | varchar | não | | Termo correto |
| typos | text[] | sim | | Lista de erros comuns |

## Extensões Instaladas

O banco de dados utiliza as seguintes extensões PostgreSQL:

1. **pg_trgm** (public) - Para busca baseada em similaridade de texto
2. **unaccent** (public) - Para remover acentos em buscas
3. **uuid-ossp** (extensions) - Para geração de UUIDs
4. **pg_graphql** (graphql) - Para suporte a GraphQL
5. **supabase_vault** (vault) - Extensão Vault do Supabase
6. **pg_stat_statements** (extensions) - Para estatísticas de consultas SQL
7. **pgcrypto** (extensions) - Para funções criptográficas

## Políticas de Segurança RLS (Row Level Security)

As políticas de segurança estão configuradas para controle de acesso granular:

1. Perfis de usuário podem ver seus próprios dados
2. Proprietários de equipamentos podem gerenciar apenas seus próprios equipamentos
3. Clientes podem ver apenas suas reservas e orçamentos
4. Administradores têm acesso completo a todas as tabelas
5. Categorias e informações públicas são visíveis para todos os usuários

## Migrações

O banco de dados foi criado através de várias migrações sequenciais:

1. Criação das tabelas principais (company_info, profiles, categories)
2. Criação das tabelas de equipamentos e suas relações
3. Criação das tabelas de reservas e orçamentos
4. Configuração de políticas de segurança RLS
5. Adição de funcionalidades como emails, notificações e suporte a buscas fuzzy

## Diagrama de Relacionamento

Os principais relacionamentos do banco de dados são:

- Profiles têm relação com auth.users (identidade)
- Equipamentos pertencem a proprietários (profiles)
- Equipamentos podem ter múltiplas imagens, variações, preços
- Reservas e orçamentos relacionam equipamentos a clientes
- Avaliações vinculam usuários, equipamentos e reservas

## Funções e Triggers

O banco de dados inclui funções para:
- Busca fuzzy com correção de erros ortográficos
- Atualizações automáticas para campos created_at/updated_at
- Controle de acesso baseado em funções de usuário

## Considerações de Segurança

- Dados sensíveis são protegidos por RLS
- Senhas e credenciais são armazenadas de forma segura
- Políticas de acesso garantem que usuários vejam apenas dados permitidos 