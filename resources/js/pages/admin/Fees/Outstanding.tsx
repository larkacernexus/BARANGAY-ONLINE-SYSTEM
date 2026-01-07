import AppLayout from '@/layouts/admin-app-layout';
import { Head } from '@inertiajs/react';
import { AlertCircle, DollarSign, Clock, Download } from 'lucide-react';

export default function OutstandingFees() {
    return (
        <AppLayout>
            <Head title="Outstanding Fees" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Outstanding Fees</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Unpaid and overdue fees</p>
                    </div>
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg">
                        <Download className="h-4 w-4" />
                        Export List
                    </button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Outstanding</p>
                                <p className="text-2xl font-bold">₱45,890</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue Fees</p>
                                <p className="text-2xl font-bold">12</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Age</p>
                                <p className="text-2xl font-bold">15 days</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-center py-12">
                        <AlertCircle className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Outstanding Fees List
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            This page will show all unpaid and overdue fees
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}