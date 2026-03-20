import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, DollarSign, Loader2, CheckCircle, FileCheck, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
    pending: { 
        label: 'Pending', 
        color: 'bg-yellow-100 dark:bg-yellow-900/30', 
        textColor: 'text-yellow-800 dark:text-yellow-300',
        icon: Clock 
    },
    pending_payment: { 
        label: 'Pending Payment', 
        color: 'bg-orange-100 dark:bg-orange-900/30', 
        textColor: 'text-orange-800 dark:text-orange-300',
        icon: DollarSign 
    },
    processing: { 
        label: 'Processing', 
        color: 'bg-blue-100 dark:bg-blue-900/30', 
        textColor: 'text-blue-800 dark:text-blue-300',
        icon: Loader2 
    },
    approved: { 
        label: 'Approved', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-800 dark:text-green-300',
        icon: CheckCircle 
    },
    issued: { 
        label: 'Issued', 
        color: 'bg-purple-100 dark:bg-purple-900/30', 
        textColor: 'text-purple-800 dark:text-purple-300',
        icon: FileCheck 
    },
    rejected: { 
        label: 'Rejected', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-800 dark:text-red-300',
        icon: XCircle 
    },
    cancelled: { 
        label: 'Cancelled', 
        color: 'bg-gray-100 dark:bg-gray-900', 
        textColor: 'text-gray-800 dark:text-gray-300',
        icon: XCircle 
    },
};

interface ClearanceStatusBadgeProps {
    status: string;
}

export function ClearanceStatusBadge({ status }: ClearanceStatusBadgeProps) {
    const statusKey = (status || '').toLowerCase() as keyof typeof STATUS_CONFIG;
    const config = STATUS_CONFIG[statusKey];
    
    if (!config) {
        return (
            <Badge className="bg-gray-100 text-gray-800 border-0 px-2 py-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span className="capitalize">{status.replace('_', ' ')}</span>
            </Badge>
        );
    }
    
    const Icon = config.icon;
    return (
        <Badge className={`${config.color} ${config.textColor} border-0 px-2 py-1 flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </Badge>
    );
}