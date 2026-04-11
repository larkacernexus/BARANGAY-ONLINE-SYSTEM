// resources/js/components/admin/payments/show/components/payment-history-tab.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    History,
    Clock,
    User,
    CreditCard,
    CheckCircle,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import { formatDate, getRoute } from '../utils/helpers';

export interface PaymentHistory {
    id?: number;
    payment_id: number;
    action: string;
    status?: string;
    description?: string;
    changes?: Record<string, { old: any; new: any }>;
    metadata?: {
        reference_number?: string;
        payment_method?: string;
        reason?: string;
        [key: string]: any;
    };
    user?: {
        id: number;
        name: string;
        email?: string;
    };
    created_at: string;
}

interface PaymentHistoryTabProps {
    history?: PaymentHistory[] | unknown;
    paymentId?: number;
}

const getHistoryIcon = (action: string) => {
    switch (action) {
        case 'created':
            return <CreditCard className="h-4 w-4 text-green-500" />;
        case 'updated':
            return <RefreshCw className="h-4 w-4 text-blue-500" />;
        case 'status_changed':
            return <CheckCircle className="h-4 w-4 text-purple-500" />;
        case 'voided':
            return <XCircle className="h-4 w-4 text-red-500" />;
        case 'refunded':
            return <RefreshCw className="h-4 w-4 text-orange-500" />;
        default:
            return <Clock className="h-4 w-4 text-gray-500" />;
    }
};

const getActionDisplay = (action: string): string => {
    const actionMap: Record<string, string> = {
        'created': 'Payment Created',
        'updated': 'Payment Updated',
        'status_changed': 'Status Changed',
        'voided': 'Payment Voided',
        'refunded': 'Payment Refunded',
    };
    return actionMap[action] || action.charAt(0).toUpperCase() + action.slice(1);
};

const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'pending':
            return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">Pending</Badge>;
        case 'completed':
            return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Completed</Badge>;
        case 'failed':
            return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">Failed</Badge>;
        case 'refunded':
            return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">Refunded</Badge>;
        case 'voided':
            return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">Voided</Badge>;
        default:
            return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
};

// Helper to get user initial
const getUserInitial = (userName?: string): string => {
    if (!userName) return 'S';
    return userName.charAt(0).toUpperCase();
};

// Helper to format user display name
const formatUserName = (user?: { name?: string; id?: number }): string => {
    if (!user) return 'System';
    if (user.name && user.name !== 'null' && user.name !== 'undefined') {
        return user.name;
    }
    return `User #${user.id}`;
};

export const PaymentHistoryTab = ({ history = [], paymentId }: PaymentHistoryTabProps) => {
    // Safe check to ensure history is an array
    const safeHistory = Array.isArray(history) ? (history as PaymentHistory[]) : [];
    
    // Filter out duplicate events if needed (optional)
    const uniqueHistory = safeHistory.filter((record, index, self) => 
        index === self.findIndex(r => 
            r.id === record.id && r.action === record.action && r.created_at === record.created_at
        )
    );
    
    if (uniqueHistory.length === 0) {
        return (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="py-12">
                    <div className="text-center">
                        <History className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No History Yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No activities or changes have been recorded for this payment.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    <CardTitle className="text-gray-900 dark:text-gray-100">Activity Timeline</CardTitle>
                </div>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                    Track all changes and activities related to this payment
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
                        
                        <div className="space-y-6">
                            {uniqueHistory.map((record, index) => {
                                const userName = formatUserName(record.user);
                                const userInitial = getUserInitial(record.user?.name);
                                
                                return (
                                    <div key={record.id || index} className="relative flex gap-4">
                                        {/* Timeline dot */}
                                        <div className="relative z-10 flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                {getHistoryIcon(record.action)}
                                            </div>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pb-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {getActionDisplay(record.action)}
                                                    </span>
                                                    {record.status && getStatusBadge(record.status)}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDate(record.created_at)}</span>
                                                </div>
                                            </div>
                                            
                                            {record.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {record.description}
                                                </p>
                                            )}
                                            
                                            {/* User info - FIXED display */}
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className="text-[10px] bg-gray-100 dark:bg-gray-800">
                                                        {userInitial}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>by <span className="font-medium text-gray-700 dark:text-gray-300">{userName}</span></span>
                                            </div>
                                            
                                            {/* Changes details */}
                                            {record.changes && Object.keys(record.changes).length > 0 && (
                                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs">
                                                    <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Changes:</div>
                                                    <div className="space-y-1">
                                                        {Object.entries(record.changes).map(([field, change]) => (
                                                            <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                                <span className="font-medium text-gray-600 dark:text-gray-400 capitalize w-32">
                                                                    {field.replace(/_/g, ' ')}:
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-red-600 dark:text-red-400 line-through">
                                                                        {typeof change.old === 'number' ? `₱${change.old.toLocaleString()}` : change.old}
                                                                    </span>
                                                                    <span className="text-gray-400 dark:text-gray-600">→</span>
                                                                    <span className="text-green-600 dark:text-green-400">
                                                                        {typeof change.new === 'number' ? `₱${change.new.toLocaleString()}` : change.new}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Metadata */}
                                            {record.metadata && Object.keys(record.metadata).length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {record.metadata.reference_number && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Ref: {record.metadata.reference_number}
                                                        </Badge>
                                                    )}
                                                    {record.metadata.payment_method && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Method: {record.metadata.payment_method}
                                                        </Badge>
                                                    )}
                                                    {record.metadata.reason && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Reason: {record.metadata.reason}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ScrollArea>
                
                {/* View all history link */}
                {paymentId && uniqueHistory.length > 5 && (
                    <div className="mt-4 pt-2 text-center border-t border-gray-200 dark:border-gray-700">
                        <Link
                            href={getRoute('admin.payments.history', paymentId)}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1"
                        >
                            <History className="h-3 w-3" />
                            View Full History
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};