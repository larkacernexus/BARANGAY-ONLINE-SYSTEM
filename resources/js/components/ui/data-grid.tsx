import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Calendar, Eye, CreditCard } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface DataGridProps<T> {
    data: T[];
    columns: number;
    renderItem: (item: T) => React.ReactNode;
    emptyMessage?: string;
    className?: string;
}

export function DataGrid<T>({
    data,
    columns,
    renderItem,
    emptyMessage = 'No data found',
    className = ''
}: DataGridProps<T>) {
    if (data.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        📊
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Data</h3>
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }

    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4'
    }[columns];

    return (
        <div className={`grid ${gridCols} gap-4 ${className}`}>
            {data.map(renderItem)}
        </div>
    );
}