import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/admin-app-layout';
import SettingsLayout from '@/layouts/settings/layout';

// Constants for maintainability
const PAGE_CONFIG = {
    TITLE: 'Appearance Settings',
    DESCRIPTION: "Customize your account's appearance and theme preferences",
    ADMIN_URL: '/settings/appearance',
    // Add other constants here if needed
} as const;

export default function Appearance() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: PAGE_CONFIG.TITLE,
            href: PAGE_CONFIG.ADMIN_URL,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={PAGE_CONFIG.TITLE} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={PAGE_CONFIG.TITLE}
                        description={PAGE_CONFIG.DESCRIPTION}
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}