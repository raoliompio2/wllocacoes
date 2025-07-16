import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// URLs base
const SITE_URL = 'https://lokaja.com.br';
const IMAGES_URL = `${SITE_URL}/images_optimized`;

/**
 * Função para criar um slug a partir do nome
 */
function createSlug(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/--+/g, '-') // Evita hífens duplicados
    .trim();
}

/**
 * Função para gerar o formato XML para cada URL
 */
function generateUrlXml({ loc, lastmod, changefreq, priority, images = [] }) {
  const imageXml = images.map(image => `
    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:caption>${image.caption}</image:caption>
    </image:image>
  `).join('');

  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageXml ? imageXml : ''}
  </url>`;
}

/**
 * Função principal para gerar o sitemap
 */
async function generateSitemap() {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:mobile="http://www.mobile.google.com/schemas/sitemap-mobile/1.0"
        xmlns:pagemap="http://www.google.com/schemas/sitemap-pagemap/1.0"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

    // 1. Adicionar páginas estáticas principais
    const staticPages = [
      { url: '', changefreq: 'weekly', priority: '1.0' },
      { url: 'sobre', changefreq: 'monthly', priority: '0.7' },
      { url: 'contato', changefreq: 'monthly', priority: '0.7' },
      { url: 'equipamentos', changefreq: 'daily', priority: '0.9' },
      { url: 'politica-de-privacidade', changefreq: 'yearly', priority: '0.3' },
      { url: 'termos-de-uso', changefreq: 'yearly', priority: '0.3' }
    ];

    staticPages.forEach(page => {
      sitemap += generateUrlXml({
        loc: `${SITE_URL}/${page.url}`,
        lastmod: currentDate,
        changefreq: page.changefreq,
        priority: page.priority
      });
    });

    // 2. Buscar e adicionar categorias
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, description, icon')
      .order('name');

    if (categoriesError) {
      console.error('Erro ao buscar categorias:', categoriesError);
    } else if (categories && categories.length > 0) {
      for (const category of categories) {
        const categorySlug = createSlug(category.name);
        const categoryUrl = `${SITE_URL}/equipamentos/categoria/${categorySlug}`;
        
        sitemap += generateUrlXml({
          loc: categoryUrl,
          lastmod: currentDate,
          changefreq: 'daily',
          priority: '0.8',
          images: [
            {
              url: `${IMAGES_URL}/categories/${categorySlug || category.icon || 'default-category'}.webp`,
              caption: `${category.name} para aluguel`
            }
          ]
        });
      }
    }

    // 3. Buscar e adicionar equipamentos
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .select('id, name, description, image, category')
      .eq('available', true)
      .order('name');

    if (equipmentError) {
      console.error('Erro ao buscar equipamentos:', equipmentError);
    } else if (equipment && equipment.length > 0) {
      for (const item of equipment) {
        const equipmentSlug = createSlug(item.name);
        const equipmentUrl = `${SITE_URL}/equipamento/${equipmentSlug}`;
        
        sitemap += generateUrlXml({
          loc: equipmentUrl,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: '0.7',
          images: [
            {
              url: item.image || `${IMAGES_URL}/equipment/default.webp`,
              caption: `${item.name} - Aluguel de equipamentos para construção`
            }
          ]
        });
      }
    }

    sitemap += `
</urlset>`;

    // Salvar o sitemap em arquivo
    fs.writeFileSync('./public/sitemap.xml', sitemap);
    console.log('Sitemap gerado com sucesso em public/sitemap.xml');
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
  }
}

// Executar a geração do sitemap
generateSitemap(); 