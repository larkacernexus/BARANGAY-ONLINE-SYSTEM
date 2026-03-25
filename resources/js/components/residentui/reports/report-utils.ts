// components/residentui/reports/report-utils.ts
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CommunityReport, ReportStatus } from '@/types/portal/reports/community-report';

export const formatDate = (dateString: string | null | undefined, isMobile: boolean = false): string => {
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

export const formatDateTime = (
    dateString: string | null | undefined, 
    timeString?: string | null, 
    isMobile: boolean = false
): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isMobile) {
            return format(date, 'MMM dd');
        }
        const formatted = format(date, 'MMM dd, yyyy');
        if (timeString) {
            return `${formatted} at ${timeString}`;
        }
        return formatted;
    } catch (error) {
        return 'N/A';
    }
};

export const formatTime = (timeString: string | null | undefined, isMobile: boolean = false): string => {
    if (!timeString) return 'N/A';
    try {
        // If timeString is already formatted like "14:30:00"
        if (timeString.includes(':')) {
            const parts = timeString.split(':');
            if (parts.length >= 2) {
                const time = `${parts[0]}:${parts[1]}`;
                if (isMobile) {
                    return time;
                }
                // Convert to 12-hour format for desktop
                const hours = parseInt(parts[0]);
                const minutes = parts[1];
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const hour12 = hours % 12 || 12;
                return `${hour12}:${minutes} ${ampm}`;
            }
        }
        return timeString;
    } catch (error) {
        return 'N/A';
    }
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStatusCount = (stats: any, status: ReportStatus | 'all'): number => {
    if (!stats) return 0;
    
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
        case 'cancelled':
            return stats.cancelled || 0;
        default: 
            return 0;
    }
};

export const copyToClipboard = async (text: string, successMessage: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
    } catch (error) {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy to clipboard');
    }
};

interface ReportForPrint {
    report_number: string;
    report_type: { name: string; category: string };
    title: string;
    created_at: string;
    evidences_count?: number;
    urgency: string;
    status: ReportStatus;
    description?: string;
    location?: string;
    incident_date?: string;
    incident_time?: string;
    is_anonymous?: boolean;
    resolved_at?: string | null;
}

interface ResidentInfo {
    first_name?: string;
    last_name?: string;
    email?: string;
}

export const printReportsList = (
    reports: ReportForPrint[],
    statusFilter: string,
    currentResident: ResidentInfo | null,
    formatDateFn: (date: string, isMobile: boolean) => string
): void => {
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
            <meta charset="UTF-8">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                    margin: 20px; 
                    line-height: 1.6;
                    color: #333;
                }
                h1 { 
                    color: #333; 
                    border-bottom: 2px solid #333; 
                    padding-bottom: 10px; 
                    margin-bottom: 20px;
                }
                .print-header { 
                    margin-bottom: 30px; 
                }
                .print-info { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 20px; 
                    flex-wrap: wrap; 
                    gap: 20px;
                    background: #f9fafb;
                    padding: 15px;
                    border-radius: 8px;
                }
                .report-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                }
                .report-table th { 
                    background-color: #f3f4f6; 
                    padding: 12px; 
                    text-align: left; 
                    border: 1px solid #ddd; 
                    font-weight: 600;
                }
                .report-table td { 
                    padding: 10px; 
                    border: 1px solid #ddd; 
                }
                .badge { 
                    padding: 4px 8px; 
                    border-radius: 12px; 
                    font-size: 11px; 
                    display: inline-block; 
                    font-weight: 500;
                }
                .badge-pending { background-color: #fef3c7; color: #92400e; }
                .badge-under_review { background-color: #dbeafe; color: #1e40af; }
                .badge-in_progress { background-color: #e0e7ff; color: #3730a3; }
                .badge-resolved { background-color: #d1fae5; color: #065f46; }
                .badge-rejected { background-color: #fee2e2; color: #991b1b; }
                .badge-cancelled { background-color: #f3f4f6; color: #6b7280; }
                .badge-high { background-color: #fee2e2; color: #991b1b; }
                .badge-medium { background-color: #fef3c7; color: #92400e; }
                .badge-low { background-color: #d1fae5; color: #065f46; }
                .footer { 
                    margin-top: 40px; 
                    text-align: center; 
                    color: #6b7280; 
                    font-size: 12px; 
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                }
                @media print {
                    body { margin: 0; padding: 20px; }
                    .no-print { display: none; }
                    .report-table th, .report-table td {
                        border-color: #ddd;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>Community Reports</h1>
                <div class="print-info">
                    <div>
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total Reports:</strong> ${reports.length}</p>
                        <p><strong>Status:</strong> ${statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                    <div>
                        <p><strong>Resident:</strong> ${currentResident?.first_name || ''} ${currentResident?.last_name || ''}</p>
                        <p><strong>Email:</strong> ${currentResident?.email || 'N/A'}</p>
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
                            <td>${report.report_type?.name || 'N/A'}</td>
                            <td>${report.title || 'N/A'}</td>
                            <td>${report.report_type?.category || 'N/A'}</td>
                            <td>${formatDateFn(report.created_at, false)}</td>
                            <td style="text-align: center;">${report.evidences_count || 0}</td>
                            <td><span class="badge badge-${report.urgency}">${report.urgency.toUpperCase()}</span></td>
                            <td><span class="badge badge-${report.status}">${report.status.replace('_', ' ').toUpperCase()}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Generated from Community Report System</p>
                <p>This is an official system-generated document</p>
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

interface ExportReportData {
    report_number: string;
    report_type: { name: string; category: string };
    title: string;
    description?: string;
    location?: string;
    incident_date: string;
    incident_time?: string | null;
    evidences_count?: number;
    urgency: string;
    status: ReportStatus;
    created_at: string;
    resolved_at?: string | null;
    is_anonymous: boolean;
}

export const exportReportsToCSV = (
    reports: ExportReportData[],
    statusFilter: string,
    formatDateFn: (date: string, isMobile: boolean) => string,
    setIsExporting: (value: boolean) => void,
    toastInstance: any
): void => {
    if (reports.length === 0) {
        toastInstance.error('No reports to export');
        return;
    }
    
    setIsExporting(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
        try {
            const headers = [
                'Report No.', 
                'Type', 
                'Category', 
                'Title', 
                'Description', 
                'Location', 
                'Incident Date', 
                'Incident Time', 
                'Evidence Files', 
                'Urgency', 
                'Status', 
                'Date Filed', 
                'Resolved At', 
                'Anonymous'
            ];
            
            const csvData = reports.map(report => [
                report.report_number,
                report.report_type?.name || 'N/A',
                report.report_type?.category || 'N/A',
                `"${(report.title || '').replace(/"/g, '""')}"`,
                `"${(report.description || '').replace(/"/g, '""')}"`,
                `"${(report.location || '').replace(/"/g, '""')}"`,
                formatDateFn(report.incident_date, false),
                report.incident_time || 'N/A',
                report.evidences_count || 0,
                report.urgency.toUpperCase(),
                report.status.replace('_', ' ').toUpperCase(),
                formatDateFn(report.created_at, false),
                report.resolved_at ? formatDateFn(report.resolved_at, false) : 'Not resolved',
                report.is_anonymous ? 'Yes' : 'No'
            ]);
            
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.join(','))
            ].join('\n');
            
            // Add BOM for UTF-8 to handle special characters
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `community_reports_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toastInstance.success('CSV file downloaded successfully');
        } catch (error) {
            console.error('Export failed:', error);
            toastInstance.error('Failed to export reports');
        } finally {
            setIsExporting(false);
        }
    }, 100);
};