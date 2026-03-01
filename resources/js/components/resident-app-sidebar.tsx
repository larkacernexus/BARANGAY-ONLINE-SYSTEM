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
  CreditCard, 
  FileText, 
  MessageSquare,
  User,
  Bell,
  Calendar,
  Download,
  Home,
  History,
  Settings,
  Shield,
  Phone,
  MapPin,
  Building,
  FileCheck,
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
  Newspaper
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Resident navigation with fixed widths for text
const residentNav = [
  { title: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard, shortTitle: 'Dashboard' },
  { title: 'Profile', href: '/residentsettings/profile', icon: User, shortTitle: 'Profile' },
  { title: 'Fees & Charges', href: '/portal/fees', icon: Receipt, shortTitle: 'Fees' },
  { title: 'Payment History', href: '/portal/my-payments', icon: Wallet, shortTitle: 'Payments' },
  { title: 'Clearances', href: '/portal/my-clearances', icon: ShieldCheck, shortTitle: 'Clearances' },
  { title: 'Community Reports', href: '/portal/community-reports', icon: BarChart3, shortTitle: 'Reports' },
  { title: 'Documents', href: '/portal/my-records', icon: FolderOpen, shortTitle: 'Documents' },
];

const residentQuickActions = [
  { 
    title: 'Make Payment', 
    shortTitle: 'Pay',
    href: '/portal/my-payments/pay', 
    icon: DollarSign, 
    description: 'Pay fees online'
  },
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
];

const residentResources = [
  { title: 'Announcements', href: '/portal/announcements', icon: Newspaper, badge: '2', shortTitle: 'News' },
  { title: 'Forms & Templates', href: '/portal/forms', icon: FileText, shortTitle: 'Forms' },
  { title: 'Support Center', href: '/portal/support', icon: HelpCircle, shortTitle: 'Support' },
  { title: 'Settings', href: '/portal/settings', icon: Settings, shortTitle: 'Settings' },
];

export function ResidentSidebar({ className }: { className?: string }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { url } = usePage();
  
  const isActive = (href: string) => {
    return url === href || url.startsWith(href + '/');
  };
  
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

        {/* Content - Fixed overflow and spacing with native scrollbar styling */}
        <SidebarContent 
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden px-3 py-5",
            // Custom scrollbar styles using global CSS classes
            "custom-scrollbar"
          )}
        >
          {/* Emergency Contact - Fixed positioning and visibility */}
          {!isCollapsed && (
            <div className="relative mb-4 w-full block">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/5 via-red-400/5 to-orange-400/5 dark:from-red-500/10 dark:via-red-400/10 dark:to-orange-400/10 p-4 border border-red-200/50 dark:border-red-800/30 w-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-1.5 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex-shrink-0">
                    <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider truncate">
                    Emergency
                  </span>
                </div>
                <div className="space-y-2.5 w-full">
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Emergency Hotline</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400 flex-shrink-0 whitespace-nowrap">911</span>
                  </div>
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Barangay Hall</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 flex-shrink-0 whitespace-nowrap">(082) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-red-200/30 dark:border-red-800/30 w-full">
                    <Phone className="h-3 w-3 text-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium truncate">
                      24/7 Hotline Available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Section */}
          <SidebarGroup className="w-full mb-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-3 w-full">
                Quick Actions
              </SidebarGroupLabel>
            )}
            <SidebarMenu className="w-full">
              {residentQuickActions.map((item) => (
                <SidebarMenuItem key={item.title} className="w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild className="w-full">
                        <Link 
                          href={item.href} 
                          className={cn(
                            "group flex items-center gap-3 transition-all duration-200 rounded-lg w-full",
                            isCollapsed ? "justify-center p-2" : "px-3 py-2"
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0",
                            isCollapsed 
                              ? "h-10 w-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30" 
                              : "h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-md group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                          )}>
                            <item.icon className={cn(
                              "transition-colors",
                              isCollapsed 
                                ? "h-4 w-4 text-blue-600 dark:text-blue-400" 
                                : "h-3.5 w-3.5 text-gray-600 dark:text-gray-400"
                            )} />
                          </div>
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
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
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
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
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
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
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
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