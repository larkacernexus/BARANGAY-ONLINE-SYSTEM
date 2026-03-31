// resources/js/Pages/Admin/DocumentTypes/Show.tsx

import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { route } from 'ziggy-js';
import { Link } from '@inertiajs/react';

// Import components
import { DocumentTypeHeader } from '@/components/admin/document-types/show/components/document-type-header';
import { StatusBanner } from '@/components/admin/document-types/show/components/status-banner';
import { StatisticsCards } from '@/components/admin/document-types/show/components/statistics-cards';
import { DocumentTypeTabs } from '@/components/admin/document-types/show/components/document-type-tabs';
import { DangerZone } from '@/components/admin/document-types/show/components/danger-zone';
import { DeleteConfirmationDialog } from '@/components/admin/document-types/show/components/delete-confirmation-dialog';
import { DuplicateConfirmationDialog } from '@/components/admin/document-types/show/components/duplicate-confirmation-dialog';
import { StatusToggleDialog } from '@/components/admin/document-types/show/components/status-toggle-dialog';
import { RequiredToggleDialog } from '@/components/admin/document-types/show/components/required-toggle-dialog';

// Import types and utilities
import type { 
    DocumentType, 
    ClearanceType, 
    RecentApplication,
    ShowPageProps 
} from '@/types/admin/document-types/document-types';
import { 
    formatDate,
    formatDateTime,
    formatShortDate,
    formatTimeAgo,
    formatFileSize,
    getStatusIcon,
    getStatusVariant,
    getColorClass,
    getStatusBadge,
    getRequiredBadge,
    isNew
} from '@/components/admin/document-types/show/utils/helpers';
import { CheckCircle, FileCheck, FileX, Folder, ListOrdered } from 'lucide-react';

