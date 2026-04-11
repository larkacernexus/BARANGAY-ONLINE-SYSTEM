// app/pages/admin/clearance-types/show.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
    ArrowLeft,
    Edit,
    Copy,
    Check,
    Printer,
    Download,
    MoreVertical,
    Tag,
    Trash2,
    FileText,
    File,
    Award,
    Hash,
    AlertTriangle,
    Loader2,
    Plus,
    Calendar,
    Clock,
    FileCheck,
    Settings,
} from 'lucide-react';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

// Import components
import { ClearanceTypeHeader } from '@/components/admin/clearance-types/show/components/clearance-type-header';
import { StatusBanner } from '@/components/admin/clearance-types/show/components/status-banner';
import { StatisticsCards } from '@/components/admin/clearance-types/show/components/statistics-cards';
import { ClearanceTypeTabs } from '@/components/admin/clearance-types/show/components/clearance-type-tabs';
import { DeleteConfirmationDialog } from '@/components/admin/clearance-types/show/components/delete-confirmation-dialog';

// Import types and utilities from central types file
import {
    ClearanceType,
    formatClearanceTypeDate as formatDate,
    formatCurrency,
    safeNumber as getNumberValue,
    getStatusBadgeVariant,
    getDiscountableBadgeVariant,
    getPaymentBadgeVariant,
    getApprovalBadgeVariant,
    getOnlineOnlyBadgeVariant,
    ShowClearanceTypeProps,
} from '@/types/admin/clearance-types/clearance-types';

import {
    getStatusColor,
    getStatusIcon,
    parseEligibilityCriteria,
    getPurposeOptions,
} from '@/components/admin/clearance-types/show/utils/helpers';

