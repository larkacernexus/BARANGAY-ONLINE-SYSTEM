// /components/residentui/records/StorageCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Database, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorageStats } from '@/types/portal/records/records';

interface StorageCardProps {
    stats?: StorageStats;
}

export const StorageCard: React.FC<StorageCardProps> = ({ stats }) => {
    if (!stats) return null;
    
    const percentage = stats.percentage || 0;
    const isNearLimit = percentage >= 80;
    const isOverLimit = percentage >= 100;
    
    return (
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Storage Usage
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stats.used} of {stats.limit} used
                        </p>
                    </div>
                    <div className={cn(
                        "p-2 rounded-lg",
                        isOverLimit ? 'bg-red-100 dark:bg-red-950/30' : 'bg-blue-100 dark:bg-blue-950/30'
                    )}>
                        {isOverLimit ? (
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        ) : (
                            <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                    </div>
                </div>
                
                <Progress 
                    value={Math.min(percentage, 100)} 
                    className={cn(
                        "h-2 mb-3",
                        isOverLimit && "bg-red-200 dark:bg-red-800",
                        isNearLimit && !isOverLimit && "bg-yellow-200 dark:bg-yellow-800"
                    )}
                />
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        Used: {stats.used}
                    </span>
                    <span className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        Available: {stats.available}
                    </span>
                </div>
                
                {isNearLimit && (
                    <p className="mt-3 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {isOverLimit 
                            ? 'Storage limit exceeded. Please delete some files to free up space.'
                            : 'Approaching storage limit. Consider cleaning up old files.'
                        }
                    </p>
                )}
            </CardContent>
        </Card>
    );
};