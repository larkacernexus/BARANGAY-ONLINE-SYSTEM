import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetTrigger 
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { 
    Menu, 
    X, 
    Search, 
    Filter, 
    Folder, 
    Grid, 
    List, 
    Users, 
    User,
    CheckCircle,
    Home,
    FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface MobileSidebarProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    allCategories: any[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    residentFilter: string;
    onResidentChange: (residentId: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    householdResidents?: any[];
    onClearFilters: () => void;
    getIconComponent: (iconName: string) => any;
    hasActiveFilters: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onSearchClear: () => void;
}

export const MobileSidebar = ({
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
    onSearchClear,
}: MobileSidebarProps) => {
    const [localSearch, setLocalSearch] = useState(search || '');
    
    // Update local search when prop changes
    useEffect(() => {
        setLocalSearch(search || '');
    }, [search]);
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearchSubmit) {
            onSearchSubmit(e);
            onOpenChange(false);
        }
    };
    
    const activeFilterCount = [
        hasActiveFilters ? 1 : 0,
        residentFilter !== 'all' ? 1 : 0,
        activeTab !== 'all' ? 1 : 0,
        search ? 1 : 0
    ].reduce((a, b) => a + b, 0);
    
    // Get resident name by ID
    const getResidentName = (id: string) => {
        if (!householdResidents) return '';
        const resident = householdResidents.find(r => r.id.toString() === id);
        return resident ? `${resident.first_name} ${resident.last_name}` : '';
    };
    
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button 
                    variant="outline" 
                    size="icon" 
                    type="button" 
                    className={cn(
                        "h-10 w-10 relative transition-all duration-200",
                        "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700",
                        hasActiveFilters && "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    )}
                >
                    <Menu className="h-5 w-5" />
                    {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center animate-in zoom-in">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent 
                side="left" 
                className={cn(
                    "w-full max-w-[320px] p-0 flex flex-col",
                    "dark:bg-gray-900 dark:border-gray-800"
                )}
            >
                {/* Header with gradient */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-4 text-white">
                    <div className="flex items-center justify-between">
                        <SheetHeader className="p-0">
                            <SheetTitle className="text-white text-lg font-semibold">Filters & Categories</SheetTitle>
                        </SheetHeader>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="text-white hover:bg-white/20 h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    {/* Quick Search inside header */}
                    <form onSubmit={handleSearchSubmit} className="mt-3 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                        <Input
                            type="search"
                            placeholder="Search documents..."
                            value={localSearch}
                            onChange={(e) => {
                                setLocalSearch(e.target.value);
                                if (onSearchChange) onSearchChange(e.target.value);
                            }}
                            className="pl-10 pr-8 h-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 rounded-lg focus:ring-2 focus:ring-white/50"
                        />
                        {localSearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setLocalSearch('');
                                    if (onSearchClear) onSearchClear();
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-white/20 p-0.5 rounded-full"
                            >
                                <X className="h-3 w-3 text-white" />
                            </button>
                        )}
                    </form>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                    <Filter className="h-4 w-4" />
                                    Active Filters ({activeFilterCount})
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        onClearFilters();
                                        onOpenChange(false);
                                    }}
                                    className="h-7 px-2 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
                                >
                                    Clear all
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {search && (
                                    <Badge variant="secondary" className="text-xs bg-white dark:bg-gray-900">
                                        Search: "{search}"
                                    </Badge>
                                )}
                                {activeTab !== 'all' && (
                                    <Badge variant="secondary" className="text-xs bg-white dark:bg-gray-900">
                                        {allCategories.find((c: any) => c.id === activeTab)?.name}
                                    </Badge>
                                )}
                                {residentFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-xs bg-white dark:bg-gray-900">
                                        {getResidentName(residentFilter)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Categories Section */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            Categories
                        </h3>
                        <div className="space-y-1">
                            {allCategories.map((category: any) => {
                                const IconComponent = getIconComponent(category.iconName);
                                const isActive = activeTab === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                                            "hover:bg-gray-100 dark:hover:bg-gray-900 group",
                                            isActive && "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                                        )}
                                        onClick={() => {
                                            onTabChange(category.id);
                                            onOpenChange(false);
                                        }}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-110",
                                            category.bgColor,
                                            isActive ? "ring-2 ring-blue-300 dark:ring-blue-700" : ""
                                        )}>
                                            <IconComponent className={cn("h-5 w-5", category.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={cn(
                                                "font-medium text-sm truncate",
                                                isActive ? 'text-blue-700 dark:text-blue-300' : 'dark:text-gray-200'
                                            )}>
                                                {category.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {category.count} document{category.count !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        {isActive && (
                                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Resident Filter */}
                    {householdResidents && householdResidents.length > 1 && (
                        <div>
                            <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Filter by Resident
                            </h3>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                                        "hover:bg-gray-100 dark:hover:bg-gray-900",
                                        residentFilter === 'all' && "bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                    )}
                                    onClick={() => {
                                        onResidentChange('all');
                                        onOpenChange(false);
                                    }}
                                >
                                    <div className={cn(
                                        "p-2 rounded-full",
                                        residentFilter === 'all' 
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    )}>
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm dark:text-gray-200">All Residents</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Show documents from everyone</div>
                                    </div>
                                    {residentFilter === 'all' && (
                                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    )}
                                </button>
                                
                                {householdResidents.map((resident: any) => (
                                    <button
                                        key={resident.id}
                                        type="button"
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                                            "hover:bg-gray-100 dark:hover:bg-gray-900",
                                            residentFilter === resident.id.toString() && "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                                        )}
                                        onClick={() => {
                                            onResidentChange(resident.id.toString());
                                            onOpenChange(false);
                                        }}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-full",
                                            residentFilter === resident.id.toString()
                                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                        )}>
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm dark:text-gray-200">
                                                {resident.first_name} {resident.last_name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                View personal documents
                                            </div>
                                        </div>
                                        {residentFilter === resident.id.toString() && (
                                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* View Mode */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Grid className="h-4 w-4" />
                            View Mode
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    "h-12 flex flex-col items-center justify-center gap-1",
                                    viewMode === 'grid' 
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' 
                                        : 'dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                                )}
                                onClick={() => {
                                    onViewModeChange('grid');
                                    onOpenChange(false);
                                }}
                            >
                                <Grid className="h-5 w-5" />
                                <span className="text-xs">Grid</span>
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    "h-12 flex flex-col items-center justify-center gap-1",
                                    viewMode === 'list' 
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' 
                                        : 'dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                                )}
                                onClick={() => {
                                    onViewModeChange('list');
                                    onOpenChange(false);
                                }}
                            >
                                <List className="h-5 w-5" />
                                <span className="text-xs">List</span>
                            </Button>
                        </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <div className="flex justify-between">
                                <span>Total Documents:</span>
                                <span className="font-medium dark:text-white">{allCategories[0]?.count || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Categories:</span>
                                <span className="font-medium dark:text-white">{allCategories.length - 1}</span>
                            </div>
                            {householdResidents && (
                                <div className="flex justify-between">
                                    <span>Residents:</span>
                                    <span className="font-medium dark:text-white">{householdResidents.length}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Footer with clear button */}
                <div className="sticky bottom-0 p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="flex gap-2">
                        {hasActiveFilters && (
                            <Button 
                                variant="outline" 
                                type="button"
                                className="flex-1 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                onClick={() => {
                                    onClearFilters();
                                    onOpenChange(false);
                                }}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        )}
                        <Button 
                            variant="default"
                            type="button"
                            className={cn(
                                "bg-gradient-to-r from-blue-500 to-blue-600",
                                !hasActiveFilters && "w-full"
                            )}
                            onClick={() => onOpenChange(false)}
                        >
                            Apply & Close
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};