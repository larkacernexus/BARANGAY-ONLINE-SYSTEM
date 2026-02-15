import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Bell, HelpCircle, Search, User, LogOut, Home, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type ReactNode, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { route } from 'ziggy-js';
import InstructionsModal from '@/components/InstructionsModal';

// Types for resident data from residents table
interface ResidentType {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  avatar?: string;
}

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
}

interface PageProps extends Inertia.PageProps {
  auth?: {
    user?: ResidentUserType;
  };
  notifications?: Notification[];
  unreadNotifications?: number;
  currentModule?: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  url?: string;
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

export function ResidentSidebarHeader({
  breadcrumbs = [],
  title,
  description,
  headerActions,
}: ResidentSidebarHeaderProps) {
  const { props } = usePage<PageProps>();
  
  // Get user data
  const user = props?.auth?.user;
  const residentData = user?.resident;
  
  // Get household members count
  const householdMembersCount = user?.household_members_count || 0;
  
  // Get unit and purok
  const unitNumber = user?.unit_number || 'Not Assigned';
  const purok = user?.purok || 'Not Assigned';

  const notifications = props?.notifications || [];
  const unreadCount = props?.unreadNotifications || notifications.filter(n => !n.read).length;
  const currentModule = props?.currentModule || 'family-head';

  const [searchQuery, setSearchQuery] = useState('');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.url) {
      router.visit(notification.url);
    }
    setIsNotificationsOpen(false);
  };

  const getUserInitials = () => {
    return getResidentInitials(residentData);
  };

  const getUserAvatar = () => {
    const avatarUrl = residentData?.avatar || user?.avatar;
    
    if (!avatarUrl) return undefined;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    if (avatarUrl.startsWith('/')) return avatarUrl;
    return `/storage/${avatarUrl}`;
  };

  const getUserName = () => {
    const residentName = getResidentFullName(residentData);
    return residentName !== 'Family Head' ? residentName : (user?.name || 'Family Head');
  };

  const handleLogout = () => {
    router.post(route('logout'));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.visit(route('search', { query: searchQuery }));
      setSearchQuery('');
    }
  };

  // Method 1: Using query parameters with GET request
  const goToHouseholdMembers = () => {
    router.get(route('resident.profile.show'), {
      tab: 'members'
    }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Method 2: Using URL hash (alternative approach)
  const goToHouseholdMembersHash = () => {
    router.visit(route('resident.profile.show') + '#members');
  };

  // Navigate to profile with personal tab selected
  const goToProfile = () => {
    router.visit(route('resident.profile.show'));
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-4 md:px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
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
            
            <div className="hidden md:flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Unit: {unitNumber}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Purok: {purok}
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Family Head
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
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

          <button 
            className="p-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Help and Instructions"
            onClick={() => setIsInstructionsOpen(true)}
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          <div className="relative">
            <button 
              className="p-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors relative"
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-background">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <SheetContent side="right" className="w-full sm:max-w-md p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                  <SheetTitle className="text-xl font-semibold">Notifications</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2 max-h-[calc(100dvh-200px)] overflow-y-auto px-6 pb-6">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6 mx-auto">
                        <Bell className="h-8 w-8 text-muted-foreground/60" />
                      </div>
                      <p className="text-base font-semibold text-foreground mb-2">No notifications</p>
                      <p className="text-sm text-muted-foreground">
                        You're all caught up
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                          notification.read 
                            ? 'bg-transparent hover:bg-accent/50' 
                            : 'bg-primary/5 hover:bg-primary/10'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <p className="font-medium text-base">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 hover:bg-accent/50 rounded-lg p-1.5 transition-colors h-auto"
              >
                <Avatar className="h-8 w-8 ring-2 ring-background ring-offset-1">
                  <AvatarImage src={getUserAvatar()} alt={getUserName()} />
                  <AvatarFallback className="text-sm font-medium bg-green-100 text-green-800">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                    {getUserName()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Family Head
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{getUserName()}</p>
                  <p className="text-xs text-muted-foreground">
                    Unit {unitNumber} • Purok {purok}
                  </p>
                  {householdMembersCount > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {householdMembersCount} household member{householdMembersCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => router.visit(route('residentdashboard'))}>
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={goToHouseholdMembers}>
                <Users className="mr-2 h-4 w-4" />
                <span>Household Members</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={goToProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {headerActions && (
            <div className="hidden md:flex ml-2">
              {headerActions}
            </div>
          )}
        </div>
      </header>

      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        module={currentModule}
        title="Family Head Guide"
        showQuickGuide={true}
        userRole="family-head"
      />
    </>
  );
}