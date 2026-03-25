// components/portal/community-report/show/ReportInfoCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, AlertTriangle, HeartPulse, History } from 'lucide-react';
import { AFFECTED_PEOPLE_CONFIG } from '@/types/portal/reports/community-report';
import { formatDate, formatTime } from '@/components/residentui/reports/report-utils';
import { CommunityReport } from '@/types/portal/reports/community-report';

interface ReportInfoCardProps {
    report: CommunityReport;
    getUrgencyBadge: (urgency: string) => React.ReactNode;
    getImpactBadge: (impact: string) => React.ReactNode;
}

export const ReportInfoCard = ({ report, getUrgencyBadge, getImpactBadge }: ReportInfoCardProps) => {
    // Get icon from report type or use default
    const TypeIcon = report.report_type?.icon_component || (() => null);
    const AffectedConfig = report.affected_people 
        ? AFFECTED_PEOPLE_CONFIG[report.affected_people] 
        : AFFECTED_PEOPLE_CONFIG.individual;
    const AffectedIcon = AffectedConfig.icon;

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div 
                        className="h-8 w-8 rounded-xl flex items-center justify-center"
                        style={{ 
                            background: report.report_type?.color ? `${report.report_type.color}20` : '#e0f2fe',
                            color: report.report_type?.color || '#0369a1'
                        }}
                    >
                        <TypeIcon className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="block">{report.report_type?.name || 'Unknown Type'}</span>
                        <CardDescription className="text-xs">#{report.report_number}</CardDescription>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                        {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {report.description}
                    </p>
                    {report.detailed_description && (
                        <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <h4 className="font-medium text-sm mb-2">Additional Details</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                {report.detailed_description}
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <p className="text-xs text-gray-500">Location</p>
                        </div>
                        <p className="font-medium text-sm">{report.location}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="text-xs text-gray-500">Incident Date</p>
                        </div>
                        <p className="font-medium text-sm">{formatDate(report.incident_date, false)}</p>
                        {report.incident_time && (
                            <p className="text-xs text-gray-500 mt-1">{report.incident_time}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Urgency Level</p>
                        {getUrgencyBadge(report.urgency)}
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Impact Level</p>
                        {getImpactBadge(report.impact_level || 'minor')}
                    </div>
                </div>

                {(report.safety_concern || report.environmental_impact || report.recurring_issue) && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Concerns</p>
                        <div className="flex flex-wrap gap-2">
                            {report.safety_concern && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Safety Concern
                                </Badge>
                            )}
                            {report.environmental_impact && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <HeartPulse className="h-3 w-3 mr-1" />
                                    Environmental Impact
                                </Badge>
                            )}
                            {report.recurring_issue && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    <History className="h-3 w-3 mr-1" />
                                    Recurring Issue
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {report.affected_people && report.estimated_affected_count && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Affected People</p>
                        <div className="flex items-center gap-2">
                            <AffectedIcon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-sm">{AffectedConfig.label}</span>
                            <Badge variant="outline" className="text-xs">
                                {report.estimated_affected_count} people
                            </Badge>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};