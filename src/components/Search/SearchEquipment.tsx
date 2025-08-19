import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { Search, MapPin, Star, Filter, SlidersHorizontal, Package2, Calendar, PenTool as Tool, Info, Clock, Phone, Mail, User } from 'lucide-react';
import { Equipment } from '../../types/types';
import { formatCurrency } from '../../utils/formatters';
import { trackSearch, trackEquipmentView, trackWhatsAppClick } from '../../utils/analytics';

const SearchEquipment: React.FC = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating_desc'>('rating_desc');
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name');
        
        if (error) throw error;
        setCategories(data.map(cat => cat.name));
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        let query = supabase
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
            ),
            equipment_availability (
              start_date,
              end_date,
              status
            ),
            technical_specs,
            profiles!equipment_user_id_fkey (
              id,
              name,
              phone,
              whatsapp,
              email,
              address
            )
          `)
          .gte('daily_rate', priceRange[0])
          .lte('daily_rate', priceRange[1]);

        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }

        switch (sortBy) {
          case 'price_asc':
            query = query.order('daily_rate', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('daily_rate', { ascending: false });
            break;
          case 'rating_desc':
            query = query.order('average_rating', { ascending: false });
            break;
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // Filter available equipment after fetching
        const availableEquipment = data?.filter(item => item.available) || [];
        setEquipment(availableEquipment);
      } catch (err) {
        console.error('Error fetching equipment:', err);
        setError('Failed to load equipment');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  const getWhatsAppLink = (whatsapp: string | null, equipmentName: string) => {
    // Usar o número da WL Locações
    const whatsappNumber = '8598610-1415';
    
    const message = encodeURIComponent(
      `Olá! Gostaria de mais informações sobre o equipamento ${equipmentName}`
    );
    
    return `https://wa.me/55${whatsappNumber}?text=${message}`;
  };

  // Função para criar um slug a partir do nome do equipamento
  const createSlug = (name: string) => {
    return encodeURIComponent(
      name
        .toLowerCase()
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/--+/g, '-') // Remove múltiplos hífens consecutivos
        .trim() // Remove espaços no início e fim
    );
  };

  const handleEquipmentClick = (item: Equipment) => {
    // Usar a rota correta com o slug do nome em vez do ID
    navigate(`/equipamento/${createSlug(item.name)}`);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-lg space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faixa de Preço (Diária)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <span>até</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={priceRange[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price_asc' | 'price_desc' | 'rating_desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating_desc">Melhor avaliação</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleEquipmentClick(item)}
            >
              <div className="relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                    <Package2 className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full shadow">
                    {!item.daily_rate || isNaN(parseFloat(item.daily_rate)) 
                      ? "Sob consulta" 
                      : `${formatCurrency(parseFloat(item.daily_rate) || 0)}/dia`}
                  </span>
                </div>
                {item.available && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full shadow">
                      Disponível
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{item.categories?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="font-medium">{item.average_rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="space-y-3">
                  {item.technical_specs && Object.entries(item.technical_specs).length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Tool className="h-4 w-4 mr-1" />
                        Especificações
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(item.technical_specs).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-gray-500">{key}:</span>
                            <span className="ml-1 text-gray-900">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.profiles && (
                    <div className="border-t border-gray-100 pt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Locador</h4>
                      <div className="space-y-2">
                        {item.profiles.name && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>{item.profiles.name}</span>
                          </div>
                        )}
                        {item.profiles.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{item.profiles.phone}</span>
                          </div>
                        )}
                        {item.profiles.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span>{item.profiles.email}</span>
                          </div>
                        )}
                        {item.profiles.whatsapp && (
                          <a
                            href={getWhatsAppLink(item.profiles.whatsapp, item.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 mr-2 fill-current"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Chamar no WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Mínimo 1 dia</span>
                      </div>
                      <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquipmentClick(item);
                        }}
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {equipment.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <Package2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhum equipamento encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchEquipment;