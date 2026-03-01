import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StorageCardProps {
    stats: {
        used: string;
        limit: string;
        available: string;
        percentage: number;
        document_count?: number;
    };
}

export const StorageCard = ({ stats }: StorageCardProps) => {
    const safeStats = stats || {
        used: '0 MB',
        limit: '100 MB',
        available: '100 MB',
        percentage: 0,
        document_count: 0,
    };

    // Parse numeric values for calculations
    const usedValue = parseFloat(safeStats.used) || 0;
    const limitValue = parseFloat(safeStats.limit) || 100;
    const percentage = Math.min(safeStats.percentage || (usedValue / limitValue) * 100, 100);

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold dark:text-white">Storage Usage</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{safeStats.document_count || 0} documents</span>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Used Storage</div>
                            <div className="text-lg font-bold truncate dark:text-white">{safeStats.used} / {safeStats.limit}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Available</div>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400 truncate">{safeStats.available}</div>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                            className={cn(
                                "h-2.5 rounded-full transition-all duration-300",
                                percentage > 90 ? 'bg-red-600 dark:bg-red-500' :
                                percentage > 75 ? 'bg-yellow-600 dark:bg-yellow-500' :
                                'bg-blue-600 dark:bg-blue-500'
                            )}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                            {percentage.toFixed(1)}% used
                        </span>
                        {percentage > 90 && (
                            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs">Almost full</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Optional upgrade button - remove if subscription page doesn't exist */}
                    {percentage > 80 && (
                        <div className="pt-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full dark:bg-gray-800 dark:border-gray-700"
                                onClick={() => {
                                    // Handle upgrade action - could be a modal or redirect
                                    toast.info('Upgrade feature coming soon');
                                }}
                            >
                                Upgrade Storage
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};