// @/components/layout/resident-mobile-sticky-footer.tsx
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  User,
  Bell,
  Calendar,
  Settings,
  Sparkles,
  Circle,
  Activity,
  Plus,
  CreditCard,
  X,
  ScrollText,
  AlertCircle,
  DollarSign,
  Newspaper,
  QrCode,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface PageProps {
    url: string;
    [key: string]: unknown;
}

interface NavItem {
    icon: keyof typeof iconMap;
    label: string;
    href: string;
    activePaths: string[];
    badge?: number;
    badgeColor?: string;
}

const residentNavItems: NavItem[] = [
    { 
        icon: 'home', 
        label: 'Home', 
        href: '/portal/dashboard',
        activePaths: ['/portal/resident']
    },
    { 
        icon: 'file-text', 
        label: 'Docs', 
        href: '/portal/my-clearances',
        activePaths: ['/portal/clearances', '/resident/clearances/create', '/resident/clearances/view']
    },
    { 
        icon: 'message-square', 
        label: 'Help', 
        href: '/portal/community-reports',
        activePaths: ['/portal/community-reports', '/portal/community-reports/create', '/portal/community-reports/view']
    },
    { 
        icon: 'user', 
        label: 'Profile', 
        href: '/residentsettings/profile',
        activePaths: ['/residentsettings/profile', '/residentsettings/profile/edit', '/residentsettings/settings']
    },
];

const iconMap = {
    home: Home,
    'file-text': FileText,
    'message-square': MessageSquare,
    user: User,
    bell: Bell,
    calendar: Calendar,
    settings: Settings,
    sparkles: Sparkles,
    circle: Circle,
    activity: Activity,
    'credit-card': CreditCard,
    'scroll-text': ScrollText,
    'alert-circle': AlertCircle,
    'dollar-sign': DollarSign,
    'newspaper': Newspaper,
    'qr-code': QrCode,
    'lock': Lock,
    'shield-check': ShieldCheck,
};

