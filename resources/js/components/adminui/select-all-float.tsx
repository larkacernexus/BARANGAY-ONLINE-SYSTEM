import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckSquare, Square } from 'lucide-react';

interface SelectAllFloatProps {
    isSelectAll: boolean;
    onSelectAll: () => void;
    selectedCount: number;
    totalCount: number;
    position?: 'top-right' | 'bottom-right';
    className?: string;
}

export function SelectAllFloat({
    isSelectAll,
    onSelectAll,
    selectedCount,
    totalCount,
    position = 'top-right',
    className = ''
}: SelectAllFloatProps) {
    const getPositionClasses = () => {
        switch (position) {
            case 'top-right':
                return 'top-4 right-4';
            case 'bottom-right':
                return 'bottom-4 right-4';
            default:
                return 'top-4 right-4';
        }
    };

    return (
        <div className={`fixed ${getPositionClasses()} z-40 ${className}`}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={onSelectAll}
                            className="h-10 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl rounded-full flex items-center gap-2 transition-all duration-200"
                        >
                            {isSelectAll ? (
                                <CheckSquare className="h-4 w-4 text-green-600" />
                            ) : (
                                <Square className="h-4 w-4" />
                            )}
                            <span className="font-medium text-sm">
                                {selectedCount}/{totalCount}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>{isSelectAll ? 'Deselect all on page' : 'Select all on page'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}