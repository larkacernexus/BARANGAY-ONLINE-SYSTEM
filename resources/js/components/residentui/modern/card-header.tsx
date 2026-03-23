import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModernCardHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function ModernCardHeader({ title, description, action, className }: ModernCardHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4", className)}>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {description}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}