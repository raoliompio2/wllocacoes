import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { 
  ContentCopy, 
  Download, 
  FilterList, 
  Search, 
  Close, 
  Check 
} from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';

interface Equipment {
  id: string;
  name: string;
  category: string;
  daily_rate: string | null;
  description: string | null;
  categories?: {
    id: string;
    name: string;
  };
}

const EquipmentLinkExporter: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'text'>('csv');
  const [baseUrl, setBaseUrl] = useState(() => window.location.origin);

  useEffect(() => {
    fetchEquipment();
    fetchCategories();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          id,
          name,
          category,
          daily_rate,
          description,
          categories (
            id,
            name
          )
        `)
        .order('name');

      if (error) throw error;
      setEquipment(data || []);
    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const generateEquipmentUrl = (item: Equipment) => {
    return `${baseUrl}/equipamento/${createSlug(item.name)}`;
  };

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      setShowSnackbar(true);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleCopyAllLinks = () => {
    const links = filteredEquipment.map(item => generateEquipmentUrl(item)).join('\n');
    navigator.clipboard.writeText(links);
    setShowSnackbar(true);
  };

  const handleExportLinks = () => {
    setDialogOpen(true);
  };

  const generateExportContent = () => {
    const items = filteredEquipment;
    
    if (exportFormat === 'csv') {
      // Formato CSV (mais adequado para Google Ads)
      const csvContent = [
        'ID,Nome,Categoria,Preço Diário,URL,Descrição',
        ...items.map(item => {
          const url = generateEquipmentUrl(item);
          const description = item.description ? `"${item.description.replace(/"/g, '""')}"` : '';
          const price = item.daily_rate ? parseFloat(item.daily_rate).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'Sob consulta';
          const categoryName = item.categories?.name || 'Sem categoria';
          
          return `${item.id},"${item.name}","${categoryName}","${price}","${url}",${description}`;
        })
      ].join('\n');
      
      return csvContent;
    } else {
      // Formato texto simples
      return items.map(item => generateEquipmentUrl(item)).join('\n');
    }
  };

  const downloadExport = () => {
    const content = generateExportContent();
    const filename = exportFormat === 'csv' 
      ? `equipamentos_links_${new Date().toISOString().slice(0,10)}.csv`
      : `equipamentos_links_${new Date().toISOString().slice(0,10)}.txt`;
    
    const blob = new Blob([content], { type: exportFormat === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
    setDialogOpen(false);
  };

  const filteredEquipment = equipment
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || item.categories?.id === selectedCategory)
    );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sem categoria';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Exportar Links de Equipamentos
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Use esta ferramenta para obter links dos seus equipamentos para uso em campanhas do Google Ads.
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar equipamento"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />,
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: '200px' }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as string)}
            label="Categoria"
          >
            <MenuItem value="">Todas as categorias</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<ContentCopy />} 
          onClick={handleCopyAllLinks}
          disabled={filteredEquipment.length === 0}
        >
          Copiar todos os links
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<Download />} 
          onClick={handleExportLinks}
          disabled={filteredEquipment.length === 0}
        >
          Exportar links
        </Button>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Chip 
          label={`${filteredEquipment.length} equipamentos encontrados`} 
          color="primary" 
          variant="outlined" 
        />
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome do Equipamento</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>URL</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Carregando equipamentos...</TableCell>
              </TableRow>
            ) : filteredEquipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Nenhum equipamento encontrado</TableCell>
              </TableRow>
            ) : (
              filteredEquipment.map((item) => {
                const equipmentUrl = generateEquipmentUrl(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.categories?.name || 'Sem categoria'}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        maxWidth: '300px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <Typography variant="body2">
                          {equipmentUrl}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Copiar link">
                        <IconButton
                          onClick={() => handleCopyLink(item.id, equipmentUrl)}
                          color={copied === item.id ? "success" : "primary"}
                        >
                          {copied === item.id ? <Check /> : <ContentCopy />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Link(s) copiado(s) com sucesso!
        </Alert>
      </Snackbar>
      
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Exportar Links de Equipamentos</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 400, mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Formato de Exportação</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'text')}
                label="Formato de Exportação"
              >
                <MenuItem value="csv">CSV (recomendado para Google Ads)</MenuItem>
                <MenuItem value="text">Texto simples (apenas URLs)</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="URL Base do Site"
              fullWidth
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              helperText="Esta URL será usada como base para todos os links"
              margin="normal"
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              O arquivo exportado conterá {filteredEquipment.length} equipamentos com seus respectivos links.
              {exportFormat === 'csv' && " O formato CSV inclui informações adicionais úteis para campanhas do Google Ads."}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={downloadExport} color="primary" variant="contained">
            Baixar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentLinkExporter; 