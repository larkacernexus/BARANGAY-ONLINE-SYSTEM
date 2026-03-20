import { toast } from 'sonner';
import { format } from 'date-fns';

export const formatDate = (dateString: string, isMobile: boolean) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isMobile) {
      return format(date, 'MMM dd');
    }
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return 'N/A';
  }
};

export const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₱0.00';
  return `₱${num.toFixed(2)}`;
};

export const getClearanceTypeDisplay = (clearanceType: any) => {
  if (!clearanceType) return 'Clearance';
  return clearanceType.name;
};

export const getUrgencyBadge = (urgency: string, URGENCY_CONFIG: any) => {
  const urgencyKey = urgency as keyof typeof URGENCY_CONFIG;
  const config = URGENCY_CONFIG[urgencyKey];
  
  if (!config) {
    return {
      label: urgency,
      color: 'bg-gray-100 dark:bg-gray-900',
      textColor: 'text-gray-700 dark:text-gray-300',
      dot: 'bg-gray-500'
    };
  }
  
  return config;
};

export const getStatusCount = (stats: any, status: string) => {
  switch(status) {
    case 'all': 
      return stats.total_clearances || 0;
    case 'pending': 
      return stats.pending_clearances || 0;
    case 'pending_payment': 
      return stats.pending_payment_clearances || 0;
    case 'processing': 
      return stats.processing_clearances || 0;
    case 'approved': 
      return stats.approved_clearances || 0;
    case 'issued': 
      return stats.issued_clearances || 0;
    case 'rejected': 
      return stats.rejected_clearances || 0;
    case 'cancelled': 
      return stats.cancelled_clearances || 0;
    default: 
      return 0;
  }
};

export const copyToClipboard = async (text: string, successMessage: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error('Failed to copy');
  }
};

export const printClearancesList = (
  clearances: any[],
  statusFilter: string,
  household: any,
  stats: any,
  formatDate: any,
  formatCurrency: any,
  getClearanceTypeDisplay: any
) => {
  if (clearances.length === 0) {
    toast.error('No clearance requests to print');
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
        <title>My Clearance Requests Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .print-header { margin-bottom: 30px; }
            .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
            .clearance-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .clearance-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
            .clearance-table td { padding: 10px; border: 1px solid #ddd; }
            .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
            .badge-pending { background-color: #fef3c7; color: #92400e; }
            .badge-pending_payment { background-color: #fed7aa; color: #9a3412; }
            .badge-processing { background-color: #dbeafe; color: #1e40af; }
            .badge-approved { background-color: #d1fae5; color: #065f46; }
            .badge-issued { background-color: #e9d5ff; color: #6b21a8; }
            .badge-rejected { background-color: #fee2e2; color: #991b1b; }
            .badge-cancelled { background-color: #f3f4f6; color: #374151; }
            .badge-normal { background-color: #dbeafe; color: #1e40af; }
            .badge-rush { background-color: #fed7aa; color: #9a3412; }
            .badge-express { background-color: #fee2e2; color: #991b1b; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="print-header">
            <h1>My Clearance Requests Report</h1>
            <div class="print-info">
                <div>
                    <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Total Requests:</strong> ${clearances.length}</p>
                    <p><strong>Status:</strong> ${statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</p>
                </div>
                <div>
                    <p><strong>Household:</strong> ${household?.household_number || 'N/A'}</p>
                    <p><strong>Head of Family:</strong> ${household?.head_of_family || 'N/A'}</p>
                    <p><strong>Total Fees:</strong> ${formatCurrency(stats.total_fees)}</p>
                </div>
            </div>
        </div>
        
        <table class="clearance-table">
            <thead>
                <tr>
                    <th>Reference No.</th>
                    <th>Type</th>
                    <th>Purpose</th>
                    <th>Date Requested</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Fee</th>
                </tr>
            </thead>
            <tbody>
                ${clearances.map(clearance => `
                    <tr>
                        <td>${clearance.reference_number}</td>
                        <td>${getClearanceTypeDisplay(clearance.clearance_type)}</td>
                        <td>${clearance.purpose}</td>
                        <td>${formatDate(clearance.created_at, false)}</td>
                        <td><span class="badge badge-${clearance.urgency}">${clearance.urgency.toUpperCase()}</span></td>
                        <td><span class="badge badge-${clearance.status}">${clearance.status.replace('_', ' ').toUpperCase()}</span></td>
                        <td>${formatCurrency(clearance.fee_amount)}</td>
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

export const exportClearancesToCSV = (
  clearances: any[],
  statusFilter: string,
  formatDate: any,
  formatCurrency: any,
  getClearanceTypeDisplay: any,
  setIsExporting: (value: boolean) => void,
  toast: any
) => {
  if (clearances.length === 0) {
    toast.error('No clearance requests to export');
    return;
  }
  
  setIsExporting(true);
  
  setTimeout(() => {
    const headers = ['Reference No.', 'Clearance Number', 'Type', 'Purpose', 'Specific Purpose', 'Status', 'Urgency', 'Fee', 'Date Requested', 'Needed Date', 'Issue Date', 'Valid Until'];
    
    const csvData = clearances.map(clearance => [
      clearance.reference_number,
      clearance.clearance_number || 'N/A',
      getClearanceTypeDisplay(clearance.clearance_type),
      `"${(clearance.purpose || '').replace(/"/g, '""')}"`,
      `"${(clearance.specific_purpose || '').replace(/"/g, '""')}"`,
      clearance.status.replace('_', ' ').toUpperCase(),
      clearance.urgency.toUpperCase(),
      formatCurrency(clearance.fee_amount),
      formatDate(clearance.created_at, false),
      formatDate(clearance.needed_date, false),
      clearance.issue_date ? formatDate(clearance.issue_date, false) : 'Not issued',
      clearance.valid_until ? formatDate(clearance.valid_until, false) : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `clearance_requests_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
    toast.success('CSV file downloaded successfully');
  }, 500);
};