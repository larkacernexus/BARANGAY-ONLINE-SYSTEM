import { toast } from 'sonner';
import { format, isValid } from 'date-fns';

export const formatDate = (dateString: string, isMobile: boolean): string => {
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

export const formatCurrency = (amount: number): string => {
  return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const copyToClipboard = async (text: string, successMessage: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error('Failed to copy');
  }
};

export const getStatusCount = (stats: any, status: string, payments: any[] = []) => {
  switch (status) {
    case 'all':
      return stats.total_payments || 0;
    case 'paid':
      return (stats.completed_payments || 0) + payments.filter((p) => p.status === 'paid').length;
    case 'pending':
      return stats.pending_payments || 0;
    case 'overdue':
      return stats.overdue_payments || 0;
    case 'cancelled':
      return stats.cancelled_payments || 0;
    default:
      return 0;
  }
};

export const printPaymentsList = (
  payments: any[],
  statusFilter: string,
  stats: any,
  formatDate: any,
  formatCurrency: any
) => {
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
                    <p><strong>Total Paid:</strong> ${formatCurrency(stats.total_paid)}</p>
                    <p><strong>Balance Due:</strong> ${formatCurrency(stats.balance_due)}</p>
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
                </tr>
            </thead>
            <tbody>
                ${payments
                  .map(
                    (payment) => `
                    <tr>
                        <td>${payment.or_number}</td>
                        <td>${payment.purpose}</td>
                        <td>${formatDate(payment.payment_date, false)}</td>
                        <td>${payment.payment_method_display}</td>
                        <td><span class="badge badge-${payment.status}">${payment.status
                      .replace('_', ' ')
                      .toUpperCase()}</span></td>
                        <td>${payment.formatted_total}</td>
                    </tr>
                `
                  )
                  .join('')}
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

export const exportPaymentsToCSV = (
  payments: any[],
  statusFilter: string,
  formatDate: any,
  setIsExporting: (value: boolean) => void,
  toast: any
) => {
  if (payments.length === 0) {
    toast.error('No payments to export');
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

    const csvData = payments.map((payment) => [
      payment.or_number,
      payment.reference_number || 'N/A',
      `"${(payment.purpose || '').replace(/"/g, '""')}"`,
      payment.certificate_type_display || 'N/A',
      (payment.subtotal || 0).toFixed(2),
      (payment.surcharge || 0).toFixed(2),
      (payment.penalty || 0).toFixed(2),
      (payment.discount || 0).toFixed(2),
      (payment.total_amount || 0).toFixed(2),
      formatDate(payment.payment_date, false),
      payment.due_date ? formatDate(payment.due_date, false) : 'N/A',
      payment.status.toUpperCase(),
      payment.payment_method_display,
      payment.collection_type_display,
      `"${(payment.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n');

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
    toast.success('CSV file downloaded successfully');
  }, 500);
};