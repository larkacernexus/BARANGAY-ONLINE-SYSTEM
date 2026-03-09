import { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
  Activity,
  LogIn,
  LogOut,
  DollarSign,
  FileText,
  User,
  Shield,
  Settings,
  AlertTriangle,
  Bell,
  MoreHorizontal,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type ActivityItem } from '@/types';

interface Props {
  activities: ActivityItem[];
  stats: {
    total: number;
    successful: number;
    pending: number;
    failed: number;
    logins: number;
    payments: number;
    documents: number;
  };
  filters: {
    type?: string;
    timeRange?: string;
    page?: number;
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

export function ActivityLog({ activities, stats, filters, pagination }: Props) {
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [timeRange, setTimeRange] = useState(filters.timeRange || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getActivityIcon = (type: ActivityItem['type'], status?: ActivityItem['status']) => {
    const iconClass = cn('h-4 w-4', {
      'text-green-500': status === 'success',
      'text-yellow-500': status === 'pending',
      'text-red-500': status === 'failed',
      'text-blue-500': type === 'login' && !status,
      'text-purple-500': type === 'document',
      'text-indigo-500': type === 'profile',
      'text-orange-500': type === 'payment',
    });

    switch (type) {
      case 'login':
        return <LogIn className={iconClass} />;
      case 'logout':
        return <LogOut className={iconClass} />;
      case 'payment':
        return <DollarSign className={iconClass} />;
      case 'document':
        return <FileText className={iconClass} />;
      case 'profile':
        return <User className={iconClass} />;
      case 'security':
        return <Shield className={iconClass} />;
      case 'settings':
        return <Settings className={iconClass} />;
      case 'report':
        return <AlertTriangle className={iconClass} />;
      case 'announcement':
        return <Bell className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  const getStatusBadge = (status?: ActivityItem['status']) => {
    if (!status) return null;
    
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    return (
      <Badge className={cn('text-xs capitalize', variants[status])}>
        {status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
        {status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (type: string, value: string) => {
    router.get(
      '/residentsettings/activities',
      { ...filters, [type]: value === 'all' ? undefined : value },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handlePageChange = (page: number) => {
    router.get(
      '/residentsettings/activities',
      { ...filters, page },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    router.post(
      '/residentsettings/activities/export',
      { format, filters },
      { preserveState: true }
    );
  };

  const handleRefresh = () => {
    router.reload({ preserveState: true, preserveScroll: true });
  };

  const handleViewDetails = (activityId: string) => {
    router.get(`/residentsettings/activities/${activityId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <Badge variant="outline">Total</Badge>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All activities</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <LogIn className="h-5 w-5 text-blue-500" />
            <Badge variant="outline">Logins</Badge>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{stats.logins}</div>
            <p className="text-xs text-muted-foreground">Login attempts</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <DollarSign className="h-5 w-5 text-green-500" />
            <Badge variant="outline">Payments</Badge>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{stats.payments}</div>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <FileText className="h-5 w-5 text-purple-500" />
            <Badge variant="outline">Documents</Badge>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{stats.documents}</div>
            <p className="text-xs text-muted-foreground">Files accessed</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={selectedType} onValueChange={(v) => {
          setSelectedType(v);
          handleFilterChange('type', v);
        }}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Activity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="login">Logins</SelectItem>
            <SelectItem value="logout">Logouts</SelectItem>
            <SelectItem value="payment">Payments</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
            <SelectItem value="report">Reports</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={(v) => {
          setTimeRange(v);
          handleFilterChange('timeRange', v);
        }}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Summary */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm">Success: {stats.successful}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">Pending: {stats.pending}</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm">Failed: {stats.failed}</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              'group relative rounded-lg border transition-all hover:shadow-md',
              activity.status === 'failed' && 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/10',
              activity.status === 'pending' && 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/10',
              expandedId === activity.id && 'shadow-md'
            )}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  'p-2 rounded-full',
                  activity.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20' :
                  activity.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                  'bg-primary/10'
                )}>
                  {getActivityIcon(activity.type, activity.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{activity.action}</span>
                        {getStatusBadge(activity.status)}
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setExpandedId(expandedId === activity.id ? null : activity.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {activity.status === 'failed' && (
                            <DropdownMenuItem>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              View Error
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewDetails(activity.id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Full Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Metadata (always visible) */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {activity.ip_address && (
                      <span className="flex items-center gap-1 font-mono">
                        {activity.ip_address}
                      </span>
                    )}
                    {activity.device && (
                      <span className="flex items-center gap-1">
                        {activity.device}
                      </span>
                    )}
                    {activity.location && (
                      <span className="flex items-center gap-1">
                        📍 {activity.location}
                      </span>
                    )}
                    {activity.resource_id && (
                      <span className="flex items-center gap-1">
                        ID: {activity.resource_id}
                      </span>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {expandedId === activity.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">User Agent</p>
                          <p className="font-mono text-xs">{activity.user_agent || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Session ID</p>
                          <p className="font-mono text-xs">{activity.session_id || 'N/A'}</p>
                        </div>
                        {activity.metadata && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">Additional Data</p>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline Connector */}
            {index < activities.length - 1 && (
              <div className="absolute left-8 top-14 bottom-0 w-px bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {pagination.from} to {pagination.to} of {pagination.total} activities
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}