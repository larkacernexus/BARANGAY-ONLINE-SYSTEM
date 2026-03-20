// components/settings-sidebar.tsx
import { cn, isSameUrl } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
  User,
  Lock,
  Smartphone,
  Palette,
  Shield,
  Bell,
  Database,
  Users,
  Building,
  MapPin,
  Megaphone,
  BarChart3,
  Briefcase,
  Users2,
  Award,
  Settings as SettingsIcon,
  ClipboardList,
  Calendar,
  FileText,
  Mail,
  FileCode,
  Home,
  MessageSquareWarning,
  AlertCircle,
  Download,
  BarChartBig,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define settings categories
export const settingsCategories = [
  {
    title: 'Personal',
    items: [
      {
        title: 'Profile',
        href: '/adminsettings/profile',
        icon: User,
        description: 'Update your personal information'
      },
      {
        title: 'Password',
        href: '/adminsettings/password',
        icon: Lock,
        description: 'Change your password'
      },
      {
        title: 'Two-Factor Auth',
        href: '/adminsettings/two-factor',
        icon: Smartphone,
        description: 'Enable 2FA for extra security'
      },
      {
        title: 'Appearance',
        href: '/adminsettings/appearance',
        icon: Palette,
        description: 'Customize theme and layout'
      }
    ]
  },
  {
    title: 'Barangay Administration',
    items: [
      {
        title: 'Barangay Profile',
        href: '/adminsettings/barangay',
        icon: Building,
        description: 'Update barangay information'
      },
      {
        title: 'Puroks',
        href: '/admin/puroks',
        icon: MapPin,
        description: 'Manage puroks/zones'
      },
      {
        title: 'Sitios',
        href: '/admin/sitios',
        icon: MapPin,
        description: 'Manage smaller sitios'
      },
      {
        title: 'Positions',
        href: '/admin/positions',
        icon: Briefcase,
        description: 'Manage official positions and roles'
      },
      {
        title: 'Committees',
        href: '/admin/committees',
        icon: Users2,
        description: 'Manage barangay committees'
      },
      {
        title: 'Officials',
        href: '/admin/officials',
        icon: Award,
        description: 'Manage barangay officials'
      },
      {
        title: 'Committee Members',
        href: '/admin/committee-members',
        icon: Users,
        description: 'Assign members to committees'
      },
      {
        title: 'Terms of Office',
        href: '/admin/terms',
        icon: Calendar,
        description: 'Manage official terms'
      }
    ]
  },
  {
    title: 'System Administration',
    items: [
      {
        title: 'Users',
        href: '/users',
        icon: Users,
        description: 'Manage system users'
      },
      {
        title: 'Roles & Permissions',
        href: '/admin/roles',
        icon: Shield,
        description: 'Configure roles and permissions'
      },
      {
        title: 'Audit Logs',
        href: '/admin/audit-logs',
        icon: ClipboardList,
        description: 'View system activity logs'
      }
    ]
  },
  {
    title: 'Modules Configuration',
    items: [
      {
        title: 'Residents Database',
        href: '/residents',
        icon: Users,
        description: 'Configure residents module'
      },
      {
        title: 'Households',
        href: '/households',
        icon: Home,
        description: 'Configure households module'
      },
      {
        title: 'Complaints System',
        href: '/admincomplaints',
        icon: MessageSquareWarning,
        description: 'Configure complaints system'
      },
      {
        title: 'Forms & Documents',
        href: '/forms',
        icon: FileText,
        description: 'Configure forms module'
      },
      {
        title: 'Announcements',
        href: '/announcements',
        icon: Megaphone,
        description: 'Configure announcements'
      },
      {
        title: 'Reports & Analytics',
        href: '/reports',
        icon: BarChart3,
        description: 'Configure reporting'
      }
    ]
  },
  {
    title: 'Communication',
    items: [
      {
        title: 'SMS Settings',
        href: '/adminsettings/sms',
        icon: Smartphone,
        description: 'Configure SMS notifications'
      },
      {
        title: 'Email Settings',
        href: '/adminsettings/email',
        icon: Mail,
        description: 'Configure email settings'
      },
      {
        title: 'Announcement Templates',
        href: '/adminsettings/templates',
        icon: FileText,
        description: 'Manage announcement templates'
      }
    ]
  },
  {
    title: 'System Settings',
    items: [
      {
        title: 'General Settings',
        href: '/adminsettings/general',
        icon: SettingsIcon,
        description: 'General system configurations'
      },
      {
        title: 'Notification Settings',
        href: '/adminsettings/notifications',
        icon: Bell,
        description: 'Configure notifications'
      },
      {
        title: 'Appearance',
        href: '/adminsettings/appearance',
        icon: Palette,
        description: 'Customize theme and layout'
      },
      {
        title: 'Backup & Restore',
        href: '/adminsettings/backup',
        icon: Database,
        description: 'System backup settings'
      },
      {
        title: 'API & Integrations',
        href: '/adminsettings/api',
        icon: FileCode,
        description: 'API settings and integrations'
      }
    ]
  }
];

