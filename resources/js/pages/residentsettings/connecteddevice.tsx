import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { 
  Smartphone, 
  Monitor, 
  Tablet,
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  MapPin,
  LogOut,
  RefreshCw,
  Shield,
  Laptop,
  MoreVertical,
  Info,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Settings',
    href: '/residentsettings',
  },
  {
    title: 'Connected Devices',
    href: '/residentsettings/devices',
  },
];

// Types from backend
interface Device {
  id: number;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet' | 'laptop';
  browser: string;
  os: string;
  ip_address: string;
  location: string;
  last_active: string;
  last_active_human: string;
  is_current: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  is_trusted: boolean;
  user_agent: string;
}

interface SessionHistory {
  id: number;
  device_name: string;
  action: 'login' | 'logout' | 'login_attempt';
  location: string;
  created_at: string;
  created_at_human: string;
  status: 'success' | 'failed';
  ip_address: string;
}

interface SecurityStats {
  total_devices: number;
  active_devices: number;
  inactive_devices: number;
  suspicious_count: number;
  two_factor_enabled: boolean;
  security_score: number;
  inactive_warning_count: number;
}

// Define Flash interface
interface Flash {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

// Extend PageProps with index signature to satisfy Inertia's constraints
interface PageProps {
  devices: Device[];
  sessionHistory: SessionHistory[];
  securityStats: SecurityStats;
  flash?: Flash;
  [key: string]: unknown; // Add index signature for Inertia compatibility
}

// Device Icon Mapper
const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'mobile':
      return Smartphone;
    case 'tablet':
      return Tablet;
    case 'laptop':
      return Laptop;
    default:
      return Monitor;
  }
};

// Device Card Component
const DeviceCard = ({ 
  device, 
  isCurrent = false,
  onLogout,
  onTrust,
  onUntrust,
  isProcessing 
}: { 
  device: Device;
  isCurrent?: boolean;
  onLogout: (id: number) => void;
  onTrust?: (id: number) => void;
  onUntrust?: (id: number) => void;
  isProcessing: boolean;
}) => {
  const Icon = getDeviceIcon(device.type);
  
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-colors",
      isCurrent && "bg-green-500/5 border-green-500/20 dark:bg-green-500/10 dark:border-green-500/30",
      device.is_trusted && !isCurrent && "bg-blue-500/5 border-blue-500/20 dark:bg-blue-500/10 dark:border-blue-500/30",
      !isCurrent && !device.is_trusted && "hover:bg-accent/50 dark:hover:bg-accent/20"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isCurrent && "bg-green-100 dark:bg-green-900/30",
            device.is_trusted && !isCurrent && "bg-blue-100 dark:bg-blue-900/30",
            !isCurrent && !device.is_trusted && "bg-gray-100 dark:bg-gray-900"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              isCurrent && "text-green-600 dark:text-green-400",
              device.is_trusted && !isCurrent && "text-blue-600 dark:text-blue-400",
              !isCurrent && !device.is_trusted && "text-gray-500 dark:text-gray-400"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium dark:text-gray-100">{device.name}</h4>
              {isCurrent && (
                <Badge variant="default" className="bg-green-500 text-white text-xs">
                  Current Device
                </Badge>
              )}
              {device.is_trusted && !isCurrent && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-xs">
                  Trusted
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              {device.browser} • {device.os}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 dark:hover:bg-gray-900">
              <MoreVertical className="h-4 w-4 dark:text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dark:bg-gray-900 dark:border-gray-800">
            {!isCurrent && (
              <DropdownMenuItem 
                onClick={() => onLogout(device.id)}
                disabled={isProcessing}
                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 dark:focus:bg-red-950/30"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out Device
              </DropdownMenuItem>
            )}
            {!isCurrent && device.is_trusted ? (
              <DropdownMenuItem 
                onClick={() => onUntrust?.(device.id)}
                disabled={isProcessing}
                className="dark:text-gray-300 dark:focus:bg-gray-900"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Remove Trust
              </DropdownMenuItem>
            ) : !isCurrent && !device.is_trusted ? (
              <DropdownMenuItem 
                onClick={() => onTrust?.(device.id)}
                disabled={isProcessing}
                className="dark:text-gray-300 dark:focus:bg-gray-900"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Trust Device
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem className="dark:text-gray-300 dark:focus:bg-gray-900">
              <Info className="mr-2 h-4 w-4" />
              Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
        <div className="flex items-center gap-2">
          <Globe className="h-3 w-3 text-muted-foreground dark:text-gray-500" />
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{device.ip_address}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-muted-foreground dark:text-gray-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">{device.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Last active: {device.last_active_human}</span>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs",
            device.status === 'active' 
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800' 
              : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700'
          )}
        >
          {device.status === 'active' ? (
            <><Wifi className="h-3 w-3 mr-1" /> Active</>
          ) : (
            <><WifiOff className="h-3 w-3 mr-1" /> Inactive</>
          )}
        </Badge>
      </div>
    </div>
  );
};

