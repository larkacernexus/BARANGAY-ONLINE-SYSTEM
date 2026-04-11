// components/admin/revenue/RevenueHeader.tsx

import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';

interface RevenueHeaderProps {
    autoRefresh: boolean;
    isLoading: boolean;
    onAutoRefreshToggle: () => void;
    onExport: () => void;
}

export default function RevenueHeader({
    autoRefresh,
    isLoading,
    onAutoRefreshToggle,
    onExport
}: RevenueHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Revenue Analytics</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Real-time revenue tracking and analysis
                    {autoRefresh && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Auto-refreshing
                        </span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={onAutoRefreshToggle}
                    className={autoRefresh ? 'bg-green-50 border-green-200 text-green-700' : ''}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                    {autoRefresh ? 'Auto On' : 'Auto Refresh'}
                </Button>
                
                <Button 
                    onClick={onExport}
                    disabled={isLoading}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </div>
        </div>
    );
}