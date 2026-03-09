import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import axios from 'axios';

// Lucide Icons
import {
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  X,
  MoreVertical,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  DollarSign,
  CreditCard,
  Receipt,
  FileText,
  FileCheck,
  User,
  Users,
  Home,
  Building,
  Settings,
  ExternalLink,
  ArrowRight,
  Mail,
  MailOpen,
  Inbox,
  Archive,
  Star,
  Tag,
  Bookmark,
  ChevronDown,
  Square,
} from 'lucide-react';

// ========== IMPORT REUSABLE COMPONENTS ==========
import { StatusBadge } from '@/components/residentui/StatusBadge';
import { NotificationTabs } from '@/components/residentui/NotificationTabs';
import { ModernSelect } from '@/components/residentui/modern-select';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

// Layout
import ResidentAppLayout from '@/layouts/resident-app-layout';

// Utilities
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';

// =============================================
// TYPES & INTERFACES
// =============================================

interface NotificationData {
  type?: string;
  message?: string;
  title?: string;
  resident_name?: string;
  formatted_amount?: string;
  fee_code?: string;
  fee_type?: string;
  link?: string;
  action_url?: string;
  payer_name?: string;
  payer_type?: string;
  [key: string]: any;
}

interface Notification {
  id: string;
  type: string;
  data: NotificationData;
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
  action_url?: string;
}

interface PaginatedNotifications {
  data: Notification[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: any[];
}

interface Props {
  notifications: PaginatedNotifications;
  unreadCount: number;
  typeCounts?: {
    fee: number;
    payment: number;
    clearance: number;
    report: number;
    announcement: number;
    household: number;
    member?: number;
  };
}

type FilterType = 'all' | 'unread' | 'read';
type NotificationType = 'all' | 'fee' | 'payment' | 'clearance' | 'report' | 'announcement' | 'household' | 'member';

// =============================================
// CONSTANTS
// =============================================

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'All Types', icon: Bell },
  { value: 'fee', label: 'Fee Notifications', icon: DollarSign },
  { value: 'payment', label: 'Payment Notifications', icon: CreditCard },
  { value: 'clearance', label: 'Clearance Notifications', icon: FileCheck },
  { value: 'report', label: 'Report Notifications', icon: AlertCircle },
  { value: 'announcement', label: 'Announcements', icon: Info },
  { value: 'household', label: 'Household Updates', icon: Home },
  { value: 'member', label: 'Member Updates', icon: Users },
] as const;

const TIME_FILTERS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
] as const;

// =============================================
// HELPER FUNCTIONS
// =============================================

const getNotificationIcon = (notification: Notification): { icon: any; color: string } => {
  if (notification.is_fee_notification) {
    return { icon: DollarSign, color: 'text-emerald-500' };
  }
  
  const type = notification.data?.type || notification.type;
  
  switch (true) {
    case type.includes('Payment'):
      return { icon: CreditCard, color: 'text-green-500' };
    case type.includes('Clearance'):
      return { icon: FileCheck, color: 'text-blue-500' };
    case type.includes('Report'):
      return { icon: AlertCircle, color: 'text-orange-500' };
    case type.includes('Announcement'):
      return { icon: Info, color: 'text-purple-500' };
    case type.includes('Household'):
      return { icon: Home, color: 'text-indigo-500' };
    case type.includes('Member'):
      return { icon: Users, color: 'text-pink-500' };
    default:
      return { icon: Bell, color: 'text-gray-500' };
  }
};

const formatNotificationTime = (date: string): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return date;
  }
};

const getNotificationLink = (notification: Notification): string => {
  const link = notification.link || notification.action_url || notification.data?.link || notification.data?.action_url;
  return link || '#';
};

// =============================================
// SUB-COMPONENTS
// =============================================

const NotificationIcon = ({ notification }: { notification: Notification }) => {
  const { icon: Icon, color } = getNotificationIcon(notification);

  return (
    <div className={cn(
      "p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border",
      color
    )}>
      <Icon className="h-5 w-5" />
    </div>
  );
};

