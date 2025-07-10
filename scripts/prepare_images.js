#!/usr/bin/env node

/**
 * Script para preparar a estrutura de imagens para uma nova empresa
 * 
 * Este script:
 * 1. Remove as imagens específicas da Panda Locações
 * 2. Cria a estrutura de pastas necessária
 * 3. Adiciona arquivos README em cada pasta para orientação
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Obter o diretório atual do script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretórios principais
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'images_optimized');
const SRC_ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');

// Arquivos específicos da Panda Locações para remover
const specificFiles = [
  // Logos
  'Logo Panda.png',
  'Logo Panda (2).png',
  'pandafavicon.png',
  'Fundo Site_panda.png',
  'Fundo_Site_panda.png',
];

// Pastas a serem criadas/mantidas
const foldersToCreate = [
  path.join(IMAGES_DIR, 'Empresa'),
  path.join(IMAGES_DIR, 'Logo_fundo_claro'),
  path.join(IMAGES_DIR, 'Logo_fundo_escuro'),
  path.join(IMAGES_DIR, 'temp'),
  path.join(OPTIMIZED_DIR, 'Empresa'),
  path.join(OPTIMIZED_DIR, 'Logo_fundo_claro'),
  path.join(OPTIMIZED_DIR, 'Logo_fundo_escuro'),
  SRC_ASSETS_DIR
];

// Conteúdo dos arquivos README para cada pasta
const readmeContents = {
  'images': 'Coloque aqui as imagens originais da empresa.\n\nArquivos necessários:\n- logo.png (logo principal)\n- favicon.png (ícone do site)\n- fundo_site.png (imagem de fundo)\n- Imagehero.png (imagem principal da página inicial)',
  'images/Empresa': 'Coloque aqui as fotos da empresa, equipe, instalações, etc.',
  'images/Logo_fundo_claro': 'Coloque aqui as variações do logo para uso em fundos claros.',
  'images/Logo_fundo_escuro': 'Coloque aqui as variações do logo para uso em fundos escuros.',
  'images/temp': 'Pasta temporária para processamento de imagens.',
  'images_optimized': 'Pasta para versões otimizadas das imagens (WebP). NÃO coloque arquivos manualmente aqui, use o script optimize-images.js.',
  'src/assets': 'Imagens usadas diretamente no código React.'
};

/**
 * Cria um diretório se ele não existir
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Criando diretório: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Remove arquivos específicos da Panda Locações
 */
function removeSpecificFiles() {
  console.log('Removendo arquivos específicos da Panda Locações...');
  
  // Função para procurar e remover arquivos em um diretório
  function removeFilesInDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      // Verifica se é um diretório
      if (fs.statSync(filePath).isDirectory()) {
        removeFilesInDir(filePath);
        return;
      }
      
      // Verifica se o arquivo está na lista de específicos
      if (specificFiles.includes(file)) {
        console.log(`Removendo: ${filePath}`);
        fs.unlinkSync(filePath);
      }
    });
  }
  
  // Remove arquivos em public/images e public/images_optimized
  removeFilesInDir(IMAGES_DIR);
  removeFilesInDir(OPTIMIZED_DIR);
}

/**
 * Cria a estrutura de pastas necessária
 */
function createFolderStructure() {
  console.log('Criando estrutura de pastas...');
  
  foldersToCreate.forEach(dir => {
    ensureDirectoryExists(dir);
  });
}

/**
 * Adiciona arquivos README em cada pasta
 */
function addReadmeFiles() {
  console.log('Adicionando arquivos README...');
  
  Object.entries(readmeContents).forEach(([folder, content]) => {
    const readmePath = path.join(
      folder.startsWith('src') ? path.join(__dirname, '..') : PUBLIC_DIR,
      folder,
      'README.md'
    );
    
    fs.writeFileSync(readmePath, content);
    console.log(`Criado: ${readmePath}`);
  });
}

/**
 * Cria arquivos de placeholder para imagens essenciais
 */
function createPlaceholders() {
  console.log('Criando placeholders para imagens essenciais...');
  
  const placeholders = [
    { path: path.join(IMAGES_DIR, 'logo.png'), message: 'Logo principal da empresa' },
    { path: path.join(IMAGES_DIR, 'favicon.png'), message: 'Favicon do site' },
    { path: path.join(IMAGES_DIR, 'fundo_site.png'), message: 'Imagem de fundo do site' },
    { path: path.join(IMAGES_DIR, 'Imagehero.png'), message: 'Imagem hero da página inicial' },
  ];
  
  placeholders.forEach(placeholder => {
    // Verifica se o arquivo já existe
    if (!fs.existsSync(placeholder.path)) {
      // Cria um arquivo de texto com o nome da imagem
      fs.writeFileSync(`${placeholder.path}.txt`, `Substitua com: ${placeholder.message}`);
      console.log(`Criado placeholder: ${placeholder.path}.txt`);
    }
  });
}

/**
 * Função principal
 */
function main() {
  console.log('Iniciando preparação da estrutura de imagens...');
  
  try {
    // Remover arquivos específicos da Panda Locações
    removeSpecificFiles();
    
    // Criar estrutura de pastas
    createFolderStructure();
    
    // Adicionar arquivos README
    addReadmeFiles();
    
    // Criar placeholders
    createPlaceholders();
    
    console.log('\nEstrutura de imagens preparada com sucesso!');
    console.log('\nPróximos passos:');
    console.log('1. Adicione as imagens da nova empresa nas pastas correspondentes');
    console.log('2. Execute o script de otimização: node scripts/optimize-images.js');
    console.log('3. Verifique as referências nos componentes React');
    
  } catch (error) {
    console.error('Erro ao preparar estrutura de imagens:', error);
    process.exit(1);
  }
}

// Executa a função principal
main();