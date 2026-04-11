// @/components/layout/resident-mobile-sticky-footer.tsx
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  User,
  Plus,
  X,
  ScrollText,
  AlertCircle,
  DollarSign,
  Newspaper,
  QrCode,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

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
        activePaths: ['/portal/resident', '/portal/dashboard']
    },
    { 
        icon: 'file-text', 
        label: 'Docs', 
        href: '/portal/my-clearances',
        activePaths: ['/portal/clearances', '/portal/my-clearances', '/resident/clearances/create', '/resident/clearances/view']
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
    'scroll-text': ScrollText,
    'alert-circle': AlertCircle,
    'dollar-sign': DollarSign,
    'newspaper': Newspaper,
    'qr-code': QrCode,
    'lock': Lock,
    'shield-check': ShieldCheck,
};

// Simple FAB
const FloatingActionNavItem = ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-2 min-w-[56px] transition-colors duration-150",
                isOpen ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:text-blue-500"
            )}
        >
            <div className="h-5 w-5 mb-1">
                {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <span className={cn(
                "text-[10px] font-medium",
                isOpen ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
            )}>
                {isOpen ? 'Close' : 'More'}
            </span>
        </button>
    );
};

// Simple Quick Action Menu
const QuickActionMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const quickActions = [
        { icon: ScrollText, label: 'Clearance', href: '/portal/my-clearances/request', color: 'bg-blue-500' },
        { icon: AlertCircle, label: 'Report', href: '/portal/community-reports/create', color: 'bg-amber-500' },
        { icon: DollarSign, label: 'Pay Fees', href: '/portal/fees/pay', color: 'bg-emerald-500' },
        { icon: Newspaper, label: 'News', href: '/portal/announcements', color: 'bg-purple-500' },
        { icon: QrCode, label: 'QR', href: '/residentsettings/profile?tab=qr', color: 'bg-indigo-500' },
        { icon: Lock, label: '2FA', href: '/residentsettings/security/two-factor', color: 'bg-red-500' },
        { icon: ShieldCheck, label: 'Security', href: '/residentsettings/security/password', color: 'bg-cyan-500' },
    ];

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
            
            <div className="absolute bottom-full left-0 right-0 mb-2 z-50 animate-slide-up">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl mx-4 overflow-hidden">
                    <div className="p-3">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Quick Actions</span>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                <X className="h-3 w-3 text-gray-400" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    onClick={onClose}
                                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className={`p-2 rounded-lg ${action.color}`}>
                                        <action.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center">
                                        {action.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Simple Nav Item
const NavItem = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
    const IconComponent = iconMap[item.icon];

    return (
        <Link
            href={item.href}
            className={cn(
                "flex flex-col items-center justify-center p-2 min-w-[56px] transition-colors duration-150",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:text-blue-500"
            )}
            preserveScroll
        >
            <div className="relative">
                <IconComponent className="h-5 w-5 mb-1" />
                {item.badge && (
                    <span className={cn(
                        "absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full text-[8px] font-bold flex items-center justify-center",
                        item.badgeColor || "bg-red-500 text-white"
                    )}>
                        {item.badge > 9 ? '9+' : item.badge}
                    </span>
                )}
            </div>
            <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
            )}>
                {item.label}
            </span>
            {isActive && (
                <div className="w-5 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-0.5" />
            )}
        </Link>
    );
};

// Simple modal detector
const useModalDetector = () => {
    const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
    const lastStateRef = useRef(false);

    const checkModals = useCallback(() => {
        requestAnimationFrame(() => {
            const hasModalOpen = document.body.style.overflow === 'hidden';
            
            if (hasModalOpen !== lastStateRef.current) {
                lastStateRef.current = hasModalOpen;
                setIsAnyModalOpen(hasModalOpen);
            }
        });
    }, []);

    useEffect(() => {
        checkModals();
        
        let debounceTimer: NodeJS.Timeout;
        const observer = new MutationObserver(() => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(checkModals, 100);
        });
        
        observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
        
        return () => {
            clearTimeout(debounceTimer);
            observer.disconnect();
        };
    }, [checkModals]);

    return isAnyModalOpen;
};

// Main Component
export default function ResidentMobileFooter() {
    const { url } = usePage<PageProps>();
    const [mounted, setMounted] = useState(false);
    const [showQuickMenu, setShowQuickMenu] = useState(false);
    const isAnyModalOpen = useModalDetector();
    const footerRef = useRef<HTMLElement>(null);
    
    useEffect(() => {
        setMounted(true);
        
        const updatePadding = () => {
            if (window.innerWidth < 768 && !isAnyModalOpen) {
                document.body.style.paddingBottom = '80px';
            } else {
                document.body.style.paddingBottom = '0';
            }
        };
        
        updatePadding();
        
        window.addEventListener('resize', updatePadding);
        
        return () => {
            document.body.style.paddingBottom = '0';
            window.removeEventListener('resize', updatePadding);
        };
    }, [mounted, isAnyModalOpen]);

    useEffect(() => {
        if (isAnyModalOpen) {
            setShowQuickMenu(false);
        }
    }, [isAnyModalOpen]);

    const isActive = (item: NavItem) => {
        return item.activePaths.some(path => 
            url === path || url.startsWith(path + '/')
        );
    };

    if (!mounted || isAnyModalOpen) return null;

    return (
        <footer ref={footerRef} className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-slide-up">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
                <QuickActionMenu isOpen={showQuickMenu} onClose={() => setShowQuickMenu(false)} />
                
                <nav className="flex items-center justify-between h-16 px-4">
                    <NavItem item={residentNavItems[0]} isActive={isActive(residentNavItems[0])} />
                    <NavItem item={residentNavItems[1]} isActive={isActive(residentNavItems[1])} />
                    <FloatingActionNavItem onClick={() => setShowQuickMenu(!showQuickMenu)} isOpen={showQuickMenu} />
                    <NavItem item={residentNavItems[2]} isActive={isActive(residentNavItems[2])} />
                    <NavItem item={residentNavItems[3]} isActive={isActive(residentNavItems[3])} />
                </nav>
                
                <div className="h-safe-bottom" />
            </div>

            <style>{`
                .h-safe-bottom {
                    height: env(safe-area-inset-bottom, 0px);
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slide-up {
                    animation: slideUp 0.2s ease-out;
                }
            `}</style>
        </footer>
    );
}