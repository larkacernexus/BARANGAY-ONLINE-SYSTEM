// resources/js/Pages/Admin/Officials/Show.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Info,
    FileText,
    History,
} from 'lucide-react';

// Import Admin Tabs Component
import { AdminTabsWithContent, AdminTabPanel } from '@/components/adminui/admin-tabs';

// Import components
import { OfficialHeader } from '@/components/admin/officials/show/components/official-header';
import { ProfileHeader } from '@/components/admin/officials/show/components/profile-header';
import { OverviewTab } from '@/components/admin/officials/show/components/tabs/overview-tab';
import { DetailsTab } from '@/components/admin/officials/show/components/tabs/details-tab';
import { ActivityTab } from '@/components/admin/officials/show/components/tabs/activity-tab';
import { DeleteConfirmationDialog } from '@/components/admin/officials/show/components/delete-confirmation-dialog';

// Import types from shared officials types
import { ShowOfficialProps } from '@/types/admin/officials/officials';

// Import utilities from officialsUtils
import { formatDate, formatDateTime, formatTimeAgo } from '@/admin-utils/officialsUtils';

// Import helpers from local utils (for colors and icons)
import { getStatusColor, getStatusIcon, getPositionIcon, getPositionColor } from '@/components/admin/officials/show/utils/helpers';

export default function ShowOfficial({ official }: ShowOfficialProps) {
    const [copied, setCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/admin/officials/${official.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
            },
            onSuccess: () => {
                router.visit('/admin/officials');
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
                id: official.id,
                resident: official.resident,
                positionData: official.positionData,
                committeeData: official.committeeData,
                user: official.user,
                term_start: official.term_start,
                term_end: official.term_end,
                status: official.status,
                is_current: official.is_current,
                is_regular: official.is_regular,
                responsibilities: official.responsibilities,
                achievements: official.achievements,
                created_at: official.created_at,
                updated_at: official.updated_at
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `official-${official.id}-data.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Tab definitions
    const tabs = [
        { 
            id: 'overview', 
            label: 'Overview', 
            icon: <Info className="h-4 w-4" />,
        },
        { 
            id: 'details', 
            label: 'Details', 
            icon: <FileText className="h-4 w-4" />,
        },
        { 
            id: 'activity', 
            label: 'Activity', 
            icon: <History className="h-4 w-4" />,
            count: official.user?.activities?.length || 0
        },
    ];

    return (
        <>
            <Head title={`Official: ${official.resident?.full_name || 'Unknown'}`} />
            
            <AppLayout
                title={`Official: ${official.resident?.full_name || 'Unknown'}`}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Officials', href: '/admin/officials' },
                    { title: official.resident?.full_name || 'Official', href: `/admin/officials/${official.id}` }
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

                    {/* Admin Tabs Component */}
                    <AdminTabsWithContent
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        variant="underlined"
                        size="md"
                        scrollable={true}
                        showCountBadges={true}
                        lazyLoad={true}
                    >
                        <AdminTabPanel value="overview">
                            <OverviewTab
                                official={official}
                                formatDate={formatDate}
                                getStatusColor={getStatusColor}
                                getStatusIcon={getStatusIcon}
                            />
                        </AdminTabPanel>

                        <AdminTabPanel value="details">
                            <DetailsTab
                                official={official}
                                formatDate={formatDate}
                                getStatusColor={getStatusColor}
                                getStatusIcon={getStatusIcon}
                            />
                        </AdminTabPanel>

                        <AdminTabPanel value="activity">
                            <ActivityTab
                                official={official}
                                formatDate={formatDate}
                                formatDateTime={formatDateTime}
                                formatTimeAgo={formatTimeAgo}
                            />
                        </AdminTabPanel>
                    </AdminTabsWithContent>

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