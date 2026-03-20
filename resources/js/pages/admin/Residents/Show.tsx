import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from "@/lib/utils";

// Types
import { PageProps } from '@/components/admin/residents/show/types';

// Utils
import { 
    getStatusConfig, 
    getStatusVariant, 
    getDiscountPercentage 
} from '@/components/admin/residents/show/utils/badge-utils';
import { getPhotoUrl } from '@/components/admin/residents/show/utils/helpers';

// Icons
import * as Icons from 'lucide-react';
import { 
    Loader2, 
    ArrowLeft, 
    User, 
    FileText, 
    Award, 
    Home, 
    Sparkles, 
    Hash, 
    Crown, 
    Calendar, 
    Link as LinkIcon, 
    Printer, 
    Edit, 
    Trash2, 
    Clock, 
    Check,
    ChevronRight
} from 'lucide-react';

// Components
import { OverviewTab } from '@/components/admin/residents/show/components/tabs/OverviewTab';
import { DetailsTab } from '@/components/admin/residents/show/components/tabs/DetailsTab';
import { PrivilegesTab } from '@/components/admin/residents/show/components/tabs/PrivilegesTab';
import { HouseholdTab } from '@/components/admin/residents/show/components/tabs/HouseholdTab';
import { ProfileSummary } from '@/components/admin/residents/show/components/ProfileSummary';
import { BenefitsSummary } from '@/components/admin/residents/show/components/BenefitsSummary';
import { QuickActions } from '@/components/admin/residents/show/components/QuickActions';
import { SystemInfo } from '@/components/admin/residents/show/components/SystemInfo';
import { DangerZone } from '@/components/admin/residents/show/components/DangerZone';
import { DeleteConfirmationDialog } from '@/components/admin/residents/show/components/DeleteConfirmationDialog';

// Extend the PageProps interface to include available_privileges
interface ExtendedPageProps extends PageProps {
    available_privileges?: any[]; // Add this line
}

