// resources/js/Pages/Admin/Permissions/Show.tsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Copy,
    Check,
    Printer,
    Shield,
    Users,
    Key,
    Hash,
    AlertTriangle,
    RefreshCw,
    Info,
    Zap,
    MessageCircle,
    Building,
    FileText,
    Clock,
    Database,
    BookOpen,
    XCircle,
    Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    TooltipProvider,
} from '@/components/ui/tooltip';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DeveloperContactModal from '@/components/developer-contact-modal';
import { route } from 'ziggy-js';

// Import components
import { PermissionHeader } from '@/components/admin/permissions/show/components/permission-header';
import { StatusBanner } from '@/components/admin/permissions/show/components/status-banner';
import { StatisticsCards } from '@/components/admin/permissions/show/components/statistics-cards';
import { PermissionTabs } from '@/components/admin/permissions/show/components/permission-tabs';
import { DangerZone } from '@/components/admin/permissions/show/components/danger-zone';
import { DeleteConfirmationDialog } from '@/components/admin/permissions/show/components/delete-confirmation-dialog';

// Import types and utilities
import { PermissionShowProps } from '@/components/admin/permissions/show//types';
import { 
    formatDate, 
    formatDateTime, 
    formatTimeAgo, 
    getModuleDisplayName, 
    getModuleIcon, 
    getModuleColor, 
    getStatusVariant, 
    getStatusIcon, 
    getColorClass,
    isSystemPermission 
} from '@/components/admin/permissions/show/utils/helpers';

export default function PermissionShow({ 
    permission, 
    roles = [],
    users = [],
    can = { edit: true, delete: true }
}: PermissionShowProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeveloperModal, setShowDeveloperModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const handleEdit = () => {
        router.visit(route('admin.permissions.edit', permission.id));
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.permissions.destroy', permission.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
                router.visit(route('admin.permissions.index'));
            },
            onError: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
            },
        });
    };

    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleContactDeveloper = () => {
        setShowDeveloperModal(true);
    };

    // Calculate summary stats
    const totalUsersWithAccess = users.length;
    const totalRolesWithAccess = roles.length;
    const isSystem = isSystemPermission(permission.name);

    // Statistics cards data
    const statistics = [
        { 
            label: 'Roles with Access', 
            value: totalRolesWithAccess, 
            icon: Shield,
            description: 'Roles that have this permission',
            color: 'blue'
        },
        { 
            label: 'Users with Access', 
            value: totalUsersWithAccess, 
            icon: Users,
            description: 'Users who can access via roles',
            color: 'green'
        },
        { 
            label: 'Permission ID', 
            value: `#${permission.id}`, 
            icon: Hash,
            description: 'Database identifier',
            color: 'purple'
        },
        { 
            label: 'Created', 
            value: formatTimeAgo(permission.created_at), 
            icon: Calendar,
            description: formatDate(permission.created_at),
            color: 'amber'
        },
    ];

    return (
        <AdminLayout
            title={`Permission: ${permission.display_name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Permissions', href: route('admin.permissions.index') },
                { title: permission.display_name, href: '#' }
            ]}
        >
            <Head title={`${permission.display_name} - Permission Details`} />

            {/* Developer Contact Modal */}
            <DeveloperContactModal
                isOpen={showDeveloperModal}
                onClose={() => setShowDeveloperModal(false)}
                developerDetails={{
                    name: "Mr. Juan Dela Cruz",
                    position: "Barangay IT Support",
                    email: "it.support@barangay.gov.ph",
                    phone: "0917-123-4567",
                    office: "Barangay Hall - 2nd Floor",
                    schedule: "Monday - Friday, 8:00 AM - 5:00 PM",
                    notes: "For questions about permissions, please contact our IT support."
                }}
            />

            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <PermissionHeader
                        permission={permission}
                        isSystem={isSystem}
                        onCopyLink={handleCopyLink}
                        onEdit={handleEdit}
                        onDelete={() => setShowDeleteDialog(true)}
                        canEdit={can.edit}
                        canDelete={can.delete}
                        getStatusVariant={getStatusVariant}
                        getStatusIcon={getStatusIcon}
                    />

                    {/* Status Banners */}
                    <StatusBanner
                        isSystem={isSystem}
                        isActive={permission.is_active}
                    />

                    {/* Statistics Cards */}
                    <StatisticsCards 
                        statistics={statistics} 
                        getColorClass={getColorClass} 
                    />

                    {/* Tab Navigation */}
                    <PermissionTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        totalRoles={totalRolesWithAccess}
                        totalUsers={totalUsersWithAccess}
                    />

                    {/* Tab Content */}
                    <div className="pt-2">
                        <PermissionTabs.Content
                            activeTab={activeTab}
                            permission={permission}
                            roles={roles}
                            users={users}
                            statistics={statistics}
                            totalRolesWithAccess={totalRolesWithAccess}
                            totalUsersWithAccess={totalUsersWithAccess}
                            onContactDeveloper={handleContactDeveloper}
                            formatDate={formatDate}
                            formatTimeAgo={formatTimeAgo}
                            getModuleDisplayName={getModuleDisplayName}
                            getModuleIcon={getModuleIcon}
                            getModuleColor={getModuleColor}
                            getColorClass={getColorClass}
                        />
                    </div>

                    {/* Danger Zone */}
                    {can.delete && (
                        <DangerZone
                            rolesCount={roles.length}
                            usersCount={users.length}
                            onDelete={() => setShowDeleteDialog(true)}
                        />
                    )}
                </div>

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    permission={permission}
                    rolesCount={roles.length}
                    usersCount={users.length}
                    isDeleting={isDeleting}
                    onDelete={handleDelete}
                />
            </TooltipProvider>
        </AdminLayout>
    );
}