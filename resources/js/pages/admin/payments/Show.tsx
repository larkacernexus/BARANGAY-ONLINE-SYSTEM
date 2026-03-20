// resources/js/Pages/Admin/Payments/Show.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Printer,
    Copy,
    MoreVertical,
    XCircle,
    Send,
    Download as DownloadIcon,
    Receipt,
    FileText,
    FileCheck,
    FileBarChart,
    Check,
    Loader2,
} from 'lucide-react';
import { Link, usePage, Head, router } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintableReceipt from '@/components/admin/receipts/PrintableReceipt';

// Import components
import { PaymentHeader } from '@/components/admin/payments/show/components/payment-header';
import { PaymentInformationCard } from '@/components/admin/payments/show/components/payment-information-card';
import { PayerInformationCard } from '@/components/admin/payments/show/components/payer-information-card';
import { DiscountSummaryCard } from '@/components/admin/payments/show/components/discount-summary-card';
import { RecordingInformationCard } from '@/components/admin/payments/show/components/recording-information-card';
import { PaymentStatusCard } from '@/components/admin/payments/show/components/payment-status-card';
import { RelatedPaymentsCard } from '@/components/admin/payments/show/components/related-payments-card';
import { PaymentItemsTable } from '@/components/admin/payments/show/components/payment-items-table';
import { ClearanceRequestsCard } from '@/components/admin/payments/show/components/clearance-requests-card';
import { FeeDetailsCard } from '@/components/admin/payments/show/components/fee-details-card';

// Import types and utilities
import { Payment, PageProps } from '@/components/admin/payments/show/types';
import { formatDate, formatCurrency, getRoute, getStatusIcon, getStatusColor, getMethodIcon, getPayerIcon, getCertificateIcon } from '@/components/admin/payments/show/utils/helpers';

