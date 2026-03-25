// components/portal/community-report/show/TimelineCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { History, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { CommunityReport, REPORT_STATUS_CONFIG } from '@/types/portal/reports/community-report';

interface TimelineCardProps {
    report: CommunityReport;
}

export const TimelineCard = ({ report }: TimelineCardProps) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        } catch {
            return 'N/A';
        }
    };

    const getStatusLabel = (status: string) => {
        const config = REPORT_STATUS_CONFIG[status as keyof typeof REPORT_STATUS_CONFIG];
        return config?.label || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getStatusIcon = (status: string) => {
        const config = REPORT_STATUS_CONFIG[status as keyof typeof REPORT_STATUS_CONFIG];
        return config?.icon || Clock;
    };

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                        <History className="h-4 w-4 text-white" />
                    </div>
                    Report Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-gray-200 dark:from-blue-400 dark:to-gray-700" />
                    
                    <div className="space-y-6">
                        <TimelineItem
                            title="Report Submitted"
                            date={formatDate(report.created_at)}
                            description="Report was submitted successfully"
                            isActive={true}
                            icon={CheckCircle}
                            iconColor="green"
                        />

                        {report.acknowledged_at && (
                            <TimelineItem
                                title="Report Acknowledged"
                                date={formatDate(report.acknowledged_at)}
                                description="Report was received and acknowledged"
                                isActive={true}
                                icon={Clock}
                                iconColor="blue"
                            />
                        )}

                        {report.status !== 'pending' && report.status !== 'cancelled' && (
                            <TimelineItem
                                title="Under Review"
                                date={formatDate(report.updated_at)}
                                description="Report is being reviewed by officials"
                                isActive={true}
                                icon={AlertCircle}
                                iconColor="purple"
                            />
                        )}

                        {report.assigned_to_user && (
                            <TimelineItem
                                title="Assigned"
                                date={report.assigned_to_user.name ? "After review" : formatDate(report.updated_at)}
                                description={`Assigned to ${report.assigned_to_user.name}${report.assigned_to_user.role ? ` (${report.assigned_to_user.role})` : ''}`}
                                isActive={true}
                                icon={History}
                                iconColor="purple"
                            />
                        )}

                        {report.status === 'resolved' && report.resolved_at && (
                            <TimelineItem
                                title={getStatusLabel(report.status)}
                                date={formatDate(report.resolved_at)}
                                description={
                                    report.resolution_notes || 'The report has been resolved successfully'
                                }
                                isActive={true}
                                icon={CheckCircle}
                                iconColor="green"
                                isFinal={true}
                            />
                        )}

                        {report.status === 'rejected' && (
                            <TimelineItem
                                title={getStatusLabel(report.status)}
                                date={formatDate(report.updated_at)}
                                description={
                                    report.resolution_notes || 'The report has been rejected'
                                }
                                isActive={true}
                                icon={XCircle}
                                iconColor="red"
                                isFinal={true}
                            />
                        )}

                        {report.status === 'cancelled' && (
                            <TimelineItem
                                title={getStatusLabel(report.status)}
                                date={formatDate(report.updated_at)}
                                description="The report has been cancelled"
                                isActive={true}
                                icon={XCircle}
                                iconColor="gray"
                                isFinal={true}
                            />
                        )}

                        {report.status !== 'resolved' && report.status !== 'rejected' && report.status !== 'cancelled' && (
                            <TimelineItem
                                title={getStatusLabel(report.status)}
                                description={
                                    report.status === 'in_progress' 
                                        ? 'Work is currently in progress'
                                        : 'Awaiting further action'
                                }
                                isActive={true}
                                icon={getStatusIcon(report.status)}
                                iconColor={
                                    report.status === 'in_progress' ? 'blue' :
                                    report.status === 'under_review' ? 'purple' : 'gray'
                                }
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

interface TimelineItemProps {
    title: string;
    date?: string;
    description: string;
    isActive?: boolean;
    iconColor?: string;
    icon?: React.ElementType;
    isFinal?: boolean;
}

const TimelineItem = ({ 
    title, 
    date, 
    description, 
    isActive, 
    iconColor = 'blue',
    icon: Icon,
    isFinal = false
}: TimelineItemProps) => {
    const colorClasses = {
        blue: 'bg-blue-500 ring-blue-100 dark:ring-blue-900/30',
        purple: 'bg-purple-500 ring-purple-100 dark:ring-purple-900/30',
        green: 'bg-green-500 ring-green-100 dark:ring-green-900/30',
        red: 'bg-red-500 ring-red-100 dark:ring-red-900/30',
        gray: 'bg-gray-500 ring-gray-100 dark:ring-gray-900/30'
    };

    const DefaultIcon = Icon || Clock;

    return (
        <div className="relative pl-10">
            <div className="absolute left-4 top-1.5">
                <div className={cn(
                    "h-3 w-3 rounded-full ring-4",
                    colorClasses[iconColor as keyof typeof colorClasses]
                )} />
            </div>
            <div>
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <DefaultIcon className={cn(
                            "h-4 w-4",
                            isFinal && iconColor === 'green' && "text-green-500",
                            isFinal && iconColor === 'red' && "text-red-500"
                        )} />
                        <h4 className="font-semibold text-sm">{title}</h4>
                    </div>
                    {date && <span className="text-xs text-gray-500">{date}</span>}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </div>
    );
};