# Guia de Configuração do Template de Locação de Equipamentos

Este documento descreve as etapas necessárias para configurar o template "Rental Company" para uma nova empresa de locação de equipamentos.

> **Importante:** 
> - Para instruções detalhadas sobre a estrutura de imagens, consulte o arquivo [estrutura_imagens.md](estrutura_imagens.md).
> - Para preparar a estrutura de imagens, execute o script: `node scripts/prepare_images.js`

## 1. Configurações Básicas da Empresa

### 1.1 Informações da Empresa
- Atualizar `src/context/CompanyContext.tsx` com:
  - Nome da empresa
  - Endereço completo
  - Telefone e WhatsApp
  - Email de contato
  - Horário de funcionamento
  - Coordenadas geográficas (latitude/longitude)
  - Links de redes sociais

### 1.2 Domínio e URLs
- Substituir "rentalcompany.com.br" pelo domínio real da empresa em:
  - `public/sitemap.xml`
  - `public/robots.txt`
  - `public/index.html` e `public/index_new.html`
  - `src/components/SEO/*` (todos os arquivos de SEO)
  - `src/components/public/EquipmentPage.tsx`

## 2. Identidade Visual

### 2.1 Logotipos e Imagens
- Substituir imagens em `public/images/`:
  - `logo.png` - Logo principal
  - `favicon.png` - Ícone para navegador
  - `fundo_site.png` - Imagem de fundo do site
  - Criar versões otimizadas em WebP em `public/images_optimized/`

### 2.2 Cores e Tema
- Atualizar `src/theme/ThemeContext.tsx` com:
  - Cores primárias e secundárias da marca
  - Paleta de cores para modo claro e escuro
  - Raio de borda e outras configurações visuais

## 3. Configurações de SEO

### 3.1 Meta Tags
- Atualizar meta tags em:
  - `src/components/SEO/SEOHead.tsx`
  - `public/index.html`
  - `public/index_new.html`
- Incluir:
  - Título do site
  - Descrição padrão
  - Palavras-chave
  - Informações de localização

### 3.2 Schema.org
- Atualizar schemas em:
  - `src/components/SEO/HomePageSchema.tsx`
  - `src/components/SEO/AboutPageSchema.tsx`
  - `src/components/SEO/ProductSchema.tsx`
  - `src/components/SEO/EquipmentListSchema.tsx`
  - `src/components/SEO/LocationSchema.tsx`
- Configurar informações da empresa, endereço e produtos

### 3.3 Sitemap e Robots
- Atualizar `public/sitemap.xml` com URLs específicas da empresa
- Verificar regras em `public/robots.txt`

## 4. Integrações

### 4.1 Banco de Dados (Supabase)
- Configurar `src/utils/supabaseConfig.ts` com:
  - URL da API
  - Chave anônima
  - Chave de serviço

### 4.2 Email
- Configurar `src/components/Settings/EmailSettings.tsx`:
  - Servidor SMTP
  - Credenciais
  - Email de origem
  - Templates de email

### 4.3 WhatsApp
- Atualizar número de WhatsApp em:
  - `src/components/public/HeroSection.tsx`
  - `src/components/public/FloatingCta.tsx`
  - `src/components/Search/SearchEquipment.tsx`
  - `src/components/Budgets/BudgetDetailsDialog.tsx`
  - `src/utils/updateWhatsapp.ts`

### 4.4 Google
- Configurar Google Analytics em `src/components/common/GoogleTagManager/GoogleTagManager.tsx`
- Atualizar ID do widget de avaliações do Google em `src/components/common/GoogleReviewsWidget.tsx`

## 5. Conteúdo

### 5.1 Páginas Principais
- Atualizar textos e imagens em:
  - `src/components/public/HomePage.tsx`
  - `src/components/public/AboutPage.tsx`
  - `src/components/public/ContactPage.tsx`

### 5.2 Equipamentos
- Configurar categorias de equipamentos no banco de dados
- Atualizar textos descritivos em `src/components/public/EquipmentPage.tsx`
- Personalizar `src/components/public/FeaturedCategories.tsx`

### 5.3 Políticas e Termos
- Atualizar:
  - `src/components/public/TermosDeUso.tsx`
  - `src/components/public/PoliticaDePrivacidade.tsx`

## 6. PWA e Manifest

- Configurar `public/manifest.json` com:
  - Nome da empresa
  - Descrição
  - Cores do tema
  - Ícones

## 7. Verificação Final

- Executar `npm run build` para verificar erros
- Testar responsividade em diferentes dispositivos
- Verificar funcionalidades de:
  - Orçamentos
  - Autenticação
  - Formulários de contato
  - Integração com WhatsApp

## 8. Deploy

- Configurar `vercel.json` ou outro arquivo de configuração de deploy
- Verificar variáveis de ambiente necessárias
- Configurar domínio personalizado

---

Lembre-se de executar o script `scripts/optimize-images.js` após substituir as imagens para gerar versões otimizadas automaticamente. 