import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import MobileStickyFooter from '@/layouts/mobile-sticky-footer';
import { usePage } from '@inertiajs/react'; // Change this import
import { useEffect, useState } from 'react'; 
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
}

export default ({ children, breadcrumbs, className = '', ...props }: AppLayoutProps) => {
    const { component } = usePage(); // Get current component
    const [isChangingPage, setIsChangingPage] = useState(false);
    
    // Listen for navigation events
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
    
    // Update mobile footer items to use only icon names that exist in iconMap
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
            {/* Global loading indicator */}
            {isChangingPage && (
                <div className="fixed top-0 left-0 right-0 z-50">
                    <div className="h-1 w-full bg-indigo-100 dark:bg-indigo-900/30">
                        <div className="h-full w-1/2 animate-pulse bg-indigo-600 dark:bg-indigo-400"></div>
                    </div>
                </div>
            )}

            {/* Use a flex container for sidebar + main content */}
            <div className="flex flex-1 overflow-hidden">
                <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                    {/* Main content container with consistent spacing */}
                    <div className={`h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
                        {/* Breadcrumb spacing */}
                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <div className="mb-6">
                                {/* Breadcrumbs will be rendered by AppLayoutTemplate */}
                            </div>
                        )}
                        
                        {/* Main content with proper margins */}
                        <main className="max-w-full mx-auto relative">
                            {/* Loading overlay for slow navigation */}
                            {isChangingPage && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 z-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                                </div>
                            )}
                            
                            {/* Add spacing wrapper around children */}
                            <div className="space-y-6">
                                {children}
                            </div>
                        </main>
                    </div>
                </AppLayoutTemplate>
            </div>
            
            {/* Mobile sticky footer - only visible on small screens */}
            <div className="md:hidden">
                <MobileStickyFooter items={mobileFooterItems} />
            </div>
        </div>
    );
};