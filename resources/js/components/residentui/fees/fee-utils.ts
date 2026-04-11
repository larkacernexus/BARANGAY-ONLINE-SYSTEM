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

// FIXED: Add safety checks for undefined/null values
export const formatCurrency = (amount: number | string | undefined | null) => {
    // Safety check for undefined, null, or empty values
    if (amount === undefined || amount === null || amount === '') {
        return '₱0.00';
    }
    
    // Convert to number if it's a string
    let numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if it's a valid number
    if (isNaN(numericAmount) || !isFinite(numericAmount)) {
        return '₱0.00';
    }
    
    // Ensure we have a number with 2 decimal places
    return `₱${numericAmount.toFixed(2)}`;
};

// Alternative version that handles different fee structures
export const formatFeeAmount = (fee: any) => {
    if (!fee) return '₱0.00';
    
    // Try to get amount from different possible field names
    const amount = fee.total_amount ?? fee.amount ?? fee.base_amount ?? 0;
    return formatCurrency(amount);
};

export const getCategoryDisplay = (feeType: any) => {
    if (!feeType) return 'Uncategorized';
    return feeType.document_category?.name || feeType.category_display || feeType.category || feeType.name || 'Uncategorized';
};

export const getStatusCount = (stats: any, status: string, fees: any[] = []) => {
    // Safety check for stats
    if (!stats) {
        if (status === 'all') return fees?.length || 0;
        return fees?.filter(f => f?.status === status).length || 0;
    }
    
    switch(status) {
        case 'all': 
            return stats.total_fees || 0;
        case 'pending': 
            return stats.pending_fees || 0;
        case 'issued': 
            return stats.issued_fees || fees?.filter(f => f?.status === 'issued').length || 0;
        case 'overdue': 
            return stats.overdue_fees || 0;
        case 'paid': 
            return stats.paid_fees || 0;
        case 'cancelled': 
            return stats.cancelled_fees || fees?.filter(f => f?.status === 'cancelled').length || 0;
        default: 
            return 0;
    }
};

export const printFeesList = (fees: any[], statusFilter: string, formatDate: any, getCategoryDisplay: any, formatCurrency: any) => {
    if (!fees || fees.length === 0) {
        toast.error('No fees to print');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
    }
    
    // Calculate total amount safely
    const totalAmount = fees.reduce((sum, f) => {
        const amount = f?.total_amount ?? f?.amount ?? f?.base_amount ?? 0;
        return sum + (typeof amount === 'number' ? amount : 0);
    }, 0);
    
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
                .badge-issued { background: #dbeafe; color: #1e40af; }
                .badge-cancelled { background: #f3f4f6; color: #374151; }
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
                        <div class="stat-value">${formatCurrency(totalAmount)}</div>
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
                        ${fees.map(fee => {
                            const amount = fee?.total_amount ?? fee?.amount ?? fee?.base_amount ?? 0;
                            const balance = fee?.balance ?? fee?.amount_paid ? amount - (fee.amount_paid || 0) : amount;
                            return `
                                <tr>
                                    <td><strong>${fee?.fee_code || 'N/A'}</strong></td>
                                    <td>${fee?.purpose || fee?.description || 'N/A'}</td>
                                    <td>${getCategoryDisplay(fee?.fee_type)}</td>
                                    <td>${formatDate(fee?.issue_date || fee?.created_at)}</td>
                                    <td>${formatDate(fee?.due_date)}</td>
                                    <td><span class="badge badge-${fee?.status || 'pending'}">${(fee?.status || 'pending').replace('_', ' ').toUpperCase()}</span></td>
                                    <td>${formatCurrency(amount)}</td>
                                    <td>${formatCurrency(balance)}</td>
                                </tr>
                            `;
                        }).join('')}
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
    if (!fees || fees.length === 0) {
        toast.error('No fees to export');
        return;
    }
    
    setIsExporting(true);
    
    setTimeout(() => {
        try {
            const headers = ['Fee Code', 'OR Number', 'Purpose', 'Type', 'Issue Date', 'Due Date', 'Status', 'Base Amount', 'Surcharge', 'Penalty', 'Discount', 'Total Amount', 'Amount Paid', 'Balance'];
            
            const csvData = fees.map(fee => {
                // Safely get values with fallbacks
                const totalAmount = fee?.total_amount ?? fee?.amount ?? fee?.base_amount ?? 0;
                const amountPaid = fee?.amount_paid ?? 0;
                const balance = fee?.balance ?? (totalAmount - amountPaid);
                
                return [
                    fee?.fee_code || 'N/A',
                    fee?.or_number || '',
                    `"${(fee?.purpose || fee?.description || '').replace(/"/g, '""')}"`,
                    getCategoryDisplay(fee?.fee_type),
                    formatDate(fee?.issue_date || fee?.created_at),
                    formatDate(fee?.due_date),
                    fee?.status || 'pending',
                    fee?.base_amount || 0,
                    fee?.surcharge_amount || 0,
                    fee?.penalty_amount || 0,
                    fee?.discount_amount || 0,
                    totalAmount,
                    amountPaid,
                    balance
                ];
            });
            
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
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export CSV');
            setIsExporting(false);
        }
    }, 500);
};