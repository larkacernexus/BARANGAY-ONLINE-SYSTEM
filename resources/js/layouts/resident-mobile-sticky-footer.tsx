// @/components/layout/resident-mobile-sticky-footer.tsx
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { 
  Home, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  User,
  Bell,
  Calendar
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface PageProps {
    url: string;
}

const residentNavItems = [
    { 
        icon: 'home', 
        label: 'Home', 
        href: '/resident/dashboard',
        activePaths: ['/resident/dashboard', '/resident']
    },
    { 
        icon: 'credit-card', 
        label: 'Pay', 
        href: '/resident/payments',
        activePaths: ['/resident/payments', '/resident/payments/create', '/resident/payments/view']
    },
    { 
        icon: 'file-text', 
        label: 'Docs', 
        href: '/resident/clearances',
        activePaths: ['/resident/clearances', '/resident/clearances/create', '/resident/clearances/view']
    },
    { 
        icon: 'message-square', 
        label: 'Help', 
        href: '/resident/complaints',
        activePaths: ['/resident/complaints', '/resident/complaints/create', '/resident/complaints/view']
    },
    { 
        icon: 'user', 
        label: 'Me', 
        href: '/resident/profile',
        activePaths: ['/resident/profile', '/resident/profile/edit', '/resident/settings']
    },
];

const iconMap = {
    home: Home,
    'credit-card': CreditCard,
    'file-text': FileText,
    'message-square': MessageSquare,
    user: User,
    bell: Bell,
    calendar: Calendar,
};

export default function ResidentMobileFooter() {
    const { url } = usePage<PageProps>();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
    const [showBounce, setShowBounce] = useState(false);
    const footerRef = useRef<HTMLElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const isActive = (item: typeof residentNavItems[0]) => {
        return item.activePaths.some(path => 
            url === path || url.startsWith(path + '/')
        );
    };

    const hideFooter = useCallback(() => {
        setIsVisible(false);
        setScrollDirection('down');
    }, []);

    const showFooter = useCallback(() => {
        setIsVisible(true);
        setScrollDirection('up');
        setShowBounce(true);
        
        // Remove bounce effect after animation completes
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setShowBounce(false);
        }, 300);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollThreshold = 100; // Increased threshold for smoother behavior
            const scrollDelta = Math.abs(currentScrollY - lastScrollY);
            
            // Only trigger if significant scroll happened
            if (scrollDelta < 5) return;
            
            if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
                // Scrolling DOWN - hide with slight delay for smoother feel
                setTimeout(() => hideFooter(), 100);
            } else if (currentScrollY < lastScrollY) {
                // Scrolling UP - show immediately
                showFooter();
            }
            
            // Always show footer when at the top of the page
            if (currentScrollY < 30) {
                showFooter();
            }
            
            setLastScrollY(currentScrollY);
        };

        // Debounced scroll handler for smoother performance
        let timeoutId: NodeJS.Timeout;
        const debouncedHandleScroll = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(handleScroll, 50);
        };

        window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [lastScrollY, hideFooter, showFooter]);

    // Handle initial visibility based on scroll position
    useEffect(() => {
        if (window.scrollY > 100) {
            hideFooter();
        }
    }, [hideFooter]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <footer 
            ref={footerRef}
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 border-t bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl supports-[backdrop-filter]:bg-white/95 supports-[backdrop-filter]:dark:bg-gray-900/95 shadow-2xl md:hidden transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                isVisible 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-full opacity-0",
                showBounce && isVisible && "animate-bounce-subtle"
            )}
            style={{
                WebkitTransition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.1), 0 -1px 0 rgba(255, 255, 255, 0.1) inset',
            }}
        >
            {/* Glow effect at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            
            <nav className="flex items-center justify-around h-16 relative">
                {residentNavItems.map((item) => {
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                    const active = isActive(item);
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 min-w-[56px] transition-all duration-300 group relative",
                                active 
                                    ? "text-blue-600 dark:text-blue-400" 
                                    : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
                            )}
                            preserveScroll
                        >
                            {/* Background glow on active */}
                            {active && (
                                <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 rounded-lg scale-110 transition-transform duration-300" />
                            )}
                            
                            <div className="relative z-10">
                                <IconComponent className={cn(
                                    "h-5 w-5 mb-1 transition-all duration-300 group-hover:scale-110",
                                    active && "text-blue-600 dark:text-blue-400 scale-110",
                                    scrollDirection === 'up' && isVisible && "animate-icon-pop"
                                )} />
                                {active && (
                                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                )}
                            </div>
                            <span className={cn(
                                "text-xs font-medium transition-all duration-300 relative z-10",
                                active 
                                    ? "text-blue-600 dark:text-blue-400 font-semibold" 
                                    : "text-gray-500 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-300"
                            )}>
                                {item.label}
                            </span>
                            
                            {/* Hover effect */}
                            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 bg-blue-500 dark:bg-blue-400 transition-opacity duration-300" />
                        </Link>
                    );
                })}
                
                {/* Scroll indicator dot */}
                <div className={cn(
                    "absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300",
                    scrollDirection === 'up' ? "bg-green-500" : "bg-gray-400",
                    scrollDirection === 'down' && "opacity-0"
                )} />
            </nav>
            
            {/* Safe area spacer for iOS devices */}
            <div className="h-safe-bottom bg-gradient-to-t from-white to-white/50 dark:from-gray-900 dark:to-gray-900/50" />
        </footer>
    );
}

// Add custom CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce-subtle {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes icon-pop {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .animate-bounce-subtle {
    animation: bounce-subtle 0.6s ease-in-out;
  }
  
  .animate-icon-pop {
    animation: icon-pop 0.3s ease-out;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
    document.head.appendChild(style);
}