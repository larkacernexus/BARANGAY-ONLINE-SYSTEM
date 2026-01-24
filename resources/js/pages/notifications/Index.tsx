import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { 
  Bell, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  Trash2,
  Mail,
  Clock,
  X,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { PaginatedNotifications, NotificationStats, Filters } from '@/types/notifications';

interface NotificationsPageProps extends PageProps {
  notifications: PaginatedNotifications;
  filters: Filters;
  stats: NotificationStats;
}

export default function NotificationsIndex({ notifications, filters, stats }: NotificationsPageProps) {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(filters?.status || 'all');
  const [typeFilter, setTypeFilter] = useState<string>(filters?.type || 'all');
  const [loading, setLoading] = useState<boolean>(false);

  const filteredNotifications = notifications.data.filter(notification => {
    const matchesSearch = search === '' || 
      notification.title.toLowerCase().includes(search.toLowerCase()) ||
      notification.message.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'read' && notification.read_at) ||
      (statusFilter === 'unread' && !notification.read_at);
    
    const matchesType = typeFilter === 'all' || 
      notification.type.includes(typeFilter);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => {
      if (prev.includes(id)) {
        return prev.filter(notificationId => notificationId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const markAsRead = async (id: string | null = null) => {
    setLoading(true);
    try {
      if (id) {
        await router.post(`/notifications/${id}/mark-read`);
      } else if (selectedNotifications.length > 0) {
        for (const notificationId of selectedNotifications) {
          await router.post(`/notifications/${notificationId}/mark-read`);
        }
      } else {
        await router.post('/notifications/mark-all-read');
      }
      
      router.reload({ only: ['notifications', 'stats'] });
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotifications = async (id: string | null = null) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    setLoading(true);
    try {
      if (id) {
        await router.delete(`/notifications/${id}`);
      } else if (selectedNotifications.length > 0) {
        for (const notificationId of selectedNotifications) {
          await router.delete(`/notifications/${notificationId}`);
        }
      } else {
        await router.delete('/notifications/clear-all');
      }
      
      router.reload({ only: ['notifications', 'stats'] });
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    } finally {
      setLoading(false);
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

  const getTypeBadge = (type: string): { label: string; color: string } => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'fee_payment': { label: 'Fee Payment', color: 'bg-blue-100 text-blue-800' },
      'payment_receipt': { label: 'Payment Receipt', color: 'bg-green-100 text-green-800' },
      'clearance_status': { label: 'Clearance', color: 'bg-purple-100 text-purple-800' },
      'system': { label: 'System', color: 'bg-gray-100 text-gray-800' },
    };

    for (const [key, value] of Object.entries(typeMap)) {
      if (type.includes(key)) {
        return value;
      }
    }
    
    return { label: 'Notification', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage your notifications and alerts
            </p>
          </div>
          <div className="flex space-x-2">
            {selectedNotifications.length > 0 && (
              <>
                <button
                  onClick={() => markAsRead()}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:border-indigo-800 focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 transition ease-in-out duration-150 space-x-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span>Mark as Read</span>
                </button>
                <button
                  onClick={() => deleteNotifications()}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-800 focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-300 disabled:opacity-50 transition ease-in-out duration-150 space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
            <button
              onClick={() => markAsRead()}
              disabled={loading || notifications.data.length === 0}
              className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 disabled:opacity-50 transition ease-in-out duration-150 space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>
      }
    >
      <Head title="Notifications" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100">
                  <Bell className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.unread}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Read</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.read}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 bg-white shadow-sm sm:rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value="fee_payment">Fee Payments</option>
                  <option value="payment_receipt">Payment Receipts</option>
                  <option value="clearance_status">Clearance Status</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500">
                  {search || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'You have no notifications yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* Header with select all */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedNotifications.length} selected
                    </span>
                  </div>
                </div>

                {/* Notifications */}
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 hover:bg-gray-50 ${!notification.read_at ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type, notification.icon)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(notification.type).color}`}>
                              {getTypeBadge(notification.type).label}
                            </span>
                            {!notification.read_at && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                New
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {notification.created_at}
                            </span>
                            <button
                              onClick={() => deleteNotifications(notification.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        
                        <div className="mt-3 flex items-center space-x-4">
                          {!notification.read_at && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                          
                          {notification.action_url && (
                            <Link
                              href={notification.action_url}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              View details
                            </Link>
                          )}
                          
                          {notification.data?.fee_id && (
                            <Link
                              href={`/fees/${notification.data.fee_id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View Fee
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {notifications.links.length > 3 && (
              <div className="px-6 py-4 bg-white border-t border-gray-200">
                <nav className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    {notifications.prev_page_url && (
                      <Link
                        href={notifications.prev_page_url}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </Link>
                    )}
                    {notifications.next_page_url && (
                      <Link
                        href={notifications.next_page_url}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{notifications.from}</span> to{' '}
                        <span className="font-medium">{notifications.to}</span> of{' '}
                        <span className="font-medium">{notifications.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {notifications.links.map((link, index) => (
                          <Link
                            key={index}
                            href={link.url || '#'}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                              link.active
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            } ${index === 0 ? 'rounded-l-md' : ''} ${
                              index === notifications.links.length - 1 ? 'rounded-r-md' : ''
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        ))}
                      </nav>
                    </div>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}