import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { X as CloseIcon, Upload, Image } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

interface ImageUploadProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  equipmentId: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  open,
  onClose,
  onSave,
  equipmentId,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setLoading(true);
    setError(null);

    try {
      for (const [index, file] of files.entries()) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `equipment/${equipmentId}/${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        // Save image reference to database
        const { error: dbError } = await supabase
          .from('equipment_images')
          .insert({
            equipment_id: equipmentId,
            url: publicUrl,
            is_primary: index === 0,
          });

        if (dbError) throw dbError;
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload de Imagens</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            mb: 2,
          }}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<Upload />}
              sx={{ mb: 2 }}
            >
              Selecionar Imagens
            </Button>
          </label>
          <Typography variant="body2" color="text.secondary">
            Arraste as imagens aqui ou clique para selecionar
          </Typography>
        </Box>

        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Imagens selecionadas:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.map((file, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      '&:hover': { bgcolor: 'error.light' },
                    }}
                  >
                    <CloseIcon size={16} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {error && (
          <Box mt={2} color="error.main">
            {error}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          color="primary"
          disabled={loading || files.length === 0}
          startIcon={<Image />}
        >
          {loading ? 'Enviando...' : 'Enviar Imagens'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUpload;