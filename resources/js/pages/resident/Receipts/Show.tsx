import { useEffect, useState, useMemo } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Download,
    Printer,
    Copy,
    FileText,
    Calendar,
    DollarSign,
    User,
    CreditCard,
    Receipt,
    CheckCircle,
    Clock,
    AlertCircle,
    Info,
    Building,
    Tag,
    Inbox,
    QrCode
} from 'lucide-react';
import { Link, usePage, Head } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import types
import { ReceiptItem } from '@/types/portal/receipts/receipt.types';

// Import from reusable UI library
import { formatCurrency, formatDate } from '@/components/residentui/lib/resident-ui-utils';
import { useMobileDetect } from '@/components/residentui/hooks/useResidentUI';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernTabs } from '@/components/residentui/modern-tabs';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernStatusBadge } from '@/components/residentui/modern-status-badge';

// Define the receipt status type
type ReceiptStatus = 'paid' | 'partial' | 'pending' | 'cancelled' | 'overdue';

// Receipt status configuration with proper typing
const RECEIPT_STATUS_CONFIG: Record<ReceiptStatus, {
    label: string;
    color: string;
    icon: React.ElementType;
}> = {
    paid: {
        label: 'Paid',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle,
    },
    partial: {
        label: 'Partial',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock,
    },
    pending: {
        label: 'Pending',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        icon: AlertCircle,
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400',
        icon: AlertCircle,
    },
    overdue: {
        label: 'Overdue',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: AlertCircle,
    },
};

interface PageProps {
    receipt: ReceiptItem;
    error?: string;
    [key: string]: any;
}

type TabType = 'details' | 'items';

