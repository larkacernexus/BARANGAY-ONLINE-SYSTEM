import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Download,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    DollarSign,
    Calendar,
    User,
    Home,
    Building,
    FileCheck,
    MessageSquare,
    History,
    Edit,
    Trash2,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    Shield,
    TrendingUp,
    FileSignature,
    Tag,
    Percent,
    Calculator,
    CreditCard,
    AlertTriangle,
    Bell,
    Eye,
    FileDown,
    Printer
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import PrintableReceipt from '@/components/admin/receipts/PrintableReceipt';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface Fee {
    id: number;
    fee_code: string;
    fee_type_id: number;
    payer_type: string;
    payer_name: string;
    contact_number?: string;
    address?: string;
    purok: string;
    zone?: string;
    purpose?: string;
    issue_date: string;
    due_date: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    status_display?: string;
    payment_date?: string;
    payment_method?: string;
    or_number?: string;
    transaction_reference?: string;
    certificate_number?: string;
    valid_from?: string;
    valid_until?: string;
    property_description?: string;
    business_type?: string;
    area?: string;
    billing_period?: string;
    period_start?: string;
    period_end?: string;
    computation_details?: string;
    requirements_submitted?: string;
    remarks?: string;
    waiver_reason?: string;
    created_at: string;
    updated_at: string;
    cancelled_at?: string;
    
    fee_type?: {
        id: number;
        code: string;
        name: string;
        description?: string;
        base_amount: number;
        amount_type: string;
        has_senior_discount: boolean;
        senior_discount_percentage?: number;
        has_pwd_discount: boolean;
        pwd_discount_percentage?: number;
        has_solo_parent_discount: boolean;
        solo_parent_discount_percentage?: number;
        has_indigent_discount: boolean;
        indigent_discount_percentage?: number;
        has_surcharge: boolean;
        surcharge_percentage?: number;
        has_penalty: boolean;
        penalty_percentage?: number;
        requirements?: string[];
    };
    
    resident?: {
        id: number;
        name: string;
        full_name: string;
        contact_number?: string;
        email?: string;
        address?: string;
        purok: string;
        zone?: string;
        birth_date?: string;
        gender?: string;
        occupation?: string;
        is_senior: boolean;
        is_pwd: boolean;
        is_solo_parent: boolean;
        is_indigent: boolean;
        profile_photo?: string;
    };
    
    household?: {
        id: number;
        name: string;
        address: string;
        household_head_name: string;
        contact_number?: string;
        purok: string;
        zone?: string;
    };
    
    business?: {
        id: number;
        business_name: string;
        owner_name: string;
        business_type: string;
        address: string;
        contact_number?: string;
        email?: string;
        purok: string;
        zone?: string;
    };
    
    issued_by_user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    
    collected_by_user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    
    approved_by_user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

interface PaymentDiscount {
    id: number;
    rule_name: string;
    discount_type: string | null;
    amount: number;
    formatted_amount: string;
    id_number: string | null;
    verified_by: string;
}

interface PaymentHistory {
    id: number;
    amount: number;
    formatted_amount: string;
    subtotal: number;
    formatted_subtotal: string;
    discounts: PaymentDiscount[];
    total_discount: number;
    formatted_total_discount: string;
    description: string;
    payment_date: string | null;
    or_number: string | null;
    payment_method: string | null;
    reference_number: string | null;
    status: string;
    received_by: string;
    created_at: string | null;
}

interface RelatedFee {
    id: number;
    fee_code: string;
    fee_type_name: string;
    total_amount: string;
    status: string;
    status_label?: string;
    issue_date: string;
}

interface Permissions {
    can_edit: boolean;
    can_delete: boolean;
    can_record_payment: boolean;
    can_cancel: boolean;
    can_waive: boolean;
    can_view_audit?: boolean;
    can_approve?: boolean;
    can_collect?: boolean;
}

interface FeesShowProps {
    fee: Fee;
    related_fees?: RelatedFee[];
    payment_history?: PaymentHistory[];
    permissions?: Permissions;
}

export default function FeesShow({
    fee,
    related_fees = [],
    payment_history = [],
    permissions = {
        can_edit: false,
        can_delete: false,
        can_record_payment: false,
        can_cancel: false,
        can_waive: false
    }
}: FeesShowProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showReceiptPreview, setShowReceiptPreview] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'computation' | 'requirements' | 'history'>('details');
    const [isPrinting, setIsPrinting] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Debug effect to check when receipt renders
    useEffect(() => {
        if (showReceiptPreview && receiptRef.current) {
            console.log('✅ Receipt rendered successfully');
            console.log('Receipt content length:', receiptRef.current.innerHTML.length);
        } else if (showReceiptPreview && !receiptRef.current) {
            console.log('⏳ Waiting for receipt to render...');
        }
    }, [showReceiptPreview, selectedPayment]);

    // Format date
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Not set';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatDateTime = (dateString?: string): string => {
        if (!dateString) return 'Not set';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Get status badge variant
    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
            'pending': 'secondary',
            'partially_paid': 'outline',
            'paid': 'success',
            'overdue': 'destructive',
            'cancelled': 'destructive',
            'waived': 'outline',
            'approved': 'success',
            'collected': 'default'
        };
        return variants[status] || 'outline';
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'pending': <Clock className="h-4 w-4 text-amber-500" />,
            'partially_paid': <Percent className="h-4 w-4 text-indigo-500" />,
            'paid': <CheckCircle className="h-4 w-4 text-green-500" />,
            'overdue': <AlertCircle className="h-4 w-4 text-red-500" />,
            'cancelled': <XCircle className="h-4 w-4 text-gray-500" />,
            'waived': <FileCheck className="h-4 w-4 text-purple-500" />,
            'approved': <CheckCircle className="h-4 w-4 text-blue-500" />,
            'collected': <FileCheck className="h-4 w-4 text-teal-500" />
        };
        return icons[status] || null;
    };

    // Format currency
    const formatCurrency = (amount: number | string | undefined): string => {
        if (amount === undefined || amount === null) return '₱0.00';
        if (typeof amount === 'string' && amount.startsWith('₱')) return amount;
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return '₱0.00';
        
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numAmount);
    };

    // Get payer icon based on type
    const getPayerIcon = (payerType: string) => {
        switch (payerType) {
            case 'resident':
                return <User className="h-5 w-5" />;
            case 'household':
                return <Home className="h-5 w-5" />;
            case 'business':
                return <Building className="h-5 w-5" />;
            default:
                return <User className="h-5 w-5" />;
        }
    };

    // Get payer information
    const getPayerInfo = () => {
        if (fee.payer_type === 'resident' && fee.resident) {
            return {
                name: fee.resident.name || fee.resident.full_name,
                contact: fee.resident.contact_number || fee.contact_number,
                email: fee.resident.email,
                address: fee.resident.address || fee.address,
                purok: fee.resident.purok || fee.purok,
                zone: fee.resident.zone || fee.zone,
                classification: '',
                link: `/residents/${fee.resident.id}`,
                icon: getPayerIcon('resident'),
                typeLabel: 'Resident',
                isSenior: fee.resident.is_senior,
                isPWD: fee.resident.is_pwd,
                isSoloParent: fee.resident.is_solo_parent,
                isIndigent: fee.resident.is_indigent,
                profile_photo: fee.resident.profile_photo,
                birth_date: fee.resident.birth_date,
                gender: fee.resident.gender,
                occupation: fee.resident.occupation
            };
        }
        if (fee.payer_type === 'household' && fee.household) {
            return {
                name: fee.household.name,
                contact: fee.household.contact_number || fee.contact_number,
                email: '',
                address: fee.household.address || fee.address,
                purok: fee.household.purok || fee.purok,
                zone: fee.household.zone || fee.zone,
                classification: 'Household',
                link: `/households/${fee.household.id}`,
                icon: getPayerIcon('household'),
                typeLabel: 'Household',
                isSenior: false,
                isPWD: false,
                isSoloParent: false,
                isIndigent: false
            };
        }
        if (fee.payer_type === 'business' && fee.business) {
            return {
                name: fee.business.business_name,
                contact: fee.business.contact_number || fee.contact_number,
                email: fee.business.email,
                address: fee.business.address || fee.address,
                purok: fee.business.purok || fee.purok,
                zone: fee.business.zone || fee.zone,
                classification: fee.business.business_type,
                link: `/businesses/${fee.business.id}`,
                icon: getPayerIcon('business'),
                typeLabel: 'Business',
                isSenior: false,
                isPWD: false,
                isSoloParent: false,
                isIndigent: false
            };
        }
        return {
            name: fee.payer_name || 'Unknown',
            contact: fee.contact_number,
            email: '',
            address: fee.address || '',
            purok: fee.purok || '',
            zone: fee.zone || '',
            classification: '',
            link: null,
            icon: getPayerIcon(fee.payer_type),
            typeLabel: fee.payer_type.charAt(0).toUpperCase() + fee.payer_type.slice(1),
            isSenior: false,
            isPWD: false,
            isSoloParent: false,
            isIndigent: false
        };
    };

    const payerInfo = getPayerInfo();

    // Check if fee is overdue
    const isOverdue = (): boolean => {
        try {
            const due = new Date(fee.due_date);
            const today = new Date();
            return today > due && fee.balance > 0 && fee.status !== 'paid';
        } catch (error) {
            return false;
        }
    };

    // Calculate days overdue
    const getDaysOverdue = (): number => {
        if (!isOverdue()) return 0;
        try {
            const due = new Date(fee.due_date);
            const today = new Date();
            const diffTime = today.getTime() - due.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            return 0;
        }
    };

    // Get payment progress
    const getPaymentProgress = (): number => {
        if (!fee.total_amount || fee.total_amount === 0) return 0;
        const progress = (fee.amount_paid / fee.total_amount) * 100;
        return Math.min(100, Math.max(0, Math.round(progress * 100) / 100));
    };

    // Handle actions
    const handleDownloadCertificate = () => {
        if (fee.certificate_number) {
            window.open(`/admin/fees/${fee.id}/certificate/download`, '_blank');
        }
    };

    const handleRecordPayment = () => {
        router.get(`/admin/payments/create?fee_id=${fee.id}`);
    };

    const handleSendReminder = () => {
        if (confirm('Send payment reminder to payer?')) {
            setIsProcessing(true);
            router.post(`/admin/fees/${fee.id}/send-reminder`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleApprove = () => {
        if (confirm('Approve this fee?')) {
            setIsProcessing(true);
            router.post(`/admin/fees/${fee.id}/approve`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleCollect = () => {
        if (confirm('Mark this fee as collected?')) {
            setIsProcessing(true);
            router.post(`/admin/fees/${fee.id}/collect`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleWaive = () => {
        const reason = prompt('Please enter the reason for waiving this fee:');
        if (reason) {
            setIsProcessing(true);
            router.post(`/admin/fees/${fee.id}/waive`, { reason }, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleCancel = () => {
        const reason = prompt('Please enter the reason for cancellation:');
        if (reason !== null) {
            setIsProcessing(true);
            router.post(`/admin/fees/${fee.id}/cancel`, { reason }, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this fee? This action cannot be undone.')) {
            router.delete(`/admin/fees/${fee.id}`);
        }
    };

    const handleEdit = () => {
        router.visit(`/admin/fees/${fee.id}/edit`);
    };

    // Handle viewing receipt
    const handleViewReceipt = (payment: PaymentHistory) => {
        console.log('Opening receipt for payment:', payment);
        const receiptData = generateReceiptData(payment);
        console.log('Generated receipt data:', receiptData);
        setSelectedPayment(payment);
        setShowReceiptPreview(true);
    };

    // Handle downloading receipt as PDF (server-side)
    const handleDownloadReceipt = (payment: PaymentHistory) => {
        const url = `/admin/payments/${payment.id}/receipt?action=download`;
        window.open(url, '_blank');
    };

    // Handle printing receipt
    const handlePrintReceipt = () => {
        if (!receiptRef.current) {
            console.error('Receipt ref is null');
            alert('Receipt not ready. Please try again.');
            return;
        }

        setIsPrinting(true);
        
        try {
            // Get the receipt content
            const receiptContent = receiptRef.current.innerHTML;
            
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Please allow pop-ups to print the receipt');
                setIsPrinting(false);
                return;
            }

            // Get all styles from the document
            const styles = Array.from(document.styleSheets)
                .map(sheet => {
                    try {
                        return Array.from(sheet.cssRules || [])
                            .map(rule => rule.cssText)
                            .join('');
                    } catch (e) {
                        return '';
                    }
                })
                .join('');

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Payment Receipt - ${selectedPayment?.or_number || 'Receipt'}</title>
                    <style>
                        ${styles}
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                            background: white;
                            margin: 0;
                        }
                        .print\\:hidden { display: none; }
                        .no-print { display: none; }
                        @media print {
                            body { print-color-adjust: exact; }
                            .print\\:hidden { display: none !important; }
                        }
                    </style>
                </head>
                <body>
                    ${receiptContent}
                    <div class="no-print" style="text-align: center; margin-top: 20px; padding: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                            Print Receipt
                        </button>
                        <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Close
                        </button>
                    </div>
                    <script>
                        // Auto-trigger print dialog after a short delay
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    </script>
                </body>
                </html>
            `);
            
            printWindow.document.close();
        } catch (error) {
            console.error('Error printing receipt:', error);
            alert('Failed to print receipt. Please try again.');
        } finally {
            setIsPrinting(false);
        }
    };

    // Simple print using browser's print dialog
    const handleSimplePrint = () => {
        if (!receiptRef.current) {
            alert('Receipt not ready');
            return;
        }
        window.print();
    };

    // Generate receipt data for PrintableReceipt
    const generateReceiptData = (payment: PaymentHistory) => {
        return {
            id: payment.id,
            receipt_number: `RCP-${payment.or_number || payment.id}-${new Date().getFullYear()}`,
            or_number: payment.or_number,
            receipt_type: 'payment',
            receipt_type_label: 'OFFICIAL RECEIPT',
            payer_name: payerInfo.name,
            payer_address: payerInfo.address || 'N/A',
            subtotal: payment.subtotal || payment.amount,
            surcharge: fee.surcharge_amount || 0,
            penalty: fee.penalty_amount || 0,
            discount: payment.total_discount || 0,
            total_amount: payment.amount,
            amount_paid: payment.amount,
            change_due: 0,
            formatted_subtotal: payment.formatted_subtotal || formatCurrency(payment.subtotal || payment.amount),
            formatted_surcharge: formatCurrency(fee.surcharge_amount || 0),
            formatted_penalty: formatCurrency(fee.penalty_amount || 0),
            formatted_discount: payment.formatted_total_discount || formatCurrency(payment.total_discount || 0),
            formatted_total: payment.formatted_amount || formatCurrency(payment.amount),
            formatted_amount_paid: payment.formatted_amount || formatCurrency(payment.amount),
            formatted_change: '₱0.00',
            payment_method: payment.payment_method || 'cash',
            payment_method_label: (payment.payment_method || 'cash').toUpperCase(),
            reference_number: payment.reference_number,
            formatted_payment_date: payment.payment_date || formatDate(new Date().toISOString()),
            formatted_issued_date: formatDate(new Date().toISOString()),
            issued_by: payment.received_by || 'System',
            fee_breakdown: [
                {
                    fee_name: fee.fee_type?.name || 'Fee',
                    fee_code: fee.fee_code,
                    base_amount: fee.base_amount,
                    total_amount: payment.subtotal || payment.amount
                }
            ],
            notes: payment.description || '',
            payment_id: payment.id,
            clearance_request_id: null
        };
    };

    // Copy reference number to clipboard
    const copyReferenceNumber = () => {
        navigator.clipboard.writeText(fee.fee_code);
        alert('Fee code copied to clipboard!');
    };

    // Calculate remaining validity
    const getValidityStatus = () => {
        if (fee.status !== 'paid' || !fee.valid_until) {
            return null;
        }

        const today = new Date();
        const validUntil = new Date(fee.valid_until);
        const diffTime = validUntil.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return { text: `Valid for ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: 'text-green-600' };
        } else if (diffDays === 0) {
            return { text: 'Expires today', color: 'text-amber-600' };
        } else {
            return { text: `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`, color: 'text-red-600' };
        }
    };

    const validityStatus = getValidityStatus();

    // Parse computation details
    const parseComputationDetails = () => {
        try {
            if (fee.computation_details) {
                return JSON.parse(fee.computation_details);
            }
        } catch (error) {
            console.error('Failed to parse computation details:', error);
        }
        return null;
    };

    const computationDetails = parseComputationDetails();

    // Parse requirements
    const parseRequirements = () => {
        try {
            if (fee.requirements_submitted) {
                return JSON.parse(fee.requirements_submitted);
            }
        } catch (error) {
            console.error('Failed to parse requirements:', error);
        }
        return [];
    };

    const submittedRequirements = parseRequirements();

    return (
        <AppLayout
            title={`Fee: ${fee.fee_code}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fees', href: '/admin/fees' },
                { title: fee.fee_code, href: `/admin/fees/${fee.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header with Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/fees">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Fee Details</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={getStatusVariant(fee.status)} className="flex items-center gap-1">
                                    {getStatusIcon(fee.status)}
                                    {fee.status_display || fee.status}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    <Tag className="h-3 w-3 text-gray-500" />
                                    <span className="text-sm text-gray-600 font-mono cursor-pointer hover:underline" 
                                          onClick={copyReferenceNumber} 
                                          title="Click to copy">
                                        {fee.fee_code}
                                    </span>
                                </div>
                                {fee.certificate_number && (
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-3 w-3 text-gray-500" />
                                        <span className="text-sm text-gray-600 font-mono">
                                            {fee.certificate_number}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline"
                            onClick={handleEdit}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>

                        {permissions.can_delete && ['pending', 'partially_paid'].includes(fee.status) && (
                            <Button variant="outline" onClick={handleDelete} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Banner - For paid fees with certificate */}
                {fee.status === 'paid' && validityStatus && fee.certificate_number && (
                    <Card className={`border-l-4 ${validityStatus.color.includes('green') ? 'border-l-green-500' : validityStatus.color.includes('amber') ? 'border-l-amber-500' : 'border-l-red-500'}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className={`h-5 w-5 ${validityStatus.color}`} />
                                    <div>
                                        <p className="font-medium">Certificate Status</p>
                                        <p className={`text-sm ${validityStatus.color}`}>
                                            {validityStatus.text} • Issued on {formatDate(fee.payment_date)} • Certificate #{fee.certificate_number}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleDownloadCertificate}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Certificate
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Overdue Warning Banner */}
                {isOverdue() && (
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    <div>
                                        <p className="font-medium">Fee Overdue</p>
                                        <p className="text-sm text-red-600">
                                            This fee is {getDaysOverdue()} day{getDaysOverdue() !== 1 ? 's' : ''} overdue. Please follow up with the payer.
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleSendReminder} disabled={isProcessing}>
                                    <Bell className="h-4 w-4 mr-2" />
                                    {isProcessing ? 'Sending...' : 'Send Reminder'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Fee Details with Tabs */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('computation')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'computation' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Computation
                                </button>
                                <button
                                    onClick={() => setActiveTab('requirements')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'requirements' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Requirements
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Payment History
                                    {payment_history.length > 0 && (
                                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                            {payment_history.length}
                                        </span>
                                    )}
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="pt-2">
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Fee Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Fee Type</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-sm">
                                                            {fee.fee_type?.name || 'N/A'}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">({fee.fee_type?.code})</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Purpose</p>
                                                    <p className="text-sm">{fee.purpose || 'Not specified'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Payer Type</p>
                                                    <Badge variant="outline">
                                                        {payerInfo.typeLabel}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                                    <p className="text-lg font-semibold">
                                                        {formatCurrency(fee.total_amount)}
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Issued Date</p>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(fee.issue_date)}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <CalendarDays className="h-3 w-3" />
                                                        {formatDate(fee.due_date)}
                                                    </div>
                                                </div>
                                            </div>

                                            {fee.billing_period && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Billing Period</p>
                                                    <p className="text-sm text-gray-600">{fee.billing_period}</p>
                                                    {fee.period_start && fee.period_end && (
                                                        <p className="text-xs text-gray-500">
                                                            ({formatDate(fee.period_start)} - {formatDate(fee.period_end)})
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {(fee.property_description || fee.business_type || fee.area) && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">
                                                        {fee.payer_type === 'business' ? 'Business Details' : 'Property Details'}
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {fee.property_description && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Property Description</p>
                                                                <p className="text-sm">{fee.property_description}</p>
                                                            </div>
                                                        )}
                                                        {fee.business_type && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Business Type</p>
                                                                <p className="text-sm">{fee.business_type}</p>
                                                            </div>
                                                        )}
                                                        {fee.area && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Area</p>
                                                                <p className="text-sm">{fee.area} sqm</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                {payerInfo.icon}
                                                Payer Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {payerInfo.name ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        {payerInfo.profile_photo ? (
                                                            <img
                                                                src={payerInfo.profile_photo}
                                                                alt={payerInfo.name}
                                                                className="h-16 w-16 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                                                {payerInfo.icon}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{payerInfo.name}</h3>
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                                {payerInfo.contact && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="h-3 w-3" />
                                                                        {payerInfo.contact}
                                                                    </span>
                                                                )}
                                                                {payerInfo.email && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Mail className="h-3 w-3" />
                                                                        {payerInfo.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Address</p>
                                                            <p className="text-sm flex items-start gap-1">
                                                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                                {payerInfo.address || 'No address provided'}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Purok/Zone</p>
                                                            <p className="text-sm">
                                                                {payerInfo.purok}
                                                                {payerInfo.zone && ` (Zone ${payerInfo.zone})`}
                                                            </p>
                                                        </div>
                                                        {payerInfo.birth_date && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                                                                <p className="text-sm">{formatDate(payerInfo.birth_date)}</p>
                                                            </div>
                                                        )}
                                                        {payerInfo.gender && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Gender</p>
                                                                <p className="text-sm capitalize">{payerInfo.gender}</p>
                                                            </div>
                                                        )}
                                                        {payerInfo.occupation && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Occupation</p>
                                                                <p className="text-sm">{payerInfo.occupation}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Special Classifications */}
                                                    {(payerInfo.isSenior || payerInfo.isPWD || payerInfo.isSoloParent || payerInfo.isIndigent) && (
                                                        <div className="pt-4 border-t">
                                                            <p className="text-sm font-medium text-gray-500 mb-2">Special Classifications</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {payerInfo.isSenior && (
                                                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                                                        Senior Citizen
                                                                    </Badge>
                                                                )}
                                                                {payerInfo.isPWD && (
                                                                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                                                        PWD
                                                                    </Badge>
                                                                )}
                                                                {payerInfo.isSoloParent && (
                                                                    <Badge variant="outline" className="bg-pink-50 text-pink-700">
                                                                        Solo Parent
                                                                    </Badge>
                                                                )}
                                                                {payerInfo.isIndigent && (
                                                                    <Badge variant="outline" className="bg-red-50 text-red-700">
                                                                        Indigent
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">Payer information not available</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Computation Tab */}
                            {activeTab === 'computation' && (
                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calculator className="h-5 w-5" />
                                                Fee Computation
                                            </CardTitle>
                                            <CardDescription>
                                                Detailed breakdown of how the fee amount was calculated
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {/* Summary */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Base Amount</p>
                                                            <p className="text-2xl font-bold">{formatCurrency(fee.base_amount)}</p>
                                                        </div>
                                                        {fee.surcharge_amount > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Surcharge</p>
                                                                <p className="text-lg font-semibold text-orange-600">
                                                                    + {formatCurrency(fee.surcharge_amount)}
                                                                </p>
                                                                {fee.fee_type?.surcharge_percentage && (
                                                                    <p className="text-xs text-gray-500">
                                                                        {fee.fee_type.surcharge_percentage}% of base amount
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        {fee.penalty_amount > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Penalty</p>
                                                                <p className="text-lg font-semibold text-red-600">
                                                                    + {formatCurrency(fee.penalty_amount)}
                                                                </p>
                                                                {fee.fee_type?.penalty_percentage && (
                                                                    <p className="text-xs text-gray-500">
                                                                        {fee.fee_type.penalty_percentage}% of base amount
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-4">
                                                        {fee.discount_amount > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Discount</p>
                                                                <p className="text-lg font-semibold text-green-600">
                                                                    - {formatCurrency(fee.discount_amount)}
                                                                </p>
                                                                {fee.fee_type?.has_senior_discount && payerInfo.isSenior && (
                                                                    <p className="text-xs text-gray-500">
                                                                        Senior Citizen Discount: {fee.fee_type.senior_discount_percentage}%
                                                                    </p>
                                                                )}
                                                                {fee.fee_type?.has_pwd_discount && payerInfo.isPWD && (
                                                                    <p className="text-xs text-gray-500">
                                                                        PWD Discount: {fee.fee_type.pwd_discount_percentage}%
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                                            <p className="text-3xl font-bold">{formatCurrency(fee.total_amount)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Detailed Computation */}
                                                {computationDetails && (
                                                    <div className="pt-4 border-t">
                                                        <p className="text-sm font-medium text-gray-500 mb-2">Detailed Computation</p>
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
                                                                {JSON.stringify(computationDetails, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Requirements Tab */}
                            {activeTab === 'requirements' && (
                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileCheck className="h-5 w-5" />
                                                Requirements
                                            </CardTitle>
                                            <CardDescription>
                                                Requirements for this fee type and submitted documents
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {/* Fee Type Requirements */}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 mb-3">Fee Type Requirements</p>
                                                    {(() => {
                                                        const requirements = fee.fee_type?.requirements;
                                                        let requirementsArray: string[] = [];
                                                        
                                                        if (requirements) {
                                                            if (Array.isArray(requirements)) {
                                                                requirementsArray = requirements;
                                                            } else if (typeof requirements === 'string') {
                                                                try {
                                                                    const parsed = JSON.parse(requirements);
                                                                    requirementsArray = Array.isArray(parsed) ? parsed : [];
                                                                } catch {
                                                                    requirementsArray = [];
                                                                }
                                                            }
                                                        }
                                                        
                                                        if (requirementsArray.length > 0) {
                                                            return (
                                                                <ul className="space-y-2">
                                                                    {requirementsArray.map((req: string, index: number) => (
                                                                        <li key={index} className="flex items-center gap-2">
                                                                            <FileText className="h-4 w-4 text-gray-400" />
                                                                            <span className="text-sm">{req}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            );
                                                        }
                                                        return <p className="text-gray-500 text-sm">No requirements specified for this fee type.</p>;
                                                    })()}
                                                </div>

                                                {/* Submitted Requirements */}
                                                <div className="pt-4 border-t">
                                                    <p className="text-sm font-medium text-gray-500 mb-3">Submitted Requirements</p>
                                                    {(() => {
                                                        const submittedReqs = fee.requirements_submitted;
                                                        let submittedRequirementsArray: string[] = [];
                                                        
                                                        if (submittedReqs) {
                                                            if (Array.isArray(submittedReqs)) {
                                                                submittedRequirementsArray = submittedReqs;
                                                            } else if (typeof submittedReqs === 'string') {
                                                                try {
                                                                    const parsed = JSON.parse(submittedReqs);
                                                                    submittedRequirementsArray = Array.isArray(parsed) ? parsed : [];
                                                                } catch {
                                                                    submittedRequirementsArray = [];
                                                                }
                                                            }
                                                        }
                                                        
                                                        if (submittedRequirementsArray.length > 0) {
                                                            return (
                                                                <ul className="space-y-2">
                                                                    {submittedRequirementsArray.map((req: string, index: number) => (
                                                                        <li key={index} className="flex items-center gap-2">
                                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                                            <span className="text-sm">{req}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            );
                                                        }
                                                        return <p className="text-gray-500 text-sm">No requirements submitted for this fee.</p>;
                                                    })()}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Payment History Tab */}
                            {activeTab === 'history' && (
                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <History className="h-5 w-5" />
                                                Payment History
                                            </CardTitle>
                                            <CardDescription>
                                                Record of all payments made for this fee
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {payment_history && payment_history.length > 0 ? (
                                                <div className="space-y-6">
                                                    {payment_history.map((payment) => (
                                                        <div key={payment.id} className="space-y-4">
                                                            {/* Main Payment Entry */}
                                                            <div className="flex gap-3 pb-4 border-l-2 border-gray-200">
                                                                <div className="flex-shrink-0 w-6 h-6 -ml-3 mt-0.5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="font-medium">{payment.formatted_amount || formatCurrency(payment.amount)}</p>
                                                                            <div className="flex items-center gap-1">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 px-2 text-xs"
                                                                                    onClick={() => handleViewReceipt(payment)}
                                                                                >
                                                                                    <Eye className="h-3 w-3 mr-1" />
                                                                                    View
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 px-2 text-xs"
                                                                                    onClick={() => handleDownloadReceipt(payment)}
                                                                                >
                                                                                    <FileDown className="h-3 w-3 mr-1" />
                                                                                    PDF
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500">{formatDateTime(payment.payment_date || payment.created_at)}</p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                                                                    
                                                                    {/* Payment Details */}
                                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                        {payment.or_number && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                OR#: {payment.or_number}
                                                                            </Badge>
                                                                        )}
                                                                        {payment.payment_method && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {payment.payment_method.toUpperCase()}
                                                                            </Badge>
                                                                        )}
                                                                        {payment.reference_number && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Ref: {payment.reference_number}
                                                                            </Badge>
                                                                        )}
                                                                        <Badge variant="outline" className="text-xs">
                                                                            By {payment.received_by}
                                                                        </Badge>
                                                                    </div>

                                                                    {/* Discounts Section */}
                                                                    {payment.discounts && payment.discounts.length > 0 && (
                                                                        <div className="mt-3 bg-green-50 p-3 rounded-lg">
                                                                            <p className="text-xs font-medium text-green-700 mb-2">Applied Discounts</p>
                                                                            <div className="space-y-2">
                                                                                {payment.discounts.map((discount) => (
                                                                                    <div key={discount.id} className="flex justify-between items-center text-sm">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-green-600">●</span>
                                                                                            <span className="text-gray-700">{discount.rule_name}</span>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            <span className="font-medium text-green-700">
                                                                                                - {discount.formatted_amount || formatCurrency(discount.amount)}
                                                                                            </span>
                                                                                            {discount.id_number && (
                                                                                                <span className="block text-xs text-gray-500">
                                                                                                    ID: {discount.id_number}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                                {payment.total_discount > 0 && (
                                                                                    <div className="pt-2 border-t border-green-200 flex justify-between items-center">
                                                                                        <span className="text-sm font-medium text-gray-700">Total Discount</span>
                                                                                        <span className="text-sm font-bold text-green-700">
                                                                                            - {payment.formatted_total_discount || formatCurrency(payment.total_discount)}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Subtotal and Total Breakdown */}
                                                                    {payment.subtotal > 0 && (
                                                                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                                                                            <div className="flex justify-between">
                                                                                <span>Subtotal:</span>
                                                                                <span>{payment.formatted_subtotal || formatCurrency(payment.subtotal)}</span>
                                                                            </div>
                                                                            {payment.total_discount > 0 && (
                                                                                <div className="flex justify-between text-green-600">
                                                                                    <span>Discounts:</span>
                                                                                    <span>- {payment.formatted_total_discount || formatCurrency(payment.total_discount)}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex justify-between font-medium text-gray-700 pt-1 border-t border-gray-200">
                                                                                <span>Total Paid:</span>
                                                                                <span>{payment.formatted_amount || formatCurrency(payment.amount)}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <History className="h-12 w-12 mx-auto text-gray-400" />
                                                    <h3 className="mt-4 text-lg font-semibold">No payment history</h3>
                                                    <p className="text-gray-500 mt-1">
                                                        No payments have been recorded for this fee yet.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Status & Actions */}
                    <div className="space-y-6">
                        {/* Status Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Status Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                                    <Badge variant={getStatusVariant(fee.status)} className="flex items-center gap-1 w-fit">
                                        {getStatusIcon(fee.status)}
                                        {fee.status_display || fee.status}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Payment Progress</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Paid: {formatCurrency(fee.amount_paid)}</span>
                                            <span className="font-medium">{getPaymentProgress()}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500 rounded-full transition-all duration-300"
                                                style={{ width: `${getPaymentProgress()}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>₱0</span>
                                            <span>{formatCurrency(fee.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {fee.valid_until && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Valid Until</p>
                                        <p className="text-sm">{formatDate(fee.valid_until)}</p>
                                    </div>
                                )}

                                {fee.remarks && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Remarks</p>
                                        <p className="text-sm text-gray-600">{fee.remarks}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Amount Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Amount Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Base Amount</span>
                                        <span className="font-medium">{formatCurrency(fee.base_amount)}</span>
                                    </div>
                                    {fee.surcharge_amount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-orange-600">Surcharge</span>
                                            <span className="font-medium text-orange-600">+ {formatCurrency(fee.surcharge_amount)}</span>
                                        </div>
                                    )}
                                    {fee.penalty_amount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-red-600">Penalty</span>
                                            <span className="font-medium text-red-600">+ {formatCurrency(fee.penalty_amount)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(fee.base_amount + fee.surcharge_amount + fee.penalty_amount)}</span>
                                    </div>
                                    {fee.discount_amount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-600">Discount</span>
                                            <span className="font-medium text-green-600">- {formatCurrency(fee.discount_amount)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total</span>
                                        <span className="text-xl font-bold">{formatCurrency(fee.total_amount)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-600">Amount Paid</span>
                                        <span className="font-semibold text-green-600">{formatCurrency(fee.amount_paid)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-red-600">Balance Due</span>
                                        <span className="text-lg font-bold text-red-600">{formatCurrency(fee.balance)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions Panel */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileSignature className="h-5 w-5" />
                                    Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {permissions.can_record_payment && fee.balance > 0 && (
                                    <Button 
                                        className="w-full justify-start" 
                                        onClick={handleRecordPayment}
                                        disabled={isProcessing}
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Record Payment
                                    </Button>
                                )}

                                {permissions.can_approve && fee.status === 'pending' && (
                                    <Button 
                                        className="w-full justify-start" 
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Fee
                                    </Button>
                                )}

                                {permissions.can_collect && fee.status === 'approved' && (
                                    <Button 
                                        className="w-full justify-start" 
                                        onClick={handleCollect}
                                        disabled={isProcessing}
                                    >
                                        <FileCheck className="h-4 w-4 mr-2" />
                                        Mark as Collected
                                    </Button>
                                )}

                                {isOverdue() && (
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start"
                                        onClick={handleSendReminder}
                                        disabled={isProcessing}
                                    >
                                        <Bell className="h-4 w-4 mr-2" />
                                        Send Reminder
                                    </Button>
                                )}

                                {permissions.can_waive && fee.balance > 0 && (
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                        onClick={handleWaive}
                                        disabled={isProcessing}
                                    >
                                        <FileCheck className="h-4 w-4 mr-2" />
                                        Waive Fee
                                    </Button>
                                )}

                                {permissions.can_cancel && !['paid', 'cancelled', 'waived'].includes(fee.status) && (
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={handleCancel}
                                        disabled={isProcessing}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel Fee
                                    </Button>
                                )}

                                <Separator />

                                <Button variant="ghost" className="w-full justify-start">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Add Note
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Quick Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Quick Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Created</span>
                                    <span>{formatDate(fee.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Last Updated</span>
                                    <span>{formatDate(fee.updated_at)}</span>
                                </div>
                                {fee.payment_date && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Paid Date</span>
                                        <span>{formatDate(fee.payment_date)}</span>
                                    </div>
                                )}
                                {fee.cancelled_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Cancelled Date</span>
                                        <span>{formatDate(fee.cancelled_at)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Receipt Preview Dialog - Only for Payments */}
            <Dialog open={showReceiptPreview} onOpenChange={setShowReceiptPreview}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Payment Receipt</DialogTitle>
                        <DialogDescription>
                            View, print, or save the official receipt for this payment.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mb-4 print:hidden">
                        <Button 
                            variant="outline" 
                            onClick={handleSimplePrint}
                            disabled={isPrinting}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button 
                            variant="default" 
                            onClick={handlePrintReceipt}
                            disabled={isPrinting}
                        >
                            {isPrinting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Preparing...
                                </>
                            ) : (
                                <>
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Print & Download
                                </>
                            )}
                        </Button>
                    </div>
                    
                    {selectedPayment && (
                        <PrintableReceipt
                            ref={receiptRef}
                            receipt={generateReceiptData(selectedPayment)}
                            barangay={{
                                name: 'Barangay Management System',
                                address: 'City of San Fernando, La Union',
                            }}
                            copyType="original"
                            showSaveButton={true}
                            onSave={() => {
                                setShowReceiptPreview(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}