import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { 
  Bell,
  Mail,
  MessageCircle,
  Home,
  DollarSign,
  FileCheck,
  Megaphone,
  Flag,
  Moon,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Settings', href: '/residentsettings' },
  { title: 'Preferences', href: '/residentsettings/preferences' },
  { title: 'Notifications', href: '/residentsettings/preferences/notifications' },
];

interface PageProps {
  preferences: {
    clearance: boolean;
    fees: boolean;
    household: boolean;
    announcements: boolean;
    reports: boolean;
    email: boolean;
    sms: boolean;
    quiet_hours: boolean;
  };
  stats: {
    total: number;
    unread: number;
  };
  channels: {
    email: string;
    phone: string | null;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

// Simple category component
const CategoryToggle = ({ 
  icon: Icon, 
  label, 
  description,
  checked, 
  onToggle,
  saving
}: { 
  icon: any; 
  label: string; 
  description: string;
  checked: boolean; 
  onToggle: () => void;
  saving?: boolean;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <Label className="font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      <Switch checked={checked} onCheckedChange={onToggle} disabled={saving} />
    </div>
  </div>
);

export default function NotificationPreferences() {
  const { props } = usePage<PageProps>();
  const { preferences: initial, stats, channels, flash } = props;
  
  const [preferences, setPreferences] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [pendingSave, setPendingSave] = useState<NodeJS.Timeout | null>(null);

  // Update local state when server props change
  useEffect(() => {
    setPreferences(initial);
  }, [initial]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pendingSave) {
        clearTimeout(pendingSave);
      }
    };
  }, [pendingSave]);

  const savePreferences = (newPreferences: typeof preferences) => {
    setSaving(true);
    
    router.post(route('user.notification-preferences.update'), newPreferences, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page) => {
        setSaving(false);
        if (page.props.preferences) {
          setPreferences(page.props.preferences);
        }
        if (page.props.flash?.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        setSaving(false);
        console.error('Save error:', errors);
        toast.error('Failed to save preferences');
        // Revert to initial on error
        setPreferences(initial);
      }
    });
  };

  const toggle = (key: keyof typeof preferences) => {
    // Clear any pending save
    if (pendingSave) {
      clearTimeout(pendingSave);
    }

    // Update local state immediately
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);

    // Debounce the save to avoid too many requests
    const timeout = setTimeout(() => {
      savePreferences(newPreferences);
    }, 500); // Wait 500ms after last toggle before saving

    setPendingSave(timeout);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notification Preferences" />
      
      <SettingsLayout>
        <div className="space-y-6">
          {/* Flash error message */}
          {flash?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{flash.error}</AlertDescription>
            </Alert>
          )}

          {/* Flash success message */}
          {flash?.success && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {flash.success}
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Notification Preferences
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Choose what notifications you want to receive
              </p>
            </div>
            <div className="flex items-center gap-2">
              {saving && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              <Badge variant="outline" className="text-sm">
                {stats.unread} unread of {stats.total}
              </Badge>
            </div>
          </div>

          {/* Main Card */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Categories</CardTitle>
              <CardDescription>
                Turn notifications on/off for each category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <CategoryToggle
                icon={FileCheck}
                label="Clearance"
                description="Clearance requests, approvals, and updates"
                checked={preferences.clearance}
                onToggle={() => toggle('clearance')}
                saving={saving}
              />
              <Separator />
              
              <CategoryToggle
                icon={DollarSign}
                label="Fees & Payments"
                description="New fees, due dates, and payment confirmations"
                checked={preferences.fees}
                onToggle={() => toggle('fees')}
                saving={saving}
              />
              <Separator />
              
              <CategoryToggle
                icon={Home}
                label="Household"
                description="Member updates, verification, and transfers"
                checked={preferences.household}
                onToggle={() => toggle('household')}
                saving={saving}
              />
              <Separator />
              
              <CategoryToggle
                icon={Megaphone}
                label="Announcements"
                description="Barangay announcements and events"
                checked={preferences.announcements}
                onToggle={() => toggle('announcements')}
                saving={saving}
              />
              <Separator />
              
              <CategoryToggle
                icon={Flag}
                label="Reports"
                description="Report submissions and updates"
                checked={preferences.reports}
                onToggle={() => toggle('reports')}
                saving={saving}
              />
            </CardContent>
          </Card>

          {/* Delivery Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Where to receive</CardTitle>
              <CardDescription>Choose your notification channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <Label>Email</Label>
                    <p className="text-xs text-muted-foreground">{channels.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {saving && preferences.email !== initial.email && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Switch 
                    checked={preferences.email} 
                    onCheckedChange={() => toggle('email')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <Label>SMS</Label>
                    <p className="text-xs text-muted-foreground">
                      {channels.phone || 'No phone number set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {saving && preferences.sms !== initial.sms && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Switch 
                    checked={preferences.sms} 
                    onCheckedChange={() => toggle('sms')}
                    disabled={!channels.phone || saving}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-purple-500" />
                  <div>
                    <Label>Quiet Hours</Label>
                    <p className="text-xs text-muted-foreground">
                      Mute notifications at night
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {saving && preferences.quiet_hours !== initial.quiet_hours && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Switch 
                    checked={preferences.quiet_hours} 
                    onCheckedChange={() => toggle('quiet_hours')}
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optional: Manual Save Button (as backup) */}
          <div className="flex justify-end gap-2">
            {saving && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mr-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            <Button 
              onClick={() => savePreferences(preferences)} 
              disabled={saving} 
              variant="outline"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Now
            </Button>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}