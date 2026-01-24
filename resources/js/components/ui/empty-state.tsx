// components/ui/empty-state.tsx
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: ReactNode;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
    className = ''
}: EmptyStateProps) {
    return (
        <Card className={className}>
            <CardContent className="py-12 text-center">
                {Icon && (
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground mb-6">{description}</p>
                <div className="flex gap-2 justify-center">
                    {action && (
                        <Button onClick={action.onClick}>
                            {action.icon}
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button variant="outline" onClick={secondaryAction.onClick}>
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}