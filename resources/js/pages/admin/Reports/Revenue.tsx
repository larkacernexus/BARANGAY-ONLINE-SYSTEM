import AppLayout from '@/layouts/admin-app-layout';
import { Head } from '@inertiajs/react';
import { TrendingUp, DollarSign, BarChart3, Download } from 'lucide-react';

export default function RevenueAnalytics() {
    return (
        <AppLayout>
            <Head title="Revenue Analytics" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Revenue Analytics</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Revenue trends and insights</p>
                    </div>
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg">
                        <Download className="h-4 w-4" />
                        Export Report
                    </button>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
                        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">Revenue chart will appear here</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                                    <p className="text-2xl font-bold">₱185,500</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Growth</p>
                                    <p className="text-2xl font-bold">+15.2%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}