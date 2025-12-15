// @/components/layout/mobile-sticky-footer.tsx
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Home, Search, Bell, User, Menu } from 'lucide-react';

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
    
    const isActive = (item: MobileFooterItem) => {
        return item.activePaths.some(path => 
            url === path || url.startsWith(path + '/')
        );
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                                "h-5 w-5 mb-1",
                                active && "fill-primary"
                            )} />
                            <span className="text-xs font-medium">
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