// resources/js/Pages/Admin/Households/Show/components/privileges/PrivilegeCategories.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PrivilegeCategoriesProps {
    counts: Record<string, number>;
}

// Pre-defined category colors and icons
const categoryConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    senior: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <TrendingUp className="h-3 w-3" /> },
    pwd: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Award className="h-3 w-3" /> },
    solo_parent: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <TrendingUp className="h-3 w-3" /> },
    indigent: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: <TrendingDown className="h-3 w-3" /> },
    student: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Minus className="h-3 w-3" /> },
    health: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <Award className="h-3 w-3" /> },
};

const getCategoryLabel = (code: string): string => {
    const labels: Record<string, string> = {
        senior: 'Senior Citizen',
        pwd: 'Person with Disability',
        solo_parent: 'Solo Parent',
        indigent: 'Indigent Family',
        student: 'Student',
        health: 'Health Card',
    };
    return labels[code] || code.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const PrivilegeCategories = ({ counts }: PrivilegeCategoriesProps) => {
    const categories = Object.entries(counts)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

    if (categories.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Privilege Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No privilege categories found.
                    </div>
                </CardContent>
            </Card>
        );
    }

    const total = categories.reduce((sum, [_, count]) => sum + count, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Privilege Categories</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {categories.map(([code, count]) => {
                        const config = categoryConfig[code] || {
                            color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                            icon: <Award className="h-3 w-3" />
                        };
                        const percentage = ((count / total) * 100).toFixed(1);
                        
                        return (
                            <div key={code} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                    <Badge className={`${config.color} flex items-center gap-1 px-2 py-1`}>
                                        {config.icon}
                                        {getCategoryLabel(code)}
                                    </Badge>
                                    <div className="flex-1 max-w-[200px]">
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium dark:text-gray-200">{count}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">({percentage}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};