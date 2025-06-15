import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, type, message }]);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideNotification(id);
    }, 5000);
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-center p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-600' :
              notification.type === 'error' ? 'bg-red-600' :
              notification.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
            style={{ minWidth: '300px', maxWidth: '400px' }}
          >
            <div className="flex-shrink-0 mr-3">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
              {notification.type === 'error' && <XCircle className="h-5 w-5" />}
              {notification.type === 'warning' && <AlertCircle className="h-5 w-5" />}
              {notification.type === 'info' && <Info className="h-5 w-5" />}
            </div>
            <div className="flex-1 mr-2">{notification.message}</div>
            <button
              onClick={() => hideNotification(notification.id)}
              className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};