import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Printer, Share2, Plus, FileText } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    onExportCSV?: () => void;
    onPrint?: () => void;
    onCopySummary?: () => void;
    isExporting?: boolean;
    primaryAction?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    isMobile?: boolean;
}

export function PageHeader({
    title,
    subtitle,
    onExportCSV,
    onPrint,
    onCopySummary,
    isExporting = false,
    primaryAction,
    isMobile = false
}: PageHeaderProps) {
    if (isMobile) {
        return (
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">{title}</h1>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {onExportCSV && (
                            <DropdownMenuItem onClick={onExportCSV} disabled={isExporting}>
                                <FileText className="h-4 w-4 mr-2" />
                                {isExporting ? 'Exporting...' : 'Export as CSV'}
                            </DropdownMenuItem>
                        )}
                        {onPrint && (
                            <DropdownMenuItem onClick={onPrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print List
                            </DropdownMenuItem>
                        )}
                        {onCopySummary && (
                            <>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem onClick={onCopySummary}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Copy Summary
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                {onPrint && (
                    <Button onClick={onPrint} variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                )}
                {primaryAction && (
                    <>
                        <div className="h-6 w-px bg-border" />
                        {primaryAction.href ? (
                            <a href={primaryAction.href}>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span>{primaryAction.label}</span>
                                </Button>
                            </a>
                        ) : (
                            <Button onClick={primaryAction.onClick} className="gap-2">
                                <Plus className="h-4 w-4" />
                                <span>{primaryAction.label}</span>
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}