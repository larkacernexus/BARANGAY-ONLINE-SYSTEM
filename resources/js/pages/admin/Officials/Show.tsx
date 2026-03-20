import AppLayout from '@/layouts/admin-app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Info,
    FileText,
    History,
} from 'lucide-react';

// Import components
import { OfficialHeader } from '@/components/admin/officials/show/components/official-header';
import { ProfileHeader } from '@/components/admin/officials/show/components/profile-header';
import { OfficialTabs } from '@/components/admin/officials/show/components/official-tabs';
import { DeleteConfirmationDialog } from '@/components/admin/officials/show/components/delete-confirmation-dialog';

// Import types and utilities
import { ShowOfficialProps } from '@/components/admin/officials/show/types';
import { formatDate, getStatusColor, getStatusIcon, getPositionIcon, getPositionColor } from '@/components/admin/officials/show/utils/helpers';

export default function ShowOfficial({ official }: ShowOfficialProps) {
    const [copied, setCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/officials/${official.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
            },
            onSuccess: () => {
                router.visit('/officials');
            }
        });
    };

    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const data = {
            official: {
                ...official,
                resident: official.resident ? {
                    id: official.resident.id,
                    full_name: official.resident.full_name,
                    age: official.resident.age,
                    gender: official.resident.gender,
                    contact_number: official.resident.contact_number,
                    email: official.resident.email,
                    address: official.resident.address
                } : null
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `official-${official.id}-data.json`;
        a.click();
    };

    return (
        <>
            <Head title={`Official: ${official.resident?.full_name || 'Unknown'}`} />
            
            <AppLayout
                title={`Official: ${official.resident?.full_name || 'Unknown'}`}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Officials', href: '/officials' },
                    { title: official.resident?.full_name || 'Official', href: `/officials/${official.id}` }
                ]}
            >
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <OfficialHeader
                        official={official}
                        onCopyLink={handleCopyLink}
                        onPrint={handlePrint}
                        onExport={handleExport}
                        onDelete={() => setShowDeleteDialog(true)}
                    />

                    {/* Profile Header */}
                    <ProfileHeader
                        official={official}
                        getPositionColor={getPositionColor}
                        getPositionIcon={getPositionIcon}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                    />

                    {/* Tabs Navigation and Content */}
                    <OfficialTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        official={official}
                        formatDate={formatDate}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                    />

                    {/* Delete Confirmation Dialog */}
                    <DeleteConfirmationDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                        official={official}
                        isDeleting={isDeleting}
                        onDelete={handleDelete}
                    />
                </div>
            </AppLayout>
        </>
    );
}