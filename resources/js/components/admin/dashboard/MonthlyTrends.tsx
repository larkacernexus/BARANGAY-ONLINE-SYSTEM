// components/admin/dashboard/MonthlyTrends.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, CreditCard, FileText, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface MonthlyTrendsProps {
    data: {
        residents: number[];
        payments: number[];
        clearances: number[];
    };
}

export function MonthlyTrends({ data }: MonthlyTrendsProps) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Calculate max values for scaling
    const maxResidents = Math.max(...data.residents, 1);
    const maxPayments = Math.max(...data.payments, 1);
    const maxClearances = Math.max(...data.clearances, 1);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const renderBarChart = (values: number[], max: number, color: string) => {
        // Only show last 6 months
        const recentValues = values.slice(-6);
        const recentMonths = months.slice(-6);
        
        return (
            <div className="space-y-2">
                {recentValues.map((value, index) => {
                    const percentage = (value / max) * 100;
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <span className="w-8 text-xs text-gray-500 dark:text-gray-400">
                                {recentMonths[index]}
                            </span>
                            <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${color} rounded-full`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-16 text-xs font-medium text-right dark:text-gray-300">
                                {value.toLocaleString()}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Monthly Trends
                    </CardTitle>
                    <Link href="/admin/reports">
                        <Button variant="ghost" size="sm" className="text-xs gap-1">
                            Detailed Reports
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="residents" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4 dark:bg-gray-700">
                        <TabsTrigger value="residents" className="text-xs dark:data-[state=active]:bg-gray-600">
                            <Users className="h-3 w-3 mr-1" />
                            Residents
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="text-xs dark:data-[state=active]:bg-gray-600">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Payments
                        </TabsTrigger>
                        <TabsTrigger value="clearances" className="text-xs dark:data-[state=active]:bg-gray-600">
                            <FileText className="h-3 w-3 mr-1" />
                            Clearances
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="residents" className="mt-0">
                        {renderBarChart(data.residents, maxResidents, 'bg-blue-500')}
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-right">
                            Total: {data.residents.reduce((a, b) => a + b, 0).toLocaleString()}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="payments" className="mt-0">
                        {renderBarChart(data.payments, maxPayments, 'bg-green-500')}
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-right">
                            Total: {formatCurrency(data.payments.reduce((a, b) => a + b, 0))}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="clearances" className="mt-0">
                        {renderBarChart(data.clearances, maxClearances, 'bg-purple-500')}
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-right">
                            Total: {data.clearances.reduce((a, b) => a + b, 0).toLocaleString()}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}