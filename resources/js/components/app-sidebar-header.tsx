import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Bell, HelpCircle, Search, User, Settings, LogOut, Home, SwitchCamera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type ReactNode, useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { route } from 'ziggy-js';
import InstructionsModal from '@/components/InstructionsModal';

// Types for search functionality
interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  url?: string;
}

interface UserType {
  id: number;
  name: string;
  email: string;
  role: string;
  role_id?: number;
  is_admin?: boolean;
  permissions?: string[];
  avatar?: string;
  original_role?: string; // To track original role when switching
  is_household_head?: boolean; // From your backend
  resident_id?: number; // From your backend
}

// Fix: PageProps should extend from Inertia's PageProps
interface PageProps extends Inertia.PageProps {
  auth?: {
    user?: UserType;
  };
  notifications?: Notification[];
  unreadNotifications?: number;
  currentModule?: string;
  // Add index signature for any additional props
  [key: string]: any;
}

interface AppSidebarHeaderProps {
  breadcrumbs?: BreadcrumbItemType[];
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  user?: UserType;
  // New props for functionality
  showInstructionsButton?: boolean;
  instructionsContent?: ReactNode;
  onLogout?: () => void;
  // Props for InstructionsModal
  instructionsModule?: string;
  instructionsTitle?: string;
  customInstructionsContent?: ReactNode;
  showQuickGuide?: boolean;
  userRole?: 'admin' | 'staff' | 'resident' | 'kagawad';
  // New props for role switching
  showRoleSwitcher?: boolean;
  onRoleSwitch?: (role: 'resident') => void;
}

// Default fallback user
const DEFAULT_USER: UserType = {
  id: 0,
  name: 'User',
  email: '',
  role: 'Guest',
  role_id: 0,
  is_household_head: false,
};