export default function ShowClearanceType({
    clearanceType,
    recentClearances = [],
    privileges = [],
}: ShowClearanceTypeProps) {
    // State Management
    const [copied, setCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAllDocuments, setShowAllDocuments] = useState(false);
    const [showAllDiscounts, setShowAllDiscounts] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [parsedEligibilityCriteria, setParsedEligibilityCriteria] = useState<any[]>([]);
    const [parsedPurposeOptions, setParsedPurposeOptions] = useState<string[]>([]);

    // Memoized Values
    const fee = useMemo(() => getNumberValue(clearanceType.fee), [clearanceType.fee]);
    const processingDays = useMemo(() => getNumberValue(clearanceType.processing_days), [clearanceType.processing_days]);
    const validityDays = useMemo(() => getNumberValue(clearanceType.validity_days), [clearanceType.validity_days]);
    const activeDiscounts = useMemo(
        () => clearanceType.discount_configs?.filter((d: any) => d.is_active) || [],
        [clearanceType.discount_configs]
    );

    const isNew = useCallback(() => {
        const created = new Date(clearanceType.created_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays < 7;
    }, [clearanceType.created_at]);

    // Statistics Configuration
    const statistics = useMemo(() => [
        {
            label: 'Total Clearances',
            value: clearanceType.clearances_count || 0,
            icon: FileText,
            description: 'Issued clearances',
            color: 'blue',
        },
        {
            label: 'Processing Days',
            value: processingDays,
            icon: Clock,
            description: 'Standard processing time',
            color: 'amber',
        },
        {
            label: 'Validity Days',
            value: validityDays,
            icon: Calendar,
            description: `Valid for ${validityDays} days`,
            color: 'green',
        },
        {
            label: 'Documents Required',
            value: clearanceType.document_types?.length || 0,
            icon: File,
            description: 'Required documents',
            color: 'purple',
        },
    ], [clearanceType.clearances_count, clearanceType.document_types?.length, processingDays, validityDays]);

    // Tabs Configuration
    const tabs = useMemo(() => [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'requirements', label: 'Requirements', icon: FileCheck, count: clearanceType.document_types?.length },
        { id: 'discounts', label: 'Discounts', icon: Award, count: activeDiscounts.length },
        { id: 'settings', label: 'Settings', icon: Settings },
    ], [clearanceType.document_types?.length, activeDiscounts.length]);

    // Effects
    useEffect(() => {
        setParsedEligibilityCriteria(parseEligibilityCriteria(clearanceType.eligibility_criteria));
        setParsedPurposeOptions(getPurposeOptions(clearanceType.purpose_options ?? ''));
    }, [clearanceType.eligibility_criteria, clearanceType.purpose_options]);

    // Event Handlers
    const handleCopyLink = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const handleToggleDiscountable = useCallback(() => {
        const action = clearanceType.is_discountable ? 'non-discountable' : 'discountable';
        if (confirm(`Mark "${clearanceType.name}" as ${action}?`)) {
            router.post(route('clearance-types.toggle-discountable', clearanceType.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Clearance type marked as ${action}`);
                    router.reload();
                },
                onError: () => {
                    toast.error('Failed to toggle discountable status');
                },
            });
        }
    }, [clearanceType.id, clearanceType.name, clearanceType.is_discountable]);

    const handleToggleStatus = useCallback(() => {
        const action = clearanceType.is_active ? 'Deactivate' : 'Activate';
        if (confirm(`${action} "${clearanceType.name}"?`)) {
            router.post(route('clearance-types.toggle-status', clearanceType.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Clearance type ${clearanceType.is_active ? 'deactivated' : 'activated'}`);
                    router.reload();
                },
                onError: () => {
                    toast.error('Failed to toggle status');
                },
            });
        }
    }, [clearanceType.id, clearanceType.name, clearanceType.is_active]);

    const handleDuplicate = useCallback(() => {
        if (confirm(`Duplicate "${clearanceType.name}"?`)) {
            router.post(route('clearance-types.duplicate', clearanceType.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Clearance type duplicated');
                    router.visit(route('clearance-types.index'));
                },
                onError: () => {
                    toast.error('Failed to duplicate');
                },
            });
        }
    }, [clearanceType.id, clearanceType.name]);

    const handleDelete = useCallback(() => {
        const clearancesCount = clearanceType.clearances_count ?? 0;
        
        if (clearancesCount > 0) {
            toast.error('Cannot delete clearance type with existing clearances');
            return;
        }

        setIsDeleting(true);
        router.delete(route('clearance-types.destroy', clearanceType.id), {
            onSuccess: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
                toast.success('Clearance type deleted');
                router.visit(route('clearance-types.index'));
            },
            onError: () => {
                setIsDeleting(false);
                toast.error('Failed to delete');
            },
        });
    }, [clearanceType.id, clearanceType.clearances_count]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const handleExport = useCallback(() => {
        const data = {
            clearanceType: {
                ...clearanceType,
                document_types: clearanceType.document_types,
                discount_configs: clearanceType.discount_configs,
                eligibility_criteria: parsedEligibilityCriteria,
                purpose_options: parsedPurposeOptions,
            },
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clearance-type-${clearanceType.code}-${formatDate(clearanceType.updated_at)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Export completed successfully');
    }, [clearanceType, parsedEligibilityCriteria, parsedPurposeOptions]);

    const handleToggleDocuments = useCallback(() => {
        setShowAllDocuments(prev => !prev);
    }, []);

    const handleToggleDiscounts = useCallback(() => {
        setShowAllDiscounts(prev => !prev);
    }, []);

    // Wrapper for formatCurrency to handle string | number
    const formatCurrencyWrapper = useCallback((amount: string | number): string => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return formatCurrency(numericAmount);
    }, []);

    return (
        <>
            <Head title={`Clearance Type: ${clearanceType.name}`} />

            <AppLayout
                title={clearanceType.name}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Clearance Types', href: '/clearance-types' },
                    { title: clearanceType.name, href: '#' },
                ]}
            >
                <TooltipProvider>
                    <div className="space-y-6 print:space-y-4">
                        {/* Header with Actions */}
                        <ClearanceTypeHeader
                            clearanceType={clearanceType}
                            isNew={isNew()}
                            onCopyLink={handleCopyLink}
                            onPrint={handlePrint}
                            onExport={handleExport}
                            onToggleDiscountable={handleToggleDiscountable}
                            onDuplicate={handleDuplicate}
                            onDelete={() => setShowDeleteDialog(true)}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                            formatCurrency={formatCurrencyWrapper}
                        />

                        {/* Status Banner - For clearance types with no documents */}
                        {(!clearanceType.document_types || clearanceType.document_types.length === 0) && (
                            <StatusBanner clearanceType={clearanceType} />
                        )}

                        {/* Statistics Cards */}
                        <StatisticsCards statistics={statistics} />

                        {/* Tabs Navigation and Content */}
                        <ClearanceTypeTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            tabs={tabs}
                            // Content props
                            clearanceType={clearanceType}
                            recentClearances={recentClearances}
                            privileges={privileges}
                            parsedEligibilityCriteria={parsedEligibilityCriteria}
                            parsedPurposeOptions={parsedPurposeOptions}
                            activeDiscounts={activeDiscounts}
                            fee={fee}
                            processingDays={processingDays}
                            validityDays={validityDays}
                            showAllDocuments={showAllDocuments}
                            showAllDiscounts={showAllDiscounts}
                            onToggleDocuments={handleToggleDocuments}
                            onToggleDiscounts={handleToggleDiscounts}
                            onToggleDiscountable={handleToggleDiscountable}
                            onToggleStatus={handleToggleStatus}
                            onDuplicate={handleDuplicate}
                            onDelete={() => setShowDeleteDialog(true)}
                            formatCurrency={formatCurrencyWrapper}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                        />
                    </div>

                    {/* Delete Confirmation Dialog */}
                    <DeleteConfirmationDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                        clearanceType={clearanceType}
                        isDeleting={isDeleting}
                        onDelete={handleDelete}
                    />
                </TooltipProvider>
            </AppLayout>
        </>
    );
}