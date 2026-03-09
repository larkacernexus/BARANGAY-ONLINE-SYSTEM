import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Settings', href: '/residentsettings' },
  { title: 'Activities', href: '/residentsettings/activities' },
];

// Types matching your enhanced backend structure
interface ActivityItem {
  id: string;
  type: string;
  action: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed';
  ip_address?: string;
  device?: string;
  location?: string | null;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
}

interface ActivityStats {
  total: number;
  successful: number;
  pending: number;
  failed: number;
  logins: number;
  payments: number;
  documents: number;
  audits: number;
  access: number;
  clearances: number;
  reports: number;
  announcements: number;
  profile?: number;
  security?: number;
  settings?: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  loginSuccess: number;
  loginFailed: number;
  paymentSuccess: number;
  paymentPending: number;
  paymentFailed: number;
}

interface Props {
  activities: ActivityItem[];
  stats: ActivityStats;
  filters: {
    type: string;
    timeRange: string;
    search: string;
  };
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export default function Activities({ 
  activities: initialActivities = [],
  stats = {
    total: 0, successful: 0, pending: 0, failed: 0,
    logins: 0, payments: 0, documents: 0, audits: 0,
    access: 0, clearances: 0, reports: 0, announcements: 0,
    profile: 0, security: 0, settings: 0,
    today: 0, thisWeek: 0, thisMonth: 0,
    loginSuccess: 0, loginFailed: 0,
    paymentSuccess: 0, paymentPending: 0, paymentFailed: 0,
  },
  filters = { type: 'all', timeRange: 'all', search: '' },
  pagination = { current_page: 1, total: 0, per_page: 20, last_page: 1, from: 0, to: 0 }
}: Props) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [activeTab, setActiveTab] = useState<string>(filters?.type || 'all');
  const [searchQuery, setSearchQuery] = useState(filters?.search || '');
  const [selectedTimeRange, setSelectedTimeRange] = useState(filters?.timeRange || 'all');
  const [debouncedSearch, setDebouncedSearch] = useState(filters?.search || '');
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(pagination.current_page);
  const [allActivities, setAllActivities] = useState<ActivityItem[]>(initialActivities);
  const [totalCount, setTotalCount] = useState(pagination.total);

