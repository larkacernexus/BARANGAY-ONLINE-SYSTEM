// @/components/layout/mobile-sticky-footer.tsx
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Home, Search, Bell, User, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface MobileFooterItem {
    icon: string;
    label: string;
    href: string;
    activePaths: string[];
}

interface MobileStickyFooterProps {
    items: MobileFooterItem[];
}

interface PageProps {
    url: string;
}

const iconMap = {
    home: Home,
    search: Search,
    bell: Bell,
    user: User,
    menu: Menu,
};

export default function MobileStickyFooter({ items }: MobileStickyFooterProps) {
    const { url } = usePage<PageProps>();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const footerRef = useRef<HTMLElement>(null);
    
    const isActive = (item: MobileFooterItem) => {
        return item.activePaths.some(path => 
            url === path || url.startsWith(path + '/')
        );
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollThreshold = 50; // Minimum scroll amount before hiding
            const footerHeight = footerRef.current?.offsetHeight || 70;
            
            if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
                // Scrolling DOWN and past threshold - hide footer
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
                // Scrolling UP - show footer
                setIsVisible(true);
            }
            
            // Always show footer when at the top of the page
            if (currentScrollY < scrollThreshold) {
                setIsVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        // Throttle scroll events for better performance
        let ticking = false;
        const throttledHandleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledHandleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', throttledHandleScroll);
        };
    }, [lastScrollY]);

    // Handle initial visibility based on scroll position
    useEffect(() => {
        if (window.scrollY > 50) {
            setIsVisible(false);
            setLastScrollY(window.scrollY);
        }
    }, []);

    return (
        <footer 
            ref={footerRef}
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out",
                isVisible ? "translate-y-0" : "translate-y-full"
            )}
            style={{
                // Smooth transition for iOS Safari
                WebkitTransition: 'transform 0.3s ease-in-out',
                transition: 'transform 0.3s ease-in-out',
            }}
        >
            <nav className="flex items-center justify-around h-16">
                {items.map((item) => {
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                    const active = isActive(item);
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 min-w-[56px] transition-colors",
                                active 
                                    ? "text-primary" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            preserveScroll
                        >
                            <IconComponent className={cn(
                                "h-5 w-5 mb-1 transition-all",
                                active && "fill-primary"
                            )} />
                            <span className="text-xs font-medium transition-all">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
            
            {/* Safe area spacer for iOS devices */}
            <div className="h-safe-bottom" />
        </footer>
    );
}