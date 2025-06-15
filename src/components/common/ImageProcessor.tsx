import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  AlertTitle,
  LinearProgress,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Tooltip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Download, Check, X, Image, Upload, Eye, RefreshCw, FileUp, Link2, ExternalLink } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { getWordPressImageUrl, isWordPressUrl } from '../../utils/wordpressAPI';

interface ImageProcessorProps {
  data: any[];
  imageUrlColumn: string;
  equipmentIdColumn: string;
  onComplete?: (results: ProcessingResult) => void;
}

interface ImageStatus {
  url: string;
  id: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  fileName?: string;
  localUrl?: string;
  storageUrl?: string;
  blob?: Blob;
}

interface ProcessingResult {
  totalImages: number;
  successCount: number;
  errorCount: number;
  imageData: { id: string, storageUrl: string }[];
}

// Função para limitar o número de promessas simultâneas
const promiseAllInBatches = async (tasks: (() => Promise<any>)[], batchSize: number) => {
  let results: any[] = [];
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize).map(task => task());
    results = [...results, ...(await Promise.allSettled(batch))];
  }
  
  return results;
};

// Função para processar URL com proxy CORS
const getProxiedImageUrl = (originalUrl: string): string => {
  // Lista de opções de proxy CORS
  const corsProxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://proxy.cors.sh/'
  ];
  
  // Usar o primeiro proxy da lista (pode alternar entre eles se um falhar)
  return `${corsProxies[0]}${encodeURIComponent(originalUrl)}`;
};

// Verifica se uma URL já usa proxy
const isProxiedUrl = (url: string): boolean => {
  return url.includes('corsproxy.io') || 
         url.includes('allorigins.win') || 
         url.includes('cors-anywhere.herokuapp.com') ||
         url.includes('thingproxy.freeboard.io') ||
         url.includes('proxy.cors.sh');
};

// Fornece uma URL de fallback para imagens não carregadas
const getFallbackImageUrl = (equipmentId: string) => {
  return `https://via.placeholder.com/300x300/e0e0e0/757575?text=Equipamento+${equipmentId}`;
};

