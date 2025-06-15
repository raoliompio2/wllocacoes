import React, { useState } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { ImagePlus, X } from 'lucide-react';

interface ImageUploadFieldProps {
  onImageSelect: (files: File[]) => void;
  onImageRemove?: (index: number) => void;
  currentImages?: string[];
  label?: string;
  multiple?: boolean;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  onImageSelect,
  onImageRemove,
  currentImages = [],
  label = 'Enviar Imagem',
  multiple = false,
}) => {
  const [previews, setPreviews] = useState<string[]>(currentImages);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImageSelect(files);
      
      // Create previews for all selected files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemove = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (onImageRemove) {
      onImageRemove(index);
    }
  };

  return (
    <Box className="mb-4">
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="image-upload"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {previews.map((preview, index) => (
          <Box key={index} className="relative">
            <img
              src={preview}
              alt={`Imagem ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
            <IconButton
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-white hover:bg-gray-100"
              size="small"
            >
              <X className="h-4 w-4" />
            </IconButton>
          </Box>
        ))}
        
        <label htmlFor="image-upload">
          <Button
            component="span"
            variant="outlined"
            startIcon={<ImagePlus />}
            fullWidth
            className="h-48"
          >
            <Typography variant="body1">
              {multiple ? 'Adicionar Imagens' : label}
            </Typography>
          </Button>
        </label>
      </div>
    </Box>
  );
};

export default ImageUploadField;