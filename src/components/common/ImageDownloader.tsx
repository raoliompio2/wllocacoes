import * as React from 'react';
import { useState } from 'react';
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
  AlertTitle
} from '@mui/material';
import { Download, Check, X, Image } from 'lucide-react';
import JSZip from 'jszip';
import { supabase } from '../../utils/supabaseClient';

interface ImageDownloaderProps {
  data: any[];
  imageUrlColumn: string;
  equipmentIdColumn: string;
  onDownloadComplete?: (downloadedImages: { id: string, url: string }[]) => void;
}

interface ImageDownloadStatus {
  url: string;
  id: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  fileName?: string;
}

const ImageDownloader: React.FC<ImageDownloaderProps> = ({
  data,
  imageUrlColumn,
  equipmentIdColumn,
  onDownloadComplete
}) => {
  const [downloadStatus, setDownloadStatus] = useState<ImageDownloadStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    
    // Padrão para encontrar URLs (melhorado)
    const urlPattern = /(https?:\/\/[^\s|,;()<>"']+)/g;
    
    // Encontra todas as URLs e retorna como array
    const matches = text.match(urlPattern);
    return matches || [];
  };

  // Função para verificar se a URL é uma imagem
  const isImageUrl = (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  };

  // Função para baixar as imagens
  const downloadImages = async () => {
    setLoading(true);
    setError(null);
    setCompleted(false);

    const imageStatuses: ImageDownloadStatus[] = [];
    const successfulDownloads: { id: string, url: string }[] = [];
    
    // Preparar lista de imagens para download
    data.forEach(item => {
      const id = item[equipmentIdColumn];
      const imageUrlsText = item[imageUrlColumn];
      
      if (!imageUrlsText) return;
      
      const imageUrls = extractImageUrls(imageUrlsText);
      
      imageUrls.forEach((url, index) => {
        if (isImageUrl(url)) {
          imageStatuses.push({
            url,
            id,
            status: 'pending',
            fileName: `${id}-${index}.jpg` // Nome de arquivo padrão
          });
        }
      });
    });
    
    setDownloadStatus(imageStatuses);
    
    // Se não houver imagens para baixar
    if (imageStatuses.length === 0) {
      setError('Nenhuma URL de imagem válida encontrada nos dados.');
      setLoading(false);
      return;
    }

    const zip = new JSZip();
    const imagesFolder = zip.folder('images');
    
    // Baixar cada imagem
    for (let i = 0; i < imageStatuses.length; i++) {
      const status = imageStatuses[i];
      
      try {
        // Tenta buscar a imagem
        const response = await fetch(status.url);
        
        if (!response.ok) {
          throw new Error(`Falha ao baixar imagem: ${response.statusText}`);
        }
        
        // Converte para blob
        const blob = await response.blob();
        
        // Adiciona ao zip
        if (imagesFolder) {
          imagesFolder.file(status.fileName || `image-${i}.jpg`, blob);
        }
        
        // Atualiza status
        imageStatuses[i] = {
          ...status,
          status: 'success'
        };
        
        successfulDownloads.push({
          id: status.id,
          url: URL.createObjectURL(blob)
        });
        
      } catch (err) {
        // Em caso de erro
        imageStatuses[i] = {
          ...status,
          status: 'error',
          message: err instanceof Error ? err.message : 'Erro desconhecido'
        };
      }
      
      // Atualiza a lista na UI
      setDownloadStatus([...imageStatuses]);
    }

    // Gera o arquivo zip
    if (successfulDownloads.length > 0) {
      try {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'equipment_images.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Callback com as imagens baixadas
        onDownloadComplete?.(successfulDownloads);
      } catch (err) {
        setError('Erro ao gerar arquivo ZIP');
        console.error('Erro ao gerar arquivo ZIP:', err);
      }
    } else {
      setError('Nenhuma imagem foi baixada com sucesso.');
    }
    
    setLoading(false);
    setCompleted(true);
  };
  
  // Função para enviar as imagens para o Supabase Storage
  const uploadToSupabase = async () => {
    if (!completed || downloadStatus.filter(s => s.status === 'success').length === 0) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const updatedStatus = [...downloadStatus];
    
    for (let i = 0; i < updatedStatus.length; i++) {
      const status = updatedStatus[i];
      
      if (status.status !== 'success') continue;
      
      try {
        // Busca a imagem novamente
        const response = await fetch(status.url);
        
        if (!response.ok) {
          throw new Error(`Falha ao buscar imagem: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        // Realiza o upload para o Supabase Storage
        const { data, error } = await supabase.storage
          .from('images')
          .upload(`equipment/${status.id}/main-${Date.now()}`, blob, {
            contentType: blob.type,
            upsert: false
          });
        
        if (error) {
          throw error;
        }
        
        // Atualiza o status
        updatedStatus[i] = {
          ...status,
          message: 'Enviado para o Supabase'
        };
        
      } catch (err) {
        updatedStatus[i] = {
          ...status,
          status: 'error',
          message: err instanceof Error ? err.message : 'Erro no upload'
        };
      }
      
      setDownloadStatus([...updatedStatus]);
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full">
      <Typography variant="h6" className="mb-3">
        Download de Imagens
      </Typography>
      
      <Paper elevation={2} className="p-4 mb-4">
        {error && (
          <Alert severity="error" className="mb-4">
            <AlertTitle>Erro</AlertTitle>
            {error}
          </Alert>
        )}
        
        <div className="mb-4">
          <Typography variant="body2">
            Esta ferramenta irá buscar e baixar todas as imagens encontradas na coluna {imageUrlColumn}.
            As imagens serão baixadas e agrupadas em um arquivo ZIP.
          </Typography>
        </div>
        
        {downloadStatus.length > 0 && (
          <div className="mb-4">
            <Typography variant="subtitle2" className="mb-2">
              Status do Download:
            </Typography>
            
            <List dense className="max-h-60 overflow-y-auto border border-gray-200 rounded">
              {downloadStatus.map((status, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem>
                    <ListItemIcon>
                      {status.status === 'pending' ? (
                        <CircularProgress size={20} />
                      ) : status.status === 'success' ? (
                        <Check className="text-green-500" />
                      ) : (
                        <X className="text-red-500" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={status.url.substring(0, 50) + (status.url.length > 50 ? '...' : '')} 
                      secondary={status.message || (status.status === 'pending' ? 'Aguardando...' : status.status === 'success' ? 'Sucesso' : 'Falha')}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download />}
            onClick={downloadImages}
            disabled={loading}
          >
            {loading && downloadStatus.length === 0 ? (
              <>
                <CircularProgress size={20} className="mr-2" />
                Processando...
              </>
            ) : 'Baixar Imagens'}
          </Button>
          
          {completed && downloadStatus.filter(s => s.status === 'success').length > 0 && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Image />}
              onClick={uploadToSupabase}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} className="mr-2" />
                  Enviando...
                </>
              ) : 'Enviar para Supabase'}
            </Button>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default ImageDownloader; 