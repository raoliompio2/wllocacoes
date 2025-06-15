import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const imagesDir = path.join(publicDir, 'images');
const outputDir = path.join(publicDir, 'images_optimized');

// Certifique-se de que o diretório de saída existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Função para otimizar uma imagem
async function optimizeImage(filePath, outputPath) {
  const extension = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath, extension);
  const outputWebP = path.join(outputPath, `${fileName}.webp`);
  const stats = fs.statSync(filePath);
  
  console.log(`Otimizando: ${filePath} (${Math.round(stats.size / 1024)} KB)`);
  
  try {
    // Carrega a imagem
    let image = sharp(filePath);
    
    // Obtém os metadados da imagem
    const metadata = await image.metadata();
    
    // Define dimensões máximas (manter a proporção)
    const maxWidth = 1600;
    const maxHeight = 1200;
    
    // Redimensiona se necessário
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      image = image.resize({
        width: Math.min(metadata.width, maxWidth),
        height: Math.min(metadata.height, maxHeight),
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Converte para WebP com boa qualidade
    await image
      .webp({ quality: 80 })
      .toFile(outputWebP);
    
    const newStats = fs.statSync(outputWebP);
    const savings = stats.size - newStats.size;
    const savingsPercent = Math.round((savings / stats.size) * 100);
    
    console.log(`Convertido para WebP: ${outputWebP} (${Math.round(newStats.size / 1024)} KB, economizou ${savingsPercent}%)`);
    
    return {
      originalSize: stats.size,
      optimizedSize: newStats.size,
      savings: savings,
      savingsPercent: savingsPercent
    };
  } catch (error) {
    console.error(`Erro ao otimizar ${filePath}:`, error);
    return null;
  }
}

// Função para processar um diretório recursivamente
async function processDirectory(directory, outputDirectory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  // Garante que o diretório de saída existe
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    const outputPath = path.join(outputDirectory, entry.name);
    
    if (entry.isDirectory()) {
      // Recursivamente processa subdiretórios
      await processDirectory(fullPath, outputPath);
    } else {
      // Verifica se é uma imagem
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        await optimizeImage(fullPath, outputDirectory);
      }
    }
  }
}

// Iniciar processo de otimização
console.log('Iniciando otimização de imagens...');
processDirectory(imagesDir, outputDir)
  .then(() => {
    console.log('Otimização de imagens concluída!');
  })
  .catch(error => {
    console.error('Erro ao processar imagens:', error);
  }); 