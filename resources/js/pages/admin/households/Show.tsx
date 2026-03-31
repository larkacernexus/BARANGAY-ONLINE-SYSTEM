// resources/js/Pages/Admin/Households/Show/index.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useCallback } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { route } from 'ziggy-js';
import { 
    Home, 
    Users, 
    Award, 
    BarChart3, 
    Loader2, 
    ArrowLeft,
    FileText,
    Receipt,
    CreditCard,
    Calendar,
    History,
    AlertCircle,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Import types from the shared types file
import { 
    PageProps, 
    Household, 
    HouseholdMember,
    Privilege,
    Fee,
    Payment,
    Clearance,
    ResidentDocument,
    ActivityLog
} from '@/types/admin/households/household.types';

// Import components
import { HouseholdHeader } from '@/components/admin/households/show/household/HouseholdHeader';
import { HouseholdSidebar } from '@/components/admin/households/show/household/HouseholdSidebar';
import { StatusAlert } from '@/components/admin/households/show/alerts/StatusAlert';
import { ExpiringPrivilegesAlert } from '@/components/admin/households/show/alerts/ExpiringPrivilegesAlert';
import { DeleteConfirmationDialog } from '@/components/admin/households/show/dialogs/DeleteConfirmationDialog';

import { OverviewTab } from '@/components/admin/households/show/tabs/OverviewTab';
import { MembersTab } from '@/components/admin/households/show/tabs/MembersTab';
import { PrivilegesTab } from '@/components/admin/households/show/tabs/PrivilegesTab';
import { StatisticsTab } from '@/components/admin/households/show/tabs/StatisticsTab';
import { FeesTab } from '@/components/admin/households/show/tabs/FeesTab';
import { ClearancesTab } from '@/components/admin/households/show/tabs/ClearancesTab';
import { PaymentsTab } from '@/components/admin/households/show/tabs/PaymentsTab';
import { ActivityLogTab } from '@/components/admin/households/show/tabs/ActivityLogTab';
import { ResidentDocumentsTab } from '@/components/admin/households/show/tabs/ResidentDocumentsTab';

// Import utilities from types file
import { getStatusColor, getStatusLabel, formatDate } from '@/types/admin/households/household.types';

// Extended props interface using imported types
interface ExtendedPageProps extends PageProps {
    household: Household & {
        household_members?: (HouseholdMember & {
            resident: {
                id: number;
                first_name: string;
                last_name: string;
                middle_name?: string;
                privileges_list?: Privilege[];
                photo_url?: string;
            };
        })[];
    };
    availableResidents?: any[];
    headId?: number | null;
    fees?: Fee[];
    payments?: Payment[];
    clearances?: Clearance[];
    activities?: ActivityLog[];
    residentDocuments?: ResidentDocument[];
}

// Type for privilege counts
interface PrivilegeCounts {
    [code: string]: number;
}

export default function ShowHousehold({ 
    household, 
    availableResidents = [], 
    headId = null,
    fees = [],
    payments = [],
    clearances = [],
    activities = [],
    residentDocuments = []
}: ExtendedPageProps) {
    // State
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showMoreDetails, setShowMoreDetails] = useState(false);

    // Memoized privilege calculations
    const {
        allPrivileges,
        totalPrivileges,
        activePrivileges,
        expiringSoonPrivileges,
        expiredPrivileges,
        pendingPrivileges,
        membersWithPrivileges,
        privilegeCounts
    } = useMemo(() => {
        const privileges = household.household_members?.flatMap(m => m.resident.privileges_list || []) || [];
        
        return {
            allPrivileges: privileges,
            totalPrivileges: privileges.length,
            activePrivileges: privileges.filter(p => p.status === 'active').length,
            expiringSoonPrivileges: privileges.filter(p => p.status === 'expiring_soon').length,
            expiredPrivileges: privileges.filter(p => p.status === 'expired').length,
            pendingPrivileges: privileges.filter(p => p.status === 'pending').length,
            membersWithPrivileges: household.household_members?.filter(m => 
                m.resident.privileges_list && m.resident.privileges_list.length > 0
            ).length || 0,
            privilegeCounts: privileges.reduce((counts: PrivilegeCounts, p) => {
                if (p.status === 'active' || p.status === 'expiring_soon') {
                    counts[p.code] = (counts[p.code] || 0) + 1;
                }
                return counts;
            }, {})
        };
    }, [household.household_members]);

    // Memoized fee calculations
    const feeStats = useMemo(() => ({
        totalFees: fees.length,
        paidFees: fees.filter(f => f.status === 'paid').length,
        pendingFees: fees.filter(f => f.status === 'pending' || f.status === 'issued').length,
        overdueFees: fees.filter(f => f.status === 'overdue').length,
        totalAmount: fees.reduce((sum, f) => sum + (f.total_amount || 0), 0),
        totalPaid: fees.reduce((sum, f) => sum + (f.amount_paid || 0), 0)
    }), [fees]);

    // Memoized payment calculations
    const paymentStats = useMemo(() => ({
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + (p.total_amount || 0), 0),
        cashPayments: payments.filter(p => p.payment_method === 'cash').length,
        onlinePayments: payments.filter(p => ['gcash', 'maya', 'online'].includes(p.payment_method)).length
    }), [payments]);

    // Memoized clearance calculations
    const clearanceStats = useMemo(() => ({
        totalClearances: clearances.length,
        pendingClearances: clearances.filter(c => c.status === 'pending').length,
        approvedClearances: clearances.filter(c => c.status === 'approved').length,
        releasedClearances: clearances.filter(c => c.status === 'released').length
    }), [clearances]);

    // Memoized document calculations
    const documentStats = useMemo(() => ({
        totalDocuments: residentDocuments.length,
        activeDocuments: residentDocuments.filter(d => d.status === 'active').length,
        expiredDocuments: residentDocuments.filter(d => d.status === 'expired').length
    }), [residentDocuments]);

    // Handlers
    const handleCopyLink = useCallback(() => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, []);

    const handleDelete = useCallback(() => {
        setIsDeleting(true);
        router.delete(route('admin.households.destroy', household.id), {
            preserveScroll: false,
            onFinish: () => setIsDeleting(false),
        });
    }, [household.id]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId);
    }, []);

    const handleShowMoreToggle = useCallback(() => {
        setShowMoreDetails(prev => !prev);
    }, []);

    // Null check
    if (!household) {
        return (
            <AppLayout
                title="Loading Household..."
                breadcrumbs={[
                    { title: 'Dashboard', href: route('admin.dashboard') },
                    { title: 'Households', href: route('admin.households.index') },
                    { title: 'Loading...', href: '#' }
                ]}
            >
                <Head title="Loading Household..." />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500 dark:text-blue-400 mx-auto" />
                        <p className="text-gray-600 dark:text-gray-400">Loading household details...</p>
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('admin.households.index'))}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Households
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Tabs configuration with counts
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Home className="h-4 w-4" />, count: null },
        { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" />, count: household.member_count },
        { id: 'privileges', label: 'Privileges', icon: <Award className="h-4 w-4" />, count: activePrivileges },
        { id: 'fees', label: 'Fees', icon: <Receipt className="h-4 w-4" />, count: feeStats.pendingFees },
        { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" />, count: paymentStats.totalPayments },
        { id: 'clearances', label: 'Clearances', icon: <Calendar className="h-4 w-4" />, count: clearanceStats.pendingClearances },
        { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" />, count: documentStats.totalDocuments },
        { id: 'statistics', label: 'Statistics', icon: <BarChart3 className="h-4 w-4" />, count: null },
        { id: 'history', label: 'Activity Log', icon: <History className="h-4 w-4" />, count: activities.length },
    ];

    return (
        <AppLayout
            title={`${household.household_number} - Household Details`}
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Households', href: route('admin.households.index') },
                { title: household.household_number, href: route('admin.households.show', household.id) }
            ]}
        >
            <Head title={`${household.household_number} - Household Details`} />
            
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <HouseholdHeader 
                        household={household}
                        activePrivileges={activePrivileges}
                        onCopyLink={handleCopyLink}
                        onPrint={handlePrint}
                        onDelete={() => setShowDeleteDialog(true)}
                        copied={copied}
                    />

                    {/* Status Alerts */}
                    {household.status === 'inactive' && (
                        <StatusAlert householdId={household.id} />
                    )}

                    <ExpiringPrivilegesAlert 
                        count={expiringSoonPrivileges}
                        onReview={() => handleTabChange('privileges')}
                    />

                    {/* Tabs */}
                    <div className="border-b dark:border-gray-700 overflow-x-auto">
                        <nav className="flex space-x-2 sm:space-x-4" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`
                                        inline-flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                                        ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                        }
                                    `}
                                >
                                    {tab.icon}
                                    <span className="ml-2">{tab.label}</span>
                                    {tab.count !== null && tab.count > 0 && (
                                        <span className={`
                                            ml-2 px-1.5 py-0.5 text-xs rounded-full
                                            ${activeTab === tab.id
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }
                                        `}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {activeTab === 'overview' && <OverviewTab household={household} />}
                            {activeTab === 'members' && (
                                <MembersTab 
                                    household={household} 
                                    availableResidents={availableResidents}
                                    headId={headId}
                                />
                            )}
                            {activeTab === 'privileges' && (
                                <PrivilegesTab 
                                    household={household}
                                    totalPrivileges={totalPrivileges}
                                    activePrivileges={activePrivileges}
                                    expiringSoonPrivileges={expiringSoonPrivileges}
                                    expiredPrivileges={expiredPrivileges}
                                    pendingPrivileges={pendingPrivileges}
                                    privilegeCounts={privilegeCounts}
                                />
                            )}
                            {activeTab === 'fees' && (
                                <FeesTab 
                                    householdId={household.id}
                                    fees={fees}
                                    totalFees={feeStats.totalFees}
                                    paidFees={feeStats.paidFees}
                                    pendingFees={feeStats.pendingFees}
                                    overdueFees={feeStats.overdueFees}
                                    totalAmount={feeStats.totalAmount}
                                    totalPaid={feeStats.totalPaid}
                                />
                            )}
                            {activeTab === 'payments' && (
                                <PaymentsTab 
                                    householdId={household.id}
                                    payments={payments}
                                    totalPayments={paymentStats.totalPayments}
                                    totalAmount={paymentStats.totalAmount}
                                    cashPayments={paymentStats.cashPayments}
                                    onlinePayments={paymentStats.onlinePayments}
                                />
                            )}
                            {activeTab === 'clearances' && (
                                <ClearancesTab 
                                    householdId={household.id}
                                    clearances={clearances}
                                    totalClearances={clearanceStats.totalClearances}
                                    pendingClearances={clearanceStats.pendingClearances}
                                    approvedClearances={clearanceStats.approvedClearances}
                                    releasedClearances={clearanceStats.releasedClearances}
                                />
                            )}
                            {activeTab === 'documents' && (
                                <ResidentDocumentsTab 
                                    householdId={household.id}
                                    documents={residentDocuments}
                                    totalDocuments={documentStats.totalDocuments}
                                    activeDocuments={documentStats.activeDocuments}
                                    expiredDocuments={documentStats.expiredDocuments}
                                />
                            )}
                            {activeTab === 'statistics' && (
                                <StatisticsTab 
                                    household={household}
                                    membersWithPrivileges={membersWithPrivileges}
                                    onShowMore={handleShowMoreToggle}
                                    showMore={showMoreDetails}
                                />
                            )}
                            {activeTab === 'history' && (
                                <ActivityLogTab 
                                    householdId={household.id}
                                    activities={activities}
                                    totalActivities={activities.length}
                                />
                            )}
                        </div>

                        {/* Right Column - Sidebar */}
                        <HouseholdSidebar 
                            household={household}
                            activePrivileges={activePrivileges}
                            onCopyLink={handleCopyLink}
                            onPrint={handlePrint}
                            onDelete={() => setShowDeleteDialog(true)}
                            onShowMore={handleShowMoreToggle}
                            showMore={showMoreDetails}
                        />
                    </div>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900 dark:bg-gray-900">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Delete this household
                                    </div>
                                    <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        This will permanently delete the household record and all associated data. This action cannot be undone.
                                    </div>
                                </div>
                                <Button 
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Household
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                    householdNumber={household.household_number}
                />
            </TooltipProvider>
        </AppLayout>
    );
}