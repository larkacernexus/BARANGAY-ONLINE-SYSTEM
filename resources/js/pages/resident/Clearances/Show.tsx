import { useEffect, useState, useCallback, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft,
    Download,
    Printer,
    FileText,
    XCircle,
    AlertCircle,
    DollarSign,
    User,
    FileCheck,
    MessageSquare,
    History,
    Loader2,
    Copy,
    Building,
    Layers,
    Receipt,
    Phone,
    MapPin,
    CreditCard,
    MoreVertical,
    Inbox
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import from reusable UI library
import { formatCurrency, formatDate, formatDateTime, downloadFile } from '@/components/residentui/lib/resident-ui-utils';
import { STATUS_CONFIG } from '@/components/residentui/constants/resident-ui';
import { useMobileDetect, useScrollSpy, useExpandableSections } from '@/components/residentui/hooks/useResidentUI';
import { ModernStatusBadge } from '@/components/residentui/modern-status-badge';
import { ModernUrgencyBadge } from '@/components/residentui/modern-urgency-badge';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernDocumentViewer, ModernDocumentThumbnail } from '@/components/residentui/modern-document-viewer';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernTabs } from '@/components/residentui/modern-tabs';
import { ModernPaymentSummary, ModernPaymentMethodsInfo } from '@/components/residentui/modern-payment-summary';
import { ModernExpandableSection } from '@/components/residentui/modern-expandable-section';
import { ModernFloatingActionButton } from '@/components/residentui/modern-floating-action-button';
import { ModernMobileHeader } from '@/components/residentui/modern-mobile-header';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';

// Define interfaces
interface DocumentType {
    id: number;
    name: string;
}

interface ClearanceDocument {
    id: number;
    file_path: string;
    file_name: string;
    original_name?: string;
    description?: string;
    file_size: number;
    file_type?: string;
    mime_type?: string;
    is_verified: boolean;
    document_type_id?: number;
    clearance_request_id: number;
    created_at: string;
    updated_at: string;
    document_type?: DocumentType;
}

interface Payment {
    id: number;
    or_number: string;
    payment_method: string;
    reference_number?: string;
    total_amount: number | string;
    payment_date: string;
    status: string;
    payer_name: string;
    purpose: string;
    remarks?: string;
}

interface PaymentItem {
    id: number;
    payment_id: number;
    clearance_request_id: number;
    fee_name: string;
    fee_code: string;
    base_amount: number | string;
    surcharge: number | string;
    penalty: number | string;
    total_amount: number | string;
    description?: string;
    category: string;
    period_covered?: string;
    created_at: string;
    updated_at: string;
    payment?: Payment;
}

interface StatusHistory {
    id: number;
    clearance_request_id: number;
    status: string;
    remarks?: string;
    created_at: string;
    updated_at: string;
    causer?: {
        id: number;
        name: string;
        type: string;
    };
}

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description?: string;
    fee: number | string;
    processing_days: number;
    validity_days?: number;
    requires_payment: boolean;
    requires_approval: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    household_id: number;
}

interface ClearanceRequest {
    id: number;
    resident_id: number;
    clearance_type_id?: number;
    reference_number: string;
    clearance_number?: string;
    status: string;
    purpose: string;
    specific_purpose?: string;
    urgency: 'normal' | 'rush' | 'express';
    needed_date: string;
    additional_requirements?: string;
    fee_amount: number | string;
    issue_date?: string;
    valid_until?: string;
    remarks?: string;
    issuing_officer_name?: string;
    created_at: string;
    updated_at: string;
    
    clearance_type?: ClearanceType;
    resident?: Resident;
    documents?: ClearanceDocument[];
    status_history?: StatusHistory[];
    payment_items?: PaymentItem[];
}

interface PageProps {
    clearance: ClearanceRequest;
    payment_items?: PaymentItem[];
}

