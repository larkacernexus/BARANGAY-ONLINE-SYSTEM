import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, Calendar, DollarSign, Info } from 'lucide-react';

interface SortOption {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface SortDropdownProps {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    options?: SortOption[];
}

const DEFAULT_OPTIONS: SortOption[] = [
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'amount', label: 'Amount', icon: DollarSign },
    { value: 'status', label: 'Status', icon: Info },
];

export function SortDropdown({ 
    sortBy, 
    sortOrder, 
    onSort, 
    options = DEFAULT_OPTIONS 
}: SortDropdownProps) {
    const handleSort = (value: string) => {
        const newOrder = sortBy === value && sortOrder === 'asc' ? 'desc' : 'asc';
        onSort(value, newOrder);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                {options.map((option) => {
                    const Icon = option.icon;
                    return (
                        <DropdownMenuItem 
                            key={option.value}
                            onClick={() => handleSort(option.value)} 
                            className="text-gray-700 dark:text-gray-300"
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            {option.label} {sortBy === option.value && (sortOrder === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}