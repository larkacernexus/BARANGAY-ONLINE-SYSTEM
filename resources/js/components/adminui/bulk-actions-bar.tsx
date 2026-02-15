import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ReactNode } from 'react';
import { PackageCheck } from 'lucide-react';
import React from 'react';

interface BulkActionsBarProps {
    selectedCount: number;
    selectionMode?: 'page' | 'filtered' | 'all';
    selectionBadgeLabel?: string;
    className?: string;
    children?: ReactNode;
}

export function BulkActionsBar({
    selectedCount,
    selectionMode = 'page',
    selectionBadgeLabel,
    className = '',
    children
}: BulkActionsBarProps) {
    const getBadgeLabel = () => {
        if (selectionBadgeLabel) return selectionBadgeLabel;
        if (selectionMode === 'page') return 'Page';
        if (selectionMode === 'filtered') return 'Filtered';
        return 'All';
    };

    return (
        <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm ${className}`}>
            {/* Header section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left section - Selection info */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-sm">
                            {selectedCount} selected
                        </span>
                        <Badge variant="outline" className="ml-1 h-5 text-xs">
                            {getBadgeLabel()}
                        </Badge>
                    </div>
                    
                    {/* Actions will be inserted here by parent component */}
                    <div className="flex items-center gap-1" data-slot="selection-controls">
                        {children && React.Children.toArray(children).find(
                            (child: any) => child?.props?.['data-slot'] === 'selection-controls'
                        )}
                    </div>
                </div>
                
                {/* Right section - Bulk actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Primary actions */}
                    <div className="flex items-center gap-2" data-slot="primary-actions">
                        {children && React.Children.toArray(children).find(
                            (child: any) => child?.props?.['data-slot'] === 'primary-actions'
                        )}
                    </div>
                    
                    {/* Secondary actions dropdown */}
                    <div data-slot="secondary-actions">
                        {children && React.Children.toArray(children).find(
                            (child: any) => child?.props?.['data-slot'] === 'secondary-actions'
                        )}
                    </div>
                    
                    {/* Exit button */}
                    <div data-slot="exit-button">
                        {children && React.Children.toArray(children).find(
                            (child: any) => child?.props?.['data-slot'] === 'exit-button'
                        )}
                    </div>
                </div>
            </div>
            
            {/* Stats section */}
            <div data-slot="stats-section">
                {children && React.Children.toArray(children).find(
                    (child: any) => child?.props?.['data-slot'] === 'stats-section'
                )}
            </div>
        </div>
    );
}