import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  Chip,
  Divider,
  IconButton,
  Stack,
  Link,
  Tooltip
} from '@mui/material';
import { 
  FileDownload, 
  ContentCopy, 
  Check, 
  Info, 
  Code 
} from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';
import { createSlug } from '../../utils/formatters';

const ProductFeedGenerator: React.FC = () => {
  const [format, setFormat] = useState<'xml' | 'csv' | 'json'>('xml');
  const [loading, setLoading] = useState(false);
  const [feedContent, setFeedContent] = useState<string>('');
  const [feedUrl, setFeedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [baseUrl, setBaseUrl] = useState(window.location.origin);

  // Função para escapar caracteres XML
  const escapeXml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const generateFeed = async () => {
    setLoading(true);
    setFeedContent('');
    
    try {
      // 1. Buscar categorias
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, description, icon')
        .order('name');
        
      if (categoriesError) throw categoriesError;
      
      // Criar mapa de categorias por ID para fácil acesso
      const categoriesMap: Record<string, any> = {};
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
        setFeedContent('Nenhum equipamento encontrado');
        return;
      }
      
      // 3. Gerar o feed no formato solicitado
      if (format === 'xml') {
        // Iniciar o feed XML
        let feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>Lokajá Equipamentos para Locação</title>
  <link>${baseUrl}</link>
  <description>Aluguel de equipamentos para construção civil</description>
`;

        // Adicionar cada equipamento
        equipment.forEach(item => {
          const categoryName = categoriesMap[item.category]?.name || 'Equipamentos';
          const slug = createSlug(item.name);
          const productUrl = `${baseUrl}/equipamento/${slug}`;
          const imageUrl = item.image || `${baseUrl}/images/equipment-placeholder.webp`;
          const price = item.daily_rate || '0';
          const description = escapeXml(item.description || `Aluguel de ${item.name}`);
          
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
    <g:brand>Lokajá</g:brand>
    <g:condition>used</g:condition>
    <g:custom_label_0>${escapeXml(categoryName)}</g:custom_label_0>
  </item>
`;
        });
        
        feed += '</channel>\n</rss>';
        setFeedContent(feed);
        
      } else if (format === 'csv') {
        // Cabeçalho CSV
        let feed = 'id,title,description,link,image_link,availability,price,google_product_category,product_type,brand,condition,custom_label_0\n';
        
        // Dados CSV
        equipment.forEach(item => {
          const categoryName = categoriesMap[item.category]?.name || 'Equipamentos';
          const slug = createSlug(item.name);
          const productUrl = `${baseUrl}/equipamento/${slug}`;
          const imageUrl = item.image || `${baseUrl}/images/equipment-placeholder.webp`;
          const price = item.daily_rate || '0';
          const description = (item.description || `Aluguel de ${item.name}`).replace(/"/g, '""');
          
          feed += `"${item.id}","${item.name.replace(/"/g, '""')}","${description}","${productUrl}","${imageUrl}","${item.available ? 'in stock' : 'out of stock'}","${price} BRL","5181","${categoryName.replace(/"/g, '""')}","Lokajá","used","${categoryName.replace(/"/g, '""')}"\n`;
        });
        
        setFeedContent(feed);
        
      } else if (format === 'json') {
        // Formato JSON
        const jsonData = equipment.map(item => {
          const categoryName = categoriesMap[item.category]?.name || 'Equipamentos';
          const slug = createSlug(item.name);
          const productUrl = `${baseUrl}/equipamento/${slug}`;
          const imageUrl = item.image || `${baseUrl}/images/equipment-placeholder.webp`;
          const price = item.daily_rate || '0';
          
          return {
            id: item.id,
            title: item.name,
            description: item.description || `Aluguel de ${item.name}`,
            link: productUrl,
            image_link: imageUrl,
            availability: item.available ? 'in stock' : 'out of stock',
            price: `${price} BRL`,
            google_product_category: '5181',
            product_type: categoryName,
            brand: 'Lokajá',
            condition: 'used',
            custom_label_0: categoryName
          };
        });
        
        setFeedContent(JSON.stringify(jsonData, null, 2));
      }
      
      // Gerar URL do feed (para mostrar ao usuário, não é uma URL funcional)
      const feedToken = 'lokaja-feed-token'; // Token fixo para este exemplo
      setFeedUrl(`${baseUrl}/api/product-feed?token=${feedToken}&format=${format}`);
      
    } catch (error: any) {
      console.error('Erro ao gerar feed de produtos:', error);
      setFeedContent(`Erro ao gerar feed de produtos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadFeed = () => {
    if (!feedContent) return;
    
    const filename = `lokaja-product-feed-${new Date().toISOString().slice(0,10)}.${format}`;
    const mimeTypes = {
      xml: 'application/rss+xml',
      csv: 'text/csv',
      json: 'application/json'
    };
    
    const blob = new Blob([feedContent], { type: `${mimeTypes[format]};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(feedContent);
    setCopied(true);
    setShowSnackbar(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gerador de Feed para Google Ads
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Esta ferramenta gera feeds de produtos para uso em campanhas de anúncios dinâmicos do Google Ads.
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
          <Typography variant="h6" gutterBottom>
            Como usar o feed em campanhas do Google Ads
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            1. Gere e baixe o feed no formato XML (recomendado para Google Merchant Center)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            2. Faça upload do arquivo para um servidor ou diretório acessível ao Google (hospedagem de arquivos)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            3. No Google Merchant Center, vá para "Produtos" {'>'} "Feeds" e configure um novo feed apontando para a URL do arquivo
          </Typography>
        </Paper>
      </Box>
      
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Formato do Feed</InputLabel>
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'xml' | 'csv' | 'json')}
                label="Formato do Feed"
              >
                <MenuItem value="xml">XML (Google Merchant Center)</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="URL Base do Site"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              fullWidth
            />
          </Stack>
          
          <Button
            variant="contained"
            color="primary"
            onClick={generateFeed}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Gerando...' : 'Gerar Feed de Produtos'}
          </Button>
        </CardContent>
      </Card>
      
      {feedContent && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Feed Gerado
            </Typography>
            <Box>
              <Tooltip title="Copiar conteúdo">
                <IconButton 
                  onClick={copyToClipboard} 
                  color={copied ? "success" : "primary"}
                >
                  {copied ? <Check /> : <ContentCopy />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Baixar arquivo">
                <IconButton onClick={downloadFeed} color="primary">
                  <FileDownload />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Este feed contém os equipamentos ativos em seu catálogo. Para uso em produção, o feed deve estar hospedado em uma URL acessível ao Google.
          </Alert>
          
          <Box sx={{ mb: 3 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: '#f5f5f5', 
                maxHeight: '400px', 
                overflow: 'auto', 
                fontFamily: 'monospace',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {feedContent}
            </Paper>
          </Box>
        </Box>
      )}
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Feed copiado para a área de transferência!"
      />
    </Box>
  );
};

export default ProductFeedGenerator; 