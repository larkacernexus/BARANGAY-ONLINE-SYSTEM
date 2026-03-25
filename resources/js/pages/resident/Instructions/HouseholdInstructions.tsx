// /Pages/HouseholdHeadInstructions.tsx
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/resident-app-layout';
import {
  Home,
  ScrollText,
  Wallet,
  ShieldCheck,
  Bell,
  Shield,
  AlertCircle,
  DollarSign,
  QrCode,
  BookOpen,
  Video,
  HelpCircle,
  Keyboard,
  Users,
  UserPlus,
  Eye,
  Download,
  Flag,
  Paperclip,
  Lock,
  Settings,
  LucideIcon,
  Calendar,
  CheckCircle,
  Receipt,
  Link,
  Menu,
  X,
} from 'lucide-react';

// Import components
import { WelcomeBanner } from '@/components/residentui/instructions/WelcomeBanner';
import { QuickStats } from '@/components/residentui/instructions/QuickStats';
import { QuickActionsGrid } from '@/components/residentui/instructions/QuickActionsGrid';
import { InfoSection } from '@/components/residentui/instructions/InfoSection';
import { FeatureCardsGrid } from '@/components/residentui/instructions/FeatureCardsGrid';
import { StepsGuide } from '@/components/residentui/instructions/StepsGuide';
import { StatusBadgesGrid } from '@/components/residentui/instructions/StatusBadgesGrid';
import { PaymentMethodsGrid } from '@/components/residentui/instructions/PaymentMethodsGrid';
import { VideoTutorialsGrid } from '@/components/residentui/instructions/VideoTutorialsGrid';
import { FAQAccordion } from '@/components/residentui/instructions/FAQAccordion';
import { KeyboardShortcutsGrid } from '@/components/residentui/instructions/KeyboardShortcutsGrid';
import { PageHeader } from '@/components/residentui/instructions/PageHeader';
import { TabNavigation } from '@/components/residentui/instructions/TabNavigation';
import { SidebarNavigation } from '@/components/residentui/instructions/SidebarNavigation';
import { MainContent } from '@/components/residentui/instructions/MainContent';

// Import types
import { Section, VideoTutorial, FAQItem, Shortcut } from '@/types/portal/instructions/types';

