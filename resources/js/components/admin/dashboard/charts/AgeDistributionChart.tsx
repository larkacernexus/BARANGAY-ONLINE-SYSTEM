interface AgeDistributionChartProps {
    ageGroups: Array<{
        group: string;
        count: number;
        percentage: number;
    }>;
}

export function AgeDistributionChart({ ageGroups }: AgeDistributionChartProps) {
    if (ageGroups.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-gray-500">
                No demographic data available
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {ageGroups.map((group, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400">{group.group}</div>
                    <div className="flex-1">
                        <div className="h-6 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                            <div 
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                                style={{ width: `${group.percentage}%` }}
                            />
                        </div>
                    </div>
                    <div className="w-20 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {group.count} ({group.percentage}%)
                    </div>
                </div>
            ))}
        </div>
    );
}