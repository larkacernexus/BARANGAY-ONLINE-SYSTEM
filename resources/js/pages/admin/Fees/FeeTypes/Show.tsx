// resources/js/Pages/Admin/FeeTypes/Show.tsx
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/admin-app-layout';
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
import {
    ChevronLeft,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';
import { route } from 'ziggy-js';

// Import components
import { FeeTypeHeader } from '@/components/admin/fee-types/show/components/fee-type-header';
import { StatusBanner } from '@/components/admin/fee-types/show/components/status-banner';
import { StatisticsCards } from '@/components/admin/fee-types/show/components/statistics-cards';
import { FeeTypeTabs } from '@/components/admin/fee-types/show/components/fee-type-tabs';
import { DangerZone } from '@/components/admin/fee-types/show/components//danger-zone';
import { DeleteConfirmationDialog } from '@/components/admin/fee-types/show/components/delete-confirmation-dialog';

// Import types and utilities
import { PageProps } from '@/types/admin/fee-types/fee.types';
import { 
    formatDate, 
    formatDateTime, 
    formatTimeAgo, 
    formatCurrency,
    getCategoryColor,
    getCategoryLabel,
    getAmountTypeLabel,
    getApplicableToLabel,
    getFrequencyLabel,
    getStatusIcon,
    getStatusVariant,
    getArrayFromField,
    getDiscountPercentage,
    getColorClass,
    isNew,
    isExpired,
    hasAnyDiscount,
    getActiveDiscountFeeTypes,
    getFeeStatusClass
} from '@/components/admin/fee-types/show/utils/helpers';

export default function FeeTypeShow({ feeType, recentFees = [], statistics = {} }: PageProps) {
    const [togglingStatus, setTogglingStatus] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [copied, setCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Safely convert applicable_puroks and requirements to arrays
    const applicablePuroks = useMemo(() => 
        getArrayFromField<string>(feeType.applicable_puroks), 
        [feeType.applicable_puroks]
    );
    
    const requirements = useMemo(() => 
        getArrayFromField<string>(feeType.requirements), 
        [feeType.requirements]
    );

    const expired = isExpired(feeType.expiry_date);
    const newFeeType = isNew(feeType.created_at);
    const hasDiscounts = hasAnyDiscount(feeType);
    const activeDiscountFeeTypes = getActiveDiscountFeeTypes(feeType.discount_fee_types);

    // Toggle status
    const toggleStatus = () => {
        if (confirm(`Are you sure you want to ${feeType.is_active ? 'deactivate' : 'activate'} this fee type?`)) {
            setTogglingStatus(true);
            router.put(route('fee-types.toggle-status', feeType.id), {}, {
                onFinish: () => {
                    setTogglingStatus(false);
                },
            });
        }
    };

    // Confirm delete
    const confirmDelete = () => {
        setIsDeleting(true);
        router.delete(route('fee-types.destroy', feeType.id), {
            onSuccess: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
                router.visit(route('fee-types.index'));
            },
            onError: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
            },
        });
    };

    // Duplicate fee type
    const duplicateFeeType = () => {
        router.post(route('fee-types.duplicate', feeType.id));
    };

    // Handle copy link
    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Statistics for quick stats cards
    const quickStats = [
        { 
            label: 'Base Amount', 
            value: formatCurrency(feeType.base_amount), 
            icon: 'DollarSign',
            description: 'Base fee amount',
            color: 'blue'
        },
        { 
            label: 'Total Fees', 
            value: feeType.fees_count || 0, 
            icon: 'FileText',
            description: 'Associated fees',
            color: 'green'
        },
        { 
            label: 'Frequency', 
            value: getFrequencyLabel(feeType.frequency), 
            icon: 'CalendarDays',
            description: 'Billing frequency',
            color: 'purple'
        },
        { 
            label: 'Applicable To', 
            value: getApplicableToLabel(feeType.applicable_to), 
            icon: 'Users',
            description: 'Target group',
            color: 'amber'
        },
    ];

    // Breadcrumbs
    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Fee Types', href: route('admin.fee-types.index') },
        { title: feeType.name, href: route('admin.fee-types.show', feeType.id) },
    ];

    return (
        <AppLayout
            title={`Fee Type: ${feeType.name}`}
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Fee Type: ${feeType.name}`} />

            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <FeeTypeHeader
                        feeType={feeType}
                        isNew={newFeeType}
                        onCopyLink={handleCopyLink}
                        onToggleStatus={toggleStatus}
                        onDuplicate={duplicateFeeType}
                        onDelete={() => setShowDeleteDialog(true)}
                        togglingStatus={togglingStatus}
                        getStatusIcon={getStatusIcon}
                        getStatusVariant={getStatusVariant}
                        getCategoryColor={getCategoryColor}
                        getCategoryLabel={getCategoryLabel}
                    />

                    {/* Status Banner - For expired or soon-to-expire fee types */}
                    {expired && (
                        <StatusBanner
                            feeType={feeType}
                            formatDate={formatDate}
                        />
                    )}

                    {/* Quick Stats Cards */}
                    <StatisticsCards 
                        stats={quickStats}
                        getColorClass={getColorClass}
                    />

                    {/* Tabs Navigation */}
                    <FeeTypeTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        hasDiscounts={hasDiscounts}
                        recentFeesCount={recentFees.length}
                    />

                    {/* Tab Content */}
                    <div className="pt-2">
                        <FeeTypeTabs.Content
                            activeTab={activeTab}
                            feeType={feeType}
                            recentFees={recentFees}
                            statistics={statistics}
                            applicablePuroks={applicablePuroks}
                            requirements={requirements}
                            hasDiscounts={hasDiscounts}
                            activeDiscountFeeTypes={activeDiscountFeeTypes}
                            expired={expired}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            formatDateTime={formatDateTime}
                            formatTimeAgo={formatTimeAgo}
                            getCategoryColor={getCategoryColor}
                            getCategoryLabel={getCategoryLabel}
                            getAmountTypeLabel={getAmountTypeLabel}
                            getApplicableToLabel={getApplicableToLabel}
                            getFrequencyLabel={getFrequencyLabel}
                            getDiscountPercentage={getDiscountPercentage}
                            getFeeStatusClass={getFeeStatusClass}
                            getStatusIcon={getStatusIcon}
                        />
                    </div>

                    {/* Danger Zone */}
                    <DangerZone onDelete={() => setShowDeleteDialog(true)} />
                </div>

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    feeType={feeType}
                    isDeleting={isDeleting}
                    onDelete={confirmDelete}
                />
            </TooltipProvider>
        </AppLayout>
    );
}