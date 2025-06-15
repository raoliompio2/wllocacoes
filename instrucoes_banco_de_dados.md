# Instruções para Configuração do Banco de Dados em Novos Projetos

Este documento fornece instruções passo a passo para configurar o banco de dados Supabase em novos projetos de locação de equipamentos.

## 1. Criação do Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com/)
2. Clique em "New Project"
3. Selecione sua organização
4. Defina um nome para o projeto (geralmente o nome do cliente)
5. Escolha uma senha forte para o banco de dados
6. Selecione a região mais próxima do cliente
7. Clique em "Create new project"

## 2. Configuração do Esquema do Banco de Dados

### 2.1 Tabelas Principais

Execute as seguintes migrações SQL na ordem apresentada:

#### Tabela de Informações da Empresa

```sql
CREATE TABLE IF NOT EXISTS public.company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID,
  facebook_url VARCHAR,
  instagram_url VARCHAR,
  linkedin_url VARCHAR,
  youtube_url VARCHAR,
  twitter_url VARCHAR,
  business_hours VARCHAR
);
```

#### Tabela de Perfis

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'proprietario', 'admin')),
  phone TEXT UNIQUE,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  notification_settings JSONB DEFAULT '{"booking_reminders": true, "maintenance_alerts": true, "push_notifications": true, "email_notifications": true}',
  privacy_settings JSONB DEFAULT '{"show_contact": true, "show_profile": true, "show_reviews": true}',
  company_id UUID REFERENCES public.company_info(id) ON DELETE SET NULL,
  theme_preferences JSONB DEFAULT '{"mode": "light", "spacing": 8, "darkColors": {"text": "#ffffff", "primary": "#90caf9", "surface": "#1e1e1e", "secondary": "#f48fb1"}, "lightColors": {"text": "#000000", "primary": "#1976d2", "surface": "#ffffff", "secondary": "#f50057"}}'
);
```

#### Tabelas de Categorias e Fases de Construção

```sql
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.construction_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Tabela de Equipamentos

```sql
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT REFERENCES public.categories(id),
  image TEXT,
  description TEXT,
  specifications JSONB,
  daily_rate INTEGER,
  weekly_rate INTEGER,
  monthly_rate INTEGER,
  available BOOLEAN DEFAULT true,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  average_rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  construction_phase_id UUID REFERENCES public.construction_phases(id),
  technical_specs JSONB DEFAULT '{}'
);
```

### 2.2 Tabelas Adicionais

Execute as seguintes migrações para criar as tabelas complementares:

```sql
-- Imagens de equipamentos
CREATE TABLE IF NOT EXISTS public.equipment_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Acessórios
CREATE TABLE IF NOT EXISTS public.accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  technical_specs JSONB DEFAULT '[]'
);

-- Relacionamento equipamentos-acessórios
CREATE TABLE IF NOT EXISTS public.equipment_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  accessory_id UUID REFERENCES public.accessories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disponibilidade de equipamentos
CREATE TABLE IF NOT EXISTS public.equipment_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('disponível', 'reservado', 'manutenção')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Manutenção de equipamentos
CREATE TABLE IF NOT EXISTS public.equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  maintenance_date DATE NOT NULL,
  cost NUMERIC,
  status TEXT CHECK (status IN ('agendada', 'em_andamento', 'concluída')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reservas
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price INTEGER,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  special_requirements TEXT,
  delivery_address TEXT
);

-- Solicitações de orçamento
CREATE TABLE IF NOT EXISTS public.budget_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'approved', 'rejected', 'converted')),
  total_amount NUMERIC,
  special_requirements TEXT,
  delivery_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  client_type TEXT DEFAULT 'user' CHECK (client_type IN ('user', 'guest')),
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT
);

-- Mensagens de orçamento
CREATE TABLE IF NOT EXISTS public.budget_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_request_id UUID REFERENCES public.budget_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Avaliações
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 Tabelas Complementares

```sql
-- Mensagens de contato
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  subject VARCHAR NOT NULL,
  message TEXT NOT NULL,
  contact_preference VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  responded_by UUID REFERENCES public.profiles(id),
  responded_at TIMESTAMPTZ
);

-- Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sobre nós
CREATE TABLE IF NOT EXISTS public.about_us (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.company_info(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  image_alt VARCHAR,
  section_order INTEGER DEFAULT 0 NOT NULL,
  is_visible BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Filiais
CREATE TABLE IF NOT EXISTS public.company_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_info(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Manuais de equipamentos
CREATE TABLE IF NOT EXISTS public.equipment_manuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Especificações detalhadas
CREATE TABLE IF NOT EXISTS public.equipment_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mídia de equipamentos
CREATE TABLE IF NOT EXISTS public.equipment_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  media_type TEXT DEFAULT 'video',
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Variações de equipamentos
CREATE TABLE IF NOT EXISTS public.equipment_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Opções de variação
CREATE TABLE IF NOT EXISTS public.equipment_variation_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variation_id UUID REFERENCES public.equipment_variations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Preços específicos
CREATE TABLE IF NOT EXISTS public.equipment_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
  price_type TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'BRL',
  variation_option_id UUID REFERENCES public.equipment_variation_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clientes convidados
CREATE TABLE IF NOT EXISTS public.guest_clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Orçamentos temporários
CREATE TABLE IF NOT EXISTS public.temporary_budget_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'converted', 'rejected')),
  delivery_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Logs de email
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_to VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configurações de analytics
CREATE TABLE IF NOT EXISTS public.analytics_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  view_id TEXT NOT NULL,
  credentials TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 Criação de Views

```sql
-- View para unificar orçamentos
CREATE OR REPLACE VIEW public.all_budget_requests AS
SELECT 
  br.id,
  br.equipment_id,
  br.client_id,
  br.owner_id,
  br.start_date,
  br.end_date,
  br.status,
  br.total_amount,
  br.special_requirements,
  br.delivery_address,
  br.created_at,
  br.updated_at,
  br.client_type,
  CASE 
    WHEN br.client_type = 'user' AND p.name IS NOT NULL THEN p.name
    ELSE br.client_name
  END AS display_name,
  CASE 
    WHEN br.client_type = 'user' AND p.email IS NOT NULL THEN p.email
    ELSE br.client_email
  END AS display_email,
  CASE 
    WHEN br.client_type = 'user' AND p.phone IS NOT NULL THEN p.phone
    ELSE br.client_phone
  END AS display_phone,
  e.name AS equipment_name,
  e.image AS equipment_image,
  e.category AS equipment_category,
  op.name AS owner_name
FROM 
  public.budget_requests br
LEFT JOIN 
  public.profiles p ON br.client_id = p.id
LEFT JOIN 
  public.equipment e ON br.equipment_id = e.id
LEFT JOIN 
  public.profiles op ON br.owner_id = op.id;
```

## 3. Configuração de Políticas de Segurança (RLS)

### 3.1 Habilitar RLS para todas as tabelas

```sql
-- Habilitar RLS para as tabelas principais
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_us ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporary_budget_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_variation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_prices ENABLE ROW LEVEL SECURITY;
```

### 3.2 Políticas para Perfis

```sql
-- Políticas para profiles
CREATE POLICY "Usuários podem ler seus próprios perfis" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários autenticados podem inserir perfis" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Informações públicas de perfis" 
ON public.profiles FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Permitir visualização de perfis de proprietários" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (role = 'proprietario' OR EXISTS (
  SELECT 1 FROM equipment WHERE equipment.user_id = profiles.id
));
```

### 3.3 Políticas para Equipamentos

```sql
-- Políticas para equipment
CREATE POLICY "Equipamentos são visíveis para todos" 
ON public.equipment FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Equipment owners can insert" 
ON public.equipment FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'proprietario'
));

CREATE POLICY "Equipment owners can update own equipment" 
ON public.equipment FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = equipment.user_id AND profiles.role = 'proprietario'
))
WITH CHECK (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = equipment.user_id AND profiles.role = 'proprietario'
));

CREATE POLICY "Equipment owners can delete own equipment" 
ON public.equipment FOR DELETE 
TO authenticated 
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = equipment.user_id AND profiles.role = 'proprietario'
));
```

### 3.4 Políticas para Reservas e Orçamentos

```sql
-- Políticas para bookings
CREATE POLICY "Usuários podem ver suas próprias reservas" 
ON public.bookings FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Clientes podem criar reservas" 
ON public.bookings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Proprietários podem ver reservas de seus equipamentos" 
ON public.bookings FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM equipment e JOIN profiles p ON p.id = auth.uid()
  WHERE e.id = bookings.equipment_id AND e.user_id = auth.uid() AND p.role = 'proprietario'
));

-- Políticas para budget_requests
CREATE POLICY "Permitir visualização de próprios orçamentos" 
ON public.budget_requests FOR SELECT 
TO authenticated 
USING (owner_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Clients can create budget requests" 
ON public.budget_requests FOR INSERT 
TO authenticated 
WITH CHECK (client_id = auth.uid() AND EXISTS (
  SELECT 1 FROM equipment WHERE equipment.id = budget_requests.equipment_id
));

CREATE POLICY "Permitir atualização de orçamentos por proprietários" 
ON public.budget_requests FOR UPDATE 
TO authenticated 
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Involved parties can update budget requests" 
ON public.budget_requests FOR UPDATE 
TO authenticated 
USING (client_id = auth.uid() OR owner_id = auth.uid())
WITH CHECK (client_id = auth.uid() OR owner_id = auth.uid());
```

### 3.5 Políticas Adicionais

```sql
-- Políticas para budget_messages
CREATE POLICY "Users can view messages for their budget requests" 
ON public.budget_messages FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM budget_requests
  WHERE budget_requests.id = budget_messages.budget_request_id
  AND (budget_requests.client_id = auth.uid() OR budget_requests.owner_id = auth.uid())
));

CREATE POLICY "Users can send messages for their budget requests" 
ON public.budget_messages FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 FROM budget_requests
  WHERE budget_requests.id = budget_messages.budget_request_id
  AND (budget_requests.client_id = auth.uid() OR budget_requests.owner_id = auth.uid())
));

-- Políticas para reviews
CREATE POLICY "Avaliações são públicas" 
ON public.reviews FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Clientes podem criar avaliações após aluguel" 
ON public.reviews FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 FROM bookings
  WHERE bookings.id = reviews.booking_id
  AND bookings.user_id = auth.uid()
  AND bookings.status = 'finalizado'
));
```

## 4. Configuração do Cliente Supabase

Atualize o arquivo `src/utils/supabaseClient.ts` com as credenciais do novo projeto:

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seu-projeto.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua-chave-anon'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

## 5. Geração de Tipos TypeScript

1. Instale a CLI do Supabase:
   ```
   npm install -g supabase
   ```

2. Gere os tipos TypeScript:
   ```
   supabase gen types typescript --project-id seu-projeto-id --schema public > src/utils/database.types.ts
   ```

## 6. Dados Iniciais

### 6.1 Categorias Padrão

```sql
INSERT INTO public.categories (id, name, description, icon)
VALUES
  ('escavadeiras', 'Escavadeiras', 'Equipamentos para escavação e movimentação de terra', 'digger'),
  ('carregadeiras', 'Carregadeiras', 'Equipamentos para carregamento de materiais', 'loader'),
  ('compactadores', 'Compactadores', 'Equipamentos para compactação de solo e asfalto', 'compactor'),
  ('guindastes', 'Guindastes', 'Equipamentos para elevação de cargas', 'crane'),
  ('plataformas', 'Plataformas Elevatórias', 'Equipamentos para elevação de pessoas', 'lift'),
  ('geradores', 'Geradores', 'Equipamentos para geração de energia', 'generator'),
  ('andaimes', 'Andaimes', 'Estruturas para trabalho em altura', 'scaffold'),
  ('betoneiras', 'Betoneiras', 'Equipamentos para mistura de concreto', 'mixer'),
  ('ferramentas', 'Ferramentas', 'Ferramentas manuais e elétricas', 'tools');
```

### 6.2 Fases de Construção Padrão

```sql
INSERT INTO public.construction_phases (name, description)
VALUES
  ('Fundação', 'Fase inicial da construção que envolve a preparação do terreno e construção da base'),
  ('Estrutura', 'Construção da estrutura principal do edifício'),
  ('Alvenaria', 'Construção de paredes e divisórias'),
  ('Instalações', 'Instalação de sistemas elétricos, hidráulicos e outros'),
  ('Acabamento', 'Fase final com acabamentos e detalhes');
```

## 7. Verificação e Testes

1. Verifique se todas as tabelas foram criadas corretamente:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```

2. Verifique se as políticas de segurança estão configuradas:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

3. Teste a autenticação e as permissões com diferentes tipos de usuários.

## 8. Backup e Manutenção

1. Configure backups automáticos no painel do Supabase
2. Estabeleça uma rotina de manutenção para verificar e otimizar o banco de dados
3. Monitore o uso de armazenamento e performance