export default function ShowResident({ 
    resident, 
    household, 
    household_membership, 
    related_household_members = [],
    households = [],
    puroks = [],
    available_privileges = [] // Add this line to receive from controller
}: ExtendedPageProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    if (!resident) {
        return (
            <AppLayout title="Loading Resident...">
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </AppLayout>
        ); 
    }

    // Derived data
    const actualHousehold = household || null;
    const actualHouseholdMembership = household_membership || null;
    const actualRelatedMembers = related_household_members || [];
    const residentPrivileges = resident.privileges || [];
    const isHeadOfHousehold = actualHouseholdMembership?.is_head || false;
    const hasHousehold = !!actualHousehold;
    
    // Privilege categorization
    const activePrivileges = residentPrivileges.filter(p => p.status === 'active');
    const expiringSoonPrivileges = residentPrivileges.filter(p => p.status === 'expiring_soon');
    const pendingPrivileges = residentPrivileges.filter(p => p.status === 'pending');
    const expiredPrivileges = residentPrivileges.filter(p => p.status === 'expired');
    
    const maxDiscount = Math.max(...residentPrivileges.map(p => getDiscountPercentage(p) || 0), 0);
    const fullName = `${resident.first_name} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name}${resident.suffix ? ' ' + resident.suffix : ''}`;

    // Status Resolution
    const statusConfig = getStatusConfig(resident.status);
    const StatusIconComponent = (Icons as any)[statusConfig.iconName] || Icons.HelpCircle;

    const isNew = () => {
        const created = new Date(resident.created_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays < 7;
    };

    // Handlers
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.residents.destroy', resident.id), {
            preserveScroll: false,
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const viewFullPhoto = () => {
        const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
        if (photoUrl) window.open(photoUrl, '_blank');
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <User className="h-4 w-4" /> },
        { id: 'details', label: 'Personal Details', icon: <FileText className="h-4 w-4" /> },
        { id: 'privileges', label: `Benefits (${residentPrivileges.length})`, icon: <Award className="h-4 w-4" /> },
        { id: 'household', label: 'Household', icon: <Home className="h-4 w-4" /> },
    ];

    return (
        <AppLayout
            title={`${fullName} - Resident Details`}
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Residents', href: route('admin.residents.index') },
                { title: fullName, href: route('admin.residents.show', resident.id) }
            ]}
        >
            <Head title={`${fullName} - Resident Details`} />
            
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.residents.index')}>
                                <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:bg-gray-900">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight line-clamp-2 dark:text-gray-100 uppercase">
                                    {fullName}
                                </h1>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge variant={getStatusVariant(resident.status)} className="flex items-center gap-1">
                                        <StatusIconComponent className={statusConfig.iconClass} />
                                        {resident.status}
                                    </Badge>
                                    
                                    {isNew() && (
                                        <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white border-none">
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            New
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300 font-mono">
                                        <Hash className="h-3 w-3 mr-1" />
                                        {resident.resident_id}
                                    </Badge>
                                    {isHeadOfHousehold && (
                                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                                            <Crown className="h-3 w-3 mr-1" />
                                            Head
                                        </Badge>
                                    )}
                                    <div className="flex items-center gap-3 ml-1 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-tighter">
                                        <span className="flex items-center gap-1 leading-none">
                                            <Calendar className="h-3 w-3" />
                                            {resident.age} YRS
                                        </span>
                                        <span className="flex items-center gap-1 leading-none">
                                            <Award className="h-3 w-3" />
                                            {activePrivileges.length} ACTIVE BENEFITS
                                        </span>
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
                                onClick={() => window.print()}
                                className="flex-1 sm:flex-none h-9 dark:border-gray-600 dark:text-gray-300"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                            <Link href={route('admin.residents.edit', resident.id)} className="flex-1 sm:flex-none">
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

                    {/* Tab Navigation */}
                    <div className="flex items-center border-b dark:border-gray-800 overflow-x-auto no-scrollbar gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            {activeTab === 'overview' && <OverviewTab resident={resident} />}
                            {activeTab === 'details' && <DetailsTab resident={resident} />}
                            {activeTab === 'privileges' && (
                                <PrivilegesTab
                                    privileges={residentPrivileges}
                                    residentId={resident.id}
                                    activePrivileges={activePrivileges}
                                    expiringSoonPrivileges={expiringSoonPrivileges}
                                    pendingPrivileges={pendingPrivileges}
                                    expiredPrivileges={expiredPrivileges}
                                    availablePrivileges={available_privileges} // Add this line
                                />
                            )}
                            {activeTab === 'household' && (
                                <HouseholdTab
                                    resident={resident}
                                    household={actualHousehold}
                                    householdMembership={actualHouseholdMembership}
                                    relatedMembers={actualRelatedMembers}
                                    households={households}
                                    puroks={puroks}
                                />
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <ProfileSummary
                                resident={resident}
                                isHeadOfHousehold={isHeadOfHousehold}
                                activePrivilegesCount={activePrivileges.length}
                                onViewFullPhoto={viewFullPhoto}
                            />
                            <BenefitsSummary
                                privileges={residentPrivileges}
                                activePrivileges={activePrivileges}
                                maxDiscount={maxDiscount}
                                discountTypes={new Set(residentPrivileges.map(p => p.privilege?.name).filter(Boolean) as string[])}
                            />
                            <QuickActions
                                residentId={resident.id}
                                hasHousehold={hasHousehold}
                                householdId={actualHousehold?.id}
                                onAddToHousehold={() => setActiveTab('household')}
                                onDelete={() => setShowDeleteDialog(true)}
                            />
                            <SystemInfo
                                resident={resident}
                                householdMembership={actualHouseholdMembership}
                            />
                        </div>
                    </div>

                    {/* Footer Warning */}
                    <DangerZone
                        residentName={fullName}
                        onDelete={() => setShowDeleteDialog(true)}
                    />
                </div>

                <DeleteConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                    residentName={fullName}
                />
            </TooltipProvider>
        </AppLayout>
    );
}