// /Pages/resident/Notifications/Index.tsx
import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import axios from 'axios';
import { toast } from 'sonner';

// Layout
import ResidentAppLayout from '@/layouts/resident-app-layout';

// Components
import { NotificationTabs } from '@/components/residentui/NotificationTabs';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernSelect } from '@/components/residentui/modern-select';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { SearchBar } from '@/components/portal/notifications/index/SearchBar';
import { ActionButtons } from '@/components/portal/notifications/index/ActionButtons';
import { FilterRow } from '@/components/portal/notifications/index/FilterRow';
import { NotificationCard } from '@/components/portal/notifications/index/NotificationCard';
import { NOTIFICATION_TYPES, TIME_FILTERS } from '@/components/residentui/notifications/constants';
import { FilterType, NotificationType, PaginatedNotifications, NotificationTypeCounts } from '@/types/portal/notifications/types';
import { Mail, Calendar, Tag } from 'lucide-react';

interface Props {
  notifications: PaginatedNotifications;
  unreadCount: number;
  typeCounts?: NotificationTypeCounts;
}

export default function NotificationsIndex({ notifications, unreadCount, typeCounts }: Props) {
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

  const totalCount = notifications.total;
  const readCount = totalCount - localUnreadCount;
  const hasActiveFilters = filter !== 'all' || notificationType !== 'all' || timeFilter !== 'all' || search !== '';
  
  const filteredNotifications = localNotifications.filter(notification => {
    if (filter === 'unread' && notification.read_at) return false;
    if (filter === 'read' && !notification.read_at) return false;
    
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
    
    if (timeFilter !== 'all') {
      const date = new Date(notification.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (timeFilter) {
        case 'today': if (diffDays > 0) return false; break;
        case 'yesterday': if (diffDays !== 1) return false; break;
        case '7days': if (diffDays > 7) return false; break;
        case '30days': if (diffDays > 30) return false; break;
        case '90days': if (diffDays > 90) return false; break;
      }
    }
    
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

  useEffect(() => {
    setLocalNotifications(notifications.data);
    setLocalUnreadCount(unreadCount);
  }, [notifications.data, unreadCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`/portal/notifications/${id}/mark-as-read`);
      
      if (response.data.success) {
        setLocalNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
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
        setLocalNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
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
        
        const unreadDeleted = localNotifications.filter(n => selectedIds.includes(n.id) && !n.read_at).length;
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

  const breadcrumbs = [
    { title: 'Dashboard', href: route('portal.dashboard') },
    { title: 'Notifications', href: route('portal.notifications.index') },
  ];

  return (
    <ResidentAppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            onSearchClear={() => setSearch('')}
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ActionButtons
              selectMode={selectMode}
              selectedCount={selectedIds.length}
              totalCount={filteredNotifications.length}
              onSelectModeToggle={() => setSelectMode(!selectMode)}
              onSelectAll={handleSelectAll}
              onCancelSelect={() => {
                setSelectMode(false);
                setSelectedIds([]);
              }}
              onMarkAllAsRead={handleMarkAllAsRead}
              onBulkDelete={() => setShowDeleteDialog(true)}
              onShowMobileFilters={() => setShowMobileFilters(true)}
              loading={loading}
            />
          </div>
        </div>

        <div className="hidden lg:block">
          <NotificationTabs
            activeTab={filter}
            onTabChange={(tab) => {
              setFilter(tab as FilterType);
              router.get(route('portal.notifications.index'), { 
                ...route().params,
                status: tab === 'all' ? '' : tab,
                page: 1 
              }, { preserveState: true, preserveScroll: true });
            }}
            counts={{ all: totalCount, unread: localUnreadCount, read: readCount }}
            typeCounts={typeCounts}
            showTypeFilters={true}
            onTypeFilterChange={(type) => setNotificationType((type as NotificationType) || 'all')}
            activeTypeFilter={notificationType !== 'all' ? notificationType : null}
            variant="default"
          />
        </div>

        <div className="lg:hidden">
          <NotificationTabs
            activeTab={filter}
            onTabChange={(tab) => {
              setFilter(tab as FilterType);
              router.get(route('portal.notifications.index'), { 
                ...route().params,
                status: tab === 'all' ? '' : tab,
                page: 1 
              }, { preserveState: true, preserveScroll: true });
            }}
            counts={{ all: totalCount, unread: localUnreadCount, read: readCount }}
            variant="mobile"
          />
        </div>

        <FilterRow
          notificationType={notificationType}
          timeFilter={timeFilter}
          hasActiveFilters={hasActiveFilters}
          onTypeChange={setNotificationType}
          onTimeChange={setTimeFilter}
          onClearFilters={handleClearFilters}
          loading={loading}
        />

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

        <div className="space-y-3">
          {loading && <ModernLoadingOverlay loading={true} message="Loading notifications..." />}

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
                      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
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

        {notifications.last_page > 1 && (
          <div className="mt-8">
            <ModernPagination
              currentPage={notifications.current_page}
              lastPage={notifications.last_page}
              onPageChange={handlePageChange}
              loading={loading}
            />
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
              Showing {notifications.from} to {notifications.to} of {notifications.total} notifications
            </p>
          </div>
        )}
      </div>

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
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <ModernSelect
            value={filter}
            onValueChange={(value) => setFilter(value as FilterType)}
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notification Type
          </label>
          <ModernSelect
            value={notificationType}
            onValueChange={(value) => setNotificationType(value as NotificationType)}
            placeholder="All types"
            options={NOTIFICATION_TYPES.map(type => ({ value: type.value, label: type.label }))}
            disabled={loading}
            icon={Tag}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Period
          </label>
          <ModernSelect
            value={timeFilter}
            onValueChange={setTimeFilter}
            placeholder="All time"
            options={[
              { value: 'all', label: 'All time' },
              ...TIME_FILTERS.map(filter => ({ value: filter.value, label: filter.label }))
            ]}
            disabled={loading}
            icon={Calendar}
          />
        </div>
      </ModernFilterModal>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Delete notifications</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete {selectedIds.length} notification{selectedIds.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
              className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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