import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MoreVertical, Copy, FileText, Paperclip, Shield } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { STATUS_CONFIG, URGENCY_CONFIG } from './constants';

interface ModernReportTableProps {
    reports: any[];
    selectMode: boolean;
    selectedReports: number[];
    toggleSelectReport: (id: number) => void;
    selectAllReports: () => void;
    formatDate: (date: string) => string;
    onViewDetails: (id: number) => void;
    onCopyReportNumber: (number: string) => void;
    onGenerateReport: (report: any) => void;
}

export const ModernReportTable = ({
    reports,
    selectMode,
    selectedReports,
    toggleSelectReport,
    selectAllReports,
    formatDate,
    onViewDetails,
    onCopyReportNumber,
    onGenerateReport,
}: ModernReportTableProps) => {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        {selectMode && (
                            <TableHead className="w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedReports.length === reports.length && reports.length > 0}
                                    onChange={selectAllReports}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                            </TableHead>
                        )}
                        <TableHead className="font-semibold">Report Details</TableHead>
                        <TableHead className="font-semibold">Type & Category</TableHead>
                        <TableHead className="font-semibold">Dates</TableHead>
                        <TableHead className="font-semibold">Evidence</TableHead>
                        <TableHead className="font-semibold">Urgency</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => {
                        const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG];
                        const urgencyConfig = URGENCY_CONFIG[report.urgency as keyof typeof URGENCY_CONFIG];
                        const StatusIcon = statusConfig?.icon;

                        return (
                            <TableRow key={report.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                {selectMode && (
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selectedReports.includes(report.id)}
                                            onChange={() => toggleSelectReport(report.id)}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                    </TableCell>
                                )}
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onCopyReportNumber(report.report_number)}
                                                className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                #{report.report_number}
                                            </button>
                                            {report.is_anonymous && (
                                                <Badge variant="outline" className="text-xs">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Anonymous
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {report.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Location: {report.location}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <p className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                                            {report.report_type.category}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {report.report_type.name}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div>
                                            <p className="text-xs text-gray-500">Filed</p>
                                            <p className="text-sm">{formatDate(report.created_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Incident</p>
                                            <p className="text-sm">{formatDate(report.incident_date)}</p>
                                            {report.incident_time && (
                                                <p className="text-xs text-gray-500">{report.incident_time}</p>
                                            )}
                                        </div>
                                        {report.resolved_at && (
                                            <div>
                                                <p className="text-xs text-green-600">Resolved</p>
                                                <p className="text-sm text-green-600">{formatDate(report.resolved_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Paperclip className="h-3 w-3 text-gray-400" />
                                        <span className="text-sm">{report.evidences_count || 0}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`${urgencyConfig?.color} ${urgencyConfig?.textColor} border-0 flex items-center w-fit`}>
                                        <span className={`h-2 w-2 rounded-full ${urgencyConfig?.dot} mr-2`}></span>
                                        <span>{urgencyConfig?.label || report.urgency}</span>
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${statusConfig?.color} ${statusConfig?.textColor} border-0 px-2 py-1 flex items-center gap-1 w-fit`}>
                                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                        <span>{statusConfig?.label || report.status}</span>
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => onViewDetails(report.id)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => onCopyReportNumber(report.report_number)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy Report No.
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onGenerateReport(report)}>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Generate Report
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};