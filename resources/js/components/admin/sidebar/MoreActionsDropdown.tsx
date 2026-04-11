import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, ChevronDown } from 'lucide-react';
import { SidebarItem, SidebarTab } from './types';
import { CompactMenuItem } from './CompactMenuItem';

interface MoreActionsDropdownProps {
    itemsByCategory: Array<[string, SidebarItem[]]>;
    totalCount: number;
    type: SidebarTab;
}

export function MoreActionsDropdown({ itemsByCategory, totalCount, type }: MoreActionsDropdownProps) {
    if (itemsByCategory.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-1 w-full justify-start gap-2 px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                    <PlusCircle className="h-3.5 w-3.5" />
                    More Actions ({totalCount})
                    <ChevronDown className="ml-auto h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-[400px] overflow-y-auto">
                {itemsByCategory.map(([category, items], index, array) => 
                    items.length > 0 && (
                        <div key={category}>
                            <DropdownMenuLabel className="text-xs capitalize text-gray-500">
                                {category}
                            </DropdownMenuLabel>
                            {items.map(action => (
                                <CompactMenuItem 
                                    key={`${action.title}-${action.href}`} 
                                    item={action} 
                                    type={type} 
                                />
                            ))}
                            {index < array.length - 1 && <DropdownMenuSeparator />}
                        </div>
                    )
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}