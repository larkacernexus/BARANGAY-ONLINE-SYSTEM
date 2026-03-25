// /components/residentui/forms/FilterModalContent.tsx
import { ModernSelect } from '@/components/residentui/modern-select';
import { Button } from '@/components/ui/button';
import { Tag, Building, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { SORT_OPTIONS } from '@/components/residentui/forms/constants';

interface FilterModalContentProps {
    categoryFilter: string;
    onCategoryChange: (value: string) => void;
    agencyFilter: string;
    onAgencyChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    sortOrder: string;
    onSortOrderChange: (order: 'asc' | 'desc') => void;
    loading: boolean;
    categories: string[];
    agencies: string[];
}

export const FilterModalContent = ({
    categoryFilter,
    onCategoryChange,
    agencyFilter,
    onAgencyChange,
    sortBy,
    onSortChange,
    sortOrder,
    onSortOrderChange,
    loading,
    categories,
    agencies
}: FilterModalContentProps) => (
    <>
        {/* Category Filter */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
            </label>
            <ModernSelect
                value={categoryFilter}
                onValueChange={onCategoryChange}
                placeholder="All categories"
                options={categories.map(category => ({
                    value: category,
                    label: category
                }))}
                disabled={loading}
                icon={Tag}
            />
        </div>

        {/* Agency Filter */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Issuing Agency
            </label>
            <ModernSelect
                value={agencyFilter}
                onValueChange={onAgencyChange}
                placeholder="All agencies"
                options={agencies.map(agency => ({
                    value: agency,
                    label: agency
                }))}
                disabled={loading}
                icon={Building}
            />
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort By
            </label>
            <ModernSelect
                value={sortBy}
                onValueChange={onSortChange}
                placeholder="Sort by"
                options={SORT_OPTIONS}
                disabled={loading}
                icon={ArrowUpDown}
            />
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort Order
            </label>
            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant={sortOrder === 'asc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSortOrderChange('asc')}
                    className="rounded-lg"
                >
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Ascending
                </Button>
                <Button
                    variant={sortOrder === 'desc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSortOrderChange('desc')}
                    className="rounded-lg"
                >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Descending
                </Button>
            </div>
        </div>
    </>
);