import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { 
  Bell, 
  HelpCircle, 
  Search, 
  User, 
  LogOut, 
  Users, 
  Moon, 
  Sun,
  Settings,
  ChevronDown,
  Award,
  BadgeCheck,
  MapPin,
  Home as HomeIcon,
  ExternalLink,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type ReactNode, useState, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { route } from 'ziggy-js';
import InstructionsModal from '@/components/InstructionsModal/HouseholdInstructions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import axios from 'axios';
import { NotificationCenter } from '@/components/notifications/notification-center';

// Types for resident data from residents table
interface ResidentType {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  is_senior?: boolean;
  is_pwd?: boolean;
  is_solo_parent?: boolean;
  is_indigent?: boolean;
  is_voter?: boolean;
  occupation?: string;
}

// Types for household member
interface HouseholdMemberType {
  id: number;
  resident_id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  full_name: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  civil_status?: string;
  contact_number?: string;
  email?: string;
  occupation?: string;
  education?: string;
  religion?: string;
  is_head: boolean;
  relationship_to_head?: string;
  is_senior?: boolean;
  is_pwd?: boolean;
  is_solo_parent?: boolean;
  is_indigent?: boolean;
  is_voter?: boolean;
  avatar?: string;
  has_special_classification?: boolean;
  discount_eligibilities?: any[];
}

// Types for household data
interface HouseholdType {
  id: number;
  household_number: string;
  contact_number?: string;
  email?: string;
  address?: string;
  full_address?: string;
  purok?: string;
  purok_id?: number;
  member_count: number;
  income_range?: string;
  housing_type?: string;
  ownership_status?: string;
  water_source?: string;
  has_electricity?: boolean;
  has_internet?: boolean;
  has_vehicle?: boolean;
}

// Notification interface
interface Notification {
  id: string;
  type: string;
  data: any;
  read_at: string | null;
  created_at: string;
  created_at_diff: string;
  is_fee_notification: boolean;
  message: string;
  title: string;
  resident_name?: string;
  formatted_amount?: string;
  fee_code?: string;
  fee_type?: string;
  link: string;
}

// Updated ResidentUserType to include notifications
interface ResidentUserType {
  id: number;
  name: string;
  email: string;
  role: string;
  resident?: ResidentType;
  is_household_head?: boolean;
  resident_id?: number;
  unit_number?: string;
  purok?: string;
  household_members_count?: number;
  household_id?: number;
  zone?: string;
  sitio?: string;
  membership_status?: 'active' | 'pending' | 'inactive';
  join_date?: string;
  household_members?: HouseholdMemberType[];
  household?: HouseholdType;
  notifications?: Notification[];
  unread_notifications_count?: number;
}

interface PageProps extends Inertia.PageProps {
  auth?: {
    user?: ResidentUserType;
  };
  currentModule?: string;
}

interface ResidentSidebarHeaderProps {
  breadcrumbs?: BreadcrumbItemType[];
  title?: string;
  description?: string;
  headerActions?: ReactNode;
}

// Helper function to get full name from resident
const getResidentFullName = (resident: ResidentType | undefined): string => {
  if (!resident) return 'Family Head';
  
  let fullName = resident.first_name || '';
  
  if (resident.middle_name) {
    fullName += ` ${resident.middle_name}`;
  }
  
  fullName += ` ${resident.last_name || ''}`;
  
  if (resident.suffix) {
    fullName += ` ${resident.suffix}`;
  }
  
  return fullName.trim() || 'Family Head';
};

// Helper function to get initials from resident
const getResidentInitials = (resident: ResidentType | undefined): string => {
  if (!resident) return 'FH';
  
  const firstInitial = resident.first_name ? resident.first_name[0] : '';
  const lastInitial = resident.last_name ? resident.last_name[0] : '';
  
  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
  
  return 'FH';
};

// Modern Search Component
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
        <form
          onSubmit={handleSubmit}
          className="relative animate-slide-in"
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fees, documents..."
            className="w-48 lg:w-64 pl-10 pr-10 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
          className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
        >
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}
    </div>
  );
};

