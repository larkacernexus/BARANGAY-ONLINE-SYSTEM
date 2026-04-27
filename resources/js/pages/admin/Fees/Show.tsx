// resources/js/Pages/Admin/Fees/Show.tsx

import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import {
    TooltipProvider,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Loader2,
    Printer,
    FileDown,
} from 'lucide-react';
import PrintableReceipt from '@/components/admin/receipts/PrintableReceipt';

// Import components
import { FeeHeader } from '@/components/admin/fees/show/components/fee-header';
import { FeeStatusBanners } from '@/components/admin/fees/show/components/fee-status-banners';
import { FeeTabs } from '@/components/admin/fees/show/components/fee-tabs';
import { FeeDetailsTab } from '@/components/admin/fees/show/components/fee-details-tab';
import { FeeComputationTab } from '@/components/admin/fees/show/components/fee-computation-tab';
import { FeeRequirementsTab } from '@/components/admin/fees/show/components/fee-requirements-tab';
import { FeePaymentHistoryTab } from '@/components/admin/fees/show/components/fee-payment-history-tab';
import { FeeStatusSidebar } from '@/components/admin/fees/show/components/fee-status-sidebar';

// Import types
import { Fee, PaymentHistory, Permissions, RelatedFee, PrivilegeData } from '@/types/admin/fees/fees';

// Import helpers
import { 
    formatDate as importedFormatDate, 
    formatDateTime as importedFormatDateTime, 
    formatCurrency as importedFormatCurrency 
} from '@/components/admin/fees/show/utils/formatters';
import { getResidentPrivileges } from '@/components/admin/fees/show/utils/privileges';

