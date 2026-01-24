import React, { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  ChevronRight,
  X
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  color?: string;
  action_url?: string | null;
  created_at: string;
}

interface UnreadResponse {
  count: number;
  notifications: Notification[];
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnreadNotifications();
    
    const interval = setInterval(fetchUnreadNotifications, 30000);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      const data: UnreadResponse = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notificationId: string, actionUrl?: string | null) => {
    try {
      await router.post(`/notifications/${notificationId}/mark-read`);
      
      if (actionUrl) {
        router.visit(actionUrl);
      }
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await router.post('/notifications/mark-all-read');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string, icon?: string) => {
    const iconName = icon?.toLowerCase() || 'bell';
    
    switch (iconName) {
      case 'exclamation-triangle':
      case 'alert-triangle':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'check-circle':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'file-text':
      case 'file-alt':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'dollar-sign':
      case 'money-bill-wave':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'receipt':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (color?: string): string => {
    const colors: Record<string, string> = {
      danger: 'bg-red-50 border-red-200',
      warning: 'bg-yellow-50 border-yellow-200',
      success: 'bg-green-50 border-green-200',
      info: 'bg-blue-50 border-blue-200',
      primary: 'bg-indigo-50 border-indigo-200',
    };
    return colors[color || ''] || 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="relative">
        <button className="relative p-2 text-gray-600 hover:text-gray-900">
          <Bell className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b ${getNotificationColor(notification.color)} hover:bg-white transition-colors cursor-pointer`}
                  onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type || '', notification.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {notification.created_at}
                        </span>
                        {notification.action_url && (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-200">
            <Link
              href="/notifications"
              className="block w-full text-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;