export default function ReceiptShow() {
    const { receipt, error } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState<TabType>('details');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const { isMobile } = useMobileDetect();

    // Helper function to get valid receipt status key
    const getStatusKey = (): ReceiptStatus => {
        const status = receipt.status.toLowerCase();
        // Check if status is a valid key in RECEIPT_STATUS_CONFIG
        if (status === 'paid' || status === 'partial' || status === 'pending' || 
            status === 'cancelled' || status === 'overdue') {
            return status as ReceiptStatus;
        }
        // Default to pending if status is unknown
        return 'pending';
    };

    const handleCopyReceiptNumber = () => {
        navigator.clipboard.writeText(receipt.receipt_number);
        toast.success('Receipt number copied!');
    };

    const handleCopyORNNumber = () => {
        if (receipt.or_number) {
            navigator.clipboard.writeText(receipt.or_number);
            toast.success('OR number copied!');
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            window.open(`/portal/receipts/${receipt.id}/download`, '_blank');
            toast.success('Download started');
        } catch (error) {
            toast.error('Download failed');
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = async () => {
        setIsPrinting(true);
        try {
            window.open(`/portal/receipts/${receipt.id}/print`, '_blank');
        } catch (error) {
            toast.error('Print failed');
        } finally {
            setIsPrinting(false);
        }
    };

    // Parse payment date
    const paymentDate = receipt.payment_date || receipt.created_at;
    const issuedDate = receipt.created_at;

    // Tab configuration
    const tabsConfig = [
        { id: 'details', label: 'Details', icon: Info },
        { id: 'items', label: 'Items', icon: Receipt },
    ];

    const getTabCount = (tabId: string) => {
        if (tabId === 'items') return receipt.items_count;
        return 0;
    };

    // Get status key with proper type
    const statusKey = getStatusKey();
    const statusConfig = RECEIPT_STATUS_CONFIG[statusKey];
    const StatusIcon = statusConfig.icon;

    // Error state
    if (error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Receipts', href: '/portal/receipts' },
                    { title: 'Receipt Details', href: '#' }
                ]}
            >
                <Head title="Receipt Not Found" />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <ModernCard title="Receipt Not Found">
                        <div className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Receipt Not Found</h3>
                            <p className="text-gray-500 mb-4">{error}</p>
                            <Link href="/portal/receipts">
                                <Button>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Receipts
                                </Button>
                            </Link>
                        </div>
                    </ModernCard>
                </div>
            </ResidentLayout>
        );
    }

    if (!receipt) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Receipts', href: '/portal/receipts' },
                    { title: 'Receipt Details', href: '#' }
                ]}
            >
                <Head title="Loading..." />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading receipt details...</p>
                    </div>
                </div>
            </ResidentLayout>
        );
    }

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Receipts', href: '/portal/receipts' },
                { title: `Receipt: ${receipt.receipt_number}`, href: `#` }
            ]}
        >
            <Head title={`Receipt: ${receipt.receipt_number}`} />
            
            <div className="space-y-6 px-4 md:px-6 pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/portal/receipts">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl md:text-2xl font-bold">
                                        {receipt.receipt_number}
                                    </h1>
                                    <button
                                        onClick={handleCopyReceiptNumber}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                                        title="Copy receipt number"
                                    >
                                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {receipt.receipt_type_label}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <ModernStatusBadge 
                            status={statusKey} 
                            config={RECEIPT_STATUS_CONFIG} 
                        />
                        
                        <Button 
                            variant="outline" 
                            onClick={handleDownload} 
                            disabled={isDownloading}
                            className="gap-2 rounded-xl"
                        >
                            <Download className="h-4 w-4" />
                            {isDownloading ? 'Downloading...' : 'PDF'}
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            onClick={handlePrint} 
                            disabled={isPrinting}
                            className="gap-2 rounded-xl"
                        >
                            <Printer className="h-4 w-4" />
                            {isPrinting ? 'Printing...' : 'Print'}
                        </Button>
                    </div>
                </div>
                
                {/* Tabs */}
                <ModernTabs
                    tabs={tabsConfig}
                    activeTab={activeTab}
                    onTabChange={(tabId) => setActiveTab(tabId as TabType)}
                    getTabCount={getTabCount}
                />
                
                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Receipt Information */}
                            <ModernCard
                                title="Receipt Information"
                                icon={Receipt}
                                iconColor="from-blue-500 to-blue-600"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Receipt Number</p>
                                        <p className="font-medium text-sm mt-1 font-mono">{receipt.receipt_number}</p>
                                    </div>
                                    {receipt.or_number && (
                                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                            <p className="text-xs text-gray-500">OR Number</p>
                                            <div className="flex items-center gap-1">
                                                <p className="font-medium text-sm mt-1 font-mono">{receipt.or_number}</p>
                                                <button
                                                    onClick={handleCopyORNNumber}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                                                    title="Copy OR number"
                                                >
                                                    <Copy className="h-3 w-3 text-gray-400" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Receipt Type</p>
                                        <p className="font-medium text-sm mt-1">{receipt.receipt_type_label}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Items</p>
                                        <p className="font-medium text-sm mt-1">{receipt.items_count} item{receipt.items_count !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Payment Date</p>
                                        <p className="font-medium text-sm mt-1">{formatDate(paymentDate)}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Issued Date</p>
                                        <p className="font-medium text-sm mt-1">{formatDate(issuedDate)}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Issued By</p>
                                        <p className="font-medium text-sm mt-1">{receipt.issued_by || 'System'}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Payment Method</p>
                                        <p className="font-medium text-sm mt-1 flex items-center gap-1">
                                            <CreditCard className="h-3 w-3 text-gray-400" />
                                            {receipt.payment_method_label}
                                        </p>
                                    </div>
                                </div>
                                
                                {receipt.reference_number && (
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 mt-2">
                                        <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                                        <p className="text-sm font-mono">{receipt.reference_number}</p>
                                    </div>
                                )}
                                
                                {receipt.notes && (
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 mt-2">
                                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                                        <p className="text-sm">{receipt.notes}</p>
                                    </div>
                                )}
                            </ModernCard>
                            
                            {/* Payer Information */}
                            <ModernCard
                                title="Payer Information"
                                icon={User}
                                iconColor="from-green-500 to-green-600"
                            >
                                <div className="space-y-3">
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500 mb-1">Name</p>
                                        <p className="font-medium">{receipt.payer_name}</p>
                                    </div>
                                </div>
                            </ModernCard>
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Amount Breakdown */}
                            <ModernCard
                                title="Amount Breakdown"
                                icon={DollarSign}
                                iconColor="from-purple-500 to-purple-600"
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <span className="text-sm text-gray-600">Total Amount</span>
                                        <span className="text-xl font-bold">{receipt.formatted_total}</span>
                                    </div>
                                    
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                            <span className="text-sm text-green-600">Amount Paid</span>
                                            <span className="font-medium text-green-600">{receipt.formatted_amount_paid}</span>
                                        </div>
                                    </div>
                                    
                                    {receipt.has_discount && (
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                            <span className="text-sm text-blue-600">Discount Applied</span>
                                            <span className="font-medium text-blue-600">
                                                <Receipt className="h-4 w-4 inline mr-1" />
                                                Included
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </ModernCard>
                            
                            {/* Additional Information */}
                            {(receipt.clearance_id || receipt.fee_id) && (
                                <ModernCard
                                    title="Related Information"
                                    icon={Info}
                                    iconColor="from-orange-500 to-orange-600"
                                >
                                    <div className="space-y-3">
                                        {receipt.clearance_id && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Clearance ID</p>
                                                <p className="font-medium text-sm mt-1">{receipt.clearance_id}</p>
                                            </div>
                                        )}
                                        {receipt.fee_id && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Fee ID</p>
                                                <p className="font-medium text-sm mt-1">{receipt.fee_id}</p>
                                            </div>
                                        )}
                                    </div>
                                </ModernCard>
                            )}
                            
                            {/* QR Code (if applicable) */}
                            <ModernCard
                                title="QR Code"
                                icon={QrCode}
                                iconColor="from-teal-500 to-teal-600"
                            >
                                <div className="text-center py-4">
                                    <div className="inline-block p-4 bg-white rounded-xl shadow-sm">
                                        <QrCode className="h-32 w-32 text-gray-800" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">
                                        Scan to verify receipt
                                    </p>
                                </div>
                            </ModernCard>
                        </div>
                    </div>
                )}
                
                {/* Items Tab */}
                {activeTab === 'items' && (
                    <ModernCard
                        title="Receipt Items"
                        description={`${receipt.items_count} item${receipt.items_count !== 1 ? 's' : ''} included in this receipt`}
                        icon={Receipt}
                        iconColor="from-indigo-500 to-indigo-600"
                    >
                        {receipt.items_count === 0 ? (
                            <div className="py-12">
                                <ModernEmptyState
                                    status="empty"
                                    title="No items"
                                    message="No items are associated with this receipt."
                                    icon={Inbox}
                                />
                            </div>
                        ) : (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                                                <TableHead className="font-semibold">Item</TableHead>
                                                <TableHead className="font-semibold">Type</TableHead>
                                                <TableHead className="font-semibold text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Receipt className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                        <span>{receipt.receipt_type_label}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                        <span className="capitalize">{receipt.receipt_type}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="font-medium">
                                                        {receipt.formatted_total}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </ModernCard>
                )}
            </div>
        </ResidentLayout>
    );
}