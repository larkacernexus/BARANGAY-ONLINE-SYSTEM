import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
  Shield,
  Eye,
  EyeOff,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Bell,
  Globe,
  Lock,
  Database,
  UserX,
  FileText,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react'; // Add this import

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Settings',
    href: '/residentsettings',
  },
  {
    title: 'Privacy',
    href: '/residentsettings/privacy',
  },
];

// Dummy data for privacy settings
const privacySettings = {
  dataSharing: {
    analytics: true,
    personalizedAds: false,
    thirdPartySharing: false,
    researchParticipation: true,
  },
  communication: {
    emailNotifications: true,
    marketingEmails: false,
    smsNotifications: true,
    pushNotifications: true,
  },
  visibility: {
    profileVisibility: 'private',
    showOnlineStatus: true,
    showActivity: false,
    searchIndexing: true,
  },
};

// Dummy data for connected apps
const connectedApps = [
  {
    id: 1,
    name: 'Google',
    icon: 'G',
    permissions: ['Read profile', 'Access email'],
    lastUsed: '2 days ago',
    status: 'active',
  },
  {
    id: 2,
    name: 'Facebook',
    icon: 'F',
    permissions: ['Read basic info'],
    lastUsed: '1 week ago',
    status: 'active',
  },
  {
    id: 3,
    name: 'Slack',
    icon: 'S',
    permissions: ['Read profile', 'Post messages'],
    lastUsed: '1 month ago',
    status: 'inactive',
  },
];

// Dummy data for data types
const dataCategories = [
  { name: 'Personal Info', size: '2.5 MB', items: 15, lastUpdated: 'Today' },
  { name: 'Activity History', size: '15.2 MB', items: 245, lastUpdated: 'Yesterday' },
  { name: 'Messages', size: '8.7 MB', items: 89, lastUpdated: '3 days ago' },
  { name: 'Media Files', size: '45.8 MB', items: 12, lastUpdated: '1 week ago' },
];

export default function Privacy() {
  // Add state for active tab
  const [activeTab, setActiveTab] = useState<string>('data');

  const handleExportData = () => {
    alert('Exporting your data - This would trigger a data export process');
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      alert('Account deletion requested - This would initiate account deletion');
    }
  };

  const handleRevokeApp = (appId: number) => {
    alert(`Revoking access for app #${appId}`);
  };

  const handleUpdatePreferences = (category: string, setting: string, value: boolean) => {
    alert(`Updating ${category}.${setting} to ${value}`);
  };

  // Add state for privacy settings to make switches work
  const [settings, setSettings] = useState(privacySettings);

  const handleSettingChange = (category: keyof typeof settings, setting: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Privacy Settings" />
      
      <SettingsLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                Privacy Settings
              </h1>
              <p className="text-muted-foreground mt-2">
                Control how your data is collected, used, and shared
              </p>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
              Privacy Protected
            </Badge>
          </div>

          {/* Privacy Score Alert */}
          <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">Privacy Score: <span className="text-purple-600">85/100</span></div>
                  <div className="text-sm text-purple-700">
                    Your privacy settings are well configured. Consider disabling third-party data sharing.
                  </div>
                </div>
              </div>
              <Progress value={85} className="w-24" />
            </div>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="data">Data Controls</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="apps">Connected Apps</TabsTrigger>
              <TabsTrigger value="account">Account Data</TabsTrigger>
            </TabsList>

            {/* Data Controls Tab */}
            <TabsContent value="data" className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Sharing Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-500" />
                      Data Sharing Preferences
                    </CardTitle>
                    <CardDescription>
                      Control how your data is shared and used
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="analytics">Analytics & Usage Data</Label>
                        <p className="text-sm text-muted-foreground">
                          Help improve our services anonymously
                        </p>
                      </div>
                      <Switch 
                        id="analytics" 
                        checked={settings.dataSharing.analytics}
                        onCheckedChange={(checked) => handleSettingChange('dataSharing', 'analytics', checked)}
                      />
                    </div>
                    
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="personalized-ads">Personalized Advertising</Label>
                        <p className="text-sm text-muted-foreground">
                          Show ads based on your activity
                        </p>
                      </div>
                      <Switch 
                        id="personalized-ads" 
                        checked={settings.dataSharing.personalizedAds}
                        onCheckedChange={(checked) => handleSettingChange('dataSharing', 'personalizedAds', checked)}
                      />
                    </div>
                    
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="third-party">Third-Party Data Sharing</Label>
                        <p className="text-sm text-muted-foreground">
                          Share data with trusted partners
                        </p>
                      </div>
                      <Switch 
                        id="third-party" 
                        checked={settings.dataSharing.thirdPartySharing}
                        onCheckedChange={(checked) => handleSettingChange('dataSharing', 'thirdPartySharing', checked)}
                      />
                    </div>
                    
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="research">Research Participation</Label>
                        <p className="text-sm text-muted-foreground">
                          Contribute to anonymous research studies
                        </p>
                      </div>
                      <Switch 
                        id="research" 
                        checked={settings.dataSharing.researchParticipation}
                        onCheckedChange={(checked) => handleSettingChange('dataSharing', 'researchParticipation', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Visibility Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-500" />
                      Visibility Settings
                    </CardTitle>
                    <CardDescription>
                      Control who can see your information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant={settings.visibility.profileVisibility === 'public' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => handleSettingChange('visibility', 'profileVisibility', 'public')}
                        >
                          Public
                        </Button>
                        <Button 
                          variant={settings.visibility.profileVisibility === 'private' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => handleSettingChange('visibility', 'profileVisibility', 'private')}
                        >
                          Private
                        </Button>
                        <Button 
                          variant={settings.visibility.profileVisibility === 'friends' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => handleSettingChange('visibility', 'profileVisibility', 'friends')}
                        >
                          Friends Only
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="online-status">Show Online Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Let others see when you're online
                        </p>
                      </div>
                      <Switch 
                        id="online-status" 
                        checked={settings.visibility.showOnlineStatus}
                        onCheckedChange={(checked) => handleSettingChange('visibility', 'showOnlineStatus', checked)}
                      />
                    </div>
                    
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="activity">Show Activity</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your recent activity to others
                        </p>
                      </div>
                      <Switch 
                        id="activity" 
                        checked={settings.visibility.showActivity}
                        onCheckedChange={(checked) => handleSettingChange('visibility', 'showActivity', checked)}
                      />
                    </div>
                    
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="search-indexing">Search Engine Indexing</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow search engines to index your profile
                        </p>
                      </div>
                      <Switch 
                        id="search-indexing" 
                        checked={settings.visibility.searchIndexing}
                        onCheckedChange={(checked) => handleSettingChange('visibility', 'searchIndexing', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Tips */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-amber-500" />
                      Privacy Tips & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">Review Connected Apps</h4>
                        </div>
                        <p className="text-sm text-blue-700">
                          Regularly review and remove apps you no longer use to minimize data sharing.
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                          <EyeOff className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium">Limit Visibility</h4>
                        </div>
                        <p className="text-sm text-green-700">
                          Keep your profile private and only share with people you trust.
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Database className="h-5 w-5 text-purple-600" />
                          <h4 className="font-medium">Export Your Data</h4>
                        </div>
                        <p className="text-sm text-purple-700">
                          Regularly download your data to maintain a personal backup.
                        </p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          <h4 className="font-medium">Be Careful with Third-Party</h4>
                        </div>
                        <p className="text-sm text-amber-700">
                          Disable third-party data sharing unless absolutely necessary.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Communications Tab */}
            <TabsContent value="communications" className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Communication Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      Communication Preferences
                    </CardTitle>
                    <CardDescription>
                      Control how we communicate with you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Important updates about your account
                        </p>
                      </div>
                      <Switch 
                        id="email-notifications" 
                        checked={settings.communication.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange('communication', 'emailNotifications', checked)}
                      />
                    </div>
                    
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-emails">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Promotional emails and offers
                        </p>
                      </div>
                      <Switch 
                        id="marketing-emails" 
                        checked={settings.communication.marketingEmails}
                        onCheckedChange={(checked) => handleSettingChange('communication', 'marketingEmails', checked)}
                      />
                    </div>
                    
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Text messages for important alerts
                        </p>
                      </div>
                      <Switch 
                        id="sms-notifications" 
                        checked={settings.communication.smsNotifications}
                        onCheckedChange={(checked) => handleSettingChange('communication', 'smsNotifications', checked)}
                      />
                    </div>
                    
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          App notifications on your devices
                        </p>
                      </div>
                      <Switch 
                        id="push-notifications" 
                        checked={settings.communication.pushNotifications}
                        onCheckedChange={(checked) => handleSettingChange('communication', 'pushNotifications', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-purple-500" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>
                      Fine-tune your notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Notification Frequency</Label>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Real-time</Button>
                        <Button variant="default" size="sm">Daily Digest</Button>
                        <Button variant="outline" size="sm">Weekly</Button>
                      </div>
                    </div>
                    
                    <Separator />

                    <div className="space-y-2">
                      <Label>Quiet Hours</Label>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">10 PM - 7 AM</Button>
                        <Button variant="outline" size="sm">Custom</Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        During quiet hours, you'll only receive critical notifications
                      </p>
                    </div>
                    
                    <Separator />

                    <div className="space-y-2">
                      <Label>Notification Channels</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Bell className="h-3 w-3" />
                          Push
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Globe className="h-3 w-3" />
                          In-app
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Connected Apps Tab */}
            <TabsContent value="apps" className="space-y-6 animate-in fade-in duration-300">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-500" />
                    Connected Apps & Services
                  </CardTitle>
                  <CardDescription>
                    Apps and services with access to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connectedApps.map((app) => (
                      <div key={app.id} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                              {app.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{app.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Last used: {app.lastUsed}</span>
                                <span>•</span>
                                <Badge 
                                  variant={app.status === 'active' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {app.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRevokeApp(app.id)}
                          >
                            Revoke Access
                          </Button>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {app.permissions.map((permission, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/30">
                  <div className="text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Review connected apps regularly to ensure only trusted services have access to your data.
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Account Data Tab */}
            <TabsContent value="account" className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-500" />
                      Your Data
                    </CardTitle>
                    <CardDescription>
                      View and manage your personal data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dataCategories.map((category) => (
                      <div key={category.name} className="flex items-center justify-between p-3 hover:bg-accent/30 rounded">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {category.items} items • {category.size} • Updated {category.lastUpdated}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="border-t">
                    <Button variant="outline" className="w-full" onClick={handleExportData}>
                      <Download className="mr-2 h-4 w-4" />
                      Export All Data
                    </Button>
                  </CardFooter>
                </Card>

                {/* Account Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-red-500" />
                      Account Actions
                    </CardTitle>
                    <CardDescription>
                      Advanced privacy actions for your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3 mb-3">
                        <UserX className="h-5 w-5 text-red-600" />
                        <div>
                          <h4 className="font-medium text-red-800">Delete Account</h4>
                          <p className="text-sm text-red-700">
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-red-600 mb-3">
                        Warning: This action cannot be undone. All your data will be permanently deleted.
                      </p>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete My Account
                      </Button>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-3 mb-2">
                        <EyeOff className="h-5 w-5 text-amber-600" />
                        <div>
                          <h4 className="font-medium text-amber-800">Temporarily Deactivate</h4>
                          <p className="text-sm text-amber-700">
                            Hide your account temporarily without deleting data
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Deactivate Account
                      </Button>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Eye className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-800">Download Privacy Report</h4>
                          <p className="text-sm text-green-700">
                            Get a detailed report of your privacy settings
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Privacy Notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Your Privacy Rights:</p>
                <ul className="text-sm space-y-1">
                  <li>• You have the right to access, correct, or delete your personal data</li>
                  <li>• You can object to or restrict the processing of your data</li>
                  <li>• You have the right to data portability</li>
                  <li>• You can withdraw consent at any time</li>
                  <li>• Contact our privacy team for any concerns or questions</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}