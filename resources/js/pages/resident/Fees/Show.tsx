// pages/resident/Fees/Show.tsx
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
    FileText,
    Calendar,
    DollarSign,
    MapPin,
    User,
    CreditCard,
    Receipt,
    CheckCircle,
    Clock,
    AlertCircle,
    Info,
    Building,
    Tag,
    Shield,
    Home,
    Briefcase,
    Inbox,
    Printer,
    Share2,
    Copy,
    Eye,
    ExternalLink
} from 'lucide-react';
import { Link, usePage, Head, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import from reusable UI library
import { formatCurrency, formatDate } from '@/components/residentui/lib/resident-ui-utils';
import { useMobileDetect } from '@/components/residentui/hooks/useResidentUI';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernTabs } from '@/components/residentui/modern-tabs';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernStatusBadge } from '@/components/residentui/modern-status-badge';
import { FEE_STATUS_CONFIG } from '@/components/residentui/constants/fee-ui';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { MoreHorizontal } from 'lucide-react';

// Import types from the centralized types file
import { 
    Fee, 
    FeePayment, 
    FeeAttachment,
    getFeeStatusLabel,
    getFeeStatusColor,
    formatFeeAmount,
    isFeeOverdue,
    isFeePaid
} from '@/types/portal/fees/my-fees';

// Helper function to safely get fee type name (handles both object and string)
const getFeeTypeDisplayName = (fee: Fee): string => {
    if (!fee.fee_type) {
        return fee.fee_type_name || 'N/A';
    }
    
    // Check if fee_type is an object with a name property
    if (typeof fee.fee_type === 'object' && fee.fee_type !== null && 'name' in fee.fee_type) {
        return fee.fee_type.name;
    }
    
    // Check if fee_type is a string
    if (typeof fee.fee_type === 'string') {
        return fee.fee_type;
    }
    
    // Fallback
    return fee.fee_type_name || 'N/A';
};

interface PageProps {
    fee: Fee;
    paymentHistory: FeePayment[];
    canPayOnline: boolean;
    canPrintReceipt: boolean;
    attachments?: FeeAttachment[];
    [key: string]: any;
}

type TabType = 'details' | 'payments' | 'attachments';

