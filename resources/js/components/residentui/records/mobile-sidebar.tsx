import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, Search, X, Filter, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViewToggle } from '@/components/residentui/modern/view-toggle';
import { ModernSelect } from '@/components/residentui/modern-select';

interface MobileSidebarProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    allCategories: Array<{
        id: string;
        name: string;
        iconName: string;
        color: string;
        bgColor: string;
        count?: number;
    }>;
    activeTab: string;
    onTabChange: (tab: string) => void;
    residentFilter: string;
    onResidentChange: (value: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    householdResidents?: Array<{
        id: number;
        first_name: string;
        last_name: string;
        full_name?: string;
    }>;
    onClearFilters: () => void;
    getIconComponent: (iconName: string, className?: string, color?: string) => React.ReactNode;
    hasActiveFilters: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onSearchClear: () => void;
}

export function MobileSidebar({
    isOpen,
    onOpenChange,
    allCategories,
    activeTab,
    onTabChange,
    residentFilter,
    onResidentChange,
    viewMode,
    onViewModeChange,
    householdResidents,
    onClearFilters,
    getIconComponent,
    hasActiveFilters,
    search,
    onSearchChange,
    onSearchSubmit,
    onSearchClear
}: MobileSidebarProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                    <Menu className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm p-0">
                <div className="flex flex-col h-full">
                    <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <SheetTitle>Filters & Categories</SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Search */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Search Documents
                            </label>
                            <form onSubmit={onSearchSubmit}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        className="pl-9 pr-9"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={onSearchClear}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            <X className="h-4 w-4 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                        
                        {/* View Mode */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                View Mode
                            </label>
                            <ViewToggle
                                viewMode={viewMode}
                                onViewChange={onViewModeChange}
                            />
                        </div>
                        
                        {/* Categories */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Categories
                            </label>
                            <div className="space-y-1">
                                {allCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            onTabChange(category.id);
                                            onOpenChange(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
                                            activeTab === category.id
                                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {getIconComponent(category.iconName, "h-4 w-4")}
                                            <span className="text-sm">{category.name}</span>
                                        </div>
                                        {category.count !== undefined && category.count > 0 && (
                                            <span className="text-xs text-gray-500">{category.count}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Resident Filter */}
                        {householdResidents && householdResidents.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Filter by Resident
                                </label>
                                <ModernSelect
                                    value={residentFilter}
                                    onValueChange={onResidentChange}
                                    placeholder="All residents"
                                    options={[
                                        { value: 'all', label: 'All residents' },
                                        ...householdResidents.map(resident => ({
                                            value: resident.id.toString(),
                                            label: resident.full_name || `${resident.first_name} ${resident.last_name}`.trim()
                                        }))
                                    ]}
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                                className="w-full"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Clear All Filters
                            </Button>
                        )}
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
                        >
                            Apply
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}