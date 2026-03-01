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

export const formatDateTime = (dateString: string, timeString?: string | null, isMobile: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isMobile) {
            return format(date, 'MMM dd');
        }
        const formatted = format(date, 'MMM dd, yyyy');
        return timeString ? `${formatted} at ${timeString}` : formatted;
    } catch (error) {
        return 'N/A';
    }
};

export const getStatusCount = (stats: any, status: string) => {
    switch(status) {
        case 'all': 
            return stats.total || 0;
        case 'pending': 
            return stats.pending || 0;
        case 'under_review': 
            return stats.under_review || 0;
        case 'in_progress': 
            return stats.in_progress || 0;
        case 'resolved': 
            return stats.resolved || 0;
        case 'rejected': 
            return stats.rejected || 0;
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

export const printReportsList = (
    reports: any[],
    statusFilter: string,
    currentResident: any,
    formatDate: any
) => {
    if (reports.length === 0) {
        toast.error('No reports to print');
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
            <title>Community Reports</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .print-header { margin-bottom: 30px; }
                .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
                .report-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .report-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
                .report-table td { padding: 10px; border: 1px solid #ddd; }
                .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
                .badge-pending { background-color: #fef3c7; color: #92400e; }
                .badge-under_review { background-color: #dbeafe; color: #1e40af; }
                .badge-in_progress { background-color: #e0e7ff; color: #3730a3; }
                .badge-resolved { background-color: #d1fae5; color: #065f46; }
                .badge-rejected { background-color: #fee2e2; color: #991b1b; }
                .badge-high { background-color: #fee2e2; color: #991b1b; }
                .badge-medium { background-color: #fef3c7; color: #92400e; }
                .badge-low { background-color: #d1fae5; color: #065f46; }
                .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>Community Reports</h1>
                <div class="print-info">
                    <div>
                        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Total Reports:</strong> ${reports.length}</p>
                        <p><strong>Status:</strong> ${statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')}</p>
                    </div>
                    <div>
                        <p><strong>Resident:</strong> ${currentResident?.first_name || ''} ${currentResident?.last_name || ''}</p>
                        <p><strong>Date Range:</strong> All Time</p>
                    </div>
                </div>
            </div>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Report No.</th>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date Filed</th>
                        <th>Evidence</th>
                        <th>Urgency</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${reports.map(report => `
                        <tr>
                            <td>${report.report_number}</td>
                            <td>${report.report_type.name}</td>
                            <td>${report.title}</td>
                            <td>${report.report_type.category}</td>
                            <td>${formatDate(report.created_at, false)}</td>
                            <td>${report.evidences_count || 0}</td>
                            <td><span class="badge badge-${report.urgency}">${report.urgency.toUpperCase()}</span></td>
                            <td><span class="badge badge-${report.status}">${report.status.replace('_', ' ').toUpperCase()}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Generated from Community Report System</p>
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

export const exportReportsToCSV = (
    reports: any[],
    statusFilter: string,
    formatDate: any,
    setIsExporting: (value: boolean) => void,
    toast: any
) => {
    if (reports.length === 0) {
        toast.error('No reports to export');
        return;
    }
    
    setIsExporting(true);
    
    setTimeout(() => {
        const headers = ['Report No.', 'Type', 'Category', 'Title', 'Description', 'Location', 'Incident Date', 'Incident Time', 'Evidence Files', 'Urgency', 'Status', 'Date Filed', 'Resolved At', 'Anonymous'];
        
        const csvData = reports.map(report => [
            report.report_number,
            report.report_type.name,
            report.report_type.category,
            `"${(report.title || '').replace(/"/g, '""')}"`,
            `"${(report.description || '').replace(/"/g, '""')}"`,
            `"${(report.location || '').replace(/"/g, '""')}"`,
            formatDate(report.incident_date, false),
            report.incident_time || 'N/A',
            report.evidences_count || 0,
            report.urgency.toUpperCase(),
            report.status.replace('_', ' ').toUpperCase(),
            formatDate(report.created_at, false),
            report.resolved_at ? formatDate(report.resolved_at, false) : 'Not resolved',
            report.is_anonymous ? 'Yes' : 'No'
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `community_reports_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
        toast.success('CSV file downloaded successfully');
    }, 500);
};