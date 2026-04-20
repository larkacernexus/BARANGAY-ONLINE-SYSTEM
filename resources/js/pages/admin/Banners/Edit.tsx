// pages/admin/banners/edit.tsx

import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import BannerForm from '@/components/admin/banners/Partials/BannerForm';
import { type BreadcrumbItem } from '@/types/breadcrumbs';

interface Props {
    banner: any;
    puroks: Array<{ id: number; name: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Banners',
        href: '/admin/banners',
    },
    {
        title: 'Edit Banner',
        href: '/admin/banners/edit',
    },
];

export default function Edit({ banner, puroks }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Banner - ${banner.title}`} />

            <div className="p-6 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Banner</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Update banner information and settings
                    </p>
                </div>

                <BannerForm banner={banner} puroks={puroks} isEditing />
            </div>
        </AppLayout>
    );
}