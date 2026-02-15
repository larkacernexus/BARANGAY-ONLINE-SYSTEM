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
  LayoutGrid, 
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
  Building2,
  FileCheck,
  Receipt,
  AlertCircle,
  Zap, // For Quick Actions
  ChevronRight, // For active state indicator
  FileBarChart // For Reports icon alternative
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Resident-specific navigation - UPDATED with My Reports
const residentNav = [
  { title: 'Dashboard', href: '/residentdashboard', icon: LayoutGrid },
  { title: 'My Profile', href: '/residentsettings/profile', icon: User },
  { title: 'My Fees', href: '/residentfees', icon: Receipt },
  { title: 'My Payments', href: '/my-payments', icon: CreditCard },
  { title: 'My Clearances', href: '/my-clearances', icon: FileCheck },
  { title: 'My Reports', href: '/community-reports', icon: FileBarChart }, // Changed to My Reports with appropriate icon
  { title: 'Document Vault', href: '/my-records', icon: History },
];

const residentQuickActions = [
  { 
    title: 'Pay Fees', 
    href: '/my-payments/pay', 
    icon: CreditCard, 
    color: 'text-emerald-600 bg-emerald-50 border border-emerald-100' 
  },
  { 
    title: 'Request Clearance', 
    href: '/my-clearances/request', 
    icon: FileText, 
    color: 'text-blue-600 bg-blue-50 border border-blue-100' 
  },
  { 
    title: 'Submit Report', 
    href: '/community-reports/create', 
    icon: FileBarChart, 
    color: 'text-amber-600 bg-amber-50 border border-amber-100' 
  },
];

const residentResources = [
  { title: 'Announcements', href: '/resident-announcements', icon: Bell },
  { title: 'Forms & Documents', href: '/resident-forms', icon: Download },
  { title: 'Settings', href: '/resident/settings', icon: Settings },
];

