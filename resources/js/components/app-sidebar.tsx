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
import { dashboard } from '@/routes';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';
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
  Flag, 
  Zap,
  PlusCircle,
  Building2
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const mainNav = [
  { title: 'Dashboard', href: dashboard().url, icon: LayoutGrid },
  { title: 'Residents', href: '/residents', icon: Users },
  { title: 'Households', href: '/households', icon: Home },
  { title: 'Payments', href: '/payments', icon: CreditCard },
  { title: 'Clearances', href: '/clearances', icon: FileText },
];

const quickActions = [
  { title: 'Add Resident', href: '/residents/create', icon: Users },
  { title: 'Record Payment', href: '/payments/create', icon: CreditCard },
  { title: 'Issue Clearance', href: '/clearances/create', icon: FileText },
];

const adminNav = [
  { title: 'Settings', href: '/settings', icon: Settings },
  { title: 'Users', href: '/users', icon: UserCog },
];

export function AppSidebar({ className }: { className?: string }) {
  const isAdmin = true;
  const isStaff = true;
  const { state } = useSidebar();
  
  const isCollapsed = state === 'collapsed';
  
  return (
    <TooltipProvider>
      <Sidebar 
        collapsible="icon" 
        variant="inset" 
        className={cn("border-r", className)}
      >
        {/* Header with redesigned logo */}
        <SidebarHeader className="border-b p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild size="lg">
                    <Link 
                      href={dashboard().url}
                      className={cn(
                        "flex items-center justify-center transition-all duration-200",
                        isCollapsed ? "px-0" : "px-2"
                      )}
                    >
                      {isCollapsed ? (
                        // Large centered icon when collapsed
                        <div className="flex flex-col items-center justify-center gap-1 w-full">
                          <div className="relative flex items-center justify-center">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
                              <Building2 className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Full logo when expanded
                        <div className="flex items-center gap-3 w-full">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
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
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Brgy. Kibawe Dashboard</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Content */}
        <SidebarContent className="space-y-4 p-4">
          {/* Quick Stats - Only show when NOT collapsed */}
          {!isCollapsed && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Quick Stats
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Residents</div>
                  <div className="font-bold text-blue-900 dark:text-blue-100">2,847</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Households</div>
                  <div className="font-bold text-blue-900 dark:text-blue-100">678</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {isStaff && (
            <SidebarGroup>
              {!isCollapsed && (
                <SidebarGroupLabel className="flex items-center gap-2 px-1 mb-2">
                  <Zap className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-500 uppercase truncate">
                    Quick Actions
                  </span>
                </SidebarGroupLabel>
              )}
              <SidebarMenu>
                {quickActions.map((item) => (
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
                              isCollapsed ? "h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20" : ""
                            )}>
                              <item.icon className={cn(
                                isCollapsed ? "h-4 w-4" : "h-4 w-4"
                              )} />
                            </div>
                            {!isCollapsed && (
                              <>
                                <span className="truncate">{item.title}</span>
                                {item.title === 'Add Resident' && (
                                  <PlusCircle className="h-3 w-3 ml-auto" />
                                )}
                              </>
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
          )}

          {/* Main Navigation */}
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase px-1 mb-2 truncate">
                Main Menu
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {mainNav.map((item) => (
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

          {/* Admin Section */}
          {isAdmin && (
            <SidebarGroup>
              {!isCollapsed && (
                <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase px-1 mb-2 truncate">
                  Administration
                </SidebarGroupLabel>
              )}
              <SidebarMenu>
                {adminNav.map((item) => (
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
          )}
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                {!isCollapsed ? (
                  <NavUser />
                ) : (
                  <div className="flex justify-center">
                    {/* Centered user avatar when collapsed */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <span className="text-sm font-medium text-white">
                        U
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>User Profile & Settings</p>
            </TooltipContent>
          </Tooltip>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}