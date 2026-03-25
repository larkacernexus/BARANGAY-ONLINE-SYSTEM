// /components/residentui/reports/SortDropdown.tsx
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, Calendar, Info, Flag } from 'lucide-react';

export const SortDropdown = () => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <ArrowUpDown className="h-4 w-4" />
                Sort
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4 mr-2" />
                Date
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                <Info className="h-4 w-4 mr-2" />
                Status
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                <Flag className="h-4 w-4 mr-2" />
                Urgency
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);