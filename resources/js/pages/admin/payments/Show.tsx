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
    Tag
} from 'lucide-react';
import { Link, usePage, Head } from '@inertiajs/react';
import { useState } from 'react';

interface PaymentItem {
    id: number;
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
    fee?: {
        id: number;
        name: string;
        code: string;
        description?: string;
    };
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
}

interface PayerDetails {
    id: number;
    name: string;
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
    }>;
}

interface Payment {
    id: number;
    or_number: string;
    payer_type: 'resident' | 'household';
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
    total_amount: number;
    formatted_total: string;
    purpose?: string;
    remarks?: string;
    is_cleared: boolean;
    is_cleared_display: string;
    certificate_type?: string;
    certificate_type_display?: string;
    validity_date?: string;
    collection_type: string;
    collection_type_display: string;
    status: 'completed' | 'pending' | 'cancelled';
    status_display: string;
    method_details?: Record<string, any>;
    recorded_by?: number;
    recorder?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
    items: PaymentItem[];
    payer?: PayerDetails | null;
    has_surcharge: boolean;
    has_penalty: boolean;
    has_discount: boolean;
}

interface PageProps {
    payment: Payment;
    relatedPayments: RelatedPayment[];
    paymentBreakdown: {
        subtotal: number;
        surcharge: number;
        penalty: number;
        discount: number;
        total: number;
    };
}

