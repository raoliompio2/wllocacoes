import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Equipment } from '../../types/types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image, 
  Search, 
  SlidersHorizontal, 
  Star, 
  Package2,
  Eye, 
  EyeOff, 
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import EquipmentForm from './EquipmentForm';
import ImageUpload from './ImageUpload';
import CSVImporter from './CSVImporter';
import { formatCurrency } from '../../utils/formatters';
import { TextField, Select, MenuItem, FormControl, InputLabel, Button, IconButton, Box, Typography } from '@mui/material';
import { useNotification } from '../../context/NotificationContext';
import ConnectionDiagnostic from '../common/ConnectionDiagnostic';

const EquipmentManagement: React.FC = () => {
  const { showNotification } = useNotification();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null | undefined>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'price'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showCSVImporter, setShowCSVImporter] = useState(false);

  useEffect(() => {
    fetchEquipment();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name');
      
      if (error) throw error;
      setCategories(data.map(cat => cat.name));
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          categories (
            id,
            name
          ),
          equipment_images (
            id,
            url,
            is_primary
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEquipment(data || []);
    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err);
      setError('Falha ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;

    try {
      // Verificar reservas associadas
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('equipment_id', id);
      
      if (bookingsError) throw bookingsError;
      
      // Se existem reservas, mostrar aviso
      if (bookingsData && bookingsData.length > 0) {
        showNotification('error', `Não é possível excluir este equipamento pois existem ${bookingsData.length} reserva(s) associada(s). Você deve primeiro excluir as reservas manualmente ou alterar seu status.`);
        return;
      }
      
      // Verificar orçamentos associados
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budget_requests')
        .select('id')
        .eq('equipment_id', id);
      
      if (budgetsError) throw budgetsError;
      
      // Se existem orçamentos, excluir
      if (budgetsData && budgetsData.length > 0) {
        const { error: deleteBudgetsError } = await supabase
          .from('budget_requests')
          .delete()
          .eq('equipment_id', id);
        
        if (deleteBudgetsError) throw deleteBudgetsError;
      }
      
      // Excluir imagens associadas
      const { error: deleteImagesError } = await supabase
        .from('equipment_images')
        .delete()
        .eq('equipment_id', id);
      
      if (deleteImagesError) throw deleteImagesError;
      
      // Finalmente excluir o equipamento
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEquipment(prev => prev.filter(item => item.id !== id));
      showNotification('success', 'Equipamento excluído com sucesso');
    } catch (err) {
      console.error('Error deleting equipment:', err);
      showNotification('error', 'Erro ao excluir equipamento. Verifique o console para mais detalhes.');
    }
  };

  const handleEdit = (item: Equipment) => {
    setSelectedEquipment(item);
    setShowForm(true);
  };

  const handleImageUpload = (item: Equipment) => {
    setSelectedEquipment(item);
    setShowImageUpload(true);
  };

  const filteredEquipment = equipment
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || item.categories?.name === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.average_rating - a.average_rating;
        case 'price':
          return (a.daily_rate || 0) - (b.daily_rate || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Gerenciar Equipamentos</h2>
        <div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlusCircle />}
            onClick={() => setShowForm(true)}
            sx={{ mr: 1 }}
          >
            Novo Equipamento
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<FileSpreadsheet />}
            onClick={() => setShowCSVImporter(true)}
            sx={{ mr: 1 }}
          >
            Importar CSV
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={showDiagnostic ? <EyeOff /> : <Eye />}
            onClick={() => setShowDiagnostic(!showDiagnostic)}
          >
            {showDiagnostic ? 'Ocultar Diagnóstico' : 'Exibir Diagnóstico'}
          </Button>
        </div>
      </div>

      {showDiagnostic && <ConnectionDiagnostic />}

      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar equipamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            startIcon={<SlidersHorizontal />}
          >
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Categoria"
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'price')}
                label="Ordenar por"
              >
                <MenuItem value="name">Nome</MenuItem>
                <MenuItem value="rating">Avaliação</MenuItem>
                <MenuItem value="price">Preço</MenuItem>
              </Select>
            </FormControl>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEquipment.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Package2 className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.available ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.name}
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">{item.categories?.name || 'Sem categoria'}</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600">
                    {item.average_rating.toFixed(1)} ({item.total_reviews})
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-500">Diária:</span>
                <span className="ml-2 text-lg font-semibold text-blue-600">
                  {formatCurrency(item.daily_rate || 0)}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <IconButton
                  onClick={() => handleImageUpload(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Image className="h-5 w-5" />
                </IconButton>
                <IconButton
                  onClick={() => handleEdit(item)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <Edit className="h-5 w-5" />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-5 w-5" />
                </IconButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <EquipmentForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedEquipment(null);
          }}
          onSave={() => {
            setShowForm(false);
            setSelectedEquipment(null);
            fetchEquipment();
          }}
          equipment={selectedEquipment ? selectedEquipment : undefined}
        />
      )}

      {showImageUpload && selectedEquipment && (
        <ImageUpload
          open={showImageUpload}
          onClose={() => {
            setShowImageUpload(false);
            setSelectedEquipment(null);
          }}
          onSave={() => {
            setShowImageUpload(false);
            setSelectedEquipment(null);
            fetchEquipment();
          }}
          equipmentId={selectedEquipment.id}
        />
      )}

      {showCSVImporter && (
        <CSVImporter
          open={showCSVImporter}
          onClose={() => {
            setShowCSVImporter(false);
            fetchEquipment();
          }}
        />
      )}
    </div>
  );
};

export default EquipmentManagement;