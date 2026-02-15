import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { List, Grid3X3 } from 'lucide-react';

interface ViewToggleProps {
    viewMode: 'table' | 'grid';
    onViewModeChange: (mode: 'table' | 'grid') => void;
    isMobile: boolean;
}

export function ViewToggle({ viewMode, onViewModeChange, isMobile }: ViewToggleProps) {
    if (isMobile) return null;
    
    return (
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${viewMode === 'table' ? 'bg-gray-100' : ''}`}
                        onClick={() => onViewModeChange('table')}
                    >
                        <List className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Table view</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                        onClick={() => onViewModeChange('grid')}
                    >
                        <Grid3X3 className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
        </div>
    );
}