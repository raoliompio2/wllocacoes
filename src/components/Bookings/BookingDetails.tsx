import React, { useState } from 'react';
import { BookingWithEquipment } from '../../types/types';
import { formatCurrency } from '../../utils/formatters';
import ReviewForm from '../Reviews/ReviewForm';
import { Calendar, Package2, Clock, MapPin, CreditCard } from 'lucide-react';

interface BookingDetailsProps {
  booking: BookingWithEquipment;
  onReviewSubmit: () => void;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ booking, onReviewSubmit }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    onReviewSubmit();
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900">
            {booking.equipment?.name}
          </h3>
          <span className={["px-3 py-1 rounded-full text-sm font-medium", getStatusColor(booking.status)].join(" ")}>
            {booking.status}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>
              {new Date(booking.start_date).toLocaleDateString('pt-BR')} até{' '}
              {new Date(booking.end_date).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <Package2 className="h-5 w-5 mr-2" />
            <span>Equipamento: {booking.equipment?.name}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>Categoria: {booking.equipment?.category}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            <span>
              Criado em: {new Date(booking.created_at || '').toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <CreditCard className="h-5 w-5 mr-2" />
            <span>Total: {formatCurrency(booking.total_price || 0)}</span>
          </div>
        </div>

        {booking.status === 'finalizado' && (
          <div className="mt-6">
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Avaliar Equipamento
              </button>
            ) : (
              <div className="mt-4">
                <h4 className="text-lg font-medium mb-4">Sua Avaliação</h4>
                <ReviewForm
                  bookingId={booking.id}
                  equipmentId={booking.equipment_id}
                  onSuccess={handleReviewSuccess}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;