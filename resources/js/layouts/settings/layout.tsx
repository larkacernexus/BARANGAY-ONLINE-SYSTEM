// layouts/settings-layout.tsx
import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import { type PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
// import SettingsSidebar from '@/layouts/settings/settings-sidebar';

export default function SettingsLayout({ children }: PropsWithChildren) {
  // Handle server-side rendering
  if (typeof window === 'undefined') {
    return null;
  }

  const currentPath = window.location.pathname;
  const isAdmin = true; // Replace with actual admin check logic
  const currentSection = getCurrentSection(currentPath);
  const sectionDescription = getSectionDescription(currentSection);

  return (
    <div className="px-4 py-6">
      <Heading
        title={currentSection}
        description={sectionDescription}
      />

      <div className="flex flex-col lg:flex-row lg:space-x-12">
        {/* Sidebar Navigation */}
        {/* <SettingsSidebar currentPath={currentPath} isAdmin={isAdmin} /> */}

        <Separator className="my-6 lg:hidden" />

        {/* Main Content Area */}
        <div className="flex-1 lg:max-w-4xl">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <section className="p-6 space-y-8">
              {/* Contextual Breadcrumb */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <Link href="/adminsettings/profile" className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
                  Settings
                </Link>
                {currentSection !== 'Settings' && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700 dark:text-gray-300">{currentSection}</span>
                  </>
                )}
              </div>
              
              {/* Content */}
              {children}
            </section>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// Helper function to determine current section
function getCurrentSection(currentPath: string): string {
  // System administration routes
  if (currentPath.includes('/users')) return 'Users';
  if (currentPath.includes('/admin/roles')) return 'Roles & Permissions';
  if (currentPath.includes('/admin/audit-logs')) return 'Audit Logs';
  
  // Barangay administration routes
  if (currentPath.includes('/admin/positions')) return 'Positions';
  if (currentPath.includes('/admin/committees')) return 'Committees';
  if (currentPath.includes('/admin/officials')) return 'Barangay Officials';
  if (currentPath.includes('/admin/committee-members')) return 'Committee Members';
  if (currentPath.includes('/admin/puroks')) return 'Puroks';
  if (currentPath.includes('/admin/sitios')) return 'Sitios';
  if (currentPath.includes('/admin/terms')) return 'Terms of Office';
  
  // Module configuration routes
  if (currentPath.includes('/reports/')) {
    const reportType = currentPath.split('/reports/')[1];
    return reportType ? `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Reports` : 'Reports';
  }
  if (currentPath.includes('/forms/create')) return 'Upload Form';
  if (currentPath.includes('/announcements/create')) return 'Create Announcement';
  
  // Main module routes
  if (currentPath.includes('/residents')) return 'Residents Configuration';
  if (currentPath.includes('/households')) return 'Households Configuration';
  if (currentPath.includes('/admincomplaints')) return 'Complaints System';
  if (currentPath.includes('/forms')) return 'Forms & Documents';
  if (currentPath.includes('/announcements')) return 'Announcements';
  if (currentPath.includes('/reports')) return 'Reports & Analytics';
  
  // Settings routes
  if (currentPath.includes('/adminsettings/')) {
    const section = currentPath.split('/adminsettings/')[1];
    return section.charAt(0).toUpperCase() + section.slice(1) + ' Settings';
  }
  
  return 'Settings';
}

// Helper function to get section description
function getSectionDescription(section: string): string {
  switch (section) {
    // System Administration
    case 'Users':
      return 'Manage system users and their access levels';
    case 'Roles & Permissions':
      return 'Configure roles and permissions for system access';
    case 'Audit Logs':
      return 'View system activity and user actions';
    
    // Barangay Administration
    case 'Positions':
      return 'Manage official positions and roles in the barangay';
    case 'Committees':
      return 'Configure barangay committees and their functions';
    case 'Barangay Officials':
      return 'Manage current barangay officials and their assignments';
    case 'Committee Members':
      return 'Assign residents to barangay committees';
    case 'Puroks':
      return 'Manage puroks (zones) within the barangay';
    case 'Sitios':
      return 'Manage sitios (smaller subdivisions)';
    case 'Terms of Office':
      return 'Configure terms and tenure for officials';
    case 'Barangay Profile':
      return 'Update barangay information and details';
    
    // Module Configuration
    case 'Residents Configuration':
      return 'Configure residents database settings and fields';
    case 'Households Configuration':
      return 'Configure households module settings';
    case 'Complaints System':
      return 'Configure complaints handling system';
    case 'Forms & Documents':
      return 'Configure forms and document templates';
    case 'Announcements':
      return 'Configure announcement settings and templates';
    case 'Reports & Analytics':
      return 'Configure reporting and analytics settings';
    
    // Reports subpages
    case 'Overview Reports':
      return 'System overview and analytics reports';
    case 'Residents Reports':
      return 'Residents database reports and statistics';
    case 'Complaints Reports':
      return 'Complaints analysis and reports';
    case 'Export Data':
      return 'Export system data in various formats';
    
    // Personal settings
    case 'Profile Settings':
      return 'Update your personal information and preferences';
    case 'Password Settings':
      return 'Change your account password';
    case 'Two-factor Settings':
      return 'Configure two-factor authentication';
    case 'Appearance Settings':
      return 'Customize theme, layout, and appearance';
    
    // Communication settings
    case 'Sms Settings':
      return 'Configure SMS gateway and notifications';
    case 'Email Settings':
      return 'Configure email server and templates';
    case 'Templates Settings':
      return 'Manage announcement and communication templates';
    
    // System settings
    case 'General Settings':
      return 'General system configurations and options';
    case 'Notification Settings':
      return 'Configure system notifications';
    case 'Backup Settings':
      return 'System backup and restore settings';
    case 'Api Settings':
      return 'API configurations and integrations';
    
    default:
      return 'Manage system configurations and settings';
  }
}