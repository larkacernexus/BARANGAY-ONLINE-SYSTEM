// pages/admin/banners/create.tsx

import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import BannerForm from '@/components/admin/banners/Partials/BannerForm';
import { type BreadcrumbItem } from '@/types/breadcrumbs';

interface Props {
    puroks: Array<{ id: number; name: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Banners',
        href: '/admin/banners',
    },
    {
        title: 'Create Banner',
        href: '/admin/banners/create',
    },
];

export default function Create({ puroks }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Banner" />

            <div className="p-6 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Banner</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add a new banner to the homepage carousel
                    </p>
                </div>

                <BannerForm puroks={puroks} />
            </div>
        </AppLayout>
    );
}