import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types/breadcrumbs';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useState, useEffect, useRef } from 'react';
import { 
  User, 
  Lock, 
  Shield, 
  Palette,
  Settings as SettingsIcon,
  Bell,
  Smartphone,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  History,
  Search,
  X,
  Command,
  ActivityIcon
} from 'lucide-react';

// Extended type that includes description
type ExtendedNavItem = NavItem & {
  description?: string;
  badge?: string;
  disabled?: boolean;
  exact?: boolean;
  children?: Array<{
    title: string;
    href: string;
    icon?: React.ComponentType<any>;
  }>;
};

// Navigation items - Updated Help link to point to /portal/instructions
const settingsNavItems: ExtendedNavItem[] = [
  {
    title: 'Profile',
    href: '/residentsettings/profile',
    icon: User,
    description: 'Personal information & contact details',
    exact: true,
  },
  {
    title: 'Security',
    href: '/residentsettings/security',
    icon: ShieldCheck,
    description: 'Password & account security',
    exact: false,
    children: [
      {
        title: 'Password',
        href: '/residentsettings/security/password',
        icon: Lock,
      },
      {
        title: 'Two-Factor',
        href: '/residentsettings/security/two-factor',
        icon: Shield,
      },
    ]
  },
  {
    title: 'Preferences',
    href: '/residentsettings/preferences',
    icon: Bell,
    description: 'Notifications & display settings',
    exact: false,
    children: [
      {
        title: 'Appearance',
        href: '/residentsettings/preferences/appearance',
        icon: Palette,
      },
      {
        title: 'Notifications',
        href: '/residentsettings/preferences/notifications',
        icon: Bell,
      },
    ]
  },
  {
    title: 'Connected Devices',
    href: '/residentsettings/devices',
    icon: Smartphone,
    description: 'Manage linked devices & sessions',
    exact: true,
  },
  {
    title: 'Privacy',
    href: '/residentsettings/privacy',
    icon: Shield,
    description: 'Data & privacy settings',
    exact: true,
  },
  {
    title: 'Activities',
    href: '/residentsettings/activities',
    icon: ActivityIcon,
    description: 'View your account activity & audit logs',
    exact: true,
  },
  {
    title: 'Help',
    href: '/portal/instructions',
    icon: HelpCircle,
    description: 'Guides and instructions',
    exact: true,
  },
];

// Search Item Type
type SearchResult = {
  id: string;
  title: string;
  description?: string;
  href: string;  // Fixed: Changed from 'src' to 'href'
  category: string;
  icon?: React.ComponentType<any>;
  keywords?: string[];
};

// Helper functions
const isActivePath = (currentPath: string, itemHref: string, exact: boolean = true) => {
  if (exact) {
    return currentPath === itemHref || currentPath === `${itemHref}/`;
  }
  return currentPath.startsWith(itemHref);
};

const isAnyChildActive = (currentPath: string, children?: Array<{href: string}>) => {
  if (!children) return false;
  return children.some(child => isActivePath(currentPath, child.href, true));
};

