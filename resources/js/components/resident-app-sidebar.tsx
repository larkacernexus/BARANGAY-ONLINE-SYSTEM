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
  FileText,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useState, useRef, useEffect } from 'react';

// Resident navigation with working routes
const residentNav = [
  { title: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard, shortTitle: 'Dashboard' },
  { title: 'Profile', href: '/residentsettings/profile', icon: User, shortTitle: 'Profile' },
  { title: 'Fees & Charges', href: '/portal/fees', icon: Receipt, shortTitle: 'Fees' },
  { title: 'Receipts', href: '/portal/receipts', icon: FileText, shortTitle: 'Receipts' },
  { title: 'Payment History', href: '/portal/payments', icon: Wallet, shortTitle: 'Payments' },
  { title: 'Clearances', href: '/portal/my-clearances', icon: ShieldCheck, shortTitle: 'Clearances' },
  { title: 'Community Reports', href: '/portal/community-reports', icon: BarChart3, shortTitle: 'Reports' },
  { title: 'My Records', href: '/portal/my-records', icon: FolderOpen, shortTitle: 'Records' },
];

// Quick actions - include receipts as a quick action
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
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const isActive = (href: string) => {
    return url === href || url.startsWith(href + '/');
  };
  
  const toggleAllActions = () => {
    setShowAllActions(!showAllActions);
  };
  
  // Handle scroll event
  const handleScroll = () => {
    setIsScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set timeout to hide scrollbar after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };
  
  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const hasScroll = contentRef.current.scrollHeight > contentRef.current.clientHeight;
        setShowScrollHint(hasScroll);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      window.removeEventListener('resize', checkScrollable);
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [showAllActions]);
  
  // Determine which actions to show
  const displayedActions = showAllActions ? allQuickActions : initialQuickActions;
  
  return (
    <TooltipProvider delayDuration={300}>
      <Sidebar 
        collapsible="icon" 
        variant="sidebar" 
        className={cn(
          "border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950",
          "transition-all duration-300 ease-in-out",
          className
        )}
      >
        {/* Header */}
        <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 px-3 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" className="hover:bg-transparent w-full data-[state=open]:bg-transparent">
                <Link 
                  href="/portal/dashboard"
                  className={cn(
                    "flex items-center transition-all duration-300 w-full",
                    isCollapsed ? "px-0 justify-center" : "px-1"
                  )}
                >
                  {isCollapsed ? (
                    <div className="flex items-center justify-center">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm flex-shrink-0">
                        <Home className="h-4.5 w-4.5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm flex-shrink-0">
                        <Home className="h-4.5 w-4.5 text-white" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm tracking-tight truncate">
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

        {/* Content with custom scrollbar */}
        <div className="relative flex-1 overflow-hidden group">
          <SidebarContent 
            ref={contentRef}
            className={cn(
              "h-full overflow-y-auto overflow-x-hidden px-2 py-4",
              "scrollbar-hide",
              (isScrolling || showScrollHint) && "scrollbar-visible"
            )}
          >
            {/* Quick Actions Section */}
            <SidebarGroup>
              {!isCollapsed && (
                <SidebarGroupLabel className="text-[0.7rem] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
                  Quick Actions
                </SidebarGroupLabel>
              )}
              <SidebarMenu className="space-y-0.5">
                {/* Display quick actions */}
                {displayedActions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild className="w-full">
                          <Link 
                            href={item.href} 
                            className={cn(
                              "group flex items-center gap-3 transition-all duration-150 rounded-md w-full",
                              isCollapsed ? "justify-center p-2" : "px-2.5 py-2",
                              "hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            <div className={cn(
                              "flex items-center justify-center rounded-md transition-all duration-150 flex-shrink-0",
                              isCollapsed 
                                ? "h-9 w-9 bg-gray-100 dark:bg-gray-800" 
                                : "h-8 w-8 bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                            )}>
                              <item.icon className={cn(
                                "transition-all text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200",
                                isCollapsed ? "h-4 w-4" : "h-3.5 w-3.5"
                              )} />
                            </div>
                            {!isCollapsed && (
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block truncate">
                                  {item.title}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                                  {item.description}
                                </span>
                              </div>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        <div className="flex flex-col gap-0.5">
                          <span>{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}

                {/* See All / See Less button - only show in expanded state */}
                {!isCollapsed && allQuickActions.length > initialQuickActions.length && (
                  <SidebarMenuItem className="mt-1">
                    <button
                      onClick={toggleAllActions}
                      className={cn(
                        "group flex items-center gap-3 transition-all duration-150 rounded-md w-full px-2.5 py-2",
                        "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
                        {showAllActions ? (
                          <ChevronUp className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                      <SidebarMenuItem>
                        <div 
                          className="group flex items-center justify-center transition-all duration-150 rounded-md w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={toggleAllActions}
                        >
                          <div className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
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
              </SidebarMenu>
            </SidebarGroup>

            {/* Divider */}
            <div className="my-4 h-px bg-gray-200 dark:bg-gray-800 mx-2" />

            {/* Main Navigation */}
            <SidebarGroup>
              {!isCollapsed && (
                <SidebarGroupLabel className="text-[0.7rem] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
                  Navigation
                </SidebarGroupLabel>
              )}
              <SidebarMenu className="space-y-0.5">
                {residentNav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="w-full" isActive={active}>
                            <Link 
                              href={item.href} 
                              className={cn(
                                "group flex items-center gap-3 transition-all duration-150 rounded-md w-full",
                                isCollapsed ? "justify-center p-2" : "px-2.5 py-2"
                              )}
                            >
                              <div className={cn(
                                "flex items-center justify-center rounded-md transition-all duration-150 flex-shrink-0",
                                isCollapsed ? "h-9 w-9" : "h-8 w-8",
                                active 
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:text-gray-900 dark:group-hover:text-gray-200"
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
                                      : "text-gray-900 dark:text-gray-100"
                                  )}>
                                    {item.title}
                                  </span>
                                  {active && (
                                    <ChevronRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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

            {/* Divider */}
            <div className="my-4 h-px bg-gray-200 dark:bg-gray-800 mx-2" />

            {/* Resources Section */}
            <SidebarGroup>
              {!isCollapsed && (
                <SidebarGroupLabel className="text-[0.7rem] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
                  Resources
                </SidebarGroupLabel>
              )}
              <SidebarMenu className="space-y-0.5">
                {residentResources.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="w-full" isActive={active}>
                            <Link 
                              href={item.href} 
                              className={cn(
                                "group flex items-center gap-3 transition-all duration-150 rounded-md w-full",
                                isCollapsed ? "justify-center p-2" : "px-2.5 py-2"
                              )}
                            >
                              <div className={cn(
                                "flex items-center justify-center rounded-md transition-all duration-150 flex-shrink-0",
                                isCollapsed ? "h-9 w-9" : "h-8 w-8",
                                active 
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:text-gray-900 dark:group-hover:text-gray-200"
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
                                      : "text-gray-900 dark:text-gray-100"
                                  )}>
                                    {item.title}
                                  </span>
                                  {item.badge && !active && (
                                    <Badge className="bg-red-500 text-white border-0 text-[10px] px-1.5 py-0 flex-shrink-0">
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
              <div className="mt-auto pt-4 px-1">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3.5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      <Building className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-[0.7rem] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                      Barangay Office
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">Contact</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-shrink-0 whitespace-nowrap">(082) 123-4567</span>
                    </div>
                    <div className="flex items-start gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed truncate">
                        Poblacion, Kibawe
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">8AM - 5PM, Mon-Fri</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SidebarContent>

          {/* Scroll hint indicator */}
          {showScrollHint && !isCollapsed && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none flex items-end justify-center pb-1">
              <div className="w-8 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>
          )}
        </div>

        {/* Footer */}
        <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 px-3 py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "transition-all duration-150 w-full",
                isCollapsed ? "flex justify-center" : ""
              )}>
                {!isCollapsed ? (
                  <div className="w-full">
                    <NavResident />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all flex-shrink-0">
                    <User className="h-4.5 w-4.5 text-white" />
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