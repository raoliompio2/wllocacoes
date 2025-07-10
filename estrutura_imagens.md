# Estrutura de Imagens do Template

Este documento detalha a estrutura de pastas e arquivos de imagens que precisam ser substituídos ao configurar o template para uma nova empresa.

## 1. Estrutura de Pastas

```
public/
├── images/                    # Imagens originais
│   ├── Empresa/              # Imagens da página Sobre/Empresa
│   ├── Logo_fundo_claro/     # Variações do logo para fundo claro
│   ├── Logo_fundo_escuro/    # Variações do logo para fundo escuro
│   └── temp/                 # Pasta temporária para processamento
├── images_optimized/         # Versões otimizadas (WebP)
│   ├── Empresa/
│   ├── Logo_fundo_claro/
│   └── Logo_fundo_escuro/
└── src/
    └── assets/               # Imagens usadas diretamente no código
```

## 2. Arquivos Principais para Substituição

### 2.1 Logos e Identidade

| Arquivo Original | Caminho | Descrição | Dimensões Recomendadas |
|------------------|---------|-----------|------------------------|
| `Logo Panda.png` | `/public/images/` | Logo principal | 300x100px |
| `logo.png` | `/public/images/` | Logo principal (renomeado) | 300x100px |
| `favicon.png` | `/public/images/` | Ícone do site | 192x192px |
| `favicon.svg` | `/public/images/` | Versão vetorial do ícone | - |
| `fundo_site.png` | `/public/images/` | Imagem de fundo do site | 1920x1080px |

### 2.2 Imagens de Hero e Destaque

| Arquivo Original | Caminho | Descrição | Dimensões Recomendadas |
|------------------|---------|-----------|------------------------|
| `Imagehero.png` | `/public/images/` | Imagem principal da página inicial | 1200x800px |
| `Imagehero.webp` | `/public/images_optimized/` | Versão otimizada da imagem hero | 1200x800px |

### 2.3 Imagens da Empresa

Substitua todas as imagens em `/public/images/Empresa/` com fotos da nova empresa:

- Equipe
- Instalações
- Frota
- Equipamentos em uso

Dimensões recomendadas: 800x600px ou 1200x800px, mantendo proporção 4:3 ou 16:9.

### 2.4 Variações de Logo

Crie e substitua as seguintes variações do logo:

1. **Logo para fundo claro**
   - Caminho: `/public/images/Logo_fundo_claro/`
   - Formatos necessários: PNG com transparência e WebP

2. **Logo para fundo escuro**
   - Caminho: `/public/images/Logo_fundo_escuro/`
   - Formatos necessários: PNG com transparência e WebP

## 3. Processo de Otimização

1. Substitua primeiro as imagens originais nas pastas apropriadas
2. Execute o script de otimização para gerar versões WebP:
   ```
   node scripts/optimize-images.js
   ```
3. Verifique se as imagens otimizadas foram geradas corretamente em `/public/images_optimized/`

## 4. Referências no Código

Após substituir as imagens, verifique as referências nos seguintes arquivos:

| Componente | Caminho | Referências de Imagem |
|------------|---------|------------------------|
| SEOHead | `src/components/SEO/SEOHead.tsx` | Logo, favicon |
| HomePage | `src/components/public/HomePage.tsx` | Hero, logos |
| AboutPage | `src/components/public/AboutPage.tsx` | Imagens da empresa |
| PublicNavbar | `src/components/public/PublicNavbar.tsx` | Logo |
| Footer | `src/components/public/Footer.tsx` | Logo |

## 5. Nomenclatura Padrão

Para facilitar a manutenção, siga este padrão de nomenclatura:

- Use nomes em minúsculas
- Separe palavras com hífens
- Use nomes descritivos (ex: `equipe-completa.png` em vez de `img1.png`)
- Mantenha a extensão original (.png, .jpg) para arquivos originais
- As versões otimizadas terão extensão .webp

## 6. Checklist de Imagens

- [ ] Logo principal (claro e escuro)
- [ ] Favicon (PNG e SVG)
- [ ] Imagem de fundo do site
- [ ] Imagem hero da página inicial
- [ ] Fotos da empresa (mínimo 3)
- [ ] Imagens de equipamentos destacados
- [ ] Executar script de otimização
- [ ] Verificar referências no código

## 7. Observações Importantes

- Mantenha cópias de backup das imagens originais
- Otimize todas as imagens antes de fazer upload
- Use imagens com boa resolução, mas otimizadas para web
- Prefira o formato WebP sempre que possível, com fallback para PNG/JPG
- Certifique-se de ter direitos de uso para todas as imagens 