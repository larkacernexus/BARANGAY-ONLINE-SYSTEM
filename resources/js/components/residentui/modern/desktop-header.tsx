import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DesktopHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

export function DesktopHeader({ title, description, actions, className }: DesktopHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between", className)}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}