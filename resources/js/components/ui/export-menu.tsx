// components/ui/export-menu.tsx
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Download,
    Printer,
    FileText,
    Share2,
    Copy,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportMenuProps {
    onExportCSV?: () => Promise<void> | void;
    onPrint?: () => void;
    onShare?: () => void;
    onCopySummary?: () => string;
    isExporting?: boolean;
    variant?: 'button' | 'icon';
    label?: string;
}

export function ExportMenu({
    onExportCSV,
    onPrint,
    onShare,
    onCopySummary,
    isExporting = false,
    variant = 'button',
    label = 'Export'
}: ExportMenuProps) {
    const hasAnyAction = onExportCSV || onPrint || onShare || onCopySummary;

    if (!hasAnyAction) return null;

    const handleCopySummary = () => {
        if (onCopySummary) {
            const summary = onCopySummary();
            navigator.clipboard.writeText(summary);
            toast.success('Summary copied to clipboard');
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {variant === 'icon' ? (
                    <Button variant="ghost" size="icon" disabled={isExporting}>
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled={isExporting}>
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        {label}
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {onExportCSV && (
                    <DropdownMenuItem onClick={onExportCSV} disabled={isExporting}>
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <FileText className="h-4 w-4 mr-2" />
                        )}
                        Export as CSV
                    </DropdownMenuItem>
                )}
                {onPrint && (
                    <DropdownMenuItem onClick={onPrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </DropdownMenuItem>
                )}
                {(onExportCSV || onPrint) && onCopySummary && (
                    <DropdownMenuSeparator />
                )}
                {onCopySummary && (
                    <DropdownMenuItem onClick={handleCopySummary}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Summary
                    </DropdownMenuItem>
                )}
                {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}