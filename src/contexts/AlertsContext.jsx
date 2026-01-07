import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AlertsContext = createContext();

export function AlertsProvider({ children }) {
  // Alertas personalizadas del usuario
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('nomad-alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Notificaciones activas para mostrar
  const [notifications, setNotifications] = useState([]);

  // Permiso de notificaciones del navegador
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  useEffect(() => {
    localStorage.setItem('nomad-alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Solicitar permiso de notificaciones
  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return false;

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission === 'granted';
  };

  // Crear alerta personalizada
  const createAlert = (alert) => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      createdAt: Date.now(),
      active: true,
      ...alert
    };
    setAlerts(prev => [...prev, newAlert]);
    return newAlert;
  };

  // Eliminar alerta
  const deleteAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Toggle alerta activa/inactiva
  const toggleAlert = (alertId) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, active: !a.active } : a
    ));
  };

  // Verificar si un deal coincide con alguna alerta
  const checkDealAgainstAlerts = useCallback((deal) => {
    const activeAlerts = alerts.filter(a => a.active);

    for (const alert of activeAlerts) {
      let matches = true;

      // Verificar destino
      if (alert.destination && alert.destination !== 'any') {
        const dealDest = (deal.destinationName || deal.location || '').toLowerCase();
        if (!dealDest.includes(alert.destination.toLowerCase())) {
          matches = false;
        }
      }

      // Verificar precio máximo
      if (alert.maxPrice && deal.price > alert.maxPrice) {
        matches = false;
      }

      // Verificar descuento mínimo
      if (alert.minDiscount && deal.discountPercent < alert.minDiscount) {
        matches = false;
      }

      // Verificar tipo
      if (alert.type && alert.type !== 'all' && deal.type !== alert.type) {
        matches = false;
      }

      if (matches) {
        return { matches: true, alert };
      }
    }

    return { matches: false, alert: null };
  }, [alerts]);

  // Mostrar notificación del navegador
  const showBrowserNotification = (title, body, icon) => {
    if (notificationPermission === 'granted') {
      new Notification(title, { body, icon: icon || '/assets/isotipo-dark.svg' });
    }
  };

  // Agregar notificación in-app
  const addNotification = (notification) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      createdAt: Date.now(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Max 50 notificaciones
    return newNotif;
  };

  // Marcar notificación como leída
  const markAsRead = (notifId) => {
    setNotifications(prev => prev.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    ));
  };

  // Limpiar notificaciones
  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AlertsContext.Provider value={{
      alerts,
      createAlert,
      deleteAlert,
      toggleAlert,
      checkDealAgainstAlerts,
      notifications,
      addNotification,
      markAsRead,
      clearNotifications,
      unreadCount,
      notificationPermission,
      requestNotificationPermission,
      showBrowserNotification
    }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}
