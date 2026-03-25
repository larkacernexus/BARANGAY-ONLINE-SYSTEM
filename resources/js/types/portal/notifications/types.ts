// /components/residentui/notifications/types.ts
import { LucideIcon } from 'lucide-react';

export interface NotificationData {
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

export interface Notification {
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

export interface PaginatedNotifications {
  data: Notification[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: any[];
}

// ✅ Fixed: Add index signature to make it compatible with NotificationTabs
export interface NotificationTypeCounts {
  [key: string]: number | undefined; // Index signature for any string key
  fee: number;
  payment: number;
  clearance: number;
  report: number;
  announcement: number;
  household: number;
  member?: number;
}

export type FilterType = 'all' | 'unread' | 'read';
export type NotificationType = 'all' | 'fee' | 'payment' | 'clearance' | 'report' | 'announcement' | 'household' | 'member';

// ========== CONFIGURATION TYPES ==========
export interface NotificationIconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface NotificationTabConfig {
  value: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

export interface NotificationFilterOption {
  value: string;
  label: string;
}

// ========== COMPONENT PROPS TYPES ==========
export interface NotificationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    unread: number;
    read: number;
  };
  typeCounts?: NotificationTypeCounts;
  showTypeFilters?: boolean;
  onTypeFilterChange?: (type: string | null) => void;
  activeTypeFilter?: string | null;
  variant?: 'default' | 'mobile';
}

export interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
}

export interface ActionButtonsProps {
  selectMode: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectModeToggle: () => void;
  onSelectAll: () => void;
  onCancelSelect: () => void;
  onMarkAllAsRead: () => void;
  onBulkDelete: () => void;
  onShowMobileFilters: () => void;
  loading: boolean;
}

export interface FilterRowProps {
  notificationType: NotificationType;
  timeFilter: string;
  hasActiveFilters: boolean;
  onTypeChange: (type: NotificationType) => void;
  onTimeChange: (time: string) => void;
  onClearFilters: () => void;
  loading: boolean;
}

export interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  selectMode?: boolean;
}

export interface NotificationIconProps {
  notification: Notification;
}

// ========== UTILITY FUNCTION TYPES ==========
export type GetNotificationIcon = (notification: Notification) => NotificationIconConfig;
export type FormatNotificationTime = (date: string) => string;
export type GetNotificationLink = (notification: Notification) => string;