export default function DocumentTypeShow() {
    const { props } = usePage<ShowPageProps>();
    const { 
        documentType, 
        requiredClearanceTypes = [], 
        recentApplications = [],
        max_file_size_mb = 0
    } = props;
    
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState<boolean>(false);
    const [showStatusDialog, setShowStatusDialog] = useState<boolean>(false);
    const [showRequiredDialog, setShowRequiredDialog] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isDuplicating, setIsDuplicating] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'applications' | 'settings'>('overview');

    // Handle back navigation
    const handleBack = () => {
        router.visit(route('admin.document-types.index'));
    };

    // Handle edit
    const handleEdit = () => {
        router.visit(route('admin.document-types.edit', documentType.id));
    };

    // Handle delete
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.document-types.destroy', documentType.id), {
            onSuccess: () => {
                toast.success('Document type deleted successfully');
                router.visit(route('admin.document-types.index'));
            },
            onError: () => {
                toast.error('Failed to delete document type');
                setIsDeleting(false);
                setShowDeleteDialog(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            }
        });
    };

    // Handle duplicate
    const handleDuplicate = () => {
        setIsDuplicating(true);
        router.post(route('document-types.duplicate', documentType.id), {}, {
            onSuccess: (response: any) => {
                toast.success('Document type duplicated successfully');
                if (response.props?.documentType?.id) {
                    router.visit(route('admin.document-types.show', response.props.documentType.id));
                } else {
                    router.visit(route('admin.document-types.index'));
                }
            },
            onError: () => {
                toast.error('Failed to duplicate document type');
                setIsDuplicating(false);
                setShowDuplicateDialog(false);
            },
            onFinish: () => {
                setIsDuplicating(false);
            }
        });
    };

    // Handle toggle status
    const handleToggleStatus = () => {
        router.post(route('document-types.toggle-status', documentType.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Document type ${documentType.is_active ? 'deactivated' : 'activated'} successfully`);
                setShowStatusDialog(false);
            },
            onError: () => {
                toast.error('Failed to toggle status');
            }
        });
    };

    // Handle toggle required
    const handleToggleRequired = () => {
        router.post(route('document-types.toggle-required', documentType.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Document type ${documentType.is_required ? 'marked as optional' : 'marked as required'} successfully`);
                setShowRequiredDialog(false);
            },
            onError: () => {
                toast.error('Failed to toggle required status');
            }
        });
    };

    // Handle copy link
    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Statistics for cards
    const statistics = [
        { 
            label: 'Status', 
            value: documentType.is_active ? 'Active' : 'Inactive', 
            icon: CheckCircle,
            description: 'Current status',
            color: documentType.is_active ? 'green' : 'gray'
        },
        { 
            label: 'Requirement', 
            value: documentType.is_required ? 'Required' : 'Optional', 
            icon: documentType.is_required ? FileCheck : FileX,
            description: 'Requirement status',
            color: documentType.is_required ? 'blue' : 'purple'
        },
        { 
            label: 'Category', 
            value: documentType.category?.name || 'Uncategorized', 
            icon: Folder,
            description: 'Document category',
            color: 'amber'
        },
        { 
            label: 'Sort Order', 
            value: documentType.sort_order, 
            icon: ListOrdered,
            description: 'Display order',
            color: 'orange'
        },
    ];

    return (
        <AppLayout
            title={`Document Type: ${documentType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Document Types', href: '/document-types' },
                { title: documentType.name, href: `/document-types/${documentType.id}` }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <DocumentTypeHeader
                        documentType={documentType}
                        copied={copied}
                        isNew={isNew(documentType.created_at)}
                        onBack={handleBack}
                        onCopyLink={handleCopyLink}
                        onEdit={handleEdit}
                        onDuplicate={() => setShowDuplicateDialog(true)}
                        onToggleStatus={() => setShowStatusDialog(true)}
                        onToggleRequired={() => setShowRequiredDialog(true)}
                        onDelete={() => setShowDeleteDialog(true)}
                        canDelete={requiredClearanceTypes.length === 0}
                        getStatusIcon={getStatusIcon}
                        getStatusVariant={getStatusVariant}
                        getStatusBadge={getStatusBadge}
                        getRequiredBadge={getRequiredBadge}
                    />

                    {/* Status Banner - For document types with no category or important notice */}
                    {!documentType.category && (
                        <StatusBanner documentType={documentType} />
                    )}

                    {/* Statistics Cards */}
                    <StatisticsCards 
                        statistics={statistics} 
                        getColorClass={getColorClass} 
                    />

                    {/* Tabs Navigation */}
                    <DocumentTypeTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        requiredCount={requiredClearanceTypes.length}
                        applicationsCount={recentApplications.length}
                    />

                    {/* Tab Content */}
                    <div className="pt-2">
                        <DocumentTypeTabs.Content
                            activeTab={activeTab}
                            documentType={documentType}
                            requiredClearanceTypes={requiredClearanceTypes}
                            recentApplications={recentApplications}
                            max_file_size_mb={max_file_size_mb}
                            formatDate={formatDate}
                            formatDateTime={formatDateTime}
                            formatShortDate={formatShortDate}
                            formatTimeAgo={formatTimeAgo}
                            formatFileSize={formatFileSize}
                        />
                    </div>

                    {/* Danger Zone */}
                    <DangerZone
                        documentType={documentType}
                        requiredCount={requiredClearanceTypes.length}
                        onDelete={() => setShowDeleteDialog(true)}
                    />
                </div>

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    documentType={documentType}
                    requiredCount={requiredClearanceTypes.length}
                    isDeleting={isDeleting}
                    onDelete={handleDelete}
                />

                {/* Duplicate Confirmation Dialog */}
                <DuplicateConfirmationDialog
                    open={showDuplicateDialog}
                    onOpenChange={setShowDuplicateDialog}
                    documentType={documentType}
                    isDuplicating={isDuplicating}
                    onDuplicate={handleDuplicate}
                />

                {/* Status Toggle Confirmation Dialog */}
                <StatusToggleDialog
                    open={showStatusDialog}
                    onOpenChange={setShowStatusDialog}
                    documentType={documentType}
                    onToggle={handleToggleStatus}
                />

                {/* Required Toggle Confirmation Dialog */}
                <RequiredToggleDialog
                    open={showRequiredDialog}
                    onOpenChange={setShowRequiredDialog}
                    documentType={documentType}
                    onToggle={handleToggleRequired}
                />
            </TooltipProvider>
        </AppLayout>
    );
}