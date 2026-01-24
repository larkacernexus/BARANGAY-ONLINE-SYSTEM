import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
  Smartphone, 
  Monitor, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  MapPin,
  LogOut,
  RefreshCw,
  Shield,
  Tablet,
  Laptop
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

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

// Dummy data for connected devices
const devices = [
  {
    id: 1,
    name: 'iPhone 14 Pro',
    type: 'mobile',
    icon: Smartphone,
    browser: 'Safari',
    os: 'iOS 16.5',
    ip: '192.168.1.105',
    location: 'New York, USA',
    lastActive: '5 minutes ago',
    isCurrent: true,
    status: 'active',
  },
  {
    id: 2,
    name: 'MacBook Pro',
    type: 'desktop',
    icon: Monitor,
    browser: 'Chrome 119',
    os: 'macOS Ventura',
    ip: '192.168.1.110',
    location: 'New York, USA',
    lastActive: '2 hours ago',
    isCurrent: false,
    status: 'active',
  },
  {
    id: 3,
    name: 'Windows Desktop',
    type: 'desktop',
    icon: Monitor,
    browser: 'Firefox 118',
    os: 'Windows 11',
    ip: '203.0.113.25',
    location: 'London, UK',
    lastActive: '3 days ago',
    isCurrent: false,
    status: 'inactive',
  },
  {
    id: 4,
    name: 'Android Tablet',
    type: 'tablet',
    icon: Tablet,
    browser: 'Chrome Mobile',
    os: 'Android 13',
    ip: '198.51.100.42',
    location: 'Tokyo, Japan',
    lastActive: '1 week ago',
    isCurrent: false,
    status: 'inactive',
  },
];

// Dummy data for session history
const sessionHistory = [
  { id: 1, device: 'iPhone 14 Pro', action: 'Login', location: 'New York', time: 'Today, 10:30 AM', status: 'success' },
  { id: 2, device: 'MacBook Pro', action: 'Login', location: 'New York', time: 'Yesterday, 3:45 PM', status: 'success' },
  { id: 3, device: 'Unknown Device', action: 'Login Attempt', location: 'Berlin, Germany', time: '2 days ago', status: 'failed' },
  { id: 4, device: 'Windows Desktop', action: 'Logout', location: 'London', time: '3 days ago', status: 'success' },
];

export default function ConnectedDevices() {
  const activeDevices = devices.filter(d => d.status === 'active');
  const inactiveDevices = devices.filter(d => d.status === 'inactive');

  const handleLogoutDevice = (deviceId: number) => {
    alert(`Logging out device #${deviceId} - This would be a real API call`);
  };

  const handleLogoutAll = () => {
    alert('Logging out all other devices - This would be a real API call');
  };

  const handleRefresh = () => {
    alert('Refreshing device list - This would be a real API call');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Connected Devices" />
      
      <SettingsLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                Connected Devices
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage devices that have access to your account
              </p>
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Security Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Security Status:</span>
                  <span className="ml-2 text-green-600 font-medium">All devices are recognized</span>
                </div>
                <Badge variant="outline" className="bg-white">
                  {activeDevices.length} active • {inactiveDevices.length} inactive
                </Badge>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Active Devices */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Device Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Current Device
                    </CardTitle>
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      Active Now
                    </Badge>
                  </div>
                  <CardDescription>
                    You're currently using this device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {devices
                    .filter(device => device.isCurrent)
                    .map(device => (
                      <div key={device.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <device.icon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{device.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {device.browser} • {device.os}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="bg-white">
                                This Device
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span>{device.ip}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{device.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Active now • Last activity: {device.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Other Active Devices */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-blue-500" />
                      Other Active Devices
                    </CardTitle>
                    <Badge variant="outline">
                      {activeDevices.filter(d => !d.isCurrent).length} devices
                    </Badge>
                  </div>
                  <CardDescription>
                    Devices currently logged into your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeDevices
                    .filter(device => !device.isCurrent)
                    .map(device => (
                      <div key={device.id} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <device.icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{device.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {device.browser} • {device.os}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleLogoutDevice(device.id)}
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Log Out
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{device.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{device.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {activeDevices.filter(d => !d.isCurrent).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Monitor className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No other active devices</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/30">
                  <Button variant="outline" className="w-full" onClick={handleLogoutAll}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out From All Other Devices
                  </Button>
                </CardFooter>
              </Card>

              {/* Inactive Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Inactive Devices
                  </CardTitle>
                  <CardDescription>
                    Devices that haven't been active recently
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inactiveDevices.map(device => (
                    <div key={device.id} className="p-4 rounded-lg border opacity-75">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <device.icon className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">{device.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {device.browser} • {device.os}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" disabled>
                          Inactive
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{device.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{device.lastActive}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Security */}
            <div className="space-y-6">
              {/* Security Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Account Security</span>
                      <span className="font-medium text-green-600">High</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{activeDevices.length}</div>
                      <div className="text-xs text-muted-foreground">Active Devices</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-xs text-muted-foreground">Suspicious</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>All recognized devices</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>2FA enabled</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span>1 inactive device for 7+ days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest login attempts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessionHistory.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-2 hover:bg-accent/30 rounded">
                      <div>
                        <div className="font-medium text-sm">{session.device}</div>
                        <div className="text-xs text-muted-foreground">
                          {session.location} • {session.time}
                        </div>
                      </div>
                      {session.status === 'success' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Failed
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Security Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Security Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 p-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Log out unused devices</p>
                      <p className="text-xs text-muted-foreground">
                        Keep your account secure by logging out from devices you no longer use
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Check unrecognized locations</p>
                      <p className="text-xs text-muted-foreground">
                        Report any login attempts from unfamiliar locations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2">
                    <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Enable 2FA</p>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handleLogoutAll}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out Everywhere
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report Suspicious Activity
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    View Security Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Warning:</span> If you notice any unfamiliar devices or locations, 
                  log out immediately and change your password.
                </div>
                <Button variant="destructive" size="sm">
                  Secure Account
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}