export default function ClearanceDetail({ clearance, payment_items = [] }: PageProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [isDownloadingClearance, setIsDownloadingClearance] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [viewingDocument, setViewingDocument] = useState<ClearanceDocument | null>(null);
    const [loading, setLoading] = useState(false);
    
    const { isMobile, isClient } = useMobileDetect();
    const showStickyActions = useScrollSpy(200);
    const { expandedSections, toggleSection } = useExpandableSections({
        requestInfo: true,
        clearanceInfo: true,
        paymentSummary: true
    });
    
    const headerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const paymentItems = payment_items || clearance.payment_items || [];

    const calculateTotalPaid = (): number => {
        let total = 0;
        paymentItems.forEach(item => {
            const amount = typeof item.total_amount === 'string' 
                ? parseFloat(item.total_amount) 
                : item.total_amount;
            if (!isNaN(amount)) {
                total += amount;
            }
        });
        return total;
    };

    useEffect(() => {
        if (isClient) {
            document.title = `Clearance #${clearance.reference_number} | Barangay System`;
        }
    }, [clearance.reference_number, isClient]);

    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    };

    const handleDocumentDownload = async (document: ClearanceDocument) => {
        if (!isClient) return;
        
        try {
            await downloadFile(
                `/storage/${document.file_path}`,
                document.original_name || document.file_name
            );
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download document. Please try again.');
        }
    };

    const handleClearanceDownload = async () => {
        if (!isClient) return;
        
        setIsDownloadingClearance(true);
        try {
            await downloadFile(
                `/my-clearances/${clearance.id}/download`,
                `clearance-${clearance.reference_number}.pdf`
            );
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download clearance. Please try again.');
        } finally {
            setIsDownloadingClearance(false);
        }
    };

    const handlePrint = () => {
        if (!isClient) return;
        
        setIsPrinting(true);
        try {
            const printWindow = window.open(`/my-clearances/${clearance.id}/print`, '_blank');
            if (!printWindow) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }
            
            printWindow.onload = () => {
                setIsPrinting(false);
            };
            
            setTimeout(() => {
                setIsPrinting(false);
            }, 3000);
        } catch (error) {
            console.error('Print failed:', error);
            alert('Failed to open print window. Please check popup blocker settings.');
            setIsPrinting(false);
        }
    };

    const copyReferenceNumber = () => {
        if (!isClient) return;
        
        navigator.clipboard.writeText(clearance.reference_number)
            .then(() => {
                alert('Reference number copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    };

    const feeAmount = typeof clearance.fee_amount === 'string' 
        ? parseFloat(clearance.fee_amount) 
        : clearance.fee_amount;
    const totalPaid = calculateTotalPaid();
    const balance = feeAmount - totalPaid;

    const isPaymentRequired = clearance.clearance_type?.requires_payment && balance > 0;
    const isReadyForPayment = clearance.status === 'ready_for_payment' || clearance.status === 'processing';

    const tabsConfig = [
        { id: 'details', label: 'Details', icon: FileText },
        { id: 'documents', label: 'Documents', icon: FileCheck },
        { id: 'payments', label: 'Payments', icon: DollarSign },
        { id: 'history', label: 'History', icon: History },
    ];

    const getTabCount = (tabId: string) => {
        switch(tabId) {
            case 'documents': 
                return clearance.documents?.length || 0;
            case 'payments': 
                return paymentItems.length;
            case 'history': 
                return clearance.status_history?.length || 0;
            default: 
                return 0;
        }
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getFABConfig = () => {
        if (clearance.status === 'pending') {
            return {
                icon: <XCircle className="h-6 w-6 text-white" />,
                label: 'Cancel Request',
                color: 'red' as const,
                onClick: () => {
                    if (confirm('Are you sure you want to cancel this request?')) {
                        router.delete(`/my-clearances/${clearance.id}`);
                    }
                }
            };
        } else if (clearance.status === 'issued' && clearance.clearance_number) {
            return {
                icon: <Download className="h-6 w-6 text-white" />,
                label: 'Download Clearance',
                color: 'blue' as const,
                onClick: handleClearanceDownload
            };
        } else if (isReadyForPayment && isPaymentRequired) {
            return {
                icon: <DollarSign className="h-6 w-6 text-white" />,
                label: 'Pay Now',
                color: 'green' as const,
                onClick: () => alert(`Pay ${formatCurrency(balance)} at Barangay Hall`)
            };
        }
        return null;
    };

    const fabConfig = getFABConfig();

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Clearances', href: '/portal/my-clearances' },
                { title: `#${clearance.reference_number}`, href: '#' }
            ]}
        >
            <div ref={scrollContainerRef} className="space-y-3 md:space-y-6 px-4 md:px-6 pb-32 md:pb-6">
                {/* Mobile Header */}
                {isMobile && (
                    <div ref={headerRef}>
                        <ModernMobileHeader
                            title={clearance.clearance_type?.name || 'Clearance'}
                            subtitle="Clearance Request"
                            referenceNumber={clearance.reference_number}
                            onCopyReference={copyReferenceNumber}
                            onBack={() => router.get('/my-clearances')}
                            showSticky={showStickyActions}
                            actions={
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        {clearance.status === 'issued' && clearance.clearance_number && (
                                            <>
                                                <DropdownMenuItem onClick={handleClearanceDownload} disabled={isDownloadingClearance}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={handlePrint} disabled={isPrinting}>
                                                    <Printer className="h-4 w-4 mr-2" />
                                                    Print
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                            </>
                                        )}
                                        <DropdownMenuItem onClick={copyReferenceNumber}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Reference
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            }
                        />

                        <div className={cn(
                            "sticky z-10 -mx-4 px-4 py-2 transition-all duration-200",
                            showStickyActions ? "top-[73px]" : "top-[73px]"
                        )}>
                            <Alert className={cn(
                                "border-0 rounded-xl shadow-lg py-2",
                                getStatusConfig(clearance.status).gradient
                            )}>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <AlertTitle className="font-semibold text-xs">
                                            Status: {getStatusConfig(clearance.status).label}
                                        </AlertTitle>
                                        <AlertDescription className="text-[10px] truncate">
                                            {clearance.status === 'pending' && 'Pending review'}
                                            {clearance.status === 'processing' && 'Being processed'}
                                            {clearance.status === 'ready_for_payment' && 'Ready for payment'}
                                            {clearance.status === 'issued' && `No: ${clearance.clearance_number}`}
                                        </AlertDescription>
                                    </div>
                                    <ModernUrgencyBadge urgency={clearance.urgency} />
                                </div>
                            </Alert>
                        </div>

                        <ModernPaymentSummary
                            due={feeAmount}
                            paid={totalPaid}
                            balance={balance}
                            showCompact={true}
                        />
                    </div>
                )}

                {/* Desktop Header */}
                {!isMobile && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/portal/my-clearances">
                                <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                    {clearance.clearance_type?.name || 'Clearance Request'}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Reference: {clearance.reference_number}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 rounded-lg"
                                        onClick={copyReferenceNumber}
                                        disabled={!isClient}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {clearance.status === 'issued' && clearance.clearance_number && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="gap-2 rounded-xl"
                                        onClick={handleClearanceDownload}
                                        disabled={isDownloadingClearance || !isClient}
                                    >
                                        {isDownloadingClearance ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4" />
                                        )}
                                        Download
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-2 rounded-xl"
                                        onClick={handlePrint}
                                        disabled={isPrinting || !isClient}
                                    >
                                        {isPrinting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Printer className="h-4 w-4" />
                                        )}
                                        Print
                                    </Button>
                                </>
                            )}
                            {clearance.status === 'pending' && (
                                <Button
                                    variant="destructive"
                                    className="gap-2 rounded-xl"
                                    onClick={() => {
                                        if (isClient && confirm('Are you sure you want to cancel this request?')) {
                                            router.delete(`/my-clearances/${clearance.id}`);
                                        }
                                    }}
                                    disabled={!isClient}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Cancel Request
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className={cn(
                    "grid gap-3 md:gap-6",
                    isMobile ? "grid-cols-1" : "lg:grid-cols-3"
                )}>
                    {/* Left Column */}
                    <div className={cn(
                        isMobile ? "col-span-1" : "lg:col-span-2"
                    )}>
                        <ModernTabs
                            tabs={tabsConfig}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            getTabCount={getTabCount}
                            className="mb-3"
                        />

                        <div className="mt-3 space-y-3">
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <>
                                    {isMobile ? (
                                        <>
                                            <ModernExpandableSection
                                                title="Request Information"
                                                icon={
                                                    <div className="h-6 w-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                        <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                }
                                                isExpanded={expandedSections.requestInfo}
                                                onToggle={() => toggleSection('requestInfo')}
                                            >
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                            <p className="text-[10px] text-gray-500">Reference</p>
                                                            <p className="text-xs font-mono truncate">{clearance.reference_number}</p>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                            <p className="text-[10px] text-gray-500">Date Requested</p>
                                                            <p className="text-xs">{formatDate(clearance.created_at)}</p>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                            <p className="text-[10px] text-gray-500">Date Needed</p>
                                                            <p className="text-xs">{formatDate(clearance.needed_date)}</p>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                            <p className="text-[10px] text-gray-500">Urgency</p>
                                                            <div className="mt-0.5">
                                                                <ModernUrgencyBadge urgency={clearance.urgency} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                        <p className="text-[10px] text-gray-500 mb-1">Purpose</p>
                                                        <p className="text-xs">{clearance.purpose}</p>
                                                        {clearance.specific_purpose && (
                                                            <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                                                                {clearance.specific_purpose}
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                        <p className="text-[10px] text-gray-500 mb-1">Requested By</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                                <User className="h-3 w-3" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium">
                                                                    {clearance.resident?.first_name} {clearance.resident?.last_name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ModernExpandableSection>

                                            <ModernExpandableSection
                                                title="Clearance Information"
                                                icon={
                                                    <div className="h-6 w-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                        <FileCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                }
                                                isExpanded={expandedSections.clearanceInfo}
                                                onToggle={() => toggleSection('clearanceInfo')}
                                            >
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                            <p className="text-[10px] text-gray-500">Type</p>
                                                            <p className="text-xs">{clearance.clearance_type?.name || 'N/A'}</p>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                            <p className="text-[10px] text-gray-500">Processing</p>
                                                            <p className="text-xs">{clearance.clearance_type?.processing_days || 0} days</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {clearance.issue_date && (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                                <p className="text-[10px] text-gray-500">Issued Date</p>
                                                                <p className="text-xs">{formatDate(clearance.issue_date)}</p>
                                                            </div>
                                                            {clearance.valid_until && (
                                                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                                    <p className="text-[10px] text-gray-500">Valid Until</p>
                                                                    <p className="text-xs">{formatDate(clearance.valid_until)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {clearance.clearance_number && (
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                            <p className="text-[10px] text-gray-500">Clearance Number</p>
                                                            <p className="text-xs font-mono">{clearance.clearance_number}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ModernExpandableSection>
                                        </>
                                    ) : (
                                        <>
                                            <ModernCard
                                                title="Request Information"
                                                icon={Layers}
                                                iconColor="from-blue-500 to-blue-600"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Reference Number</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <p className="font-mono font-medium">{clearance.reference_number}</p>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-5 w-5 p-0"
                                                                onClick={copyReferenceNumber}
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Date Requested</p>
                                                        <p className="font-medium mt-1">{formatDate(clearance.created_at)}</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Date Needed</p>
                                                        <p className="font-medium mt-1">{formatDate(clearance.needed_date)}</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Urgency</p>
                                                        <div className="mt-1">
                                                            <ModernUrgencyBadge urgency={clearance.urgency} />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                    <p className="text-xs text-gray-500 mb-1">Purpose</p>
                                                    <p className="font-medium">{clearance.purpose}</p>
                                                    {clearance.specific_purpose && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                            {clearance.specific_purpose}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                {clearance.additional_requirements && (
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500 mb-1">Additional Requirements</p>
                                                        <p className="font-medium">{clearance.additional_requirements}</p>
                                                    </div>
                                                )}
                                                
                                                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                    <p className="text-xs text-gray-500 mb-2">Requested By</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                {clearance.resident?.first_name} {clearance.resident?.last_name}
                                                            </p>
                                                            {clearance.resident?.middle_name && (
                                                                <p className="text-sm text-gray-500">
                                                                    {clearance.resident.middle_name} {clearance.resident.suffix}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ModernCard>

                                            <ModernCard
                                                title="Clearance Information"
                                                icon={FileCheck}
                                                iconColor="from-purple-500 to-purple-600"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Type</p>
                                                        <p className="font-medium mt-1">{clearance.clearance_type?.name || 'N/A'}</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Processing Time</p>
                                                        <p className="font-medium mt-1">{clearance.clearance_type?.processing_days || 0} days</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Fee Amount</p>
                                                        <p className="font-bold text-lg mt-1">{formatCurrency(clearance.fee_amount)}</p>
                                                    </div>
                                                    {clearance.clearance_type?.fee && (
                                                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                            <p className="text-xs text-gray-500">Standard Fee</p>
                                                            <p className="font-medium mt-1">{formatCurrency(clearance.clearance_type.fee)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {clearance.issue_date && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                            <p className="text-xs text-gray-500">Issued Date</p>
                                                            <p className="font-medium mt-1">{formatDate(clearance.issue_date)}</p>
                                                        </div>
                                                        {clearance.valid_until && (
                                                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                                <p className="text-xs text-gray-500">Valid Until</p>
                                                                <p className="font-medium mt-1">{formatDate(clearance.valid_until)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {clearance.clearance_number && (
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500 mb-1">Clearance Number</p>
                                                        <p className="font-mono font-medium">{clearance.clearance_number}</p>
                                                    </div>
                                                )}
                                                
                                                {clearance.issuing_officer_name && (
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500 mb-1">Issued By</p>
                                                        <p className="font-medium">{clearance.issuing_officer_name}</p>
                                                    </div>
                                                )}
                                                
                                                {clearance.remarks && (
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500 mb-1">Remarks</p>
                                                        <p className="font-medium">{clearance.remarks}</p>
                                                    </div>
                                                )}
                                            </ModernCard>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Documents Tab */}
                            {activeTab === 'documents' && (
                                <ModernCard
                                    title="Uploaded Documents"
                                    description={`${clearance.documents?.length || 0} document(s)`}
                                >
                                    {clearance.documents && clearance.documents.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {clearance.documents.map((doc) => (
                                                <ModernDocumentThumbnail
                                                    key={doc.id}
                                                    document={doc}
                                                    onView={() => setViewingDocument(doc)}
                                                    onDownload={() => handleDocumentDownload(doc)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <ModernEmptyState
                                            status="empty"
                                            title="No Documents"
                                            description="No documents uploaded"
                                            icon={Inbox}
                                            className="py-8"
                                        />
                                    )}
                                </ModernCard>
                            )}

                            {/* Payments Tab */}
                            {activeTab === 'payments' && (
                                <div className="space-y-3">
                                    <ModernPaymentSummary
                                        due={feeAmount}
                                        paid={totalPaid}
                                        balance={balance}
                                        showCompact={true}
                                    />

                                    {paymentItems.length > 0 ? (
                                        <ModernCard title="Payment History">
                                            <div className="space-y-2">
                                                {paymentItems.map((item) => (
                                                    <div key={item.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                                    <Receipt className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                                                    <p className="text-xs font-medium truncate">{item.fee_name}</p>
                                                                </div>
                                                                {item.payment && (
                                                                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                                                                        <div>
                                                                            <p className="text-gray-500">OR #</p>
                                                                            <p className="font-mono truncate">{item.payment.or_number}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-500">Method</p>
                                                                            <p className="truncate">{item.payment.payment_method}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="text-sm font-bold">{formatCurrency(item.total_amount)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ModernCard>
                                    ) : (
                                        <ModernEmptyState
                                            status="info"
                                            title="No Payments Yet"
                                            description={isPaymentRequired ? "Payment required" : "No payment records"}
                                            icon={DollarSign}
                                            className="py-8"
                                        />
                                    )}
                                </div>
                            )}

                            {/* History Tab */}
                            {activeTab === 'history' && (
                                <ModernCard title="Status History">
                                    {clearance.status_history && clearance.status_history.length > 0 ? (
                                        <div className="relative">
                                            {clearance.status_history
                                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                .map((history, index) => {
                                                    const StatusIcon = getStatusConfig(history.status).icon;
                                                    return (
                                                        <div key={history.id || index} className="relative pb-4 last:pb-0">
                                                            {index < clearance.status_history!.length - 1 && (
                                                                <div className="absolute left-3.5 top-5 -ml-px h-full w-0.5 bg-gradient-to-b from-blue-500 to-gray-200 dark:from-blue-400 dark:to-gray-700"></div>
                                                            )}
                                                            <div className="relative flex items-start gap-2">
                                                                <div className={cn(
                                                                    "relative flex h-7 w-7 items-center justify-center rounded-lg shadow-sm flex-shrink-0",
                                                                    getStatusConfig(history.status).gradient
                                                                )}>
                                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <ModernStatusBadge status={history.status} showIcon={false} />
                                                                        <p className="text-[10px] text-gray-500 flex-shrink-0">
                                                                            {formatDateTime(history.created_at)}
                                                                        </p>
                                                                    </div>
                                                                    {history.remarks && (
                                                                        <div className="mt-1.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                                            <p className="text-[10px]">{history.remarks}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <ModernEmptyState
                                            status="empty"
                                            title="No History"
                                            description="No status history available"
                                            icon={History}
                                            className="py-8"
                                        />
                                    )}
                                </ModernCard>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Desktop Only */}
                    {!isMobile && (
                        <div className="space-y-4 lg:space-y-6">
                            <ModernCard title="Request Summary">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                        <p className="text-sm text-gray-500">Status</p>
                                        <ModernStatusBadge status={clearance.status} />
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                        <p className="text-sm text-gray-500">Urgency</p>
                                        <ModernUrgencyBadge urgency={clearance.urgency} />
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                        <p className="text-sm text-gray-500">Fee Amount</p>
                                        <p className="font-bold">{formatCurrency(clearance.fee_amount)}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                        <p className="text-sm text-gray-500">Amount Paid</p>
                                        <p className="font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                        <p className="text-sm text-gray-500">Balance</p>
                                        <p className={cn(
                                            "font-bold",
                                            balance > 0 ? 'text-red-600' : 'text-green-600'
                                        )}>
                                            {formatCurrency(balance)}
                                        </p>
                                    </div>
                                    
                                    {clearance.clearance_number && (
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                            <p className="text-sm text-gray-500">Clearance No.</p>
                                            <p className="font-mono font-medium">{clearance.clearance_number}</p>
                                        </div>
                                    )}
                                    
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                        <p className="text-sm font-medium">{formatDateTime(clearance.updated_at)}</p>
                                    </div>
                                </div>
                            </ModernCard>

                            <ModernCard title="Quick Actions">
                                <div className="space-y-2">
                                    {clearance.status === 'issued' && clearance.clearance_number && (
                                        <>
                                            <Button
                                                variant="default"
                                                className="w-full justify-start gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600"
                                                onClick={handleClearanceDownload}
                                                disabled={isDownloadingClearance || !isClient}
                                            >
                                                {isDownloadingClearance ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                                Download Clearance
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start gap-2 rounded-xl"
                                                onClick={handlePrint}
                                                disabled={isPrinting || !isClient}
                                            >
                                                {isPrinting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Printer className="h-4 w-4" />
                                                )}
                                                Print Clearance
                                            </Button>
                                        </>
                                    )}
                                    
                                    {isReadyForPayment && isPaymentRequired && (
                                        <Button
                                            variant="default"
                                            className="w-full justify-start gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600"
                                            onClick={() => {
                                                alert(`Please proceed to Barangay Hall to pay the fee of ${formatCurrency(balance)}.\n\nBring your valid ID and this reference number: ${clearance.reference_number}`);
                                            }}
                                            disabled={!isClient}
                                        >
                                            <DollarSign className="h-4 w-4" />
                                            Payment Instructions
                                        </Button>
                                    )}
                                    
                                    {['pending', 'ready_for_payment', 'processing'].includes(clearance.status) && (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={() => {
                                                if (isClient && confirm('Are you sure you want to cancel this request?')) {
                                                    router.patch(`/my-clearances/${clearance.id}`, {
                                                        status: 'cancelled'
                                                    });
                                                }
                                            }}
                                            disabled={!isClient}
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Cancel Request
                                        </Button>
                                    )}
                                    
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 rounded-xl"
                                        onClick={() => {
                                            router.get(`/my-clearances/${clearance.id}/message`);
                                        }}
                                        disabled={!isClient}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Send Message
                                    </Button>
                                </div>
                            </ModernCard>

                            {isPaymentRequired && <ModernPaymentMethodsInfo />}

                            <ModernCard title="Contact Information">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Barangay Hall</p>
                                            <p className="text-xs text-gray-500">Open Mon-Fri, 8AM-5PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Contact Us</p>
                                            <p className="text-xs text-gray-500">0999-999-9999</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Location</p>
                                            <p className="text-xs text-gray-500">Barangay Hall, Main Street</p>
                                        </div>
                                    </div>
                                </div>
                            </ModernCard>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Floating Action Button */}
            {isMobile && showStickyActions && fabConfig && (
                <ModernFloatingActionButton
                    icon={fabConfig.icon}
                    label={fabConfig.label}
                    onClick={fabConfig.onClick}
                    color={fabConfig.color}
                />
            )}

            <style>{`
                footer.fixed.bottom-0 {
                    z-index: 45 !important;
                }
            `}</style>

            {viewingDocument && (
                <ModernDocumentViewer
                    document={viewingDocument}
                    isOpen={!!viewingDocument}
                    onClose={() => setViewingDocument(null)}
                />
            )}

            <ModernLoadingOverlay loading={loading} message="Loading..." />
        </ResidentLayout>
    );
}