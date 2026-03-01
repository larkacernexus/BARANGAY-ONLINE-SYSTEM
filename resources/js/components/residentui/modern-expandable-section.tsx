import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode } from 'react';

interface ExpandableSectionProps {
    title: string;
    icon: ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    children: ReactNode;
    className?: string;
}

export function ModernExpandableSection({ 
    title, 
    icon, 
    isExpanded, 
    onToggle, 
    children,
    className 
}: ExpandableSectionProps) {
    return (
        <Card className={cn(
            "border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 mb-3 overflow-hidden",
            className
        )}>
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="font-semibold text-sm">{title}</h3>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
            </button>
            
            {isExpanded && (
                <CardContent className="p-4">
                    {children}
                </CardContent>
            )}
        </Card>
    );
}