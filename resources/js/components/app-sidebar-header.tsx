import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Bell, HelpCircle, Search, User, Settings, LogOut, Home } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type ReactNode, useState } from 'react';
import { usePage, router, PageProps as InertiaPageProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { route } from 'ziggy-js';
import InstructionsModal from '@/components/InstructionsModal/InstructionsModal';
import { QuickSearch } from '@/components/QuickSearch';

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
  is_household_head?: boolean;
  resident_id?: number;
}

// Fix: PageProps should extend from Inertia's PageProps
interface PageProps extends InertiaPageProps {
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
  // Props for functionality
  showInstructionsButton?: boolean;
  instructionsContent?: ReactNode;
  onLogout?: () => void;
  // Props for InstructionsModal
  instructionsModule?: string;
  instructionsTitle?: string;
  customInstructionsContent?: ReactNode;
  showQuickGuide?: boolean;
  userRole?: 'admin' | 'staff' | 'resident' | 'kagawad';
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
}: AppSidebarHeaderProps) {
  const { props } = usePage<PageProps>();
  
  // Safely get auth user with fallbacks
  const authUser = props?.auth?.user;
  const user = authUser || propUser || DEFAULT_USER;
  
  // Safely get notifications
  const notifications = props?.notifications || [];
  const unreadCount = props?.unreadNotifications || notifications.filter(n => !n.read).length;
  const currentModule = props?.currentModule || instructionsModule || 'general';

  // State for instructions modal
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // State for notifications
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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

  // Handle mobile search click
  const handleMobileSearchClick = () => {
    router.visit(route('search'));
  };

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
          {/* Desktop Search - QuickSearch component */}
          <div className="hidden md:block">
            <QuickSearch />
          </div>

          {/* Mobile search button - navigates to search page */}
          <button 
            className="md:hidden p-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={handleMobileSearchClick}
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
              
              <DropdownMenuItem onClick={() => router.visit(route('dashboard'))} className="cursor-pointer py-2.5">
                <Home className="mr-2.5 h-4.5 w-4.5" />
                <span className="font-medium">Dashboard</span>
              </DropdownMenuItem>
              
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