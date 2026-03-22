import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useMemo } from 'react';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Settings', href: '/residentsettings' },
  { title: 'Activities', href: '/residentsettings/activities' },
];

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
  clearances: number;
  loginSuccess: number;
  loginFailed: number;
  paymentSuccess: number;
  paymentPending: number;
  paymentFailed: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  profile?: number;
  security?: number;
  settings?: number;
}

interface Props {
  activities: ActivityItem[];
  stats: ActivityStats;
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
  activities = [],
  stats = {
    total: 0, successful: 0, pending: 0, failed: 0,
    logins: 0, payments: 0, documents: 0, audits: 0,
    clearances: 0,
    loginSuccess: 0, loginFailed: 0,
    paymentSuccess: 0, paymentPending: 0, paymentFailed: 0,
    today: 0, thisWeek: 0, thisMonth: 0,
    profile: 0, security: 0, settings: 0,
  },
  pagination = { current_page: 1, total: 0, per_page: 20, last_page: 1, from: 0, to: 0 }
}: Props) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filter activities based on active tab and search
  const filteredActivities = useMemo(() => {
    return activities
      .filter(activity => {
        if (activeTab !== 'all' && activity.type !== activeTab) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            activity.description?.toLowerCase().includes(query) ||
            activity.action?.toLowerCase().includes(query) ||
            activity.ip_address?.toLowerCase().includes(query) ||
            activity.resource_id?.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, activeTab, searchQuery]);

  const handleExport = (format: string) => {
    router.post('/residentsettings/activities/export', {
      format,
      filters: { 
        type: activeTab === 'all' ? undefined : activeTab,
        search: searchQuery || undefined
      }
    }, {
      onSuccess: () => toast.success(`Exporting as ${format.toUpperCase()}...`),
      onError: () => toast.error('Export failed')
    });
  };

  const getStatusStyle = (status?: string) => {
    const styles = {
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return status ? styles[status as keyof typeof styles] : '';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      login: '🔐', logout: '🚪', payment: '💰', document: '📄',
      profile: '👤', security: '🛡️', settings: '⚙️', report: '⚠️',
      announcement: '📢', clearance: '📋', audit: '🔍',
    };
    return icons[type] || '📋';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Activity Log" />
      <SettingsLayout>
        <div className="space-y-4 px-1 sm:px-2">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{pagination.total} total events</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full sm:w-auto border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  ⬇️ Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <DropdownMenuItem onClick={() => handleExport('csv')} className="text-gray-700 dark:text-gray-300">
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')} className="text-gray-700 dark:text-gray-300">
                  JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filters - Scrollable tabs on mobile */}
          <div className="space-y-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start overflow-x-auto h-10 gap-1 bg-transparent p-0">
                {[
                  { id: 'all', label: 'All', count: activities.length },
                  { id: 'login', label: 'Logins', count: activities.filter(a => a.type === 'login').length },
                  { id: 'payment', label: 'Payments', count: activities.filter(a => a.type === 'payment').length },
                  { id: 'document', label: 'Docs', count: activities.filter(a => a.type === 'document').length },
                  { id: 'clearance', label: 'Clear', count: activities.filter(a => a.type === 'clearance').length },
                  { id: 'profile', label: 'Profile', count: activities.filter(a => a.type === 'profile').length },
                  { id: 'security', label: 'Security', count: activities.filter(a => a.type === 'security').length },
                  { id: 'settings', label: 'Settings', count: activities.filter(a => a.type === 'settings').length },
                  { id: 'audit', label: 'Audit', count: activities.filter(a => a.type === 'audit').length },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300"
                  >
                    {tab.label} <span className="ml-1 text-xs opacity-70">({tab.count})</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            
            {/* Active filters */}
            {(activeTab !== 'all' || searchQuery) && (
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400">Filters:</span>
                {activeTab !== 'all' && (
                  <Badge variant="secondary" className="gap-1 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {activeTab}
                    <button onClick={() => setActiveTab('all')} className="ml-1 hover:text-red-600 dark:hover:text-red-400 text-base">×</button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-600 dark:hover:text-red-400 text-base">×</button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Activity List */}
          <div className="space-y-2">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm">No activities found</p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group relative"
                >
                  <div className="flex gap-2 sm:gap-3">
                    {/* Icon */}
                    <div className="text-2xl sm:text-3xl flex-shrink-0">{getTypeIcon(activity.type)}</div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-full text-gray-900 dark:text-white">
                            {activity.action}
                          </span>
                          {activity.status && (
                            <Badge className={cn("text-[10px] sm:text-xs px-1.5 py-0", getStatusStyle(activity.status))}>
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {activity.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px] sm:text-xs py-0 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {activity.type}
                        </Badge>
                        {activity.ip_address && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs py-0 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            🌐 {activity.ip_address}
                          </Badge>
                        )}
                        {activity.device && activity.device !== 'Unknown' && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs py-0 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            💻 {activity.device.length > 15 ? activity.device.substring(0, 15) + '…' : activity.device}
                          </Badge>
                        )}
                        {activity.resource_id && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs py-0 font-mono border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            🔖 {activity.resource_id}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          <span className="text-lg">⋯</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <DropdownMenuItem onClick={() => { setSelectedActivity(activity); setShowDetails(true); }} className="text-gray-700 dark:text-gray-300">
                          👁️ View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(activity, null, 2));
                          toast.success('Copied!');
                        }} className="text-gray-700 dark:text-gray-300">
                          📋 Copy
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Results count */}
          <div className="text-center py-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredActivities.length} of {activities.length} activities
            </p>
          </div>

          {/* Simple summary row - just text, no cards */}
          <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>Logins: {stats.loginSuccess} ok, {stats.loginFailed} failed</div>
              <div>Payments: {stats.paymentSuccess} done, {stats.paymentPending} pending</div>
              <div>Documents: {stats.documents} total</div>
              <div>Audits: {stats.audits} events</div>
            </div>
          </div>
        </div>

        {/* Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-2xl w-[95vw] p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-lg text-gray-900 dark:text-white">Activity Details</DialogTitle>
              <DialogDescription className="text-xs text-gray-600 dark:text-gray-400">
                Full details of the selected activity
              </DialogDescription>
            </DialogHeader>
            {selectedActivity && (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div><span className="text-gray-600 dark:text-gray-400">ID:</span> <span className="font-mono break-all text-gray-900 dark:text-white">{selectedActivity.id}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Type:</span> <span className="text-gray-900 dark:text-white">{selectedActivity.type}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Action:</span> <span className="text-gray-900 dark:text-white">{selectedActivity.action}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Status:</span> <span className="text-gray-900 dark:text-white">{selectedActivity.status}</span></div>
                  <div className="sm:col-span-2"><span className="text-gray-600 dark:text-gray-400">Description:</span> <span className="text-gray-900 dark:text-white">{selectedActivity.description}</span></div>
                  <div className="sm:col-span-2"><span className="text-gray-600 dark:text-gray-400">Time:</span> <span className="text-gray-900 dark:text-white">{new Date(selectedActivity.timestamp).toLocaleString()}</span></div>
                  {selectedActivity.ip_address && <div><span className="text-gray-600 dark:text-gray-400">IP:</span> <span className="text-gray-900 dark:text-white">{selectedActivity.ip_address}</span></div>}
                  {selectedActivity.device && <div><span className="text-gray-600 dark:text-gray-400">Device:</span> <span className="text-gray-900 dark:text-white">{selectedActivity.device}</span></div>}
                  {selectedActivity.resource_id && <div><span className="text-gray-600 dark:text-gray-400">Ref:</span> <span className="text-gray-900 dark:text-white">{selectedActivity.resource_id}</span></div>}
                </div>
                
                {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium mb-1 text-gray-900 dark:text-white">Metadata</h4>
                    <pre className="text-[10px] bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2 rounded max-h-40 overflow-auto border border-gray-200 dark:border-gray-700">
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDetails(false)}
                    className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Close
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedActivity, null, 2));
                      toast.success('Copied!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  >
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