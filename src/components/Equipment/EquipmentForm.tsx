import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
  Chip,
} from '@mui/material';
import { Equipment } from '../../types/types';
import { supabase } from '../../utils/supabaseClient';
import { isUserOwner, canUserEditEquipment, getCurrentUser } from '../../utils/authHelpers';
import FormField from '../common/FormField';
import ImageUploadField from '../common/ImageUploadField';
import SelectField from '../common/SelectField';
import PriceField from '../common/PriceField';
import { useNotification } from '../../context/NotificationContext';

interface EquipmentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  equipment?: Equipment;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  open,
  onClose,
  onSave,
  equipment,
}) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    category: equipment?.category || '',
    construction_phase_id: equipment?.construction_phase_id || '',
    description: equipment?.description || '',
    enablePricing: equipment?.daily_rate !== null || false,
    daily_rate: equipment?.daily_rate || '',
    weekly_rate: equipment?.weekly_rate || '',
    monthly_rate: equipment?.monthly_rate || '',
    image: equipment?.image || '',
    technical_specs: equipment?.technical_specs || {},
  });

  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [constructionPhases, setConstructionPhases] = useState<Array<{ value: string; label: string }>>([]);
  const [accessories, setAccessories] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewPhase, setShowNewPhase] = useState(false);
  const [showNewAccessory, setShowNewAccessory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newPhase, setNewPhase] = useState('');
  const [newAccessory, setNewAccessory] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSpec, setNewSpec] = useState({ name: '', value: '' });
  const [technicalSpecs, setTechnicalSpecs] = useState<Array<{ name: string; value: string }>>(
    Object.entries(equipment?.technical_specs || {}).map(([name, value]) => ({ 
      name, 
      value: value as string 
    }))
  );

  useEffect(() => {
    fetchInitialData();
  }, [equipment?.id]);

  const fetchInitialData = async () => {
    try {
      const [categoriesData, phasesData, accessoriesData] = await Promise.all([
        supabase.from('categories').select('id, name'),
        supabase.from('construction_phases').select('id, name'),
        supabase.from('accessories').select('id, name'),
      ]);

      if (categoriesData.error) throw categoriesData.error;
      if (phasesData.error) throw phasesData.error;
      if (accessoriesData.error) throw accessoriesData.error;

      setCategories(
        (categoriesData.data || []).map((cat) => ({
          value: cat.id,
          label: cat.name,
        }))
      );

      setConstructionPhases(
        (phasesData.data || []).map((phase) => ({
          value: phase.id,
          label: phase.name,
        }))
      );

      setAccessories(
        (accessoriesData.data || []).map((acc) => ({
          value: acc.id,
          label: acc.name,
        }))
      );

      if (equipment?.id) {
        const { data: selectedAccessoriesData } = await supabase
          .from('equipment_accessories')
          .select('accessory_id')
          .eq('equipment_id', equipment.id);

        if (selectedAccessoriesData) {
          setSelectedAccessories(selectedAccessoriesData.map(item => item.accessory_id));
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err);
      setError('Falha ao carregar dados do formulário');
    }
  };

  const handleAddCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ id: crypto.randomUUID(), name: newCategory }])
        .select()
        .single();

      if (error) throw error;
      
      setCategories([...categories, { value: data.id, label: data.name }]);
      setFormData({ ...formData, category: data.id });
      setNewCategory('');
      setShowNewCategory(false);
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      setError('Falha ao adicionar categoria');
    }
  };

  const handleAddPhase = async () => {
    try {
      const { data, error } = await supabase
        .from('construction_phases')
        .insert([{ name: newPhase }])
        .select()
        .single();

      if (error) throw error;

      setConstructionPhases([...constructionPhases, { value: data.id, label: data.name }]);
      setFormData({ ...formData, construction_phase_id: data.id });
      setNewPhase('');
      setShowNewPhase(false);
    } catch (err) {
      console.error('Erro ao adicionar fase:', err);
      setError('Falha ao adicionar fase de construção');
    }
  };

  const handleAddAccessory = async () => {
    try {
      const { data, error } = await supabase
        .from('accessories')
        .insert([{ name: newAccessory }])
        .select()
        .single();

      if (error) throw error;

      setAccessories([...accessories, { value: data.id, label: data.name }]);
      setSelectedAccessories([...selectedAccessories, data.id]);
      setNewAccessory('');
      setShowNewAccessory(false);
    } catch (err) {
      console.error('Erro ao adicionar acessório:', err);
      setError('Falha ao adicionar acessório');
    }
  };

  const handleAddTechnicalSpec = () => {
    if (newSpec.name && newSpec.value) {
      setTechnicalSpecs([...technicalSpecs, newSpec]);
      setNewSpec({ name: '', value: '' });
    }
  };

  const handleRemoveTechnicalSpec = (index: number) => {
    setTechnicalSpecs(technicalSpecs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Verificar se o usuário é proprietário
      const isOwner = await isUserOwner();
      if (!isOwner) {
        throw new Error('Apenas proprietários podem gerenciar equipamentos');
      }

      // Se for uma edição, verificar se o usuário tem permissão para editar este equipamento
      if (equipment?.id) {
        const canEdit = await canUserEditEquipment(equipment.id);
        if (!canEdit) {
          throw new Error('Você não tem permissão para editar este equipamento');
        }
      }

      // Obter o usuário atual
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      // Preparar os dados técnicos
      const technical_specs = technicalSpecs.reduce((acc, spec) => ({
        ...acc,
        [spec.name]: spec.value
      }), {});

      // Preparar os dados do equipamento
      const equipmentData = {
        name: formData.name,
        category: formData.category,
        construction_phase_id: formData.construction_phase_id || null,
        description: formData.description || null,
        daily_rate: formData.enablePricing ? parseFloat(formData.daily_rate as string) : null,
        weekly_rate: formData.enablePricing ? parseFloat(formData.weekly_rate as string) : null,
        monthly_rate: formData.enablePricing ? parseFloat(formData.monthly_rate as string) : null,
        technical_specs,
        user_id: user.id,  // Garantir que user_id esteja presente
      };

      // Validações de dados básicas
      if (!equipmentData.name || !equipmentData.category) {
        throw new Error('Nome e categoria são campos obrigatórios');
      }

      let savedEquipment;

      // Salvar o equipamento (inserção ou atualização)
      try {
        if (equipment?.id) {
          const { data, error: updateError } = await supabase
            .from('equipment')
            .update(equipmentData)
            .eq('id', equipment.id)
            .select()
            .single();

          if (updateError) {
            console.error('Erro ao atualizar equipamento:', updateError);
            throw new Error(`Erro ao atualizar equipamento: ${updateError.message}`);
          }
          
          savedEquipment = data;
        } else {
          const { data, error: insertError } = await supabase
            .from('equipment')
            .insert([equipmentData])
            .select()
            .single();

          if (insertError) {
            console.error('Erro ao inserir equipamento:', insertError);
            throw new Error(`Erro ao inserir equipamento: ${insertError.message}`);
          }
          
          savedEquipment = data;
        }
      } catch (dbError: any) {
        console.error('Erro de banco de dados:', dbError);
        throw new Error(`Erro ao salvar equipamento: ${dbError.message}`);
      }

      // Atualizar acessórios (remover todos e reinserir)
      try {
        if (equipment?.id) {
          const { error: deleteAccessoriesError } = await supabase
            .from('equipment_accessories')
            .delete()
            .eq('equipment_id', equipment.id);

          if (deleteAccessoriesError) throw deleteAccessoriesError;
        }

        if (selectedAccessories.length > 0) {
          const accessoryRecords = selectedAccessories.map(accessoryId => ({
            equipment_id: savedEquipment.id,
            accessory_id: accessoryId,
          }));

          const { error: accessoryError } = await supabase
            .from('equipment_accessories')
            .insert(accessoryRecords);

          if (accessoryError) throw accessoryError;
        }
      } catch (accessoryError: any) {
        console.error('Erro ao salvar acessórios:', accessoryError);
        showNotification('warning', `Acessórios podem não ter sido salvos corretamente: ${accessoryError.message}`);
        // Continua o fluxo mesmo com erro nos acessórios
      }

      // Processar uploads de imagens
      if (mainImage || images.length > 0) {
        const equipmentId = savedEquipment.id;
        
        if (mainImage) {
          try {
            const fileSizeInMB = mainImage.size / (1024 * 1024);
            if (fileSizeInMB > 5) {
              throw new Error('A imagem principal não pode exceder 5MB');
            }

            const mainImagePath = `equipment/${equipmentId}/main-${Date.now()}`;
            const { error: mainImageError } = await supabase.storage
              .from('images')
              .upload(mainImagePath, mainImage, {
                cacheControl: '3600',
                upsert: true
              });

            if (mainImageError) throw mainImageError;

            const { data: { publicUrl: mainImageUrl } } = supabase.storage
              .from('images')
              .getPublicUrl(mainImagePath);

            const { error: imageUpdateError } = await supabase
              .from('equipment')
              .update({ image: mainImageUrl })
              .eq('id', equipmentId);

            if (imageUpdateError) throw imageUpdateError;
          } catch (imgErr: any) {
            console.error('Erro ao salvar imagem principal:', imgErr);
            showNotification('warning', `A imagem principal não foi salva: ${imgErr.message}`);
            // Não interrompe o fluxo completo se apenas o upload falhar
          }
        }

        for (const image of images) {
          try {
            const fileSizeInMB = image.size / (1024 * 1024);
            if (fileSizeInMB > 5) {
              showNotification('warning', `Imagem "${image.name}" ignorada: tamanho excede 5MB`);
              continue;
            }

            const imagePath = `equipment/${equipmentId}/gallery-${Date.now()}-${image.name}`;
            const { error: uploadError } = await supabase.storage
              .from('images')
              .upload(imagePath, image, {
                cacheControl: '3600',
                upsert: true
              });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('images')
              .getPublicUrl(imagePath);

            const { error: galleryError } = await supabase
              .from('equipment_images')
              .insert({
                equipment_id: equipmentId,
                url: publicUrl,
                is_primary: false,
              });

            if (galleryError) throw galleryError;
          } catch (imgErr: any) {
            console.error(`Erro ao salvar imagem ${image.name}:`, imgErr);
            showNotification('warning', `Imagem "${image.name}" não foi salva: ${imgErr.message}`);
            // Continua tentando as próximas imagens mesmo que uma falhe
          }
        }
      }

      showNotification('success', equipment?.id 
        ? 'Equipamento atualizado com sucesso' 
        : 'Equipamento cadastrado com sucesso'
      );
      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving equipment:', err);
      
      // Verificar se o erro está relacionado à extensão do Chrome (overrideMethod)
      if (err.message && err.message.includes('overrideMethod')) {
        showNotification('error', 'Erro causado por extensão do navegador. Desative extensões que possam interferir com formulários ou use o modo anônimo.');
        setError('Este erro pode ser causado por uma extensão do navegador. Tente desabilitar extensões ou usar o modo anônimo.');
      } else {
        showNotification('error', `Erro ao salvar equipamento: ${err.message}`);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {equipment ? 'Editar Equipamento' : 'Novo Equipamento'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Box mb={3} p={2} bgcolor="error.main" color="error.contrastText" borderRadius={1}>
              <Typography>{error}</Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormField
                label="Nome do Equipamento"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <SelectField
                label="Categoria"
                options={categories}
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value })}
                onAddNew={() => setShowNewCategory(true)}
                required
              />
              {showNewCategory && (
                <Box mt={2} className="flex gap-2">
                  <FormField
                    label="Nova Categoria"
                    value={newCategory}
                    onChange={setNewCategory}
                  />
                  <Button onClick={handleAddCategory} variant="contained">
                    Adicionar
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <SelectField
                label="Fase da Obra"
                options={constructionPhases}
                value={formData.construction_phase_id}
                onChange={(value) => setFormData({ ...formData, construction_phase_id: value })}
                onAddNew={() => setShowNewPhase(true)}
                required
              />
              {showNewPhase && (
                <Box mt={2} className="flex gap-2">
                  <FormField
                    label="Nova Fase"
                    value={newPhase}
                    onChange={setNewPhase}
                  />
                  <Button onClick={handleAddPhase} variant="contained">
                    Adicionar
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <SelectField
                label="Acessórios"
                options={accessories}
                value={selectedAccessories}
                onChange={(value) => setSelectedAccessories(Array.isArray(value) ? value : [value])}
                onAddNew={() => setShowNewAccessory(true)}
                multiple
              />
              {showNewAccessory && (
                <Box mt={2} className="flex gap-2">
                  <FormField
                    label="Novo Acessório"
                    value={newAccessory}
                    onChange={setNewAccessory}
                  />
                  <Button onClick={handleAddAccessory} variant="contained">
                    Adicionar
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <FormField
                label="Descrição"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enablePricing}
                    onChange={(e) => setFormData({ ...formData, enablePricing: e.target.checked })}
                  />
                }
                label="Habilitar Precificação"
              />
            </Grid>

            {formData.enablePricing && (
              <Grid item xs={12} container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <PriceField
                    label="Valor Diária"
                    value={formData.daily_rate}
                    onChange={(value) => setFormData({ ...formData, daily_rate: value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <PriceField
                    label="Valor Semanal"
                    value={formData.weekly_rate}
                    onChange={(value) => setFormData({ ...formData, weekly_rate: value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <PriceField
                    label="Valor Mensal"
                    value={formData.monthly_rate}
                    onChange={(value) => setFormData({ ...formData, monthly_rate: value })}
                  />
                </Grid>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Especificações Técnicas
              </Typography>
              <Box className="flex gap-2 mb-4">
                <FormField
                  label="Nome da Especificação"
                  value={newSpec.name}
                  onChange={(value) => setNewSpec({ ...newSpec, name: value })}
                />
                <FormField
                  label="Valor"
                  value={newSpec.value}
                  onChange={(value) => setNewSpec({ ...newSpec, value: value })}
                />
                <Button
                  onClick={handleAddTechnicalSpec}
                  variant="contained"
                  disabled={!newSpec.name || !newSpec.value}
                  className="h-[56px]"
                >
                  Adicionar
                </Button>
              </Box>
              <Box className="flex flex-wrap gap-2">
                {technicalSpecs.map((spec, index) => (
                  <Chip
                    key={index}
                    label={`${spec.name}: ${spec.value}`}
                    onDelete={() => handleRemoveTechnicalSpec(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Imagens
              </Typography>
              <ImageUploadField
                onImageSelect={([file]) => setMainImage(file)}
                currentImages={equipment?.image ? [equipment.image] : []}
                label="Imagem Principal"
              />
              <ImageUploadField
                onImageSelect={setImages}
                currentImages={equipment?.equipment_images?.map(img => img.url) || []}
                label="Galeria de Imagens"
                multiple
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EquipmentForm;