export function ResidentSidebar({ className }: { className?: string }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { url } = usePage();
  
  const isActive = (href: string) => {
    return url === href || url.startsWith(href + '/');
  };
  
  const isAnnouncementsActive = url === '/resident-announcements' || url.startsWith('/resident-announcements/');
  
  return (
    <TooltipProvider delayDuration={300}>
      <Sidebar 
        collapsible="icon" 
        variant="inset" 
        className={cn("border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950", className)}
      >
        {/* Header */}
        <SidebarHeader className="border-b border-gray-100 dark:border-gray-800 px-4 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link 
                  href="/resident/dashboard"
                  className={cn(
                    "flex items-center transition-all duration-200 hover:bg-transparent",
                    isCollapsed ? "px-0 justify-center" : "px-2"
                  )}
                >
                  {isCollapsed ? (
                    <div className="flex items-center justify-center">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-md">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-md">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm tracking-tight truncate">
                          Resident Portal
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
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
        <SidebarContent className="space-y-6 px-3 py-4">
          {/* Emergency Contact - Professional styling */}
          {!isCollapsed && (
            <div className="rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-100 dark:border-red-800/30 p-3 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-red-700 dark:text-red-400" />
                <span className="text-xs font-semibold text-red-900 dark:text-red-200 uppercase tracking-wide">
                  Emergency Contacts
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-800 dark:text-red-300 font-medium">Emergency Hotline</span>
                  <span className="text-xs font-bold text-red-900 dark:text-red-100">911</span>
                </div>
                <div className="text-[10px] text-red-700 dark:text-red-400 font-medium tracking-tight">
                  Police • Fire • Medical
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Section */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2">
                Quick Actions
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {residentQuickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                        <Link 
                          href={item.href} 
                          className={cn(
                            "flex items-center gap-2.5 transition-colors duration-150",
                            isCollapsed ? "justify-center px-0" : "px-2"
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center rounded-md transition-all duration-200",
                            isCollapsed ? `h-9 w-9 ${item.color}` : "h-8 w-8"
                          )}>
                            <item.icon className={cn(
                              "h-3.5 w-3.5",
                              isCollapsed ? "text-current" : item.color.split(' ')[0]
                            )} />
                          </div>
                          {!isCollapsed && (
                            <div className="flex items-center justify-between flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                {item.title}
                              </span>
                              <Zap className="h-3 w-3 text-amber-500 flex-shrink-0" />
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

          {/* Main Navigation Section */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2">
                Account Navigation
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {residentNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <Link 
                            href={item.href} 
                            className={cn(
                              "flex items-center gap-2.5 py-2 transition-all duration-200",
                              active && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
                              isCollapsed ? "justify-center px-0" : "px-2"
                            )}
                          >
                            <div className={cn(
                              "flex items-center justify-center rounded-md",
                              isCollapsed ? "h-9 w-9" : "h-8 w-8",
                              active ? "bg-blue-100 dark:bg-blue-800/30" : "bg-gray-100 dark:bg-gray-800",
                              !active && "hover:bg-gray-200 dark:hover:bg-gray-700"
                            )}>
                              <item.icon className={cn(
                                "h-3.5 w-3.5 transition-colors",
                                active ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                              )} />
                            </div>
                            {!isCollapsed && (
                              <div className="flex items-center justify-between flex-1 min-w-0">
                                <span className={cn(
                                  "text-sm font-medium truncate",
                                  active ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                                )}>
                                  {item.title}
                                </span>
                                {active && (
                                  <ChevronRight className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300 flex-shrink-0" />
                                )}
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
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* Resources Section */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2">
                Resources
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {residentResources.map((item) => {
                const active = isActive(item.href);
                const isAnnouncement = item.title === 'Announcements';
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <Link 
                            href={item.href} 
                            className={cn(
                              "flex items-center gap-2.5 py-2 transition-all duration-200 relative",
                              active && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
                              isCollapsed ? "justify-center px-0" : "px-2"
                            )}
                          >
                            <div className={cn(
                              "flex items-center justify-center rounded-md relative",
                              isCollapsed ? "h-9 w-9" : "h-8 w-8",
                              active ? "bg-blue-100 dark:bg-blue-800/30" : "bg-gray-100 dark:bg-gray-800",
                              !active && "hover:bg-gray-200 dark:hover:bg-gray-700"
                            )}>
                              <item.icon className={cn(
                                "h-3.5 w-3.5 transition-colors",
                                active ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                              )} />
                              
                              {/* Announcements indicator */}
                              {isAnnouncement && !active && (
                                <div className="absolute -top-1 -right-1">
                                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse ring-2 ring-white dark:ring-gray-950" />
                                </div>
                              )}
                            </div>
                            
                            {!isCollapsed && (
                              <div className="flex items-center justify-between flex-1 min-w-0">
                                <span className={cn(
                                  "text-sm font-medium truncate",
                                  active ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                                )}>
                                  {item.title}
                                </span>
                                
                                {active ? (
                                  <ChevronRight className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300 flex-shrink-0" />
                                ) : isAnnouncement ? (
                                  <Badge 
                                    variant="outline" 
                                    className="h-5 px-1.5 text-[10px] font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
                                  >
                                    New
                                  </Badge>
                                ) : null}
                              </div>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        <div className="flex items-center gap-2">
                          {item.title}
                          {isAnnouncement && !active && (
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* Barangay Information - Professional layout */}
          {!isCollapsed && (
            <div className="mt-8 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-3">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                <span className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  Barangay Office
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-400">Contact</span>
                  <span className="text-xs text-gray-900 dark:text-gray-300 font-mono">(082) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                    Barangay Hall, Poblacion, Kibawe, Bukidnon
                  </span>
                </div>
              </div>
            </div>
          )}
        </SidebarContent>

        {/* Footer - Resident Profile */}
        <SidebarFooter className="border-t border-gray-100 dark:border-gray-800 px-3 py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                {!isCollapsed ? (
                  <NavResident />
                ) : (
                  <div className="flex justify-center">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-md">
                      <User className="h-4 w-4 text-white" />
                    </div>
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