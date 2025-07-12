import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, Info, Bell, BellRing } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, onClose, action }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };
  
  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor()}
        border rounded-lg shadow-lg p-4 mb-3 max-w-md
        backdrop-blur-sm
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface NotificationBellProps {
  onClick: () => void;
  unreadCount: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onClick, unreadCount }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);
  
  return (
    <button
      onClick={onClick}
      className={`
        relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800
        transition-all duration-200
        ${isAnimating ? 'animate-pulse' : ''}
      `}
    >
      {unreadCount > 0 ? (
        <BellRing className="w-6 h-6 text-blue-600" />
      ) : (
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      )}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, removeNotification, clearAllNotifications } = useApp();
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Notifications
          </h3>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0
                ${notification.read ? 'opacity-60' : 'bg-blue-50 dark:bg-blue-900/20'}
                hover:bg-gray-50 dark:hover:bg-gray-700
              `}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-2">
                    {notification.action && (
                      <button
                        onClick={() => {
                          notification.action!.onClick();
                          markNotificationAsRead(notification.id);
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                      >
                        {notification.action.label}
                      </button>
                    )}
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const [toastNotifications, setToastNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>>([]);
  
  useEffect(() => {
    // Show new notifications as toasts
    const newNotifications = notifications.filter(n => !n.read);
    setToastNotifications(newNotifications);
  }, [notifications]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastNotifications.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToastNotifications(prev => prev.filter(t => t.id !== toast.id))}
            action={toast.action}
          />
        ))}
      </div>
      
      {/* Notification Bell */}
      <div className="relative">
        <NotificationBell
          onClick={() => setShowDropdown(!showDropdown)}
          unreadCount={unreadCount}
        />
        <NotificationDropdown
          isOpen={showDropdown}
          onClose={() => setShowDropdown(false)}
        />
      </div>
      
      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
};

export default NotificationSystem;