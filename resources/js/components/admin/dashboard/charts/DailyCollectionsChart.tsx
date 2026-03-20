// components/admin/dashboard/DailyCollectionsChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface DailyCollection {
    date: string;
    day: string;
    count: number;
    amount: string;
}

interface DailyCollectionsChartProps {
    data?: DailyCollection[]; // Make data optional with ?
}

export function DailyCollectionsChart({ data = [] }: DailyCollectionsChartProps) {
    // Provide default empty array if data is undefined
    const collections = data || [];
    
    if (collections.length === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Daily Collections
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <BarChart className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No collection data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Find max amount for scaling
    const maxAmount = Math.max(...collections.map(d => parseFloat(d.amount)), 0.01);

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Daily Collections
                    </CardTitle>
                    <Link href="/admin/payments">
                        <Button variant="ghost" size="sm" className="text-xs gap-1">
                            View All
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {collections.slice(-7).map((item, index) => {
                        const amount = parseFloat(item.amount);
                        const percentage = (amount / maxAmount) * 100;
                        
                        return (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{item.day}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.count} transactions
                                        </span>
                                        <span className="font-medium dark:text-gray-200">
                                            ₱{item.amount}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-4 pt-3 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Total
                        </span>
                        <span className="font-bold dark:text-gray-100">
                            ₱{collections.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}