// Session History Item Component
const SessionItem = ({ session }: { session: SessionHistory }) => (
  <div className="flex items-center justify-between p-2 hover:bg-accent/30 dark:hover:bg-gray-900/50 rounded">
    <div>
      <div className="font-medium text-sm dark:text-gray-200">{session.device_name}</div>
      <div className="text-xs text-muted-foreground dark:text-gray-400">
        {session.location} • {session.created_at_human}
        {session.ip_address && <span className="ml-2 font-mono">({session.ip_address})</span>}
      </div>
    </div>
    <Badge 
      variant="outline" 
      className={
        session.status === 'success' 
          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800' 
          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
      }
    >
      {session.status === 'success' ? 'Success' : 'Failed'}
    </Badge>
  </div>
);

// Loading Skeleton
const DevicesSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Skeleton className="h-8 w-48 dark:bg-gray-900" />
        <Skeleton className="h-4 w-64 mt-2 dark:bg-gray-900" />
      </div>
      <Skeleton className="h-9 w-24 dark:bg-gray-900" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-64 w-full dark:bg-gray-900" />
        <Skeleton className="h-80 w-full dark:bg-gray-900" />
        <Skeleton className="h-96 w-full dark:bg-gray-900" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48 w-full dark:bg-gray-900" />
        <Skeleton className="h-64 w-full dark:bg-gray-900" />
        <Skeleton className="h-72 w-full dark:bg-gray-900" />
        <Skeleton className="h-48 w-full dark:bg-gray-900" />
      </div>
    </div>
  </div>
);

