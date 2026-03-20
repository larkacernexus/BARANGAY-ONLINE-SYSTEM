// resources/js/Pages/Admin/Roles/Show.tsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import {
    Shield,
    Users,
    Key,
    Calendar,
    Clock,
    Check,
    X,
    Edit,
    Copy,
    Trash2,
    ArrowLeft,
    MoreVertical,
    AlertTriangle,
    Lock,
    UserCheck,
    FileText,
    Eye,
    Save,
    Download,
    Printer,
    Mail,
    Link as LinkIcon,
    ChevronRight,
    Settings,
    Bell,
    Activity,
    User as UserIcon,
    Hash,
    Info,
    Award,
    Target,
    Zap,
    BarChart3,
    History,
    MessageSquare,
    Plus,
    RefreshCw,
    ExternalLink,
    Globe,
    Home,
    MapPin,
    Briefcase,
    GraduationCap,
    Star,
    Trophy,
    Medal,
    Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { route } from 'ziggy-js';

// Import components
import { RoleHeader } from '@/components/admin/roles/show/components/role-header';
import { SystemWarning } from '@/components/admin/roles/show/components/system-warning';
import { StatisticsCards } from '@/components/admin/roles/show/components/statistics-cards';
import { RoleTabs } from '@/components/admin/roles/show/components/role-tabs';
import { DangerZone } from '@/components/admin/roles/show/components/danger-zone';
import { DeleteConfirmationDialog } from '@/components/admin/roles/show/components/delete-confirmation-dialog';

// Import types and utilities
import { RolesShowProps } from '@/components/admin/roles/show/types';
import { formatDateTime, formatTimeAgo, getInitials, getStatusBadge, groupPermissionsByModule, canDeleteRole, getColorClass } from '@/components/admin/roles/show/utils/helpers';

export default function RolesShow({ role }: RolesShowProps) {
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(`${label} copied to clipboard!`);
            setTimeout(() => setCopySuccess(null), 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.roles.destroy', role.id), {
            preserveScroll: true,
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                router.visit(route('admin.roles.index'));
            },
            onError: (errors) => {
                setIsDeleting(false);
                if (errors.error) {
                    alert(errors.error);
                }
            },
        });
    };

    const handleManagePermissions = () => {
        router.get(route('admin.roles.permissions', role.id));
    };

    const handleExportDetails = () => {
        const data = {
            id: role.id,
            name: role.name,
            description: role.description,
            is_system_role: role.is_system_role,
            users_count: role.users_count,
            permissions: role.permissions?.map(p => ({
                id: p.id,
                name: p.name,
                display_name: p.display_name,
                module: p.module,
            })) || [],
            created_at: role.created_at,
            updated_at: role.updated_at,
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `role-${role.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Statistics based on actual data
    const statistics = [
        { 
            label: 'Total Users', 
            value: role.users_count || 0, 
            icon: Users,
            description: 'Users assigned to this role',
            color: 'blue'
        },
        { 
            label: 'Permissions', 
            value: role.permissions?.length || 0, 
            icon: Key,
            description: 'Total permissions granted',
            color: 'purple'
        },
        { 
            label: 'Active Users', 
            value: role.recent_users?.filter(u => u.status === 'active').length || 0, 
            icon: UserCheck,
            description: 'Currently active users',
            color: 'green'
        },
        { 
            label: 'System Role', 
            value: role.is_system_role ? 'Yes' : 'No', 
            icon: Shield,
            description: 'Predefined system role',
            color: 'amber'
        },
    ];

    // System role warnings
    const systemWarnings = role.is_system_role ? [
        'System roles cannot be deleted',
        'Changes to system roles may affect system functionality',
    ] : [];

    const groupedPermissions = groupPermissionsByModule(role.permissions);

    return (
        <AdminLayout
            title={`Role: ${role.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Roles', href: route('admin.roles.index') },
                { title: role.name, href: route('admin.roles.show', role.id) }
            ]}
        >
            <Head title={`Role: ${role.name}`} />

            <TooltipProvider>
                <div className="space-y-6">
                    {/* Success Alert */}
                    {copySuccess && (
                        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle className="text-green-800 dark:text-green-300">Success!</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-400">{copySuccess}</AlertDescription>
                        </Alert>
                    )}

                    {/* Header with Actions */}
               <RoleHeader
                    role={role}
                    onCopyLink={handleCopyLink}
                    onExport={handleExportDetails}
                    onManagePermissions={handleManagePermissions}
                    onDelete={() => setShowDeleteDialog(true)}
                    canDelete={canDeleteRole(role)}
                />

                    {/* Warning for System Roles */}
                    {systemWarnings.length > 0 && (
                        <SystemWarning warnings={systemWarnings} />
                    )}

                    {/* Statistics Cards */}
                    <StatisticsCards statistics={statistics} getColorClass={getColorClass} />

                    {/* Tabs Navigation */}
                    <RoleTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        role={role}
                        groupedPermissions={groupedPermissions}
                    />

                    {/* Tab Content */}
                    <div className="pt-2">
                        <RoleTabs.Content
                            activeTab={activeTab}
                            role={role}
                            groupedPermissions={groupedPermissions}
                            statistics={statistics}
                            onCopyToClipboard={handleCopyToClipboard}
                            onManagePermissions={handleManagePermissions}
                            formatDateTime={formatDateTime}
                            formatTimeAgo={formatTimeAgo}
                            getStatusBadge={getStatusBadge}
                            getInitials={getInitials}
                        />
                    </div>

                    {/* Danger Zone */}
                    {!role.is_system_role && (
                        <DangerZone
                            role={role}
                            onDelete={() => setShowDeleteDialog(true)}
                            canDelete={canDeleteRole(role)}
                        />
                    )}
                </div>

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    role={role}
                    isDeleting={isDeleting}
                    onDelete={handleDelete}
                />
            </TooltipProvider>
        </AdminLayout>
    );
}