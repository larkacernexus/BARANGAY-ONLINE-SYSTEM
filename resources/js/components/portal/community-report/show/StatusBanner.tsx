// /components/portal/community-report/show/StatusBanner.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, 
    Loader2, 
    TrendingUp, 
    CheckCircle, 
    XCircle,
    UserCheck,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportStatus } from '@/types/portal/reports/community-report';
import { STATUS_CONFIG } from '@/components/residentui/reports/constants';

interface StatusBannerProps {
    status: ReportStatus;
    priority?: string;
    assignedToUser?: {
        id: number;
        name: string;
        role?: string;
    } | null;
    createdAt: string;
    updatedAt: string;
    acknowledgedAt?: string | null;
    resolvedAt?: string | null;
    resolutionNotes?: string | null;
    formatDateTime: (date: string, time?: string | null, isMobile?: boolean) => string;
}

export const StatusBanner = ({
    status,
    priority,
    assignedToUser,
    createdAt,
    updatedAt,
    acknowledgedAt,
    resolvedAt,
    resolutionNotes,
    formatDateTime,
}: StatusBannerProps) => {
    const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;

    const getStatusGradient = () => {
        switch (status) {
            case 'pending': return 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20';
            case 'under_review': return 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20';
            case 'in_progress': return 'from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20';
            case 'resolved': return 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20';
            case 'rejected': return 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20';
            default: return 'from-gray-50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-800/20';
        }
    };

    return (
        <Card className={cn(
            "border-0 shadow-lg bg-gradient-to-br overflow-hidden",
            getStatusGradient()
        )}>
            <CardContent className="p-0">
                <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center",
                                statusConfig.color
                            )}>
                                <StatusIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg font-semibold">
                                        Status: {statusConfig.label}
                                    </h2>
                                    {priority && (
                                        <Badge variant="outline" className="capitalize">
                                            Priority: {priority}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {statusConfig.description || getDefaultDescription(status)}
                                </p>
                            </div>
                        </div>

                        {assignedToUser && (
                            <div className="flex items-center gap-2 text-sm bg-white/50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                                <UserCheck className="h-4 w-4 text-blue-500" />
                                <span className="text-gray-600 dark:text-gray-400">
                                    Assigned to: <strong>{assignedToUser.name}</strong>
                                    {assignedToUser.role && ` (${assignedToUser.role})`}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Created</p>
                                <p className="font-medium">{formatDateTime(createdAt, null, false)}</p>
                            </div>
                        </div>
                        
                        {acknowledgedAt && (
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Acknowledged</p>
                                    <p className="font-medium">{formatDateTime(acknowledgedAt, null, false)}</p>
                                </div>
                            </div>
                        )}
                        
                        {resolvedAt && (
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Resolved</p>
                                    <p className="font-medium">{formatDateTime(resolvedAt, null, false)}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Last Updated</p>
                                <p className="font-medium">{formatDateTime(updatedAt, null, false)}</p>
                            </div>
                        </div>
                    </div>

                    {resolutionNotes && status === 'resolved' && (
                        <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-green-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Resolution Notes</p>
                                    <p className="text-sm">{resolutionNotes}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const getDefaultDescription = (status: ReportStatus): string => {
    switch (status) {
        case 'pending': return 'Your report is awaiting review by our team.';
        case 'under_review': return 'Your report is currently being investigated.';
        case 'in_progress': return 'Action is being taken to address your report.';
        case 'resolved': return 'Your report has been successfully resolved.';
        case 'rejected': return 'Your report has been reviewed and rejected.';
        default: return 'Status update pending.';
    }
};