import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types/breadcrumbs';
import { 
  Bell, 
  HelpCircle, 
  Search, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  ChevronDown,
  Award,
  BadgeCheck,
  Shield,
  Building2,
  BarChart3,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type ReactNode, useState, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { route } from 'ziggy-js';
import InstructionsModal from '@/components/InstructionsModal/InstructionsModal';
import { NotificationCenter, Notification } from '@/components/notifications/admin-notification-center';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';

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
  notification_count?: number;
  notifications?: Notification[];
  department?: string;
  position?: string;
  staff_id?: string;
  last_active?: string;
}

interface NotificationsProp {
  items?: Notification[];
  unreadCount?: number;
}

interface AuthUser {
  user?: UserType & {
    notifications?: Notification[];
    notification_count?: number;
  };
}

interface PageProps {
  auth?: AuthUser;
  notifications?: NotificationsProp;
  unreadNotifications?: number;
  currentModule?: string;
  [key: string]: any;
}

interface AppSidebarHeaderProps {
  breadcrumbs?: BreadcrumbItemType[];
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  user?: UserType;
  showInstructionsButton?: boolean;
  instructionsContent?: ReactNode;
  onLogout?: () => void;
  instructionsModule?: string;
  instructionsTitle?: string;
  customInstructionsContent?: ReactNode;
  showQuickGuide?: boolean;
  userRole?: 'admin' | 'staff' | 'kagawad';
}

const DEFAULT_USER: UserType = {
  id: 0,
  name: 'User',
  email: '',
  role: 'Guest',
  role_id: 0,
  is_household_head: false,
};

const getUserInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return 'A';
  const initials = name
    .trim()
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
  return initials.slice(0, 2) || 'A';
};

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative">
      {isOpen ? (
        <form onSubmit={handleSubmit} className="relative animate-slide-in">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search residents, payments, reports..."
            className="w-48 lg:w-64 pl-10 pr-10 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors relative group"
        >
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}
    </div>
  );
};

