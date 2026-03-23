// forms-show/components/MobileFormHeader.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MoreVertical, Download, Printer, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModernMobileHeader } from '@/components/residentui/modern-mobile-header';
import { Form, StatusConfig } from '@/types/portal/forms/form.types';
import { getFileExtension } from '@/utils/portal/forms/form-utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileFormHeaderProps {
    form: Form;
    statusConfig: StatusConfig;
    showStickyActions: boolean;
    onCopyCode: () => void;
    onBack: () => void;
}

export function MobileFormHeader({
    form,
    statusConfig,
    showStickyActions,
    onCopyCode,
    onBack
}: MobileFormHeaderProps) {
    const StatusIcon = statusConfig.icon;

    return (
        <>
            <ModernMobileHeader
                title={form.title}
                subtitle={form.category}
                referenceNumber={form.slug}
                onCopyReference={onCopyCode}
                onBack={onBack}
                showSticky={showStickyActions}
            />

            <div className={cn(
                "sticky z-10 -mx-4 px-4 py-2 transition-all duration-200",
                showStickyActions ? "top-[73px]" : "top-[73px]"
            )}>
                <Alert className={cn(
                    "border-0 rounded-xl shadow-lg py-2",
                    statusConfig.bgColor
                )}>
                    <div className="flex items-center gap-2">
                        <StatusIcon className={cn("h-4 w-4 flex-shrink-0", statusConfig.color)} />
                        <div className="flex-1 min-w-0">
                            <AlertTitle className="font-semibold text-xs">
                                Status: {statusConfig.label}
                            </AlertTitle>
                            <AlertDescription className="text-[10px] truncate">
                                {form.is_active ? 'Available for download' : 'Currently unavailable'}
                            </AlertDescription>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                            {getFileExtension(form.file_name)}
                        </Badge>
                    </div>
                </Alert>
            </div>
        </>
    );
}