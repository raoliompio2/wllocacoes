import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { Equipment } from '../../types/types';
import { formatCurrency } from '../../utils/formatters';
import BookingForm from '../Bookings/BookingForm';
import { Package2, ChevronLeft, ChevronRight, Star, Calendar, DollarSign } from 'lucide-react';

interface OwnerProfile {
  name: string;
  avatar_url: string | null;
}

interface RentalHistory {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
}

const EquipmentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [rentalHistory, setRentalHistory] = useState<RentalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchEquipmentData = async () => {
      try {
        if (!id) return;

        // First, fetch equipment data with related tables
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select(`
            *,
            equipment_images (
              id,
              url,
              is_primary
            ),
            equipment_maintenance (
              id,
              description,
              maintenance_date,
              status
            )
          `)
          .eq('id', id)
          .single();

        if (equipmentError) throw equipmentError;

        // Then, fetch the owner's profile using the user_id
        if (equipmentData?.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', equipmentData.user_id)
            .maybeSingle();

          if (profileError) {
            console.warn('Error fetching owner profile:', profileError);
            setOwnerProfile({ name: 'Unknown Owner', avatar_url: null });
          } else if (profileData) {
            setOwnerProfile(profileData);
          } else {
            console.warn('No profile found for user:', equipmentData.user_id);
            setOwnerProfile({ name: 'Unknown Owner', avatar_url: null });
          }

          // Fetch rental history
          const { data: historyData, error: historyError } = await supabase
            .from('bookings')
            .select('id, start_date, end_date, total_price, status, created_at')
            .eq('equipment_id', id)
            .order('created_at', { ascending: false });

          if (historyError) {
            console.warn('Error fetching rental history:', historyError);
          } else {
            setRentalHistory(historyData || []);
          }
        }

        setEquipment(equipmentData);
      } catch (err) {
        console.error('Error fetching equipment:', err);
        setError('Failed to load equipment details');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error || 'Equipment not found'}
      </div>
    );
  }

  const images = equipment.equipment_images || [];
  const maintenanceHistory = equipment.equipment_maintenance || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'finalizado':
        return 'bg-gray-100 text-gray-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Image Gallery */}
        <div className="relative h-96">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex].url}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Package2 className="h-20 w-20 text-gray-400" />
            </div>
          )}
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
              <div className="flex items-center mt-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-gray-600">
                  {equipment.average_rating?.toFixed(1) || '0.0'} ({equipment.total_reviews || 0} avaliações)
                </span>
              </div>
              {ownerProfile && (
                <div className="mt-2 text-gray-600">
                  <p>Proprietário: {ownerProfile.name}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">A partir de</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(equipment.daily_rate || 0)}
                <span className="text-sm text-gray-500">/dia</span>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Descrição</h2>
                <p className="text-gray-600">{equipment.description}</p>
              </div>

              {equipment.technical_specs && Object.keys(equipment.technical_specs).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Especificações Técnicas</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {Object.entries(equipment.technical_specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Valores</h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Diária</span>
                    <span className="font-semibold">{formatCurrency(equipment.daily_rate || 0)}</span>
                  </div>
                  {equipment.weekly_rate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Semanal</span>
                      <span className="font-semibold">{formatCurrency(equipment.weekly_rate)}</span>
                    </div>
                  )}
                  {equipment.monthly_rate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Mensal</span>
                      <span className="font-semibold">{formatCurrency(equipment.monthly_rate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {maintenanceHistory.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Histórico de Manutenção</h2>
                  <div className="space-y-3">
                    {maintenanceHistory.map((maintenance) => (
                      <div
                        key={maintenance.id}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{maintenance.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(maintenance.maintenance_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            maintenance.status === 'concluída'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {maintenance.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rental History */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Histórico de Locações</h2>
            <div className="space-y-4">
              {rentalHistory.map((rental) => (
                <div
                  key={rental.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(rental.start_date).toLocaleDateString()} até{' '}
                          {new Date(rental.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>{formatCurrency(rental.total_price)}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rental.status)}`}>
                      {rental.status}
                    </span>
                  </div>
                </div>
              ))}

              {rentalHistory.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package2 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Nenhuma locação registrada</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="mt-8">
            {showBookingForm ? (
              <BookingForm
                equipment={equipment}
                onSubmit={() => setShowBookingForm(false)}
                onCancel={() => setShowBookingForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reservar Agora
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentProfile;