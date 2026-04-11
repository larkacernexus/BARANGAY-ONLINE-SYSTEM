// /components/portal/forms/index/TabHeader.tsx
import { SortDropdown } from './SortDropdown';
import { ViewToggle } from './ViewToggle';
import { SelectionModeButton } from './SelectionModeButton';

interface TabHeaderProps {
    displayStatus: string;  // ✅ Changed from displayTab
    from: number;           // ✅ Added
    to: number;             // ✅ Added
    total: number;          // ✅ Added
    selectMode: boolean;
    selectedCount: number;
    hasFilters: boolean;
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';  // ✅ Better typing
    onSortChange: (sort: string) => void;
    onSortOrderToggle: () => void;
    onToggleSelectMode: () => void;
    tabHasData: boolean;
}

export const TabHeader = ({
    displayStatus,
    from,
    to,
    total,
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
                {displayStatus} Forms
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {tabHasData 
                    ? `Showing ${from}-${to} of ${total} form${total !== 1 ? 's' : ''}`
                    : `No ${displayStatus.toLowerCase()} forms found`
                }
                {selectMode && selectedCount > 0 && ` • ${selectedCount} selected`}
                {hasFilters && ' (filtered)'}
                {selectMode && ' • Selection Mode'}
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