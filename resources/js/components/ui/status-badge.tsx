import { Badge } from '@/components/ui/badge';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    DollarSign,
    FileCheck,
    LucideIcon
} from 'lucide-react';

export const STATUS_CONFIG = {
    pending: { 
        label: 'Pending', 
        color: 'bg-yellow-100 dark:bg-yellow-900/30', 
        textColor: 'text-yellow-800 dark:text-yellow-300',
        icon: Clock 
    },
    issued: { 
        label: 'Issued', 
        color: 'bg-purple-100 dark:bg-purple-900/30', 
        textColor: 'text-purple-800 dark:text-purple-300',
        icon: FileCheck 
    },
    partially_paid: { 
        label: 'Partial', 
        color: 'bg-blue-100 dark:bg-blue-900/30', 
        textColor: 'text-blue-800 dark:text-blue-300',
        icon: DollarSign 
    },
    paid: { 
        label: 'Paid', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-800 dark:text-green-300',
        icon: CheckCircle 
    },
    overdue: { 
        label: 'Overdue', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-800 dark:text-red-300',
        icon: AlertCircle 
    },
    cancelled: { 
        label: 'Cancelled', 
        color: 'bg-gray-100 dark:bg-gray-800', 
        textColor: 'text-gray-800 dark:text-gray-300',
        icon: XCircle 
    },
};

interface StatusBadgeProps {
    status: string;
    isOverdue?: boolean;
    size?: 'sm' | 'md';
}

export function StatusBadge({ status, isOverdue = false, size = 'md' }: StatusBadgeProps) {
    if (isOverdue) {
        return (
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0 px-2 py-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Overdue
            </Badge>
        );
    }
    
    const statusKey = status.toLowerCase() as keyof typeof STATUS_CONFIG;
    const config = STATUS_CONFIG[statusKey];
    
    if (!config) {
        return (
            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-0 px-2 py-1 flex items-center gap-1">
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