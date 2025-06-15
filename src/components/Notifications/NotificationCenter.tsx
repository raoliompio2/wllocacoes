import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Bell, Check, AlertCircle, Filter, EyeOff, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyUnread, setShowOnlyUnread] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Disparar evento personalizado para atualizar o contador no menu
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Disparar evento personalizado para atualizar o contador no menu
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Filtrar notificações baseado no estado showOnlyUnread
  const filteredNotifications = showOnlyUnread 
    ? notifications.filter(n => !n.read) 
    : notifications;

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center">
          <Bell className="h-6 w-6 mr-2" />
          Notificações {unreadCount > 0 && <span className="ml-2 text-sm bg-red-500 text-white rounded-full px-2 py-0.5">{unreadCount}</span>}
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
          >
            {showOnlyUnread ? <Eye size={16} className="mr-1" /> : <EyeOff size={16} className="mr-1" />}
            {showOnlyUnread ? 'Mostrar todas' : 'Mostrar não lidas'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Check size={16} className="mr-1" />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            {showOnlyUnread 
              ? "Todas as notificações foram lidas" 
              : "Nenhuma notificação encontrada"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Marcar como lida"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;