const HouseholdHeadInstructions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [activeTab, setActiveTab] = useState<'guide' | 'videos' | 'faq' | 'shortcuts'>('guide');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when section changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [selectedSection, isMobile]);

  // Section data
  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Overview for Household Heads',
      icon: Home,
      description: 'What you can do as the head of household',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <WelcomeBanner
            title="Welcome, Household Head!"
            subtitle="As the head of household, you have special privileges to manage your household's affairs"
            badges={[
              { icon: Shield, label: 'Household Head Privileges' },
              { icon: Calendar, label: 'Updated: March 2024' }
            ]}
          />
          <QuickStats stats={[
            { icon: Users, value: 'Household', label: 'Member Management', color: 'blue' },
            { icon: ScrollText, value: 'Clearances', label: 'Request & Track', color: 'green' },
            { icon: Wallet, value: 'Payments', label: 'Pay Fees', color: 'purple' },
            { icon: ShieldCheck, value: 'Reports', label: 'File Reports', color: 'amber' },
          ]} />
          <QuickActionsGrid
            title="Quick Actions for Household Heads"
            actions={[
              { href: '/portal/my-clearances/request', icon: ScrollText, label: 'Request Clearance', color: 'blue' },
              { href: '/portal/community-reports/create', icon: AlertCircle, label: 'File Report', color: 'amber' },
              { href: '/portal/fees/pay', icon: DollarSign, label: 'Pay Fees', color: 'emerald' },
              { href: '/residentsettings/profile?tab=qr', icon: QrCode, label: 'QR Code Login', color: 'purple' },
            ]}
          />
          <InfoSection
            title="Your Household Head Responsibilities"
            leftItems={[
              { icon: CheckCircle, text: 'View all household members' },
              { icon: CheckCircle, text: 'Request clearances for household members' },
              { icon: CheckCircle, text: 'Pay fees and view payment history' },
              { icon: CheckCircle, text: 'File community reports on behalf of household' },
            ]}
            rightItems={[
              { icon: Shield, text: 'Two-Factor Authentication (2FA)' },
              { icon: Shield, text: 'QR Code Login for family members' },
              { icon: Shield, text: 'Device management and activity logs' },
            ]}
          />
        </div>
      )
    },
    {
      id: 'clearances',
      title: 'Clearance Requests',
      icon: ScrollText,
      description: 'Request and track clearances for your household',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <FeatureCardsGrid
            title="Clearance Management"
            features={[
              { icon: UserPlus, title: 'Request Clearance', description: 'Apply for barangay clearances for yourself or household members', color: 'green' },
              { icon: Eye, title: 'Track Status', description: 'Monitor clearance application progress in real-time', color: 'blue' },
              { icon: Download, title: 'Download', description: 'Download approved clearances as PDF', color: 'purple' },
            ]}
          />
          <StepsGuide
            title="How to Request a Clearance"
            steps={[
              { step: 1, title: 'Go to Clearances', description: 'Navigate to "Clearances" in the sidebar or click "Request Clearance" in quick actions' },
              { step: 2, title: 'Select Resident', description: 'Choose which household member needs the clearance' },
              { step: 3, title: 'Choose Clearance Type', description: 'Select the type of clearance needed (Barangay Clearance, Business Clearance, etc.)' },
              { step: 4, title: 'Provide Purpose', description: 'Specify the purpose of the clearance' },
              { step: 5, title: 'Set Urgency', description: 'Choose Normal, Rush, or Express processing' },
              { step: 6, title: 'Submit & Pay', description: 'Review and submit your request, then proceed to payment' }
            ]}
          />
          <StatusBadgesGrid
            statuses={[
              { status: 'Pending', color: 'yellow', description: 'Awaiting review' },
              { status: 'Pending Payment', color: 'orange', description: 'Awaiting payment' },
              { status: 'Processing', color: 'blue', description: 'Being processed' },
              { status: 'Approved', color: 'green', description: 'Ready for pickup' },
              { status: 'Issued', color: 'emerald', description: 'Already issued' },
              { status: 'Rejected', color: 'red', description: 'Not approved' }
            ]}
          />
        </div>
      )
    },
    {
      id: 'payments',
      title: 'Payments & Fees',
      icon: DollarSign,
      description: 'Manage payments and view transaction history',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <FeatureCardsGrid
            title="Payment Management"
            bgColor="from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
            features={[
              { icon: Wallet, title: 'Pay Fees Online', description: 'Pay clearance fees, community fees, and other barangay charges', color: 'emerald' },
              { icon: Receipt, title: 'Payment History', description: 'View all past transactions and download receipts', color: 'blue' },
            ]}
          />
          <PaymentMethodsGrid methods={['GCash', 'Maya', 'Bank Transfer', 'Over-the-Counter']} />
          <div className="rounded-lg border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
            <h3 className="mb-3 sm:mb-4 text-sm sm:text-lg font-semibold text-gray-900 dark:text-white break-words">How to Pay</h3>
            <ol className="list-decimal space-y-2 pl-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <li>Go to "Payments" section from the sidebar</li>
              <li>Select "Pay Fees" to view outstanding balances</li>
              <li>Choose the fees you want to pay</li>
              <li>Select your preferred payment method</li>
              <li>Follow the instructions for your chosen payment method</li>
              <li>Upload proof of payment if required</li>
              <li>Wait for confirmation and download your receipt</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'Community Reports',
      icon: AlertCircle,
      description: 'File and track community reports',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <FeatureCardsGrid
            title="File Community Reports"
            bgColor="from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
            features={[
              { icon: Flag, title: 'Report Issues', description: 'Report community concerns, incidents, or infrastructure issues', color: 'amber' },
              { icon: Paperclip, title: 'Attach Evidence', description: 'Upload photos, videos, or documents as proof', color: 'blue' },
              { icon: Eye, title: 'Track Progress', description: 'Monitor report status and admin responses', color: 'green' },
            ]}
          />
          <div className="rounded-lg border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
            <h3 className="mb-3 sm:mb-4 text-sm sm:text-lg font-semibold text-gray-900 dark:text-white break-words">Types of Reports You Can File</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[
                'Infrastructure Issues (roads, drainage, streetlights)',
                'Environmental Concerns (waste, flooding)',
                'Safety & Security Incidents',
                'Community Events & Activities',
                'Health Concerns & Disease Outbreaks',
                'Noise Complaints & Disturbances'
              ].map((type, idx) => (
                <div key={idx} className="flex items-center gap-1 sm:gap-2 rounded-lg bg-gray-50 p-2 sm:p-3 dark:bg-gray-800">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: Shield,
      description: 'Protect your account and manage security settings',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <FeatureCardsGrid
            title="Account Security Features"
            bgColor="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
            features={[
              { icon: Lock, title: 'Two-Factor Authentication (2FA)', description: 'Add an extra layer of security to your account', color: 'purple' },
              { icon: QrCode, title: 'QR Code Login', description: 'Generate QR codes for family members to access household features', color: 'blue' },
            ]}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
              <h4 className="mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">Password Management</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">Change your password regularly for better security</p>
              <Link href="/residentsettings/security/password" className="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400">Change Password →</Link>
            </div>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
              <h4 className="mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">Device Management</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">View and manage devices logged into your account</p>
              <Link href="/residentsettings/devices" className="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400">Manage Devices →</Link>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
            <h3 className="mb-3 sm:mb-4 text-sm sm:text-lg font-semibold text-gray-900 dark:text-white break-words">Privacy Controls</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">Activity Logs</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 break-words">View your recent account activity</p>
                </div>
                <Link href="/residentsettings/activities" className="text-xs text-blue-600 hover:underline dark:text-blue-400">View Logs →</Link>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">Data Export</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 break-words">Request a copy of your data</p>
                </div>
                <Link href="/residentsettings/privacy" className="text-xs text-blue-600 hover:underline dark:text-blue-400">Request Export →</Link>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">Notification Preferences</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 break-words">Manage how you receive updates</p>
                </div>
                <Link href="/residentsettings/preferences/notifications" className="text-xs text-blue-600 hover:underline dark:text-blue-400">Manage →</Link>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Stay updated with important announcements',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h3 className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-300 break-words">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              Stay Informed
            </h3>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 break-words">
              Receive real-time updates about clearances, payments, and community announcements
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
              <h4 className="mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">Announcements</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">View barangay announcements and community news</p>
              <Link href="/portal/announcements" className="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400">View Announcements →</Link>
            </div>
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
              <h4 className="mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">Notification Settings</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">Customize how and when you receive notifications</p>
              <Link href="/residentsettings/preferences/notifications" className="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400">Configure →</Link>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Video tutorials
  const videoTutorials: VideoTutorial[] = [
    { title: 'How to Request a Clearance', duration: '4:30', views: '1.2k' },
    { title: 'Paying Fees Online', duration: '3:45', views: '892' },
    { title: 'Filing a Community Report', duration: '5:15', views: '654' },
    { title: 'Setting Up 2FA', duration: '2:30', views: '423' },
    { title: 'QR Code Login for Family', duration: '3:00', views: '567' }
  ];

  // FAQ items
  const faqItems: FAQItem[] = [
    { question: 'How do I request a clearance for a family member?', answer: 'Go to Clearances → Request Clearance, then select the family member from the dropdown. Fill out the form with their details.' },
    { question: 'What payment methods are accepted?', answer: 'We accept GCash, Maya, Bank Transfer (BPI, BDO, Metrobank), and over-the-counter payments at the barangay hall.' },
    { question: 'How long does clearance processing take?', answer: 'Normal: 3-5 business days, Rush: 1-2 business days, Express: Same day processing.' },
    { question: 'Can I track my community report?', answer: 'Yes! Go to Community Reports and click on your report to see its status and any admin responses.' },
    { question: 'How do I set up QR code for my family?', answer: 'Go to Profile → QR Code Login to generate a QR code that family members can use to access household features.' },
    { question: 'What is Two-Factor Authentication?', answer: '2FA adds an extra layer of security. After enabling, you\'ll need both your password and a code from your phone to log in.' }
  ];

  // Keyboard shortcuts
  const shortcuts: Shortcut[] = [
    { key: 'Ctrl + C', description: 'Go to Clearances' },
    { key: 'Ctrl + P', description: 'Go to Payments' },
    { key: 'Ctrl + R', description: 'File a Report' },
    { key: 'Ctrl + N', description: 'View Notifications' },
    { key: 'Ctrl + S', description: 'Security Settings' },
    { key: 'Ctrl + /', description: 'Show this help menu' }
  ];

  const selectedContent = sections.find(s => s.id === selectedSection) || sections[0];
  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'guide', label: 'Guide', icon: BookOpen },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard }
  ];

  return (
    <>
      <Head title="Household Head Guide - Barangay Kibawe" />
      
      <AppLayout>
        <div className="flex-1 space-y-3 sm:space-y-4 p-3 sm:p-4 pt-4 sm:pt-6 md:p-8 max-w-full overflow-hidden">
          <PageHeader
            title="Household Head Guide"
            description="Learn how to manage your household and access all features"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as any)}
          />

          <div className="mt-4 sm:mt-6">
            {activeTab === 'guide' && (
              <>
                {/* Mobile Menu Toggle */}
                {isMobile && (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="mb-3 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                      {selectedContent.title}
                    </span>
                    {isMobileMenuOpen ? (
                      <X className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <Menu className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <SidebarNavigation
                    sections={sections}
                    selectedSection={selectedSection}
                    onSectionSelect={setSelectedSection}
                    searchQuery={searchQuery}
                    filteredSections={filteredSections}
                    isMobile={isMobile}
                    isMobileMenuOpen={isMobileMenuOpen}
                    onMobileMenuClose={() => setIsMobileMenuOpen(false)}
                  />

                  <MainContent
                    selectedContent={selectedContent}
                    sections={sections}
                    onPrevious={() => {
                      const currentIndex = sections.findIndex(s => s.id === selectedSection);
                      if (currentIndex > 0) {
                        setSelectedSection(sections[currentIndex - 1].id);
                      }
                    }}
                    onNext={() => {
                      const currentIndex = sections.findIndex(s => s.id === selectedSection);
                      if (currentIndex < sections.length - 1) {
                        setSelectedSection(sections[currentIndex + 1].id);
                      }
                    }}
                    isMobile={isMobile}
                    isMobileMenuOpen={isMobileMenuOpen}
                  />
                </div>
              </>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white break-words">Video Tutorials</h2>
                <VideoTutorialsGrid videos={videoTutorials} />
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white break-words">
                  Frequently Asked Questions
                </h2>
                <FAQAccordion items={faqItems} />
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white break-words">Keyboard Shortcuts</h2>
                <KeyboardShortcutsGrid shortcuts={shortcuts} />
                
                <div className="rounded-lg bg-blue-50 p-3 sm:p-4 dark:bg-blue-900/20">
                  <h3 className="mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-400 break-words">
                    <Keyboard className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    Pro Tip
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 break-words">
                    Press <kbd className="rounded bg-blue-200 px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm font-mono dark:bg-blue-800">Ctrl + /</kbd> to see all shortcuts from any page
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default HouseholdHeadInstructions;