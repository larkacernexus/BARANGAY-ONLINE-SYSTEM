// resources/js/pages/admin/Payments/Show.tsx

import AppLayout from '@/layouts/admin-app-layout';
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
    Printer,
    Edit,
    Download,
    User,
    Users,
    Home,
    Receipt,
    Calendar,
    DollarSign,
    CreditCard,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    MapPin,
    Phone,
    Mail,
    AlertTriangle,
    Info,
    FileCheck,
    Check,
    X,
    Copy,
    ExternalLink,
    History,
    File,
    FileType,
    BookOpen,
    Shield,
    Award,
    Briefcase,
    Tag,
    Building,
    Wallet,
    Percent,
    AlertCircle,
    FileBarChart,
    FileSpreadsheet,
    Download as DownloadIcon,
    Eye,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Hash,
    CalendarDays,
    Clock as ClockIcon,
    CheckSquare,
    FileDigit,
    UserCheck,
    Mail as MailIcon,
    PhoneCall,
    Map,
    Globe,
    Banknote,
    Smartphone,
    Building2,
    CreditCard as CreditCardIcon,
    Landmark,
    FilePen,
    FileSearch,
    FileCode,
    FileJson,
    FileOutput,
    FileInput,
    FileStack,
    FolderOpen,
    Folder,
    FolderTree,
    Database,
    Archive,
    FolderArchive,
    FolderPlus,
    FolderMinus,
    FolderX,
    FolderCheck,
    FolderClock,
    FolderSearch,
    FolderKey,
    FolderLock,
    FolderUp,
    FolderDown,
    FolderSync,
    FolderHeart,
    FolderCog,
    FolderOpenDot
} from 'lucide-react';
import { Link, usePage, Head } from '@inertiajs/react';
import { useState, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintableReceipt from '@/components/admin/receipts/PrintableReceipt';

// ========== INTERFACES ==========
interface PaymentItem {
    id: number;
    fee_id?: number;
    clearance_request_id?: number;
    fee_name: string;
    fee_code: string;
    description?: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    total_amount: number;
    category: string;
    period_covered?: string;
    months_late?: number;
    fee_metadata?: Record<string, any>;
    fee?: FeeDetails;
    clearanceRequest?: ClearanceRequest;
}

interface RelatedPayment {
    id: number;
    or_number: string;
    payment_date: string;
    formatted_date: string;
    total_amount: number;
    formatted_total: string;
    status: string;
    status_display: string;
    recorder?: {
        id: number;
        name: string;
    };
}

interface PayerDetails {
    id: number;
    name: string;
    type: string;
    contact_number?: string;
    email?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    household?: {
        id: number;
        household_number: string;
        purok: string;
    };
    members?: Array<{
        id: number;
        name: string;
        relationship: string;
        resident?: {
            id: number;
            name: string;
        };
    }>;
}

interface ClearanceRequest {
    id: number;
    reference_number: string;
    clearance_number?: string;
    purpose?: string;
    specific_purpose?: string;
    urgency: string;
    urgency_display: string;
    needed_date?: string;
    formatted_needed_date?: string;
    fee_amount: number;
    formatted_fee: string;
    status: string;
    status_display: string;
    issue_date?: string;
    formatted_issue_date?: string;
    valid_until?: string;
    formatted_valid_until?: string;
    days_remaining?: number;
    is_valid: boolean;
    remarks?: string;
    admin_notes?: string;
    additional_requirements?: string;
    requirements_met?: string[];
    cancellation_reason?: string;
    processed_at?: string;
    formatted_processed_at?: string;
    created_at: string;
    formatted_created_at?: string;
    clearance_type?: {
        id: number;
        name: string;
        code: string;
        description?: string;
    };
    resident?: {
        id: number;
        name: string;
        household?: {
            id: number;
            household_number: string;
            purok: string;
        };
    };
    issuing_officer?: {
        id: number;
        username: string;
        email?: string;
    };
    processed_by?: {
        id: number;
        username: string;
        email?: string;
    };
    documents?: Array<{
        id: number;
        file_path: string;
        file_name: string;
        document_type: string;
        created_at: string;
    }>;
    estimated_completion_date?: string;
}

interface FeeDetails {
    id: number;
    fee_code: string;
    or_number?: string;
    fee_type?: {
        id: number;
        name: string;
        code: string;
        description?: string;
    };
    payer_type: string;
    resident?: {
        id: number;
        name: string;
        household?: {
            id: number;
            household_number: string;
            purok: string;
        };
    };
    household?: {
        id: number;
        household_number: string;
        purok: string;
    };
    business_name?: string;
    billing_period?: string;
    period_start?: string;
    formatted_period_start?: string;
    period_end?: string;
    formatted_period_end?: string;
    issue_date?: string;
    formatted_issue_date?: string;
    due_date?: string;
    formatted_due_date?: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    purpose?: string;
    property_description?: string;
    business_type?: string;
    area?: number;
    remarks?: string;
    status: string;
    certificate_number?: string;
    valid_from?: string;
    formatted_valid_from?: string;
    valid_until?: string;
    formatted_valid_until?: string;
    waiver_reason?: string;
    requirements_submitted?: string[];
    is_overdue?: boolean;
    days_overdue?: number;
    payment_percentage?: number;
    issued_by?: {
        id: number;
        name: string;
    };
    collected_by?: {
        id: number;
        name: string;
    };
    created_by?: {
        id: number;
        name: string;
    };
    cancelled_at?: string;
}

interface DiscountDetail {
    id: number | null;
    type: string;
    code?: string | null;
    amount: number;
    formatted_amount: string;
    id_number?: string | null;
    verified_by?: string | null;
    verified_at?: string | null;
    id_presented?: boolean;
}

interface Payment {
    id: number;
    or_number: string;
    payer_type: 'resident' | 'household' | 'business' | 'other';
    payer_id: number;
    payer_name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    payment_date: string;
    formatted_date: string;
    period_covered?: string;
    payment_method: string;
    payment_method_display: string;
    payment_method_details: {
        name: string;
        icon: string;
        color: string;
    };
    reference_number?: string;
    subtotal: number;
    formatted_subtotal: string;
    surcharge: number;
    formatted_surcharge: string;
    penalty: number;
    formatted_penalty: string;
    discount: number;
    formatted_discount: string;
    discount_type?: string;
    discount_code?: string;
    total_amount: number;
    formatted_total: string;
    purpose?: string;
    remarks?: string;
    is_cleared: boolean;
    is_cleared_display: string;
    certificate_type?: string;
    certificate_type_display?: string;
    validity_date?: string;
    formatted_validity_date?: string;
    collection_type: string;
    collection_type_display: string;
    status: 'completed' | 'pending' | 'cancelled' | 'refunded';
    status_display: string;
    method_details?: Record<string, any>;
    recorded_by?: number;
    recorder?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    formatted_created_at: string;
    updated_at: string;
    formatted_updated_at: string;
    items: PaymentItem[];
    payer?: PayerDetails | null;
    has_surcharge: boolean;
    has_penalty: boolean;
    has_discount: boolean;
    corrected_total?: number;
    formatted_corrected_total?: string;
}

interface PageProps {
    payment: Payment;
    clearanceRequests: ClearanceRequest[];
    fees: FeeDetails[];
    payer: PayerDetails | null;
    relatedPayments: RelatedPayment[];
    paymentBreakdown: {
        subtotal: number;
        formatted_subtotal: string;
        surcharge: number;
        formatted_surcharge: string;
        penalty: number;
        formatted_penalty: string;
        discount: number;
        formatted_discount: string;
        total: number;
        formatted_total: string;
    };
    discountDetails?: DiscountDetail[];
    isClearancePayment: boolean;
    isFeePayment: boolean;
    hasClearanceRequests: boolean;
    hasFees: boolean;
}

// ========== HELPER FUNCTIONS ==========
const getRoute = (name: string, params?: any) => {
    if (typeof window !== 'undefined' && (window as any).route) {
        try {
            return (window as any).route(name, params);
        } catch (e) {
            console.warn(`Route ${name} not found`);
        }
    }
    
    const fallbacks: Record<string, any> = {
        'payments.index': '/admin/payments',
        // 'payments.edit': (id: number) => `/admin/payments/${id}/edit`,
        'residents.show': (id: number) => `/admin/residents/${id}`,
        'households.show': (id: number) => `/admin/households/${id}`,
        'clearance-requests.show': (id: number) => `/admin/clearances/${id}`,
        'admin.fees.show': (id: number) => `/admin/fees/${id}`,
        'dashboard': '/dashboard',
    };
    
    const fallback = fallbacks[name];
    if (typeof fallback === 'function') {
        return fallback(params);
    }
    return fallback || '/';
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const formatDate = (dateString: string | undefined, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.hour12 = true;
        }
        
        return date.toLocaleDateString('en-PH', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

const getCertificateIcon = (certificateType?: string) => {
    if (!certificateType) return <File className="h-5 w-5 text-blue-600" />;
    
    const icons: Record<string, JSX.Element> = {
        'residency': <Home className="h-5 w-5 text-blue-600" />,
        'indigency': <Shield className="h-5 w-5 text-green-600" />,
        'clearance': <Award className="h-5 w-5 text-purple-600" />,
        'cedula': <FileType className="h-5 w-5 text-orange-600" />,
        'business': <Briefcase className="h-5 w-5 text-teal-600" />,
        'other': <File className="h-5 w-5 text-gray-600" />,
    };
    
    return icons[certificateType] || <File className="h-5 w-5 text-blue-600" />;
};

// ========== MAIN COMPONENT ==========
export default function PaymentShow() {
    const { 
        payment, 
        clearanceRequests, 
        fees, 
        payer, 
        relatedPayments, 
        paymentBreakdown,
        discountDetails = [],
        hasClearanceRequests,
        hasFees
    } = usePage<PageProps>().props;
    
    const [copied, setCopied] = useState(false);
    const [expandedClearanceRequests, setExpandedClearanceRequests] = useState<number[]>([]);
    const [expandedFees, setExpandedFees] = useState<number[]>([]);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `receipt-${payment.or_number}`,
        onAfterPrint: () => {
            setShowPrintPreview(false);
        },
    });

    // ========== CRITICAL FIX: Filter discount details to show only valid discounts ==========
    const validDiscountDetails = useMemo(() => {
        if (!discountDetails || discountDetails.length === 0) return [];
        
        // Log what we're getting from the backend
        console.log('🔍 Raw discount details from backend:', discountDetails);
        console.log('🔍 Payment discount from payment:', payment.discount);
        console.log('🔍 Payment discount type:', payment.discount_type);
        
        // Calculate total from discount details
        const totalFromDetails = discountDetails.reduce((sum, d) => sum + (d.amount || 0), 0);
        const paymentDiscount = payment.discount || 0;
        
        // If totals match exactly, return all discounts (they're all valid)
        if (Math.abs(totalFromDetails - paymentDiscount) < 0.01) {
            console.log('✅ Discount totals match exactly, showing all discounts');
            return discountDetails;
        }
        
        // If totals don't match, we need to filter
        console.warn('⚠️ Discount total mismatch! Filtering discounts...', {
            totalFromDetails,
            paymentDiscount,
            difference: totalFromDetails - paymentDiscount,
            discountDetails
        });
        
        // Strategy 1: Try to find discounts that match the payment discount type
        if (payment.discount_type) {
            const typeMatchDiscounts = discountDetails.filter(d => 
                d.type?.toLowerCase().includes(payment.discount_type?.toLowerCase() || '') ||
                d.code?.toLowerCase().includes(payment.discount_type?.toLowerCase() || '')
            );
            
            if (typeMatchDiscounts.length > 0) {
                const typeMatchTotal = typeMatchDiscounts.reduce((sum, d) => sum + (d.amount || 0), 0);
                if (Math.abs(typeMatchTotal - paymentDiscount) < 0.01) {
                    console.log('✅ Found discounts matching type:', typeMatchDiscounts);
                    return typeMatchDiscounts;
                }
            }
        }
        
        // Strategy 2: Take the single largest discount that's <= payment discount
        const sortedByAmount = [...discountDetails].sort((a, b) => b.amount - a.amount);
        const largestDiscount = sortedByAmount[0];
        
        if (largestDiscount && Math.abs(largestDiscount.amount - paymentDiscount) < 0.01) {
            console.log('✅ Found single discount matching amount:', largestDiscount);
            return [largestDiscount];
        }
        
        // Strategy 3: Take all discounts with positive amounts, but cap at payment discount
        const validDiscounts: DiscountDetail[] = [];
        let runningTotal = 0;
        
        for (const discount of discountDetails) {
            if (discount.amount <= 0) continue;
            
            if (runningTotal + discount.amount <= paymentDiscount + 0.01) {
                validDiscounts.push(discount);
                runningTotal += discount.amount;
            }
        }
        
        if (Math.abs(runningTotal - paymentDiscount) < 0.01 && validDiscounts.length > 0) {
            console.log('✅ Found combination of discounts:', validDiscounts);
            return validDiscounts;
        }
        
        // Strategy 4: Last resort - just show the first discount
        console.log('⚠️ Using first discount as fallback:', discountDetails[0]);
        return [discountDetails[0]];
        
    }, [discountDetails, payment.discount, payment.discount_type]);

    // Calculate total from valid discounts for verification
    const validDiscountTotal = useMemo(() => {
        return validDiscountDetails.reduce((sum, d) => sum + (d.amount || 0), 0);
    }, [validDiscountDetails]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleClearanceRequest = (id: number) => {
        setExpandedClearanceRequests(prev =>
            prev.includes(id) 
                ? prev.filter(reqId => reqId !== id)
                : [...prev, id]
        );
    };

    const toggleFee = (id: number) => {
        setExpandedFees(prev =>
            prev.includes(id)
                ? prev.filter(feeId => feeId !== id)
                : [...prev, id]
        );
    };

    const handlePrintReceipt = () => {
        setShowPrintPreview(true);
        // Small delay to ensure the printable component is rendered
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': 
            case 'paid':
            case 'issued':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'pending': 
                return <Clock className="h-5 w-5 text-amber-500" />;
            case 'cancelled':
            case 'rejected':
            case 'expired':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'processing':
            case 'partially_paid':
                return <ClockIcon className="h-5 w-5 text-blue-500" />;
            case 'overdue':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: 
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': 
            case 'paid':
            case 'issued':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': 
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'cancelled':
            case 'rejected':
            case 'expired':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'processing':
            case 'partially_paid':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'overdue':
                return 'bg-red-100 text-red-800 border-red-200';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getMethodIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case 'cash': 
                return <DollarSign className="h-5 w-5 text-green-600" />;
            case 'gcash':
                return <Smartphone className="h-5 w-5 text-blue-600" />;
            case 'maya':
                return <Smartphone className="h-5 w-5 text-purple-600" />;
            case 'online':
                return <Globe className="h-5 w-5 text-indigo-600" />;
            case 'bank':
                return <Banknote className="h-5 w-5 text-orange-600" />;
            case 'check':
                return <FileText className="h-5 w-5 text-red-600" />;
            default: 
                return <CreditCard className="h-5 w-5 text-gray-600" />;
        }
    };

    const getPayerIcon = (payerType: string) => {
        switch (payerType.toLowerCase()) {
            case 'resident': 
                return <User className="h-5 w-5 text-blue-600" />;
            case 'household':
                return <Users className="h-5 w-5 text-green-600" />;
            case 'business':
                return <Building2 className="h-5 w-5 text-teal-600" />;
            default: 
                return <User className="h-5 w-5 text-gray-600" />;
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency.toLowerCase()) {
            case 'express':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'rush':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'normal':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const totalItems = payment.items?.length || 0;
    const hasLateFees = payment.items?.some(item => item.surcharge > 0 || item.penalty > 0);
    const hasCertificate = payment.certificate_type !== null && payment.certificate_type !== undefined;

    // Prepare receipt data for printing
    const receiptData = useMemo(() => ({
        id: payment.id,
        receipt_number: payment.or_number,
        or_number: payment.or_number,
        receipt_type: 'official',
        receipt_type_label: 'OFFICIAL RECEIPT',
        payer_name: payment.payer_name,
        payer_address: payment.address || null,
        subtotal: payment.subtotal,
        surcharge: payment.surcharge,
        penalty: payment.penalty,
        discount: payment.discount,
        total_amount: payment.total_amount,
        amount_paid: payment.amount_paid,
        change_due: payment.amount_paid - (payment.total_amount - payment.discount),
        formatted_subtotal: payment.formatted_subtotal,
        formatted_surcharge: payment.formatted_surcharge,
        formatted_penalty: payment.formatted_penalty,
        formatted_discount: payment.formatted_discount,
        formatted_total: payment.formatted_total,
        formatted_amount_paid: payment.formatted_amount_paid,
        formatted_change: formatCurrency(payment.amount_paid - (payment.total_amount - payment.discount)),
        payment_method: payment.payment_method,
        payment_method_label: payment.payment_method_display,
        reference_number: payment.reference_number || null,
        formatted_payment_date: payment.formatted_date,
        formatted_issued_date: payment.formatted_date,
        issued_by: payment.recorder?.name || 'System',
        fee_breakdown: payment.items.map(item => ({
            fee_name: item.fee_name,
            fee_code: item.fee_code,
            base_amount: item.base_amount,
            total_amount: item.total_amount
        })),
        notes: payment.remarks || null
    }), [payment]);

    return (
        <>
            <Head title={`Payment #${payment.or_number}`} />
            
            {/* Hidden Print Preview */}
            {showPrintPreview && (
                <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
                    <PrintableReceipt 
                        ref={printRef} 
                        receipt={receiptData}
                        copyType="original"
                    />
                </div>
            )}
            
            <AppLayout
                title={`Payment #${payment.or_number}`}
                breadcrumbs={[
                    { title: 'Dashboard', href: getRoute('dashboard') },
                    { title: 'Payments', href: getRoute('payments.index') },
                    { title: `Payment #${payment.or_number}`, href: '#' }
                ]}
            >
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={getRoute('payments.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Payments
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payment #{payment.or_number}</h1>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1`}>
                                        {getStatusIcon(payment.status)}
                                        {payment.status_display}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        {getMethodIcon(payment.payment_method)}
                                        {payment.payment_method_display}
                                    </Badge>
                                    {payment.is_cleared && (
                                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                            <Check className="h-3 w-3 mr-1" />
                                            Cleared
                                        </Badge>
                                    )}
                                    {payment.collection_type === 'system' && (
                                        <Badge variant="outline" className="border-purple-200 text-purple-800 bg-purple-50">
                                            <Database className="h-3 w-3 mr-1" />
                                            System Generated
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => copyToClipboard(payment.or_number)}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                {copied ? 'Copied!' : 'Copy OR#'}
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handlePrintReceipt}
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print Receipt
                            </Button>
                            {/* <Link href={getRoute('payments.edit', payment.id)}>
                                <Button size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Payment
                                </Button>
                            </Link> */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Payment Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Payment Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Information</CardTitle>
                                    <CardDescription>
                                        Transaction details and payment breakdown
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-500">OR Number</p>
                                            <p className="font-semibold flex items-center gap-2">
                                                <Receipt className="h-4 w-4 text-gray-500" />
                                                {payment.or_number}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-500">Payment Date</p>
                                            <p className="font-semibold flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                {payment.formatted_date || formatDate(payment.payment_date)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                            <div className="flex items-center gap-2">
                                                {getMethodIcon(payment.payment_method)}
                                                <span className="font-semibold">{payment.payment_method_display}</span>
                                            </div>
                                            {payment.reference_number && (
                                                <p className="text-sm text-gray-600">
                                                    Reference: {payment.reference_number}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-500">Collection Type</p>
                                            <p className="font-semibold">{payment.collection_type_display}</p>
                                        </div>
                                        {payment.period_covered && (
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Period Covered</p>
                                                <p className="font-semibold">{payment.period_covered}</p>
                                            </div>
                                        )}
                                        {payment.purpose && (
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Purpose</p>
                                                <p className="font-semibold">{payment.purpose}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* PAYMENT BREAKDOWN - UPDATED WITH FILTERED DISCOUNTS */}
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold text-lg">Payment Breakdown</h4>
                                            {Math.abs(validDiscountTotal - (payment.discount || 0)) > 0.01 && (
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Discount Adjusted
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-medium">{paymentBreakdown.formatted_subtotal}</span>
                                            </div>
                                            
                                            {paymentBreakdown.surcharge > 0 && (
                                                <div className="flex justify-between text-amber-600">
                                                    <span className="flex items-center gap-1">
                                                        <Percent className="h-3 w-3" />
                                                        Surcharge
                                                    </span>
                                                    <span className="font-medium">{paymentBreakdown.formatted_surcharge}</span>
                                                </div>
                                            )}
                                            
                                            {paymentBreakdown.penalty > 0 && (
                                                <div className="flex justify-between text-red-600">
                                                    <span className="flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Penalty
                                                    </span>
                                                    <span className="font-medium">{paymentBreakdown.formatted_penalty}</span>
                                                </div>
                                            )}
                                            
                                            {/* Show individual discounts with their types - USING FILTERED VERSION */}
                                            {validDiscountDetails && validDiscountDetails.length > 0 ? (
                                                <>
                                                    {validDiscountDetails.map((discount, index) => (
                                                        <div key={index} className="flex justify-between text-green-600 border-b border-green-100 pb-1 last:border-0">
                                                            <div className="flex flex-col">
                                                                <span className="flex items-center gap-1">
                                                                    <Tag className="h-3 w-3" />
                                                                    <span>
                                                                        {discount.type} Discount
                                                                        {discount.code && (
                                                                            <span className="text-xs ml-1 text-gray-500">
                                                                                ({discount.code})
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                </span>
                                                                {discount.id_number && (
                                                                    <span className="text-xs text-gray-500 ml-4">
                                                                        ID: {discount.id_number}
                                                                    </span>
                                                                )}
                                                                {discount.verified_by && (
                                                                    <span className="text-xs text-gray-500 ml-4">
                                                                        Verified by: {discount.verified_by}
                                                                    </span>
                                                                )}
                                                                {discount.verified_at && (
                                                                    <span className="text-xs text-gray-500 ml-4">
                                                                        {discount.verified_at}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-green-600">
                                                                - {discount.formatted_amount}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    
                                                    {/* Show if filtered total doesn't match payment discount */}
                                                    {Math.abs(validDiscountTotal - (payment.discount || 0)) > 0.01 && (
                                                        <div className="flex justify-between text-gray-500 text-sm italic pt-1">
                                                            <span>Applied Discount</span>
                                                            <span>- {paymentBreakdown.formatted_discount}</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : paymentBreakdown.discount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span className="flex items-center gap-1">
                                                        <Tag className="h-3 w-3" />
                                                        Discount
                                                        {payment.discount_type && (
                                                            <span className="text-xs ml-1 text-gray-500">
                                                                ({payment.discount_type})
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="font-medium text-green-600">
                                                        - {paymentBreakdown.formatted_discount}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className="border-t pt-2 mt-2">
                                                <div className="flex justify-between text-lg font-bold">
                                                    <span>Total Amount</span>
                                                    <span>{paymentBreakdown.formatted_total}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificate Information (if applicable) */}
                                    {hasCertificate && (
                                        <div className="border rounded-lg p-4 bg-blue-50">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getCertificateIcon(payment.certificate_type)}
                                                <h4 className="font-semibold text-blue-800">Certificate Information</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-blue-700">Certificate Type</p>
                                                    <p className="font-semibold">{payment.certificate_type_display || payment.certificate_type}</p>
                                                </div>
                                                {payment.validity_date && (
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-700">Validity Date</p>
                                                        <p className="font-semibold">{payment.formatted_validity_date || formatDate(payment.validity_date)}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-3">
                                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                                    <FileCheck className="h-3 w-3 mr-1" />
                                                    Certificate Issued
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Items Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold">Payment Items ({totalItems})</h4>
                                            {hasLateFees && (
                                                <Badge variant="outline" className="text-amber-600 border-amber-200">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Contains Late Fees
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Item Description</TableHead>
                                                        <TableHead>Base Amount</TableHead>
                                                        <TableHead>Surcharge</TableHead>
                                                        <TableHead>Penalty</TableHead>
                                                        <TableHead className="text-right">Total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {payment.items?.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium">{item.fee_name}</div>
                                                                    {item.fee_code && (
                                                                        <div className="text-sm text-gray-500">Code: {item.fee_code}</div>
                                                                    )}
                                                                    {item.description && (
                                                                        <div className="text-sm text-gray-500">{item.description}</div>
                                                                    )}
                                                                    {item.period_covered && (
                                                                        <div className="text-xs text-gray-500">Period: {item.period_covered}</div>
                                                                    )}
                                                                    {item.months_late && item.months_late > 0 && (
                                                                        <div className="text-xs text-red-500">
                                                                            {item.months_late} month(s) late
                                                                        </div>
                                                                    )}
                                                                    {item.clearanceRequest && (
                                                                        <div className="mt-1">
                                                                            <Link 
                                                                                href={getRoute('clearance-requests.show', item.clearanceRequest.id)}
                                                                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                                                            >
                                                                                <FileSearch className="h-3 w-3" />
                                                                                View Clearance Request
                                                                            </Link>
                                                                        </div>
                                                                    )}
                                                                    {item.fee && (
                                                                        <div className="mt-1">
                                                                            <Link 
                                                                                href={getRoute('admin.fees.show', item.fee.id)}
                                                                                className="text-xs text-green-600 hover:text-green-800 hover:underline inline-flex items-center gap-1"
                                                                            >
                                                                                <FileBarChart className="h-3 w-3" />
                                                                                View Fee Details
                                                                            </Link>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">{formatCurrency(item.base_amount)}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.surcharge > 0 ? (
                                                                    <div className="text-amber-600 font-medium">
                                                                        {formatCurrency(item.surcharge)}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.penalty > 0 ? (
                                                                    <div className="text-red-600 font-medium">
                                                                        {formatCurrency(item.penalty)}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="font-bold">
                                                                    {formatCurrency(item.total_amount)}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        {hasLateFees && (
                                            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                This payment includes late fees (surcharge or penalty)
                                            </div>
                                        )}
                                    </div>

                                    {/* Remarks */}
                                    {payment.remarks && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Remarks</h4>
                                            <div className="bg-gray-50 border rounded p-4">
                                                <p className="text-gray-700 whitespace-pre-wrap">{payment.remarks}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Clearance Requests Card */}
                            {hasClearanceRequests && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileCheck className="h-5 w-5 text-blue-600" />
                                            Clearance Request Details
                                        </CardTitle>
                                        <CardDescription>
                                            Associated clearance requests for this payment
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {clearanceRequests.map((request) => (
                                                <div key={request.id} className="border rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => toggleClearanceRequest(request.id)}
                                                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {expandedClearanceRequests.includes(request.id) ? (
                                                                <ChevronUp className="h-4 w-4 text-gray-500" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4 text-gray-500" />
                                                            )}
                                                            <div>
                                                                <h4 className="font-semibold flex items-center gap-2">
                                                                    {request.clearance_type?.name || 'Clearance Request'}
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {request.reference_number}
                                                                    </Badge>
                                                                </h4>
                                                                {request.clearance_number && (
                                                                    <p className="text-sm text-gray-600">
                                                                        Clearance #: {request.clearance_number}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge className={getStatusColor(request.status)}>
                                                                {getStatusIcon(request.status)}
                                                                {request.status_display}
                                                            </Badge>
                                                            <Badge className={getUrgencyColor(request.urgency)}>
                                                                {request.urgency_display}
                                                            </Badge>
                                                        </div>
                                                    </button>
                                                    
                                                    {expandedClearanceRequests.includes(request.id) && (
                                                        <div className="p-4 border-t space-y-4 bg-gray-50">
                                                            {/* Request Details */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-500">Purpose</p>
                                                                    <p className="font-semibold">{request.purpose || 'N/A'}</p>
                                                                    {request.specific_purpose && (
                                                                        <p className="text-sm text-gray-600 mt-1">{request.specific_purpose}</p>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-500">Fee</p>
                                                                    <p className="text-lg font-bold text-green-600">{request.formatted_fee}</p>
                                                                </div>
                                                            </div>

                                                            {/* Status & Dates */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {request.needed_date && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Needed By</p>
                                                                        <p className="font-semibold">{request.formatted_needed_date}</p>
                                                                    </div>
                                                                )}
                                                                {request.issue_date && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Issued On</p>
                                                                        <p className="font-semibold">{request.formatted_issue_date}</p>
                                                                    </div>
                                                                )}
                                                                {request.valid_until && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Valid Until</p>
                                                                        <p className={`font-semibold ${request.is_valid ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {request.formatted_valid_until}
                                                                            {request.days_remaining !== undefined && (
                                                                                <span className="text-sm font-normal ml-2">
                                                                                    ({Math.abs(request.days_remaining)} days {request.days_remaining > 0 ? 'remaining' : 'ago'})
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Requested By */}
                                                            {request.resident && (
                                                                <div className="border-t pt-4">
                                                                    <p className="text-sm font-medium text-gray-500 mb-2">Requested By</p>
                                                                    <div className="flex items-center gap-3">
                                                                        <User className="h-5 w-5 text-gray-500" />
                                                                        <div>
                                                                            <p className="font-semibold">{request.resident.name}</p>
                                                                            {request.resident.household && (
                                                                                <p className="text-sm text-gray-600">
                                                                                    House #{request.resident.household.household_number} • 
                                                                                    Purok {request.resident.household.purok}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Officers */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                                                {request.issuing_officer && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Issued By</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <UserCheck className="h-4 w-4 text-gray-500" />
                                                                            <span>{request.issuing_officer.username}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {request.processed_by && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Processed By</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <UserCheck className="h-4 w-4 text-gray-500" />
                                                                            <span>{request.processed_by.username}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Additional Information */}
                                                            {(request.remarks || request.admin_notes) && (
                                                                <div className="border-t pt-4">
                                                                    {request.remarks && (
                                                                        <div className="mb-3">
                                                                            <p className="text-sm font-medium text-gray-500">Remarks</p>
                                                                            <p className="text-sm text-gray-700 mt-1">{request.remarks}</p>
                                                                        </div>
                                                                    )}
                                                                    {request.admin_notes && (
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-500">Admin Notes</p>
                                                                            <p className="text-sm text-gray-700 mt-1">{request.admin_notes}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Action Button */}
                                                            <div className="border-t pt-4">
                                                                <Link 
                                                                    href={getRoute('clearance-requests.show', request.id)}
                                                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                                                >
                                                                    <FileSearch className="h-4 w-4" />
                                                                    View Full Clearance Request Details
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Fee Details Card */}
                            {hasFees && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileBarChart className="h-5 w-5 text-green-600" />
                                            Fee Details
                                        </CardTitle>
                                        <CardDescription>
                                            Associated fees for this payment
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {fees.map((fee) => (
                                                <div key={fee.id} className="border rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => toggleFee(fee.id)}
                                                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {expandedFees.includes(fee.id) ? (
                                                                <ChevronUp className="h-4 w-4 text-gray-500" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4 text-gray-500" />
                                                            )}
                                                            <div>
                                                                <h4 className="font-semibold flex items-center gap-2">
                                                                    {fee.fee_type?.name || 'Fee'}
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {fee.fee_code}
                                                                    </Badge>
                                                                </h4>
                                                                {fee.or_number && (
                                                                    <p className="text-sm text-gray-600">OR: {fee.or_number}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold">{formatCurrency(fee.total_amount)}</p>
                                                                <Badge className={getStatusColor(fee.status)}>
                                                                    {getStatusIcon(fee.status)}
                                                                    {fee.status}
                                                                    {fee.is_overdue && fee.days_overdue && fee.days_overdue > 0 && (
                                                                        <span className="ml-1">({fee.days_overdue} days overdue)</span>
                                                                    )}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </button>
                                                    
                                                    {expandedFees.includes(fee.id) && (
                                                        <div className="p-4 border-t space-y-4 bg-gray-50">
                                                            {/* Fee Details */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-500">Payer Type</p>
                                                                    <Badge variant="outline" className="mt-1">
                                                                        {getPayerIcon(fee.payer_type)}
                                                                        {fee.payer_type}
                                                                    </Badge>
                                                                </div>
                                                                {fee.payer_type === 'resident' && fee.resident && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Resident</p>
                                                                        <p className="font-semibold">{fee.resident.name}</p>
                                                                        {fee.resident.household && (
                                                                            <p className="text-sm text-gray-600">
                                                                                House #{fee.resident.household.household_number}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {fee.payer_type === 'household' && fee.household && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Household</p>
                                                                        <p className="font-semibold">House #{fee.household.household_number}</p>
                                                                        <p className="text-sm text-gray-600">Purok {fee.household.purok}</p>
                                                                    </div>
                                                                )}
                                                                {fee.business_name && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Business</p>
                                                                        <p className="font-semibold">{fee.business_name}</p>
                                                                        {fee.business_type && (
                                                                            <p className="text-sm text-gray-600">Type: {fee.business_type}</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Dates */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {fee.issue_date && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Issue Date</p>
                                                                        <p className="font-semibold">{fee.formatted_issue_date}</p>
                                                                    </div>
                                                                )}
                                                                {fee.due_date && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Due Date</p>
                                                                        <p className={`font-semibold ${fee.is_overdue ? 'text-red-600' : 'text-gray-700'}`}>
                                                                            {fee.formatted_due_date}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {fee.period_start && fee.period_end && (
                                                                    <div className="md:col-span-2">
                                                                        <p className="text-sm font-medium text-gray-500">Billing Period</p>
                                                                        <p className="font-semibold">
                                                                            {fee.formatted_period_start} to {fee.formatted_period_end}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {fee.valid_until && (
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-500">Valid Until</p>
                                                                        <p className="font-semibold">{fee.formatted_valid_until}</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Amount Breakdown */}
                                                            <div className="border-t pt-4">
                                                                <h5 className="font-medium text-gray-700 mb-3">Amount Breakdown</h5>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                    <div className="text-center p-3 bg-white rounded border">
                                                                        <p className="text-sm text-gray-600">Base Amount</p>
                                                                        <p className="text-lg font-bold">{formatCurrency(fee.base_amount)}</p>
                                                                    </div>
                                                                    {fee.surcharge_amount > 0 && (
                                                                        <div className="text-center p-3 bg-amber-50 rounded border border-amber-200">
                                                                            <p className="text-sm text-amber-600">Surcharge</p>
                                                                            <p className="text-lg font-bold text-amber-600">{formatCurrency(fee.surcharge_amount)}</p>
                                                                        </div>
                                                                    )}
                                                                    {fee.penalty_amount > 0 && (
                                                                        <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                                                                            <p className="text-sm text-red-600">Penalty</p>
                                                                            <p className="text-lg font-bold text-red-600">{formatCurrency(fee.penalty_amount)}</p>
                                                                        </div>
                                                                    )}
                                                                    {fee.discount_amount > 0 && (
                                                                        <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                                                                            <p className="text-sm text-green-600">Discount</p>
                                                                            <p className="text-lg font-bold text-green-600">{formatCurrency(fee.discount_amount)}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Payment Progress */}
                                                            <div className="border-t pt-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-600">Payment Progress</p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {formatCurrency(fee.amount_paid)} of {formatCurrency(fee.total_amount)} paid
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm font-medium text-gray-600">Balance</p>
                                                                        <p className={`text-lg font-bold ${fee.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                            {formatCurrency(fee.balance)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div 
                                                                        className="bg-green-600 h-2 rounded-full" 
                                                                        style={{ width: `${fee.payment_percentage || 0}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                                    <span>0%</span>
                                                                    <span>{(fee.payment_percentage || 0).toFixed(1)}%</span>
                                                                    <span>100%</span>
                                                                </div>
                                                            </div>

                                                            {/* Officers */}
                                                            {(fee.issued_by || fee.collected_by) && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                                                    {fee.issued_by && (
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-500">Issued By</p>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <UserCheck className="h-4 w-4 text-gray-500" />
                                                                                <span>{fee.issued_by.name}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {fee.collected_by && (
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-500">Collected By</p>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <UserCheck className="h-4 w-4 text-gray-500" />
                                                                                <span>{fee.collected_by.name}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Action Button */}
                                                            <div className="border-t pt-4">
                                                                <Link 
                                                                    href={getRoute('admin.fees.show', fee.id)}
                                                                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-800"
                                                                >
                                                                    <FileBarChart className="h-4 w-4" />
                                                                    View Full Fee Details
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Payer & Related Info */}
                        <div className="space-y-6">
                            {/* Payer Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {getPayerIcon(payment.payer_type)}
                                        Payer Information
                                    </CardTitle>
                                    <CardDescription>
                                        {payment.payer_type === 'resident' ? 'Resident' : 
                                         payment.payer_type === 'household' ? 'Household' :
                                         payment.payer_type === 'business' ? 'Business' : 'Other'} details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Payer Name</p>
                                        <p className="font-semibold text-lg">{payment.payer_name}</p>
                                        <Badge variant="outline" className="mt-1 capitalize">
                                            {getPayerIcon(payment.payer_type)}
                                            {payment.payer_type}
                                        </Badge>
                                    </div>

                                    {payer && (
                                        <>
                                            {payer.type === 'resident' && payer.household && (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-500">Household</p>
                                                    <div className="flex items-center gap-2">
                                                        <Home className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p>House #{payer.household.household_number}</p>
                                                            <p className="text-sm text-gray-500">Purok {payer.household.purok}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {payer.contact_number && (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-500">Contact Number</p>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                        <span>{payer.contact_number}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {payer.email && (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-500" />
                                                        <span className="text-sm break-all">{payer.email}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {payer.address && (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-500">Address</p>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm">{payer.address}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* View Payer Profile Button */}
                                            <div className="pt-4">
                                                {payer.type === 'resident' ? (
                                                    <Link 
                                                        href={getRoute('residents.show', payer.id)}
                                                    >
                                                        <Button variant="outline" className="w-full">
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            View Resident Profile
                                                        </Button>
                                                    </Link>
                                                ) : payer.type === 'household' ? (
                                                    <Link 
                                                        href={getRoute('households.show', payer.id)}
                                                    >
                                                        <Button variant="outline" className="w-full">
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            View Household Profile
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button variant="outline" className="w-full" disabled>
                                                        <Info className="h-4 w-4 mr-2" />
                                                        No Profile Available
                                                    </Button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recording Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recording Information</CardTitle>
                                    <CardDescription>
                                        Details about who recorded this payment
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Recorded By</p>
                                        <p className="font-semibold">{payment.recorder?.name || 'System'}</p>
                                        {payment.recorder?.email && (
                                            <p className="text-sm text-gray-600">{payment.recorder.email}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Created</p>
                                            <p className="text-sm">{payment.formatted_created_at || formatDate(payment.created_at, true)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                            <p className="text-sm">{payment.formatted_updated_at || formatDate(payment.updated_at, true)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Related Payments Card */}
                            {relatedPayments.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <History className="h-5 w-5 text-gray-500" />
                                            Related Payments
                                        </CardTitle>
                                        <CardDescription>
                                            Previous payments from the same payer
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {relatedPayments.map((related) => (
                                                <Link 
                                                    key={related.id}
                                                    href={`/admin/payments/${related.id}`}
                                                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-sm">{related.or_number}</div>
                                                            <div className="text-xs text-gray-500">{related.formatted_date}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-semibold">{related.formatted_total}</div>
                                                            <Badge 
                                                                variant="outline" 
                                                                className={`text-xs ${getStatusColor(related.status)}`}
                                                            >
                                                                {related.status_display}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="mt-4">
                                            <Link 
                                                href={getRoute('payments.index') + `?payer_id=${payment.payer_id}&payer_type=${payment.payer_type}`}
                                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                            >
                                                View all payments from this payer
                                                <ChevronRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Payment Status Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-gray-500" />
                                        Payment Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Cleared Status</span>
                                            <Badge variant={payment.is_cleared ? "default" : "outline"} className={payment.is_cleared ? "bg-green-100 text-green-800 border-green-200" : ""}>
                                                {payment.is_cleared ? (
                                                    <span className="flex items-center gap-1">
                                                        <Check className="h-3 w-3" />
                                                        Cleared
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Not Cleared
                                                    </span>
                                                )}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Collection Type</span>
                                            <span className="text-sm font-medium">{payment.collection_type_display}</span>
                                        </div>
                                        {payment.method_details && Object.keys(payment.method_details).length > 0 && (
                                            <div className="pt-3 border-t">
                                                <p className="text-sm font-medium mb-2">Payment Method Details</p>
                                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                                                    <pre className="text-xs whitespace-pre-wrap">
                                                        {JSON.stringify(payment.method_details, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Discount Summary Card (if multiple discounts) */}
                            {validDiscountDetails && validDiscountDetails.length > 1 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Tag className="h-5 w-5 text-green-600" />
                                            Discount Summary
                                        </CardTitle>
                                        <CardDescription>
                                            Details of all discounts applied
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {validDiscountDetails.map((discount, index) => (
                                                <div key={index} className="border-b border-green-100 last:border-0 pb-2 last:pb-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-green-800">{discount.type} Discount</p>
                                                            <div className="text-xs text-gray-600 space-y-1 mt-1">
                                                                {discount.code && (
                                                                    <p>Code: {discount.code}</p>
                                                                )}
                                                                {discount.id_number && (
                                                                    <p>ID Number: {discount.id_number}</p>
                                                                )}
                                                                {discount.verified_by && (
                                                                    <p>Verified by: {discount.verified_by}</p>
                                                                )}
                                                                {discount.verified_at && (
                                                                    <p>Verified at: {discount.verified_at}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-green-700">{discount.formatted_amount}</p>
                                                            {discount.id_presented && (
                                                                <Badge variant="outline" className="mt-1 bg-green-100 text-green-700 border-green-200 text-xs">
                                                                    ID Presented
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-2 border-t border-green-200">
                                                <div className="flex justify-between font-semibold">
                                                    <span>Total Discount</span>
                                                    <span className="text-green-700">{paymentBreakdown.formatted_discount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}