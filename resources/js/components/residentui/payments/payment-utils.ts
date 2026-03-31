// components/residentui/payments/payment-utils.ts
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';
import { 
    Payment, 
    PaymentStats, 
    PaymentStatus, 
    PaymentMethod,
    PaymentSummary
} from '@/types/portal/payments/payment.types';

// Format date with optional mobile view
export const formatDate = (dateString: string | null | undefined, isMobile: boolean = false): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (!isValid(date)) return 'N/A';

        return isMobile
            ? format(date, 'MMM dd')
            : format(date, 'MMM dd, yyyy');
    } catch {
        return 'N/A';
    }
};

// Format currency with proper PHP formatting
export const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined) return '₱0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₱0.00';
    return `₱${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Copy to clipboard with toast notification
export const copyToClipboard = async (text: string, successMessage: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
    } catch {
        toast.error('Failed to copy');
    }
};

// Get payment status display label
export const getPaymentStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
        completed: 'Paid',
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
        partially_paid: 'Partially Paid'
    };
    return statusMap[status] || status.replace('_', ' ').toUpperCase();
};

// Get payment status color class
export const getPaymentStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        partially_paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
};

// Get payment method display name
export const getPaymentMethodDisplay = (method: string): string => {
    const methodMap: Record<string, string> = {
        cash: 'Cash',
        gcash: 'GCash',
        maya: 'Maya',
        bank: 'Bank Transfer',
        check: 'Check',
        online: 'Online Payment',
        card: 'Card'
    };
    return methodMap[method] || method;
};

// Get payment method color class
export const getPaymentMethodColor = (method: string): string => {
    const colorMap: Record<string, string> = {
        cash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        gcash: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        maya: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        bank: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        check: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        online: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
        card: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    };
    return colorMap[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
};

// Check if payment method requires reference number
export const paymentMethodRequiresReference = (method: string): boolean => {
    const requiresRef: Record<string, boolean> = {
        cash: false,
        gcash: true,
        maya: true,
        bank: true,
        check: true,
        online: true,
        card: true
    };
    return requiresRef[method] || false;
};

// Get status count based on filter
export const getStatusCount = (
    stats: PaymentStats, 
    status: string, 
    payments: Payment[] = []
): number => {
    switch (status) {
        case 'all':
            return stats?.total_payments || 0;
        case 'paid':
            return (stats?.completed_payments || 0) + payments.filter(p => p.status === 'paid').length;
        case 'completed':
            return stats?.completed_payments || 0;
        case 'pending':
            return stats?.pending_payments || 0;
        case 'overdue':
            return stats?.overdue_payments || 0;
        case 'cancelled':
            return stats?.cancelled_payments || 0;
        case 'refunded':
            return stats?.refunded_payments || 0;
        case 'partially_paid':
            return stats?.partially_paid_payments || 0;
        default:
            return 0;
    }
};

// Calculate payment summary from payment object
export const calculatePaymentSummary = (payment: Payment): PaymentSummary => {
    const subtotal = typeof payment.subtotal === 'number' ? payment.subtotal : 0;
    const surcharge = typeof payment.surcharge === 'number' ? payment.surcharge : 0;
    const penalty = typeof payment.penalty === 'number' ? payment.penalty : 0;
    const discount = typeof payment.discount === 'number' ? payment.discount : 0;
    const total = subtotal + surcharge + penalty - discount;

    return {
        subtotal,
        surcharge,
        penalty,
        discount,
        total,
        formattedSubtotal: formatCurrency(subtotal),
        formattedSurcharge: formatCurrency(surcharge),
        formattedPenalty: formatCurrency(penalty),
        formattedDiscount: formatCurrency(discount),
        formattedTotal: formatCurrency(total)
    };
};

// Validate if payment status is valid
export const validatePaymentStatus = (status: string): status is PaymentStatus => {
    const validStatuses: PaymentStatus[] = ['completed', 'paid', 'pending', 'overdue', 'cancelled', 'refunded', 'partially_paid'];
    return validStatuses.includes(status as PaymentStatus);
};

// Check if payment is overdue
export const isPaymentOverdue = (dueDate?: string | null): boolean => {
    if (!dueDate) return false;
    try {
        const due = new Date(dueDate);
        const today = new Date();
        return due < today;
    } catch {
        return false;
    }
};

// Calculate payment progress percentage
export const getPaymentProgress = (payment: Payment): number => {
    const total = payment.total_amount;
    const paid = total - (payment.balance_due || 0);
    if (total === 0) return 0;
    return (paid / total) * 100;
};

// Print payments list
export const printPaymentsList = (
    payments: Payment[],
    statusFilter: string,
    stats: PaymentStats,
    formatDateFn: (date: string, isMobile: boolean) => string,
    formatCurrencyFn: (amount: number) => string
): void => {
    if (payments.length === 0) {
        toast.error('No payments to print');
        return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
    }

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>My Payments Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .print-header { margin-bottom: 30px; }
                .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
                .payment-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .payment-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
                .payment-table td { padding: 10px; border: 1px solid #ddd; }
                .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
                .badge-completed { background-color: #d1fae5; color: #065f46; }
                .badge-paid { background-color: #d1fae5; color: #065f46; }
                .badge-pending { background-color: #fef3c7; color: #92400e; }
                .badge-overdue { background-color: #fee2e2; color: #991b1b; }
                .badge-cancelled { background-color: #f3f4f6; color: #374151; }
                .badge-refunded { background-color: #ede9fe; color: #5b21b6; }
                .badge-partially_paid { background-color: #dbeafe; color: #1e40af; }
                .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>My Payments Report</h1>
                <div class="print-info">
                    <div>
                        <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}</p>
                        <p><strong>Total Payments:</strong> ${payments.length}</p>
                        <p><strong>Status:</strong> ${
                            statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
                        }</p>
                    </div>
                    <div>
                        <p><strong>Total Paid:</strong> ${formatCurrencyFn(stats.total_paid)}</p>
                        <p><strong>Balance Due:</strong> ${formatCurrencyFn(stats.balance_due)}</p>
                        <p><strong>Pending Payments:</strong> ${stats.pending_payments || 0}</p>
                    </div>
                </div>
            </div>
            
            <table class="payment-table">
                <thead>
                    <tr>
                        <th>OR Number</th>
                        <th>Purpose</th>
                        <th>Date</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Amount</th>
                    </thead>
                <tbody>
                    ${payments.map(payment => `
                        <tr>
                            <td>${payment.or_number}</td>
                            <td>${payment.purpose}</td>
                            <td>${formatDateFn(payment.payment_date || '', false)}</td>
                            <td>${payment.payment_method_display}</td>
                            <td><span class="badge badge-${payment.status}">${getPaymentStatusLabel(payment.status)}</span></td>
                            <td>${payment.formatted_total || formatCurrencyFn(payment.total_amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Generated from Barangay Management System</p>
                <p>Page 1 of 1</p>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
};

// Export payments to CSV
export const exportPaymentsToCSV = (
    payments: Payment[],
    statusFilter: string,
    formatDateFn: (date: string, isMobile: boolean) => string,
    setIsExporting: (value: boolean) => void,
    toastFn: any
): void => {
    if (payments.length === 0) {
        toastFn.error('No payments to export');
        return;
    }

    setIsExporting(true);

    setTimeout(() => {
        const headers = [
            'OR Number',
            'Reference Number',
            'Purpose',
            'Certificate Type',
            'Subtotal',
            'Surcharge',
            'Penalty',
            'Discount',
            'Total Amount',
            'Payment Date',
            'Due Date',
            'Status',
            'Payment Method',
            'Collection Type',
            'Remarks',
        ];

        const csvData = payments.map(payment => [
            payment.or_number,
            payment.reference_number || 'N/A',
            `"${(payment.purpose || '').replace(/"/g, '""')}"`,
            payment.certificate_type_display || 'N/A',
            (payment.subtotal || 0).toFixed(2),
            (payment.surcharge || 0).toFixed(2),
            (payment.penalty || 0).toFixed(2),
            (payment.discount || 0).toFixed(2),
            (payment.total_amount || 0).toFixed(2),
            formatDateFn(payment.payment_date || '', false),
            payment.due_date ? formatDateFn(payment.due_date, false) : 'N/A',
            payment.status.toUpperCase(),
            payment.payment_method_display,
            payment.collection_type_display,
            `"${(payment.remarks || '').replace(/"/g, '""')}"`,
        ]);

        const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `payments_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsExporting(false);
        toastFn.success('CSV file downloaded successfully');
    }, 500);
};

// Alias for exportToCSV to maintain compatibility
export const exportToCSV = exportPaymentsToCSV;

// Export single payment receipt
export const exportPaymentReceipt = (
    payment: Payment,
    formatCurrencyFn: (amount: number) => string,
    formatDateFn: (date: string, isMobile: boolean) => string
): void => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
        toast.error('Please allow popups to generate receipt');
        return;
    }

    const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt - ${payment.or_number}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; margin: 0; }
                .subtitle { color: #666; margin-top: 5px; }
                .details { margin-bottom: 20px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                .total-row { font-weight: bold; font-size: 18px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #333; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                @media print {
                    body { margin: 0; padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h1 class="title">OFFICIAL RECEIPT</h1>
                    <p class="subtitle">Barangay Management System</p>
                    <p>OR Number: <strong>${payment.or_number}</strong></p>
                </div>
                
                <div class="details">
                    <div class="detail-row">
                        <span>Payment Date:</span>
                        <span>${formatDateFn(payment.payment_date || '', false)}</span>
                    </div>
                    <div class="detail-row">
                        <span>Payer Name:</span>
                        <span>${payment.payer_details?.name || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Purpose:</span>
                        <span>${payment.purpose}</span>
                    </div>
                    <div class="detail-row">
                        <span>Payment Method:</span>
                        <span>${payment.payment_method_display}</span>
                    </div>
                    ${payment.reference_number ? `
                    <div class="detail-row">
                        <span>Reference Number:</span>
                        <span>${payment.reference_number}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrencyFn(payment.subtotal)}</span>
                    </div>
                    ${payment.surcharge > 0 ? `
                    <div class="detail-row">
                        <span>Surcharge:</span>
                        <span>+${formatCurrencyFn(payment.surcharge)}</span>
                    </div>
                    ` : ''}
                    ${payment.penalty > 0 ? `
                    <div class="detail-row">
                        <span>Penalty:</span>
                        <span>+${formatCurrencyFn(payment.penalty)}</span>
                    </div>
                    ` : ''}
                    ${payment.discount > 0 ? `
                    <div class="detail-row">
                        <span>Discount:</span>
                        <span>-${formatCurrencyFn(payment.discount)}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row total-row">
                        <span>Total Amount:</span>
                        <span>${formatCurrencyFn(payment.total_amount)}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This is a computer-generated receipt and does not require signature.</p>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
    receiptWindow.close();
};

// Group payments by status
export const groupPaymentsByStatus = (payments: Payment[]): Record<PaymentStatus, Payment[]> => {
    return payments.reduce((groups, payment) => {
        const status = payment.status;
        if (!groups[status]) {
            groups[status] = [];
        }
        groups[status].push(payment);
        return groups;
    }, {} as Record<PaymentStatus, Payment[]>);
};

// Filter payments by date range
export const filterPaymentsByDateRange = (
    payments: Payment[],
    startDate?: string,
    endDate?: string
): Payment[] => {
    if (!startDate && !endDate) return payments;
    
    return payments.filter(payment => {
        if (!payment.payment_date) return false;
        const paymentDate = new Date(payment.payment_date);
        
        if (startDate && endDate) {
            return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
        } else if (startDate) {
            return paymentDate >= new Date(startDate);
        } else if (endDate) {
            return paymentDate <= new Date(endDate);
        }
        
        return true;
    });
};

// Sort payments
export const sortPayments = (
    payments: Payment[],
    sortBy: keyof Payment,
    sortOrder: 'asc' | 'desc' = 'desc'
): Payment[] => {
    return [...payments].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
    });
};

// Search payments
export const searchPayments = (
    payments: Payment[],
    searchTerm: string
): Payment[] => {
    if (!searchTerm.trim()) return payments;
    
    const term = searchTerm.toLowerCase().trim();
    return payments.filter(payment => 
        payment.or_number.toLowerCase().includes(term) ||
        payment.purpose.toLowerCase().includes(term) ||
        (payment.reference_number && payment.reference_number.toLowerCase().includes(term)) ||
        (payment.payer_details?.name && payment.payer_details.name.toLowerCase().includes(term))
    );
};