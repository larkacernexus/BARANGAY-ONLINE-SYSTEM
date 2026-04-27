// resources/js/components/notifications/admin-notification-center.tsx

import { Bell, CheckCircle2, X, User, ExternalLink, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Notification interface matching your backend
export interface Notification {
  id: string;
  type: string;
  data: any;
  read_at: string | null;
  created_at: string;
  created_at_diff: string;
  is_fee_notification: boolean;
  message: string;
  title: string;
  resident_name?: string;
  formatted_amount?: string;
  fee_code?: string;
  fee_type?: string;
  link?: string;
  url?: string;
  is_system?: boolean;
  notification_type?: 'fee' | 'payment' | 'report' | 'clearance' | 'system';
}

// Props interface
interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
  userType?: 'admin' | 'staff' | 'kagawad';
}

// Notification Item Component
const NotificationItem = ({ 
  notification, 
  onClick 
}: { 
  notification: Notification; 
  onClick: () => void;
}) => {
  const getIcon = () => {
    if (notification.is_fee_notification || notification.notification_type === 'fee') return CheckCircle2;
    if (notification.notification_type === 'payment') return CheckCircle;
    if (notification.notification_type === 'report') return AlertCircle;
    if (notification.notification_type === 'clearance') return Info;
    return Bell;
  };

  const getIconColor = () => {
    if (notification.is_fee_notification || notification.notification_type === 'fee') return 'text-emerald-500';
    if (notification.notification_type === 'payment') return 'text-green-500';
    if (notification.notification_type === 'report') return 'text-orange-500';
    if (notification.notification_type === 'clearance') return 'text-blue-500';
    return 'text-purple-500';
  };

  const getBgGradient = () => {
    if (notification.read_at) return '';
    
    if (notification.is_fee_notification || notification.notification_type === 'fee') {
      return 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30';
    }
    if (notification.notification_type === 'payment') {
      return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30';
    }
    if (notification.notification_type === 'report') {
      return 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900/30 dark:hover:to-amber-900/30';
    }
    return 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30';
  };

  const Icon = getIcon();

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl transition-all duration-200 relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98]",
        notification.read_at 
          ? 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900/50' 
          : cn("bg-gradient-to-r", getBgGradient())
      )}
    >
      {/* Unread indicator */}
      {!notification.read_at && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full animate-pulse" />
      )}

      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm",
          getIconColor()
        )}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {notification.title}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {notification.created_at_diff}
            </span>
          </div>
          
          {notification.resident_name && (
            <div className="flex items-center gap-1 mb-1">
              <User className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-purple-600 dark:text-purple-400">
                From: {notification.resident_name}
              </span>
            </div>
          )}
          
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {notification.message}
          </p>
          
          {notification.formatted_amount && notification.formatted_amount !== '₱0.00' && (
            <div className="mt-2">
              <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                {notification.formatted_amount}
              </span>
            </div>
          )}

          {notification.fee_code && (
            <div className="mt-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                {notification.fee_code}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </button>
  );
};

// Main Notification Center Component
export function NotificationCenter({
  notifications,
  unreadCount,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
  userType = 'admin'
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isNavigating, setIsNavigating] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);

  // Update local state when props change
  useEffect(() => {
    setLocalNotifications(notifications);
    setLocalUnreadCount(unreadCount);
  }, [notifications, unreadCount]);

  const filteredNotifications = localNotifications.filter(n => 
    filter === 'all' || (filter === 'unread' && !n.read_at)
  );

  const handleNotificationClick = (notification: Notification) => {
    // Prevent double clicks while navigating
    if (isNavigating) return;

    // Mark as read if unread
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
      
      // Update local state immediately for better UX
      setLocalNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setLocalUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Check for link
    const notificationLink = notification.link || notification.url;
    
    if (notificationLink && notificationLink !== '#') {
      let targetUrl = notificationLink;
      
      // Handle empty or invalid links
      if (targetUrl === '#' || targetUrl === '') {
        onClose();
        return;
      }
      
      // Extract path from full URL
      try {
        if (targetUrl.startsWith('http')) {
          const urlObj = new URL(targetUrl);
          targetUrl = urlObj.pathname + urlObj.search + urlObj.hash;
        }
      } catch (e) {
        // Not a valid URL, use as is
      }
      
      // Remove prefixes and ensure leading slash
      targetUrl = targetUrl.replace(/^\/?(admin|portal)\//, '');
      if (!targetUrl.startsWith('/')) {
        targetUrl = '/' + targetUrl;
      }
      
      // Add base path based on user type
      let basePath = '';
      if (userType === 'admin' || userType === 'staff' || userType === 'kagawad') {
        basePath = '/admin';
      }
      
      targetUrl = basePath + targetUrl;
      
      // Close sheet and navigate
      onClose();
      setIsNavigating(true);
      
      setTimeout(() => {
        router.visit(targetUrl, {
          onFinish: () => setIsNavigating(false)
        });
      }, 150);
    } else {
      onClose();
    }
  };

  const handleMarkAllAsReadClick = () => {
    onMarkAllAsRead();
    
    // Update local state immediately for better UX
    setLocalNotifications(prev =>
      prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
    );
    setLocalUnreadCount(0);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Notifications
                {localUnreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {localUnreadCount} new
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription>
                Stay updated with system activities
              </SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Tabs */}
          {localNotifications.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="flex-1 transition-all"
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
                className="flex-1 transition-all"
              >
                Unread
                {localUnreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                    {localUnreadCount}
                  </span>
                )}
              </Button>
            </div>
          )}
        </SheetHeader>

        <div className="mt-4 space-y-2 max-h-[calc(100dvh-280px)] overflow-y-auto px-6 pb-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-6">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filter === 'unread' 
                  ? 'You\'ve read all your notifications' 
                  : 'You\'re all caught up'}
              </p>
            </div>
          ) : (
            <>
              {filter === 'unread' && localUnreadCount > 0 && (
                <div className="flex justify-end mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMarkAllAsReadClick}
                    className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    Mark all as read
                  </Button>
                </div>
              )}
              
              <div className="space-y-2">
                {filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className="animate-slide-in-right"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <NotificationItem
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* All Notifications Button */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 mt-2">
          <Button
            onClick={onViewAll}
            variant="outline"
            className="w-full gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all group"
          >
            <Bell className="h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
            <span>All Notifications</span>
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors ml-auto" />
          </Button>
          <p className="text-xs text-center text-gray-500 mt-2">
            View and manage all your notifications
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}