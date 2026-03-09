import { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentStatusBadgeProps {
    status: string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: JSX.Element }> = {
        'paid': { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
        'partially_paid': { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
        'unpaid': { variant: 'outline', icon: <AlertCircle className="h-3 w-3 mr-1" /> }
    };

    const config = variants[status] || variants.unpaid;
    const labels: Record<string, string> = {
        'paid': 'Paid',
        'partially_paid': 'Partially Paid',
        'unpaid': 'Unpaid'
    };

    return (
        <Badge variant={config.variant} className="flex items-center">
            {config.icon}
            {labels[status] || status}
        </Badge>
    );
}