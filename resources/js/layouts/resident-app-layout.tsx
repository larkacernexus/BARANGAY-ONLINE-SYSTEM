// @/layouts/app/resident-layout.tsx
import AppLayoutTemplate from '@/layouts/app/resident-app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
}

export default ({ children, breadcrumbs = [], className = '', ...props }: AppLayoutProps) => {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            {/* Use a flex container for sidebar + main content */}
            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
                <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                    {/* Main content container - scrollable area above footer */}
                    <div className="flex-1 overflow-y-auto">
                        <div className={`px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
                            {/* Mobile breadcrumbs - only visible on small screens */}
                            {breadcrumbs && breadcrumbs.length > 0 && (
                                <div className="md:hidden mb-4">
                                    {/* Breadcrumbs are handled by AppLayoutTemplate */}
                                    <div className="text-sm text-muted-foreground">
                                        {/* This space will be used for mobile breadcrumbs if needed */}
                                    </div>
                                </div>
                            )}
                            
                            {/* Main content */}
                            <main className="max-w-full mx-auto">
                                {/* Add spacing wrapper around children */}
                                <div className="space-y-6">
                                    {children}
                                </div>
                            </main>
                        </div>
                    </div>
                </AppLayoutTemplate>
            </div>
            
            {/* Mobile sticky footer - always at the bottom on mobile */}
            <ResidentMobileFooter />
        </div>
    );
};