// Search Modal Component
const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Searchable items from navigation
  const searchableItems: SearchResult[] = [
    { id: '1', title: 'Edit Profile', description: 'Update your personal information', href: '/residentsettings/profile', category: 'Profile', icon: User, keywords: ['name', 'email', 'phone', 'avatar'] },
    { id: '2', title: 'Change Password', description: 'Update your password', href: '/residentsettings/security/password', category: 'Security', icon: Lock, keywords: ['password', 'change', 'update', 'security'] },
    { id: '3', title: 'Two-Factor Authentication', description: 'Enable 2FA for extra security', href: '/residentsettings/security/two-factor', category: 'Security', icon: Shield, keywords: ['2fa', 'two factor', 'authentication', 'security'] },
    { id: '4', title: 'Appearance Settings', description: 'Customize theme and display', href: '/residentsettings/preferences/appearance', category: 'Preferences', icon: Palette, keywords: ['theme', 'dark', 'light', 'display', 'appearance'] },
    { id: '5', title: 'Notification Preferences', description: 'Manage your notifications', href: '/residentsettings/preferences/notifications', category: 'Preferences', icon: Bell, keywords: ['notifications', 'alerts', 'email'] },
    { id: '6', title: 'Connected Devices', description: 'View and manage devices', href: '/residentsettings/devices', category: 'Devices', icon: Smartphone, keywords: ['devices', 'sessions', 'active'] },
    { id: '7', title: 'Privacy Settings', description: 'Control your data privacy', href: '/residentsettings/privacy', category: 'Privacy', icon: Shield, keywords: ['privacy', 'data', 'share'] },
    { id: '8', title: 'Activity Log', description: 'View your account activity', href: '/residentsettings/activities', category: 'Activities', icon: ActivityIcon, keywords: ['activity', 'log', 'history', 'audit'] },
    { id: '9', title: 'Help & Instructions', description: 'Guides and tutorials', href: '/portal/instructions', category: 'Help', icon: HelpCircle, keywords: ['help', 'guide', 'instructions', 'support', 'tutorial'] },
  ];

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = searchableItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    );
    setResults(filtered);
    setSelectedIndex(-1);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      handleSelectResult(results[selectedIndex]);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const updated = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    window.location.href = result.href;
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100%-2rem)] max-w-2xl"
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-6 text-base bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')} className="text-gray-500 dark:text-gray-400">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {searchQuery ? (
              results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result, index) => {
                    const Icon = result.icon || Search;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelectResult(result)}
                        className={cn(
                          'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                          index === selectedIndex 
                            ? 'bg-blue-50 dark:bg-blue-950/30' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        )}
                      >
                        <div className={cn(
                          'p-2 rounded-md',
                          index === selectedIndex 
                            ? 'bg-blue-100 dark:bg-blue-900/30' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        )}>
                          <Icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{result.title}</div>
                          {result.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{result.description}</p>
                          )}
                          <Badge variant="outline" className="mt-1 text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            {result.category}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Search className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Try different keywords</p>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">RECENT SEARCHES</span>
                      <Button variant="ghost" size="sm" onClick={clearRecentSearches} className="text-gray-500 dark:text-gray-400">
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(search)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                        >
                          <History className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{search}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">SUGGESTIONS</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button 
                      onClick={() => window.location.href = '/residentsettings/profile'}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button 
                      onClick={() => window.location.href = '/residentsettings/security/password'}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Password</span>
                    </button>
                    <button 
                      onClick={() => window.location.href = '/residentsettings/preferences/notifications'}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                    </button>
                    <button 
                      onClick={() => window.location.href = '/portal/instructions'}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>Help</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </div>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dropdown Menu Component
