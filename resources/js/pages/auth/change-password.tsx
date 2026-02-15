import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Bell, User, Settings, LogOut, ArrowRightLeft, Sun, Moon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type ReactNode, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js';

// Types
interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type?: 'info' | 'warning' | 'success' | 'error';
  url?: string;
}

interface ResidentUser {
  id: number;
  name: string;
  email: string;
  unit?: string;
  avatar?: string;
  role?: string;
  can_access_admin?: boolean;
}

// Inertia PageProps type
interface InertiaPageProps {
  auth?: {
    user?: ResidentUser;
  };
  notifications?: Notification[];
  unreadNotifications?: number;
  [key: string]: any;
}

interface ResidentSidebarHeaderProps {
  breadcrumbs?: BreadcrumbItemType[];
  title?: string;
  description?: string;
  user?: ResidentUser;
  onLogout?: () => void;
  theme?: 'light' | 'dark';
  onThemeChange?: () => void;
}

// Default fallback user
const DEFAULT_RESIDENT: ResidentUser = {
  id: 0,
  name: 'Resident',
  email: '',
  unit: 'N/A',
  role: 'Resident',
  can_access_admin: false,
};

export function ResidentSidebarHeader({
  breadcrumbs = [],
  title,
  description,
  user: propUser,
  onLogout,
  theme = 'light',
  onThemeChange,
}: ResidentSidebarHeaderProps) {
  const { props } = usePage<InertiaPageProps>();
  
  const authUser = props?.auth?.user;
  const user = authUser || propUser || DEFAULT_RESIDENT;
  
  const notifications = props?.notifications || [];
  const unreadCount = props?.unreadNotifications || notifications.filter(n => !n.read).length;

  // State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Check if user is Barangay Kagawad
  const isBarangayKagawad = user?.role === 'Barangay Kagawad';
  const canAccessAdmin = user?.can_access_admin || false;

  // Handlers
  const handleSwitchToAdmin = () => {
    router.visit('/dashboard');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.url) {
      router.visit(notification.url);
    }
    setIsNotificationsOpen(false);
  };

  const getUserInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'R';
    return name
      .trim()
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'R';
  };

  const getUserAvatar = () => {
    if (!user?.avatar) return undefined;
    if (user.avatar.startsWith('http') || user.avatar.startsWith('/')) {
      return user.avatar;
    }
    return `/storage/${user.avatar}`;
  };

  const getUserRoleDisplay = () => {
    if (user?.role === 'Barangay Kagawad') {
      return 'Kagawad';
    }
    return 'Resident';
  };

  const getNotificationTypeColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'error':
        return 'bg-rose-500';
      default:
        return 'bg-blue-500';
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      router.post(route('logout'));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <SidebarTrigger className="transition-transform hover:scale-105" />
          
          <div className="flex flex-col min-w-0 flex-1 gap-1">
            {breadcrumbs.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
              </div>
            )}
            
            <div className="min-w-0">
              {title && (
                <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm text-muted-foreground truncate">
                  {description}
                </p>
              )}
            </div>
            
            {/* Unit and role info */}
            <div className="hidden md:flex items-center gap-2">
              {user?.unit && (
                <Badge variant="secondary" className="text-xs font-normal">
                  Unit: {user.unit}
                </Badge>
              )}
              <Badge variant={isBarangayKagawad ? "default" : "outline"} className="text-xs">
                {getUserRoleDisplay()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle - Only show if onThemeChange is provided */}
          {onThemeChange && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeChange}
              className="rounded-full hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Dashboard Switcher - ONLY for Barangay Kagawad */}
          {isBarangayKagawad && canAccessAdmin && (
            <>
              {/* Desktop button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwitchToAdmin}
                className="hidden md:flex items-center gap-2"
                title="Switch to Admin Panel"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  Admin
                </span>
              </Button>

              {/* Mobile button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwitchToAdmin}
                className="md:hidden rounded-full"
                aria-label="Switch to Admin Panel"
                title="Switch to Admin Panel"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationsOpen(true)}
              className="rounded-full relative hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center border-2 border-background font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
          
          {/* Notifications Sheet */}
          <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <SheetContent side="right" className="w-full sm:max-w-md p-0">
              <SheetHeader className="px-6 pt-6 pb-4 border-b">
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-2 max-h-[calc(100dvh-140px)] overflow-y-auto p-4">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-muted p-4">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-4 rounded-lg transition-all hover:bg-accent ${
                        notification.read 
                          ? 'bg-card' 
                          : 'bg-primary/5 border-l-2 border-primary'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${getNotificationTypeColor(notification.type)}`} />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-foreground truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5 animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 pl-0 pr-2 hover:bg-accent rounded-full h-auto"
              >
                <Avatar className="h-8 w-8 ring-2 ring-background ring-offset-2">
                  <AvatarImage src={getUserAvatar()} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getUserRoleDisplay()}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getUserAvatar()} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {user.unit || 'No unit'}
                      </Badge>
                      <Badge variant={isBarangayKagawad ? "default" : "outline"} className="text-xs">
                        {getUserRoleDisplay()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              {/* Dashboard switch option for Kagawad in dropdown */}
              {isBarangayKagawad && canAccessAdmin && (
                <>
                  <DropdownMenuItem 
                    onClick={handleSwitchToAdmin}
                    className="gap-3 py-3 cursor-pointer hover:bg-primary/5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <ArrowRightLeft className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Switch to Admin Panel</p>
                      <p className="text-xs text-muted-foreground">
                        Access administrative features
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem 
                onClick={() => router.visit(route('profile.edit'))}
                className="gap-3 py-3 cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => router.visit(route('settings'))}
                className="gap-3 py-3 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              {/* Theme toggle in dropdown */}
              {onThemeChange && (
                <DropdownMenuItem 
                  onClick={onThemeChange}
                  className="gap-3 py-3 cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="gap-3 py-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}