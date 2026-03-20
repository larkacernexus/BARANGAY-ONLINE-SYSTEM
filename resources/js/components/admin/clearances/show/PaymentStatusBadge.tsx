// components/admin/clearances/show/PaymentStatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    DollarSign,
    RefreshCw
} from 'lucide-react';

interface PaymentStatusBadgeProps {
    status: string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'paid':
                return {
                    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
                    icon: CheckCircle,
                    label: 'Paid'
                };
            case 'pending':
                return {
                    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
                    icon: Clock,
                    label: 'Pending'
                };
            case 'partially_paid':
                return {
                    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
                    icon: AlertCircle,
                    label: 'Partially Paid'
                };
            case 'failed':
                return {
                    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                    icon: XCircle,
                    label: 'Failed'
                };
            case 'refunded':
                return {
                    className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
                    icon: RefreshCw,
                    label: 'Refunded'
                };
            default:
                return {
                    className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
                    icon: DollarSign,
                    label: 'Unpaid'
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}