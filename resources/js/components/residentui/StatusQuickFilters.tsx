import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Loader2, FileCheck } from 'lucide-react';

interface StatusQuickFiltersProps {
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    getStatusCount: (status: string) => number;
    clearancesData: any[];
}

export function StatusQuickFilters({ 
    statusFilter, 
    setStatusFilter, 
    getStatusCount,
    clearancesData 
}: StatusQuickFiltersProps) {
    return (
        <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
                <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    className="whitespace-nowrap"
                >
                    All ({clearancesData.length})
                </Button>
                <Button
                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                    className="whitespace-nowrap"
                >
                    <Clock className="h-3 w-3 mr-1" />
                    Pending ({getStatusCount('pending')})
                </Button>
                <Button
                    variant={statusFilter === 'pending_payment' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('pending_payment')}
                    className="whitespace-nowrap"
                >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Payment ({getStatusCount('pending_payment')})
                </Button>
                <Button
                    variant={statusFilter === 'processing' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('processing')}
                    className="whitespace-nowrap"
                >
                    <Loader2 className="h-3 w-3 mr-1" />
                    Processing ({getStatusCount('processing')})
                </Button>
                <Button
                    variant={statusFilter === 'issued' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('issued')}
                    className="whitespace-nowrap"
                >
                    <FileCheck className="h-3 w-3 mr-1" />
                    Issued ({getStatusCount('issued')})
                </Button>
            </div>
        </div>
    );
}