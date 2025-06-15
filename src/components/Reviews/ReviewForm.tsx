import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Star, Send } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface ReviewFormProps {
  bookingId: string;
  equipmentId: string;
  onSuccess: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  bookingId,
  equipmentId,
  onSuccess,
}) => {
  const { showNotification } = useNotification();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          equipment_id: equipmentId,
          rating,
          comment,
        });

      if (reviewError) throw reviewError;

      showNotification('success', 'Avaliação enviada com sucesso');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      showNotification('error', 'Erro ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avaliação
        </label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={
                  value <= (hoveredRating || rating)
                    ? 'h-6 w-6 text-yellow-400 fill-current'
                    : 'h-6 w-6 text-gray-300'
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Comentário
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Conte sua experiência com o equipamento..."
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          loading || rating === 0
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Enviando...
          </div>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Enviar Avaliação
          </>
        )}
      </button>
    </form>
  );
};

export default ReviewForm;