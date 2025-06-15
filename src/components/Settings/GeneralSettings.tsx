import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Shield, Lock } from 'lucide-react';
import { Switch, FormControlLabel } from '@mui/material';

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  booking_reminders: boolean;
  maintenance_alerts: boolean;
}

interface PrivacySettings {
  show_profile: boolean;
  show_contact: boolean;
  show_reviews: boolean;
}

const GeneralSettings: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { isOwner } = useTheme();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    booking_reminders: true,
    maintenance_alerts: true
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    show_profile: true,
    show_contact: true,
    show_reviews: true
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_settings, privacy_settings')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          if (data.notification_settings) {
            setNotifications(data.notification_settings);
          }
          if (data.privacy_settings) {
            setPrivacy(data.privacy_settings);
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };

    loadSettings();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_settings: notifications,
          privacy_settings: privacy,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      showNotification('success', 'Configurações salvas com sucesso');
    } catch (err) {
      console.error('Error saving settings:', err);
      showNotification('error', 'Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-semibold">Notificações</h3>
        </div>
        
        <div className="space-y-4">
          <FormControlLabel
            control={
              <Switch
                checked={notifications.email_notifications}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  email_notifications: e.target.checked
                }))}
              />
            }
            label="Notificações por Email"
          />

          <FormControlLabel
            control={
              <Switch
                checked={notifications.push_notifications}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  push_notifications: e.target.checked
                }))}
              />
            }
            label="Notificações Push"
          />

          <FormControlLabel
            control={
              <Switch
                checked={notifications.booking_reminders}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  booking_reminders: e.target.checked
                }))}
              />
            }
            label="Lembretes de Reservas"
          />

          <FormControlLabel
            control={
              <Switch
                checked={notifications.maintenance_alerts}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  maintenance_alerts: e.target.checked
                }))}
              />
            }
            label="Alertas de Manutenção"
          />
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-semibold">Privacidade</h3>
        </div>
        
        <div className="space-y-4">
          <FormControlLabel
            control={
              <Switch
                checked={privacy.show_profile}
                onChange={(e) => setPrivacy(prev => ({
                  ...prev,
                  show_profile: e.target.checked
                }))}
              />
            }
            label="Mostrar Perfil Publicamente"
          />

          <FormControlLabel
            control={
              <Switch
                checked={privacy.show_contact}
                onChange={(e) => setPrivacy(prev => ({
                  ...prev,
                  show_contact: e.target.checked
                }))}
              />
            }
            label="Mostrar Informações de Contato"
          />

          <FormControlLabel
            control={
              <Switch
                checked={privacy.show_reviews}
                onChange={(e) => setPrivacy(prev => ({
                  ...prev,
                  show_reviews: e.target.checked
                }))}
              />
            }
            label="Mostrar Avaliações"
          />
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Lock className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-semibold">Segurança</h3>
        </div>
        
        <div className="space-y-4">
          <button
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {/* Implementar alteração de senha */}}
          >
            Alterar Senha
          </button>

          <button
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            onClick={() => {/* Implementar exclusão de conta */}}
          >
            Excluir Conta
          </button>
        </div>
      </div>

      <div className="md:col-span-2 flex justify-end">
        <button
          onClick={saveSettings}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-white ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;