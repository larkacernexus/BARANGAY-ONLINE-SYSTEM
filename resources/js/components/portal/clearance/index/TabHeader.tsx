// /components/residentui/clearances/TabHeader.tsx
import { SortDropdown } from './SortDropdown';
import { ViewToggle } from './ViewToggle';
import { SelectionModeButton } from './SelectionModeButton';

interface TabHeaderProps {
    displayStatus: string;
    count: number;
    selectMode: boolean;
    selectedCount: number;
    hasFilters: boolean;
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    onToggleSelectMode: () => void;
    tabHasData: boolean;
}

export const TabHeader = ({
    displayStatus,
    count,
    selectMode,
    selectedCount,
    hasFilters,
    viewMode,
    setViewMode,
    onToggleSelectMode,
    tabHasData
}: TabHeaderProps) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {displayStatus} Clearance Requests
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {count > 0 
                    ? `Showing ${count} request${count !== 1 ? 's' : ''}`
                    : `No ${displayStatus.toLowerCase()} found`
                }
                {selectMode && selectedCount > 0 && ` • ${selectedCount} selected`}
                {hasFilters && ' (filtered)'}
                {selectMode && ' • Selection Mode'}
            </p>
        </div>
        
        <div className="flex items-center gap-2">
            <SortDropdown />
            {!selectMode && tabHasData && (
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            )}
            {tabHasData && (
                <SelectionModeButton selectMode={selectMode} onToggle={onToggleSelectMode} />
            )}
        </div>
    </div>
);