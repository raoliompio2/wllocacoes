# Instruções para Personalização do Template

Este documento contém orientações sobre quais arquivos devem ser modificados para personalizar o template para um novo cliente.

## Arquivos de Configuração

### 1. Configurações da Empresa
- `src/context/CompanyContext.tsx`: Alterar valores padrão da empresa (nome, telefone, email, endereços)
- `src/utils/updateWhatsapp.ts`: Atualizar dados de contato WhatsApp
- `src/utils/supabaseClient.ts`: Atualizar chaves de API e armazenamento

### 2. Configurações de SEO
- `src/components/SEO/SEOHead.tsx`: Atualizar metadados, tags geo e URLs base
- `src/components/SEO/ProductSchema.tsx`: Atualizar informações da empresa nos schemas
- `src/components/SEO/LocationSchema.tsx`: Atualizar endereços e coordenadas geográficas
- `src/components/SEO/EquipmentCategorySchema.tsx`: Atualizar URLs e informações da empresa
- `public/index.html`: Atualizar meta tags, título e descrições
- `public/manifest.json`: Atualizar nome da empresa e descrições
- `public/sitemap.xml`: Atualizar URLs do site
- `public/robots.txt`: Atualizar referências a páginas específicas

## Componentes Principais

### 3. Páginas Públicas
- `src/components/public/Footer.tsx`: Atualizar informações de contato, endereços e links sociais
- `src/components/public/ContactPage.tsx`: Atualizar formulários e informações de contato
- `src/components/public/HomePage.tsx` ou `src/components/Home.tsx`: Atualizar textos de apresentação e localidades
- `src/components/public/AboutPage.tsx`: Atualizar histórico e informações da empresa
- `src/components/public/PublicNavbar.tsx`: Atualizar nome da empresa e logo
- `src/components/public/SitemapPage.tsx`: Atualizar meta tags e URLs

### 4. Componentes de Contato
- `src/components/public/HeroSection.tsx`: Atualizar número de WhatsApp e mensagem padrão
- `src/components/public/FloatingCta.tsx`: Atualizar número de WhatsApp e mensagem padrão
- `src/components/Search/SearchEquipment.tsx`: Atualizar número de WhatsApp

### 5. Schemas e Metadados
- `src/components/public/EquipmentPage.tsx`: Atualizar schema de organização (nome, endereço, telefone)
- `src/components/public/EquipmentDetailPage.tsx`: Atualizar schema de negócio local (nome, endereço, telefone, coordenadas)
- `src/components/public/Breadcrumbs.tsx`: Atualizar URLs nos schemas

## Arquivos de Integração

### 6. Integrações com APIs
- `api/image-proxy.js`: Atualizar URLs de origem das imagens
- `src/utils/wordpressAPI.ts`: Atualizar URLs da API WordPress (se aplicável)

### 7. Recursos Visuais
- `src/components/common/LcpMonitor/lcpConfig.ts`: Atualizar seletores de imagens e logos
- `public/images/`: Substituir logos, favicons e imagens da marca

## Outros Arquivos
- Verificar quaisquer outros arquivos que possam conter referências específicas ao cliente anterior
- Buscar por termos como nome da empresa, telefones, emails, URLs e endereços em todo o projeto

## Processo Recomendado
1. Realizar buscas globais por termos específicos do cliente anterior
2. Substituir todas as ocorrências por informações do novo cliente
3. Testar todas as funcionalidades para garantir que as alterações foram aplicadas corretamente
4. Verificar metadados e schemas para garantir consistência das informações 