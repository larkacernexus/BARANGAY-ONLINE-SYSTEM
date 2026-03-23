import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
    onPrint: () => void;
    onExport: () => void;
    isExporting?: boolean;
    className?: string;
}

export function ActionButtons({ onPrint, onExport, isExporting, className }: ActionButtonsProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Button
                variant="outline"
                size="sm"
                onClick={onPrint}
                className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <Printer className="h-4 w-4" />
                Print
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={isExporting}
                className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
            </Button>
        </div>
    );
}