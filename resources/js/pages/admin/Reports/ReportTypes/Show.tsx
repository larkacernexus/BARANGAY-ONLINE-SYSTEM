// resources/js/Pages/Admin/Reports/ReportTypes/Show.tsx
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
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
import {
    ArrowLeft,
    Edit,
    Trash2,
    Copy,
    AlertTriangle,
    RefreshCw,
    FileText,
    Target,
    Clock,
    BarChart,
    Tag,
    Hash,
    Sparkles,
    Zap,
    CheckCircle,
    XCircle,
    Printer,
    Check,
    AlertCircle,
    Users,
    Heart,
    Shield,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

// Import components
import { ReportTypeHeader } from '@/components/admin/report-types/show/components/report-type-header';
import { StatusBanner } from '@/components/admin/report-types/show/components/status-banner';
import { RequirementBadges } from '@/components/admin/report-types/show/components/requirement-badges';
import { StatisticsCards } from '@/components/admin/report-types/show/components/statistics-cards';
import { ReportTypeTabs } from '@/components/admin/report-types/show/components/report-type-tabs';
import { DangerZone } from '@/components/admin/report-types/show/components/danger-zone';
import { DeleteConfirmationDialog } from '@/components/admin/report-types/show/components/delete-confirmation-dialog';
import { DuplicateConfirmationDialog } from '@/components/admin/report-types/show/components/duplicate-confirmation-dialog';
import { StatusToggleDialog } from '@/components/admin/report-types/show/components/status-toggle-dialog';

// Import types and utilities
import { 
    getIconComponent, 
    getPriorityIcon, 
    getStatusBadge,
    getStatusIcon,
    getStatusVariant,
    getColorClass,
    formatDate,
    formatDateTime,
    formatShortDate,
    formatTimeAgo,
    isNew,
    getPriorityColor
} from '@/components/admin/report-types/show/utils/helpers';

interface RecentReport {
    id: number;
    report_number: string;
    title: string;
    status: string;
    created_at: string;
    resident?: {
        full_name: string;
    };
}

interface ReportStats {
    total: number;
    pending: number;
    processing: number;
    resolved: number;
    rejected: number;
    byStatus: Record<string, number>;
    averageResolutionDays: number;
}

// Define ReportTypeWithRelations with all required properties
interface ReportTypeWithRelations {
    id: number;
    code: string;
    name: string;
    description: string | null;
    category: string | null;
    subcategory: string | null;
    icon: string;
    color: string;
    priority_level: number;
    resolution_days: number;
    is_active: boolean;
    requires_immediate_action: boolean;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    assigned_to_roles: string[];
    created_at: string;
    updated_at: string;
    community_reports_count: number;
    priority_label: string;
    expected_resolution_date: string;
    priority_color?: string;
    priority_icon?: string;
    required_fields: Array<{
        key: string;
        label: string;
        type: string;
        required: boolean;
        options?: string[];
    }>;
    resolution_steps: Array<{
        step: number;
        action: string;
        description: string;
    }>;
}

// Extend InertiaPageProps with index signature
interface ShowPageProps extends InertiaPageProps {
    reportType: ReportTypeWithRelations;
    recentReports: RecentReport[];
    reportStats: ReportStats;
    [key: string]: unknown;
}

export default function ReportTypeShow() {
    const { props } = usePage<ShowPageProps>();
    const { reportType, recentReports = [], reportStats } = props;

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Get the icon component
    const IconComponent = getIconComponent(reportType.icon || 'alert-circle');

    // Handle back navigation
    const handleBack = () => {
        router.visit(route('admin.report-types.index'));
    };

    // Handle edit
    const handleEdit = () => {
        router.visit(route('admin.report-types.edit', reportType.id));
    };

    // Handle delete
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.report-types.destroy', reportType.id), {
            onSuccess: () => {
                toast.success('Report type deleted successfully');
                router.visit(route('admin.report-types.index'));
            },
            onError: () => {
                toast.error('Failed to delete report type');
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
        router.post(route('report-types.duplicate', reportType.id), {}, {
            onSuccess: (response: any) => {
                toast.success('Report type duplicated successfully');
                if (response.props?.reportType?.id) {
                    router.visit(route('admin.report-types.show', response.props.reportType.id));
                } else {
                    router.visit(route('admin.report-types.index'));
                }
            },
            onError: () => {
                toast.error('Failed to duplicate report type');
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
        router.post(route('report-types.toggle-status', reportType.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Report type ${reportType.is_active ? 'deactivated' : 'activated'} successfully`);
                setShowStatusDialog(false);
            },
            onError: () => {
                toast.error('Failed to toggle status');
            }
        });
    };

    // Handle toggle immediate action
    const handleToggleImmediateAction = () => {
        router.post(route('report-types.toggle-immediate-action', reportType.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Immediate action flag ${reportType.requires_immediate_action ? 'disabled' : 'enabled'} successfully`);
            },
            onError: () => {
                toast.error('Failed to toggle immediate action flag');
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

    // Calculate resolution rate
    const resolutionRate = reportStats?.total 
        ? Math.round((reportStats.resolved / reportStats.total) * 100) 
        : 0;

    // Statistics for cards
    const statistics = [
        { 
            label: 'Total Reports', 
            value: reportType.community_reports_count || 0, 
            icon: FileText,
            description: 'Reports filed under this type',
            color: 'blue'
        },
        { 
            label: 'Priority Level', 
            value: reportType.priority_label || `Level ${reportType.priority_level}`, 
            icon: Target,
            description: `Priority ${reportType.priority_level} of 4`,
            color: getPriorityColor(reportType.priority_level)
        },
        { 
            label: 'Resolution Time', 
            value: `${reportType.resolution_days} days`, 
            icon: Clock,
            description: `Expected resolution time`,
            color: 'purple'
        },
        { 
            label: 'Resolution Rate', 
            value: `${resolutionRate}%`, 
            icon: BarChart,
            description: `${reportStats?.resolved || 0} of ${reportStats?.total || 0} resolved`,
            color: 'green'
        },
    ];

    return (
        <AppLayout
            title={`Report Type: ${reportType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Report Types', href: '/report-types' },
                { title: reportType.name, href: `/report-types/${reportType.id}` }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <ReportTypeHeader
                        reportType={reportType as any}
                        isNew={isNew(reportType.created_at)}
                        onBack={handleBack}
                        onCopyLink={handleCopyLink}
                        onEdit={handleEdit}
                        onDuplicate={() => setShowDuplicateDialog(true)}
                        onToggleStatus={() => setShowStatusDialog(true)}
                        onToggleImmediateAction={handleToggleImmediateAction}
                        onDelete={() => setShowDeleteDialog(true)}
                        getStatusBadge={getStatusBadge}
                        getStatusIcon={getStatusIcon}
                        getStatusVariant={getStatusVariant}
                    />

                    {/* Status Banner - For report types with no reports or immediate action required */}
                    {reportType.requires_immediate_action && (
                        <StatusBanner reportType={reportType as any} />
                    )}

                    {/* Requirement Badges */}
                    <RequirementBadges reportType={reportType as any} />

                    {/* Statistics Cards */}
                    <StatisticsCards 
                        statistics={statistics} 
                        getColorClass={getColorClass} 
                    />

                    {/* Tabs Navigation */}
                    <ReportTypeTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        requiredFieldsCount={reportType.required_fields?.length || 0}
                        resolutionStepsCount={reportType.resolution_steps?.length || 0}
                        recentReportsCount={recentReports.length}
                    />

                    {/* Tab Content */}
                    <div className="pt-2">
                        <ReportTypeTabs.Content
                            activeTab={activeTab}
                            reportType={reportType}
                            recentReports={recentReports}
                            reportStats={reportStats}
                            IconComponent={IconComponent}
                            getPriorityIcon={getPriorityIcon}
                            formatDate={formatDate}
                            formatDateTime={formatDateTime}
                            formatShortDate={formatShortDate}
                            formatTimeAgo={formatTimeAgo}
                        />
                    </div>

                    {/* Danger Zone */}
                    <DangerZone
                        reportType={reportType}
                        onDelete={() => setShowDeleteDialog(true)}
                    />
                </div>

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    reportType={reportType}
                    isDeleting={isDeleting}
                    onDelete={handleDelete}
                />

                {/* Duplicate Confirmation Dialog */}
                <DuplicateConfirmationDialog
                    open={showDuplicateDialog}
                    onOpenChange={setShowDuplicateDialog}
                    reportType={reportType}
                    isDuplicating={isDuplicating}
                    onDuplicate={handleDuplicate}
                />

                {/* Status Toggle Confirmation Dialog */}
                <StatusToggleDialog
                    open={showStatusDialog}
                    onOpenChange={setShowStatusDialog}
                    reportType={reportType}
                    onToggle={handleToggleStatus}
                />
            </TooltipProvider>
        </AppLayout>
    );
}