-- ESTE É UM MODELO DE SCRIPT PARA RECRIAR O BANCO DE DADOS
-- Baseado nas tabelas vistas na estrutura do projeto

-- ATENÇÃO: Este script deve ser completado com os detalhes obtidos do script list_schema.sql
-- As definições exatas de tipos, constraints e políticas devem ser preenchidas

-- CONFIGURAR RLS (ROW LEVEL SECURITY) GLOBALMENTE
ALTER DATABASE postgres SET "auth.enable_row_level_security" = true;

-- HABILITAR EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Para busca por similaridade de texto
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Para busca sem acentos

-- FUNÇÃO PARA ATUALIZAR CAMPO UPDATED_AT AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-------------------------
-- CRIAÇÃO DE TABELAS --
-------------------------

-- PROFILES (USUÁRIOS)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'cliente',
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- CATEGORIES (CATEGORIAS DE EQUIPAMENTO)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  slug TEXT UNIQUE,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- EQUIPMENT (EQUIPAMENTOS)
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  technical_specifications TEXT,
  daily_rate DECIMAL(10, 2),
  weekly_rate DECIMAL(10, 2),
  monthly_rate DECIMAL(10, 2),
  status TEXT,
  image TEXT,
  availability_status TEXT DEFAULT 'disponível',
  brand TEXT,
  model TEXT,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON equipment
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- EQUIPMENT_CATEGORIES (RELACIONAMENTO EQUIPAMENTO-CATEGORIA)
CREATE TABLE IF NOT EXISTS equipment_categories (
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (equipment_id, category_id)
);

-- ACCESSORIES (ACESSÓRIOS)
CREATE TABLE IF NOT EXISTS accessories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_accessories_updated_at
BEFORE UPDATE ON accessories
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- EQUIPMENT_ACCESSORIES (RELACIONAMENTO EQUIPAMENTO-ACESSÓRIO)
CREATE TABLE IF NOT EXISTS equipment_accessories (
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  accessory_id UUID REFERENCES accessories(id) ON DELETE CASCADE,
  PRIMARY KEY (equipment_id, accessory_id)
);

-- EQUIPMENT_IMAGES (IMAGENS DOS EQUIPAMENTOS)
CREATE TABLE IF NOT EXISTS equipment_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  main BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_equipment_images_updated_at
BEFORE UPDATE ON equipment_images
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- BOOKINGS (RESERVAS)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_price DECIMAL(10, 2),
  status TEXT DEFAULT 'pendente',
  special_requirements TEXT,
  delivery_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- BUDGET_REQUESTS (SOLICITAÇÕES DE ORÇAMENTO)
CREATE TABLE IF NOT EXISTS budget_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id),
  owner_id UUID REFERENCES profiles(id),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pendente',
  total_price DECIMAL(10, 2),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_budget_requests_updated_at
BEFORE UPDATE ON budget_requests
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- BUDGET_MESSAGES (MENSAGENS DE ORÇAMENTO)
CREATE TABLE IF NOT EXISTS budget_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_request_id UUID REFERENCES budget_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- COMPANY_INFO (INFORMAÇÕES DA EMPRESA)
CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  logo TEXT,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  business_hours TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_company_info_updated_at
BEFORE UPDATE ON company_info
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- REVIEWS (AVALIAÇÕES)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- EQUIPMENT_MAINTENANCE (MANUTENÇÃO DE EQUIPAMENTOS)
CREATE TABLE IF NOT EXISTS equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  maintenance_date TIMESTAMP WITH TIME ZONE,
  cost DECIMAL(10, 2),
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_equipment_maintenance_updated_at
BEFORE UPDATE ON equipment_maintenance
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- NOTIFICATIONS (NOTIFICAÇÕES)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  type TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CONSTRUCTION_PHASES (FASES DE CONSTRUÇÃO)
CREATE TABLE IF NOT EXISTS construction_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_construction_phases_updated_at
BEFORE UPDATE ON construction_phases
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- EQUIPMENT_CONSTRUCTION_PHASES (RELACIONAMENTO EQUIPAMENTO-FASE)
CREATE TABLE IF NOT EXISTS equipment_construction_phases (
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES construction_phases(id) ON DELETE CASCADE,
  PRIMARY KEY (equipment_id, phase_id)
);

-- EQUIPMENT_AVAILABILITY (DISPONIBILIDADE DE EQUIPAMENTOS)
CREATE TABLE IF NOT EXISTS equipment_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  availability_type TEXT NOT NULL, -- 'available', 'unavailable', 'maintenance'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_equipment_availability_updated_at
BEFORE UPDATE ON equipment_availability
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-------------------------
-- POLÍTICAS RLS --
-------------------------

-- Exemplos de políticas RLS (devem ser ajustadas com base nos resultados do list_schema.sql)

-- Políticas para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para equipment
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipment is viewable by everyone" ON equipment FOR SELECT USING (true);
CREATE POLICY "Equipment owners can insert" ON equipment FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'proprietario'
  )
);
CREATE POLICY "Equipment owners can update own equipment" ON equipment FOR UPDATE USING (
  user_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = equipment.user_id AND profiles.role = 'proprietario'
  )
) WITH CHECK (
  user_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = equipment.user_id AND profiles.role = 'proprietario'
  )
);
CREATE POLICY "Equipment owners can delete own equipment" ON equipment FOR DELETE USING (
  user_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = equipment.user_id AND profiles.role = 'proprietario'
  )
);

-- NOTA: Adicionar políticas para outras tabelas baseado nos resultados do list_schema.sql 