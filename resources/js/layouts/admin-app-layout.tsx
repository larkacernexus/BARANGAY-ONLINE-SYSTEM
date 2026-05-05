import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types/breadcrumbs';
import { type ReactNode, useEffect, useState, useRef } from 'react';
import MobileStickyFooter from '@/layouts/mobile-sticky-footer';
import { initializeTheme } from '@/hooks/use-appearance';
import { router } from '@inertiajs/react';
import { PageSkeleton } from '@/components/adminui/skeleton-loading';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
}

const MOBILE_FOOTER_ITEMS = [
    { icon: 'home', label: 'Dashboard', href: '/dashboard', activePaths: ['/dashboard', '/'] },
    { icon: 'search', label: 'Residents', href: '/residents', activePaths: ['/residents', '/residents/create', '/residents/edit'] },
    { icon: 'user', label: 'Households', href: '/households', activePaths: ['/households', '/households/create', '/households/edit'] },
    { icon: 'bell', label: 'Payments', href: '/payments', activePaths: ['/payments', '/payments/create'] },
    { icon: 'menu', label: 'More', href: '#', activePaths: ['/clearances', '/settings', '/users'] },
] as const;

export default function AdminAppLayout({ children, breadcrumbs, className = '', ...props }: AppLayoutProps) {
    const [isNavigating, setIsNavigating] = useState(false);
    const hasMounted = useRef(false);

    useEffect(() => {
        initializeTheme();
    }, []);

    useEffect(() => {
        const cleanupStart = router.on('start', () => {
            if (hasMounted.current) {
                setIsNavigating(true);
            }
        });

        const cleanupFinish = router.on('finish', () => {
            hasMounted.current = true;
            setIsNavigating(false);
        });

        return () => {
            cleanupStart();
            cleanupFinish();
        };
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-1 overflow-hidden">
                <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                    <div className={`h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
                        {breadcrumbs && breadcrumbs.length > 0 && <div className="mb-6" />}

                        {isNavigating ? (
                            <PageSkeleton type="table" />
                        ) : (
                            children
                        )}
                    </div>
                </AppLayoutTemplate>
            </div>

            <div className="md:hidden">
                <MobileStickyFooter items={[...MOBILE_FOOTER_ITEMS]} />
            </div>
        </div>
    );
}