// Reports submenu items
const reportsItems = [
  { title: 'Overview', href: '/reports/overview', icon: BarChartBig },
  { title: 'Residents', href: '/reports/residents', icon: Users },
  { title: 'Complaints', href: '/reports/complaints', icon: AlertCircle },
  { title: 'Export Data', href: '/reports/export', icon: Download },
];

// Forms & Announcements submenu items
const formsAnnouncementsItems = [
  { title: 'Forms', href: '/forms', icon: FileText },
  { title: 'Announcements', href: '/announcements', icon: Megaphone },
  { title: 'Upload Form', href: '/forms/create', icon: PlusCircle },
  { title: 'Create Announcement', href: '/announcements/create', icon: PlusCircle },
];

interface SettingsSidebarProps {
  currentPath: string;
  isAdmin?: boolean;
}

export default function SettingsSidebar({ currentPath, isAdmin = true }: SettingsSidebarProps) {
  const isReportsSection = currentPath.includes('/reports');
  const isFormsSection = currentPath.includes('/forms') || currentPath.includes('/announcements');

  return (
    <aside className="w-full max-w-xl lg:w-72">
      <nav className="flex flex-col space-y-8">
        {settingsCategories.map((category) => {
          if ((category.title === 'System Settings' || 
               category.title === 'System Administration' ||
               category.title === 'Barangay Administration') && !isAdmin) {
            return null;
          }
          
          return (
            <div key={category.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
                {category.title}
              </h3>
              <div className="space-y-1.5">
                {category.items.map((item) => {
                  if (!isAdmin && ['/admin/roles', '/admin/audit-logs', '/users'].includes(item.href)) {
                    return null;
                  }
                  
                  const isActive = isSameUrl(currentPath, item.href) || 
                    (item.href === '/admin/officials' && currentPath.includes('/admin/officials')) ||
                    (item.href === '/admin/positions' && currentPath.includes('/admin/positions')) ||
                    (item.href === '/admin/committees' && currentPath.includes('/admin/committees')) ||
                    (item.href === '/admin/puroks' && currentPath.includes('/admin/puroks')) ||
                    (item.href === '/reports' && currentPath.includes('/reports')) ||
                    (item.href === '/forms' && currentPath.includes('/forms')) ||
                    (item.href === '/announcements' && currentPath.includes('/announcements'));
                  
                  const showSubmenu = (item.href === '/reports' && isReportsSection) || 
                                    ((item.href === '/forms' || item.href === '/announcements') && isFormsSection);
                  
                  return (
                    <div key={item.href} className="space-y-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className={cn(
                          'w-full justify-start h-auto py-2.5 px-3',
                          'transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-900',
                          'hover:translate-x-1',
                          {
                            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500': 
                              isActive,
                            'border-l-2 border-transparent': !isActive
                          }
                        )}
                      >
                        <Link href={item.href}>
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                              isActive
                                ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400"
                                : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                            )}>
                              <item.icon className="h-4.5 w-4.5" />
                            </div>
                            <div className="flex flex-col items-start text-left">
                              <span className="font-medium text-sm">{item.title}</span>
                              {item.description && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </Button>
                      
                      {/* Submenu for Reports */}
                      {showSubmenu && item.href === '/reports' && (
                        <div className="ml-10 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3">
                          {reportsItems.map((subItem) => {
                            const isSubActive = isSameUrl(currentPath, subItem.href);
                            return (
                              <Button
                                key={subItem.href}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn(
                                  'w-full justify-start h-auto py-1.5 px-2 text-xs',
                                  'transition-colors hover:bg-gray-100 dark:hover:bg-gray-900',
                                  isSubActive && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                )}
                              >
                                <Link href={subItem.href}>
                                  <div className="flex items-center gap-2">
                                    <subItem.icon className="h-3.5 w-3.5" />
                                    <span>{subItem.title}</span>
                                  </div>
                                </Link>
                              </Button>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Submenu for Forms & Announcements */}
                      {showSubmenu && (item.href === '/forms' || item.href === '/announcements') && (
                        <div className="ml-10 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3">
                          {formsAnnouncementsItems.map((subItem) => {
                            const isSubActive = isSameUrl(currentPath, subItem.href);
                            return (
                              <Button
                                key={subItem.href}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn(
                                  'w-full justify-start h-auto py-1.5 px-2 text-xs',
                                  'transition-colors hover:bg-gray-100 dark:hover:bg-gray-900',
                                  isSubActive && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                )}
                              >
                                <Link href={subItem.href}>
                                  <div className="flex items-center gap-2">
                                    <subItem.icon className="h-3.5 w-3.5" />
                                    <span>{subItem.title}</span>
                                  </div>
                                </Link>
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Quick Stats for Admin */}
        {isAdmin && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              System Overview
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Active Users</span>
                <span className="text-sm font-medium">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Positions</span>
                <span className="text-sm font-medium">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Committees</span>
                <span className="text-sm font-medium">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Puroks</span>
                <span className="text-sm font-medium">7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Active Modules</span>
                <span className="text-sm font-medium">6/8</span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}