// NOTIFICATION CARD COMPONENT - CLEANED UP (Archive & Bookmark removed)
const NotificationCard = ({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  isSelected,
  onSelect,
  selectMode
}: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  selectMode?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.dropdown-menu') || target.closest('.dropdown-item')) {
      return;
    }

    if (selectMode) {
      e.preventDefault();
      onSelect?.(notification.id);
      return;
    }

    const link = getNotificationLink(notification);
    
    if (link && link !== '#') {
      if (!notification.read_at) {
        onMarkAsRead(notification.id);
      }
      router.visit(link);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.(notification.id);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownItemClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDropdownOpen(false);
    callback();
  };

  const hasValidLink = () => {
    const link = getNotificationLink(notification);
    return link && link !== '#';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    
    const handleClickOutside = () => {
      setDropdownOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md",
        !notification.read_at 
          ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20' 
          : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50',
        isHovered && !selectMode && 'scale-[1.01]',
        selectMode && 'cursor-pointer',
        isSelected && 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
        !hasValidLink() && !selectMode && 'opacity-75 cursor-not-allowed',
        hasValidLink() && !selectMode && 'cursor-pointer'
      )}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
        setDropdownOpen(false);
      }}
      onClick={handleCardClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Selection Checkbox */}
          {selectMode && (
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect?.(notification.id)}
                className="h-5 w-5"
              />
            </div>
          )}

          {/* Icon */}
          <NotificationIcon notification={notification} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn(
                "text-base font-semibold truncate",
                !notification.read_at 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300'
              )}>
                {notification.title}
              </h3>
              
              <div className="flex items-center gap-2 shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatNotificationTime(notification.created_at)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {new Date(notification.created_at).toLocaleString()}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {!notification.read_at && (
                  <Badge variant="default" className="bg-blue-500 text-xs animate-pulse">
                    New
                  </Badge>
                )}
              </div>
            </div>

            {/* Resident Name */}
            {notification.resident_name && (
              <div className="flex items-center gap-1 mb-2">
                <User className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {notification.resident_name}
                </span>
              </div>
            )}

            {/* Message */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {notification.message}
            </p>

            {/* Tags & Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {notification.formatted_amount && notification.formatted_amount !== '₱0.00' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    {notification.formatted_amount}
                  </Badge>
                )}
                
                {notification.fee_type && (
                  <Badge variant="outline" className="text-xs">
                    {notification.fee_type}
                  </Badge>
                )}
                
                {notification.fee_code && (
                  <Badge variant="outline" className="text-xs font-mono bg-gray-50 dark:bg-gray-800">
                    #{notification.fee_code}
                  </Badge>
                )}
                
                {notification.read_at ? (
                  <Badge variant="outline" className="text-xs text-gray-500 flex items-center gap-1">
                    <MailOpen className="h-3 w-3" />
                    Read
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-blue-500 flex items-center gap-1 border-blue-200">
                    <Mail className="h-3 w-3" />
                    Unread
                  </Badge>
                )}
              </div>

              {/* Actions Menu - CLEANED UP (Archive & Bookmark removed) */}
              {!selectMode && (showActions || isHovered) && (
                <div className="flex items-center gap-1 relative" onClick={(e) => e.stopPropagation()}>
                  {!notification.read_at && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                            onClick={handleMarkAsRead}
                          >
                            <MailOpen className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark as read</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {onDelete && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            onClick={handleDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* CUSTOM DROPDOWN - Only essential options */}
                  <div className="relative" style={{ zIndex: 100 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={handleDropdownToggle}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    
                    {/* Custom dropdown menu - Simple with only Copy ID and Open in new tab */}
                    {dropdownOpen && (
                      <div 
                        className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 dropdown-menu"
                        style={{ 
                          zIndex: 9999,
                          position: 'absolute',
                          bottom: '100%',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dropdown-item"
                          onClick={handleDropdownItemClick(() => {
                            navigator.clipboard.writeText(notification.id);
                            toast.success('Notification ID copied');
                          })}
                        >
                          Copy ID
                        </button>
                        
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dropdown-item"
                          onClick={handleDropdownItemClick(() => {
                            const link = getNotificationLink(notification);
                            if (link && link !== '#') {
                              window.open(link, '_blank');
                            }
                          })}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in new tab
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-gray-400 truncate border-t pt-2">
                <span className="font-mono">Link: {getNotificationLink(notification)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================
// MAIN COMPONENT
// =============================================

export default function NotificationsIndex({ notifications, unreadCount, typeCounts }: Props) {
  // State
  const [filter, setFilter] = useState<FilterType>('all');
  const [notificationType, setNotificationType] = useState<NotificationType>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [localNotifications, setLocalNotifications] = useState(notifications.data);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalNotifications(notifications.data);
    setLocalUnreadCount(unreadCount);
  }, [notifications.data, unreadCount]);

  // Computed values
  const totalCount = notifications.total;
  const readCount = totalCount - localUnreadCount;
  const hasActiveFilters = filter !== 'all' || notificationType !== 'all' || timeFilter !== 'all' || search !== '';
  
  const filteredNotifications = localNotifications.filter(notification => {
    // Filter by read status
    if (filter === 'unread' && notification.read_at) return false;
    if (filter === 'read' && !notification.read_at) return false;
    
    // Filter by notification type
    if (notificationType !== 'all') {
      const type = notification.data?.type || notification.type;
      const typeLower = type.toLowerCase();
      
      switch (notificationType) {
        case 'fee':
          if (!typeLower.includes('fee') && !notification.is_fee_notification) return false;
          break;
        case 'payment':
          if (!typeLower.includes('payment')) return false;
          break;
        case 'clearance':
          if (!typeLower.includes('clearance')) return false;
          break;
        case 'report':
          if (!typeLower.includes('report')) return false;
          break;
        case 'announcement':
          if (!typeLower.includes('announcement')) return false;
          break;
        case 'household':
          if (!typeLower.includes('household') && !typeLower.includes('member')) return false;
          break;
        case 'member':
          if (!typeLower.includes('member')) return false;
          break;
      }
    }
    
    // Filter by time
    if (timeFilter !== 'all') {
      const date = new Date(notification.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (timeFilter) {
        case 'today':
          if (diffDays > 0) return false;
          break;
        case 'yesterday':
          if (diffDays !== 1) return false;
          break;
        case '7days':
          if (diffDays > 7) return false;
          break;
        case '30days':
          if (diffDays > 30) return false;
          break;
        case '90days':
          if (diffDays > 90) return false;
          break;
      }
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        notification.title?.toLowerCase().includes(searchLower) ||
        notification.message?.toLowerCase().includes(searchLower) ||
        notification.resident_name?.toLowerCase().includes(searchLower) ||
        notification.fee_code?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Handlers
  const handleMarkAsRead = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`/portal/notifications/${id}/mark-as-read`);
      
      if (response.data.success) {
        setLocalNotifications(prev =>
          prev.map(n =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
        setLocalUnreadCount(prev => Math.max(0, prev - 1));
        
        if (selectMode) {
          setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
        
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark as read');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/portal/notifications/mark-all-as-read');
      
      if (response.data.success) {
        setLocalNotifications(prev =>
          prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
        setLocalUnreadCount(0);
        setSelectedIds([]);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/portal/notifications/${id}`);
      
      if (response.data.success) {
        setLocalNotifications(prev => prev.filter(n => n.id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        
        const deletedNotification = localNotifications.find(n => n.id === id);
        if (deletedNotification && !deletedNotification.read_at) {
          setLocalUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/portal/notifications/bulk-delete', { ids: selectedIds });
      
      if (response.data.success) {
        setLocalNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
        
        const unreadDeleted = localNotifications.filter(n => 
          selectedIds.includes(n.id) && !n.read_at
        ).length;
        setLocalUnreadCount(prev => Math.max(0, prev - unreadDeleted));
        
        setSelectedIds([]);
        setSelectMode(false);
        toast.success(`${selectedIds.length} notifications deleted`);
      }
    } catch (error) {
      console.error('Failed to delete notifications:', error);
      toast.error('Failed to delete notifications');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const handleClearFilters = () => {
    setFilter('all');
    setNotificationType('all');
    setTimeFilter('all');
    setSearch('');
  };

  const handlePageChange = (page: number) => {
    router.get(route('portal.notifications.index'), { 
      page,
      status: filter === 'all' ? '' : filter,
      type: notificationType === 'all' ? '' : notificationType,
      time: timeFilter === 'all' ? '' : timeFilter,
      search: search || undefined
    }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Breadcrumbs
  const breadcrumbs = [
    { title: 'Dashboard', href: route('portal.dashboard') },
    { title: 'Notifications', href: route('portal.notifications.index') },
  ];

  return (
    <ResidentAppLayout
      breadcrumbs={breadcrumbs}
      title="Notifications"
      description="Stay updated with your household activities"
    >
      <Head title="Notifications" />
      
      <div className="space-y-6">
        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-auto flex-1 max-w-md">
            <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 py-2 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!selectMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectMode(true)}
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Select
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileFilters(true)}
                  className="gap-2 lg:hidden"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="gap-2"
                >
                  <div className="flex items-center justify-center">
                    {selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0 ? (
                      <CheckCheck className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </div>
                  {selectedIds.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectMode(false);
                    setSelectedIds([]);
                  }}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                
                {selectedIds.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        selectedIds.forEach(id => handleMarkAsRead(id));
                      }}
                      className="gap-2 text-blue-600"
                      disabled={loading}
                    >
                      <MailOpen className="h-4 w-4" />
                      Mark Read
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="gap-2 text-red-600"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete ({selectedIds.length})
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Notification Tabs - Desktop */}
        <div className="hidden lg:block">
          <NotificationTabs
            activeTab={filter}
            onTabChange={(tab) => {
              setFilter(tab as FilterType);
              router.get(route('portal.notifications.index'), { 
                ...route().params,
                status: tab === 'all' ? '' : tab,
                page: 1 
              }, {
                preserveState: true,
                preserveScroll: true
              });
            }}
            counts={{
              all: totalCount,
              unread: localUnreadCount,
              read: readCount
            }}
            typeCounts={typeCounts}
            showTypeFilters={true}
            onTypeFilterChange={(type) => {
              setNotificationType((type as NotificationType) || 'all');
            }}
            activeTypeFilter={notificationType !== 'all' ? notificationType : null}
            variant="default"
          />
        </div>

        {/* Mobile Notification Tabs */}
        <div className="lg:hidden">
          <NotificationTabs
            activeTab={filter}
            onTabChange={(tab) => {
              setFilter(tab as FilterType);
              router.get(route('portal.notifications.index'), { 
                ...route().params,
                status: tab === 'all' ? '' : tab,
                page: 1 
              }, {
                preserveState: true,
                preserveScroll: true
              });
            }}
            counts={{
              all: totalCount,
              unread: localUnreadCount,
              read: readCount
            }}
            variant="mobile"
          />
        </div>

        {/* Time and Type Filters Row (for desktop) */}
        <div className="hidden lg:flex items-center justify-end gap-2">
          {/* Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Tag className="h-4 w-4 mr-2" />
                Type
                {notificationType !== 'all' && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-600 rounded-full px-1.5">
                    {NOTIFICATION_TYPES.find(t => t.value === notificationType)?.label.split(' ')[0]}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {NOTIFICATION_TYPES.map(({ value, label, icon: Icon }) => (
                <DropdownMenuItem 
                  key={value}
                  onClick={() => {
                    setNotificationType(value as NotificationType);
                    router.get(route('portal.notifications.index'), { 
                      ...route().params,
                      type: value === 'all' ? '' : value,
                      page: 1 
                    }, {
                      preserveState: true,
                      preserveScroll: true
                    });
                  }}
                  className={cn(
                    "flex items-center justify-between",
                    notificationType === value && "bg-blue-50 dark:bg-blue-950/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                  {notificationType === value && (
                    <CheckCheck className="h-4 w-4 text-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Time Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Calendar className="h-4 w-4 mr-2" />
                Time
                {timeFilter !== 'all' && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-600 rounded-full px-1.5">
                    {TIME_FILTERS.find(t => t.value === timeFilter)?.label}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Time period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setTimeFilter('all');
                router.get(route('portal.notifications.index'), { 
                  ...route().params,
                  time: '',
                  page: 1 
                }, {
                  preserveState: true,
                  preserveScroll: true
                });
              }}>
                All time
              </DropdownMenuItem>
              {TIME_FILTERS.map(({ value, label }) => (
                <DropdownMenuItem 
                  key={value}
                  onClick={() => {
                    setTimeFilter(value);
                    router.get(route('portal.notifications.index'), { 
                      ...route().params,
                      time: value,
                      page: 1 
                    }, {
                      preserveState: true,
                      preserveScroll: true
                    });
                  }}
                  className={cn(
                    "flex items-center justify-between",
                    timeFilter === value && "bg-blue-50 dark:bg-blue-950/30"
                  )}
                >
                  <span>{label}</span>
                  {timeFilter === value && (
                    <CheckCheck className="h-4 w-4 text-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Selection Banner */}
        {selectMode && selectedIds.length > 0 && (
          <ModernSelectionBanner
            selectedCount={selectedIds.length}
            totalCount={filteredNotifications.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={() => setSelectedIds([])}
            onCancel={() => {
              setSelectMode(false);
              setSelectedIds([]);
            }}
            onDelete={() => setShowDeleteDialog(true)}
            deleteLabel="Delete Selected"
          />
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {loading && (
            <ModernLoadingOverlay loading={true} message="Loading notifications..." />
          )}

          {!loading && filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                isSelected={selectedIds.includes(notification.id)}
                onSelect={(id) => {
                  if (selectMode) {
                    setSelectedIds(prev =>
                      prev.includes(id)
                        ? prev.filter(selectedId => selectedId !== id)
                        : [...prev, id]
                    );
                  }
                }}
                selectMode={selectMode}
              />
            ))
          ) : !loading && (
            <ModernEmptyState 
              status={filter === 'unread' ? 'unread' : filter === 'read' ? 'read' : 'all'}
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              title="No notifications found"
              message={
                search 
                  ? `No notifications matching "${search}"`
                  : filter === 'unread'
                    ? "You don't have any unread notifications"
                    : filter === 'read'
                      ? "You don't have any read notifications"
                      : hasActiveFilters
                        ? "No notifications match your filters"
                        : "You don't have any notifications yet"
              }
            />
          )}
        </div>

        {/* Pagination */}
        {notifications.last_page > 1 && (
          <div className="mt-8">
            <ModernPagination
              currentPage={notifications.current_page}
              lastPage={notifications.last_page}
              onPageChange={handlePageChange}
              loading={loading}
            />
            
            <p className="text-sm text-center text-gray-500 mt-4">
              Showing {notifications.from} to {notifications.to} of {notifications.total} notifications
            </p>
          </div>
        )}
      </div>

      {/* Mobile Filter Modal */}
      <ModernFilterModal
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        title="Filter Notifications"
        description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={(e) => {
          e.preventDefault();
          setShowMobileFilters(false);
        }}
        onSearchClear={() => setSearch('')}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      >
        {/* Read Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <ModernSelect
            value={filter}
            onValueChange={(value) => {
              setFilter(value as FilterType);
            }}
            placeholder="All notifications"
            options={[
              { value: 'all', label: 'All notifications' },
              { value: 'unread', label: 'Unread only' },
              { value: 'read', label: 'Read only' },
            ]}
            disabled={loading}
            icon={Mail}
          />
        </div>

        {/* Notification Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notification Type
          </label>
          <ModernSelect
            value={notificationType}
            onValueChange={(value) => {
              setNotificationType(value as NotificationType);
            }}
            placeholder="All types"
            options={NOTIFICATION_TYPES.map(type => ({
              value: type.value,
              label: type.label
            }))}
            disabled={loading}
            icon={Tag}
          />
        </div>

        {/* Time Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Period
          </label>
          <ModernSelect
            value={timeFilter}
            onValueChange={(value) => {
              setTimeFilter(value);
            }}
            placeholder="All time"
            options={[
              { value: 'all', label: 'All time' },
              ...TIME_FILTERS.map(filter => ({
                value: filter.value,
                label: filter.label
              }))
            ]}
            disabled={loading}
            icon={Calendar}
          />
        </div>
      </ModernFilterModal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete notifications</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length} notification{selectedIds.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResidentAppLayout>
  );
}