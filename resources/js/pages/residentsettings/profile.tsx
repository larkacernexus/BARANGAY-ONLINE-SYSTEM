import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { CheckCircle, Mail, ShieldAlert, User, AlertCircle, Camera, Phone, Home, Calendar, Briefcase, Book, Heart, Shield, Info, Users, UserCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  TabsScrollContainer 
} from '@/components/ui/tabs'; // Import enhanced Tabs components

// Hardcoded URLs
const PROFILE_VIEW_URL = '/residentsettings/profile';
const VERIFICATION_SEND_URL = '/email/verification-notification';

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

// Info Item Component
const InfoItem = ({ 
  label, 
  value, 
  icon: Icon,
  className = ''
}: { 
  label: string; 
  value: React.ReactNode; 
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) => (
  <div className={`flex items-start justify-between py-3 ${className}`}>
    <div className="flex items-center gap-3">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
    <div className="text-right">
      {typeof value === 'string' || typeof value === 'number' ? (
        <span className="font-medium">{value || 'Not set'}</span>
      ) : (
        value
      )}
    </div>
  </div>
);

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
  const { props } = usePage<SharedData & { user: ProfileUserData }>();
  const { user } = props;
  
  // Extract data from the user object
  const resident = user?.resident;
  const household = resident?.household;
  const purok = resident?.purok || household?.purok;
  const isHeadOfHousehold = resident?.is_head_of_household || false;
  
  // Avatar URL
  const avatarUrl = getAvatarUrl(resident?.photo_path);

  // Calculate age if birth date exists
  const age = resident?.birth_date ? calculateAge(resident.birth_date) : null;

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
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
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="lg:col-span-1 h-80" />
              <Skeleton className="lg:col-span-2 h-96" />
            </div>
          </div>
        </SettingsLayout>
      </AppLayout>
    );
  }

  // Tab configuration with icons
  const TABS_CONFIG = [
    { 
      id: 'personal', 
      label: 'Personal', 
      icon: User 
    },
    { 
      id: 'additional', 
      label: 'Additional', 
      icon: Info 
    },
    { 
      id: 'household', 
      label: 'Household', 
      icon: Home 
    },
    { 
      id: 'members', 
      label: 'Members', 
      icon: Users 
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile" />

      <SettingsLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground mt-2">
                View your personal information and account details
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isHeadOfHousehold && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <UserCheck className="mr-1 h-3 w-3" />
                  Head of Household
                </Badge>
              )}
              {user.email_verified_at ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>
          </div>

          {/* Email Verification Alert */}
          {mustVerifyEmail && !user.email_verified_at && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <ShieldAlert className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="font-medium">Your email address is unverified.</span>
                    <p className="text-sm mt-1">
                      Please verify your email to access all features.
                      {status === 'verification-link-sent' && (
                        <span className="ml-2 font-medium text-green-600">
                          A new verification link has been sent to your email address.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Avatar & Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Picture</CardTitle>
                  <CardDescription>
                    Your profile photo is managed by the administrator
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                      <AvatarImage
                        src={avatarUrl || ''}
                        alt={user.full_name || 'User'}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    {avatarUrl && (
                      <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 border-4 border-background shadow-sm">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full">
                    <Alert className="bg-muted/50 border-muted">
                      <AlertDescription className="text-xs text-muted-foreground">
                        <div className="flex items-start">
                          <Info className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            Profile photos are managed by the administration team. 
                            Contact support if you need to update your photo.
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoItem 
                    label="Member Since" 
                    value={formatDate(user.created_at)}
                    icon={Calendar}
                  />
                  <Separator />
                  <InfoItem 
                    label="Last Updated" 
                    value={formatDate(user.updated_at)}
                    icon={Calendar}
                  />
                  <Separator />
                  <InfoItem 
                    label="Email Status" 
                    value={
                      <Badge
                        variant={user.email_verified_at ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {user.email_verified_at ? 'Verified' : 'Unverified'}
                      </Badge>
                    }
                    icon={Shield}
                  />
                  <Separator />
                  {resident?.resident_id && (
                    <>
                      <InfoItem 
                        label="Resident ID" 
                        value={
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {resident.resident_id}
                          </code>
                        }
                        icon={User}
                      />
                      <Separator />
                    </>
                  )}
                  {user.role && (
                    <InfoItem 
                      label="Role" 
                      value={user.role.name}
                      icon={User}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Use enhanced Tabs Component with scrollable container */}
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                {/* Scrollable tabs for mobile, normal grid for desktop */}
                {isMobile ? (
                  <TabsScrollContainer 
                    showScrollbar={false}
                    showNavButtons={false}
                    className="mb-4"
                  >
                    {TABS_CONFIG.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger 
                          key={tab.id} 
                          value={tab.id}
                          icon={<Icon className="h-4 w-4" />}
                          touchPadding={true}
                          className="text-xs min-w-[120px]"
                        >
                          <span>{tab.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsScrollContainer>
                ) : (
                  <TabsList className="w-full">
                    {TABS_CONFIG.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger 
                          key={tab.id} 
                          value={tab.id}
                          icon={<Icon className="h-4 w-4" />}
                          className="text-sm"
                        >
                          <span>{tab.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                )}

                {/* Personal Information Tab */}
                <TabsContent 
                  value="personal" 
                  className="animate-in fade-in duration-300"
                  unmountOnExit={isMobile}
                  swipeable={isMobile}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Your basic personal details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <InfoItem 
                        label="Full Name" 
                        value={user.full_name}
                        icon={User}
                      />
                      <Separator />
                      <InfoItem 
                        label="Email Address" 
                        value={user.email}
                        icon={Mail}
                      />
                      <Separator />
                      <InfoItem 
                        label="Contact Number" 
                        value={resident?.contact_number || user.contact_number}
                        icon={Phone}
                      />
                      <Separator />
                      <InfoItem 
                        label="Address" 
                        value={resident?.address}
                        icon={Home}
                      />
                      {user.position && (
                        <>
                          <Separator />
                          <InfoItem 
                            label="Position" 
                            value={user.position}
                            icon={Briefcase}
                          />
                        </>
                      )}
                      {user.department && (
                        <>
                          <Separator />
                          <InfoItem 
                            label="Department" 
                            value={user.department.name}
                            icon={Briefcase}
                          />
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Additional Information Tab */}
                <TabsContent 
                  value="additional" 
                  className="animate-in fade-in duration-300"
                  unmountOnExit={isMobile}
                  swipeable={isMobile}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                      <CardDescription>
                        Additional personal details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {resident && (
                        <>
                          <InfoItem 
                            label="Birth Date" 
                            value={
                              <div className="text-right">
                                <div>{formatDate(resident?.birth_date)}</div>
                                {age !== null && (
                                  <div className="text-sm text-muted-foreground">
                                    {age} years old
                                  </div>
                                )}
                              </div>
                            }
                            icon={Calendar}
                          />
                          <Separator />
                          <InfoItem 
                            label="Gender" 
                            value={resident?.gender}
                            icon={User}
                          />
                          <Separator />
                          <InfoItem 
                            label="Civil Status" 
                            value={resident?.civil_status}
                            icon={Heart}
                          />
                          <Separator />
                          <InfoItem 
                            label="Occupation" 
                            value={resident?.occupation}
                            icon={Briefcase}
                          />
                          <Separator />
                          <InfoItem 
                            label="Education" 
                            value={resident?.education}
                            icon={Book}
                          />
                          <Separator />
                          <InfoItem 
                            label="Religion" 
                            value={resident?.religion}
                            icon={Heart}
                          />
                          
                          {/* Resident Status Badges */}
                          {(resident?.is_voter || resident?.is_pwd || resident?.is_senior) && (
                            <>
                              <Separator />
                              <div className="py-3">
                                <div className="flex items-center gap-3 mb-3">
                                  <Shield className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium text-muted-foreground">Resident Status</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {resident.is_voter && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      Registered Voter
                                    </Badge>
                                  )}
                                  {resident.is_pwd && (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                      Person with Disability
                                    </Badge>
                                  )}
                                  {resident.is_senior && (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                      Senior Citizen
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {resident?.place_of_birth && (
                            <>
                              <Separator />
                              <InfoItem 
                                label="Place of Birth" 
                                value={resident.place_of_birth}
                                icon={Home}
                              />
                            </>
                          )}

                          {resident?.remarks && (
                            <>
                              <Separator />
                              <div className="py-3">
                                <div className="flex items-center gap-3 mb-2">
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium text-muted-foreground">Remarks</span>
                                </div>
                                <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md">
                                  {resident.remarks}
                                </p>
                              </div>
                            </>
                          )}
                        </>
                      )}
                      {!resident && (
                        <Alert>
                          <AlertDescription>
                            No resident profile found. Contact administration for assistance.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Household Information Tab */}
                <TabsContent 
                  value="household" 
                  className="animate-in fade-in duration-300"
                  unmountOnExit={isMobile}
                  swipeable={isMobile}
                >
                  {household ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Household Information</CardTitle>
                        <CardDescription>
                          Your household details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {household.household_number && (
                          <>
                            <InfoItem 
                              label="Household Number" 
                              value={household.household_number}
                              icon={Home}
                            />
                            <Separator />
                          </>
                        )}
                        
                        <InfoItem 
                          label="Address" 
                          value={household.full_address || household.address}
                          icon={Home}
                        />
                        <Separator />
                        
                        {purok && (
                          <>
                            <InfoItem 
                              label="Purok" 
                              value={purok.name}
                              icon={Home}
                            />
                            <Separator />
                          </>
                        )}
                        
                        {household.member_count !== undefined && (
                          <>
                            <InfoItem 
                              label="Member Count" 
                              value={household.member_count}
                              icon={Users}
                            />
                            <Separator />
                          </>
                        )}
                        
                        {household.head_of_household?.full_name && (
                          <>
                            <InfoItem 
                              label="Head of Household" 
                              value={
                                <div className="flex items-center gap-2">
                                  <span>{household.head_of_household.full_name}</span>
                                  {isHeadOfHousehold && (
                                    <Badge className="text-xs">You</Badge>
                                  )}
                                </div>
                              }
                              icon={UserCheck}
                            />
                            <Separator />
                          </>
                        )}
                        
                        {household.income_range && (
                          <>
                            <InfoItem 
                              label="Income Range" 
                              value={household.income_range}
                              icon={Briefcase}
                            />
                            <Separator />
                          </>
                        )}
                        
                        {/* Household Amenities */}
                        <div className="py-3">
                          <div className="flex items-center gap-3 mb-3">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Amenities</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-sm text-muted-foreground">Electricity</span>
                              <Badge variant={household.electricity ? "default" : "secondary"}>
                                {household.electricity ? 'Available' : 'Not Available'}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm text-muted-foreground">Internet</span>
                              <Badge variant={household.internet ? "default" : "secondary"}>
                                {household.internet ? 'Available' : 'Not Available'}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm text-muted-foreground">Vehicle</span>
                              <Badge variant={household.vehicle ? "default" : "secondary"}>
                                {household.vehicle ? 'Available' : 'Not Available'}
                              </Badge>
                            </div>
                            {household.housing_type && (
                              <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Housing Type</span>
                                <span className="font-medium block">{household.housing_type}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {household.contact_number && (
                          <>
                            <Separator />
                            <InfoItem 
                              label="Household Contact" 
                              value={household.contact_number}
                              icon={Phone}
                            />
                          </>
                        )}

                        {household.email && (
                          <>
                            <Separator />
                            <InfoItem 
                              label="Household Email" 
                              value={household.email}
                              icon={Mail}
                            />
                          </>
                        )}

                        {household.remarks && (
                          <>
                            <Separator />
                            <div className="py-3">
                              <div className="flex items-center gap-3 mb-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Household Remarks</span>
                              </div>
                              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md">
                                {household.remarks}
                              </p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Household Information</CardTitle>
                        <CardDescription>
                          No household assigned
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Alert className="bg-muted/30 border-muted">
                          <AlertDescription className="text-sm text-muted-foreground">
                            You are not assigned to any household. Contact the administration for assistance.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Household Members Tab */}
                <TabsContent 
                  value="members" 
                  className="animate-in fade-in duration-300"
                  unmountOnExit={isMobile}
                  swipeable={isMobile}
                >
                  {household ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Household Members</CardTitle>
                        <CardDescription>
                          Members of your household
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {household.members && household.members.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {household.members.map((member) => (
                                <Card key={member.id} className={member.is_head ? 'border-blue-200 bg-blue-50' : ''}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium">{member.full_name}</h4>
                                          {member.is_head && (
                                            <Badge className="bg-blue-100 text-blue-800">
                                              Head
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          Relationship: {member.relationship_to_head}
                                        </p>
                                      </div>
                                      {member.id === resident?.id && (
                                        <Badge variant="outline">You</Badge>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            <Alert className="bg-muted/30">
                              <Info className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                Household members can only be managed by the administration. Contact support for any updates.
                              </AlertDescription>
                            </Alert>
                          </div>
                        ) : (
                          <Alert>
                            <AlertDescription>
                              No household members found. Contact administration to add members to your household.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Household Members</CardTitle>
                        <CardDescription>
                          No household assigned
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Alert className="bg-muted/30 border-muted">
                          <AlertDescription className="text-sm text-muted-foreground">
                            You are not assigned to any household. Contact the administration for assistance.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}