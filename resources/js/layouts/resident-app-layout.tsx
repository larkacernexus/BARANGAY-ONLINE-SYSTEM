import AppLayoutTemplate from '@/layouts/app/resident-app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer'; // Updated import

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
}

export default ({ children, breadcrumbs, className = '', ...props }: AppLayoutProps) => {
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
                        <main className="max-w-full mx-auto">
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
                <ResidentMobileFooter /> {/* Updated component */}
            </div>
        </div>
    );
};