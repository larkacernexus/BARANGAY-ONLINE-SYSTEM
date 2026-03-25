// /components/residentui/clearances/DesktopHeader.tsx
import { Button } from '@/components/ui/button';
import { Printer, Download, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface DesktopHeaderProps {
    householdNumber?: string;
    headOfFamily?: string;
    onPrint: () => void;
    onExport: () => void;
    isExporting: boolean;
}

export const DesktopHeader = ({
    householdNumber,
    headOfFamily,
    onPrint,
    onExport,
    isExporting
}: DesktopHeaderProps) => (
    <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                My Clearances
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage and track your clearance requests
                {householdNumber && (
                    <span className="block text-xs mt-1">
                        Household: {householdNumber} • {headOfFamily}
                    </span>
                )}
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
            <Link href="/portal/my-clearances/request">
                <Button className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl">
                    <Plus className="h-4 w-4" />
                    <span>New Request</span>
                </Button>
            </Link>
        </div>
    </div>
);