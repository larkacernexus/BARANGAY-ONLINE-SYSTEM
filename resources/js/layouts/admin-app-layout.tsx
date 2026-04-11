import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types/breadcrumbs';
import { type ReactNode } from 'react';
import MobileStickyFooter from '@/layouts/mobile-sticky-footer';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react'; 
import { Loader2 } from 'lucide-react';
import { initializeTheme } from '@/hooks/use-appearance'; // Add this import

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
}

export default ({ children, breadcrumbs, className = '', ...props }: AppLayoutProps) => {
    const { component } = usePage();
    const [isChangingPage, setIsChangingPage] = useState(false);
    
    // Initialize theme once when the app loads
    useEffect(() => {
        initializeTheme();
    }, []);
    
    useEffect(() => {
        const handleStart = () => setIsChangingPage(true);
        const handleFinish = () => setIsChangingPage(false);
        
        document.addEventListener('inertia:start', handleStart);
        document.addEventListener('inertia:finish', handleFinish);
        
        return () => {
            document.removeEventListener('inertia:start', handleStart);
            document.removeEventListener('inertia:finish', handleFinish);
        };
    }, []);
    
    const mobileFooterItems = [
        { 
            icon: 'home', 
            label: 'Dashboard', 
            href: '/dashboard',
            activePaths: ['/dashboard', '/']
        },
        { 
            icon: 'search',
            label: 'Residents', 
            href: '/residents',
            activePaths: ['/residents', '/residents/create', '/residents/edit']
        }, 
        { 
            icon: 'user',
            label: 'Households', 
            href: '/households',
            activePaths: ['/households', '/households/create', '/households/edit']
        },
        { 
            icon: 'bell',
            label: 'Payments', 
            href: '/payments',
            activePaths: ['/payments', '/payments/create']
        },
        { 
            icon: 'menu', 
            label: 'More', 
            href: '#',
            activePaths: ['/clearances', '/settings', '/users'],
        },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            {/* Full-screen centered loading overlay with subtle blur */}
            {isChangingPage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-[2px]">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
                </div>
            )}

            {/* Use a flex container for sidebar + main content */}
            <div className="flex flex-1 overflow-hidden">
                <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                    <div className={`h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <div className="mb-6"></div>
                        )}
                        
                        <main className="max-w-full mx-auto">
                            <div className="space-y-6">
                                {children}
                            </div>
                        </main>
                    </div>
                </AppLayoutTemplate>
            </div>
            
            <div className="md:hidden">
                <MobileStickyFooter items={mobileFooterItems} />
            </div>
        </div>
    );
};