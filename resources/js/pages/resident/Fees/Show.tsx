// pages/resident/Fees/Show.tsx (or wherever this file is)
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
    Inbox
} from 'lucide-react';
import { Link, usePage, Head } from '@inertiajs/react';
import { cn } from '@/lib/utils';

// Import from reusable UI library
import { formatCurrency, formatDate } from '@/components/residentui/lib/resident-ui-utils';
import { useMobileDetect } from '@/components/residentui/hooks/useResidentUI';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernTabs } from '@/components/residentui/modern-tabs';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernStatusBadge } from '@/components/residentui/modern-status-badge';
import { FEE_STATUS_CONFIG } from '@/components/residentui/constants/fee-ui';

interface Fee {
    id: number;
    fee_code: string;
    or_number?: string;
    certificate_number?: string;
    purpose: string;
    payer_name: string;
    address: string;
    purok?: string;
    zone?: string;
    billing_period?: string;
    issue_date: string;
    due_date: string;
    period_start?: string;
    period_end?: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    remarks?: string;
    payer_type: string;
    resident_id?: number;
    household_id?: number;
    is_own_fee: boolean;
    formatted_issue_date: string;
    formatted_due_date: string;
    formatted_total: string;
    formatted_balance: string;
    formatted_amount_paid: string;
    formatted_base_amount: string;
    formatted_surcharge: string;
    formatted_penalty: string;
    formatted_discount: string;
    is_overdue: boolean;
    days_overdue: number;
    requirements_submitted?: string[];
    property_description?: string;
    business_type?: string;
    business_name?: string;
    area?: number;
    valid_from?: string;
    valid_until?: string;
    formatted_valid_from?: string;
    formatted_valid_until?: string;
    waiver_reason?: string;
    resident_info?: {
        id: number;
        full_name: string;
        first_name: string;
        last_name: string;
        contact_number?: string;
    };
    fee_type?: {
        id: number;
        code: string;
        name: string;
        category: string;
        category_display: string;
    };
}

interface Payment {
    date: string;
    amount: number;
    or_number: string;
    method: string;
    status: string;
}

interface PageProps {
    fee: Fee;
    paymentHistory: Payment[];
    canPayOnline: boolean;
    [key: string]: any;
}

type TabType = 'details' | 'payments';

export default function FeeDetails() {
    const { fee, paymentHistory, canPayOnline } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState<TabType>('details');
    const { isMobile } = useMobileDetect();
    
    // Memoized calculations
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
    
    // Debug logging in development only
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Fee data:', fee);
            console.log('Requirements submitted:', requirements);
        }
    }, [fee, requirements]);
    
    const getStatusKey = (): string => {
        if (fee.is_overdue) return 'overdue';
        return fee.status.toLowerCase();
    };
    
    const handleDownloadReceipt = () => {
        console.log('Downloading receipt for OR:', fee.or_number);
    };
    
    // Tab configuration
    const tabsConfig = [
        { id: 'details', label: 'Details', icon: Info },
        { id: 'payments', label: 'Payment History', icon: Receipt },
    ];

    const getTabCount = (tabId: string) => {
        if (tabId === 'payments') return paymentHistory.length;
        return 0;
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
                        
                        {fee.balance === 0 && fee.or_number && (
                            <Button variant="outline" onClick={handleDownloadReceipt} className="gap-2 rounded-xl">
                                <Download className="h-4 w-4" />
                                Download Receipt
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
                                        <p className="font-medium text-sm mt-1">{fee.fee_code}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Type</p>
                                        <p className="font-medium text-sm mt-1">{fee.fee_type?.name || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Issue Date</p>
                                        <p className="font-medium text-sm mt-1">{fee.formatted_issue_date}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500">Due Date</p>
                                        <div className="font-medium text-sm mt-1">
                                            {fee.formatted_due_date}
                                            {fee.is_overdue && fee.days_overdue > 0 && (
                                                <span className="text-xs text-red-500 block">
                                                    {fee.days_overdue} day{fee.days_overdue > 1 ? 's' : ''} overdue
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
                                        <p className="font-medium">{fee.payer_name}</p>
                                        {fee.payer_type === 'resident' && fee.is_own_fee && (
                                            <span className="text-xs text-blue-600 mt-1 block">(You)</span>
                                        )}
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-xs text-gray-500 mb-1">Address</p>
                                        <p className="font-medium">{fee.address}</p>
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
                                        <span className="font-medium">{fee.formatted_base_amount}</span>
                                    </div>
                                    
                                    {fee.surcharge_amount > 0 && (
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                            <span className="text-sm text-amber-600">Surcharge</span>
                                            <span className="font-medium text-amber-600">{fee.formatted_surcharge}</span>
                                        </div>
                                    )}
                                    
                                    {fee.penalty_amount > 0 && (
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                                            <span className="text-sm text-red-600">Penalty</span>
                                            <span className="font-medium text-red-600">{fee.formatted_penalty}</span>
                                        </div>
                                    )}
                                    
                                    {fee.discount_amount > 0 && (
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                            <span className="text-sm text-green-600">Discount</span>
                                            <span className="font-medium text-green-600">-{fee.formatted_discount}</span>
                                        </div>
                                    )}
                                    
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-900">
                                            <span className="font-semibold">Total Amount</span>
                                            <span className="text-xl font-bold">{fee.formatted_total}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                            <span className="text-sm text-blue-600">Amount Paid</span>
                                            <span className="font-medium text-blue-600">{fee.formatted_amount_paid}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                                            <span className="text-sm text-red-600">Balance Due</span>
                                            <span className={`text-lg font-bold ${fee.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {fee.formatted_balance}
                                            </span>
                                        </div>
                                    </div>
                                </div>
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
                                                    {fee.formatted_valid_from} to {fee.formatted_valid_until}
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
                                    message="No payments have been made for this fee yet."  // Changed from 'description' to 'message'
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
                                                            {formatCurrency(payment.amount)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                            <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                                                        </div>
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
            </div>
        </ResidentLayout>
    );
}