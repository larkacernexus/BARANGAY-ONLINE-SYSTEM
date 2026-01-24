import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { NavUser } from '@/components/nav-user';
import { 
  LayoutGrid, 
  Users, 
  Home, 
  CreditCard, 
  FileText, 
  Settings, 
  UserCog, 
  Zap,
  PlusCircle,
  Building2,
  MapPin,
  BarChart3,
  ClipboardList,
  DollarSign,
  ChevronRight,
  LucideIcon,
  X,
  Shield,
  Key,
  ShieldCheck,
  Activity,
  BarChartBig,
  FileBarChart2,
  MessageSquareWarning,
  AlertCircle,
  LogIn,
  Monitor,
  Bell,
  Megaphone,
  Tag,
  Folder,
  Download,
  FileArchive
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

const DASHBOARD_URL = '/dashboard';

// Define interface for sidebar items
interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

interface MenuGroup {
  title: string;
  icon: LucideIcon;
  items: SidebarItem[];
}

interface QuickAction {
  title: string;
  href: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

// Main navigation items - ADDED FORMS HERE
const mainNav = [
  { title: 'Dashboard', href: DASHBOARD_URL, icon: LayoutGrid },
  { title: 'Residents', href: '/residents', icon: Users },
  { title: 'Households', href: '/households', icon: Home },
  { title: 'Puroks', href: '/admin/puroks', icon: MapPin },
  { title: 'Complaints', href: '/admincomplaints', icon: MessageSquareWarning },
  { title: 'Announcements', href: '/announcements', icon: Bell },
  { title: 'Forms', href: '/admin/forms', icon: FileArchive }, // ADDED FORMS TO MAIN NAV
  { title: 'Users', href: '/users', icon: UserCog },
];

// Menu groups for popup - ADDED FORMS GROUP HERE
const menuGroups: MenuGroup[] = [
  {
    title: 'Forms & Documents', // NEW GROUP FOR FORMS
    icon: FileArchive,
    items: [
      { title: 'All Forms', href: '/admin/forms', icon: FileText },
      { title: 'Upload New Form', href: '/admin/forms/create', icon: PlusCircle },
      { title: 'Active Forms', href: '/admin/forms?status=active', icon: FileText },
      { title: 'Archived Forms', href: '/admin/forms?status=inactive', icon: FileArchive },
      { title: 'Most Downloaded', href: '/admin/forms?sort=downloads', icon: Download },
      { title: 'Public Forms', href: '/downloadable-forms', icon: Folder, description: 'Resident view' },
    ]
  },
  {
    title: 'Announcements',
    icon: Bell,
    items: [
      { title: 'All Announcements', href: '/announcements', icon: Megaphone },
      { title: 'Create Announcement', href: '/announcements/create', icon: PlusCircle },
      { title: 'Active Announcements', href: '/announcements?status=active', icon: Bell },
      { title: 'Archived', href: '/announcements?status=inactive', icon: FileText },
      { title: 'Announcement Types', href: '/announcement-types', icon: Tag },
    ]
  },
  {
    title: 'Access Control', 
    icon: ShieldCheck,
    items: [
      { title: 'Role Permissions', href: '/admin/role-permissions', icon: ShieldCheck },
      { title: 'User Roles', href: '/admin/user-roles', icon: UserCog },
      { title: 'Permission Audit', href: '/admin/permission-audit', icon: ClipboardList },
    ]
  },
  {
    title: 'Security',
    icon: Shield,
    items: [
      { title: 'Login Activity', href: '/reports/login-logs', icon: LogIn },
      { title: 'Failed Attempts', href: '/reports/login-logs?status=failed', icon: AlertCircle },
      { title: 'User Sessions', href: '/security/sessions', icon: Monitor },
      { title: 'Security Audit', href: '/security/security-audit', icon: ShieldCheck },
      { title: 'Access Logs', href: '/security/access-logs', icon: FileText },
    ]
  },
  {
    title: 'Fees & Billing',
    icon: DollarSign,
    items: [
      { title: 'All Fees', href: '/fees', icon: CreditCard },
      { title: 'Create Fee', href: '/fees/create', icon: PlusCircle },
      { title: 'Fee Types', href: '/fee-types', icon: CreditCard },
      { title: 'Payments', href: '/payments', icon: CreditCard },
      { title: 'Record Payment', href: '/payments/create', icon: PlusCircle },
    ]
  },
  {
    title: 'Clearances',
    icon: FileText,
    items: [
      { title: 'All Clearances', href: '/clearances', icon: FileText },
      { title: 'Issue Clearance', href: '/clearances/create', icon: PlusCircle },
      { title: 'Clearance Types', href: '/clearance-types', icon: FileText },
      { title: 'Templates', href: '/clearances/templates', icon: FileText },
    ]
  },
  {
    title: 'Reports',
    icon: FileBarChart2,
    items: [
      { title: 'Collections Report', href: '/reports/collections', icon: BarChart3 },
      { title: 'Revenue Analytics', href: '/reports/revenue', icon: BarChartBig },
      { title: 'Audit Logs', href: '/reports/audit-logs', icon: ClipboardList },
      { title: 'Activity Logs', href: '/reports/activity-logs', icon: Activity },
      { title: 'Announcement Stats', href: '/reports/announcements', icon: Bell },
      { title: 'Forms Downloads', href: '/reports/forms-downloads', icon: Download },
    ]
  }
];

// Quick Actions - ADDED FORMS QUICK ACTION
const quickActions: QuickAction[] = [
  { title: 'Add Resident', href: '/residents/create', icon: Users, color: 'blue' },
  { title: 'Register Household', href: '/households/create', icon: Home, color: 'green' },
  { title: 'Add Purok', href: '/admin/puroks/create', icon: MapPin, color: 'purple' },
  { title: 'Create Announcement', href: '/announcements/create', icon: Bell, color: 'red' },
  { title: 'Upload Form', href: '/admin/forms/create', icon: FileArchive, color: 'indigo' }, // ADDED FORMS
  { title: 'Issue Clearance', href: '/clearances/create', icon: FileText, color: 'orange' },
  { title: 'Create Role', href: '/admin/roles/create', icon: Shield, color: 'blue' },
  { title: 'Add Permission', href: '/admin/permissions/create', icon: Key, color: 'green' },
];

// Popup Menu Component
const MenuPopup = ({ 
  group, 
  isOpen, 
  onClose,
  position 
}: { 
  group: MenuGroup;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number; placement: 'bottom' | 'top' };
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      
      {/* Popup Menu */}
      <div 
        className={cn(
          "fixed z-50 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2",
          position.placement === 'top' ? "bottom-auto" : "top-auto"
        )}
        style={{
          [position.placement === 'top' ? 'bottom' : 'top']: position.placement === 'top' 
            ? `calc(100vh - ${position.top}px)` 
            : `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-2 border-b border-gray-100 dark:border-gray-800 mb-2">
          <group.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-sm">{group.title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Menu Items */}
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {group.items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={onClose}
            >
              <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <div className="flex-1 min-w-0">
                <span className="text-sm block truncate">{item.title}</span>
                {item.description && (
                  <span className="text-xs text-gray-500 truncate block">{item.description}</span>
                )}
              </div>
              {item.title.includes('Create') || item.title.includes('Upload') || item.title.includes('Issue') || item.title.includes('Record') || item.title.includes('Add') ? (
                <PlusCircle className="h-3 w-3 ml-2 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

// Menu Item with Popup
const MenuWithPopup = ({ 
  group, 
  isCollapsed 
}: { 
  group: MenuGroup;
  isCollapsed: boolean;
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ 
    top: 0, 
    left: 0, 
    placement: 'bottom' as 'bottom' | 'top' 
  });
  
  const buttonRef = useRef<HTMLButtonElement>(null);

  const calculatePopupPosition = () => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const popupHeight = 300;
    const windowHeight = window.innerHeight;
    
    let placement: 'bottom' | 'top' = 'bottom';
    let top = 0;
    let left = 0;
    
    if (isCollapsed) {
      left = rect.right + 10;
      
      if (rect.top + popupHeight > windowHeight) {
        placement = 'top';
        top = rect.top;
      } else {
        placement = 'bottom';
        top = rect.top;
      }
    } else {
      left = rect.left;
      
      if (rect.bottom + popupHeight > windowHeight) {
        placement = 'top';
        top = rect.top;
      } else {
        placement = 'bottom';
        top = rect.bottom;
      }
    }
    
    setPopupPosition({ top, left, placement });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    calculatePopupPosition();
    setIsPopupOpen(true);
  };

  if (isCollapsed) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleClick}
                ref={buttonRef}
                className="flex items-center justify-center"
              >
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                  <group.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{group.title}</p>
            <p className="text-xs text-gray-500">Click to open menu</p>
          </TooltipContent>
        </Tooltip>

        <MenuPopup
          group={group}
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          position={popupPosition}
        />
      </>
    );
  }

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton 
          onClick={handleClick}
          ref={buttonRef}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
              <group.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span>{group.title}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </SidebarMenuButton>
      </SidebarMenuItem>

      <MenuPopup
        group={group}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        position={popupPosition}
      />
    </>
  );
};

// Simple Menu Item
const SimpleMenuItem = ({ 
  item, 
  isCollapsed 
}: { 
  item: SidebarItem;
  isCollapsed: boolean;
}) => (
  <SidebarMenuItem key={item.title}>
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarMenuButton asChild>
          <Link 
            href={item.href} 
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <div className={cn(
              isCollapsed ? "h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800" : ""
            )}>
              <item.icon className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <span className="truncate">{item.title}</span>
            )}
          </Link>
        </SidebarMenuButton>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right">
          <p>{item.title}</p>
        </TooltipContent>
      )}
    </Tooltip>
  </SidebarMenuItem>
);

// Quick Action Item - ADDED INDIGO COLOR FOR FORMS
const QuickActionItem = ({ 
  action, 
  isCollapsed 
}: { 
  action: QuickAction;
  isCollapsed: boolean;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400", // NEW COLOR FOR FORMS
  };

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link 
                href={action.href}
                className="flex items-center justify-center"
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:scale-105",
                  colorClasses[action.color]
                )}>
                  <action.icon className="h-4 w-4" />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{action.title}</p>
          <p className="text-xs text-gray-500">Quick action</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link 
          href={action.href}
          className="flex items-center gap-2 group"
        >
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105",
            colorClasses[action.color]
          )}>
            <action.icon className="h-4 w-4" />
          </div>
          <span className="truncate">{action.title}</span>
          <PlusCircle className="h-3 w-3 ml-auto text-green-600 dark:text-green-400" />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function AppSidebar({ className }: { className?: string }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const isAdmin = true;

  return (
    <TooltipProvider>
      <Sidebar 
        collapsible="icon" 
        variant="inset" 
        className={cn("border-r", className)}
      >
        <SidebarHeader className="border-b p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link 
                  href={DASHBOARD_URL}
                  className={cn(
                    "flex items-center justify-center",
                    isCollapsed ? "px-0" : "px-2"
                  )}
                >
                  {isCollapsed ? (
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-gray-900 dark:text-white truncate">
                          Brgy. Kibawe
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          Management System
                        </span>
                      </div>
                    </div>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="space-y-6 p-4">
          {/* Quick Actions Section */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="flex items-center gap-2 px-1 mb-2">
                <Zap className="h-3 w-3 text-amber-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase truncate">
                  Quick Actions
                </span>
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {quickActions.map((action) => (
                <QuickActionItem 
                  key={action.title} 
                  action={action} 
                  isCollapsed={isCollapsed} 
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* Main Navigation */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs text-gray-500 dark:text-gray-400 uppercase px-1 mb-2">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {mainNav.map((item) => (
                <SimpleMenuItem key={item.title} item={item} isCollapsed={isCollapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* Menu Groups with Popups */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs text-gray-500 dark:text-gray-400 uppercase px-1 mb-2">
                Modules
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {menuGroups.map((group) => {
                // Hide reports for non-admin users
                if (group.title === 'Reports' && !isAdmin) return null;
                
                return (
                  <MenuWithPopup 
                    key={group.title}
                    group={group}
                    isCollapsed={isCollapsed}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t p-4">
          {!isCollapsed ? (
            <NavUser />
          ) : (
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-sm font-medium text-white">U</span>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}