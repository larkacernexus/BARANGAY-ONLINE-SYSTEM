// /components/residentui/forms/TabHeader.tsx
import { SortDropdown } from './SortDropdown';
import { ViewToggle } from './ViewToggle';
import { SelectionModeButton } from './SelectionModeButton';

interface TabHeaderProps {
    displayTab: string;
    count: number;
    selectMode: boolean;
    selectedCount: number;
    hasFilters: boolean;
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    sortBy: string;
    sortOrder: string;
    onSortChange: (sort: string) => void;
    onSortOrderToggle: () => void;
    onToggleSelectMode: () => void;
    tabHasData: boolean;
}

export const TabHeader = ({
    displayTab,
    count,
    selectMode,
    selectedCount,
    hasFilters,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    onSortChange,
    onSortOrderToggle,
    onToggleSelectMode,
    tabHasData
}: TabHeaderProps) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {displayTab} Forms
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {count > 0 
                    ? `Showing ${count} form${count !== 1 ? 's' : ''}`
                    : `No forms found`
                }
                {selectMode && selectedCount > 0 && ` • ${selectedCount} selected`}
                {hasFilters && ' (filtered)'}
            </p>
        </div>
        
        <div className="flex items-center gap-2">
            <SortDropdown
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                onSortOrderToggle={onSortOrderToggle}
            />
            {!selectMode && tabHasData && (
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            )}
            {tabHasData && (
                <SelectionModeButton selectMode={selectMode} onToggle={onToggleSelectMode} />
            )}
        </div>
    </div>
);