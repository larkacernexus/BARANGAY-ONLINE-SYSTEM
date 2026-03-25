// /components/residentui/forms/SortDropdown.tsx
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, FileText, Calendar, Download, Tag, Building, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SORT_OPTIONS } from '@/components/residentui/forms/constants';

interface SortDropdownProps {
    sortBy: string;
    sortOrder: string;
    onSortChange: (sort: string) => void;
    onSortOrderToggle: () => void;
}

export const SortDropdown = ({ sortBy, sortOrder, onSortChange, onSortOrderToggle }: SortDropdownProps) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <ArrowUpDown className="h-4 w-4" />
                Sort
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            {SORT_OPTIONS.map(option => (
                <DropdownMenuItem 
                    key={option.value}
                    onClick={() => onSortChange(option.value)}
                    className={cn(
                        "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                        sortBy === option.value && "bg-gray-100 dark:bg-gray-800"
                    )}
                >
                    {option.value === 'title' && <FileText className="h-4 w-4 mr-2" />}
                    {option.value === 'created_at' && <Calendar className="h-4 w-4 mr-2" />}
                    {option.value === 'download_count' && <Download className="h-4 w-4 mr-2" />}
                    {option.value === 'category' && <Tag className="h-4 w-4 mr-2" />}
                    {option.value === 'issuing_agency' && <Building className="h-4 w-4 mr-2" />}
                    {option.label}
                </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem onClick={onSortOrderToggle} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                {sortOrder === 'asc' ? (
                    <ChevronUp className="h-4 w-4 mr-2" />
                ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                )}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);