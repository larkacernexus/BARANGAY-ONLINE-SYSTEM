import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { ResidentSidebar } from '@/components/resident-app-sidebar';
import { ResidentSidebarHeader } from '@/components/resident-app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <ResidentSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <ResidentSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
