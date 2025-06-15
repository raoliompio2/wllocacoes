import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { MaintenanceItem } from '../../types/types';
import { Calendar as CalendarIcon, PenTool as Tool, AlertCircle } from 'lucide-react';
import MaintenanceForm from './MaintenanceForm';
import { formatCurrency } from '../../utils/formatters';

interface Equipment {
  id: string;
  name: string;
}

const MaintenanceCalendar: React.FC = () => {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch equipment
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name');

      if (equipmentError) throw equipmentError;
      setEquipment(equipmentData || []);

      // Fetch maintenance items
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('equipment_maintenance')
        .select(`
          *,
          equipment:equipment_id (
            name
          )
        `)
        .order('maintenance_date', { ascending: true });

      if (maintenanceError) throw maintenanceError;
      setMaintenanceItems(maintenanceData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceSuccess = () => {
    setShowForm(false);
    setSelectedEquipment(null);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'concluída':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = (equipmentId: string | null) => {
    if (!equipmentId) {
      setError('ID do equipamento inválido');
      return;
    }
    setSelectedEquipment(equipmentId);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center">
          <CalendarIcon className="h-6 w-6 mr-2" />
          Calendário de Manutenção
        </h2>
        <button
          onClick={() => {
            if (equipment.length > 0) {
              setSelectedEquipment(equipment[0].id);
              setShowForm(true);
            } else {
              setError('Nenhum equipamento disponível');
            }
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Tool className="h-5 w-5 mr-2" />
          Nova Manutenção
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maintenanceItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.equipment?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(item.maintenance_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {item.cost && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Custo:</span>
                    <span className="ml-2">{formatCurrency(item.cost)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleUpdateStatus(item.equipment_id)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors"
                  disabled={!item.equipment_id}
                >
                  Atualizar Status
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && selectedEquipment && (
        <MaintenanceForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedEquipment(null);
          }}
          onSave={handleMaintenanceSuccess}
          equipmentId={selectedEquipment}
        />
      )}
    </div>
  );
};

export default MaintenanceCalendar;