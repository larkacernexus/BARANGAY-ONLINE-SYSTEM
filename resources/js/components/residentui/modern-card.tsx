import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ModernCardProps {
    title?: string;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    action?: ReactNode;
}

export function ModernCard({
    title,
    description,
    icon: Icon,
    iconColor = 'from-blue-500 to-blue-600',
    children,
    className,
    contentClassName,
    action
}: ModernCardProps) {
    return (
        <Card className={cn(
            "border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50",
            className
        )}>
            {(title || Icon || action) && (
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                        {Icon && (
                            <div className={cn(
                                "h-8 w-8 rounded-xl bg-gradient-to-br flex items-center justify-center",
                                `bg-gradient-to-br ${iconColor}`
                            )}>
                                <Icon className="h-4 w-4 text-white" />
                            </div>
                        )}
                        <div>
                            {title && <CardTitle className="text-base lg:text-lg">{title}</CardTitle>}
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                    </div>
                    {action && <div>{action}</div>}
                </CardHeader>
            )}
            <CardContent className={cn("space-y-4", contentClassName)}>
                {children}
            </CardContent>
        </Card>
    );
}