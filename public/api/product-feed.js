// API handler para gerar feed de produtos para anúncios dinâmicos do Google
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

// Configuração do Supabase com fallback hardcoded
const supabaseUrl = process.env.VITE_SUPABASE_URL || 
                   process.env.SUPABASE_URL || 
                   'https://fwsqvutgtwjyjbukydsy.supabase.co';

const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 
                   process.env.SUPABASE_KEY || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3c3F2dXRndHdqeWpidWt5ZHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTczNjgsImV4cCI6MjA2NTU5MzM2OH0.JUtKdyPA7Eh8N_mUe73yPMhehaQzkjFOA6EqD5HG9Ko';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para criar slug a partir do nome
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

// Função para escapar caracteres XML
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Handler principal da API
export default async function handler(req, res) {
  // Verificar se há um token de acesso (segurança básica)
  const { token, format = 'xml' } = req.query;
  const validToken = process.env.PRODUCT_FEED_TOKEN || 'wllocacoes-feed-token';
  
  if (token !== validToken) {
    return res.status(401).send('Acesso não autorizado');
  }
  
  try {
    // 1. Buscar categorias
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, description, icon')
      .order('name');
      
    if (categoriesError) throw categoriesError;
    
    // Criar mapa de categorias por ID para fácil acesso
    const categoriesMap = {};
    if (categories) {
      categories.forEach(category => {
        categoriesMap[category.id] = category;
      });
    }
    
    // 2. Buscar equipamentos
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .select('*')
      .eq('available', true)
      .order('name');
      
    if (equipmentError) throw equipmentError;
    if (!equipment || equipment.length === 0) {
      return res.status(404).send('Nenhum produto encontrado');
    }
    
    // 3. Gerar o feed no formato solicitado
    const baseUrl = 'https://wllocacoes.com.br';
    
    if (format === 'xml' || format === 'rss') {
      // Configurar cabeçalhos para XML
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      
      // Iniciar o feed XML
      let feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>WL Locações Equipamentos para Locação</title>
  <link>${baseUrl}</link>
  <description>Aluguel de equipamentos para construção civil em Ponta Porã e região</description>
`;

      // Adicionar cada equipamento
      equipment.forEach(item => {
        const categoryName = categoriesMap[item.category]?.name || 'Equipamentos';
        const slug = createSlug(item.name);
        const productUrl = `${baseUrl}/equipamento/${slug}`;
        const imageUrl = item.image || `${baseUrl}/images/equipment/default.webp`;
        const price = item.daily_rate || '0';
        const description = escapeXml(item.description || `Aluguel de ${item.name} em Ponta Porã e região`);
        
        feed += `  <item>
    <g:id>${item.id}</g:id>
    <g:title>${escapeXml(item.name)}</g:title>
    <g:description>${description}</g:description>
    <g:link>${productUrl}</g:link>
    <g:image_link>${imageUrl}</g:image_link>
    <g:availability>${item.available ? 'in stock' : 'out of stock'}</g:availability>
    <g:price>${price} BRL</g:price>
    <g:google_product_category>5181</g:google_product_category>
    <g:product_type>${escapeXml(categoryName)}</g:product_type>
    <g:brand>WL Locações</g:brand>
    <g:condition>used</g:condition>
    <g:custom_label_0>${escapeXml(categoryName)}</g:custom_label_0>
  </item>
`;
      });
      
      feed += '</channel>\n</rss>';
      
      // Enviar o feed
      res.status(200).send(feed);
      
    } else if (format === 'csv') {
      // Configurar cabeçalhos para CSV
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=wllocacoes-product-feed.csv');
      
      // Cabeçalho CSV
      let feed = 'id,title,description,link,image_link,availability,price,google_product_category,product_type,brand,condition,custom_label_0\n';
      
      // Dados CSV
      equipment.forEach(item => {
        const categoryName = categoriesMap[item.category]?.name || 'Equipamentos';
        const slug = createSlug(item.name);
        const productUrl = `${baseUrl}/equipamento/${slug}`;
        const imageUrl = item.image || `${baseUrl}/images/equipment/default.webp`;
        const price = item.daily_rate || '0';
        const description = (item.description || `Aluguel de ${item.name} em Ponta Porã e região`).replace(/"/g, '""');
        
        feed += `"${item.id}","${item.name.replace(/"/g, '""')}","${description}","${productUrl}","${imageUrl}","${item.available ? 'in stock' : 'out of stock'}","${price} BRL","5181","${categoryName.replace(/"/g, '""')}","WL Locações","used","${categoryName.replace(/"/g, '""')}"\n`;
      });
      
      // Enviar o feed
      res.status(200).send(feed);
      
    } else if (format === 'json') {
      // Configurar cabeçalhos para JSON
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      
      // Formato JSON
      const jsonData = equipment.map(item => {
        const categoryName = categoriesMap[item.category]?.name || 'Equipamentos';
        const slug = createSlug(item.name);
        const productUrl = `${baseUrl}/equipamento/${slug}`;
        const imageUrl = item.image || `${baseUrl}/images/equipment/default.webp`;
        const price = item.daily_rate || '0';
        
        return {
          id: item.id,
          title: item.name,
          description: item.description || `Aluguel de ${item.name} em Ponta Porã e região`,
          link: productUrl,
          image_link: imageUrl,
          availability: item.available ? 'in stock' : 'out of stock',
          price: `${price} BRL`,
          google_product_category: '5181',
          product_type: categoryName,
          brand: 'WL Locações',
          condition: 'used',
          custom_label_0: categoryName
        };
      });
      
      // Enviar o feed
      res.status(200).json(jsonData);
    } else {
      // Formato não suportado
      res.status(400).send('Formato não suportado. Use "xml", "csv" ou "json"');
    }
  } catch (error) {
    console.error('Erro ao gerar feed de produtos:', error);
    res.status(500).send(`Erro ao gerar feed de produtos: ${error.message}`);
  }
} 