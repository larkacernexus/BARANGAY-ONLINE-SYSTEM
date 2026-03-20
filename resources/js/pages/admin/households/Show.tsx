// resources/js/Pages/Admin/Households/Show/index.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

import { PageProps } from '@/components/admin/households/show/types';
import { isNew } from '@/components/admin/households/show/utils/helpers';

import { HouseholdHeader } from '@/components/admin/households/show/household/HouseholdHeader';
import { HouseholdSidebar } from '@/components/admin/households/show/household/HouseholdSidebar';
import { StatusAlert } from '@/components/admin/households/show/alerts/StatusAlert';
import { ExpiringPrivilegesAlert } from '@/components/admin/households/show/alerts/ExpiringPrivilegesAlert';
import { DeleteConfirmationDialog } from '@/components/admin/households/show/dialogs/DeleteConfirmationDialog';

import { OverviewTab } from '@/components/admin/households/show/tabs/OverviewTab';
import { MembersTab } from '@/components/admin/households/show/tabs/MembersTab';
import { PrivilegesTab } from '@/components/admin/households/show/tabs/PrivilegesTab';
import { StatisticsTab } from '@/components/admin/households/show/tabs/StatisticsTab';
import { route } from 'ziggy-js';
import { Home, Users, Award, BarChart3, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Ziggy } from '@/ziggy';

export default function ShowHousehold({ household }: PageProps) {
    // State
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showMoreDetails, setShowMoreDetails] = useState(false);

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

    // Calculate privilege statistics
    const allPrivileges = household.household_members?.flatMap(m => m.resident.privileges_list || []) || [];
    const totalPrivileges = allPrivileges.length;
    const activePrivileges = allPrivileges.filter(p => p.status === 'active').length;
    const expiringSoonPrivileges = allPrivileges.filter(p => p.status === 'expiring_soon').length;
    const expiredPrivileges = allPrivileges.filter(p => p.status === 'expired').length;
    const pendingPrivileges = allPrivileges.filter(p => p.status === 'pending').length;
    const membersWithPrivileges = household.household_members?.filter(m => 
        m.resident.privileges_list && m.resident.privileges_list.length > 0
    ).length || 0;

    // Count privileges by code
    const privilegeCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allPrivileges.forEach(p => {
            if (p.status === 'active' || p.status === 'expiring_soon') {
                counts[p.code] = (counts[p.code] || 0) + 1;
            }
        });
        return counts;
    }, [allPrivileges]);

    // Handlers
    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.households.destroy', household.id), {
            preserveScroll: false,
            onFinish: () => setIsDeleting(false),
        });
    };

    const handlePrint = () => {
        window.print();
    };

    // Tabs configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Home className="h-4 w-4" /> },
        { id: 'members', label: `Members (${household.member_count})`, icon: <Users className="h-4 w-4" /> },
        { id: 'privileges', label: `Privileges (${activePrivileges})`, icon: <Award className="h-4 w-4" /> },
        { id: 'statistics', label: 'Statistics', icon: <BarChart3 className="h-4 w-4" /> },
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
                        onReview={() => setActiveTab('privileges')}
                    />

                    {/* Tabs */}
                    <div className="border-b dark:border-gray-700">
                        <nav className="flex space-x-4" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        inline-flex items-center px-3 py-2 text-sm font-medium border-b-2
                                        ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                        }
                                    `}
                                >
                                    {tab.icon}
                                    <span className="ml-2">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {activeTab === 'overview' && <OverviewTab household={household} />}
                            {activeTab === 'members' && <MembersTab household={household} />}
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
                            {activeTab === 'statistics' && (
                                <StatisticsTab 
                                    household={household}
                                    membersWithPrivileges={membersWithPrivileges}
                                    onShowMore={() => setShowMoreDetails(!showMoreDetails)}
                                    showMore={showMoreDetails}
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
                            onShowMore={() => setShowMoreDetails(!showMoreDetails)}
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