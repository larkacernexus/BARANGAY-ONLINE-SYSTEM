// resources/js/Pages/Admin/Puroks/Show.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
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
    TooltipProvider,
} from '@/components/ui/tooltip';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { parseISO, differenceInDays } from 'date-fns';
import {
    Info,
    Home,
    Users,
    BarChart3,
    Award,
    Hash,
    Loader2,
} from 'lucide-react';

// Import components
import { PurokHeader } from '@/components/admin/puroks/show/components/purok-header';
import { StatsGrid } from '@/components/admin/puroks/show/components/stats-grid';
import { PurokInformationCard } from '@/components/admin/puroks/show/components/purok-information-card';
import { PurokLeaderCard } from '@/components/admin/puroks/show/components/purok-leader-card';
import { PurokStatisticsCard } from '@/components/admin/puroks/show/components/purok-statistics-card';
import { DemographicsCard } from '@/components/admin/puroks/show/components/demographics-card';
import { RecentActivitiesCard } from '@/components/admin/puroks/show/components/recent-activities-card';
import { QuickActionsCard } from '@/components/admin/puroks/show/components/quick-actions-card';
import { SystemInfoCard } from '@/components/admin/puroks/show/components/system-info-card';
import { HouseholdsTable } from '@/components/admin/puroks/show/components/households-table';
import { ResidentsTable } from '@/components/admin/puroks/show/components/residents-table';
import { DemographicsDetailsCard } from '@/components/admin/puroks/show/components/demographics-details-card';

// Import types and utilities
import { PurokShowProps } from '@/components/admin/puroks/show/types';
import { formatDate, getStatusColor, getStatusIcon } from '@/components/admin/puroks/show/utils/helpers';

export default function PurokShow({ 
    purok, 
    stats, 
    recentHouseholds, 
    recentResidents, 
    demographics,
    households,
    residents 
}: PurokShowProps) {
    
    const [copied, setCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const isNew = useMemo(() => {
        const created = parseISO(purok.created_at);
        const now = new Date();
        const diffDays = differenceInDays(now, created);
        return diffDays < 7;
    }, [purok.created_at]);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/admin/puroks/${purok.id}`, {
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
            purok,
            demographics,
            households: households.total,
            residents: residents.total
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `purok-${purok.slug}-data.json`;
        a.click();
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> },
        { id: 'households', label: 'Households', icon: <Home className="h-4 w-4" />, count: households.total },
        { id: 'residents', label: 'Residents', icon: <Users className="h-4 w-4" />, count: residents.total },
        { id: 'demographics', label: 'Demographics', icon: <BarChart3 className="h-4 w-4" /> },
    ];

    return (
        <>
            <Head title={`Purok: ${purok.name}`} />
            
            <AppLayout
                title={`Purok: ${purok.name}`}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Puroks', href: '/admin/puroks' },
                    { title: purok.name, href: `/admin/puroks/${purok.id}` }
                ]}
            >
                <TooltipProvider>
                    <div className="space-y-6">
                        {/* Header with Actions */}
                        <PurokHeader
                            purok={purok}
                            isNew={isNew}
                            onCopyLink={handleCopyLink}
                            onPrint={handlePrint}
                            onExport={handleExport}
                            onDelete={() => setShowDeleteDialog(true)}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                        />

                        {/* Stats Grid */}
                        <StatsGrid stats={stats} />

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
                                        {/* Left Column - Purok Details */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <PurokInformationCard purok={purok} />
                                            <PurokLeaderCard purok={purok} />
                                        </div>

                                        {/* Right Column - Statistics & Quick Actions */}
                                        <div className="space-y-6">
                                            <PurokStatisticsCard purok={purok} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} />
                                            <DemographicsCard demographics={demographics} />
                                            <RecentActivitiesCard 
                                                recentHouseholds={recentHouseholds}
                                                recentResidents={recentResidents}
                                                formatDate={formatDate}
                                            />
                                            <QuickActionsCard 
                                                purok={purok}
                                                onDelete={() => setShowDeleteDialog(true)}
                                            />
                                            <SystemInfoCard purok={purok} formatDate={formatDate} />
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Households Tab */}
                                <TabsContent value="households">
                                    <HouseholdsTable 
                                        households={households} 
                                        purokId={purok.id}
                                        purokName={purok.name}
                                    />
                                </TabsContent>

                                {/* Residents Tab */}
                                <TabsContent value="residents">
                                    <ResidentsTable 
                                        residents={residents} 
                                        purokId={purok.id}
                                        purokName={purok.name}
                                    />
                                </TabsContent>

                                {/* Demographics Tab */}
                                <TabsContent value="demographics">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <DemographicsCard demographics={demographics} />
                                        <DemographicsDetailsCard demographics={demographics} />
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </TooltipProvider>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent className="dark:bg-gray-900">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-gray-100">Delete Purok</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                                Are you sure you want to delete purok "{purok.name}"? This action cannot be undone and will remove all associated data including households and residents.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Purok'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        </>
    );
}