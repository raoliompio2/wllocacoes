import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Box, Button, Dialog, TextField, IconButton } from '@mui/material';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import ImageUploadField from '../common/ImageUploadField';

interface TechnicalSpec {
  name: string;
  value: string;
}

interface Accessory {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  technical_specs: TechnicalSpec[];
  created_at: string;
}

const AccessoriesManagement: React.FC = () => {
  const { showNotification } = useNotification();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [technicalSpecs, setTechnicalSpecs] = useState<TechnicalSpec[]>([]);
  const [newSpec, setNewSpec] = useState<TechnicalSpec>({ name: '', value: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    try {
      const { data, error } = await supabase
        .from('accessories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccessories(data || []);
    } catch (err) {
      console.error('Error fetching accessories:', err);
      setError('Failed to load accessories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image;

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `accessories/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const accessoryData = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        technical_specs: technicalSpecs,
      };

      if (selectedAccessory) {
        const { error } = await supabase
          .from('accessories')
          .update(accessoryData)
          .eq('id', selectedAccessory.id);

        if (error) throw error;
        showNotification('success', 'Acessório atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('accessories')
          .insert([accessoryData]);

        if (error) throw error;
        showNotification('success', 'Acessório criado com sucesso');
      }

      setOpenDialog(false);
      setSelectedAccessory(null);
      setFormData({ name: '', description: '', image: '' });
      setTechnicalSpecs([]);
      setSelectedImage(null);
      fetchAccessories();
    } catch (err) {
      console.error('Error saving accessory:', err);
      showNotification('error', 'Erro ao salvar acessório');
    }
  };

  const handleEdit = (accessory: Accessory) => {
    setSelectedAccessory(accessory);
    setFormData({
      name: accessory.name,
      description: accessory.description || '',
      image: accessory.image || '',
    });
    setTechnicalSpecs(accessory.technical_specs || []);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este acessório?')) return;

    try {
      const { error } = await supabase
        .from('accessories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAccessories(prev => prev.filter(item => item.id !== id));
      showNotification('success', 'Acessório excluído com sucesso');
    } catch (err) {
      console.error('Error deleting accessory:', err);
      showNotification('error', 'Erro ao excluir acessório');
    }
  };

  const handleAddSpec = () => {
    if (newSpec.name && newSpec.value) {
      setTechnicalSpecs([...technicalSpecs, newSpec]);
      setNewSpec({ name: '', value: '' });
    }
  };

  const handleRemoveSpec = (index: number) => {
    setTechnicalSpecs(technicalSpecs.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gerenciar Acessórios</h2>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => {
            setSelectedAccessory(null);
            setFormData({ name: '', description: '', image: '' });
            setTechnicalSpecs([]);
            setOpenDialog(true);
          }}
        >
          Novo Acessório
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessories.map((accessory) => (
          <div
            key={accessory.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {accessory.image ? (
              <img
                src={accessory.image}
                alt={accessory.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{accessory.name}</h3>
              {accessory.description && (
                <p className="text-gray-600 mb-4">{accessory.description}</p>
              )}

              {accessory.technical_specs && accessory.technical_specs.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Especificações Técnicas:</h4>
                  <div className="space-y-1">
                    {accessory.technical_specs.map((spec, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{spec.name}:</span>
                        <span className="font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <IconButton
                  onClick={() => handleEdit(accessory)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-5 w-5" />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(accessory.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-5 w-5" />
                </IconButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedAccessory ? 'Editar Acessório' : 'Novo Acessório'}
          </h2>
          
          <TextField
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
            className="mb-4"
          />
          
          <TextField
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={4}
            className="mb-4"
          />

          <ImageUploadField
            onImageSelect={([file]) => setSelectedImage(file)}
            currentImages={formData.image ? [formData.image] : []}
            label="Imagem do Acessório"
          />

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Especificações Técnicas</h3>
            <div className="flex gap-2 mb-2">
              <TextField
                label="Nome"
                value={newSpec.name}
                onChange={(e) => setNewSpec({ ...newSpec, name: e.target.value })}
                size="small"
              />
              <TextField
                label="Valor"
                value={newSpec.value}
                onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                size="small"
              />
              <Button
                onClick={handleAddSpec}
                variant="outlined"
                disabled={!newSpec.name || !newSpec.value}
              >
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {technicalSpecs.map((spec, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <div>
                    <span className="font-medium">{spec.name}:</span>
                    <span className="ml-2">{spec.value}</span>
                  </div>
                  <IconButton
                    onClick={() => handleRemoveSpec(index)}
                    size="small"
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Salvar
            </Button>
          </div>
        </Box>
      </Dialog>
    </div>
  );
};

export default AccessoriesManagement;