export default function PaymentShow() {
    const { 
        payment, 
        clearanceRequests, 
        fees, 
        payer, 
        relatedPayments, 
        paymentBreakdown,
        discountDetails = [],
    } = usePage<PageProps>().props;
    
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [showVoidDialog, setShowVoidDialog] = useState(false);
    const [isVoiding, setIsVoiding] = useState(false);
    
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `receipt-${payment.or_number}`,
        onAfterPrint: () => {
            setShowPrintPreview(false);
        },
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrintReceipt = () => {
        setShowPrintPreview(true);
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    const handleVoidPayment = () => {
        setIsVoiding(true);
        router.post(route('admin.payments.void', payment.id), {}, {
            preserveScroll: true,
            onFinish: () => {
                setIsVoiding(false);
                setShowVoidDialog(false);
            },
        });
    };

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
        amount_paid: payment.amount_paid || payment.total_amount,
        change_due: (payment.amount_paid || payment.total_amount) - (payment.total_amount - payment.discount),
        formatted_subtotal: payment.formatted_subtotal,
        formatted_surcharge: payment.formatted_surcharge,
        formatted_penalty: payment.formatted_penalty,
        formatted_discount: payment.formatted_discount,
        formatted_total: payment.formatted_total,
        formatted_amount_paid: payment.formatted_amount_paid || payment.formatted_total,
        formatted_change: formatCurrency((payment.amount_paid || payment.total_amount) - (payment.total_amount - payment.discount)),
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

    const hasItems = payment.items?.length > 0;
    const hasClearances = clearanceRequests.length > 0;
    const hasFees = fees.length > 0;

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
                    { title: 'Dashboard', href: getRoute('admin.dashboard') },
                    { title: 'Payments', href: getRoute('admin.payments.index') },
                    { title: `Payment #${payment.or_number}`, href: '#' }
                ]}
            >
                <TooltipProvider>
                    <div className="space-y-6">
                        {/* Header with Actions */}
                        <PaymentHeader
                            payment={payment}
                            copied={copied}
                            onCopy={copyToClipboard}
                            onPrint={handlePrintReceipt}
                            onVoid={() => setShowVoidDialog(true)}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                            getMethodIcon={getMethodIcon}
                        />

                        {/* Tabs Navigation */}
                        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                                <TabsTrigger value="details" className="flex items-center gap-2">
                                    <Receipt className="h-4 w-4" />
                                    <span className="hidden sm:inline">Payment Details</span>
                                </TabsTrigger>
                                <TabsTrigger value="items" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Items</span>
                                    {hasItems && (
                                        <Badge variant="secondary" className="ml-1 text-xs">
                                            {payment.items.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="clearance" className="flex items-center gap-2">
                                    <FileCheck className="h-4 w-4" />
                                    <span className="hidden sm:inline">Clearances</span>
                                    {hasClearances && (
                                        <Badge variant="secondary" className="ml-1 text-xs">
                                            {clearanceRequests.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="fees" className="flex items-center gap-2">
                                    <FileBarChart className="h-4 w-4" />
                                    <span className="hidden sm:inline">Fees</span>
                                    {hasFees && (
                                        <Badge variant="secondary" className="ml-1 text-xs">
                                            {fees.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-6">
                                {/* Details Tab */}
                                <TabsContent value="details" className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Left Column - Payment Details */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <PaymentInformationCard
                                                payment={payment}
                                                paymentBreakdown={paymentBreakdown}
                                                formatDate={formatDate}
                                                getMethodIcon={getMethodIcon}
                                                getCertificateIcon={getCertificateIcon}
                                            />
                                        </div>

                                        {/* Right Column - Payer & Related Info */}
                                        <div className="space-y-6">
                                            <PayerInformationCard
                                                payment={payment}
                                                payer={payer}
                                                getPayerIcon={getPayerIcon}
                                            />

                                            <DiscountSummaryCard
                                                discountDetails={discountDetails}
                                                paymentDiscount={payment.discount}
                                                formattedDiscount={paymentBreakdown.formatted_discount}
                                                discountType={payment.discount_type}
                                                formatDate={formatDate}
                                            />

                                            <RecordingInformationCard
                                                payment={payment}
                                                formatDate={formatDate}
                                            />

                                            <PaymentStatusCard payment={payment} />

                                            <RelatedPaymentsCard
                                                payments={relatedPayments}
                                                payerId={payment.payer_id}
                                                payerType={payment.payer_type}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Items Tab */}
                                <TabsContent value="items">
                                    <PaymentItemsTable items={payment.items} />
                                    {!hasItems && (
                                        <Card className="dark:bg-gray-900">
                                            <CardContent className="py-12">
                                                <div className="text-center">
                                                    <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Items</h3>
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        This payment has no associated items.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>

                                {/* Clearance Requests Tab */}
                                <TabsContent value="clearance">
                                    <ClearanceRequestsCard requests={clearanceRequests} />
                                    {!hasClearances && (
                                        <Card className="dark:bg-gray-900">
                                            <CardContent className="py-12">
                                                <div className="text-center">
                                                    <FileCheck className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Clearance Requests</h3>
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        This payment is not associated with any clearance requests.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>

                                {/* Fees Tab */}
                                <TabsContent value="fees">
                                    <FeeDetailsCard fees={fees} />
                                    {!hasFees && (
                                        <Card className="dark:bg-gray-900">
                                            <CardContent className="py-12">
                                                <div className="text-center">
                                                    <FileBarChart className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Fees</h3>
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        This payment is not associated with any fees.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </TooltipProvider>

                {/* Void Payment Confirmation Dialog */}
                <AlertDialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
                    <AlertDialogContent className="dark:bg-gray-900">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-gray-100">Void Payment</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                                Are you sure you want to void payment #{payment.or_number}? 
                                This action cannot be undone and will reverse all transactions associated with this payment.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isVoiding} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleVoidPayment}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={isVoiding}
                            >
                                {isVoiding ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Voiding...
                                    </>
                                ) : (
                                    'Void Payment'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        </>
    );
}