export function AppSidebarHeader({
  breadcrumbs = [],
  title,
  description,
  headerActions,
  user: propUser,
  showInstructionsButton = true,
  instructionsContent,
  onLogout,
  // InstructionsModal props
  instructionsModule,
  instructionsTitle,
  customInstructionsContent,
  showQuickGuide = true,
  userRole = 'staff',
  // Role switching props
  showRoleSwitcher = true,
  onRoleSwitch,
}: AppSidebarHeaderProps) {
  const { props } = usePage<PageProps>();
  
  // Safely get auth user with fallbacks
  const authUser = props?.auth?.user;
  const user = authUser || propUser || DEFAULT_USER;
  
  // Safely get notifications
  const notifications = props?.notifications || [];
  const unreadCount = props?.unreadNotifications || notifications.filter(n => !n.read).length;
  const currentModule = props?.currentModule || instructionsModule || 'general';

  // State for search
  const [searchQuery, setSearchQuery] = useState('');

  // State for instructions modal
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // State for notifications
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('=== APP SIDEBAR HEADER ===');
    console.log('User role:', user?.role);
    console.log('User role_id:', user?.role_id);
    console.log('Is Barangay Kagawad:', isBarangayKagawad());
  }, [user]);

  const handleNotificationClick = (notification: Notification) => {
    if (route().has('notifications.markAsRead')) {
      router.post(route('notifications.markAsRead', notification.id), {}, {
        preserveScroll: true,
      });
    }

    if (notification.url) {
      router.visit(notification.url);
    }
    setIsNotificationsOpen(false);
  };

  const markAllAsRead = () => {
    if (route().has('notifications.markAllAsRead')) {
      router.post(route('notifications.markAllAsRead'), {}, {
        preserveScroll: true,
      });
    }
    setIsNotificationsOpen(false);
  };

  const getUserInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'U';
    const initials = name
      .trim()
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
    return initials.slice(0, 2) || 'U';
  };

  const getUserAvatar = () => {
    if (!user?.avatar) return undefined;
    if (user.avatar.startsWith('http')) return user.avatar;
    if (user.avatar.startsWith('/')) return user.avatar;
    return `/storage/${user.avatar}`;
  };

  const getUserRole = () => {
    // If user has original_role (meaning they switched roles), show that in parentheses
    if (user?.original_role) {
      return `${user.role} (${user.original_role})`;
    }
    return user?.role || 'User';
  };

  const getUserName = () => user?.name || 'User';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      router.post(route('logout'));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.visit(route('search', { query: searchQuery }));
      setSearchQuery('');
    }
  };

  // Check if user is BARANGAY KAGAWAD (role_id: 5)
  const isBarangayKagawad = () => {
    const roleId = user?.role_id;
    const roleName = user?.role?.toLowerCase() || '';
    
    // ONLY Barangay Kagawad can switch (role_id: 5)
    const isKagawadById = roleId === 5;
    
    // Also check by role name for safety
    const isKagawadByName = roleName.includes('kagawad') || 
                           roleName.includes('councillor') ||
                           roleName.includes('barangay kagawad');
    
    return isKagawadById || isKagawadByName;
  };

  // Function to switch directly to residentdashboard
  const switchToResidentPanel = () => {
    console.log('Redirecting to /residentdashboard');
    
    // Option 1: If you have role switching backend
    if (route().has('switch-to-resident')) {
      router.post(route('switch-to-resident'), {}, {
        preserveScroll: true,
        onSuccess: () => {
          router.visit(route('residentdashboard'));
        }
      });
    } 
    // Option 2: Direct redirect (simplest)
    else {
      router.visit(route('residentdashboard'));
    }
  };

  // Function to return to original role
  const returnToOriginalRole = () => {
    if (route().has('switch-back')) {
      router.post(route('switch-back'), {}, {
        preserveScroll: true,
      });
    } else {
      // Fallback: Redirect to home
      router.visit(route('dashboard'));
    }
  };

  // Check if user can switch roles
  // ONLY Barangay Kagawad can switch
  const canSwitchRoles = isBarangayKagawad() && 
                        !user?.original_role && 
                        showRoleSwitcher;

  // Check if user is currently in a switched role
  const isSwitchedRole = !!user?.original_role;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-4 md:px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background">
        {/* Left side: Sidebar trigger, breadcrumbs, and title */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          {/* Sidebar trigger - visible on both mobile and desktop */}
          <SidebarTrigger className="-ml-1" />
          
          <div className="flex flex-col min-w-0 flex-1">
            {breadcrumbs.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
              </div>
            )}
            
            {(title || description) && (
              <div className="min-w-0">
                {title && (
                  <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Search, Help, Notifications, User menu */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Role switcher button - ONLY for Barangay Kagawad */}
          {canSwitchRoles && (
            <Button
              variant="ghost"
              size="sm"
              onClick={switchToResidentPanel}
              className="hidden md:flex items-center gap-2 px-3 py-2 h-9 text-sm"
              aria-label="View Resident Dashboard"
              title="Go to resident dashboard"
            >
              <SwitchCamera className="h-3.5 w-3.5" />
              <span>Resident Dashboard</span>
            </Button>
          )}

          {/* Return to original role button - show if user has switched roles */}
          {isSwitchedRole && (
            <Button
              variant="outline"
              size="sm"
              onClick={returnToOriginalRole}
              className="hidden md:flex items-center gap-2 px-3 py-2 h-9 text-sm"
              title="Switch back to your original role"
            >
              <SwitchCamera className="h-3.5 w-3.5" />
              <span>Back to {user.original_role}</span>
            </Button>
          )}

          {/* Simple Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-40 lg:w-48 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>

          {/* Mobile search button */}
          <button 
            className="md:hidden p-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => router.visit(route('search'))}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Help/Instructions button */}
          {showInstructionsButton && (
            <button 
              className="p-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors relative group"
              aria-label="Help and Instructions"
              onClick={() => setIsInstructionsOpen(true)}
            >
              <HelpCircle className="h-5 w-5" />
              <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1.5 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                Help & Instructions
              </span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button 
              className="p-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors relative group"
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-background font-medium shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <SheetContent side="right" className="w-full sm:max-w-md p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-xl font-semibold">Notifications</SheetTitle>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                </SheetHeader>
                <div className="mt-4 space-y-2 max-h-[calc(100dvh-200px)] overflow-y-auto px-6 pb-6">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6 mx-auto">
                        <Bell className="h-8 w-8 text-muted-foreground/60" />
                      </div>
                      <p className="text-base font-semibold text-foreground mb-2">All caught up!</p>
                      <p className="text-sm text-muted-foreground">
                        No new notifications at the moment
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex gap-4 ${
                          notification.read 
                            ? 'bg-transparent hover:bg-accent/50' 
                            : 'bg-primary/5 border-l-4 border-primary hover:bg-primary/10'
                        }`}
                      >
                        <div className={`h-3 w-3 rounded-full mt-1.5 flex-shrink-0 ${
                          notification.type === 'info' ? 'bg-blue-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'success' ? 'bg-green-500' :
                          'bg-red-500'
                        }`} />
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <p className="font-medium truncate text-base">{notification.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* User avatar with dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 md:gap-3 pl-0 md:pl-2 border-0 md:border-l md:border-border hover:bg-accent/50 rounded-lg p-1.5 md:px-2.5 md:py-1.5 transition-colors h-auto group"
              >
                <Avatar className="h-8 w-8 md:h-8 md:w-8 ring-2 ring-background ring-offset-1 group-hover:ring-accent transition-all">
                  <AvatarImage src={getUserAvatar()} alt={getUserName()} />
                  <AvatarFallback className="text-sm bg-primary/10 text-primary font-medium">
                    {getUserInitials(getUserName())}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                    {getUserName()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {getUserRole()}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-xl border-border/50">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1.5">
                  <p className="text-sm font-semibold leading-none">{getUserName()}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email || getUserRole()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Role switcher in dropdown (for mobile) - ONLY for Barangay Kagawad */}
              {canSwitchRoles && (
                <>
                  <DropdownMenuLabel className="font-semibold text-xs uppercase tracking-wider text-muted-foreground pt-0">
                    Dashboard
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={switchToResidentPanel}
                    className="cursor-pointer py-2.5"
                  >
                    <Home className="mr-2.5 h-4.5 w-4.5 text-green-600" />
                    <div className="flex flex-col">
                      <span className="font-medium">Resident Dashboard</span>
                      <span className="text-xs text-muted-foreground">View resident interface</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Return to original role in dropdown (for mobile) */}
              {isSwitchedRole && (
                <>
                  <DropdownMenuItem 
                    onClick={returnToOriginalRole}
                    className="cursor-pointer py-2.5 bg-blue-50 hover:bg-blue-100"
                  >
                    <SwitchCamera className="mr-2.5 h-4.5 w-4.5 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-700">Back to {user.original_role}</span>
                      <span className="text-xs text-muted-foreground">Return to Kagawad view</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem onClick={() => router.visit(route('profile.edit'))} className="cursor-pointer py-2.5">
                <User className="mr-2.5 h-4.5 w-4.5" />
                <span className="font-medium">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.visit(route('settings'))} className="cursor-pointer py-2.5">
                <Settings className="mr-2.5 h-4.5 w-4.5" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>
              {showInstructionsButton && (
                <DropdownMenuItem onClick={() => setIsInstructionsOpen(true)} className="cursor-pointer py-2.5">
                  <HelpCircle className="mr-2.5 h-4.5 w-4.5" />
                  <span className="font-medium">Help & Instructions</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50">
                <LogOut className="mr-2.5 h-4.5 w-4.5" />
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Custom header actions - desktop only */}
          {headerActions && (
            <div className="hidden md:flex ml-2">
              {headerActions}
            </div>
          )}
        </div>
      </header>

      {/* Instructions Modal */}
      {showInstructionsButton && isInstructionsOpen && (
        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
          module={currentModule}
          title={instructionsTitle}
          customContent={customInstructionsContent || instructionsContent}
          showQuickGuide={showQuickGuide}
          userRole={userRole as any}
        />
      )}
    </>
  );
}