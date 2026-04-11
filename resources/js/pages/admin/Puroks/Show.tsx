import AppLayout from '@/layouts/admin-app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    Hash,
    Loader2,
    ArrowLeft,
    Link as LinkIcon,
    Printer,
    Edit,
    Trash2,
    Check,
    Download,
    MapPin,
    XCircle,
    HelpCircle,
    Sparkles,
    Award,
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Import Admin Tabs Component
import { AdminTabsWithContent, AdminTabPanel } from '@/components/adminui/admin-tabs';

// Import components
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
import { ResidentPrivilegesCard } from '@/components/admin/puroks/show/components/ResidentPrivilegesCard';

// Import types and utilities
import { Purok, PurokStats, Household, Resident, PaginatedData } from '@/types/admin/puroks/purok';
import { formatDate, getStatusColor, getStatusIcon } from '@/components/admin/puroks/show/utils/helpers';

interface DemographicsData {
    gender: {
        male: number;
        female: number;
        other?: number;
    };
    ageGroups: {
        '0-17': number;
        '18-30': number;
        '31-59': number;
        '60+': number;
    };
    civilStatus: {
        single: number;
        married: number;
        widowed: number;
        divorced: number;
    };
    occupation: {
        employed: number;
        unemployed: number;
        student: number;
        retired: number;
    };
    education: {
        elementary: number;
        highSchool: number;
        college: number;
        postgraduate: number;
        none: number;
    };
}

interface PrivilegeSummary {
    id: number;
    name: string;
    code: string;
    count: number;
    discountPercentage: number;
}

interface PurokShowProps {
    purok: Purok;
    stats: PurokStats;
    recentHouseholds: Household[];
    recentResidents: Resident[];
    demographics: DemographicsData;
    households: PaginatedData<Household>;
    residents: PaginatedData<Resident>;
    privilegeSummary?: PrivilegeSummary[];
}

export default function PurokShow({ 
    purok, 
    stats, 
    recentHouseholds, 
    recentResidents, 
    demographics,
    households,
    residents,
    privilegeSummary = []
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
            privilegeSummary,
            households: households.total,
            residents: residents.total
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `purok-${purok.slug}-data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
            id: 'households', 
            label: 'Households', 
            icon: <Home className="h-4 w-4" />,
            count: households.total 
        },
        { 
            id: 'residents', 
            label: 'Residents', 
            icon: <Users className="h-4 w-4" />,
            count: residents.total 
        },
        { 
            id: 'demographics', 
            label: 'Demographics', 
            icon: <BarChart3 className="h-4 w-4" />,
        },
        { 
            id: 'privileges', 
            label: 'Privileges', 
            icon: <Award className="h-4 w-4" />,
            count: privilegeSummary.length
        },
    ];

    // Get status badge variant
    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'active':
                return 'default';
            case 'inactive':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    // Calculate total residents with privileges
    const residentsWithPrivileges = useMemo(() => {
        return residents.data.filter((resident: any) => 
            resident.has_privileges === true || 
            (resident.privileges_list && resident.privileges_list.length > 0)
        ).length;
    }, [residents.data]);

    // Calculate total privileges assigned
    const totalPrivilegesAssigned = useMemo(() => {
        return privilegeSummary.reduce((sum, p) => sum + p.count, 0);
    }, [privilegeSummary]);

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
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/admin/puroks">
                                    <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:bg-gray-900">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight line-clamp-2 dark:text-gray-100 uppercase">
                                        Purok {purok.name}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <Badge variant={getStatusVariant(purok.status)} className="flex items-center gap-1">
                                            {purok.status === 'active' ? (
                                                <Check className="h-3 w-3" />
                                            ) : purok.status === 'inactive' ? (
                                                <XCircle className="h-3 w-3" />
                                            ) : (
                                                <HelpCircle className="h-3 w-3" />
                                            )}
                                            {purok.status}
                                        </Badge>
                                        
                                        {isNew && (
                                            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white border-none">
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                New
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300 font-mono">
                                            <Hash className="h-3 w-3 mr-1" />
                                            {purok.id}
                                        </Badge>
                                        <div className="flex items-center gap-3 ml-1 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-tighter">
                                            <span className="flex items-center gap-1 leading-none">
                                                <MapPin className="h-3 w-3" />
                                                {purok.location || 'No location set'}
                                            </span>
                                            <span className="flex items-center gap-1 leading-none">
                                                <Users className="h-3 w-3" />
                                                {residents.total} RESIDENTS
                                            </span>
                                            {totalPrivilegesAssigned > 0 && (
                                                <span className="flex items-center gap-1 leading-none text-amber-600 dark:text-amber-400">
                                                    <Award className="h-3 w-3" />
                                                    {totalPrivilegesAssigned} PRIVILEGES
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Action Buttons */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyLink}
                                    className="flex-1 sm:flex-none h-9 dark:border-gray-600 dark:text-gray-300"
                                >
                                    {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                                    {copied ? 'Copied' : 'Link'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="flex-1 sm:flex-none h-9 dark:border-gray-600 dark:text-gray-300"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                    className="flex-1 sm:flex-none h-9 dark:border-gray-600 dark:text-gray-300"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                                <Link href={`/admin/puroks/${purok.id}/edit`} className="flex-1 sm:flex-none">
                                    <Button variant="outline" size="sm" className="w-full h-9 dark:border-gray-600 dark:text-gray-300">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <StatsGrid stats={stats} />

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
                            {/* Overview Tab */}
                            <AdminTabPanel value="overview">
                                <div className="grid gap-6 lg:grid-cols-3">
                                    {/* Left Column - Purok Details */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Google Maps Section - Embedded Map */}
                                        <PurokInformationCard purok={purok} />
                                        <PurokLeaderCard purok={purok} />
                                    </div>

                                    {/* Right Column - Statistics & Quick Actions */}
                                    <div className="space-y-6">
                                        <PurokStatisticsCard 
                                            purok={purok} 
                                            getStatusColor={getStatusColor} 
                                            getStatusIcon={getStatusIcon} 
                                        />
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
                            </AdminTabPanel>

                            {/* Households Tab */}
                            <AdminTabPanel value="households">
                                <HouseholdsTable 
                                    households={households} 
                                    purokId={purok.id}
                                    purokName={purok.name}
                                />
                            </AdminTabPanel>

                            {/* Residents Tab */}
                            <AdminTabPanel value="residents">
                                <ResidentsTable 
                                    residents={residents} 
                                    purokId={purok.id}
                                    purokName={purok.name}
                                />
                            </AdminTabPanel>

                            {/* Demographics Tab */}
                            <AdminTabPanel value="demographics">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <DemographicsCard demographics={demographics} />
                                    <DemographicsDetailsCard demographics={demographics} />
                                </div>
                            </AdminTabPanel>

                            {/* Privileges Tab */}
                            <AdminTabPanel value="privileges">
                                <div className="space-y-6">
                                    {/* Privileges Summary Stats */}
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Privilege Types</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{privilegeSummary.length}</p>
                                                </div>
                                                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                                                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Privileges Assigned</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalPrivilegesAssigned}</p>
                                                </div>
                                                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Residents with Privileges</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{residentsWithPrivileges}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        out of {residents.total} total residents
                                                    </p>
                                                </div>
                                                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                                                    <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resident Privileges Card */}
                                    <ResidentPrivilegesCard 
                                        residents={residents.data}
                                        privilegeSummary={privilegeSummary}
                                    />
                                </div>
                            </AdminTabPanel>
                        </AdminTabsWithContent>
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