import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Database, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorageStats {
    used: string;
    limit: string;
    available: string;
    percentage: number;
    document_count?: number;
}

interface StorageCardProps {
    stats?: StorageStats;
    className?: string;
}

export function StorageCard({ stats, className }: StorageCardProps) {
    if (!stats) return null;
    
    const percentage = stats.percentage || 0;
    const isNearLimit = percentage >= 90;
    const isOverLimit = percentage >= 100;
    
    return (
        <Card className={cn("border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50", className)}>
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Usage</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {stats.used} / {stats.limit}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {stats.available} available
                        </p>
                    </div>
                    <div className={cn(
                        "p-2 rounded-lg",
                        isOverLimit ? "bg-red-100 dark:bg-red-900/20" : 
                        isNearLimit ? "bg-yellow-100 dark:bg-yellow-900/20" : 
                        "bg-blue-100 dark:bg-blue-900/20"
                    )}>
                        <HardDrive className={cn(
                            "h-5 w-5",
                            isOverLimit ? "text-red-600 dark:text-red-400" :
                            isNearLimit ? "text-yellow-600 dark:text-yellow-400" :
                            "text-blue-600 dark:text-blue-400"
                        )} />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Progress 
                        value={Math.min(percentage, 100)} 
                        className={cn(
                            "h-2",
                            isOverLimit && "bg-red-200 dark:bg-red-900/50"
                        )}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{Math.min(percentage, 100).toFixed(1)}% used</span>
                        {stats.document_count !== undefined && (
                            <span>{stats.document_count} document{stats.document_count !== 1 ? 's' : ''}</span>
                        )}
                    </div>
                </div>
                
                {isNearLimit && !isOverLimit && (
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-xs text-yellow-700 dark:text-yellow-400">
                            You're approaching your storage limit. Consider deleting old documents or upgrading your plan.
                        </p>
                    </div>
                )}
                
                {isOverLimit && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-xs text-red-700 dark:text-red-400">
                            Storage limit exceeded. Please delete some documents or contact your administrator.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}