// Floating Action Button Component (as a nav item)
const FloatingActionNavItem = ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => {
    return (
        <div className="relative">
            <button
                onClick={onClick}
                className={cn(
                    "flex flex-col items-center justify-center p-2 min-w-[56px] transition-all duration-200 group relative",
                    isOpen 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
                )}
            >
                {/* Active indicator background */}
                {isOpen && (
                    <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg" />
                )}
                
                <div className="relative z-10">
                    <div className="relative">
                        <div className={cn(
                            "h-5 w-5 mb-1 transition-all duration-300 group-hover:scale-110",
                            isOpen ? "rotate-45" : "rotate-0"
                        )}>
                            {isOpen ? (
                                <X className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                                <Plus className="h-5 w-5" />
                            )}
                        </div>
                    </div>
                    
                    {/* Active indicator dot */}
                    {isOpen && (
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                </div>
                
                <span className={cn(
                    "text-[10px] font-medium transition-colors duration-200 relative z-10",
                    isOpen 
                        ? "text-blue-600 dark:text-blue-400 font-semibold" 
                        : "text-gray-500 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-300"
                )}>
                    More
                </span>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
            </button>
        </div>
    );
};

// Quick Action Menu Component - attached to footer
const QuickActionMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const quickActions = [
        { 
            icon: ScrollText, 
            label: 'New Clearance', 
            href: '/portal/my-clearances/request', 
            color: 'from-blue-500 to-indigo-500' 
        },
        { 
            icon: AlertCircle, 
            label: 'File Report', 
            href: '/portal/community-reports/create', 
            color: 'from-amber-500 to-orange-500' 
        },
        { 
            icon: DollarSign, 
            label: 'Pay Fees', 
            href: '/portal/fees/pay', 
            color: 'from-emerald-500 to-teal-500' 
        },
        { 
            icon: Newspaper, 
            label: 'Announcements', 
            href: '/portal/announcements', 
            color: 'from-purple-500 to-pink-500' 
        },
        { 
            icon: QrCode, 
            label: 'QR Code', 
            href: '/residentsettings/profile?tab=qr', 
            color: 'from-indigo-500 to-purple-500' 
        },
        { 
            icon: Lock, 
            label: '2FA Setup', 
            href: '/residentsettings/security/two-factor', 
            color: 'from-red-500 to-orange-500' 
        },
        { 
            icon: ShieldCheck, 
            label: 'Security', 
            href: '/residentsettings/security/password', 
            color: 'from-cyan-500 to-blue-500' 
        },
        { 
            icon: Bell, 
            label: 'Notifications', 
            href: '/residentsettings/preferences/notifications', 
            color: 'from-rose-500 to-pink-500' 
        },
    ];

    if (!isOpen) return null;

    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 animate-in slide-in-from-bottom-2 duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mx-4">
                <div className="p-2">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Quick Actions
                        </span>
                        <Sparkles className="h-4 w-4 text-blue-500" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 p-2">
                        {quickActions.map((action) => (
                            <div key={action.label}>
                                <Link
                                    href={action.href}
                                    onClick={onClose}
                                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                >
                                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <action.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {action.label}
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Individual Nav Item Component
const NavItem = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
    const IconComponent = iconMap[item.icon];

    return (
        <div className="relative">
            <Link
                href={item.href}
                className={cn(
                    "flex flex-col items-center justify-center p-2 min-w-[56px] transition-all duration-200 group relative",
                    isActive 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
                )}
                preserveScroll
            >
                {/* Active indicator background */}
                {isActive && (
                    <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg" />
                )}
                
                <div className="relative z-10">
                    <div className="relative">
                        <IconComponent className={cn(
                            "h-5 w-5 mb-1 transition-all duration-200 group-hover:scale-110",
                            isActive && "text-blue-600 dark:text-blue-400"
                        )} />
                        
                        {/* Badge indicator */}
                        {item.badge && (
                            <span
                                className={cn(
                                    "absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full text-[8px] font-bold flex items-center justify-center",
                                    item.badgeColor || "bg-red-500 text-white"
                                )}
                            >
                                {item.badge > 9 ? '9+' : item.badge}
                            </span>
                        )}
                    </div>
                    
                    {/* Active indicator dot */}
                    {isActive && (
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                </div>
                
                <span className={cn(
                    "text-[10px] font-medium transition-colors duration-200 relative z-10",
                    isActive 
                        ? "text-blue-600 dark:text-blue-400 font-semibold" 
                        : "text-gray-500 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-300"
                )}>
                    {item.label}
                </span>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
            </Link>
        </div>
    );
};

// Main Component
export default function ResidentMobileFooter() {
    const { url } = usePage<PageProps>();
    const [mounted, setMounted] = useState(false);
    const [showQuickMenu, setShowQuickMenu] = useState(false);
    
    useEffect(() => {
        setMounted(true);
        
        // Add padding to body on mobile to prevent content from being hidden behind footer
        const updateBodyPadding = () => {
            if (window.innerWidth < 768) {
                document.body.style.paddingBottom = '80px';
            } else {
                document.body.style.paddingBottom = '0';
            }
        };
        
        updateBodyPadding();
        window.addEventListener('resize', updateBodyPadding);
        
        // Close quick menu when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showQuickMenu && !target.closest('.quick-menu-container')) {
                setShowQuickMenu(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            window.removeEventListener('resize', updateBodyPadding);
            document.removeEventListener('click', handleClickOutside);
            document.body.style.paddingBottom = '0';
        };
    }, [showQuickMenu]);

    const isActive = (item: NavItem) => {
        return item.activePaths.some(path => 
            url === path || url.startsWith(path + '/')
        );
    };

    // Don't render on server to avoid hydration mismatch
    if (!mounted) return null;

    return (
        <>
            {/* Footer - always visible at the bottom, sticky */}
            <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                {/* Main Footer Container */}
                <div className="relative quick-menu-container">
                    {/* Background with glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/90 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900/90 backdrop-blur-xl" />
                    
                    {/* Gradient border top */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                    
                    {/* Shadow for depth */}
                    <div className="absolute inset-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.2)] pointer-events-none" />

                    {/* Quick Action Menu - positioned relative to footer */}
                    <QuickActionMenu 
                        isOpen={showQuickMenu} 
                        onClose={() => setShowQuickMenu(false)} 
                    />

                    {/* Navigation Items - 5 items total (4 regular + 1 FAB) */}
                    <nav className="flex items-center justify-between h-16 relative px-4">
                        {/* Home */}
                        <NavItem
                            item={residentNavItems[0]}
                            isActive={isActive(residentNavItems[0])}
                        />
                        
                        {/* Docs */}
                        <NavItem
                            item={residentNavItems[1]}
                            isActive={isActive(residentNavItems[1])}
                        />
                        
                        {/* FAB in the middle */}
                        <FloatingActionNavItem 
                            onClick={() => setShowQuickMenu(!showQuickMenu)} 
                            isOpen={showQuickMenu}
                        />
                        
                        {/* Help */}
                        <NavItem
                            item={residentNavItems[2]}
                            isActive={isActive(residentNavItems[2])}
                        />
                        
                        {/* Profile */}
                        <NavItem
                            item={residentNavItems[3]}
                            isActive={isActive(residentNavItems[3])}
                        />
                    </nav>

                    {/* Safe area spacer for iOS */}
                    <div className="h-safe-bottom bg-gradient-to-t from-white to-white/50 dark:from-gray-900 dark:to-gray-900/50" />
                </div>
            </footer>

            {/* Hidden on desktop - inject CSS for safe area */}
            <style>{`
                .h-safe-bottom {
                    height: env(safe-area-inset-bottom, 0);
                }
                
                @keyframes slideInFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-in {
                    animation: slideInFromBottom 0.2s ease-out;
                }
            `}</style>
        </>
    );
}