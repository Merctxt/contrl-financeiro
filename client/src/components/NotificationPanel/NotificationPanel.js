import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { FiBell, FiAlertCircle, FiAlertTriangle, FiInfo, FiTarget, FiX } from 'react-icons/fi';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [triggers, setTriggers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasActiveNotifications, setHasActiveNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    // Carrega notificações lidas do localStorage
    const read = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    setReadNotifications(read);
  }, []);

  useEffect(() => {
    if (token) {
      loadTriggers();
      // Atualiza a cada 10 minutos
      const interval = setInterval(loadTriggers, 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [token, readNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadTriggers = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await api.getNotificationTriggers(token);
      if (data.triggers) {
        setTriggers(data.triggers);
        
        // Verifica se há notificações ativas (não lidas)
        const notifications = getNotificationsList(data.triggers);
        const unreadNotifications = notifications.filter(n => !readNotifications.includes(n.id));
        setHasActiveNotifications(unreadNotifications.length > 0);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    const updated = [...readNotifications, notificationId];
    setReadNotifications(updated);
    localStorage.setItem('readNotifications', JSON.stringify(updated));
    
    // Atualiza badge
    if (triggers) {
      const notifications = getNotificationsList(triggers);
      const unreadNotifications = notifications.filter(n => !updated.includes(n.id));
      setHasActiveNotifications(unreadNotifications.length > 0);
    }
  };

  const getNotificationsList = (triggersData) => {
    const notifications = [];

    // Sem transações recentes (3 dias)
    if (triggersData.noRecentTransactions.active) {
      notifications.push({
        id: `no-transactions-${triggersData.noRecentTransactions.daysSinceLastTransaction}`,
        type: triggersData.noRecentTransactions.type,
        title: 'Registre suas transações',
        message: triggersData.noRecentTransactions.message,
        icon: getNotificationIcon(triggersData.noRecentTransactions.type)
      });
    }

    // Orçamento apertado (80%+ da renda)
    if (triggersData.budgetTight.active) {
      notifications.push({
        id: `budget-tight-${triggersData.budgetTight.percentage}`,
        type: triggersData.budgetTight.type,
        title: 'Orçamento Apertado',
        message: triggersData.budgetTight.message,
        icon: getNotificationIcon(triggersData.budgetTight.type)
      });
    }

    return notifications;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
        return <FiAlertCircle />;
      case 'warning':
        return <FiAlertTriangle />;
      case 'success':
        return <FiTarget />;
      default:
        return <FiInfo />;
    }
  };

  const renderNotifications = () => {
    if (!triggers) return null;

    const allNotifications = getNotificationsList(triggers);
    // Filtra apenas as não lidas
    const unreadNotifications = allNotifications.filter(n => !readNotifications.includes(n.id));
    
    return unreadNotifications;
  };

  const notifications = renderNotifications();
  const notificationCount = notifications?.length || 0;

  return (
    <div className="notification-panel-container" ref={panelRef}>
      <button 
        className={`notification-bell ${notificationCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notificações"
      >
        <FiBell />
        {notificationCount > 0 && (
          <span className="notification-badge">{notificationCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h3>
              <FiBell /> Notificações
            </h3>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
              title="Fechar"
            >
              <FiX />
            </button>
          </div>

          <div className="notification-panel-content">
            {loading ? (
              <div className="notification-loading">
                <div className="spinner"></div>
                <p>Carregando...</p>
              </div>
            ) : notificationCount === 0 ? (
              <div className="notification-empty">
                <FiBell size={48} />
                <p>Nenhuma notificação no momento</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item notification-${notification.type}`}
                    onClick={() => markAsRead(notification.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
