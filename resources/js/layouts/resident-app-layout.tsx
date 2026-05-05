// layouts/resident-app-layout.tsx
import AppLayoutTemplate from '@/layouts/app/resident-app-sidebar-layout';
import { type BreadcrumbItem } from '@/types/types';
import { type ReactNode, useEffect, useState, useMemo } from 'react';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';
import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';
import { UniversalSkeleton } from '@/components/residentui/skeleton-loading';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
    hideMobileFooter?: boolean;
    pageType?: 'clearances' | 'dashboard' | 'profile' | 'request' | 'table' | 'grid' | 'detail' | 'form' | 'stats' | 'list' | 'filters';
    skeletonProps?: {
        hasStats?: boolean;
        hasFilters?: boolean;
        hasHeader?: boolean;
        hasAction?: boolean;
        hasImage?: boolean;
        count?: number;
        fields?: number;
        density?: 'compact' | 'default' | 'comfortable';
    };
}

// Move config outside component to prevent recreation
const pageTypeConfig: Record<string, {
    variant: 'card' | 'list' | 'table' | 'grid' | 'detail' | 'form' | 'stats' | 'profile' | 'filters' | 'dashboard';
    defaults: Partial<AppLayoutProps['skeletonProps']>;
}> = {
    dashboard: {
        variant: 'dashboard',
        defaults: { hasStats: true, count: 6, fields: 2, density: 'default' }
    },
    profile: {
        variant: 'profile',
        defaults: { density: 'default' }
    },
    request: {
        variant: 'form',
        defaults: { fields: 8, density: 'default' }
    },
    clearances: {
        variant: 'card',
        defaults: { hasHeader: true, hasFilters: true, hasAction: true, count: 5, fields: 3, density: 'default' }
    },
    table: {
        variant: 'table',
        defaults: { hasHeader: true, hasFilters: true, hasAction: true, count: 10, fields: 6, density: 'default' }
    },
    grid: {
        variant: 'grid',
        defaults: { count: 6, fields: 3, density: 'default' }
    },
    detail: {
        variant: 'detail',
        defaults: { hasImage: true, fields: 5, density: 'default' }
    },
    form: {
        variant: 'form',
        defaults: { fields: 8, density: 'default' }
    },
    stats: {
        variant: 'stats',
        defaults: { count: 4, density: 'default' }
    },
    list: {
        variant: 'list',
        defaults: { hasImage: false, count: 5, density: 'default' }
    },
    filters: {
        variant: 'filters',
        defaults: { fields: 5, density: 'default' }
    }
};

export default ({ 
    children, 
    breadcrumbs = [], 
    className = '', 
    hideMobileFooter = false, 
    pageType = 'clearances',
    skeletonProps = {},
    ...props 
}: AppLayoutProps) => {
    const [isChangingPage, setIsChangingPage] = useState(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [prevPathname, setPrevPathname] = useState<string>('');

    // Handle window resize for mobile detection - debounced
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let timeoutId: NodeJS.Timeout;
        
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const mobile = window.innerWidth < 768;
                setIsMobile(prev => {
                    // Only update if actually changed
                    if (prev !== mobile) {
                        return mobile;
                    }
                    return prev;
                });
                
                if (!mobile && isSidebarOpen) {
                    setIsSidebarOpen(false);
                }
            }, 150);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [isSidebarOpen]);

    // Handle Inertia page transitions - distinguish between navigation and initial load
    useEffect(() => {
        let isInitialLoad = true;

        const handleStart = (event: any) => {
            // Only show skeleton for actual page navigation, not initial load
            if (!isInitialLoad) {
                setIsChangingPage(true);
            }
            
            if (isMobile && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
            
            // Store previous pathname for comparison
            if (event?.detail?.visit?.url) {
                setPrevPathname(event.detail.visit.url.toString());
            }
        };

        const handleFinish = () => {
            setIsChangingPage(false);
            isInitialLoad = false;
            
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.focus();
            }
        };

        const unbindStart = router.on('start', handleStart);
        const unbindFinish = router.on('finish', handleFinish);

        return () => {
            unbindStart();
            unbindFinish();
        };
    }, [isMobile, isSidebarOpen]);

    // Handle input focus on mobile
    useEffect(() => {
        const handleFocusIn = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.contentEditable === 'true';

            if (isInput && window.innerWidth < 768) {
                setTimeout(() => {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }
        };

        document.addEventListener('focusin', handleFocusIn);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
        };
    }, []);

    // Listen for sidebar toggle events
    useEffect(() => {
        const handleSidebarToggle = (event: CustomEvent<{ isOpen: boolean }>) => {
            setIsSidebarOpen(event.detail.isOpen);
        };

        window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);

        return () => {
            window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
        };
    }, []);

    // Expose sidebar state
    useEffect(() => {
        const event = new CustomEvent('sidebar-state', { 
            detail: { isOpen: isSidebarOpen } 
        });
        window.dispatchEvent(event);
    }, [isSidebarOpen]);

    // Memoize skeleton configuration to prevent unnecessary recalculations
    const config = useMemo(() => 
        pageTypeConfig[pageType] || pageTypeConfig.clearances,
        [pageType]
    );

    const combinedSkeletonProps = useMemo(() => ({
        variant: config.variant,
        isMobile,
        ...config.defaults,
        ...skeletonProps,
    }), [config, isMobile, skeletonProps]);

    // Memoize skeleton renderer
    const renderSkeleton = useMemo(() => {
        if (!isChangingPage) return null;
        return <UniversalSkeleton {...combinedSkeletonProps} />;
    }, [isChangingPage, combinedSkeletonProps]);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
                <AppLayoutTemplate 
                    breadcrumbs={breadcrumbs}
                    // These props ensure sidebar persistence
                    key="app-layout-template" // Stable key to prevent remounting
                    isSidebarOpen={isSidebarOpen}
                    onSidebarToggle={(isOpen: boolean) => setIsSidebarOpen(isOpen)}
                    {...props}
                >
                    <div className="flex-1 overflow-y-auto">
                        <div className={`
                            px-0 sm:px-4 md:px-6 lg:px-8 
                            py-3 sm:py-4 md:py-6 
                            ${className}
                        `}>
                            {breadcrumbs && breadcrumbs.length > 0 && (
                                <div className="md:hidden px-2 mb-3">
                                    <div className="text-sm text-muted-foreground">
                                        {/* Breadcrumbs */}
                                    </div>
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                <motion.main
                                    key={window.location.pathname}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.2, // Reduced duration for faster transitions
                                        ease: "easeInOut"
                                    }}
                                    className="w-full focus:outline-none"
                                    tabIndex={-1}
                                >
                                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                                        {renderSkeleton || children}
                                    </div>
                                </motion.main>
                            </AnimatePresence>
                        </div>
                    </div>
                </AppLayoutTemplate>
            </div>

            {!hideMobileFooter && <ResidentMobileFooter />}
        </div>
    );
};