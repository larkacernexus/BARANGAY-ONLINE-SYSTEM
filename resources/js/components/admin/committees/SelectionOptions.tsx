// components/admin/committees/SelectionOptions.tsx (Updated with DropdownMenu)
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Rows, Filter, Hash, RotateCcw } from 'lucide-react';

interface SelectionOptionsProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectPage: () => void;
    onSelectFiltered: () => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
    pageCount: number;
    filteredCount: number;
    totalCount: number;
}

export function SelectionOptions({
    isOpen,
    onOpenChange,
    onSelectPage,
    onSelectFiltered,
    onSelectAll,
    onClearSelection,
    pageCount,
    filteredCount,
    totalCount
}: SelectionOptionsProps) {
    return (
        <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                >
                    <Rows className="h-3.5 w-3.5 mr-1" />
                    Select
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
                <div className="p-1">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
                        SELECTION OPTIONS
                    </div>
                    <DropdownMenuItem 
                        className="cursor-pointer h-8 mb-1"
                        onClick={onSelectPage}
                    >
                        <Rows className="h-3.5 w-3.5 mr-2" />
                        Current Page ({pageCount})
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="cursor-pointer h-8 mb-1"
                        onClick={onSelectFiltered}
                    >
                        <Filter className="h-3.5 w-3.5 mr-2" />
                        All Filtered ({filteredCount})
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="cursor-pointer h-8 mb-1"
                        onClick={onSelectAll}
                    >
                        <Hash className="h-3.5 w-3.5 mr-2" />
                        All ({totalCount})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="cursor-pointer h-8 text-red-600 hover:text-red-700"
                        onClick={onClearSelection}
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                        Clear Selection
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}