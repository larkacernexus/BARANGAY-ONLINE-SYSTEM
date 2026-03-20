// resources/js/Pages/Admin/Households/Show/components/badges/StatusBadge.tsx

import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { getStatusVariant } from '../../utils/helpers';

interface StatusBadgeProps {
    status: 'active' | 'inactive';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    return (
        <Badge variant={getStatusVariant(status)} className="flex items-center gap-1 dark:bg-gray-700 dark:text-gray-300">
            {status === 'active' ? (
                <CheckCircle className="h-3 w-3" />
            ) : (
                <XCircle className="h-3 w-3" />
            )}
            {status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
    );
};