export default function ConnectedDevices() {
  // Properly type the usePage hook
  const { props } = usePage<PageProps>();
  const { devices, sessionHistory, securityStats, flash } = props;
  
  const [processing, setProcessing] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogoutDevice = (deviceId: number) => {
    setProcessing(deviceId);
    
    router.post(route('user.devices.logout'), {
      device_id: deviceId
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setProcessing(null);
      },
      onError: () => {
        setProcessing(null);
      }
    });
  };

  const handleLogoutAll = () => {
    if (!confirm('Are you sure you want to log out from all other devices?')) {
      return;
    }

    setProcessing(-1);
    
    router.post(route('user.devices.logout-all'), {}, {
      preserveScroll: true,
      onSuccess: () => {
        setProcessing(null);
      },
      onError: () => {
        setProcessing(null);
      }
    });
  };

  const handleTrustDevice = (deviceId: number) => {
    setProcessing(deviceId);
    
    router.post(route('user.devices.trust'), {
      device_id: deviceId
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setProcessing(null);
      },
      onError: () => {
        setProcessing(null);
      }
    });
  };

  const handleUntrustDevice = (deviceId: number) => {
    setProcessing(deviceId);
    
    router.post(route('user.devices.untrust'), {
      device_id: deviceId
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setProcessing(null);
      },
      onError: () => {
        setProcessing(null);
      }
    });
  };

  const handleReportSuspicious = () => {
    router.post(route('user.devices.report-suspicious'), {}, {
      preserveScroll: true
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    router.reload({
      only: ['devices', 'sessionHistory', 'securityStats'],
      onFinish: () => setRefreshing(false)
    });
  };

  if (!devices || !sessionHistory || !securityStats) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Connected Devices" />
        <SettingsLayout>
          <DevicesSkeleton />
        </SettingsLayout>
      </AppLayout>
    );
  }

  const currentDevice = devices.find(d => d.is_current);
  const activeDevices = devices.filter(d => d.status === 'active' && !d.is_current);
  const inactiveDevices = devices.filter(d => d.status === 'inactive');
  const trustedDevices = devices.filter(d => d.is_trusted && !d.is_current);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Connected Devices" />
      
      <SettingsLayout>
        <div className="space-y-6">
          {/* Flash Messages - Fixed variant types */}
          {flash?.success && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-300">
                {flash.success}
              </AlertDescription>
            </Alert>
          )}
          
          {flash?.error && (
            <Alert variant="destructive" className="dark:bg-red-950 dark:border-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="dark:text-red-300">
                {flash.error}
              </AlertDescription>
            </Alert>
          )}

          {flash?.warning && (
            <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                {flash.warning}
              </AlertDescription>
            </Alert>
          )}

          {flash?.info && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                {flash.info}
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 dark:text-gray-100">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                  <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Connected Devices
              </h1>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                Manage devices that have access to your account
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Security Alert */}
          <Alert className={cn(
            "border",
            securityStats.suspicious_count > 0
              ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
              : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
          )}>
            <Shield className={cn(
              "h-4 w-4",
              securityStats.suspicious_count > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            )} />
            <AlertDescription className={cn(
              securityStats.suspicious_count > 0
                ? 'text-red-800 dark:text-red-300'
                : 'text-blue-800 dark:text-blue-300'
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-medium">Security Status:</span>
                  <span className={cn(
                    "ml-2 font-medium",
                    securityStats.suspicious_count > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  )}>
                    {securityStats.suspicious_count > 0
                      ? `${securityStats.suspicious_count} suspicious ${securityStats.suspicious_count === 1 ? 'device' : 'devices'} detected`
                      : 'All devices are recognized'
                    }
                  </span>
                </div>
                <Badge variant="outline" className="bg-white dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 w-fit">
                  {securityStats.active_devices} active • {securityStats.inactive_devices} inactive
                </Badge>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Devices */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Device */}
              {currentDevice && (
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base dark:text-gray-100">Current Device</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DeviceCard
                      device={currentDevice}
                      isCurrent={true}
                      onLogout={handleLogoutDevice}
                      isProcessing={processing === currentDevice.id}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Trusted Devices */}
              {trustedDevices.length > 0 && (
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base dark:text-gray-100">Trusted Devices</CardTitle>
                      <Badge variant="outline" className="dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">{trustedDevices.length}</Badge>
                    </div>
                    <CardDescription className="text-xs dark:text-gray-400">
                      Devices you've marked as trusted
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trustedDevices.map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onLogout={handleLogoutDevice}
                        onUntrust={handleUntrustDevice}
                        isProcessing={processing === device.id}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Other Active Devices */}
              {activeDevices.length > 0 && (
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base dark:text-gray-100">Other Active Devices</CardTitle>
                      <Badge variant="outline" className="dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">{activeDevices.length}</Badge>
                    </div>
                    <CardDescription className="text-xs dark:text-gray-400">
                      Devices currently logged into your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeDevices.map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onLogout={handleLogoutDevice}
                        onTrust={handleTrustDevice}
                        isProcessing={processing === device.id}
                      />
                    ))}
                  </CardContent>
                  {activeDevices.length > 0 && (
                    <CardFooter className="border-t bg-muted/30 dark:bg-gray-900/50 dark:border-gray-700">
                      <Button 
                        variant="outline" 
                        className="w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                        onClick={handleLogoutAll}
                        disabled={processing === -1}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {processing === -1 ? 'Logging out...' : 'Log Out From All Other Devices'}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}

              {/* Inactive Devices */}
              {inactiveDevices.length > 0 && (
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base dark:text-gray-100">Inactive Devices</CardTitle>
                      <Badge variant="outline" className="dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">{inactiveDevices.length}</Badge>
                    </div>
                    <CardDescription className="text-xs dark:text-gray-400">
                      Devices that haven't been active recently
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inactiveDevices.map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onLogout={handleLogoutDevice}
                        onTrust={handleTrustDevice}
                        isProcessing={processing === device.id}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Stats & Security */}
            <div className="space-y-6">
              {/* Security Stats */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground dark:text-gray-400">Account Security</span>
                      <span className={cn(
                        "font-medium",
                        securityStats.security_score >= 80
                          ? 'text-green-600 dark:text-green-400'
                          : securityStats.security_score >= 60
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                      )}>
                        {securityStats.security_score}%
                      </span>
                    </div>
                    <Progress 
                      value={securityStats.security_score} 
                      className="h-2 dark:bg-gray-900"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg dark:bg-blue-950/30">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {securityStats.active_devices}
                      </div>
                      <div className="text-xs text-muted-foreground dark:text-gray-400">Active</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg dark:bg-red-950/30">
                      <div className="text-xl font-bold text-red-600 dark:text-red-400">
                        {securityStats.suspicious_count}
                      </div>
                      <div className="text-xs text-muted-foreground dark:text-gray-400">Suspicious</div>
                    </div>
                  </div>

                  <Separator className="dark:bg-gray-900" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={cn(
                        "h-4 w-4",
                        securityStats.suspicious_count === 0
                          ? 'text-green-500 dark:text-green-400'
                          : 'text-gray-300 dark:text-gray-600'
                      )} />
                      <span className="text-xs text-gray-600 dark:text-gray-300">All devices recognized</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={cn(
                        "h-4 w-4",
                        securityStats.two_factor_enabled
                          ? 'text-green-500 dark:text-green-400'
                          : 'text-gray-300 dark:text-gray-600'
                      )} />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        2FA {securityStats.two_factor_enabled ? 'enabled' : 'disabled'}
                      </span>
                    </div>
                    {securityStats.inactive_warning_count > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {securityStats.inactive_warning_count} inactive for 7+ days
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              {sessionHistory.length > 0 && (
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base dark:text-gray-100">Recent Activity</CardTitle>
                    <CardDescription className="text-xs dark:text-gray-400">Latest login attempts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sessionHistory.slice(0, 5).map(session => (
                      <SessionItem key={session.id} session={session} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Security Tips */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Security Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium dark:text-gray-200">Log out unused devices</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">
                        Keep your account secure by logging out from devices you no longer use
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0 dark:text-amber-400" />
                    <div>
                      <p className="text-sm font-medium dark:text-gray-200">Check unrecognized locations</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">
                        Report any login attempts from unfamiliar locations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium dark:text-gray-200">Enable 2FA</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base dark:text-gray-100">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm h-9 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                    onClick={handleLogoutAll}
                    disabled={processing === -1}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {processing === -1 ? 'Logging out...' : 'Log Out Everywhere'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm h-9 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                    onClick={handleReportSuspicious}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report Suspicious Activity
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm h-9 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                    asChild
                  >
                    <a href="/residentsettings/security">
                      <Shield className="mr-2 h-4 w-4" />
                      Security Settings
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Warning - Only show if suspicious activity */}
          {securityStats.suspicious_count > 0 && (
            <Alert variant="destructive" className="dark:bg-red-950 dark:border-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-sm dark:text-red-300">
                    <span className="font-medium">Warning:</span> We've detected {securityStats.suspicious_count} suspicious device{securityStats.suspicious_count > 1 ? 's' : ''}. 
                    Log out immediately and change your password.
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full sm:w-auto dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-100"
                    asChild
                  >
                    <a href="/residentsettings/security/password">
                      Secure Account Now
                    </a>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}