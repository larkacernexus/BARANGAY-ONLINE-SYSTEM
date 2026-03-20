import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO, differenceInDays } from 'date-fns';
import AppLayout from '@/layouts/admin-app-layout';

import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    TooltipProvider,
} from '@/components/ui/tooltip';
import {
    Users,
    Percent,
    Shield,
    CheckCircle,
    XCircle,
    Clock,
    Info,
    BarChart3,
    UserCheck,
} from 'lucide-react';

// ========== INTERFACES ==========
interface DiscountType {
    id: number;
    name: string;
    code: string;
    default_percentage: number;  // Added to match AssignModal's expectation
}

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    contact_number?: string;
    email?: string;
    age?: number;
    gender?: string;
}

interface ResidentPrivilege {
    id: number;
    resident_id: number;
    privilege_id: number;
    id_number?: string;
    verified_at: string | null;
    expires_at: string | null;
    created_at: string;
    resident: Resident;
}

interface Privilege {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    discount_type_id: number;
    default_discount_percentage: string | number;
    requires_id_number: boolean;
    requires_verification: boolean;
    validity_years: number | null;
    created_at: string;
    updated_at: string;
    discount_type?: DiscountType;
    residents_count?: number;
    active_residents_count?: number;
    pending_count?: number;
    expired_count?: number;
}

interface Props {
    privilege: Privilege;
    recentAssignments: ResidentPrivilege[];
    can: {
        edit: boolean;
        delete: boolean;
        assign: boolean;
    };
}