const UserMenu = ({ 
  user, 
  onLogout,
  onProfile,
}: { 
  user?: UserType;
  onLogout: () => void;
  onProfile: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const userName = user?.name || 'Admin';
  const userInitials = getUserInitials(userName);
  const userRole = user?.role || 'Staff';
  const userAvatar = user?.avatar;

  const getAvatarUrl = () => {
    if (!userAvatar) return undefined;
    if (userAvatar.startsWith('http')) return userAvatar;
    if (userAvatar.startsWith('/')) return userAvatar;
    return `/storage/${userAvatar}`;
  };

  const getRoleIcon = () => {
    if (user?.is_admin) return <Shield className="h-3.5 w-3.5 text-purple-500" />;
    if (userRole === 'Kagawad') return <Award className="h-3.5 w-3.5 text-amber-500" />;
    return <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />;
  };

  const statusColors = {
    active: 'bg-emerald-500',
    away: 'bg-amber-500',
    offline: 'bg-gray-500'
  };

  const userStatus = user?.last_active ? 'active' : 'active';

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full pl-2 pr-3 py-1.5 transition-all duration-200 h-auto group"
        >
          <div className="relative">
            <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 transition-all group-hover:ring-blue-500">
              <AvatarImage src={getAvatarUrl()} alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 animate-pulse",
              statusColors[userStatus as keyof typeof statusColors]
            )} />
          </div>
          
          <div className="hidden lg:block text-left max-w-[200px]">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {userName}
              </p>
              {user?.is_admin && (
                <Shield className="h-4 w-4 text-purple-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="truncate">{userRole}</span>
              {user?.department && (
                <>
                  <span className="flex-shrink-0">•</span>
                  <span className="truncate">{user.department}</span>
                </>
              )}
            </div>
          </div>
          
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-500 transition-transform duration-200 hidden lg:block flex-shrink-0",
            isOpen && "transform rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-2 max-w-[calc(100vw-2rem)]">
        <div className="px-3 py-4 mb-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-blue-500/20 flex-shrink-0">
              <AvatarImage src={getAvatarUrl()} alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-base">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={userName}>
                {userName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate" title={user?.email}>
                {user?.email}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="gap-1 max-w-[140px]">
                  {getRoleIcon()}
                  <span className="truncate">{userRole}</span>
                </Badge>
                {user?.staff_id && (
                  <Badge variant="outline" className="gap-1 max-w-[140px]">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">ID: {user.staff_id}</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center hover:shadow-md transition-shadow min-w-0">
              <BarChart3 className="h-4 w-4 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-gray-500 truncate">Permissions</p>
              <p className="text-sm font-semibold">{user?.permissions?.length || 0} roles</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center hover:shadow-md transition-shadow min-w-0">
              <BadgeCheck className="h-4 w-4 mx-auto mb-1 text-purple-500" />
              <p className="text-xs text-gray-500 truncate">Status</p>
              <p className="text-sm font-semibold capitalize truncate">Active</p>
            </div>
          </div>

          {user?.department && (
            <div className="mt-3 p-2 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {user.department}
              </p>
              {user?.position && (
                <p className="text-xs text-gray-500">{user.position}</p>
              )}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onProfile} className="rounded-lg py-2 cursor-pointer hover:scale-[1.02] transition-transform">
          <User className="mr-3 h-4 w-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">My Profile</p>
            <p className="text-xs text-gray-500 truncate">View and edit profile</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} className="rounded-lg py-2 cursor-pointer text-red-600 focus:text-red-600 hover:scale-[1.02] transition-transform">
          <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">Log out</p>
            <p className="text-xs text-red-500/70 truncate">Sign out of your account</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// FIXED: ThemeToggle now ONLY toggles between light and dark
const ThemeToggle = () => {
  const { appearance, updateAppearance } = useAppearance();

  const toggleTheme = () => {
    if (appearance === 'light') {
      updateAppearance('dark');
    } else {
      updateAppearance('light');
    }
  };

  const getThemeIcon = () => {
    return appearance === 'light' 
      ? <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />  // Show moon in light mode (to switch to dark)
      : <Sun className="h-5 w-5 text-amber-500" />;                    // Show sun in dark mode (to switch to light)
  };

  const getThemeLabel = () => {
    return appearance === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors relative group"
          >
            <div className="transition-transform duration-300 hover:rotate-12">
              {getThemeIcon()}
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getThemeLabel()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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
  instructionsModule,
  instructionsTitle,
  customInstructionsContent,
  showQuickGuide = true,
  userRole = 'admin',
}: AppSidebarHeaderProps) {
  const { props } = usePage<PageProps>();
  
  const authUser = props.auth?.user;
  const user = authUser || propUser || DEFAULT_USER;
  
  const globalNotifications = props.notifications?.items || 
                               authUser?.notifications || 
                               [];
  const globalUnreadCount = props.notifications?.unreadCount || 
                             props.unreadNotifications || 
                             authUser?.notification_count || 
                             0;

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(globalNotifications);
  const [unreadCount, setUnreadCount] = useState(globalUnreadCount);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setNotifications(globalNotifications);
    setUnreadCount(globalUnreadCount);
  }, [globalNotifications, globalUnreadCount]);

  const currentModule = props.currentModule || instructionsModule || 'general';

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.visit(route('admin.search', { q: query }));
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      router.post(route('logout'));
    }
  };

  const goToProfile = () => {
    router.visit(route('admin.profile.edit'));
    setIsNotificationsOpen(false);
  };

  const goToAllNotifications = () => {
    router.visit(route('admin.notifications.index'));
    setIsNotificationsOpen(false);
  };

  const markAsRead = (notificationId: string) => {
    if (isProcessing) return;
    
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;
    
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    setIsProcessing(true);

    router.patch(
      route('admin.notifications.mark-as-read', notificationId),
      {},
      {
        preserveState: true,
        preserveScroll: true,
        only: ['notifications', 'auth.user.notifications', 'auth.user.notification_count'],
        onSuccess: (page: any) => {
          const newNotifications = page.props.notifications?.items || 
                                  page.props.auth?.user?.notifications || 
                                  [];
          const newUnreadCount = page.props.notifications?.unreadCount || 
                                page.props.unreadNotifications || 
                                page.props.auth?.user?.notification_count || 
                                0;
          
          if (newNotifications.length > 0) {
            setNotifications(newNotifications);
          }
          setUnreadCount(newUnreadCount);
          setIsProcessing(false);
        },
        onError: () => {
          setNotifications(previousNotifications);
          setUnreadCount(previousUnreadCount);
          setIsProcessing(false);
        }
      }
    );
  };

  const markAllAsRead = () => {
    if (isProcessing) return;

    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;
    
    setNotifications(prev =>
      prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);
    
    setIsProcessing(true);

    router.post(
      route('admin.notifications.mark-all-read'),
      {},
      {
        preserveState: true,
        preserveScroll: true,
        only: ['notifications', 'auth.user.notifications', 'auth.user.notification_count'],
        onSuccess: (page: any) => {
          const newNotifications = page.props.notifications?.items || 
                                  page.props.auth?.user?.notifications || 
                                  [];
          if (newNotifications.length > 0) {
            setNotifications(newNotifications);
          }
          setIsProcessing(false);
        },
        onError: () => {
          setNotifications(previousNotifications);
          setUnreadCount(previousUnreadCount);
          setIsProcessing(false);
        }
      }
    );
  };

  const openNotifications = () => {
    setIsNotificationsOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60 animate-slide-down">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <SidebarTrigger className="-ml-1" />
          
          <div className="flex flex-col min-w-0 flex-1">
            {breadcrumbs.length > 0 && (
              <div className="hidden md:flex items-center gap-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
              </div>
            )}
            
            {(title || description) && (
              <div className="min-w-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
                {title && (
                  <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {description}
                  </p>
                )}
              </div>
            )}
            
            {/* <div className="hidden md:flex items-center gap-2 mt-1 animate-fade-in" style={{ animationDelay: '300ms' }}>
              {user?.role && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {user?.is_admin ? (
                    <Shield className="h-3 w-3 text-purple-500" />
                  ) : (
                    <BadgeCheck className="h-3 w-3 text-blue-500" />
                  )}
                  <span className="truncate">{user.role}</span>
                </Badge>
              )}
              {user?.department && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{user.department}</span>
                </Badge>
              )}
            </div> */}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <SearchBar onSearch={handleSearch} />
          <ThemeToggle />

          {showInstructionsButton && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors relative group"
                    onClick={() => setIsInstructionsOpen(true)}
                  >
                    <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Help & Instructions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="relative">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors relative group"
                    onClick={openNotifications}
                  >
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-scale-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {user && (
            <UserMenu
              user={user}
              onLogout={handleLogout}
              onProfile={goToProfile}
            />
          )}

          {headerActions && (
            <div className="hidden md:flex ml-2">
              {headerActions}
            </div>
          )}
        </div>
      </header>

      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onViewAll={goToAllNotifications}
        userType={userRole}
      />

      {showInstructionsButton && (
        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
          module={currentModule}
          title={instructionsTitle || `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Guide`}
          customContent={customInstructionsContent || instructionsContent}
          showQuickGuide={showQuickGuide}
          userRole={userRole as any}
        />
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
        .animate-slide-in { animation: slideIn 0.2s ease-out forwards; }
        .animate-fade-in { opacity: 0; animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </>
  );
}