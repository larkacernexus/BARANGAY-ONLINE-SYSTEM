import { useEffect, useState, useMemo } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    Briefcase
} from 'lucide-react';
import { Link, usePage, Head } from '@inertiajs/react';

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
    [key: string]: any; // Add index signature to satisfy Inertia's PageProps constraint
}

type TabType = 'details' | 'payments';

// Status configuration for better maintainability
const STATUS_CONFIG = {
    paid: {
        label: 'Paid',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
    pending: {
        label: 'Pending',
        icon: Clock,
        className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    },
    partially_paid: {
        label: 'Partially Paid',
        icon: CreditCard,
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    },
    issued: {
        label: 'Issued',
        icon: FileText,
        className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    },
    overdue: {
        label: 'Overdue',
        icon: AlertCircle,
        className: 'bg-red-100 text-red-800 hover:bg-red-100',
    },
} as const;

export default function FeeDetails() {
    const { fee, paymentHistory, canPayOnline } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState<TabType>('details');
    
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
    
    // Status badge component
    const StatusBadge = useMemo(() => {
        const config = fee.is_overdue ? STATUS_CONFIG.overdue : STATUS_CONFIG[fee.status.toLowerCase() as keyof typeof STATUS_CONFIG];
        
        if (!config) {
            return <Badge variant="outline">{fee.status}</Badge>;
        }
        
        const Icon = config.icon;
        
        return (
            <Badge className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    }, [fee.status, fee.is_overdue]);
    
    // Helper functions
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };
    
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Invalid Date';
        }
    };
    
    const handleDownloadReceipt = () => {
        // Implement receipt download logic
        console.log('Downloading receipt for OR:', fee.or_number);
        // Add actual download implementation here
    };
    
    // Tab configuration
    const tabs = [
        {
            id: 'details',
            label: 'Details',
            icon: Info,
            enabled: true,
        },
        {
            id: 'payments',
            label: 'Payment History',
            icon: Receipt,
            enabled: paymentHistory.length > 0,
        },
    ] as const;
    
    return (
        <ResidentLayout
            // Remove title prop from Layout since it doesn't accept it
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Fees', href: '/residentfees' },
                { title: `Fee: ${fee.fee_code}`, href: `/residentfees/${fee.id}` }
            ]}
        >
            <Head title={`Fee: ${fee.fee_code}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link href="/residentfees">
                                <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {fee.fee_code} - {fee.purpose}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    {fee.fee_type?.category_display || 'Fee Assessment'}
                                    {!fee.is_own_fee && fee.resident_info && (
                                        <span className="ml-2 text-sm flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            For: {fee.resident_info.full_name}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {StatusBadge}
                        {fee.balance > 0 && canPayOnline && (
                            <Link href={`/resident/payments/create?fee_id=${fee.id}`}>
                                <Button className="gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Pay Now
                                </Button>
                            </Link>
                        )}
                        {fee.balance === 0 && fee.or_number && (
                            <Button variant="outline" onClick={handleDownloadReceipt} className="gap-2">
                                <Download className="h-4 w-4" />
                                Download Receipt
                            </Button>
                        )}
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="border-b">
                    <nav className="flex space-x-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                                onClick={() => setActiveTab(tab.id)}
                                disabled={!tab.enabled}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Fee Information */}
                            <FeeInfoCard fee={fee} />
                            
                            {/* Payer Information */}
                            <PayerInfoCard fee={fee} />
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Amount Breakdown */}
                            <AmountBreakdownCard fee={fee} />
                            
                            {/* Additional Information */}
                            {hasAdditionalInfo && (
                                <AdditionalInfoCard fee={fee} requirements={requirements} />
                            )}
                        </div>
                    </div>
                )}
                
                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <PaymentHistoryCard paymentHistory={paymentHistory} />
                )}
            </div>
        </ResidentLayout>
    );
}

// Sub-components for better organization
interface FeeInfoCardProps {
    fee: Fee;
}

const FeeInfoCard: React.FC<FeeInfoCardProps> = ({ fee }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Fee Information
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Fee Code</p>
                    <p className="font-medium">{fee.fee_code}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{fee.fee_type?.name || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-medium">{fee.formatted_issue_date}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <div className={`font-medium ${fee.is_overdue ? 'text-red-600' : ''}`}>
                        {fee.formatted_due_date}
                        {fee.is_overdue && fee.days_overdue > 0 && (
                            <span className="text-xs text-red-500 block mt-1">
                                {fee.days_overdue} day{fee.days_overdue > 1 ? 's' : ''} overdue
                            </span>
                        )}
                    </div>
                </div>
                {fee.billing_period && (
                    <div className="col-span-1 sm:col-span-2">
                        <p className="text-sm text-gray-500">Billing Period</p>
                        <p className="font-medium">{fee.billing_period}</p>
                    </div>
                )}
                {fee.period_start && fee.period_end && (
                    <div className="col-span-1 sm:col-span-2">
                        <p className="text-sm text-gray-500">Coverage Period</p>
                        <p className="font-medium">
                            {fee.formatted_issue_date} to {fee.formatted_due_date}
                        </p>
                    </div>
                )}
            </div>
            
            {fee.remarks && (
                <div>
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p className="font-medium text-sm">{fee.remarks}</p>
                </div>
            )}
        </CardContent>
    </Card>
);

interface PayerInfoCardProps {
    fee: Fee;
}

const PayerInfoCard: React.FC<PayerInfoCardProps> = ({ fee }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Payer Information
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{fee.payer_name}</p>
                {fee.payer_type === 'resident' && fee.is_own_fee && (
                    <span className="text-xs text-blue-600">(You)</span>
                )}
            </div>
            <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{fee.address}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fee.purok && (
                    <div>
                        <p className="text-sm text-gray-500">Purok</p>
                        <p className="font-medium">{fee.purok}</p>
                    </div>
                )}
                {fee.zone && (
                    <div>
                        <p className="text-sm text-gray-500">Zone</p>
                        <p className="font-medium">{fee.zone}</p>
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
);

interface AmountBreakdownCardProps {
    fee: Fee;
}

const AmountBreakdownCard: React.FC<AmountBreakdownCardProps> = ({ fee }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Amount Breakdown
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Amount</span>
                    <span className="font-medium">{fee.formatted_base_amount}</span>
                </div>
                
                {fee.surcharge_amount > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Surcharge</span>
                        <span className="font-medium text-amber-600">{fee.formatted_surcharge}</span>
                    </div>
                )}
                
                {fee.penalty_amount > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Penalty</span>
                        <span className="font-medium text-red-600">{fee.formatted_penalty}</span>
                    </div>
                )}
                
                {fee.discount_amount > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium text-green-600">-{fee.formatted_discount}</span>
                    </div>
                )}
                
                <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-xl font-bold">{fee.formatted_total}</span>
                    </div>
                </div>
                
                <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Amount Paid</span>
                        <span className="font-medium text-green-600">{fee.formatted_amount_paid}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Balance Due</span>
                        <span className={`text-lg font-bold ${fee.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {fee.formatted_balance}
                        </span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

interface AdditionalInfoCardProps {
    fee: Fee;
    requirements: string[];
}

const AdditionalInfoCard: React.FC<AdditionalInfoCardProps> = ({ fee, requirements }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Additional Information
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {fee.business_name && (
                <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="font-medium">{fee.business_name}</p>
                </div>
            )}
            
            {fee.business_type && (
                <div>
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-medium">{fee.business_type}</p>
                </div>
            )}
            
            {fee.property_description && (
                <div>
                    <p className="text-sm text-gray-500">Property Description</p>
                    <p className="font-medium">{fee.property_description}</p>
                </div>
            )}
            
            {fee.area && (
                <div>
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="font-medium">{fee.area.toLocaleString()} sq.m.</p>
                </div>
            )}
            
            {fee.valid_from && fee.valid_until && (
                <div>
                    <p className="text-sm text-gray-500">Validity Period</p>
                    <p className="font-medium">
                        {fee.formatted_valid_from} to {fee.formatted_valid_until}
                    </p>
                </div>
            )}
            
            {fee.certificate_number && (
                <div>
                    <p className="text-sm text-gray-500">Certificate Number</p>
                    <p className="font-medium">{fee.certificate_number}</p>
                </div>
            )}
            
            {fee.or_number && (
                <div>
                    <p className="text-sm text-gray-500">Official Receipt</p>
                    <p className="font-medium font-mono">{fee.or_number}</p>
                </div>
            )}
            
            {requirements.length > 0 && (
                <div>
                    <p className="text-sm text-gray-500">Requirements Submitted</p>
                    <ul className="space-y-1 mt-2">
                        {requirements.map((req, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{typeof req === 'string' ? req : JSON.stringify(req)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </CardContent>
    </Card>
);

interface PaymentHistoryCardProps {
    paymentHistory: Payment[];
}

const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({ paymentHistory }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment History
            </CardTitle>
            <CardDescription>
                All payments made towards this fee
            </CardDescription>
        </CardHeader>
        <CardContent>
            {paymentHistory.length === 0 ? (
                <EmptyState />
            ) : (
                <PaymentHistoryTable paymentHistory={paymentHistory} />
            )}
        </CardContent>
    </Card>
);

const EmptyState: React.FC = () => (
    <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Receipt className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No payment history</h3>
        <p className="text-gray-500 dark:text-gray-400">
            No payments have been made for this fee yet.
        </p>
    </div>
);

interface PaymentHistoryTableProps {
    paymentHistory: Payment[];
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ paymentHistory }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>OR Number</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paymentHistory.map((payment, index) => (
                        <TableRow key={`${payment.or_number}-${index}`}>
                            <TableCell className="font-medium">
                                {new Date(payment.date).toLocaleDateString('en-PH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
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
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Completed
                                    </Badge>
                                ) : (
                                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1">
                                        <Clock className="h-3 w-3" />
                                        Pending
                                    </Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};