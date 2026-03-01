// components/admin/payments/PaymentsHeader.tsx
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { Plus, Download, Layers, MousePointer } from 'lucide-react';
import { route } from 'ziggy-js';

interface PaymentsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    handleExport: () => void;
    isLoading: boolean;
}

export default function PaymentsHeader({
    isBulkMode,
    setIsBulkMode,
    handleExport,
    isLoading
}: PaymentsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payment Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Manage and track all payment transactions
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBulkMode(!isBulkMode)}
                            className={`h-9 ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                        >
                            {isBulkMode ? (
                                <>
                                    <Layers className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Bulk Mode</span>
                                    <span className="sm:hidden">Bulk</span>
                                </>
                            ) : (
                                <>
                                    <MousePointer className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Bulk Select</span>
                                    <span className="sm:hidden">Select</span>
                                </>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
                        <p className="text-xs text-gray-500">Select multiple payments for batch operations</p>
                    </TooltipContent>
                </Tooltip>
                <Button variant="outline" onClick={handleExport} disabled={isLoading} className="h-9">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Export</span>
                </Button>
             <Link href={route('admin.payments.create')}>
                <Button className="h-9">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Record Payment</span>
                    <span className="sm:hidden">Record</span>
                </Button>
            </Link>
            </div>
        </div>
    );
}