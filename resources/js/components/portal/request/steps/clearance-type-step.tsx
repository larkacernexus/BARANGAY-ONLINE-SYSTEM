import { RefObject } from 'react';
import { Search, X, FileCheck, Check, ArrowRight, Info, Grid, List, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ClearanceType } from '@/components/resident/request/types';

interface ClearanceTypeStepProps {
    clearanceTypes: ClearanceType[];
    selectedClearance: ClearanceType | null;
    dataClearanceTypeId: string;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    categoryFilter: string;
    setCategoryFilter: (filter: string) => void;
    visibleCount: number;
    setVisibleCount: (count: number) => void;
    categorizedTypes: ClearanceType[];
    hasMore: boolean;
    loadMore: () => void;
    categories: string[];
    typeListRef: RefObject<HTMLDivElement>;
    searchInputRef: RefObject<HTMLInputElement>;
    isMobile: boolean;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    onClearanceTypeChange: (value: string) => void;
    onClearSelection: () => void;
}

export function ClearanceTypeStep({
    clearanceTypes,
    selectedClearance,
    dataClearanceTypeId,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    categoryFilter,
    setCategoryFilter,
    visibleCount,
    categorizedTypes,
    hasMore,
    loadMore,
    categories,
    typeListRef,
    searchInputRef,
    isMobile,
    showSearch,
    setShowSearch,
    onClearanceTypeChange,
    onClearSelection
}: ClearanceTypeStepProps) {
    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <Card className="rounded-xl">
                <CardContent className="p-4">
                    <div className="space-y-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search by name, description, or purpose..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-10 h-11 rounded-lg"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter and View Toggle */}
                        <div className="flex items-center gap-2">
                            <select
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value);
                                }}
                                className="flex-1 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                            
                            {/* View Toggle */}
                            <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-none px-3 h-10 ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-none px-3 h-10 ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                Found {categorizedTypes.length} clearance types
                            </span>
                            {hasMore && (
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={loadMore}
                                    className="text-blue-600"
                                >
                                    Show more
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clearance type list - Progressive Loading */}
            <div 
                ref={typeListRef}
                className={`${isMobile && categorizedTypes.length > 6 ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}
            >
                {viewMode === 'list' ? (
                    // LIST VIEW
                    <div className="space-y-3">
                        {categorizedTypes.length > 0 ? (
                            categorizedTypes.slice(0, visibleCount).map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                        dataClearanceTypeId === type.id.toString()
                                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 ring-2 ring-blue-500/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                                    }`}
                                    onClick={() => onClearanceTypeChange(type.id.toString())}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${dataClearanceTypeId === type.id.toString() ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-900'}`}>
                                                <FileCheck className={`h-5 w-5 ${dataClearanceTypeId === type.id.toString() ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-sm truncate">
                                                        {type.name}
                                                    </h3>
                                                    {type.category && (
                                                        <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-900">
                                                            {type.category}
                                                        </Badge>
                                                    )}
                                                    {type.formatted_fee && type.formatted_fee !== '₱0.00' && (
                                                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                                            {type.formatted_fee}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {type.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-3">
                                            {dataClearanceTypeId === type.id.toString() ? (
                                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            ) : (
                                                <ArrowRight className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Additional info for selected type */}
                                    {dataClearanceTypeId === type.id.toString() && type.document_types && type.document_types.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                <Info className="h-3 w-3" />
                                                <span className="font-medium">Requires:</span>
                                                <span className="ml-1">
                                                    {type.document_types.filter(doc => doc.is_required).length} required document(s)
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-blue-100 dark:bg-blue-900/30 text-blue-500">
                                    <FileCheck className="h-6 w-6" />
                                </div>
                                <h4 className="font-medium mb-1">No clearance types found</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {searchQuery 
                                        ? `Try a different search term or clear the search`
                                        : `No clearance types are currently available`
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    // GRID VIEW
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categorizedTypes.length > 0 ? (
                            categorizedTypes.slice(0, visibleCount).map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                                        dataClearanceTypeId === type.id.toString()
                                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 ring-2 ring-blue-500/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                                    }`}
                                    onClick={() => onClearanceTypeChange(type.id.toString())}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className={`p-2 rounded-lg ${dataClearanceTypeId === type.id.toString() ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-900'}`}>
                                            <FileCheck className={`h-5 w-5 ${dataClearanceTypeId === type.id.toString() ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                                        </div>
                                        {dataClearanceTypeId === type.id.toString() ? (
                                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        ) : null}
                                    </div>
                                    
                                    <h3 className="font-semibold text-sm mb-1 truncate">{type.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                        {type.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {type.category && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                {type.category}
                                            </Badge>
                                        )}
                                        {type.formatted_fee && type.formatted_fee !== '₱0.00' && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
                                                {type.formatted_fee}
                                            </Badge>
                                        )}
                                        {type.document_types?.some(doc => doc.is_required) && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-50 text-red-700 border-red-200">
                                                Docs Required
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-blue-100 dark:bg-blue-900/30 text-blue-500">
                                    <FileCheck className="h-6 w-6" />
                                </div>
                                <h4 className="font-medium mb-1">No clearance types found</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {searchQuery 
                                        ? `Try a different search term or clear the search`
                                        : `No clearance types are currently available`
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Load More Button */}
                {hasMore && (
                    <div className="text-center mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={loadMore}
                            className="gap-2"
                        >
                            <ChevronDown className="h-4 w-4" />
                            Load More ({categorizedTypes.length - visibleCount} remaining)
                        </Button>
                    </div>
                )}
            </div>

            {/* Quick Jump / Category Navigation */}
            {categories.length > 1 && categorizedTypes.length > 20 && (
                <Card className="rounded-xl">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 overflow-x-auto py-1">
                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Jump to:</span>
                            {categories.filter(c => c !== 'all').map(cat => (
                                <Button
                                    key={cat}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs whitespace-nowrap"
                                    onClick={() => {
                                        setCategoryFilter(cat);
                                        typeListRef.current?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Selected Type Summary */}
            {selectedClearance && (
                <div className="mt-4 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 flex-wrap">
                                    {selectedClearance.name}
                                    {selectedClearance.category && (
                                        <Badge variant="outline" className="text-xs">
                                            {selectedClearance.category}
                                        </Badge>
                                    )}
                                    {selectedClearance.formatted_fee && selectedClearance.formatted_fee !== '₱0.00' && (
                                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                            {selectedClearance.formatted_fee}
                                        </Badge>
                                    )}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedClearance.description}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            className="h-8 w-8 p-0 flex-shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                            <div className="font-medium">Processing</div>
                            <div className="text-gray-600 dark:text-gray-400">{selectedClearance.processing_days} days</div>
                        </div>
                        <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                            <div className="font-medium">Validity</div>
                            <div className="text-gray-600 dark:text-gray-400">{selectedClearance.validity_days} days</div>
                        </div>
                        <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                            <div className="font-medium">Documents</div>
                            <div className={selectedClearance.document_types?.some(doc => doc.is_required) ? 'text-red-600' : 'text-green-600'}>
                                {selectedClearance.document_types?.filter(doc => doc.is_required).length || 0} required
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}