  // Update activities when props change (new filter/search)
  useEffect(() => {
    setAllActivities(initialActivities);
    setCurrentPage(pagination.current_page);
    setTotalCount(pagination.total);
  }, [initialActivities, pagination]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Apply filters (resets everything)
  useEffect(() => {
    setLoading(true);
    router.get(
      '/residentsettings/activities',
      { 
        type: activeTab === 'all' ? undefined : activeTab,
        timeRange: selectedTimeRange === 'all' ? undefined : selectedTimeRange,
        search: debouncedSearch || undefined,
        page: 1 // Reset to page 1 on filter change
      },
      { 
        preserveState: true, 
        replace: true,
        onFinish: () => setLoading(false)
      }
    );
  }, [activeTab, selectedTimeRange, debouncedSearch]);

  const handleExport = async (format: string) => {
    setExportLoading(true);
    try {
      router.post('/residentsettings/activities/export', {
        format,
        filters: { 
          type: activeTab === 'all' ? undefined : activeTab,
          timeRange: selectedTimeRange === 'all' ? undefined : selectedTimeRange,
          search: searchQuery || undefined
        }
      }, {
        onSuccess: () => {
          toast.success('Export started! Your download will begin shortly.');
        },
        onError: () => {
          toast.error('Export failed. Please try again.');
        },
        onFinish: () => setExportLoading(false)
      });
    } catch (error) {
      toast.error('Export failed. Please try again.');
      setExportLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    router.reload({ 
      preserveState: true,
      onFinish: () => setLoading(false)
    });
  };

  const handleViewDetails = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setShowDetailsDialog(true);
  };

  const handleLoadMore = () => {
    if (currentPage < pagination.last_page && !loadingMore) {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      
      router.get('/residentsettings/activities', { 
        type: activeTab === 'all' ? undefined : activeTab,
        timeRange: selectedTimeRange === 'all' ? undefined : selectedTimeRange,
        search: searchQuery || undefined,
        page: nextPage
      }, {
        preserveState: true,
        preserveScroll: true,
        replace: false,
        onSuccess: (page: any) => {
          // Append new activities to existing ones
          setAllActivities(prev => [...prev, ...page.props.activities]);
          setCurrentPage(nextPage);
          setTotalCount(page.props.pagination.total);
        },
        onFinish: () => setLoadingMore(false)
      });
    }
  };

  const handleActivityAction = (action: string, activity: ActivityItem) => {
    switch (action) {
      case 'view':
        handleViewDetails(activity);
        break;
      case 'copy':
        navigator.clipboard.writeText(JSON.stringify(activity, null, 2));
        toast.success('Activity details copied to clipboard');
        break;
      case 'report':
        const reason = window.prompt('Please describe the issue (optional):');
        router.post('/residentsettings/activities/report', { 
          id: activity.id,
          reason: reason || ''
        }, {
          onSuccess: () => toast.success('Thank you for your report. We will investigate this activity.'),
          onError: () => toast.error('Failed to submit report. Please try again.')
        });
        break;
      default:
        break;
    }
  };

  const getActivityIcon = (type: string, status?: string) => {
    const icons: Record<string, string> = {
      login: status === 'failed' ? '🔒❌' : '🔐',
      logout: '🚪',
      payment: status === 'pending' ? '⏳💰' : (status === 'failed' ? '❌💰' : '💰'),
      document: '📄',
      profile: '👤',
      security: '🛡️',
      settings: '⚙️',
      report: '⚠️',
      announcement: '📢',
      view: '👁️',
      clearance: '📋',
      download: '⬇️',
      support: '🎫',
      incident: '🚨',
      backup: '💾',
      financial: '💵',
      audit: '🔍',
    };
    return icons[type] || '📋';
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs border-0">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-xs border-0">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs border-0">Failed</Badge>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) > 1 ? 's' : ''} ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)} day${Math.floor(diffMins / 1440) > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      payment: 'Payment',
      document: 'Document',
      profile: 'Profile',
      security: 'Security',
      settings: 'Settings',
      report: 'Report',
      announcement: 'Announcement',
      view: 'View',
      clearance: 'Clearance',
      download: 'Download',
      support: 'Support',
      incident: 'Incident',
      backup: 'Backup',
      financial: 'Financial',
      audit: 'Audit',
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getDeviceIcon = (device?: string) => {
    if (!device) return '💻';
    if (device.includes('Mobile') || device.includes('iOS') || device.includes('Android')) return '📱';
    if (device.includes('Tablet') || device.includes('iPad')) return '📱';
    if (device.includes('Windows') || device.includes('macOS') || device.includes('Linux')) return '💻';
    return '💻';
  };

  const displayedActivities = allActivities;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Activity Log" />
      <SettingsLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Account Activity</h1>
              <p className="text-sm text-muted-foreground">
                {totalCount.toLocaleString()} total events
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={exportLoading}>
                    {exportLoading ? '⏳' : '⬇️'} Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? '⏳' : '🔄'} Refresh
              </Button>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.successful.toLocaleString()}</div>
                <div className="text-xs text-green-600 dark:text-green-500">Successful</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending.toLocaleString()}</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-500">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.failed.toLocaleString()}</div>
                <div className="text-xs text-red-600 dark:text-red-500">Failed</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.total.toLocaleString()}</div>
                <div className="text-xs text-blue-600 dark:text-blue-500">Total</div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-sm">
            <div>
              <div className="font-medium">{stats.today}</div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
            <div>
              <div className="font-medium">{stats.thisWeek}</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
            <div>
              <div className="font-medium">{stats.thisMonth}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
            <div>
              <div className="font-medium">{stats.logins}</div>
              <div className="text-xs text-muted-foreground">Logins</div>
            </div>
            <div>
              <div className="font-medium">{stats.payments}</div>
              <div className="text-xs text-muted-foreground">Payments</div>
            </div>
            <div>
              <div className="font-medium">{stats.documents}</div>
              <div className="text-xs text-muted-foreground">Documents</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start gap-4 bg-transparent border-b rounded-none h-auto p-0 overflow-x-auto">
                <TabsTrigger value="all" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">All Activity</TabsTrigger>
                <TabsTrigger value="login" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Logins</TabsTrigger>
                <TabsTrigger value="payment" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Payments</TabsTrigger>
                <TabsTrigger value="document" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Documents</TabsTrigger>
                <TabsTrigger value="clearance" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Clearances</TabsTrigger>
                <TabsTrigger value="report" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Reports</TabsTrigger>
                <TabsTrigger value="announcement" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Announcements</TabsTrigger>
                <TabsTrigger value="support" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Support</TabsTrigger>
                <TabsTrigger value="incident" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Incidents</TabsTrigger>
                <TabsTrigger value="profile" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Profile</TabsTrigger>
                <TabsTrigger value="security" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Security</TabsTrigger>
                <TabsTrigger value="settings" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Settings</TabsTrigger>
                <TabsTrigger value="audit" className="px-0 pb-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Audit</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Time Range Filter */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Time:</span>
              {[
                { value: 'all', label: 'All time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This week' },
                { value: 'month', label: 'This month' },
                { value: 'year', label: 'This year' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedTimeRange(range.value)}
                  className={`px-3 py-1 rounded-full text-xs ${
                    selectedTimeRange === range.value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <Input
              placeholder="Search activities by description, IP, reference number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Activity List */}
          <Card>
            <CardContent className="p-0">
              {loading && displayedActivities.length === 0 ? (
                <div className="text-center py-16">
                  <div className="animate-spin text-4xl mb-3">⏳</div>
                  <p className="text-muted-foreground">Loading activities...</p>
                </div>
              ) : displayedActivities.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="text-4xl mb-3">📭</div>
                  <p>No activities found</p>
                  <p className="text-sm mt-2">Try adjusting your filters or search</p>
                </div>
              ) : (
                <div className="divide-y">
                  {displayedActivities.map((activity) => (
                    <div key={activity.id} className="p-4 sm:p-6 hover:bg-accent/50 transition-colors group">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Icon */}
                        <div className="p-2.5 rounded-lg bg-muted flex-shrink-0">
                          <span className="text-lg">{getActivityIcon(activity.type, activity.status)}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title row */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium truncate max-w-[200px] sm:max-w-full">
                                {activity.action}
                              </span>
                              {getStatusBadge(activity.status)}
                              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                                {getTypeLabel(activity.type)}
                              </Badge>
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground mb-2 break-words">
                            {activity.description}
                          </p>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {activity.ip_address && (
                              <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded">
                                <span>🌐</span> {activity.ip_address}
                              </span>
                            )}
                            {activity.device && activity.device !== 'Unknown' && (
                              <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded">
                                <span>{getDeviceIcon(activity.device)}</span> {activity.device}
                              </span>
                            )}
                            {activity.location && (
                              <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded">
                                <span>📍</span> {activity.location}
                              </span>
                            )}
                            {activity.resource_id && activity.resource_id !== 'N/A' && (
                              <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded font-mono">
                                <span>🔖</span> {activity.resource_id}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs sm:hidden">
                              {getTypeLabel(activity.type)}
                            </Badge>
                          </div>

                          {/* Metadata from specific tables */}
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              {activity.metadata.or_number && (
                                <Badge variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-950">
                                  OR: {activity.metadata.or_number}
                                </Badge>
                              )}
                              {activity.metadata.reference_number && (
                                <Badge variant="secondary" className="text-xs bg-purple-50 dark:bg-purple-950">
                                  Ref: {activity.metadata.reference_number}
                                </Badge>
                              )}
                              {activity.metadata.amount && (
                                <Badge variant="secondary" className="text-xs bg-green-50 dark:bg-green-950">
                                  ₱{Number(activity.metadata.amount).toLocaleString()}
                                </Badge>
                              )}
                              {activity.metadata.browser && (
                                <Badge variant="secondary" className="text-xs bg-gray-50 dark:bg-gray-800">
                                  {activity.metadata.browser}
                                </Badge>
                              )}
                              {activity.metadata.event && (
                                <Badge variant="secondary" className="text-xs bg-indigo-50 dark:bg-indigo-950">
                                  Event: {activity.metadata.event}
                                </Badge>
                              )}
                              {activity.metadata.log_name && (
                                <Badge variant="secondary" className="text-xs bg-indigo-50 dark:bg-indigo-950">
                                  Log: {activity.metadata.log_name}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 3-dots menu */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="text-lg">⋯</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleActivityAction('view', activity)}>
                                <span className="mr-2">👁️</span> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleActivityAction('copy', activity)}>
                                <span className="mr-2">📋</span> Copy Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleActivityAction('report', activity)}>
                                <span className="mr-2">🚩</span> Report Issue
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Load More Button - Shows below the list, not pagination */}
            {displayedActivities.length > 0 && currentPage < pagination.last_page && (
              <>
                <Separator />
                <CardFooter className="py-6">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Loading more...
                      </>
                    ) : (
                      'Load More Activities'
                    )}
                  </Button>
                </CardFooter>
              </>
            )}

            {/* Show count info at the bottom */}
            {displayedActivities.length > 0 && (
              <CardFooter className="py-3 border-t bg-muted/10">
                <p className="text-xs text-muted-foreground w-full text-center">
                  Showing {displayedActivities.length} of {totalCount} activities
                  {displayedActivities.length < totalCount && ' — scroll down to load more'}
                </p>
              </CardFooter>
            )}
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Logins</div>
                  <div className="font-medium">{stats.loginSuccess} successful, {stats.loginFailed} failed</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Payments</div>
                  <div className="font-medium">{stats.paymentSuccess} completed, {stats.paymentPending} pending</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Documents</div>
                  <div className="font-medium">{stats.documents} total</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Audits</div>
                  <div className="font-medium">{stats.audits} events</div>
                </div>
              </div>
              
              {(stats.profile || stats.security || stats.settings) && (
                <div className="grid grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t">
                  {stats.profile !== undefined && stats.profile > 0 && (
                    <div>
                      <div className="text-muted-foreground text-xs">Profile</div>
                      <div className="font-medium">{stats.profile} events</div>
                    </div>
                  )}
                  {stats.security !== undefined && stats.security > 0 && (
                    <div>
                      <div className="text-muted-foreground text-xs">Security</div>
                      <div className="font-medium">{stats.security} events</div>
                    </div>
                  )}
                  {stats.settings !== undefined && stats.settings > 0 && (
                    <div>
                      <div className="text-muted-foreground text-xs">Settings</div>
                      <div className="font-medium">{stats.settings} events</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Activity Details</DialogTitle>
              <DialogDescription>
                Detailed information about this activity
              </DialogDescription>
            </DialogHeader>
            {selectedActivity && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="text-sm font-mono bg-muted/50 px-2 py-1 rounded mt-1">{selectedActivity.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="text-sm mt-1">{getTypeLabel(selectedActivity.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Action</p>
                    <p className="text-sm mt-1">{selectedActivity.action}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedActivity.status)}</div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedActivity.description}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                    <p className="text-sm mt-1">{new Date(selectedActivity.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Technical Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedActivity.ip_address && (
                      <>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">IP Address</p>
                          <p className="text-sm font-mono mt-1">{selectedActivity.ip_address}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Location</p>
                          <p className="text-sm mt-1">{selectedActivity.location || 'Unknown'}</p>
                        </div>
                      </>
                    )}
                    {selectedActivity.device && (
                      <div className="col-span-2">
                        <p className="text-xs font-medium text-muted-foreground">Device</p>
                        <p className="text-sm mt-1">{selectedActivity.device}</p>
                      </div>
                    )}
                    {selectedActivity.resource_type && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Resource Type</p>
                        <p className="text-sm mt-1">{selectedActivity.resource_type}</p>
                      </div>
                    )}
                    {selectedActivity.resource_id && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Resource ID</p>
                        <p className="text-sm font-mono mt-1">{selectedActivity.resource_id}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Additional Metadata</h4>
                    <div className="bg-muted rounded-lg p-3 max-h-60 overflow-auto">
                      <pre className="text-xs">
                        {JSON.stringify(selectedActivity.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedActivity, null, 2));
                    toast.success('Copied to clipboard');
                  }}>
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SettingsLayout>
    </AppLayout>
  );
}