import { Info, TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface Insight {
    type: 'positive' | 'warning' | 'info';
    icon: any;
    title: string;
    description: string;
    action: string;
}

interface RevenueInsightsProps {
    insights: Insight[];
}

export default function RevenueInsights({ insights }: RevenueInsightsProps) {
    if (insights.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <Info className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insights & Recommendations</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automated insights based on your data</p>
                </div>
            </div>
            
            <div className="grid gap-3">
                {insights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                        <div key={index} className={`p-4 rounded-lg border ${
                            insight.type === 'positive' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' :
                            insight.type === 'warning' ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10' :
                            'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
                        }`}>
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded ${
                                    insight.type === 'positive' ? 'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400' :
                                    insight.type === 'warning' ? 'bg-amber-100 dark:bg-amber-800/30 text-amber-600 dark:text-amber-400' :
                                    'bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400'
                                }`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                                    <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        💡 {insight.action}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}