// Modern User Menu Component
const UserMenu = ({ 
  user, 
  residentData, 
  householdData,
  householdMembers,
  unitNumber, 
  purok, 
  householdMembersCount,
  onLogout,
  onProfile,
  onHousehold
}: { 
  user?: ResidentUserType;
  residentData?: ResidentType;
  householdData?: HouseholdType;
  householdMembers?: HouseholdMemberType[];
  unitNumber: string;
  purok: string;
  householdMembersCount: number;
  onLogout: () => void;
  onProfile: () => void;
  onHousehold: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const userName = getResidentFullName(residentData) || user?.name || 'Family Head';
  const userInitials = getResidentInitials(residentData);
  const userAvatar = residentData?.avatar || user?.avatar;

  const getAvatarUrl = () => {
    if (!userAvatar) return undefined;
    if (userAvatar.startsWith('http')) return userAvatar;
    if (userAvatar.startsWith('/')) return userAvatar;
    return `/storage/${userAvatar}`;
  };

  const membershipStatus = user?.membership_status || 'active';
  const statusColors = {
    active: 'bg-emerald-500',
    pending: 'bg-amber-500',
    inactive: 'bg-gray-500'
  };

  // Get household head name
  const householdHead = householdMembers?.find(m => m.is_head);
  const householdHeadName = householdHead?.full_name || userName;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full pl-2 pr-3 py-1.5 transition-all duration-200 h-auto group"
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
              statusColors[membershipStatus]
            )} />
          </div>
          
          <div className="hidden lg:block text-left max-w-[200px]">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {householdHeadName}
              </p>
              {user?.is_household_head && (
                <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="truncate">Unit {unitNumber}</span>
              <span className="flex-shrink-0">•</span>
              <span className="truncate">Purok {purok}</span>
            </div>
          </div>
          
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-500 transition-transform duration-200 hidden lg:block flex-shrink-0",
            isOpen && "transform rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-2 max-w-[calc(100vw-2rem)]">
        {/* User Info Card */}
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
                  <HomeIcon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Unit {unitNumber}</span>
                </Badge>
                <Badge variant="secondary" className="gap-1 max-w-[140px]">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Purok {purok}</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center hover:shadow-md transition-shadow min-w-0">
              <Users className="h-4 w-4 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-gray-500 truncate">Household</p>
              <p className="text-sm font-semibold">{householdMembersCount} members</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center hover:shadow-md transition-shadow min-w-0">
              <Award className="h-4 w-4 mx-auto mb-1 text-purple-500" />
              <p className="text-xs text-gray-500 truncate">Status</p>
              <p className="text-sm font-semibold capitalize truncate">{membershipStatus}</p>
            </div>
          </div>

          {/* Household Summary */}
          {householdData && (
            <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Household #{householdData.household_number}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {householdData.has_electricity && <span>⚡ Electricity</span>}
                {householdData.has_internet && <span>🌐 Internet</span>}
                {householdData.has_vehicle && <span>🚗 Vehicle</span>}
              </div>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem onClick={onHousehold} className="rounded-lg py-2 cursor-pointer hover:scale-[1.02] transition-transform">
          <Users className="mr-3 h-4 w-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">Household Members</p>
            <p className="text-xs text-gray-500 truncate">View all family members</p>
          </div>
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            {householdMembersCount}
          </Badge>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onProfile} className="rounded-lg py-2 cursor-pointer hover:scale-[1.02] transition-transform">
          <User className="mr-3 h-4 w-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">My Profile</p>
            <p className="text-xs text-gray-500 truncate">View and edit profile</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="rounded-lg py-2 cursor-pointer hover:scale-[1.02] transition-transform">
          <Settings className="mr-3 h-4 w-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">Settings</p>
            <p className="text-xs text-gray-500 truncate">Preferences and privacy</p>
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

// Modern Theme Toggle Component
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
          >
            <div className="transition-transform duration-300 hover:rotate-12">
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle {isDark ? 'light' : 'dark'} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function ResidentSidebarHeader({
  breadcrumbs = [],
  title,
  description,
  headerActions,
}: ResidentSidebarHeaderProps) {
  const { props } = usePage<PageProps>();
  
  // Get user data from auth
  const user = props?.auth?.user;
  const residentData = user?.resident;
  const householdMembers = user?.household_members || [];
  const householdData = user?.household;
  
  // Get notifications from auth.user
  const notifications = (user?.notifications || []) as Notification[];
  const unreadCount = user?.unread_notifications_count || notifications.filter(n => !n.read_at).length;
  
  // Get household members count
  const householdMembersCount = user?.household_members_count || householdMembers.length || 0;
  
  // Get unit and purok
  const unitNumber = user?.unit_number || householdData?.household_number || 'Not Assigned';
  const purok = user?.purok || householdData?.purok || 'Not Assigned';

  const currentModule = props?.currentModule || 'family-head';

  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);

  // Update local state when props change
  useEffect(() => {
    setLocalNotifications(notifications);
    setLocalUnreadCount(unreadCount);
    console.log('Notifications updated:', notifications);
  }, [notifications, unreadCount]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.visit(route('search', { q: query }));
    }
  };

  const handleLogout = () => {
    router.post(route('logout'));
  };

  const goToHouseholdMembers = () => {
    router.get(route('resident.profile.show'), {
      tab: 'members'
    }, {
      preserveScroll: true
    });
    setIsNotificationsOpen(false);
  };

  const goToProfile = () => {
    router.visit(route('resident.profile.show'));
    setIsNotificationsOpen(false);
  };

  // Navigate to all notifications page
  const goToAllNotifications = () => {
    router.visit('/portal/notifications');
    setIsNotificationsOpen(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      
      // Use the correct endpoint with the parameter name 'id' as expected by the controller
const response = await axios.patch(`/portal/notifications/${notificationId}/mark-as-read`);
      
      console.log('Mark as read response:', response.data);
      
      if (response.data.success) {
        // Update local state optimistically
        setLocalNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read_at: response.data.read_at || new Date().toISOString() } : n
          )
        );
        setLocalUnreadCount(prev => Math.max(0, prev - 1));
        
        // Also refresh from server to ensure consistency
        router.reload({ 
          only: ['auth.user.notifications', 'auth.user.unread_notifications_count'],
          preserveState: true,
          preserveScroll: true
        });
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read');
      
      // Use the correct endpoint
      const response = await axios.post('/portal/notifications/mark-all-as-read');
      
      console.log('Mark all as read response:', response.data);
      
      if (response.data.success) {
        // Update local state optimistically
        setLocalNotifications(prev =>
          prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
        setLocalUnreadCount(0);
        
        // Refresh from server
        router.reload({ 
          only: ['auth.user.notifications', 'auth.user.unread_notifications_count'],
          preserveState: true,
          preserveScroll: true
        });
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <>
      <header 
        className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60 animate-slide-down"
      >
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
            
            <div className="hidden md:flex items-center gap-2 mt-1 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Badge variant="secondary" className="gap-1 text-xs">
                <HomeIcon className="h-3 w-3" />
                Unit {unitNumber}
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                Purok {purok}
              </Badge>
              {user?.is_household_head && (
                <Badge variant="default" className="gap-1 text-xs bg-gradient-to-r from-blue-500 to-blue-600">
                  <Award className="h-3 w-3" />
                  Family Head
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Search */}
          <SearchBar onSearch={handleSearch} />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Help Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
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

          {/* Notifications */}
          <div className="relative">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
                    onClick={() => setIsNotificationsOpen(true)}
                  >
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                    {localUnreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-scale-in">
                        {localUnreadCount > 9 ? '9+' : localUnreadCount}
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

          {/* User Menu */}
          <UserMenu
            user={user}
            residentData={residentData}
            householdData={householdData}
            householdMembers={householdMembers}
            unitNumber={unitNumber}
            purok={purok}
            householdMembersCount={householdMembersCount}
            onLogout={handleLogout}
            onProfile={goToProfile}
            onHousehold={goToHouseholdMembers}
          />

          {/* Header Actions */}
          {headerActions && (
            <div className="hidden md:flex ml-2">
              {headerActions}
            </div>
          )}
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter
        notifications={localNotifications}
        unreadCount={localUnreadCount}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onViewAll={goToAllNotifications}
      />

      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        module={currentModule}
        title="Family Head Guide"
        showQuickGuide={true}
        userRole="family-head"
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.2s ease-out forwards;
        }

        .animate-slide-in-right {
          opacity: 0;
          animation: slideInRight 0.3s ease-out forwards;
        }

        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}