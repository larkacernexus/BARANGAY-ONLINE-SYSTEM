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
  Receipt // ADDED for Fees
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NavResident } from './nav-resident';

// Resident-specific navigation - UPDATED to match actual routes
const residentNav = [
  { title: 'Dashboard', href: '/residentdashboard', icon: LayoutGrid },
  { title: 'My Profile', href: '/residentsettings/profile', icon: User },
  { title: 'My Fees', href: '/residentfees', icon: Receipt }, // ADDED My Fees
  { title: 'My Payments', href: '/my-payments', icon: CreditCard },
  { title: 'My Clearances', href: '/my-clearances', icon: FileCheck },
  { title: 'My Complaints', href: '/my-complaints', icon: MessageSquare },
  { title: 'My Records', href: '/my-records', icon: History },
];

const residentQuickActions = [
  { title: 'Pay Fees', href: '/my-payments/pay', icon: CreditCard, color: 'text-green-600 bg-green-100' },
  { title: 'Request Clearance', href: '/my-clearances/request', icon: FileText, color: 'text-blue-600 bg-blue-100' },
  { title: 'File Complaint', href: '/my-complaints/create', icon: MessageSquare, color: 'text-amber-600 bg-amber-100' },
];

// UPDATED to match actual route prefixes
const residentResources = [
  { title: 'Announcements', href: '/resident-announcements', icon: Bell },
  { title: 'Events', href: '/resident-events', icon: Calendar },
  { title: 'Forms', href: '/resident-forms', icon: Download },
  { title: 'Settings', href: '/resident/settings', icon: Settings },
];

export function ResidentSidebar({ className }: { className?: string }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  return (
    <TooltipProvider>
      <Sidebar 
        collapsible="icon" 
        variant="inset" 
        className={cn("border-r", className)}
      >
        {/* Header */}
        <SidebarHeader className="border-b p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild size="lg">
                    <Link 
                      href="/resident/dashboard"
                      className={cn(
                        "flex items-center justify-center transition-all duration-200",
                        isCollapsed ? "px-0" : "px-2"
                      )}
                    >
                      {isCollapsed ? (
                        <div className="flex items-center justify-center">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Home className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 w-full">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Home className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-gray-900 dark:text-white truncate">
                              Resident Portal
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              Brgy. Kibawe
                            </span>
                          </div>
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Resident Dashboard</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Content */}
        <SidebarContent className="space-y-4 p-4">
          {/* Emergency Info - Only show when NOT collapsed */}
          {!isCollapsed && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-900 dark:text-red-200">
                  Emergency
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-red-600" />
                  <span className="text-xs font-bold text-red-900 dark:text-red-100">911</span>
                </div>
                <div className="text-xs text-red-700 dark:text-red-300">
                  Police • Fire • Ambulance
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="flex items-center gap-2 px-1 mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase truncate">
                  Quick Actions
                </span>
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
                            "flex items-center gap-2",
                            isCollapsed ? "justify-center" : ""
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center rounded-lg",
                            isCollapsed ? `h-8 w-8 ${item.color}` : ""
                          )}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          {!isCollapsed && (
                            <div className="flex items-center justify-between flex-1">
                              <span className="truncate">{item.title}</span>
                              <div className={`h-2 w-2 rounded-full ${item.color.split(' ')[1]}`} />
                            </div>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* Main Navigation */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase px-1 mb-2 truncate">
                My Account
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {residentNav.map((item) => (
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
                            "flex items-center justify-center",
                            isCollapsed ? "h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" : ""
                          )}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          {!isCollapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* Resources */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase px-1 mb-2 truncate">
                Resources
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {residentResources.map((item) => (
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
                            "flex items-center justify-center",
                            isCollapsed ? "h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" : ""
                          )}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          {!isCollapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* Barangay Info - Only show when NOT collapsed */}
          {!isCollapsed && (
            <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Barangay Hall
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    (082) 123-4567
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Brgy. Hall, Kibawe
                  </span>
                </div>
              </div>
            </div>
          )}
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                {!isCollapsed ? (
                  <NavResident />
                ) : (
                  <div className="flex justify-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>My Profile & Settings</p>
            </TooltipContent>
          </Tooltip>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}