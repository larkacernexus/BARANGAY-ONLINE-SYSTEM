// resources/js/components/admin/community-reports/show/components/report-information-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    FileText,
    MapPin,
    Calendar,
    AlertTriangle,
    TreePine,
    Repeat,
    HistoryIcon,
    Timer,
} from 'lucide-react';
import { CommunityReport } from './types';
import { ReactNode } from 'react';

interface ReportInformationCardProps {
    report: CommunityReport;
    formatDate: (date: string | null | undefined) => string;
    formatTime: (time: string | null | undefined) => string;
    getImpactIcon: (impact: string | null | undefined) => ReactNode;
    getImpactColor: (impact: string | null | undefined) => string;
    getAffectedPeopleIcon: (type: string | null | undefined) => ReactNode;
    getNoiseLevelIcon: (noise: string | null | undefined) => ReactNode;
    getNoiseLevelColor: (noise: string | null | undefined) => string;
    getStatusColor: (status: string | null | undefined) => string;
    formatStatusText: (status: string | null | undefined) => string;
}

export function ReportInformationCard({
    report,
    formatDate,
    formatTime,
    getImpactIcon,
    getImpactColor,
    getAffectedPeopleIcon,
    getNoiseLevelIcon,
    getNoiseLevelColor,
    getStatusColor,
    formatStatusText,
}: ReportInformationCardProps) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                        <FileText className="h-3 w-3 text-white" />
                    </div>
                    Report Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Detailed information about the community report
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Report Type</p>
                        <p className="text-sm font-medium dark:text-gray-200">
                            {report.report_type?.name || 'Not specified'}
                        </p>
                        {report.report_type?.category && (
                            <Badge variant="outline" className="mt-1 text-xs dark:border-gray-600 dark:text-gray-300">
                                {report.report_type.category}
                            </Badge>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Report Number</p>
                        <p className="text-sm font-mono dark:text-gray-200">
                            {report.report_number || 'N/A'}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</p>
                        <p className="text-base font-semibold dark:text-gray-100">{report.title || 'No title'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                            <p className="text-sm whitespace-pre-line dark:text-gray-300">
                                {report.description || 'No description provided'}
                            </p>
                        </div>
                    </div>
                    {report.detailed_description && (
                        <div className="md:col-span-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Detailed Description</p>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                                <p className="text-sm whitespace-pre-line dark:text-gray-300">
                                    {report.detailed_description}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                            <MapPin className="h-3 w-3" />
                            Location
                        </p>
                        <p className="text-sm dark:text-gray-300">{report.location || 'Not specified'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                            <Calendar className="h-3 w-3" />
                            Incident Date
                        </p>
                        <p className="text-sm dark:text-gray-300">{formatDate(report.incident_date)}</p>
                        {report.incident_time && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time: {formatTime(report.incident_time)}</p>
                        )}
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                            {getImpactIcon(report.impact_level)}
                            Impact Level
                        </p>
                        <Badge variant="outline" className={`mt-1 text-xs capitalize ${getImpactColor(report.impact_level)}`}>
                            {report.impact_level}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                            {getAffectedPeopleIcon(report.affected_people)}
                            Affected People
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs capitalize dark:border-gray-600 dark:text-gray-300">
                            {report.affected_people}
                        </Badge>
                        {report.estimated_affected_count && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Estimated count: {report.estimated_affected_count}
                            </p>
                        )}
                    </div>
                    {report.noise_level && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                                {getNoiseLevelIcon(report.noise_level)}
                                Noise Level
                            </p>
                            <Badge variant="outline" className={`mt-1 text-xs capitalize ${getNoiseLevelColor(report.noise_level)}`}>
                                {report.noise_level}
                            </Badge>
                        </div>
                    )}
                    {report.duration_hours && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                                <Timer className="h-3 w-3" />
                                Duration
                            </p>
                            <p className="mt-1 text-sm dark:text-gray-300">{report.duration_hours} hours</p>
                        </div>
                    )}
                    <div className="md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {report.safety_concern && (
                                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <AlertTriangle className="h-3 w-3 text-red-500 dark:text-red-400" />
                                    <span className="text-xs text-red-700 dark:text-red-400">Safety Concern</span>
                                </div>
                            )}
                            {report.environmental_impact && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <TreePine className="h-3 w-3 text-green-500 dark:text-green-400" />
                                    <span className="text-xs text-green-700 dark:text-green-400">Environmental Impact</span>
                                </div>
                            )}
                            {report.recurring_issue && (
                                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <Repeat className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                    <span className="text-xs text-amber-700 dark:text-amber-400">Recurring Issue</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {report.has_previous_report && report.previous_report && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <HistoryIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Previous Related Report</p>
                        </div>
                        <Link 
                            href={route('admin.community-reports.show', report.previous_report.id)}
                            className="block p-3 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm dark:text-gray-200">{report.previous_report.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">#{report.previous_report.report_number}</p>
                                </div>
                                <Badge className={getStatusColor(report.previous_report.status)}>
                                    {formatStatusText(report.previous_report.status)}
                                </Badge>
                            </div>
                        </Link>
                    </div>
                )}

                {report.perpetrator_details && (
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Perpetrator Details</p>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                            <p className="text-sm whitespace-pre-line dark:text-gray-300">
                                {report.perpetrator_details}
                            </p>
                        </div>
                    </div>
                )}

                {report.preferred_resolution && (
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preferred Resolution</p>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                            <p className="text-sm whitespace-pre-line dark:text-gray-300">
                                {report.preferred_resolution}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}