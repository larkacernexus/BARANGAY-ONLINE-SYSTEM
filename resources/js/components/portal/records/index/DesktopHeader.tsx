import React from 'react';

interface DesktopHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export const DesktopHeader = ({ title, description, actions }: DesktopHeaderProps) => (
    <div className="flex items-center justify-between">
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
        {actions && (
            <div className="flex items-center gap-2">
                {actions}
            </div>
        )}
    </div>
);