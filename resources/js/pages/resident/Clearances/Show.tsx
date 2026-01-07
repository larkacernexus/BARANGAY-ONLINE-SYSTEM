import { useEffect, useState } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Download,
    Printer,
    FileText,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    DollarSign,
    User,
    FileCheck,
    MessageSquare,
    History,
    Loader2,
    Eye,
    Copy,
    Shield,
    Building
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import type { ClearanceRequest, ClearanceDocument, Payment, StatusHistory } from '@/types/clearance';

// Import mobile footer
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';

// Status configuration
const STATUS_CONFIG = {
    pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle },
    completed: { label: 'Completed', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
};

const PAYMENT_STATUS_CONFIG = {
    pending: { label: 'Payment Required', color: 'bg-red-100 text-red-800' },
    partial: { label: 'Partial Payment', color: 'bg-yellow-100 text-yellow-800' },
    paid: { label: 'Payment Complete', color: 'bg-green-100 text-green-800' },
    overdue: { label: 'Payment Overdue', color: 'bg-red-100 text-red-800' },
};

interface PageProps {
    clearance: ClearanceRequest;
}

export default function ClearanceDetail({ clearance }: PageProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Set document title
    useEffect(() => {
        document.title = `Clearance #${clearance.control_number} | Barangay System`;
    }, [clearance.control_number]);

    // Helper function to format currency
    const formatCurrency = (amount: any): string => {
        if (amount == null) return '₱0.00';
        const num = parseFloat(amount);
        return isNaN(num) ? '₱0.00' : `₱${num.toFixed(2)}`;
    };

    // Helper function to format date safely
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string | null | undefined): string => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusConfig = (status: keyof typeof STATUS_CONFIG) => {
        return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // Replace with your actual download endpoint
            const response = await fetch(`/clearances/${clearance.id}/download`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clearance-${clearance.control_number}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        setIsPrinting(true);
        window.open(`/clearances/${clearance.id}/print`, '_blank');
        setIsPrinting(false);
    };

    const copyControlNumber = () => {
        navigator.clipboard.writeText(clearance.control_number);
        // You could add a toast notification here
    };

    // Calculate balance safely
    const calculateBalance = (): number => {
        const amountDue = parseFloat(clearance.amount_due as any) || 0;
        const amountPaid = parseFloat(clearance.amount_paid as any) || 0;
        return amountDue - amountPaid;
    };

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Clearances', href: '/resident/clearances' },
                { title: `#${clearance.control_number}`, href: '#' }
            ]}
        >
            <div className="space-y-6 lg:space-y-8">
                {/* Header with Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/resident/clearances">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                                {clearance.clearance_type?.name || 'Clearance Request'}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Control Number: {clearance.control_number}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={copyControlNumber}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {clearance.status === 'completed' && (
                            <>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    Download
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={handlePrint}
                                    disabled={isPrinting}
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                            </>
                        )}
                        {clearance.status === 'pending' && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (confirm('Are you sure you want to cancel this request?')) {
                                        router.delete(`/clearances/${clearance.id}`);
                                    }
                                }}
                            >
                                Cancel Request
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Banner */}
                <Alert className={`${getStatusConfig(clearance.status as keyof typeof STATUS_CONFIG).color} border-0`}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">
                        Status: {getStatusConfig(clearance.status as keyof typeof STATUS_CONFIG).label}
                    </AlertTitle>
                    <AlertDescription>
                        {clearance.status === 'pending' && 'Your request is pending review by barangay officials.'}
                        {clearance.status === 'processing' && 'Your request is being processed.'}
                        {clearance.status === 'approved' && 'Your request has been approved.'}
                        {clearance.status === 'rejected' && `Reason: ${clearance.additional_notes || 'No reason provided'}`}
                        {clearance.status === 'completed' && 'Your clearance is ready for download.'}
                        {clearance.status === 'cancelled' && 'This request has been cancelled.'}
                    </AlertDescription>
                </Alert>

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Custom Tabs Implementation */}
                        <div className="space-y-6">
                            {/* Tab Headers */}
                            <div className="flex space-x-1 border-b">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                                        activeTab === 'details'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Details
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('documents')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                                        activeTab === 'documents'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileCheck className="h-4 w-4" />
                                        Documents
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('payments')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                                        activeTab === 'payments'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Payments
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                                        activeTab === 'history'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <History className="h-4 w-4" />
                                        History
                                    </div>
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="space-y-6">
                                {/* Details Tab Content */}
                                {activeTab === 'details' && (
                                    <div className="space-y-6">
                                        {/* Request Information */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Request Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Control Number</p>
                                                        <p className="font-medium">{clearance.control_number}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Date Requested</p>
                                                        <p className="font-medium">{formatDate(clearance.created_at)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Date Needed</p>
                                                        <p className="font-medium">{formatDate(clearance.needed_date)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Purpose</p>
                                                        <p className="font-medium">{clearance.purpose}</p>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">Specific Purpose Details</p>
                                                    <p className="font-medium mt-1">{clearance.specific_purpose}</p>
                                                </div>
                                                
                                                {clearance.additional_notes && (
                                                    <div>
                                                        <p className="text-sm text-gray-500">Additional Notes</p>
                                                        <p className="font-medium mt-1">{clearance.additional_notes}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Clearance Information */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Clearance Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Type</p>
                                                        <p className="font-medium">{clearance.clearance_type?.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Processing Days</p>
                                                        <p className="font-medium">{clearance.clearance_type?.processing_days || 0} days</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Validity Period</p>
                                                        <p className="font-medium">{clearance.clearance_type?.validity_days || 0} days</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Fee</p>
                                                        <p className="font-medium">
                                                            {clearance.clearance_type?.requires_payment 
                                                                ? formatCurrency(clearance.clearance_type.fee)
                                                                : 'No Fee'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {clearance.issued_date && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Issued Date</p>
                                                            <p className="font-medium">{formatDate(clearance.issued_date)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Expiry Date</p>
                                                            <p className="font-medium">{formatDate(clearance.expiry_date)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {clearance.signed_by && (
                                                    <div>
                                                        <p className="text-sm text-gray-500">Signed By</p>
                                                        <p className="font-medium">{clearance.signed_by}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Documents Tab Content */}
                                {activeTab === 'documents' && (
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Uploaded Documents</CardTitle>
                                                <CardDescription>
                                                    Documents submitted with this request
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {clearance.documents && clearance.documents.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {clearance.documents.map((doc: ClearanceDocument) => (
                                                            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    <FileText className="h-5 w-5 text-gray-400" />
                                                                    <div>
                                                                        <p className="font-medium">{doc.name}</p>
                                                                        {doc.description && (
                                                                            <p className="text-sm text-gray-500">{doc.description}</p>
                                                                        )}
                                                                        <p className="text-xs text-gray-400">
                                                                            Uploaded: {formatDateTime(doc.uploaded_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => window.open(`/documents/${doc.id}/view`, '_blank')}
                                                                >
                                                                    View
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <FileText className="h-12 w-12 mx-auto text-gray-400" />
                                                        <p className="mt-4 text-gray-500">No documents uploaded</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Payments Tab Content */}
                                {activeTab === 'payments' && (
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Payment Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* Payment Summary */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="text-center p-4 border rounded-lg">
                                                        <p className="text-sm text-gray-500">Amount Due</p>
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {formatCurrency(clearance.amount_due)}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-4 border rounded-lg">
                                                        <p className="text-sm text-gray-500">Amount Paid</p>
                                                        <p className="text-2xl font-bold text-green-600">
                                                            {formatCurrency(clearance.amount_paid)}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-4 border rounded-lg">
                                                        <p className="text-sm text-gray-500">Balance</p>
                                                        <p className="text-2xl font-bold text-red-600">
                                                            {formatCurrency(calculateBalance())}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Payment Status */}
                                                <div className="p-4 border rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">Payment Status</p>
                                                            <Badge className={`mt-1 ${PAYMENT_STATUS_CONFIG[clearance.payment_status as keyof typeof PAYMENT_STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800'}`}>
                                                                {PAYMENT_STATUS_CONFIG[clearance.payment_status as keyof typeof PAYMENT_STATUS_CONFIG]?.label || clearance.payment_status}
                                                            </Badge>
                                                        </div>
                                                        {clearance.payment_status !== 'paid' && clearance.amount_due && (
                                                            <Button>Make Payment</Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Payment History */}
                                                {clearance.payments && clearance.payments.length > 0 && (
                                                    <div>
                                                        <h3 className="font-medium mb-4">Payment History</h3>
                                                        <div className="space-y-3">
                                                            {clearance.payments.map((payment: Payment) => (
                                                                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                                    <div>
                                                                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {payment.payment_method} • {formatDate(payment.payment_date)}
                                                                        </p>
                                                                        {payment.reference_number && (
                                                                            <p className="text-sm text-gray-500">
                                                                                Ref: {payment.reference_number}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <Badge variant={payment.status === 'verified' ? 'default' : 'outline'}>
                                                                        {payment.status}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* History Tab Content */}
                                {activeTab === 'history' && (
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Status History</CardTitle>
                                                <CardDescription>
                                                    Timeline of your request
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {clearance.status_history && clearance.status_history.length > 0 ? (
                                                    <div className="relative">
                                                        {clearance.status_history.map((history: StatusHistory, index: number) => (
                                                            <div key={history.id} className="relative pb-8 last:pb-0">
                                                                {index < clearance.status_history!.length - 1 && (
                                                                    <div className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"></div>
                                                                )}
                                                                <div className="relative flex items-start">
                                                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                                        <History className="h-5 w-5 text-gray-600" />
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <p className="font-medium">{history.status}</p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {formatDateTime(history.created_at)} • By {history.created_by}
                                                                        </p>
                                                                        {history.remarks && (
                                                                            <p className="mt-1 text-sm">{history.remarks}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <History className="h-12 w-12 mx-auto text-gray-400" />
                                                        <p className="mt-4 text-gray-500">No history available</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary & Actions */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Request Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`h-3 w-3 rounded-full ${getStatusConfig(clearance.status as keyof typeof STATUS_CONFIG).color.split(' ')[0]}`} />
                                    <div>
                                        <p className="font-medium">{getStatusConfig(clearance.status as keyof typeof STATUS_CONFIG).label}</p>
                                        <p className="text-sm text-gray-500">
                                            Last updated: {formatDateTime(clearance.updated_at)}
                                        </p>
                                    </div>
                                </div>
                                
                                {clearance.status === 'pending' && (
                                    <Alert className="bg-yellow-50 border-yellow-200">
                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                        <AlertDescription className="text-yellow-700 text-sm">
                                            Your request is in queue. Expected processing time: {clearance.clearance_type?.processing_days || 0} days.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {clearance.status === 'processing' && (
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                                        <AlertDescription className="text-blue-700 text-sm">
                                            Your request is being processed. Check back soon for updates.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {clearance.status === 'completed' && (
                                    <Alert className="bg-green-50 border-green-200">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-700 text-sm">
                                            Your clearance is ready! You can now download or print it.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {clearance.status === 'pending' && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2"
                                        onClick={() => router.patch(`/clearances/${clearance.id}`, {
                                            status: 'cancelled'
                                        })}
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Cancel Request
                                    </Button>
                                )}
                                
                                {clearance.status === 'completed' && (
                                    <>
                                        <Button
                                            variant="default"
                                            className="w-full justify-start gap-2"
                                            onClick={handleDownload}
                                            disabled={isDownloading}
                                        >
                                            {isDownloading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                            Download Clearance
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2"
                                            onClick={handlePrint}
                                            disabled={isPrinting}
                                        >
                                            <Printer className="h-4 w-4" />
                                            Print Clearance
                                        </Button>
                                    </>
                                )}
                                
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => {/* Implement message functionality */}}
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Send Message
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Important Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Important Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Barangay Hall</p>
                                        <p className="text-sm text-gray-500">Open Mon-Fri, 8AM-5PM</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Contact Official</p>
                                        <p className="text-sm text-gray-500">
                                            For inquiries: <br />
                                            0999-999-9999
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Mobile Footer */}
            <div className="lg:hidden">
                <ResidentMobileFooter />
            </div>
        </ResidentLayout>
    );
}