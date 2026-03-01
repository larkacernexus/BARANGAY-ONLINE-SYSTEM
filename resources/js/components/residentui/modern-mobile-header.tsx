import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, Copy } from 'lucide-react';
import { ReactNode } from 'react';

interface MobileHeaderProps {
    title: string;
    subtitle?: string;
    referenceNumber?: string;
    onCopyReference?: () => void;
    onBack: () => void;
    actions?: ReactNode;
    showSticky?: boolean;
}

export function ModernMobileHeader({ 
    title, 
    subtitle, 
    referenceNumber, 
    onCopyReference, 
    onBack, 
    actions,
    showSticky = false 
}: MobileHeaderProps) {
    return (
        <div className={cn(
            "sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl -mx-4 px-4 py-3 border-b border-gray-200 dark:border-gray-800 transition-all duration-200",
            showSticky && "shadow-md"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl flex-shrink-0" onClick={onBack}>
                        <ChevronDown className="h-4 w-4 rotate-90" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-base font-bold truncate">{title}</h1>
                        {subtitle && (
                            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
                        )}
                        {referenceNumber && (
                            <div className="flex items-center gap-1">
                                <p className="text-xs text-gray-500 truncate">#{referenceNumber}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 rounded-lg"
                                    onClick={onCopyReference}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                {actions && <div>{actions}</div>}
            </div>
        </div>
    );
}