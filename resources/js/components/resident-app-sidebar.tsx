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
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { NavResident } from './nav-resident';
import { 
  LayoutDashboard, 
  User,
  Bell,
  Calendar,
  Home,
  History,
  Settings,
  MapPin,
  Building,
  Receipt,
  AlertCircle,
  Zap,
  ChevronRight,
  BarChart3,
  FolderOpen,
  ScrollText,
  DollarSign,
  HelpCircle,
  Wallet,
  Clock,
  ShieldCheck,
  Newspaper,
  ChevronDown,
  ChevronUp,
  QrCode,
  Lock,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// Resident navigation with working routes
const residentNav = [
  { title: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard, shortTitle: 'Dashboard' },
  { title: 'Profile', href: '/residentsettings/profile', icon: User, shortTitle: 'Profile' },
  { title: 'Fees & Charges', href: '/portal/fees', icon: Receipt, shortTitle: 'Fees' },
  { title: 'Payment History', href: '/portal/payments', icon: Wallet, shortTitle: 'Payments' },
  { title: 'Clearances', href: '/portal/my-clearances', icon: ShieldCheck, shortTitle: 'Clearances' },
  { title: 'Community Reports', href: '/portal/community-reports', icon: BarChart3, shortTitle: 'Reports' },
  { title: 'My Records', href: '/portal/my-records', icon: FolderOpen, shortTitle: 'Records' },
];

// Quick actions - only include routes that exist in your web.php
const allQuickActions = [
  { 
    title: 'Request Clearance', 
    shortTitle: 'Clearance',
    href: '/portal/my-clearances/request', 
    icon: ScrollText, 
    description: 'Get documents'
  },
  { 
    title: 'Submit Report', 
    shortTitle: 'Report',
    href: '/portal/community-reports/create', 
    icon: AlertCircle, 
    description: 'Report issue'
  },
  { 
    title: 'View Announcements', 
    shortTitle: 'News',
    href: '/portal/announcements', 
    icon: Newspaper, 
    description: 'Latest updates'
  },
  { 
    title: 'QR Code Login', 
    shortTitle: 'QR',
    href: '/residentsettings/profile?tab=qr', 
    icon: QrCode, 
    description: 'Generate QR code for login'
  },
  { 
    title: 'Two-Factor Auth', 
    shortTitle: '2FA',
    href: '/residentsettings/security/two-factor', 
    icon: Lock, 
    description: 'Secure your account'
  },
  { 
    title: 'Security Settings', 
    shortTitle: 'Security',
    href: '/residentsettings/security/password', 
    icon: ShieldCheck, 
    description: 'Password & security'
  },
  { 
    title: 'Notification Settings', 
    shortTitle: 'Notif',
    href: '/residentsettings/preferences/notifications', 
    icon: Bell, 
    description: 'Manage notifications'
  },
];

// Display only 4 quick actions initially
const initialQuickActions = allQuickActions.slice(0, 4);
const additionalQuickActions = allQuickActions.slice(4);

const residentResources = [
  { title: 'Announcements', href: '/portal/announcements', icon: Newspaper, badge: null, shortTitle: 'News' },
  { title: 'Forms & Templates', href: '/portal/forms', icon: ScrollText, badge: null, shortTitle: 'Forms' },
  { title: 'Support Center', href: '/portal/support', icon: HelpCircle, badge: null, shortTitle: 'Support' },
  { title: 'Settings', href: '/residentsettings/profile', icon: Settings, badge: null, shortTitle: 'Settings' },
];

export function ResidentSidebar({ className }: { className?: string }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { url } = usePage();
  const [showAllActions, setShowAllActions] = useState(false);
  
  const isActive = (href: string) => {
    return url === href || url.startsWith(href + '/');
  };
  
  const toggleAllActions = () => {
    setShowAllActions(!showAllActions);
  };
  
  // Determine which actions to show
  const displayedActions = showAllActions ? allQuickActions : initialQuickActions;
  
  return (
    <TooltipProvider delayDuration={300}>
      <Sidebar 
        collapsible="icon" 
        variant="inset" 
        className={cn(
          "border-r border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-950",
          "shadow-sm backdrop-blur-sm transition-all duration-300",
          className
        )}
      >
        {/* Header */}
        <SidebarHeader className="border-b border-gray-200/50 dark:border-gray-800/50 px-4 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" className="hover:bg-transparent w-full">
                <Link 
                  href="/portal/dashboard"
                  className={cn(
                    "flex items-center transition-all duration-300 w-full",
                    isCollapsed ? "px-0 justify-center" : "px-1"
                  )}
                >
                  {isCollapsed ? (
                    <div className="flex items-center justify-center">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm tracking-tight truncate">
                          Resident Portal
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                          Barangay Kibawe
                        </span>
                      </div>
                    </div>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Content */}
        <SidebarContent 
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden px-3 py-5",
            "custom-scrollbar"
          )}
        >
      
          {/* Quick Actions Section */}
          <SidebarGroup className="w-full mb-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-3 w-full">
                Quick Actions
              </SidebarGroupLabel>
            )}
            <div className="grid grid-cols-1 gap-1 w-full">
              {/* Display quick actions */}
              {displayedActions.map((item) => (
                <SidebarMenuItem key={item.title} className="w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild className="w-full p-0">
                        <Link 
                          href={item.href} 
                          className={cn(
                            "group flex items-center gap-3 transition-all duration-200 rounded-lg w-full",
                            isCollapsed ? "justify-center p-2" : "px-3 py-2",
                            !isCollapsed && "hover:bg-gray-100 dark:hover:bg-gray-900"
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0",
                            isCollapsed 
                              ? "h-10 w-10 bg-gray-100 dark:bg-gray-900" 
                              : "h-8 w-8 bg-gray-100 dark:bg-gray-900 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                          )}>
                            <item.icon className={cn(
                              "transition-all text-gray-600 dark:text-gray-400",
                              isCollapsed ? "h-4 w-4" : "h-3.5 w-3.5"
                            )} />
                          </div>
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                                  {item.title}
                                </span>
                                <Zap className="h-3.5 w-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                                {item.description}
                              </p>
                            </div>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{item.title}</span>
                        <span className="text-xs text-gray-500">{item.description}</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}

              {/* See All / See Less button - only show in expanded state */}
              {!isCollapsed && allQuickActions.length > initialQuickActions.length && (
                <SidebarMenuItem className="w-full mt-1">
                  <button
                    onClick={toggleAllActions}
                    className={cn(
                      "group flex items-center gap-3 transition-all duration-200 rounded-lg w-full px-3 py-2",
                      "hover:bg-gray-100 dark:hover:bg-gray-900"
                    )}
                  >
                    <div className="h-8 w-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
                      {showAllActions ? (
                        <ChevronUp className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {showAllActions ? 'See Less' : 'See All'}
                      </span>
                    </div>
                  </button>
                </SidebarMenuItem>
              )}

              {/* For collapsed state, show tooltip with all actions */}
              {isCollapsed && allQuickActions.length > initialQuickActions.length && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuItem className="w-full">
                      <div 
                        className="group flex items-center justify-center transition-all duration-200 rounded-lg w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
                        onClick={toggleAllActions}
                      >
                        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                          {showAllActions ? (
                            <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                      </div>
                    </SidebarMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {showAllActions ? 'See Less' : 'See All Actions'}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </SidebarGroup>

          {/* Main Navigation */}
          <SidebarGroup className="w-full mb-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-3 w-full">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarMenu className="w-full">
              {residentNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.title} className="w-full">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild className="w-full">
                          <Link 
                            href={item.href} 
                            className={cn(
                              "group flex items-center gap-3 transition-all duration-200 rounded-lg w-full",
                              active && "bg-blue-50 dark:bg-blue-900/20",
                              isCollapsed ? "justify-center p-2" : "px-3 py-2"
                            )}
                          >
                            <div className={cn(
                              "flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0",
                              isCollapsed ? "h-10 w-10" : "h-8 w-8",
                              active 
                                ? "bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400" 
                                : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                            )}>
                              <item.icon className={cn(
                                isCollapsed ? "h-4 w-4" : "h-3.5 w-3.5"
                              )} />
                            </div>
                            {!isCollapsed && (
                              <>
                                <span className={cn(
                                  "flex-1 text-sm font-medium transition-colors truncate",
                                  active 
                                    ? "text-blue-600 dark:text-blue-400" 
                                    : "text-gray-700 dark:text-gray-300"
                                )}>
                                  {item.title}
                                </span>
                                {active && (
                                  <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                )}
                              </>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* Resources Section */}
          <SidebarGroup className="w-full mb-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-3 w-full">
                Resources
              </SidebarGroupLabel>
            )}
            <SidebarMenu className="w-full">
              {residentResources.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.title} className="w-full">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild className="w-full">
                          <Link 
                            href={item.href} 
                            className={cn(
                              "group flex items-center gap-3 transition-all duration-200 rounded-lg w-full relative",
                              active && "bg-blue-50 dark:bg-blue-900/20",
                              isCollapsed ? "justify-center p-2" : "px-3 py-2"
                            )}
                          >
                            <div className={cn(
                              "flex items-center justify-center rounded-lg transition-all duration-200 relative flex-shrink-0",
                              isCollapsed ? "h-10 w-10" : "h-8 w-8",
                              active 
                                ? "bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400" 
                                : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                            )}>
                              <item.icon className={cn(
                                isCollapsed ? "h-4 w-4" : "h-3.5 w-3.5"
                              )} />
                              {item.badge && !active && (
                                <span className="absolute -top-1 -right-1 h-2 w-2">
                                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                                  <span className="relative rounded-full h-2 w-2 bg-red-500" />
                                </span>
                              )}
                            </div>
                            
                            {!isCollapsed && (
                              <>
                                <span className={cn(
                                  "flex-1 text-sm font-medium transition-colors truncate",
                                  active 
                                    ? "text-blue-600 dark:text-blue-400" 
                                    : "text-gray-700 dark:text-gray-300"
                                )}>
                                  {item.title}
                                </span>
                                {item.badge && !active && (
                                  <Badge className="bg-red-500 text-white border-0 text-[10px] px-1.5 py-0.5 flex-shrink-0">
                                    {item.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        <div className="flex items-center gap-2">
                          {item.title}
                          {item.badge && (
                            <Badge className="bg-red-500 text-white border-0 text-[10px] px-1.5">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* Barangay Information */}
          {!isCollapsed && (
            <div className="mt-auto pt-4 w-full">
              <div className="rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950 p-4 w-full">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                    <Building className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider truncate">
                    Barangay Office
                  </span>
                </div>
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">Contact</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-shrink-0 whitespace-nowrap">(082) 123-4567</span>
                  </div>
                  <div className="flex items-start gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-800/50 w-full">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed truncate">
                      Poblacion, Kibawe
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 w-full">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">8AM - 5PM, Mon-Fri</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t border-gray-200/50 dark:border-gray-800/50 px-3 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "transition-all duration-200 w-full",
                isCollapsed ? "flex justify-center" : ""
              )}>
                {!isCollapsed ? (
                  <div className="w-full">
                    <NavResident />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer hover:shadow-xl hover:scale-105 transition-all flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Account Settings
            </TooltipContent>
          </Tooltip>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}