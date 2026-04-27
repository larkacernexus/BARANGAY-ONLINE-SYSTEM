import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types/breadcrumbs';
import { type ReactNode, useEffect, useState } from 'react';
import MobileStickyFooter from '@/layouts/mobile-sticky-footer';
import PageLoader from '@/components/page-loader'; 
import { initializeTheme } from '@/hooks/use-appearance';
import { motion, AnimatePresence } from 'framer-motion'; // Added Framer Motion

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
}

export default ({ children, breadcrumbs, className = '', ...props }: AppLayoutProps) => {
    const [isChangingPage, setIsChangingPage] = useState(false);
    
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
        { icon: 'home', label: 'Dashboard', href: '/dashboard', activePaths: ['/dashboard', '/'] },
        { icon: 'search', label: 'Residents', href: '/residents', activePaths: ['/residents', '/residents/create', '/residents/edit'] }, 
        { icon: 'user', label: 'Households', href: '/households', activePaths: ['/households', '/households/create', '/households/edit'] },
        { icon: 'bell', label: 'Payments', href: '/payments', activePaths: ['/payments', '/payments/create'] },
        { icon: 'menu', label: 'More', href: '#', activePaths: ['/clearances', '/settings', '/users'] },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            {/* Smooth Page Loader Overlay */}
            <PageLoader visible={isChangingPage} />

            <div className="flex flex-1 overflow-hidden">
                <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                    <div className={`h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
                        
                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <div className="mb-6"></div>
                        )}
                        
                        {/* AnimatePresence allows us to animate components when they 
                            are added to or removed from the React tree.
                        */}
                        <AnimatePresence mode="wait">
                            <motion.main
                                key={window.location.pathname} // Forces re-animation on route change
                                initial={{ opacity: 0, y: 10 }} // Starts slightly lower and invisible
                                animate={{ opacity: 1, y: 0 }}  // Transitions to center and visible
                                exit={{ opacity: 0, y: -10 }}   // Optional: fades out and up when leaving
                                transition={{ 
                                    duration: 0.3, 
                                    ease: [0.25, 1, 0.5, 1] // Custom cubic-bezier for a "snappy" feel
                                }}
                                className="max-w-full mx-auto"
                            >
                                <div className="space-y-6">
                                    {children}
                                </div>
                            </motion.main>
                        </AnimatePresence>
                    </div>
                </AppLayoutTemplate>
            </div>
            
            <div className="md:hidden">
                <MobileStickyFooter items={mobileFooterItems} />
            </div>
        </div>
    );
};