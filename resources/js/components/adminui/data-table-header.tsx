import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface ActionButton {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    className?: string;
    disabled?: boolean;
}

interface DataTableHeaderProps {
    title: string;
    description?: string;
    primaryAction?: ActionButton;
    secondaryActions?: ActionButton[];
    isLoading?: boolean;
    children?: ReactNode;
    className?: string;
}

export function DataTableHeader({
    title,
    description,
    primaryAction,
    secondaryActions = [],
    isLoading = false,
    children,
    className = ''
}: DataTableHeaderProps) {
    return (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {title}
                </h1>
                {description && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1">
                        {description}
                    </p>
                )}
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {secondaryActions.map((action, index) => {
                    const button = (
                        <Button
                            key={index}
                            variant={action.variant || 'outline'}
                            size="sm"
                            onClick={action.onClick}
                            className={`h-9 ${action.className || ''}`}
                            disabled={isLoading || action.disabled}
                        >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            <span className="hidden sm:inline">{action.label}</span>
                            <span className="sm:hidden">
                                {action.label.split(' ').map(word => word[0]).join('')}
                            </span>
                        </Button>
                    );

                    return action.href ? (
                        <Link key={index} href={action.href}>
                            {button}
                        </Link>
                    ) : button;
                })}
                
                {primaryAction && (
                    primaryAction.href ? (
                        <Link href={primaryAction.href}>
                            <Button
                                size="sm"
                                className="h-9"
                                disabled={isLoading || primaryAction.disabled}
                            >
                                {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
                                <span className="hidden sm:inline">{primaryAction.label}</span>
                                <span className="sm:hidden">
                                    {primaryAction.label.split(' ').map(word => word[0]).join('')}
                                </span>
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            size="sm"
                            onClick={primaryAction.onClick}
                            className="h-9"
                            disabled={isLoading || primaryAction.disabled}
                        >
                            {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
                            <span className="hidden sm:inline">{primaryAction.label}</span>
                            <span className="sm:hidden">
                                {primaryAction.label.split(' ').map(word => word[0]).join('')}
                            </span>
                        </Button>
                    )
                )}
                
                {children}
            </div>
        </div>
    );
}