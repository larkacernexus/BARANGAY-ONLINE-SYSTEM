import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import MobileStickyFooter from '@/layouts/mobile-sticky-footer';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    // Update mobile footer items to use only icon names that exist in iconMap
    const mobileFooterItems = [
        { 
            icon: 'home', 
            label: 'Dashboard', 
            href: '/dashboard',
            activePaths: ['/dashboard', '/']
        },
        { 
            icon: 'search', // Use 'search' instead of 'users'
            label: 'Residents', 
            href: '/residents',
            activePaths: ['/residents', '/residents/create', '/residents/edit']
        },
        { 
            icon: 'user', // Use 'user' instead of 'home' for households
            label: 'Households', 
            href: '/households',
            activePaths: ['/households', '/households/create', '/households/edit']
        },
        { 
            icon: 'bell', // Use 'bell' instead of 'credit-card'
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
                    {/* Ensure children don't cause overflow */}
                    <div className="h-full overflow-y-auto">
                        {children}
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