const DropdownMenu = ({ 
  item, 
  currentPath,
  isActive,
  isChildActive
}: { 
  item: ExtendedNavItem;
  currentPath: string;
  isActive: boolean;
  isChildActive: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const Icon = item.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
          (isActive || isChildActive || isOpen)
            ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{item.title}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {item.badge}
          </Badge>
        )}
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && item.children && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-2 z-50 animate-in fade-in-0 zoom-in-95">
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-900 dark:text-white">{item.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
          </div>
          <div className="p-2">
            {item.children.map((child: { title: string; href: string; icon?: React.ComponentType<any> }) => {
              const childActive = isActivePath(currentPath, child.href, true);
              const ChildIcon = child.icon;
              
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                    childActive
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  {ChildIcon && <ChildIcon className="h-4 w-4" />}
                  <div className="flex-1">
                    <div className="font-medium">{child.title}</div>
                  </div>
                  {childActive && (
                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile Dropdown Navigation
const MobileDropdownNav = ({ 
  currentPath,
  isOpen,
  onClose 
}: { 
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const expanded: string[] = [];
    settingsNavItems.forEach(item => {
      if (item.children) {
        if (isActivePath(currentPath, item.href, item.exact) || 
            isAnyChildActive(currentPath, item.children)) {
          expanded.push(item.href);
        }
      }
    });
    return expanded;
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(h => h !== href)
        : [...prev, href]
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="lg:hidden absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-[calc(100vh-200px)] overflow-y-auto mx-0"
    >
      <div className="p-2">
        {settingsNavItems.map((item) => {
          const isActive = isActivePath(currentPath, item.href, item.exact);
          const isChildActive = item.children ? isAnyChildActive(currentPath, item.children) : false;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.href);
          const Icon = item.icon;

          return (
            <div key={item.href} className="space-y-1">
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-colors',
                      (isActive || isChildActive) 
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-5 w-5" />}
                      <span className="text-base">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className={cn(
                      "h-5 w-5 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </button>

                  {isExpanded && item.children && (
                    <div className="ml-4 pl-4 space-y-1 border-l border-gray-200 dark:border-gray-700">
                      {item.children.map((child: { title: string; href: string; icon?: React.ComponentType<any> }) => {
                        const childActive = isActivePath(currentPath, child.href, true);
                        const ChildIcon = child.icon;
                        
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={cn(
                              'flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors',
                              childActive
                                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                            )}
                          >
                            {ChildIcon && <ChildIcon className="h-5 w-5" />}
                            <span className="flex-1 text-base">{child.title}</span>
                            {childActive && (
                              <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="flex-1 text-base">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </Link>
              )}
            </div>
          );
        })}

        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/portal/instructions"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-base hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help & Instructions</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function SettingsLayout({ children }: PropsWithChildren) {
  const { url } = usePage();
  const currentPath = url;
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Get current section for breadcrumb
  const currentSection = settingsNavItems.find(item => 
    isActivePath(currentPath, item.href, item.exact) || 
    (item.children && isAnyChildActive(currentPath, item.children))
  );

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      } else if (e.key === '/' && !showSearchModal) {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearchModal]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Search Modal */}
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />

      {/* Mobile Layout - No padding, full width */}
      <div className="lg:px-8">
        {/* Mobile Header - Full width with padding inside */}
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                  <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Manage your account preferences
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Search Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                  onClick={() => setShowSearchModal(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* Mobile Menu Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 relative"
                  onClick={() => setShowMobileNav(!showMobileNav)}
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    showMobileNav && "rotate-180"
                  )} />
                </Button>
              </div>
            </div>

            {/* Mobile Dropdown Navigation */}
            <div className="relative">
              <MobileDropdownNav 
                currentPath={currentPath}
                isOpen={showMobileNav}
                onClose={() => setShowMobileNav(false)}
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your account preferences
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setShowSearchModal(true)}
              >
                <Search className="h-4 w-4" />
                <span>Search settings...</span>
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-600 dark:text-gray-400 ml-2">
                  <Command className="h-3 w-3" />K
                </kbd>
              </Button>
            </div>
          </div>

          <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

          {/* Desktop Navigation - Horizontal Tabs */}
          <nav className="flex items-center gap-1 flex-wrap">
            {settingsNavItems.map((item) => {
              const isActive = isActivePath(currentPath, item.href, item.exact);
              const isChildActive = item.children ? isAnyChildActive(currentPath, item.children) : false;
              const hasChildren = item.children && item.children.length > 0;
              const Icon = item.icon;

              if (hasChildren) {
                return (
                  <DropdownMenu
                    key={item.href}
                    item={item}
                    currentPath={currentPath}
                    isActive={isActive}
                    isChildActive={isChildActive}
                  />
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </Link>
              );
            })}

            <Link
              href="/portal/instructions"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 whitespace-nowrap ml-auto"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Link>
          </nav>
        </div>

        {/* Main Content - Full width on mobile */}
        <div className="lg:px-4 lg:py-4">
          {/* Mobile Breadcrumb */}
          <div className="lg:hidden px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Settings</span>
              {currentSection && (
                <>
                  <span className="text-gray-500 dark:text-gray-400">/</span>
                  <span className="font-medium text-gray-900 dark:text-white">{currentSection.title}</span>
                </>
              )}
            </div>
          </div>

          {/* Main Content - No margins on mobile, touches edges */}
          <main>
            <div className="lg:rounded-xl lg:border lg:border-gray-200 lg:dark:border-gray-700 lg:bg-white lg:dark:bg-gray-900 lg:shadow-sm overflow-hidden">
              <div className="px-4 py-6 lg:p-6">
                {children}
              </div>
            </div>

            {/* Footer - Full width on mobile */}
            <div className="px-4 py-4 mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 lg:border-t-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" />
                <span>Changes are saved automatically</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs hidden sm:inline">Secure connection</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setShowSearchModal(true)}
                >
                  <Search className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Quick search (⌘K)</span>
                  <span className="sm:hidden">Search</span>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}