// ========== DEBOUNCE UTILITY ==========
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ========== HELPER FUNCTIONS ==========
const formatDate = (dateString: string | null, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, includeTime ? 'MMM dd, yyyy hh:mm a' : 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

const getStatusColor = (isActive: boolean) => {
    return isActive 
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
};

const getStatusIcon = (isActive: boolean) => {
    return isActive 
        ? <CheckCircle className="h-3 w-3" />
        : <XCircle className="h-3 w-3" />;
};

const getAssignmentStatusBadge = (assignment: ResidentPrivilege) => {
    if (!assignment.verified_at) {
        return (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pending
            </Badge>
        );
    }
    
    if (assignment.expires_at && new Date(assignment.expires_at) < new Date()) {
        return (
            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Expired
            </Badge>
        );
    }
    
    return (
        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
        </Badge>
    );
};

const getFullName = (resident: Resident) => {
    let name = `${resident.first_name}`;
    if (resident.middle_name) {
        name += ` ${resident.middle_name.charAt(0)}.`;
    }
    name += ` ${resident.last_name}`;
    return name;
};

// ========== IMPORT COMPONENTS ==========
import { RecentAssignmentsTable } from '@/components/admin/privileges/show/components/recent-assignments-table';
import { RequirementsCard } from '@/components/admin/privileges/show/components/requirements-card';
import { QuickActionsCard } from '@/components/admin/privileges/show/components/quick-actions-card';
import { SystemInfoCard } from '@/components/admin/privileges/show/components/system-info-card';
import { UsageStatisticsCard } from '@/components/admin/privileges/show/components/usage-statistics-card';
import { AssignModal } from '@/components/admin/privileges/show/components/assign-modal';
import { PrivilegeHeader } from '@/components/admin/privileges/show/components/privilege-header';
import { PrivilegeInfoCard } from '@/components/admin/privileges/show/components/privilege-info-card';
import { AllAssignmentsTable } from '@/components/admin/privileges/show/components/all-assignments-table';
import { RequirementsTabContent } from '@/components/admin/privileges/show/components/requirements-tab-content';
import { AnalyticsTabContent } from '@/components/admin/privileges/show/components/analytics-tab-content';
import { DeleteConfirmationDialog } from '@/components/admin/privileges/show/components/delete-confirmation-dialog';

// ========== MAIN COMPONENT ==========
export default function Show({ privilege, recentAssignments, can }: Props) {
    const [copied, setCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAssignModal, setShowAssignModal] = useState(false);

    const isNew = useMemo(() => {
        const created = parseISO(privilege.created_at);
        const now = new Date();
        const diffDays = differenceInDays(now, created);
        return diffDays < 7;
    }, [privilege.created_at]);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.privileges.destroy', privilege.id), {
            onFinish: () => {
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

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const data = {
            privilege,
            recentAssignments
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `privilege-${privilege.code}-data.json`;
        a.click();
    };

    // Function to refresh data after successful assignment
    const refreshData = () => {
        router.reload({ 
            only: ['privilege', 'recentAssignments'], // Only reload these props
            preserveState: true,
            preserveScroll: true 
        });
    };

    const stats = [
        {
            title: 'Status',
            value: privilege.is_active ? 'Active' : 'Inactive',
            icon: privilege.is_active ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />,
            color: privilege.is_active ? 'green' as const : 'gray' as const,
            description: undefined
        },
        {
            title: 'Discount',
            value: `${privilege.default_discount_percentage}%`,
            icon: <Percent className="h-5 w-5" />,
            description: privilege.discount_type?.name || 'No type',
            color: 'blue' as const
        },
        {
            title: 'Total Assignments',
            value: privilege.residents_count || 0,
            icon: <Users className="h-5 w-5" />,
            color: 'purple' as const,
            description: undefined
        },
        {
            title: 'Active Now',
            value: privilege.active_residents_count || 0,
            icon: <UserCheck className="h-5 w-5" />,
            description: 'Verified & active',
            color: 'amber' as const
        }
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> },
        { id: 'assignments', label: 'Assignments', icon: <Users className="h-4 w-4" />, count: privilege.residents_count },
        { id: 'requirements', label: 'Requirements', icon: <Shield className="h-4 w-4" /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    ];

    return (
        <TooltipProvider>
            <Head title={`Privilege: ${privilege.name}`} />
            
            <AppLayout
                title={`Privilege: ${privilege.name}`}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Privileges', href: '/admin/privileges' },
                    { title: privilege.name, href: `/admin/privileges/${privilege.id}` }
                ]}
            >
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <PrivilegeHeader
                        privilege={privilege}
                        isNew={isNew}
                        copied={copied}
                        can={can}
                        onCopyLink={handleCopyLink}
                        onPrint={handlePrint}
                        onExport={handleExport}
                        onAssign={() => setShowAssignModal(true)}
                        onDelete={() => setShowDeleteDialog(true)}
                    />


                    {/* Tabs Navigation */}
                    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                            {tabs.map(tab => (
                                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <Badge variant="secondary" className="ml-1 text-xs">
                                            {tab.count}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="mt-6">
                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid gap-6 lg:grid-cols-3">
                                    {/* Left Column - Privilege Details */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Privilege Information Card */}
                                        <PrivilegeInfoCard privilege={privilege} />

                                        {/* Recent Assignments Table */}
                                        <RecentAssignmentsTable 
                                            assignments={recentAssignments} 
                                            privilegeId={privilege.id}
                                            privilegeName={privilege.name}
                                            onAssignClick={() => setShowAssignModal(true)}
                                        />
                                    </div>

                                    {/* Right Column - Statistics & Quick Actions */}
                                    <div className="space-y-6">
                                        {/* Requirements Card */}
                                        <RequirementsCard privilege={privilege} />

                                        {/* Usage Statistics Card */}
                                        <UsageStatisticsCard privilege={privilege} />

                                        {/* Quick Actions Card */}
                                        <QuickActionsCard 
                                            privilege={privilege}
                                            onDelete={() => setShowDeleteDialog(true)}
                                            onAssign={() => setShowAssignModal(true)}
                                        />

                                        {/* System Information Card */}
                                        <SystemInfoCard privilege={privilege} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Assignments Tab */}
                            <TabsContent value="assignments">
                                <AllAssignmentsTable
                                    assignments={recentAssignments}
                                    canAssign={can.assign}
                                    onAssignClick={() => setShowAssignModal(true)}
                                />
                            </TabsContent>

                            {/* Requirements Tab */}
                            <TabsContent value="requirements">
                                <RequirementsTabContent privilege={privilege} />
                            </TabsContent>

                            {/* Analytics Tab */}
                            <TabsContent value="analytics">
                                <AnalyticsTabContent
                                    privilege={privilege}
                                    recentAssignments={recentAssignments}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    privilege={privilege}
                    isDeleting={isDeleting}
                    onDelete={handleDelete}
                />

                {/* Assign Modal */}
                <AssignModal 
                    isOpen={showAssignModal}
                    onClose={() => setShowAssignModal(false)}
                    privilege={privilege}
                    onSuccess={refreshData}
                />
            </AppLayout>
        </TooltipProvider>
    );
}