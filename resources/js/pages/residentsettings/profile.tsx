import { type BreadcrumbItem } from '@/types/breadcrumbs';
import { Head, usePage } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { useState, useEffect } from 'react';

// Import components
import { ProfileHeader } from '@/components/portal/settings/components/ProfileHeader';
import { ProfileSidebar } from '@/components/portal/settings/components/ProfileSidebar';
import { TabNavigation, TABS_CONFIG } from '@/components/portal/settings/components/TabNavigation';
import { PersonalTab } from '@/components/portal/settings/components/PersonalTab';
import { AdditionalTab } from '@/components/portal/settings/components/AdditionalTab';
import { HouseholdTab } from '@/components/portal/settings/components/HouseholdTab';
import { MembersTab } from '@/components/portal/settings/components/MembersTab';
import { QRTab } from '@/components/portal/settings/components/QRTab';
import { ProfileUserData, ProfileProps } from '@/components/portal/settings/components/types';

// ✅ Define the page props type
interface PageProps {
  user: ProfileUserData;
  [key: string]: any;
}

// Barangay contact information
const BARANGAY_INFO = {
  email: import.meta.env.VITE_BARANGAY_EMAIL || "barangay.hall@example.com",
  contact: import.meta.env.VITE_BARANGAY_CONTACT || "(02) 1234-5678",
  address: import.meta.env.VITE_BARANGAY_ADDRESS || "Barangay Hall, Main Street, Barangay Example, City"
};

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

export default function Profile({ mustVerifyEmail, status }: ProfileProps) {
  const { props, url } = usePage<PageProps>(); // ✅ Fixed type
  const { user } = props;
  
  const resident = user?.resident;
  const household = resident?.household;
  const purok = resident?.purok || household?.purok;
  const isHeadOfHousehold = resident?.is_head_of_household || false;
  
  const qrCodeUrl = user?.qr_code_url || null;
  const qrToken = user?.qr_login_token;

  const [activeTab, setActiveTab] = useState<string>('personal');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      const urlObj = new URL(url, window.location.origin);
      const tabParam = urlObj.searchParams.get('tab');
      
      const validTabs = TABS_CONFIG.map(tab => tab.id);
      
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    }
  }, [url]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!user) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Profile" />
        <SettingsLayout>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-32 w-full bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-64 w-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </SettingsLayout>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile" />

      <SettingsLayout>
        <div className="mb-6">
          <ProfileHeader 
            isHeadOfHousehold={isHeadOfHousehold}
            emailVerifiedAt={user.email_verified_at}
            qrCodeUrl={qrCodeUrl}
            mustVerifyEmail={mustVerifyEmail}
            status={status}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary with Reminder */}
          <div className="lg:col-span-1">
            <ProfileSidebar 
              user={user}
              resident={resident}
              household={household}
              purok={purok}
              barangayEmail={BARANGAY_INFO.email}
              barangayContact={BARANGAY_INFO.contact}
              barangayAddress={BARANGAY_INFO.address}
            />
          </div>

          {/* Right Column - Tabbed Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabNavigation 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isMobile={isMobile}
              />

              <TabsContent value="personal" className="mt-6">
                <PersonalTab user={user} resident={resident} />
              </TabsContent>

              <TabsContent value="additional" className="mt-6">
                <AdditionalTab resident={resident} />
              </TabsContent>

              <TabsContent value="household" className="mt-6">
                <HouseholdTab 
                  household={household}
                  purok={purok}
                  isHeadOfHousehold={isHeadOfHousehold}
                />
              </TabsContent>

              <TabsContent value="members" className="mt-6">
                <MembersTab 
                  household={household}
                  residentId={resident?.id}
                />
              </TabsContent>

              <TabsContent value="qr" className="mt-6">
                <QRTab 
                  userId={user.id}
                  qrCodeUrl={qrCodeUrl}
                  qrToken={qrToken}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex items-center justify-between text-xs pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Shield className="h-3 w-3" />
            <span>Information is managed by the administration</span>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}