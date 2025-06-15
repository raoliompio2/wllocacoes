import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Equipment } from '../../types/types';
import { formatCurrency } from '../../utils/formatters';
import BookingForm from '../Bookings/BookingForm';
import ReviewList from '../Reviews/ReviewList';
import { MapPin, Calendar, DollarSign, Star, Package2, PenTool as Tool } from 'lucide-react';

interface EquipmentDetailsProps {
  equipmentId: string;
  onClose: () => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipmentId, onClose }) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const { data, error } = await supabase
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
          .eq('id', equipmentId)
          .single();

        if (error) throw error;
        setEquipment(data);
      } catch (err) {
        console.error('Error fetching equipment:', err);
        setError('Failed to load equipment details');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [equipmentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="text-center text-red-600 py-8">
        {error || 'Equipment not found'}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="relative h-96">
        {equipment.equipment_images && equipment.equipment_images.length > 0 ? (
          <>
            <img
              src={equipment.equipment_images[currentImageIndex].url}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
            {equipment.equipment_images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {equipment.equipment_images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Package2 className="h-20 w-20 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{equipment.name}</h2>
            <div className="flex items-center mt-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 text-gray-600">
                {equipment.average_rating.toFixed(1)} ({equipment.total_reviews} avaliações)
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Diária a partir de</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(equipment.daily_rate || 0)}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{equipment.category}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>Disponível para reservas</span>
          </div>

          <div className="flex items-center text-gray-600">
            <DollarSign className="h-5 w-5 mr-2" />
            <div>
              <p>Diária: {formatCurrency(equipment.daily_rate || 0)}</p>
              {equipment.weekly_rate && (
                <p>Semanal: {formatCurrency(equipment.weekly_rate)}</p>
              )}
              {equipment.monthly_rate && (
                <p>Mensal: {formatCurrency(equipment.monthly_rate)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Descrição</h3>
          <p className="text-gray-600">{equipment.description}</p>
        </div>

        {equipment.specifications && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Especificações</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {Object.entries(equipment.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {equipment.equipment_maintenance && equipment.equipment_maintenance.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Histórico de Manutenção</h3>
            <div className="space-y-2">
              {equipment.equipment_maintenance.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center">
                    <Tool className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium">{maintenance.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(maintenance.maintenance_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    maintenance.status === 'concluída'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {maintenance.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          {showBookingForm ? (
            <BookingForm
              equipment={equipment}
              onSubmit={() => {
                setShowBookingForm(false);
                onClose();
              }}
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

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Avaliações</h3>
          <ReviewList equipmentId={equipment.id} />
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;