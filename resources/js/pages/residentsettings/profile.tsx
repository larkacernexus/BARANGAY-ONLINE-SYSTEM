import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { CheckCircle, Mail, ShieldAlert, User, AlertCircle, Camera, Phone, Home, Calendar, Briefcase, Book, Heart, Shield, Info, Users, UserCheck, QrCode, Download, Printer, RefreshCw, AlertTriangle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  TabsScrollContainer 
} from '@/components/ui/tabs';

// Hardcoded URLs
const PROFILE_VIEW_URL = '/residentsettings/profile';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Settings',
    href: '/residentsettings',
  },
  {
    title: 'Profile',
    href: PROFILE_VIEW_URL,
  },
];

// Helper functions
const getInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return '??';
  }
  
  return name
    .trim()
    .split(' ')
    .map(part => part[0])
    .filter(char => char && char.match(/[a-zA-ZÀ-ÿ]/))
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';
};

const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

const calculateAge = (birthDate: string | undefined | null): number | null => {
  if (!birthDate) return null;
  
  try {
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    console.error('Age calculation error:', error);
    return null;
  }
};

// Safe avatar URL getter
const getAvatarUrl = (photoPath?: string): string | null => {
  if (!photoPath) return null;
  
  if (photoPath.startsWith('http')) {
    return photoPath;
  }
  
  if (photoPath.startsWith('/')) {
    return photoPath;
  }
  
  return `/storage/${photoPath}`;
};