// Helper function to get routes
const getRoute = (name: string, params?: any) => {
    if (typeof window !== 'undefined' && (window as any).route) {
        try {
            return (window as any).route(name, params);
        } catch (e) {
            console.warn(`Route ${name} not found`);
        }
    }
    
    const fallbacks: Record<string, any> = {
        'payments.index': '/payments',
        'payments.edit': (id: number) => `/payments/${id}/edit`,
        'payments.receipt': (id: number) => `/payments/${id}/receipt`,
        'residents.show': (id: number) => `/residents/${id}`,
        'households.show': (id: number) => `/households/${id}`,
    };
    
    const fallback = fallbacks[name];
    if (typeof fallback === 'function') {
        return fallback(params);
    }
    return fallback || '/';
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...(includeTime && {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

// Helper function to get certificate icon
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

export default function PaymentShow() {
    const { payment, relatedPayments, paymentBreakdown } = usePage<PageProps>().props;
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': 
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'pending': 
                return <Clock className="h-5 w-5 text-amber-500" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-gray-500" />;
            default: 
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': 
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': 
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'cash': 
                return <DollarSign className="h-5 w-5 text-green-600" />;
            case 'gcash':
            case 'maya':
            case 'online':
                return <CreditCard className="h-5 w-5 text-blue-600" />;
            case 'bank':
                return <FileText className="h-5 w-5 text-purple-600" />;
            case 'check':
                return <Receipt className="h-5 w-5 text-orange-600" />;
            default: 
                return <CreditCard className="h-5 w-5 text-gray-600" />;
        }
    };

    const getPayerIcon = (payerType: string) => {
        switch (payerType) {
            case 'resident': 
                return <User className="h-5 w-5 text-blue-600" />;
            case 'household':
                return <Users className="h-5 w-5 text-green-600" />;
            default: 
                return <User className="h-5 w-5 text-gray-600" />;
        }
    };

    const totalItems = payment.items?.length || 0;
    const hasLateFees = payment.items?.some(item => item.surcharge > 0 || item.penalty > 0);
    const hasCertificate = payment.certificate_type !== null && payment.certificate_type !== undefined;

    return (
        <>
            <Head title={`Payment #${payment.or_number}`} />
            <AppLayout
                title={`Payment #${payment.or_number}`}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Payments', href: getRoute('payments.index') },
                    { title: `Payment #${payment.or_number}`, href: '#' }
                ]}
            >
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={getRoute('payments.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Payments
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Payment #{payment.or_number}</h1>
                                <div className="flex items-center gap-2 mt-1">
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
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => copyToClipboard(payment.or_number)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {copied ? 'Copied!' : 'Copy OR#'}
                            </Button>
                            <Link href={getRoute('payments.receipt', payment.id)}>
                                <Button variant="outline">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Receipt
                                </Button>
                            </Link>
                            <Link href={getRoute('payments.edit', payment.id)}>
                                <Button>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Payment
                                </Button>
                            </Link>
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
                                                {payment.formatted_date || formatDate(payment.payment_date, true)}
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

                                    {/* Payment Breakdown */}
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <h4 className="font-semibold mb-3">Payment Breakdown</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-medium">{payment.formatted_subtotal}</span>
                                            </div>
                                            {payment.has_surcharge && (
                                                <div className="flex justify-between text-amber-600">
                                                    <span>+ Surcharge</span>
                                                    <span className="font-medium">{payment.formatted_surcharge}</span>
                                                </div>
                                            )}
                                            {payment.has_penalty && (
                                                <div className="flex justify-between text-red-600">
                                                    <span>+ Penalty</span>
                                                    <span className="font-medium">{payment.formatted_penalty}</span>
                                                </div>
                                            )}
                                            {payment.has_discount && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>- Discount</span>
                                                    <span className="font-medium">{payment.formatted_discount}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 mt-2">
                                                <div className="flex justify-between text-lg font-bold">
                                                    <span>Total Amount</span>
                                                    <span>{payment.formatted_total}</span>
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
                                                    <p className="font-semibold">{payment.certificate_type_display}</p>
                                                </div>
                                                {payment.validity_date && (
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-700">Validity Date</p>
                                                        <p className="font-semibold">{formatDate(payment.validity_date)}</p>
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
                                        <h4 className="font-semibold mb-3">Payment Items ({totalItems})</h4>
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
                                                <p className="text-gray-700">{payment.remarks}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
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
                                        {payment.payer_type === 'resident' ? 'Resident' : 'Household'} details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Payer Name</p>
                                        <p className="font-semibold text-lg">{payment.payer_name}</p>
                                        <p className="text-sm text-gray-600 capitalize">{payment.payer_type}</p>
                                    </div>

                                    {payment.payer && (
                                        <>
                                            {payment.payer_type === 'resident' && payment.payer.household && (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-500">Household</p>
                                                    <div className="flex items-center gap-2">
                                                        <Home className="h-4 w-4 text-gray-500" />
                                                        <span>House #{payment.payer.household.household_number}</span>
                                                        <span className="text-gray-500">•</span>
                                                        <span>Purok {payment.payer.household.purok}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {payment.payer.contact_number && (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-500">Contact Number</p>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                        <span>{payment.payer.contact_number}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {payment.payer.email && (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-500" />
                                                        <span>{payment.payer.email}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {payment.payer.address && (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-500">Address</p>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                                        <span className="text-sm">{payment.payer.address}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* View Payer Profile Button */}
                                            <div className="pt-4">
                                                <Link 
                                                    href={payment.payer_type === 'resident' 
                                                        ? getRoute('residents.show', payment.payer_id)
                                                        : getRoute('households.show', payment.payer_id)
                                                    }
                                                >
                                                    <Button variant="outline" className="w-full">
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        View {payment.payer_type === 'resident' ? 'Resident' : 'Household'} Profile
                                                    </Button>
                                                </Link>
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
                                            <p className="text-sm">{formatDate(payment.created_at, true)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                            <p className="text-sm">{formatDate(payment.updated_at, true)}</p>
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
                                                    href={`/payments/${related.id}`}
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
                                                href={getRoute('payments.index')} 
                                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                View all payments from this payer →
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
                                            <Badge variant={payment.is_cleared ? "default" : "outline"}>
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
                                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                                    <pre className="text-xs whitespace-pre-wrap">
                                                        {JSON.stringify(payment.method_details, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}