// ========== PROPS ==========
interface FeesShowProps {
    fee: Fee;
    related_fees?: RelatedFee[];
    payment_history?: PaymentHistory[];
    permissions?: Permissions;
    allPrivileges?: PrivilegeData[];
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
    },
    allPrivileges = []
}: FeesShowProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showReceiptPreview, setShowReceiptPreview] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'computation' | 'requirements' | 'history'>('details');
    const [isPrinting, setIsPrinting] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null!);

    // Debug effect to check when receipt renders
    useEffect(() => {
        if (showReceiptPreview && receiptRef.current) {
            console.log('✅ Receipt rendered successfully');
            console.log('Receipt content length:', receiptRef.current.innerHTML.length);
        } else if (showReceiptPreview && !receiptRef.current) {
            console.log('⏳ Waiting for receipt to render...');
        }
    }, [showReceiptPreview, selectedPayment]);

    // ========== HELPER FUNCTIONS (Fixed Type Signatures with null handling) ==========
    
    // Format date - accepts string | null | undefined, handles null properly
    const formatDate = (date: string | null | undefined): string => {
        if (date === null) return 'N/A';
        return importedFormatDate(date);
    };

    // Format date time - accepts string | null | undefined, handles null properly
    const formatDateTime = (date: string | null | undefined): string => {
        if (date === null) return 'N/A';
        return importedFormatDateTime(date);
    };

    // Format currency - accepts number | string | undefined
    const formatCurrency = (amount: number | string | undefined): string => {
        return importedFormatCurrency(amount);
    };

    // Get status variant - returns ONLY valid badge variants (no "success")
    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            paid: "default",
            pending: "secondary",
            overdue: "destructive",
            issued: "default",
            partial: "secondary",
            partially_paid: "secondary",
            cancelled: "outline",
            refunded: "secondary"
        };
        return variants[status] || "secondary";
    };

    // Get status icon
    const getStatusIcon = (status: string): React.ReactNode => {
        // Return null or an icon component based on status
        return null;
    };

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

    // ========== ACTION HANDLERS ==========

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
            const receiptContent = receiptRef.current.innerHTML;
            const printWindow = window.open('', '_blank');
            
            if (!printWindow) {
                alert('Please allow pop-ups to print the receipt');
                setIsPrinting(false);
                return;
            }

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
    const payerInfo = getPayerInfo();
    
    return {
        id: payment.id,
        receipt_number: `RCP-${payment.or_number || payment.id}-${new Date().getFullYear()}`,
        or_number: payment.or_number || null, // ✅ Convert undefined to null
        receipt_type: 'payment',
        receipt_type_label: 'OFFICIAL RECEIPT',
        payer_name: payerInfo.name,
        payer_address: payerInfo.address || null, // ✅ Convert to null
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
        reference_number: payment.reference_number || null, // ✅ Convert to null
        formatted_payment_date: payment.payment_date ? formatDate(payment.payment_date) : formatDate(new Date().toISOString()),
        formatted_issued_date: formatDate(new Date().toISOString()),
        issued_by: payment.received_by || 'System',
        fee_breakdown: [
            {
                fee_name: fee.fee_type?.name || 'Fee',
                fee_code: fee.fee_code,
                base_amount: fee.base_amount || 0,
                total_amount: payment.subtotal || payment.amount
            }
        ],
        notes: payment.description || null, // ✅ Convert to null
        payment_id: payment.id,
        clearance_request_id: null
    };
};
    // Get payer information with privileges
    const getPayerInfo = () => {
        if (fee.payer_type === 'resident' && fee.resident) {
            const privileges = getResidentPrivileges(fee.resident);
            
            return {
                name: fee.resident.name || fee.resident.full_name || 'Unknown',
                contact: fee.resident.contact_number || fee.contact_number || '',
                email: fee.resident.email || '',
                address: fee.resident.address || fee.address || '',
                purok: fee.resident.purok || fee.purok || '',
                zone: fee.resident.zone || fee.zone || '',
                classification: '',
                link: `/residents/${fee.resident.id}`,
                icon: 'User',
                typeLabel: 'Resident',
                profile_photo: fee.resident.profile_photo,
                birth_date: fee.resident.birth_date,
                gender: fee.resident.gender,
                occupation: fee.resident.occupation,
                privileges: privileges,
                has_privileges: privileges.length > 0
            };
        }
        if (fee.payer_type === 'household' && fee.household) {
            return {
                name: fee.household.name,
                contact: fee.household.contact_number || fee.contact_number || '',
                email: '',
                address: fee.household.address || fee.address || '',
                purok: fee.household.purok || fee.purok || '',
                zone: fee.household.zone || fee.zone || '',
                classification: 'Household',
                link: `/households/${fee.household.id}`,
                icon: 'Home',
                typeLabel: 'Household',
                head_privileges: fee.household.head_privileges || []
            };
        }
        if (fee.payer_type === 'business' && fee.business) {
            return {
                name: fee.business.business_name,
                contact: fee.business.contact_number || fee.contact_number || '',
                email: fee.business.email || '',
                address: fee.business.address || fee.address || '',
                purok: fee.business.purok || fee.purok || '',
                zone: fee.business.zone || fee.zone || '',
                classification: fee.business.business_type || '',
                link: `/businesses/${fee.business.id}`,
                icon: 'Building',
                typeLabel: 'Business',
            };
        }
        return {
            name: fee.payer_name || 'Unknown',
            contact: fee.contact_number || '',
            email: '',
            address: fee.address || '',
            purok: fee.purok || '',
            zone: fee.zone || '',
            classification: '',
            link: null,
            icon: fee.payer_type === 'resident' ? 'User' : fee.payer_type === 'household' ? 'Home' : 'Building',
            typeLabel: fee.payer_type ? fee.payer_type.charAt(0).toUpperCase() + fee.payer_type.slice(1) : 'Unknown',
        };
    };

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

    const computationDetails = parseComputationDetails();
    const submittedRequirements = parseRequirements();
    const payerInfo = getPayerInfo();

    // Copy reference number to clipboard
    const copyReferenceNumber = () => {
        navigator.clipboard.writeText(fee.fee_code);
        alert('Fee code copied to clipboard!');
    };

    return (
        <AppLayout
            title={`Fee: ${fee.fee_code}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fees', href: '/admin/fees' },
                { title: fee.fee_code, href: `/admin/fees/${fee.id}` }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <FeeHeader
                        fee={fee}
                        permissions={permissions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCopyReference={copyReferenceNumber}
                    />

                    {/* Status Banners */}
                    <FeeStatusBanners
                        fee={fee}
                        isOverdue={isOverdue()}
                        daysOverdue={getDaysOverdue()}
                        onDownloadCertificate={handleDownloadCertificate}
                        onSendReminder={handleSendReminder}
                        isProcessing={isProcessing}
                    />

                    {/* Main Content */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Left Column - Fee Details with Tabs */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Tab Navigation */}
                            <FeeTabs 
                                activeTab={activeTab} 
                                setActiveTab={setActiveTab} 
                                paymentCount={payment_history.length} 
                            />

                            {/* Tab Content */}
                            <div className="pt-2">
                                {activeTab === 'details' && (
                                    <FeeDetailsTab
                                        fee={fee}
                                        payerInfo={payerInfo}
                                        formatDate={formatDate}
                                        formatCurrency={formatCurrency}
                                    />
                                )}

                                {activeTab === 'computation' && (
                                    <FeeComputationTab
                                        fee={fee}
                                        paymentHistory={payment_history}
                                        computationDetails={computationDetails}
                                        formatCurrency={formatCurrency}
                                    />
                                )}

                                {activeTab === 'requirements' && (
                                    <FeeRequirementsTab
                                        fee={fee}
                                        submittedRequirements={submittedRequirements}
                                    />
                                )}

                                {activeTab === 'history' && (
                                    <FeePaymentHistoryTab
                                        paymentHistory={payment_history}
                                        onViewReceipt={handleViewReceipt}
                                        onDownloadReceipt={handleDownloadReceipt}
                                        formatDateTime={formatDateTime}
                                        formatCurrency={formatCurrency}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right Column - Status & Actions */}
                        <FeeStatusSidebar
                            fee={fee}
                            permissions={permissions}
                            isProcessing={isProcessing}
                            isOverdue={isOverdue()}
                            getStatusVariant={getStatusVariant}
                            getStatusIcon={getStatusIcon}
                            getPaymentProgress={getPaymentProgress}
                            onRecordPayment={handleRecordPayment}
                            onApprove={handleApprove}
                            onCollect={handleCollect}
                            onSendReminder={handleSendReminder}
                            onWaive={handleWaive}
                            onCancel={handleCancel}
                            formatDate={formatDate}
                            formatCurrency={formatCurrency}
                        />
                    </div>
                </div>

                {/* Receipt Preview Dialog */}
                <Dialog open={showReceiptPreview} onOpenChange={setShowReceiptPreview}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="dark:text-gray-100">Payment Receipt</DialogTitle>
                            <DialogDescription className="dark:text-gray-400">
                                View, print, or save the official receipt for this payment.
                            </DialogDescription>
                        </DialogHeader>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mb-4 print:hidden">
                            <Button 
                                variant="outline" 
                                onClick={handleSimplePrint}
                                disabled={isPrinting}
                                className="dark:border-gray-700 dark:text-gray-300"
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
            </TooltipProvider>
        </AppLayout>
    );
}