export default function FeeDetails() {
    const { fee, paymentHistory, canPayOnline, canPrintReceipt, attachments = [] } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState<TabType>('details');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isMobile } = useMobileDetect();
    
    // Memoized calculations using imported helpers
    const requirements = useMemo(() => {
        if (!fee.requirements_submitted) return [];
        
        if (Array.isArray(fee.requirements_submitted)) {
            return fee.requirements_submitted;
        }
        
        if (typeof fee.requirements_submitted === 'string') {
            try {
                const parsed = JSON.parse(fee.requirements_submitted);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        
        return [];
    }, [fee.requirements_submitted]);
    
    const hasAdditionalInfo = useMemo(() => {
        return !!(fee.business_name || fee.property_description || fee.area || 
                  fee.valid_from || fee.valid_until || requirements.length > 0);
    }, [fee, requirements]);
    
    const canPay = useMemo(() => {
        return canPayOnline && (fee.balance || 0) > 0 && fee.status !== 'paid';
    }, [canPayOnline, fee.balance, fee.status]);
    
    const isFullyPaid = useMemo(() => {
        return (fee.balance || 0) === 0 || fee.status === 'paid';
    }, [fee.balance, fee.status]);
    
    const isOverdue = useMemo(() => {
        return isFeeOverdue(fee);
    }, [fee]);
    
    // Debug logging in development only
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Fee data:', fee);
            console.log('Requirements submitted:', requirements);
        }
    }, [fee, requirements]);
    
    const getStatusKey = (): string => {
        if (isOverdue) return 'overdue';
        return fee.status?.toLowerCase() || 'pending';
    };
    
    const handleDownloadReceipt = async () => {
        setIsLoading(true);
        try {
            // Simulate download or make API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`Receipt ${fee.or_number} downloaded successfully`);
            
            // If you have a real download endpoint:
            // window.open(`/portal/fees/${fee.id}/receipt`, '_blank');
        } catch (error) {
            toast.error('Failed to download receipt');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePrint = () => {
        window.print();
    };
    
    const handleShare = () => {
        setShowShareModal(true);
    };
    
    const handleCopyReference = () => {
        navigator.clipboard.writeText(fee.fee_code || '');
        toast.success(`Copied: ${fee.fee_code}`);
    };
    
    const handlePayNow = () => {
        if (canPay) {
            router.visit(`/portal/fees/${fee.id}/pay`);
        } else {
            toast.error('Payment is not available for this fee');
        }
    };
    
    const handleViewAttachment = (attachment: FeeAttachment) => {
        window.open(attachment.url, '_blank');
    };
    
    const handleReportIssue = () => {
        setShowReportModal(true);
    };
    
    const handleSubmitReport = () => {
        toast.info('Report issue feature coming soon');
        setShowReportModal(false);
    };
    
    // Tab configuration
    const tabsConfig = [
        { id: 'details', label: 'Details', icon: Info },
        { id: 'payments', label: 'Payment History', icon: Receipt },
    ];
    
    // Add attachments tab if there are attachments
    if (attachments.length > 0) {
        tabsConfig.push({ id: 'attachments', label: 'Attachments', icon: FileText });
    }

    const getTabCount = (tabId: string) => {
        if (tabId === 'payments') return paymentHistory.length;
        if (tabId === 'attachments') return attachments.length;
        return 0;
    };
    
    // Format amount helper using imported function
    const formatAmount = (amount?: number) => {
        return formatFeeAmount(amount || 0);
    };

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Fees', href: '/portal/fees' },
                { title: `Fee: ${fee.fee_code}`, href: `/portal/fees/${fee.id}` }
            ]}
        >
            <Head title={`Fee: ${fee.fee_code}`} />
            
            <div className="space-y-6 px-4 md:px-6 pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/portal/fees">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold">
                                    {fee.fee_code}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    {fee.purpose}
                                    {!fee.is_own_fee && fee.resident_info && (
                                        <span className="ml-2 text-xs flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            For: {fee.resident_info.full_name}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <ModernStatusBadge status={getStatusKey()} config={FEE_STATUS_CONFIG} />
                        
                        {/* Action Menu Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {canPrintReceipt && isFullyPaid && fee.or_number && (
                                    <DropdownMenuItem onClick={handleDownloadReceipt}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Receipt
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleCopyReference}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Reference
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleShare}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleReportIssue}>
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Report Issue
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {canPay && (
                            <Button 
                                onClick={handlePayNow}
                                className="gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            >
                                <CreditCard className="h-4 w-4" />
                                Pay Now
                            </Button>
                        )}
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
                            {/* Fee Information */}
                            <ModernCard
                                title="Fee Information"
                                icon={FileText}
                                iconColor="from-blue-500 to-blue-600"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Fee Code</p>
                                        <p className="font-medium text-sm mt-1 flex items-center gap-2">
                                            {fee.fee_code}
                                            <button 
                                                onClick={handleCopyReference}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Type</p>
                                        <p className="font-medium text-sm mt-1">{getFeeTypeDisplayName(fee)}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Issue Date</p>
                                        <p className="font-medium text-sm mt-1">{formatDate(fee.issue_date)}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Due Date</p>
                                        <div className="font-medium text-sm mt-1">
                                            {formatDate(fee.due_date)}
                                            {isOverdue && (
                                                <span className="text-xs text-red-500 block">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {fee.billing_period && (
                                        <div className="col-span-1 sm:col-span-2">
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Billing Period</p>
                                                <p className="font-medium text-sm mt-1">{fee.billing_period}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {fee.remarks && (
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 mt-2">
                                        <p className="text-xs text-gray-500 mb-1">Remarks</p>
                                        <p className="text-sm">{fee.remarks}</p>
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
                                        <p className="font-medium">{fee.payer_name || fee.resident_name}</p>
                                        {fee.payer_type === 'resident' && fee.is_own_fee && (
                                            <span className="text-xs text-blue-600 mt-1 block">(You)</span>
                                        )}
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500 mb-1">Address</p>
                                        <p className="font-medium">{fee.address || 'N/A'}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {fee.purok && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Purok</p>
                                                <p className="font-medium text-sm mt-1">{fee.purok}</p>
                                            </div>
                                        )}
                                        {fee.zone && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Zone</p>
                                                <p className="font-medium text-sm mt-1">{fee.zone}</p>
                                            </div>
                                        )}
                                    </div>
                                    {fee.resident_info?.contact_number && (
                                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                            <p className="text-xs text-gray-500">Contact Number</p>
                                            <p className="font-medium text-sm mt-1">{fee.resident_info.contact_number}</p>
                                        </div>
                                    )}
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
                                        <span className="text-sm text-gray-600">Base Amount</span>
                                        <span className="font-medium">{formatAmount(fee.base_amount)}</span>
                                    </div>
                                    
                                    {(fee.surcharge_amount || 0) > 0 && (
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                            <span className="text-sm text-amber-600">Surcharge</span>
                                            <span className="font-medium text-amber-600">{formatAmount(fee.surcharge_amount)}</span>
                                        </div>
                                    )}
                                    
                                    {(fee.penalty_amount || 0) > 0 && (
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                                            <span className="text-sm text-red-600">Penalty</span>
                                            <span className="font-medium text-red-600">{formatAmount(fee.penalty_amount)}</span>
                                        </div>
                                    )}
                                    
                                    {(fee.discount_amount || 0) > 0 && (
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                            <span className="text-sm text-green-600">Discount</span>
                                            <span className="font-medium text-green-600">-{formatAmount(fee.discount_amount)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-900">
                                            <span className="font-semibold">Total Amount</span>
                                            <span className="text-xl font-bold">{formatAmount(fee.total_amount)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                            <span className="text-sm text-blue-600">Amount Paid</span>
                                            <span className="font-medium text-blue-600">{formatAmount(fee.amount_paid)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                                            <span className="text-sm text-red-600">Balance Due</span>
                                            <span className={`text-lg font-bold ${(fee.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatAmount(fee.balance)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {!isFullyPaid && fee.due_date && (
                                    <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                                    Please settle the balance of {formatAmount(fee.balance)} before {formatDate(fee.due_date)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ModernCard>
                            
                            {/* Additional Information */}
                            {hasAdditionalInfo && (
                                <ModernCard
                                    title="Additional Information"
                                    icon={Info}
                                    iconColor="from-orange-500 to-orange-600"
                                >
                                    <div className="space-y-3">
                                        {fee.business_name && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Business Name</p>
                                                <p className="font-medium text-sm mt-1">{fee.business_name}</p>
                                            </div>
                                        )}
                                        
                                        {fee.business_type && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Business Type</p>
                                                <p className="font-medium text-sm mt-1">{fee.business_type}</p>
                                            </div>
                                        )}
                                        
                                        {fee.property_description && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Property Description</p>
                                                <p className="font-medium text-sm mt-1">{fee.property_description}</p>
                                            </div>
                                        )}
                                        
                                        {fee.area && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Area</p>
                                                <p className="font-medium text-sm mt-1">{fee.area.toLocaleString()} sq.m.</p>
                                            </div>
                                        )}
                                        
                                        {fee.valid_from && fee.valid_until && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Validity Period</p>
                                                <p className="font-medium text-sm mt-1">
                                                    {formatDate(fee.valid_from)} to {formatDate(fee.valid_until)}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {fee.certificate_number && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Certificate Number</p>
                                                <p className="font-medium font-mono text-sm mt-1">{fee.certificate_number}</p>
                                            </div>
                                        )}
                                        
                                        {fee.or_number && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500">Official Receipt</p>
                                                <p className="font-medium font-mono text-sm mt-1">{fee.or_number}</p>
                                            </div>
                                        )}
                                        
                                        {requirements.length > 0 && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <p className="text-xs text-gray-500 mb-2">Requirements Submitted</p>
                                                <ul className="space-y-1">
                                                    {requirements.map((req, index) => (
                                                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                            <span>{typeof req === 'string' ? req : JSON.stringify(req)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </ModernCard>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <ModernCard
                        title="Payment History"
                        description="All payments made towards this fee"
                        icon={Receipt}
                        iconColor="from-indigo-500 to-indigo-600"
                    >
                        {paymentHistory.length === 0 ? (
                            <div className="py-12">
                                <ModernEmptyState
                                    status="empty"
                                    title="No payment history"
                                    message="No payments have been made for this fee yet."
                                    icon={Inbox}
                                />
                            </div>
                        ) : (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                                                <TableHead className="font-semibold">Date</TableHead>
                                                <TableHead className="font-semibold">OR Number</TableHead>
                                                <TableHead className="font-semibold">Amount</TableHead>
                                                <TableHead className="font-semibold">Payment Method</TableHead>
                                                <TableHead className="font-semibold">Received By</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paymentHistory.map((payment, index) => (
                                                <TableRow key={`${payment.or_number}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                    <TableCell className="font-medium">
                                                        {formatDate(payment.date)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Receipt className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                            <span className="font-mono text-sm">{payment.or_number}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {formatAmount(payment.amount)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                            <span className="capitalize">{payment.method?.replace('_', ' ') || 'N/A'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.received_by || 'System'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.status === 'completed' ? (
                                                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Completed
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                <Clock className="h-3 w-3" />
                                                                Pending
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </ModernCard>
                )}
                
                {/* Attachments Tab */}
                {activeTab === 'attachments' && attachments.length > 0 && (
                    <ModernCard
                        title="Attachments"
                        description="Supporting documents and files"
                        icon={FileText}
                        iconColor="from-cyan-500 to-cyan-600"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {attachments.map((attachment) => (
                                <div 
                                    key={attachment.id}
                                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-all cursor-pointer group"
                                    onClick={() => handleViewAttachment(attachment)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                                                <FileText className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                                                    {attachment.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(attachment.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ModernCard>
                )}
            </div>
            
            {/* Share Modal */}
            <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share Fee Details</DialogTitle>
                        <DialogDescription>
                            Share this fee information with others
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                            <div className="flex items-center justify-between">
                                <p className="font-mono text-sm">{fee.fee_code}</p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCopyReference}
                                    className="h-8"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                            <p className="font-bold text-lg">{formatAmount(fee.total_amount)}</p>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <ModernStatusBadge status={getStatusKey()} config={FEE_STATUS_CONFIG} />
                        </div>
                        
                        <Button 
                            className="w-full"
                            onClick={() => {
                                const url = window.location.href;
                                navigator.clipboard.writeText(url);
                                toast.success('Link copied to clipboard');
                                setShowShareModal(false);
                            }}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Copy Link
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            
            {/* Report Issue Modal */}
            <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Issue</DialogTitle>
                        <DialogDescription>
                            Having trouble with this fee? Let us know.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <textarea
                            className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                            rows={4}
                            placeholder="Describe your issue..."
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowReportModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmitReport}>
                                Submit Report
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            
            {/* Loading Overlay */}
            <ModernLoadingOverlay loading={isLoading} message="Processing..." />
        </ResidentLayout>
    );
}