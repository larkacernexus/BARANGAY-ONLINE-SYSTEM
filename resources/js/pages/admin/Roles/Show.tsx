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

// Import shared types and utilities
import { RoleShowProps, Role, Permission } from '@/types/admin/roles/roles';
import { formatDate, canDeleteRole } from '@/admin-utils/rolesUtils';

// Local helper functions specific to the show page
const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return 'Invalid Date';
    }
};

const formatTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return formatDate(dateString);
    } catch {
        return 'Invalid Date';
    }
};

const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const getStatusBadge = (status: string | undefined): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string } => {
    switch (status) {
        case 'active':
            return { variant: 'default', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
        case 'inactive':
            return { variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' };
        case 'suspended':
            return { variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
        default:
            return { variant: 'outline', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    }
};

const groupPermissionsByModule = (permissions: Permission[] | undefined): Record<string, Permission[]> => {
    if (!permissions || permissions.length === 0) return {};
    
    return permissions.reduce((groups: Record<string, Permission[]>, permission) => {
        const module = permission.module || 'General';
        if (!groups[module]) {
            groups[module] = [];
        }
        groups[module].push(permission);
        return groups;
    }, {});
};

const getColorClass = (color: string): string => {
    const colors: Record<string, string> = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        green: 'from-green-500 to-green-600',
        amber: 'from-amber-500 to-amber-600',
        red: 'from-red-500 to-red-600',
        indigo: 'from-indigo-500 to-indigo-600',
    };
    return colors[color] || colors.blue;
};

// Import components (these would need to be updated to use shared types)
import { RoleHeader } from '@/components/admin/roles/show/components/role-header';
import { SystemWarning } from '@/components/admin/roles/show/components/system-warning';
import { StatisticsCards } from '@/components/admin/roles/show/components/statistics-cards';
import { RoleTabs } from '@/components/admin/roles/show/components/role-tabs';
import { DangerZone } from '@/components/admin/roles/show/components/danger-zone';
import { DeleteConfirmationDialog } from '@/components/admin/roles/show/components/delete-confirmation-dialog';

export default function RolesShow({ role, stats }: RoleShowProps) {
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);

    // Safe access with fallbacks
    const usersCount = role.users_count ?? 0;
    const permissionsCount = role.permissions?.length ?? role.permissions_count ?? 0;
    const recentUsers = (role as any).recent_users ?? [];

    const handleCopyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(`${label} copied to clipboard!`);
            setTimeout(() => setCopySuccess(null), 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
            setCopySuccess(`Failed to copy ${label.toLowerCase()}`);
            setTimeout(() => setCopySuccess(null), 3000);
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
                const errorMessage = typeof errors === 'object' && errors.error 
                    ? errors.error 
                    : 'Failed to delete role. Please try again.';
                alert(errorMessage);
            },
        });
    };

    const handleManagePermissions = () => {
        router.get(route('admin.roles.permissions', role.id));
    };

    const handleExportDetails = () => {
        const exportData = {
            id: role.id,
            name: role.name,
            slug: role.slug,
            description: role.description,
            is_system_role: role.is_system_role,
            users_count: usersCount,
            permissions_count: permissionsCount,
            permissions: role.permissions?.map(p => ({
                id: p.id,
                name: p.name,
                display_name: p.display_name,
                module: p.module,
                description: p.description,
            })) || [],
            created_at: role.created_at,
            updated_at: role.updated_at,
            export_date: new Date().toISOString(),
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `role-${role.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success message
        setCopySuccess('Role details exported successfully!');
        setTimeout(() => setCopySuccess(null), 3000);
    };

    // Statistics based on actual data
    const statistics = [
        { 
            label: 'Total Users', 
            value: usersCount, 
            icon: Users,
            description: 'Users assigned to this role',
            color: 'blue'
        },
        { 
            label: 'Permissions', 
            value: permissionsCount, 
            icon: Key,
            description: 'Total permissions granted',
            color: 'purple'
        },
        { 
            label: 'Active Users', 
            value: recentUsers.filter((u: any) => u.status === 'active').length, 
            icon: UserCheck,
            description: 'Currently active users',
            color: 'green'
        },
        { 
            label: 'Role Type', 
            value: role.is_system_role ? 'System' : 'Custom', 
            icon: Shield,
            description: role.is_system_role ? 'Predefined system role' : 'Custom created role',
            color: role.is_system_role ? 'amber' : 'blue'
        },
    ];

    // System role warnings
    const systemWarnings = role.is_system_role ? [
        'System roles cannot be deleted',
        'Changes to system roles may affect system functionality',
        'Some permissions may be restricted for system roles',
    ] : [];

    const groupedPermissions = groupPermissionsByModule(role.permissions);
    const deletable = canDeleteRole(role);

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
                        canDelete={deletable}
                        copied={copied}
                    />

                    {/* Warning for System Roles */}
                    {systemWarnings.length > 0 && (
                        <SystemWarning warnings={systemWarnings} />
                    )}

                    {/* Statistics Cards */}
                    <StatisticsCards 
                        statistics={statistics} 
                        getColorClass={getColorClass} 
                    />

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
                            canDelete={deletable}
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