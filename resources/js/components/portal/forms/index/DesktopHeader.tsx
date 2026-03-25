// /components/residentui/forms/DesktopHeader.tsx
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';

interface DesktopHeaderProps {
    onPrint: () => void;
    onExport: () => void;
    isExporting: boolean;
}

export const DesktopHeader = ({ onPrint, onExport, isExporting }: DesktopHeaderProps) => (
    <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Forms Catalog
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Browse and download official forms from various agencies
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onPrint}
                className="gap-2 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <Printer className="h-4 w-4" />
                Print
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={isExporting}
                className="gap-2 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
            </Button>
        </div>
    </div>
);