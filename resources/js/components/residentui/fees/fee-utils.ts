import { toast } from 'sonner';

export const formatDate = (dateString: string, isMobile: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isMobile) {
            return date.toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
            });
        }
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        return 'N/A';
    }
};

export const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2)}`;
};

export const getCategoryDisplay = (feeType: any) => {
    if (!feeType) return '';
    return feeType.document_category?.name || feeType.category_display || feeType.category || 'Uncategorized';
};

export const getStatusCount = (stats: any, status: string, fees: any[] = []) => {
    switch(status) {
        case 'all': 
            return stats.total_fees || 0;
        case 'pending': 
            return stats.pending_fees || 0;
        case 'issued': 
            return stats.issued_fees || fees.filter(f => f.status === 'issued').length;
        case 'overdue': 
            return stats.overdue_fees || 0;
        case 'paid': 
            return stats.paid_fees || 0;
        case 'cancelled': 
            return stats.cancelled_fees || fees.filter(f => f.status === 'cancelled').length;
        default: 
            return 0;
    }
};

export const printFeesList = (fees: any[], statusFilter: string, formatDate: any, getCategoryDisplay: any, formatCurrency: any) => {
    if (fees.length === 0) {
        toast.error('No fees to print');
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
            <title>My Fees Report</title>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; margin: 30px; background: #f9fafb; }
                .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                h1 { font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 8px; }
                .subtitle { color: #6b7280; margin-bottom: 24px; }
                .header-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                .stat-card { background: #f3f4f6; padding: 16px; border-radius: 12px; }
                .stat-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
                .stat-value { font-size: 20px; font-weight: 600; color: #111827; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; }
                td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
                .badge { padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; display: inline-block; }
                .badge-pending { background: #fef3c7; color: #92400e; }
                .badge-paid { background: #d1fae5; color: #065f46; }
                .badge-overdue { background: #fee2e2; color: #991b1b; }
                .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>My Fees Report</h1>
                <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                
                <div class="header-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total Fees</div>
                        <div class="stat-value">${fees.length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Amount</div>
                        <div class="stat-value">${formatCurrency(fees.reduce((sum, f) => sum + f.total_amount, 0))}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Status</div>
                        <div class="stat-value">${statusFilter === 'all' ? 'All' : statusFilter}</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Fee Code</th>
                            <th>Purpose</th>
                            <th>Type</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fees.map(fee => `
                            <tr>
                                <td><strong>${fee.fee_code}</strong></td>
                                <td>${fee.purpose}</td>
                                <td>${getCategoryDisplay(fee.fee_type)}</td>
                                <td>${formatDate(fee.issue_date)}</td>
                                <td>${formatDate(fee.due_date)}</td>
                                <td><span class="badge badge-${fee.status}">${fee.status.replace('_', ' ').toUpperCase()}</span></td>
                                <td>${fee.formatted_total}</td>
                                <td>${fee.formatted_balance}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated from Barangay Management System • Page 1 of 1</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
};

export const exportToCSV = (
    fees: any[], 
    statusFilter: string, 
    formatDate: any, 
    getCategoryDisplay: any,
    setIsExporting: (value: boolean) => void,
    toast: any
) => {
    if (fees.length === 0) {
        toast.error('No fees to export');
        return;
    }
    
    setIsExporting(true);
    
    setTimeout(() => {
        const headers = ['Fee Code', 'OR Number', 'Purpose', 'Type', 'Issue Date', 'Due Date', 'Status', 'Base Amount', 'Surcharge', 'Penalty', 'Discount', 'Total Amount', 'Amount Paid', 'Balance'];
        
        const csvData = fees.map(fee => [
            fee.fee_code,
            fee.or_number || '',
            `"${(fee.purpose || '').replace(/"/g, '""')}"`,
            getCategoryDisplay(fee.fee_type),
            formatDate(fee.issue_date),
            formatDate(fee.due_date),
            fee.status,
            fee.base_amount,
            fee.surcharge_amount,
            fee.penalty_amount,
            fee.discount_amount,
            fee.total_amount,
            fee.amount_paid,
            fee.balance
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `fees_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
        toast.success('CSV file downloaded successfully');
    }, 500);
};