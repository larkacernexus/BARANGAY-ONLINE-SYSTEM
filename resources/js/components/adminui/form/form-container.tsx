// components/ui/form/form-container.tsx
import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormContainerProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    actions?: ReactNode; // Add actions prop
}

export function FormContainer({
    title,
    description,
    children,
    className,
    headerClassName,
    contentClassName,
    actions // Add actions parameter
}: FormContainerProps) {
    return (
        <Card className={cn("dark:bg-gray-900", className)}>
            <CardHeader className={headerClassName}>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="dark:text-gray-100">{title}</CardTitle>
                        {description && (
                            <CardDescription className="dark:text-gray-400">{description}</CardDescription>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className={contentClassName}>
                {children}
            </CardContent>
        </Card>
    );
}