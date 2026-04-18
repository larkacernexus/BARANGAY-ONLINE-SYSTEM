// components/ui/form/form-header.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormHeaderProps {
    title: string;
    description: string;
    onBack: () => void;
    showPreview?: boolean;
    onTogglePreview?: () => void;
    backLabel?: string;
    className?: string;
    actions?: React.ReactNode; // Add actions prop
}

export function FormHeader({
    title,
    description,
    onBack,
    showPreview,
    onTogglePreview,
    backLabel = "Back",
    className,
    actions // Add actions parameter
}: FormHeaderProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", className)}>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                    type="button"
                    className="dark:border-gray-600 dark:text-gray-300"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {backLabel}
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                        {title}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {actions}
                {onTogglePreview && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onTogglePreview}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        {showPreview ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide Preview
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show Preview
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}