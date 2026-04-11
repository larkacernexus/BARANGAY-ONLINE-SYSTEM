// resources/js/components/admin/community-reports/show/components/report-header.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    ArrowLeft,
    Printer,
    Copy,
    Edit,
    Trash2,
    Check,
    Hash,
    FileText,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { CommunityReport } from '@/types/admin/reports/community-report';

interface ReportHeaderProps {
    report: CommunityReport;
    onCopy: () => void;
    onPrint: () => void;
    onDelete: () => void;
    copied: boolean;
    getStatusColor: (status: string | null | undefined) => string;
    getStatusIcon: (status: string | null | undefined) => React.ReactNode;
    getPriorityColor: (priority: string | null | undefined) => string;
    getPriorityIcon: (priority: string | null | undefined) => React.ReactNode;
    getUrgencyColor: (urgency: string | null | undefined) => string;
    getUrgencyIcon: (urgency: string | null | undefined) => React.ReactNode;
    formatStatusText: (status: string | null | undefined) => string;
}

export function ReportHeader({
    report,
    onCopy,
    onPrint,
    onDelete,
    copied,
    getStatusColor,
    getStatusIcon,
    getPriorityColor,
    getPriorityIcon,
    getUrgencyColor,
    getUrgencyIcon,
    formatStatusText,
}: ReportHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href={route('admin.community-reports.index')}>
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${
                        report.status === 'resolved'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700'
                            : report.status === 'in_progress'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700'
                            : report.status === 'under_review'
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700'
                            : report.status === 'assigned'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700'
                            : report.status === 'rejected'
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700'
                            : 'bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700'
                    }`}>
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                            Community Report
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(report.status)}`}>
                                {getStatusIcon(report.status)}
                                <span className="ml-1">{formatStatusText(report.status)}</span>
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                <Hash className="h-3 w-3" />
                                {report.report_number || 'N/A'}
                            </Badge>
                            <Badge variant="outline" className={`flex items-center gap-1 ${getPriorityColor(report.priority)}`}>
                                {getPriorityIcon(report.priority)}
                                <span className="ml-1 capitalize">{report.priority}</span>
                            </Badge>
                            <Badge variant="outline" className={`flex items-center gap-1 ${getUrgencyColor(report.urgency_level)}`}>
                                {getUrgencyIcon(report.urgency_level)}
                                <span className="ml-1 capitalize">{report.urgency_level}</span>
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onCopy}
                                disabled={!report.report_number}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                ) : (
                                    <Copy className="h-4 w-4 mr-2" />
                                )}
                                {copied ? 'Copied!' : 'Copy ID'}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy report number</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onPrint}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Print report details</TooltipContent>
                    </Tooltip>

                    <Link href={route('admin.community-reports.edit', report.id)}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </TooltipProvider>
            </div>
        </div>
    );
}