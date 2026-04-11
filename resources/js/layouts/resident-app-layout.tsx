// @/layouts/app/resident-layout.tsx
import AppLayoutTemplate from '@/layouts/app/resident-app-sidebar-layout';
import { type BreadcrumbItem } from '@/types/types';
import { type ReactNode, useEffect } from 'react';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
    hideMobileFooter?: boolean;
}

export default ({ children, breadcrumbs = [], className = '', hideMobileFooter = false, ...props }: AppLayoutProps) => {
    // Handle input focus on mobile
    useEffect(() => {
        const handleFocusIn = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || 
                           target.tagName === 'TEXTAREA' || 
                           target.tagName === 'SELECT' ||
                           target.contentEditable === 'true';
            
            if (isInput && window.innerWidth < 768) {
                // Small delay for keyboard to start appearing
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

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
                <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
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
                            
                            <main className="w-full">
                                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                                    {children}
                                </div>
                            </main>
                        </div>
                    </div>
                </AppLayoutTemplate>
            </div>
            
            {!hideMobileFooter && <ResidentMobileFooter />}
        </div>
    );
};