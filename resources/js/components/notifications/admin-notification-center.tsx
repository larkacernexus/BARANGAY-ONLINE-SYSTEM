// resources/js/components/notifications/admin-notification-center.tsx

import { Bell, CheckCircle2, X, User, ExternalLink, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Updated notification interface to match your backend format
export interface Notification {
  id: string;
  type: string;
  data: any;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
  created_at_raw: string;
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

// Helper function to extract title from notification data
const getNotificationTitle = (notification: Notification): string => {
  if (notification.data?.title) return notification.data.title;
  if (notification.data?.message) {
    return notification.data.message.substring(0, 50) + (notification.data.message.length > 50 ? '...' : '');
  }
  
  // Generate title based on notification type
  switch (notification.type) {
    case 'Fee':
    case 'FeeNotification':
      return 'Fee Notification';
    case 'Payment':
    case 'PaymentNotification':
      return 'Payment Notification';
    case 'Report':
    case 'ReportNotification':
      return 'Report Notification';
    case 'Clearance':
    case 'ClearanceNotification':
      return 'Clearance Notification';
    case 'System':
    case 'SystemNotification':
      return 'System Notification';
    default:
      return notification.type.replace(/([A-Z])/g, ' $1').trim();
  }
};

// Helper function to extract message from notification data
const getNotificationMessage = (notification: Notification): string => {
  if (notification.data?.message) return notification.data.message;
  if (notification.data?.description) return notification.data.description;
  if (notification.data?.content) return notification.data.content;
  
  // Try to generate message from data
  const data = notification.data || {};
  const relevantFields = Object.entries(data)
    .filter(([key]) => !['title', 'type', 'icon'].includes(key))
    .slice(0, 2)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  
  return relevantFields || 'No details available';
};

// Helper function to determine notification type for icon
const getNotificationCategory = (notification: Notification): 'fee' | 'payment' | 'report' | 'clearance' | 'system' => {
  const type = notification.type.toLowerCase();
  
  if (type.includes('fee') || notification.data?.fee_code || notification.data?.formatted_amount) {
    return 'fee';
  }
  if (type.includes('payment') || notification.data?.or_number) {
    return 'payment';
  }
  if (type.includes('report') || notification.data?.report_number) {
    return 'report';
  }
  if (type.includes('clearance') || notification.data?.reference_number) {
    return 'clearance';
  }
  
  return 'system';
};

// Notification Item Component
const NotificationItem = ({ 
  notification, 
  onClick 
}: { 
  notification: Notification; 
  onClick: () => void;
}) => {
  const category = getNotificationCategory(notification);
  
  const getIcon = () => {
    switch (category) {
      case 'fee': return CheckCircle2;
      case 'payment': return CheckCircle;
      case 'report': return AlertCircle;
      case 'clearance': return Info;
      default: return Bell;
    }
  };

  const getIconColor = () => {
    switch (category) {
      case 'fee': return 'text-emerald-500';
      case 'payment': return 'text-green-500';
      case 'report': return 'text-orange-500';
      case 'clearance': return 'text-blue-500';
      default: return 'text-purple-500';
    }
  };

  const getBgGradient = () => {
    if (notification.is_read) return '';
    
    switch (category) {
      case 'fee':
        return 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20';
      case 'payment':
        return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
      case 'report':
        return 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20';
      case 'clearance':
        return 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';
      default:
        return 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';
    }
  };

  const Icon = getIcon();
  const title = getNotificationTitle(notification);
  const message = getNotificationMessage(notification);
  
  // Extract resident name from notification data
  const residentName = notification.data?.resident_name || notification.data?.payer_name || null;
  
  // Extract amount from notification data
  const formattedAmount = notification.data?.formatted_amount || notification.data?.amount || null;
  
  // Extract fee code from notification data
  const feeCode = notification.data?.fee_code || notification.data?.clearance_type || null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl transition-all duration-200 relative overflow-hidden group",
        notification.is_read 
          ? 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900/50' 
          : cn("bg-gradient-to-r", getBgGradient())
      )}
    >
      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
      )}

      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm flex-shrink-0",
          getIconColor()
        )}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {title}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
              {notification.created_at || 'Just now'}
            </span>
          </div>
          
          {residentName && (
            <div className="flex items-center gap-1 mb-1">
              <User className="h-3 w-3 text-purple-500 flex-shrink-0" />
              <span className="text-xs text-purple-600 dark:text-purple-400 truncate">
                {residentName}
              </span>
            </div>
          )}
          
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {message}
          </p>
          
          {formattedAmount && formattedAmount !== '0' && formattedAmount !== '0.00' && (
            <div className="mt-2">
              <span className="inline-block text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                {typeof formattedAmount === 'number' ? `₱${formattedAmount.toFixed(2)}` : formattedAmount}
              </span>
            </div>
          )}

          {feeCode && (
            <div className="mt-2">
              <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                {feeCode}
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
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);

  // Update local state when props change
  useEffect(() => {
    console.log('Notifications received:', notifications); // Debug log
    setLocalNotifications(Array.isArray(notifications) ? notifications : []);
    setLocalUnreadCount(unreadCount || 0);
  }, [notifications, unreadCount]);

  // Reset filter when sheet opens
  useEffect(() => {
    if (isOpen) {
      setFilter('all');
    }
  }, [isOpen]);

  const filteredNotifications = localNotifications.filter(n => 
    filter === 'all' || (filter === 'unread' && !n.is_read)
  );

  const handleNotificationClick = (notification: Notification) => {
    // Prevent double clicks while navigating
    if (isNavigating) return;

    // Mark as read if unread
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
      
      // Update local state immediately for better UX
      setLocalNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setLocalUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Check for link in notification data
    const actionUrl = notification.data?.action_url || notification.data?.url || notification.data?.link;
    
    if (actionUrl && actionUrl !== '#') {
      let targetUrl = actionUrl;
      
      // Handle the URL properly
      try {
        if (targetUrl.startsWith('http')) {
          const urlObj = new URL(targetUrl);
          targetUrl = urlObj.pathname + urlObj.search + urlObj.hash;
        }
      } catch (e) {
        console.error('Invalid URL:', targetUrl);
      }
      
      // Remove any existing admin/portal prefix
      targetUrl = targetUrl.replace(/^\/?(admin|portal)\//, '/');
      
      // Ensure leading slash
      if (!targetUrl.startsWith('/')) {
        targetUrl = '/' + targetUrl;
      }
      
      // Add base path based on user type
      let basePath = '';
      if (userType === 'admin' || userType === 'staff' || userType === 'kagawad') {
        basePath = '/admin';
      }
      
      targetUrl = basePath + targetUrl;
      
      console.log('Navigating to:', targetUrl); // Debug log
      
      // Close sheet and navigate
      onClose();
      setIsNavigating(true);
      
      setTimeout(() => {
        router.visit(targetUrl, {
          onFinish: () => setIsNavigating(false)
        });
      }, 150);
    } else {
      // No link, just close the sheet
      onClose();
    }
  };

  const handleMarkAllAsReadClick = () => {
    onMarkAllAsRead();
    
    // Update local state immediately for better UX
    setLocalNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    setLocalUnreadCount(0);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
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

          {/* Filter Tabs */}
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
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-6">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filter === 'unread' 
                  ? "You've read all your notifications" 
                  : "You're all caught up"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
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
              
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id || index}
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
          )}
        </div>

        {/* All Notifications Button - Fixed at bottom */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex-shrink-0">
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