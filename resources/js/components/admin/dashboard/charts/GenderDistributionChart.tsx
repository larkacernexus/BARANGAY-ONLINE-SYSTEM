interface GenderDistributionChartProps {
    gender: {
        male: number;
        female: number;
        other: number;
    };
}

export function GenderDistributionChart({ gender }: GenderDistributionChartProps) {
    const total = gender.male + gender.female + gender.other;
    
    if (total === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-gray-500">
                No gender data available
            </div>
        );
    }
    
    return (
        <div className="flex justify-center gap-8">
            <div className="text-center">
                <div className="mb-2 h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                    {((gender.male / total) * 100).toFixed(0)}%
                </div>
                <div className="font-medium text-gray-900 dark:text-white">Male</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{gender.male}</div>
            </div>
            <div className="text-center">
                <div className="mb-2 h-20 w-20 rounded-full bg-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                    {((gender.female / total) * 100).toFixed(0)}%
                </div>
                <div className="font-medium text-gray-900 dark:text-white">Female</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{gender.female}</div>
            </div>
            {gender.other > 0 && (
                <div className="text-center">
                    <div className="mb-2 h-20 w-20 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {((gender.other / total) * 100).toFixed(0)}%
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">Other</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{gender.other}</div>
                </div>
            )}
        </div>
    );
}