const ImageProcessor: React.FC<ImageProcessorProps> = ({
  data,
  imageUrlColumn,
  equipmentIdColumn,
  onComplete
}) => {
  const [imageStatus, setImageStatus] = useState<ImageStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [processingStep, setProcessingStep] = useState<'extracting' | 'downloading' | 'uploading' | 'complete'>('extracting');
  const [manualUrl, setManualUrl] = useState<string>('');
  const [manualIdMapping, setManualIdMapping] = useState<string>('');
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [useProxy, setUseProxy] = useState<boolean>(true);
  const [useFallbacks, setUseFallbacks] = useState<boolean>(true);
  const [useWordPressAPI, setUseWordPressAPI] = useState<boolean>(true);
  const [selectedImageForUpload, setSelectedImageForUpload] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showManualInstructionsDialog, setShowManualInstructionsDialog] = useState(false);

  // Função auxiliar para extrair URLs de imagens do texto
  const extractImageUrls = (text: string): string[] => {
    if (!text) return [];
    
    // Primeiro, verificar se há múltiplas URLs separadas por pipe
    if (text.includes('|')) {
      console.log('Detectadas múltiplas URLs separadas por pipe. Usando apenas a primeira URL.');
      // Separar por pipe e pegar apenas a primeira URL válida
      const urls = text.split('|').map(url => url.trim()).filter(Boolean);
      if (urls.length > 0) {
        // Retornar apenas a primeira URL em um array
        return [urls[0]];
      }
      return [];
    }
    
    // Padrão aprimorado para encontrar URLs individuais
    const urlPattern = /(https?:\/\/[^\s|,;()<>"']+)/g;
    
    // Encontra todas as URLs e retorna como array
    const matches = text.match(urlPattern);
    return matches || [];
  };

  // Função para verificar se a URL é uma imagem
  const isImageUrl = (url: string): boolean => {
    // Lista ampliada de extensões de imagens
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif', '.avif', '.ico'];
    
    // Verifica extensões no URL
    const lowerUrl = url.toLowerCase();
    if (imageExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(`${ext}?`) || lowerUrl.includes(`${ext}&`))) {
      return true;
    }
    
    // Verifica URLs com parâmetros que podem conter imagens
    if (lowerUrl.includes('image') || lowerUrl.includes('img') || lowerUrl.includes('photo') || 
        lowerUrl.includes('media') || lowerUrl.includes('upload') || lowerUrl.includes('content')) {
      return true;
    }
    
    return false;
  };

  // Extrair URLs de imagem ao carregar o componente
  useEffect(() => {
    extractImagesFromData();
  }, [data, imageUrlColumn, equipmentIdColumn]);

  // Extrair informações de imagens dos dados CSV
  const extractImagesFromData = () => {
    setProcessingStep('extracting');
    const imageStatusList: ImageStatus[] = [];
    
    data.forEach(item => {
      const id = item[equipmentIdColumn];
      const imageUrlsText = item[imageUrlColumn];
      
      if (!imageUrlsText) return;
      
      const imageUrls = extractImageUrls(imageUrlsText);
      
      imageUrls.forEach((url, index) => {
        if (isImageUrl(url)) {
          imageStatusList.push({
            url,
            id,
            status: 'pending',
            fileName: `${id}-${index}.jpg` // Nome de arquivo padrão
          });
        }
      });
    });
    
    setImageStatus(imageStatusList);
    
    // Se não houver imagens para processar
    if (imageStatusList.length === 0) {
      setError('Nenhuma URL de imagem válida encontrada nos dados.');
    }
  };

  // Processar imagens (download e upload)
  const processImages = async () => {
    if (imageStatus.length === 0) {
      setError('Nenhuma imagem para processar.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setCompleted(false);
    setProgress(0);
    
    try {
      await downloadImages();
      await uploadImagesToSupabase();
      
      // Calcula resultados
      const results: ProcessingResult = {
        totalImages: imageStatus.length,
        successCount: imageStatus.filter(img => img.status === 'success').length,
        errorCount: imageStatus.filter(img => img.status === 'error').length,
        imageData: imageStatus
          .filter(img => img.status === 'success' && img.storageUrl)
          .map(img => ({ id: img.id, storageUrl: img.storageUrl! }))
      };
      
      setCompleted(true);
      setProcessingStep('complete');
      onComplete?.(results);
    } catch (err) {
      console.error('Erro ao processar imagens:', err);
      setError('Ocorreu um erro durante o processamento das imagens. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  // Download das imagens
  const downloadImages = async () => {
    setProcessingStep('downloading');
    const updatedStatus = [...imageStatus];
    let processedCount = 0;
    
    // Criar tarefas de download para cada imagem
    const downloadTasks = updatedStatus.map((status, index) => {
      return async () => {
        try {
          // Atualizar status para processando
          updatedStatus[index] = { ...status, status: 'processing' };
          setImageStatus([...updatedStatus]);
          
          let fetchUrl = status.url;
          let blob: Blob | null = null;
          
          // Verifica se é uma URL do WordPress
          if (useWordPressAPI && isWordPressUrl(status.url)) {
            try {
              // Usa a API do WordPress para obter a URL direta da imagem
              const directImageUrl = await getWordPressImageUrl(status.url);
              console.log(`URL original: ${status.url}`);
              console.log(`URL direta do WordPress: ${directImageUrl}`);
              fetchUrl = directImageUrl;
            } catch (error) {
              console.warn(`Erro ao obter URL do WordPress: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
              // Mantém a URL original em caso de erro
            }
          } else if (useProxy && !isProxiedUrl(status.url)) {
            // Use proxy para contornar problemas de CORS apenas se não for WordPress
            fetchUrl = getProxiedImageUrl(status.url);
          }
          
          console.log(`Tentando baixar imagem: ${fetchUrl}`);
          
          // Tenta buscar a imagem 
          let response;
          
          try {
            response = await fetch(fetchUrl);
            if (response.ok) {
              blob = await response.blob();
            } else {
              throw new Error(`Falha ao baixar imagem: ${response.statusText}`);
            }
          } catch (error) {
            const fetchErr = error as Error;
            console.warn(`Erro ao baixar imagem: ${fetchErr.message}, tentando alternativas...`);
            
            // Se falhar, tenta com outros proxies
            if (useProxy && !isProxiedUrl(status.url)) {
              try {
                // Tenta o segundo proxy
                const alternateUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(status.url)}`;
                response = await fetch(alternateUrl);
                if (response.ok) {
                  blob = await response.blob();
                } else {
                  throw new Error(`Falha com proxy alternativo: ${response.statusText}`);
                }
              } catch (error) {
                try {
                  // Tenta o terceiro proxy
                  const thirdUrl = `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(status.url)}`;
                  response = await fetch(thirdUrl);
                  if (response.ok) {
                    blob = await response.blob();
                  } else {
                    throw new Error(`Falha com terceiro proxy: ${response.statusText}`);
                  }
                } catch (error) {
                  // Se falhar com todos os proxies e a opção de fallback estiver ativada
                  if (useFallbacks) {
                    try {
                      // Usar imagem de placeholder
                      const fallbackUrl = getFallbackImageUrl(status.id);
                      response = await fetch(fallbackUrl);
                      if (response.ok) {
                        blob = await response.blob();
                        console.log(`Usando imagem de placeholder para ${status.id}`);
                        updatedStatus[index].message = 'Usando imagem de placeholder (original bloqueada por CORS)';
                      } else {
                        throw new Error('Não foi possível carregar a imagem de placeholder');
                      }
                    } catch (error) {
                      const fallbackErr = error as Error;
                      throw new Error(`Não foi possível baixar a imagem: ${fallbackErr.message}`);
                    }
                  } else {
                    throw new Error(`Falha ao baixar imagem após tentar múltiplos proxies`);
                  }
                }
              }
            } else {
              throw new Error(`Falha ao baixar imagem: ${fetchErr.message}`);
            }
          }
          
          if (blob) {
            const localUrl = URL.createObjectURL(blob);
            
            // Atualiza status
            updatedStatus[index] = {
              ...status,
              status: 'success',
              localUrl,
              blob // Armazenar o blob para upload posterior
            };
          } else {
            throw new Error('Não foi possível obter a imagem em formato utilizável');
          }
          
        } catch (err) {
          // Em caso de erro
          updatedStatus[index] = {
            ...status,
            status: 'error',
            message: err instanceof Error ? err.message : 'Erro desconhecido'
          };
        }
        
        // Atualizar progresso
        processedCount++;
        setProgress(Math.floor((processedCount / updatedStatus.length) * 50)); // 50% do processo total
        setImageStatus([...updatedStatus]);
      };
    });
    
    // Executar downloads em lotes para evitar sobrecarga
    await promiseAllInBatches(downloadTasks, 2); // Reduzi para 2 para evitar muitas requisições simultâneas
    
    return updatedStatus;
  };

  // Upload das imagens para o Supabase
  const uploadImagesToSupabase = async () => {
    setProcessingStep('uploading');
    let processedCount = 0;
    const successfulImages = imageStatus.filter(img => img.status === 'success' && img.localUrl);
    const updatedStatus = [...imageStatus];
    
    // Criar tarefas de upload para cada imagem
    const uploadTasks = successfulImages.map((status) => {
      return async () => {
        const index = updatedStatus.findIndex(item => 
          item.id === status.id && item.url === status.url
        );
        
        if (index === -1) return;
        
        try {
          // Obter o blob da URL local
          let blob: Blob;
          
          if (status.blob) {
            blob = status.blob as Blob;
          } else {
            const response = await fetch(status.localUrl!);
            blob = await response.blob();
          }
          
          // Gerar um nome de arquivo único no Storage
          const fileName = `${status.id}/image-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          
          // Upload para o Supabase Storage
          const { data, error } = await supabase.storage
            .from('equipment-images')
            .upload(fileName, blob, {
              contentType: blob.type,
              upsert: false
            });
          
          if (error) throw error;
          
          // Obter a URL pública da imagem
          const { data: urlData } = supabase.storage
            .from('equipment-images')
            .getPublicUrl(fileName);
          
          // Atualizar status
          updatedStatus[index] = {
            ...status,
            storageUrl: urlData.publicUrl,
            message: 'Imagem processada com sucesso'
          };
          
        } catch (err) {
          // Em caso de erro
          updatedStatus[index] = {
            ...status,
            status: 'error',
            message: err instanceof Error ? err.message : 'Erro no upload'
          };
        }
        
        // Atualizar progresso
        processedCount++;
        setProgress(50 + Math.floor((processedCount / successfulImages.length) * 50)); // 50% a 100%
        setImageStatus([...updatedStatus]);
      };
    });
    
    // Executar uploads em lotes para evitar sobrecarga
    await promiseAllInBatches(uploadTasks, 3);
    
    return updatedStatus;
  };

  // Função para abrir navegador para download manual
  const openImageInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  // Função para lidar com upload manual de imagem
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || selectedImageForUpload === null) return;

    const file = files[0];
    const updatedStatus = [...imageStatus];
    
    try {
      // Criar URL local para o arquivo selecionado
      const localUrl = URL.createObjectURL(file);
      
      // Atualizar o status da imagem
      updatedStatus[selectedImageForUpload] = {
        ...updatedStatus[selectedImageForUpload],
        status: 'success',
        localUrl,
        blob: file,
        message: 'Imagem carregada manualmente'
      };
      
      setImageStatus(updatedStatus);
      setSelectedImageForUpload(null);
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      
      // Atualizar status com erro
      updatedStatus[selectedImageForUpload] = {
        ...updatedStatus[selectedImageForUpload],
        status: 'error',
        message: 'Erro ao processar arquivo local'
      };
      
      setImageStatus(updatedStatus);
      setSelectedImageForUpload(null);
    }
    
    // Limpar input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Função para iniciar o processo de upload manual de uma imagem
  const handleManualUpload = (index: number) => {
    setSelectedImageForUpload(index);
    
    // Acionar o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Renderizar visualização de imagens em grid
  const renderImagePreviews = () => {
    const successfulImages = imageStatus.filter(img => img.status === 'success' && img.localUrl);
    
    if (successfulImages.length === 0) {
      return (
        <Alert severity="info">
          Nenhuma imagem disponível para visualização.
        </Alert>
      );
    }
    
    return (
      <Grid container spacing={2}>
        {successfulImages.map((image, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={image.localUrl}
                alt={`Equipamento ${image.id}`}
              />
              <CardContent sx={{ p: 1 }}>
                <Typography variant="body2" noWrap>
                  ID: {image.id}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {image.status === 'success' ? 'Processada' : 'Pendente'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Renderizar lista de status de processamento
  const renderProcessingStatus = () => {
    return (
      <List dense className="max-h-60 overflow-y-auto border border-gray-200 rounded">
        {imageStatus.map((status, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider component="li" />}
            <ListItem>
              <ListItemIcon>
                {status.status === 'pending' ? (
                  <CircularProgress size={20} />
                ) : status.status === 'processing' ? (
                  <CircularProgress size={20} color="secondary" />
                ) : status.status === 'success' ? (
                  <Check className="text-green-500" />
                ) : (
                  <X className="text-red-500" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Tooltip title={status.url}>
                    <span>{status.url.substring(0, 40) + (status.url.length > 40 ? '...' : '')}</span>
                  </Tooltip>
                }
                secondary={
                  <>
                    <span>ID: {status.id}</span>
                    <br/>
                    <span>{status.message || getStatusMessage(status.status)}</span>
                  </>
                }
              />
              {status.status === 'success' && status.localUrl ? (
                <Tooltip title="Visualizar">
                  <IconButton 
                    size="small"
                    onClick={() => window.open(status.localUrl, '_blank')}
                  >
                    <Eye size={16} />
                  </IconButton>
                </Tooltip>
              ) : status.status === 'error' ? (
                <>
                  <Tooltip title="Abrir URL original">
                    <IconButton 
                      size="small"
                      onClick={() => openImageInNewTab(status.url)}
                    >
                      <ExternalLink size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Carregar imagem manualmente">
                    <IconButton 
                      size="small"
                      onClick={() => handleManualUpload(index)}
                    >
                      <FileUp size={16} />
                    </IconButton>
                  </Tooltip>
                </>
              ) : null}
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    );
  };

  // Obter mensagem baseada no status
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando processamento...';
      case 'processing': return 'Processando...';
      case 'success': return 'Processada com sucesso';
      case 'error': return 'Falha no processamento';
      default: return '';
    }
  };

  // Obter mensagem do progresso atual
  const getProgressMessage = () => {
    switch (processingStep) {
      case 'extracting': return 'Extraindo informações das imagens...';
      case 'downloading': return 'Baixando imagens...';
      case 'uploading': return 'Enviando imagens para o servidor...';
      case 'complete': return 'Processamento concluído!';
      default: return 'Processando...';
    }
  };

  // Função para adicionar URL manualmente
  const addManualUrl = () => {
    if (!manualUrl || !manualIdMapping) return;
    
    const exists = imageStatus.some(
      img => img.url === manualUrl && img.id === manualIdMapping
    );
    
    if (exists) {
      setError('Esta URL já foi adicionada para este ID');
      return;
    }
    
    const newStatus: ImageStatus = {
      url: manualUrl,
      id: manualIdMapping,
      status: 'pending',
      fileName: `${manualIdMapping}-manual-${Date.now()}.jpg`
    };
    
    setImageStatus(prev => [...prev, newStatus]);
    setManualUrl('');
    setShowManualUrlInput(false);
    setError(null);
  };

  return (
    <div className="w-full">
      <Typography variant="h6" className="mb-3">
        Processamento de Imagens
      </Typography>
      
      <Paper elevation={2} className="p-4 mb-4">
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="body1">
            {imageStatus.length} imagens foram encontradas nos dados.
            {imageStatus.some(img => img.url.includes('|')) && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Detectadas múltiplas imagens separadas por | em algumas células. Cada imagem será processada individualmente.
                </Typography>
              </Alert>
            )}
          </Typography>
          
          <Box className="flex gap-2">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowManualUrlInput(!showManualUrlInput)}
              startIcon={<Image />}
              size="small"
            >
              {showManualUrlInput ? 'Cancelar' : 'Adicionar URL Manualmente'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setShowPreview(!showPreview)}
              startIcon={<Eye />}
              size="small"
              disabled={!imageStatus.some(img => img.status === 'success' && img.localUrl)}
            >
              {showPreview ? 'Mostrar Lista' : 'Visualizar Imagens'}
            </Button>
            <Button
              variant="outlined"
              color="info"
              onClick={() => setShowManualInstructionsDialog(true)}
              startIcon={<Link2 />}
              size="small"
            >
              Instruções para CORS
            </Button>
          </Box>
        </Box>
        
        {showManualUrlInput && (
          <Box className="flex gap-2 mb-4 items-end">
            <TextField
              label="URL da Imagem"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              size="small"
              variant="outlined"
              fullWidth
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <TextField
              label="ID do Equipamento"
              value={manualIdMapping}
              onChange={(e) => setManualIdMapping(e.target.value)}
              size="small"
              variant="outlined"
              style={{ width: '200px' }}
            />
            <Button 
              variant="contained"
              onClick={addManualUrl}
              disabled={!manualUrl || !manualIdMapping}
            >
              Adicionar
            </Button>
          </Box>
        )}
        
        <Box className="flex flex-wrap items-center gap-2 mb-4">
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Download />}
            onClick={processImages}
            disabled={loading || imageStatus.length === 0}
          >
            {loading ? 'Processando...' : 'Processar Imagens'}
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshCw />}
            onClick={extractImagesFromData}
            disabled={loading || data.length === 0}
          >
            Recarregar URLs
          </Button>
          
          <FormControlLabel
            control={
              <Switch
                checked={useWordPressAPI}
                onChange={(e) => setUseWordPressAPI(e.target.checked)}
                disabled={loading}
              />
            }
            label="Usar API WordPress"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={useProxy}
                onChange={(e) => setUseProxy(e.target.checked)}
                disabled={loading}
              />
            }
            label="Usar Proxy CORS"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={useFallbacks}
                onChange={(e) => setUseFallbacks(e.target.checked)}
                disabled={loading}
              />
            }
            label="Usar imagens de fallback"
          />
        </Box>
        
        {error && (
          <Alert severity="error" className="mb-4">
            <AlertTitle>Erro</AlertTitle>
            {error}
          </Alert>
        )}
        
        <div className="mb-4">
          <Typography variant="body2">
            Foram encontradas {imageStatus.length} imagens nos dados importados.
            {imageStatus.filter(img => img.status === 'error').length > 0 && 
              ` ${imageStatus.filter(img => img.status === 'error').length} imagens com erros podem ser resolvidas com upload manual.`}
          </Typography>
        </div>
        
        {loading && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <Typography variant="body2" className="mb-1">
              {getProgressMessage()} ({progress}%)
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={processingStep === 'uploading' ? 'secondary' : 'primary'}
            />
          </Box>
        )}
        
        {completed && (
          <Alert severity="success" className="mb-4">
            <AlertTitle>Processamento Concluído</AlertTitle>
            <Typography variant="body2">
              {imageStatus.filter(img => img.status === 'success').length} de {imageStatus.length} imagens foram processadas com sucesso.
              {imageStatus.filter(img => img.status === 'error').length > 0 && 
                ` ${imageStatus.filter(img => img.status === 'error').length} imagens falharam durante o processamento.`}
            </Typography>
          </Alert>
        )}
        
        <Box className="mb-4">
          {showPreview ? renderImagePreviews() : renderProcessingStatus()}
        </Box>
        
        {/* Input para upload de arquivo escondido */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept="image/*"
        />
        
        {/* Dialog com instruções para CORS */}
        <Dialog 
          open={showManualInstructionsDialog} 
          onClose={() => setShowManualInstructionsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Como Resolver Problemas de CORS</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              O sistema está enfrentando restrições de CORS ao tentar baixar imagens do site seusite.com.br. Você tem as seguintes opções:
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              Opção 1: Download Manual e Upload
            </Typography>
            <Typography variant="body2" paragraph>
              1. Clique no ícone <ExternalLink size={16} /> para abrir a imagem original em uma nova aba
              2. Salve a imagem no seu computador (clique com botão direito → "Salvar imagem como...")
              3. Clique no ícone <FileUp size={16} /> na linha da imagem com erro
              4. Selecione a imagem que você salvou no seu computador
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              Opção 2: Usar Imagens de Fallback
            </Typography>
            <Typography variant="body2" paragraph>
              Ative a opção "Usar imagens de fallback" para usar imagens genéricas quando não for possível 
              baixar as imagens originais. Esta opção é útil quando você precisa apenas dos dados e as imagens 
              específicas não são essenciais.
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              Opção 3: Solução Definitiva (para Administradores de TI)
            </Typography>
            <Typography variant="body2" paragraph>
              Para uma solução definitiva, seria necessário:
              <ol>
                <li>Configurar cabeçalhos CORS adequados no servidor web que hospeda as imagens.</li>
                <li>Ou implementar um proxy CORS no mesmo domínio da aplicação.</li>
                <li>Ou migrar todas as imagens para o storage do Supabase ou outro serviço que permita CORS.</li>
              </ol>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowManualInstructionsDialog(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
};

export default ImageProcessor; 