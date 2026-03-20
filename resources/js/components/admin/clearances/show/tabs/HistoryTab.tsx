// components/admin/clearances/show/tabs/HistoryTab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    History, 
    User, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    RefreshCw,
    FileCheck,
    DollarSign,
    Mail,
    MessageSquare,
    Eye,
    Edit,
    Trash2,
    Upload,
    Download
} from 'lucide-react';
import { ActivityLog } from '@/types/clearance';

interface HistoryTabProps {
    activityLogs: ActivityLog[];
    formatDateTime: (date?: string) => string;
}

export function HistoryTab({ activityLogs, formatDateTime }: HistoryTabProps) {
    
    const getActivityIcon = (log: ActivityLog) => {
        const description = log.description?.toLowerCase() || '';
        const event = log.event?.toLowerCase() || '';
        
        if (description.includes('create') || event.includes('create')) 
            return <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />;
        if (description.includes('update') || event.includes('update') || description.includes('edit') || event.includes('edit')) 
            return <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
        if (description.includes('delete') || event.includes('delete')) 
            return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />;
        if (description.includes('approve') || event.includes('approve')) 
            return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
        if (description.includes('reject') || event.includes('reject')) 
            return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
        if (description.includes('issue') || event.includes('issue')) 
            return <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
        if (description.includes('payment') || event.includes('payment')) 
            return <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />;
        if (description.includes('email') || event.includes('email') || description.includes('reminder') || event.includes('reminder')) 
            return <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
        if (description.includes('note') || event.includes('note')) 
            return <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
        if (description.includes('view') || event.includes('view')) 
            return <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
        if (description.includes('upload') || event.includes('upload')) 
            return <Upload className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
        if (description.includes('download') || event.includes('download')) 
            return <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
        
        return <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    };

    const getActivityColor = (log: ActivityLog) => {
        const description = log.description?.toLowerCase() || '';
        const event = log.event?.toLowerCase() || '';
        
        if (description.includes('approve') || event.includes('approve') || description.includes('issue') || event.includes('issue'))
            return 'bg-green-100 dark:bg-green-900/30';
        if (description.includes('reject') || event.includes('reject') || description.includes('delete') || event.includes('delete'))
            return 'bg-red-100 dark:bg-red-900/30';
        if (description.includes('payment') || event.includes('payment'))
            return 'bg-emerald-100 dark:bg-emerald-900/30';
        if (description.includes('update') || event.includes('update') || description.includes('edit') || event.includes('edit'))
            return 'bg-blue-100 dark:bg-blue-900/30';
        if (description.includes('create') || event.includes('create'))
            return 'bg-purple-100 dark:bg-purple-900/30';
        
        return 'bg-gray-100 dark:bg-gray-900';
    };

    return (
        <div>
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 flex items-center justify-center">
                            <History className="h-3 w-3 text-white" />
                        </div>
                        Activity Log
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Timeline of all actions performed on this clearance request
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activityLogs.length > 0 ? (
                        <div className="space-y-4">
                            {activityLogs.map((log: ActivityLog, index: number) => (
                                <div key={log.id} className="relative">
                                    {/* Timeline Line */}
                                    {index < activityLogs.length - 1 && (
                                        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800"></div>
                                    )}
                                    
                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(log)}`}>
                                            {getActivityIcon(log)}
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 pb-8">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {log.description || log.event || 'Activity recorded'}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatDateTime(log.created_at)}
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            {/* User Info */}
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <User className="h-3 w-3" />
                                                <span>{log.causer?.name || 'System'}</span>
                                                {log.causer?.email && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{log.causer.email}</span>
                                                    </>
                                                )}
                                            </div>
                                            
                                            {/* Properties (if any) */}
                                            {log.properties && Object.keys(log.properties).length > 0 && (
                                                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                        {JSON.stringify(log.properties, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-6">
                                <History className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No activity yet</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                No actions have been performed on this request yet.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}