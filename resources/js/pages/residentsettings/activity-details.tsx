import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Settings', href: '/residentsettings' },
  { title: 'Activities', href: '/residentsettings/activities' },
  { title: 'Activity Details', href: '#' },
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

interface Props {
  activity: ActivityItem;
}

export default function ActivityDetails({ activity }: Props) {
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(activity, null, 2));
    toast.success('Activity details copied to clipboard');
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(activity, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `activity-${activity.id}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Failed</Badge>;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      login: 'Login', logout: 'Logout', payment: 'Payment', document: 'Document',
      profile: 'Profile', security: 'Security', settings: 'Settings', report: 'Report',
      announcement: 'Announcement', view: 'View', clearance: 'Clearance', download: 'Download',
      support: 'Support', incident: 'Incident', backup: 'Backup', financial: 'Financial', audit: 'Audit',
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Activity Details" />
      <SettingsLayout>
        <div className="space-y-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/residentsettings/activities">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Activity Details</h1>
                <p className="text-sm text-muted-foreground">
                  Detailed information about this activity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ID</p>
                      <p className="text-sm font-mono bg-muted/50 px-2 py-1 rounded mt-1">{activity.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-sm mt-1">{getTypeLabel(activity.type)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Action</p>
                      <p className="text-sm mt-1">{activity.action}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(activity.status)}</div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{activity.description}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                      <p className="text-sm mt-1">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {activity.ip_address && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                          <p className="text-sm font-mono mt-1">{activity.ip_address}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Location</p>
                          <p className="text-sm mt-1">{activity.location || 'Unknown'}</p>
                        </div>
                      </>
                    )}
                    {activity.device && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Device</p>
                        <p className="text-sm mt-1">{activity.device}</p>
                      </div>
                    )}
                    {activity.resource_type && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Resource Type</p>
                        <p className="text-sm mt-1">{activity.resource_type}</p>
                      </div>
                    )}
                    {activity.resource_id && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Resource ID</p>
                        <p className="text-sm font-mono mt-1">{activity.resource_id}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Metadata */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs font-medium text-muted-foreground uppercase">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm font-mono bg-muted/50 p-2 rounded mt-1 break-all">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No additional metadata available
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Details
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => {
                    router.post('/residentsettings/activities/report', { 
                      id: activity.id,
                      reason: prompt('Please describe the issue:') || ''
                    });
                  }}>
                    🚩 Report Issue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}