// Simple Info Row Component - Just a div with border-b
const InfoRow = ({ 
  label, 
  value, 
  icon: Icon,
  className = '',
  noBorder = false
}: { 
  label: string; 
  value: React.ReactNode; 
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  noBorder?: boolean;
}) => (
  <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between py-3 gap-1 sm:gap-2 ${!noBorder ? 'border-b border-border/50' : ''} ${className}`}>
    <div className="flex items-center gap-2 text-muted-foreground">
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      <span className="text-sm">{label}</span>
    </div>
    <div className="sm:text-right font-medium pl-6 sm:pl-0">
      {typeof value === 'string' || typeof value === 'number' ? (
        <span className="break-words">{value || '—'}</span>
      ) : (
        value
      )}
    </div>
  </div>
);

// QR Code Component - For faster login
const LoginQRCode = ({ 
  userId,
  existingQrCodeUrl,
  qrToken 
}: { 
  userId: number;
  existingQrCodeUrl?: string | null;
  qrToken?: string | null;
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(existingQrCodeUrl || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Update local state when props change (e.g., after page reload)
  useEffect(() => {
    if (existingQrCodeUrl) {
      setQrCodeUrl(existingQrCodeUrl);
    }
  }, [existingQrCodeUrl]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    setError(null);
    setImageError(false);
    
    try {
      router.post('/residentsettings/qr/generate', {}, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          // Force a full page reload to get fresh data from database
          router.reload({ 
            only: ['user'],
            onSuccess: () => {
              setIsGenerating(false);
            }
          });
        },
        onError: (errors) => {
          setError('Failed to generate QR code. Please try again.');
          setIsGenerating(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      setIsGenerating(false);
    }
  };

  const regenerateQRCode = async () => {
    setIsGenerating(true);
    setError(null);
    setImageError(false);
    setShowRegenerateConfirm(false);
    
    try {
      router.post('/residentsettings/qr/regenerate', {}, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          // Force a full page reload to get fresh data from database
          router.reload({ 
            only: ['user'],
            onSuccess: () => {
              setIsGenerating(false);
            }
          });
        },
        onError: (errors) => {
          setError('Failed to regenerate QR code. Please try again.');
          setIsGenerating(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate QR code');
      setIsGenerating(false);
    }
  };

  const toggleQrLogin = async () => {
    const route = isEnabled ? '/residentsettings/qr/disable' : '/residentsettings/qr/enable';
    
    router.post(route, {}, {
      preserveScroll: true,
      onSuccess: () => {
        setIsEnabled(!isEnabled);
      },
    });
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `login-qrcode-user-${userId}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = () => {
    if (!qrCodeUrl) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the QR code');
      return;
    }
    
    const loginUrl = `${window.location.origin}/qr-login/${qrToken || 'user-token'}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Quick Login QR Code</title>
          <style>
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              margin: 0;
              flex-direction: column; 
              font-family: Arial, sans-serif;
              background: #f5f5f5;
            }
            .container { 
              text-align: center; 
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            h2 { 
              color: #333;
              margin-bottom: 10px;
            }
            .user-info { 
              color: #666;
              margin: 15px 0;
              font-size: 16px;
            }
            img { 
              max-width: 300px; 
              width: 100%;
              height: auto;
              margin: 20px 0;
              border: 2px solid #eee;
              border-radius: 8px;
            }
            .note { 
              color: #888; 
              font-size: 14px; 
              margin-top: 20px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .instructions {
              text-align: left;
              background: #f9f9f9;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              font-size: 14px;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Quick Login QR Code</h2>
            <div class="user-info">
              <strong>User ID:</strong> ${userId}<br>
              <strong>Generated:</strong> ${new Date().toLocaleDateString()}
            </div>
            <img src="${qrCodeUrl}" alt="Login QR Code" />
            
            <div class="instructions">
              <strong>📱 How to use:</strong>
              <ol style="margin-top: 10px; padding-left: 20px;">
                <li>Open your phone's camera or QR scanner</li>
                <li>Scan this QR code</li>
                <li>You'll be automatically logged in</li>
                <li>Redirected to the Portal/Dashboard</li>
              </ol>
            </div>
            
            <p class="note">
              No need to type username and password<br>
              Just scan and go!
            </p>
            <div class="footer">
              This QR code expires in 30 days for security
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          Quick Login QR Code
        </CardTitle>
        <CardDescription>
          {qrCodeUrl 
            ? "Scan this QR code to log in instantly without typing credentials" 
            : "Generate a QR code for faster login access"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!qrCodeUrl && !isGenerating && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-2">No QR Code Generated</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Generate a QR code for quick login. Scan it with your phone to automatically log in without typing your credentials.
            </p>
            <Button onClick={generateQRCode} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        )}
        
        {isGenerating && qrCodeUrl === null && (
          <div className="flex flex-col items-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Generating your QR code...</p>
          </div>
        )}
        
        {qrCodeUrl && !isGenerating && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border">
              <img 
                src={qrCodeUrl} 
                alt="Login QR Code" 
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  console.error('Failed to load QR code image:', qrCodeUrl);
                  setImageError(true);
                  setError('Failed to load QR code image. Please try regenerating.');
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              <Button size="sm" variant="outline" onClick={downloadQRCode}>
                <Download className="h-3 w-3 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={printQRCode}>
                <Printer className="h-3 w-3 mr-2" />
                Print
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowRegenerateConfirm(true)}
                disabled={isGenerating}
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                <RefreshCw className={`h-3 w-3 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
            
            {/* Regenerate Confirmation Dialog */}
            {showRegenerateConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                  <div className="flex items-center gap-3 text-amber-600 mb-4">
                    <AlertTriangle className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">Regenerate QR Code?</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <Alert variant="warning" className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        <span className="font-medium">Warning:</span> Regenerating will immediately invalidate your existing QR code. Anyone with the old QR code will no longer be able to log in.
                      </AlertDescription>
                    </Alert>
                    
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to continue? This action cannot be undone.
                    </p>
                    
                    <div className="flex gap-3 justify-end pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRegenerateConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="default"
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={regenerateQRCode}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          'Yes, Regenerate'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">QR Login:</span>
              <Button 
                size="sm" 
                variant={isEnabled ? "default" : "secondary"}
                onClick={toggleQrLogin}
              >
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            
            <Alert className="bg-green-50 border-green-200 mt-2">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs text-green-800">
                <strong>Quick tip:</strong> Save this QR code on your phone. Scan it anytime to instantly log in without typing your email and password.
              </AlertDescription>
            </Alert>
            
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Scan with your phone camera to auto-login • Redirects to Portal/Dashboard • Expires in 30 days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Type for the user data from controller
interface ProfileUserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  contact_number?: string;
  position?: string;
  status: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  qr_login_token?: string;
  qr_code_url?: string;
  qr_login_enabled?: boolean;
  department?: {
    id: number;
    name: string;
  };
  role?: {
    id: number;
    name: string;
  };
  resident?: {
    id: number;
    resident_id?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    birth_date?: string;
    age?: number;
    gender?: string;
    civil_status?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    occupation?: string;
    education?: string;
    religion?: string;
    is_voter: boolean;
    is_pwd: boolean;
    is_senior: boolean;
    place_of_birth?: string;
    remarks?: string;
    photo_path?: string;
    status?: string;
    is_head_of_household: boolean;
    purok?: {
      id: number;
      name: string;
      leader_name?: string;
      leader_contact?: string;
      google_maps_url?: string;
    };
    household?: {
      id: number;
      household_number?: string;
      address?: string;
      full_address?: string;
      contact_number?: string;
      email?: string;
      member_count?: number;
      income_range?: string;
      housing_type?: string;
      ownership_status?: string;
      water_source?: string;
      electricity: boolean;
      has_electricity: boolean;
      internet: boolean;
      has_internet: boolean;
      vehicle: boolean;
      has_vehicle: boolean;
      remarks?: string;
      purok?: {
        id: number;
        name: string;
      };
      head_of_household?: {
        id: number;
        full_name: string;
        first_name?: string;
        last_name?: string;
      };
      members?: Array<{
        id: number;
        full_name: string;
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        relationship_to_head: string;
        is_head: boolean;
      }>;
    };
  };
}

export default function Profile({
  mustVerifyEmail,
  status,
}: {
  mustVerifyEmail: boolean;
  status?: string;
}) {
  const { props, url } = usePage<SharedData & { user: ProfileUserData }>();
  const { user } = props;
  
  // Extract data from the user object
  const resident = user?.resident;
  const household = resident?.household;
  const purok = resident?.purok || household?.purok;
  const isHeadOfHousehold = resident?.is_head_of_household || false;
  
  // Get QR code data from user - using correct field name qr_code_url
  const qrCodeUrl = user?.qr_code_url || null;
  const qrToken = user?.qr_login_token;
  
  // Avatar URL
  const avatarUrl = getAvatarUrl(resident?.photo_path);

  // Calculate age if birth date exists
  const age = resident?.birth_date ? calculateAge(resident.birth_date) : null;

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [isMobile, setIsMobile] = useState(false);

  // Check URL query parameter for tab selection
  useEffect(() => {
    try {
      const urlObj = new URL(url, window.location.origin);
      const tabParam = urlObj.searchParams.get('tab');
      
      const validTabs = ['personal', 'additional', 'household', 'members', 'qr'];
      
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    }
  }, [url]);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If user is not available, show loading state
  if (!user) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Profile" />
        <SettingsLayout>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </SettingsLayout>
      </AppLayout>
    );
  }

  // Tab configuration - Added QR tab
  const TABS_CONFIG = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'additional', label: 'Additional', icon: Info },
    { id: 'household', label: 'Household', icon: Home },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'qr', label: 'QR Login', icon: QrCode },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile" />

      <SettingsLayout>
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground mt-1">
                View your personal information and account details
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isHeadOfHousehold && (
                <Badge variant="secondary" className="gap-1">
                  <UserCheck className="h-3 w-3" />
                  Head of Household
                </Badge>
              )}
              <Badge 
                variant={user.email_verified_at ? "default" : "destructive"}
                className="gap-1"
              >
                {user.email_verified_at ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <ShieldAlert className="h-3 w-3" />
                )}
                {user.email_verified_at ? 'Verified' : 'Unverified'}
              </Badge>
              {qrCodeUrl && (
                <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
                  <QrCode className="h-3 w-3" />
                  QR Ready
                </Badge>
              )}
            </div>
          </div>

          {/* Email Verification Alert */}
          {mustVerifyEmail && !user.email_verified_at && (
            <Alert variant="warning" className="mt-4 bg-yellow-50 border-yellow-200">
              <ShieldAlert className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-sm">
                <span className="font-medium">Your email address is unverified.</span>
                {status === 'verification-link-sent' && (
                  <span className="ml-2 text-green-600">
                    A new verification link has been sent.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={avatarUrl || ''} alt={user.full_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-semibold text-lg">{user.full_name}</h3>
                {user.role && (
                  <p className="text-sm text-muted-foreground">{user.role.name}</p>
                )}
                {resident?.resident_id && (
                  <Badge variant="outline" className="mt-2 text-xs font-mono">
                    ID: {resident.resident_id}
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{formatDate(user.created_at).split(',')[0]}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="font-medium">{formatDate(user.updated_at).split(',')[0]}</span>
                </div>
                {household?.member_count && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Household size</span>
                    <span className="font-medium">{household.member_count} members</span>
                  </div>
                )}
                {purok && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Purok</span>
                    <span className="font-medium">{purok.name}</span>
                  </div>
                )}
              </div>

              {/* Photo Note */}
              <Alert className="bg-muted/50 border-0 p-3">
                <Camera className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Profile photos are managed by the administration team.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Right Column - Tabbed Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs Navigation */}
              {isMobile ? (
                <TabsScrollContainer className="mb-4">
                  {TABS_CONFIG.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="min-w-[100px]">
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsScrollContainer>
              ) : (
                <TabsList className="w-full grid grid-cols-5">
                  {TABS_CONFIG.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              )}

              {/* Tab Contents */}
              
              {/* Personal Information */}
              <TabsContent value="personal" className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <p className="text-sm text-muted-foreground mb-4">Your basic personal details</p>
                <div className="divide-y divide-border/50">
                  <InfoRow label="Full Name" value={user.full_name} icon={User} />
                  <InfoRow label="Email Address" value={user.email} icon={Mail} />
                  <InfoRow label="Contact Number" value={resident?.contact_number || user.contact_number} icon={Phone} />
                  <InfoRow label="Address" value={resident?.address} icon={Home} />
                  {user.position && <InfoRow label="Position" value={user.position} icon={Briefcase} />}
                  {user.department && <InfoRow label="Department" value={user.department.name} icon={Briefcase} />}
                </div>
              </TabsContent>

              {/* Additional Information */}
              <TabsContent value="additional" className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <p className="text-sm text-muted-foreground mb-4">Additional personal details</p>
                
                {resident ? (
                  <div className="divide-y divide-border/50">
                    <InfoRow 
                      label="Birth Date" 
                      value={
                        <div>
                          <div>{formatDate(resident.birth_date)}</div>
                          {age && <div className="text-xs text-muted-foreground">{age} years old</div>}
                        </div>
                      } 
                      icon={Calendar} 
                    />
                    <InfoRow label="Gender" value={resident.gender} icon={User} />
                    <InfoRow label="Civil Status" value={resident.civil_status} icon={Heart} />
                    <InfoRow label="Occupation" value={resident.occupation} icon={Briefcase} />
                    <InfoRow label="Education" value={resident.education} icon={Book} />
                    <InfoRow label="Religion" value={resident.religion} icon={Heart} />
                    
                    {/* Status Badges */}
                    {(resident.is_voter || resident.is_pwd || resident.is_senior) && (
                      <div className="py-3">
                        <div className="flex flex-wrap gap-2">
                          {resident.is_voter && <Badge variant="secondary">Registered Voter</Badge>}
                          {resident.is_pwd && <Badge variant="secondary">Person with Disability</Badge>}
                          {resident.is_senior && <Badge variant="secondary">Senior Citizen</Badge>}
                        </div>
                      </div>
                    )}
                    
                    {resident.place_of_birth && (
                      <InfoRow label="Place of Birth" value={resident.place_of_birth} icon={Home} />
                    )}
                    
                    {resident.remarks && (
                      <div className="py-3">
                        <p className="text-sm text-muted-foreground mb-2">Remarks</p>
                        <p className="text-sm bg-muted/30 p-3 rounded-md">{resident.remarks}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>No resident profile found.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Household Information */}
              <TabsContent value="household" className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Household Information</h3>
                <p className="text-sm text-muted-foreground mb-4">Your household details</p>
                
                {household ? (
                  <div className="space-y-6">
                    {/* Household Details */}
                    <div className="divide-y divide-border/50">
                      {household.household_number && (
                        <InfoRow label="Household Number" value={household.household_number} icon={Home} />
                      )}
                      <InfoRow label="Address" value={household.full_address || household.address} icon={Home} />
                      {purok && <InfoRow label="Purok" value={purok.name} icon={Home} />}
                      {household.member_count !== undefined && (
                        <InfoRow label="Member Count" value={household.member_count} icon={Users} />
                      )}
                      {household.head_of_household?.full_name && (
                        <InfoRow 
                          label="Head of Household" 
                          value={
                            <span>
                              {household.head_of_household.full_name}
                              {isHeadOfHousehold && <Badge className="ml-2 text-xs">You</Badge>}
                            </span>
                          } 
                          icon={UserCheck} 
                        />
                      )}
                      {household.income_range && (
                        <InfoRow label="Income Range" value={household.income_range} icon={Briefcase} />
                      )}
                      
                      {/* Amenities */}
                      <div className="py-3">
                        <p className="text-sm text-muted-foreground mb-3">Amenities</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Electricity</span>
                            <Badge variant={household.electricity ? "default" : "secondary"} className="mt-1 block w-fit">
                              {household.electricity ? 'Available' : 'Not Available'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Internet</span>
                            <Badge variant={household.internet ? "default" : "secondary"} className="mt-1 block w-fit">
                              {household.internet ? 'Available' : 'Not Available'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Vehicle</span>
                            <Badge variant={household.vehicle ? "default" : "secondary"} className="mt-1 block w-fit">
                              {household.vehicle ? 'Available' : 'Not Available'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {household.contact_number && (
                        <InfoRow label="Household Contact" value={household.contact_number} icon={Phone} />
                      )}
                      {household.email && (
                        <InfoRow label="Household Email" value={household.email} icon={Mail} />
                      )}
                      {household.remarks && (
                        <div className="py-3">
                          <p className="text-sm text-muted-foreground mb-2">Household Remarks</p>
                          <p className="text-sm bg-muted/30 p-3 rounded-md">{household.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>No household assigned.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Household Members */}
              <TabsContent value="members" className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Household Members</h3>
                <p className="text-sm text-muted-foreground mb-4">Members of your household</p>
                
                {household?.members && household.members.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {household.members.map((member) => (
                        <div 
                          key={member.id} 
                          className={`border rounded-lg p-4 ${member.is_head ? 'border-primary/20 bg-primary/5' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{member.full_name}</span>
                                {member.is_head && (
                                  <Badge variant="secondary" className="text-xs">Head</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Relationship: {member.relationship_to_head}
                              </p>
                            </div>
                            {member.id === resident?.id && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Alert className="bg-muted/50 border-0">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Household members are managed by the administration.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>No household members found.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* QR Login Tab */}
              <TabsContent value="qr" className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Quick Login QR Code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a QR code for faster login access. Scan it with your phone to automatically log in without typing your credentials.
                </p>
                
                <LoginQRCode 
                  userId={user.id}
                  existingQrCodeUrl={qrCodeUrl}
                  qrToken={qrToken}
                />
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">How it works</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                        <li>Generate your unique QR code</li>
                        <li>Download or print it</li>
                        <li>Keep it on your phone</li>
                        <li>Scan to instantly log in</li>
                        <li>Automatically redirected to Portal/Dashboard</li>
                      </ol>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        <li>QR codes expire after 30 days</li>
                        <li>You can regenerate anytime</li>
                        <li>Disable QR login if needed</li>
                        <li>Each code is unique to you</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span>Information is managed by the administration</span>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}