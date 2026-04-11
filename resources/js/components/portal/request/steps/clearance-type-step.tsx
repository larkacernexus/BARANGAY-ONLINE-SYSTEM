// clearance-type-step.tsx
import { RefObject, useState, useEffect, useRef } from 'react';
import { Search, X, FileCheck, Check, ChevronDown, Filter, LayoutGrid, ListOrdered, Info, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ClearanceType } from '@/components/portal/request/types';

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
    categorizedTypes: ClearanceType[];
    hasMore: boolean;
    loadMore: () => void;
    categories: string[];
    typeListRef: RefObject<HTMLDivElement | null>;
    searchInputRef: RefObject<HTMLInputElement | null>;
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
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const searchInputInsideRef = useRef<HTMLInputElement>(null);
    const touchStartRef = useRef<number | null>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setShowCategoryDropdown(false);
            }
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node) && !isClosing) {
                handleCloseDropdown();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isClosing]);

    // Prevent body scroll when mobile dropdown is open
    useEffect(() => {
        if (isMobile && showTypeDropdown) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isMobile, showTypeDropdown]);

    // Auto-focus search input on desktop only
    useEffect(() => {
        if (showTypeDropdown && !isMobile && searchInputInsideRef.current) {
            setTimeout(() => {
                searchInputInsideRef.current?.focus();
            }, 200);
        }
    }, [showTypeDropdown, isMobile]);

    const handleCloseDropdown = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowTypeDropdown(false);
            setIsClosing(false);
        }, 200);
    };

    const getCategoryLabel = () => {
        if (categoryFilter === 'all') return 'All Categories';
        return categoryFilter;
    };

    const getSelectedTypeLabel = () => {
        if (selectedClearance) {
            return selectedClearance.name;
        }
        return 'Select clearance type';
    };

    const getSelectedTypeIcon = () => {
        if (selectedClearance) {
            return <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:scale-110" />;
        }
        return <FileCheck className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:scale-110" />;
    };

    // Handle touch start for swipe to close on mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current || !isMobile) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartRef.current;
        if (diff > 80) {
            handleCloseDropdown();
            touchStartRef.current = null;
        }
    };

    const handleTouchEnd = () => {
        touchStartRef.current = null;
    };

    const handleSelectType = (typeId: string) => {
        setSelectedItemId(typeId);
        setTimeout(() => {
            onClearanceTypeChange(typeId);
            handleCloseDropdown();
            setSelectedItemId(null);
        }, 150);
    };

    // Get category color
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Barangay Clearance': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
            'Certificate': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
            'Permit': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
            'Identification': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
        };
        return colors[category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Main Clearance Type Dropdown Card */}
            <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-md">
                <CardContent className="p-4">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="text-red-500 transition-transform duration-200 group-hover:scale-110">*</span>
                            Select Clearance Type
                            {selectedClearance && (
                                <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 animate-in fade-in duration-300">
                                    Selected
                                </Badge>
                            )}
                        </label>

                        {/* Clearance Type Dropdown */}
                        <div className="relative" ref={typeDropdownRef}>
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "w-full justify-between h-12 px-4 transition-all duration-300 group",
                                    selectedClearance 
                                        ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30" 
                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md",
                                    showTypeDropdown && "ring-2 ring-blue-500/20 border-blue-500 shadow-lg"
                                )}
                                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="transition-transform duration-300 group-hover:scale-110">
                                        {getSelectedTypeIcon()}
                                    </div>
                                    <span className={cn(
                                        "text-sm truncate transition-all duration-300",
                                        !selectedClearance ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'
                                    )}>
                                        {getSelectedTypeLabel()}
                                    </span>
                                </div>
                                <ChevronDown className={cn(
                                    "h-4 w-4 transition-all duration-500 text-gray-400",
                                    showTypeDropdown && "rotate-180"
                                )} />
                            </Button>

                            {showTypeDropdown && (
                                <>
                                    {/* Backdrop for mobile */}
                                    {isMobile && (
                                        <div 
                                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                                            onClick={handleCloseDropdown}
                                        />
                                    )}
                                    
                                    {/* Dropdown Content */}
                                    <div 
                                        className={cn(
                                            "overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl",
                                            isMobile 
                                                ? "fixed left-0 right-0 bottom-0 top-auto z-50 mt-0 rounded-t-2xl rounded-b-none"
                                                : "absolute z-50 mt-2 w-full rounded-lg",
                                            isClosing 
                                                ? "animate-out slide-out-to-bottom duration-200"
                                                : isMobile 
                                                    ? "animate-in slide-in-from-bottom duration-400"
                                                    : "animate-in fade-in-zoom duration-300"
                                        )}
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        {/* Header for mobile */}
                                        {isMobile && (
                                            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
                                                <div className="animate-in slide-in-from-left duration-300">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">Select Clearance Type</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {categorizedTypes.length} types available
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCloseDropdown}
                                                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                                                >
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* Search inside dropdown */}
                                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                            <div className="relative">
                                                <Search className={cn(
                                                    "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-all duration-300",
                                                    searchFocused ? "text-blue-500 scale-110" : "text-gray-400"
                                                )} />
                                                <Input
                                                    ref={searchInputInsideRef}
                                                    type="text"
                                                    placeholder="Search clearance types..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onFocus={() => setSearchFocused(true)}
                                                    onBlur={() => setSearchFocused(false)}
                                                    className={cn(
                                                        "pl-9 pr-9 text-sm h-10 rounded-lg transition-all duration-300",
                                                        searchFocused 
                                                            ? "border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-gray-800 shadow-md" 
                                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                                    )}
                                                    autoFocus={!isMobile}
                                                />
                                                {searchQuery && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSearchQuery('')}
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                                                    >
                                                        <X className="h-3 w-3 text-gray-400" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Category Filter - Only show if multiple categories */}
                                        {categories.length > 2 && (
                                            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                                <div className="relative" ref={categoryDropdownRef}>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full justify-between h-8 px-2 text-xs border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-sm"
                                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Filter className="h-3 w-3 transition-transform duration-200" />
                                                            <span>{getCategoryLabel()}</span>
                                                        </div>
                                                        <ChevronDown className={cn(
                                                            "h-3 w-3 transition-all duration-300",
                                                            showCategoryDropdown && "rotate-180"
                                                        )} />
                                                    </Button>

                                                    {showCategoryDropdown && (
                                                        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden animate-in fade-in-zoom duration-200">
                                                            <div className="max-h-48 overflow-y-auto py-1">
                                                                {categories.map((cat, idx) => (
                                                                    <button
                                                                        key={cat}
                                                                        type="button"
                                                                        className={cn(
                                                                            "w-full text-left px-3 py-2 text-xs transition-all duration-200 flex items-center justify-between",
                                                                            categoryFilter === cat
                                                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:pl-4'
                                                                        )}
                                                                        style={{
                                                                            animationDelay: `${idx * 30}ms`
                                                                        }}
                                                                        onClick={() => {
                                                                            setCategoryFilter(cat);
                                                                            setShowCategoryDropdown(false);
                                                                        }}
                                                                    >
                                                                        <span>{cat === 'all' ? 'All Categories' : cat}</span>
                                                                        {categoryFilter === cat && (
                                                                            <Check className="h-3 w-3 animate-in zoom-in duration-200" />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Quick Stats */}
                                        {!searchQuery && !isMobile && (
                                            <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-4 text-xs">
                                                    <div className="flex items-center gap-1 animate-in fade-in-left duration-300">
                                                        <Sparkles className="h-3 w-3 text-blue-500 animate-pulse" />
                                                        <span className="text-gray-600 dark:text-gray-400">{categorizedTypes.length} available</span>
                                                    </div>
                                                    {selectedClearance && (
                                                        <div className="flex items-center gap-1 animate-in fade-in-left duration-300 delay-150">
                                                            <Check className="h-3 w-3 text-green-500" />
                                                            <span className="text-gray-600 dark:text-gray-400">1 selected</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Clearance Types List */}
                                        <div className={cn(
                                            "overflow-y-auto transition-all duration-300",
                                            isMobile ? "max-h-[calc(90vh-180px)]" : "max-h-80"
                                        )}>
                                            {categorizedTypes.length > 0 ? (
                                                <div className="py-1">
                                                    {categorizedTypes.slice(0, visibleCount).map((type, index) => (
                                                        <button
                                                            key={type.id}
                                                            type="button"
                                                            className={cn(
                                                                "w-full text-left px-3 py-3 text-sm transition-all duration-300 flex items-center justify-between group",
                                                                dataClearanceTypeId === type.id.toString()
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:pl-4'
                                                            )}
                                                            style={{
                                                                animationDelay: `${index * 50}ms`,
                                                                animation: 'fadeInUp 0.3s ease-out forwards',
                                                                opacity: 0,
                                                                transform: 'translateY(10px)'
                                                            }}
                                                            onClick={() => handleSelectType(type.id.toString())}
                                                        >
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className={cn(
                                                                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                                                                    dataClearanceTypeId === type.id.toString()
                                                                        ? 'bg-blue-100 dark:bg-blue-900/40 scale-110 shadow-md'
                                                                        : 'bg-gray-100 dark:bg-gray-800 group-hover:scale-105 group-hover:shadow-sm'
                                                                )}>
                                                                    <FileCheck className={cn(
                                                                        "h-4 w-4 transition-all duration-300",
                                                                        dataClearanceTypeId === type.id.toString()
                                                                            ? 'text-blue-600 dark:text-blue-400 scale-110'
                                                                            : 'text-gray-500 group-hover:scale-110'
                                                                    )} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <p className={cn(
                                                                            "font-medium text-sm truncate transition-all duration-300",
                                                                            dataClearanceTypeId === type.id.toString()
                                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                                : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                                                        )}>
                                                                            {type.name}
                                                                        </p>
                                                                        {type.category && (
                                                                            <Badge className={cn(
                                                                                "text-[10px] px-1.5 py-0 border transition-all duration-200",
                                                                                getCategoryColor(type.category)
                                                                            )}>
                                                                                {type.category}
                                                                            </Badge>
                                                                        )}
                                                                        {type.formatted_fee && type.formatted_fee !== '₱0.00' && (
                                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                                                                {type.formatted_fee}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 transition-all duration-200 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                                                                        {type.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {dataClearanceTypeId === type.id.toString() && (
                                                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 ml-2 animate-in zoom-in duration-300 shadow-md">
                                                                    <Check className="h-3 w-3 text-white" />
                                                                </div>
                                                            )}
                                                            {selectedItemId === type.id.toString() && dataClearanceTypeId !== type.id.toString() && (
                                                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 ml-2 animate-in zoom-in duration-300">
                                                                    <Check className="h-3 w-3 text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-12 text-center animate-in fade-in duration-500">
                                                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 animate-pulse">
                                                        <AlertCircle className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">No clearance types found</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filter</p>
                                                    {searchQuery && (
                                                        <Button
                                                            type="button"
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => setSearchQuery('')}
                                                            className="mt-3 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:scale-105"
                                                        >
                                                            Clear search
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Load More Button */}
                                        {hasMore && (
                                            <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={loadMore}
                                                    className="w-full text-xs gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02]"
                                                >
                                                    <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:translate-y-0.5" />
                                                    Load more ({categorizedTypes.length - visibleCount} remaining)
                                                </Button>
                                            </div>
                                        )}

                                        {/* Results Count Footer */}
                                        <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                            <p className="text-xs text-gray-500 text-center animate-in fade-in duration-300">
                                                Showing {Math.min(visibleCount, categorizedTypes.length)} of {categorizedTypes.length} clearance types
                                            </p>
                                        </div>

                                        {/* Swipe indicator for mobile */}
                                        {isMobile && (
                                            <div className="py-2 flex justify-center animate-in fade-in duration-300">
                                                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full transition-all duration-200 hover:w-12" />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Clearance Details - Improved Animation */}
            {selectedClearance && (
                <Card className={cn(
                    "rounded-xl border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-800 overflow-hidden",
                    "animate-in slide-in-from-bottom duration-500 hover:shadow-lg transition-all duration-300"
                )}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 transition-all duration-300 hover:scale-110">
                                    <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold flex items-center gap-2 flex-wrap text-gray-900 dark:text-white">
                                        {selectedClearance.name}
                                        {selectedClearance.category && (
                                            <Badge className={cn("text-xs transition-all duration-200 hover:scale-105", getCategoryColor(selectedClearance.category))}>
                                                {selectedClearance.category}
                                            </Badge>
                                        )}
                                        {selectedClearance.formatted_fee && selectedClearance.formatted_fee !== '₱0.00' && (
                                            <Badge className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 transition-all duration-200 hover:scale-105">
                                                {selectedClearance.formatted_fee}
                                            </Badge>
                                        )}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed animate-in fade-in-up duration-300">
                                        {selectedClearance.description}
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClearSelection}
                                className="h-8 w-8 p-0 rounded-full flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110 hover:rotate-90"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Details Grid with better styling */}
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {[
                                { label: 'Processing', value: `${selectedClearance.processing_days} days`, icon: '⏱️' },
                                { label: 'Validity', value: `${selectedClearance.validity_days} days`, icon: '📅' },
                                { 
                                    label: 'Documents', 
                                    value: `${selectedClearance.document_types?.filter(doc => doc.is_required).length || 0} required`,
                                    isRequired: selectedClearance.document_types?.some(doc => doc.is_required)
                                }
                            ].map((item, idx) => (
                                <div 
                                    key={idx}
                                    className="text-center p-2.5 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-md animate-in fade-in-up"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.label}</div>
                                    <div className={cn(
                                        "text-sm font-semibold mt-1 transition-all duration-200",
                                        item.isRequired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                                    )}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Document Requirements Hint */}
                        {selectedClearance.document_types?.some(doc => doc.is_required) && (
                            <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800 animate-in fade-in-up duration-300 delay-200">
                                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                                    <Info className="h-3.5 w-3.5 animate-pulse" />
                                    <span>This clearance requires {selectedClearance.document_types.filter(doc => doc.is_required).length} document(s) to be uploaded</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Quick Selection Tips - Only on desktop */}
            {!isMobile && !selectedClearance && categorizedTypes.length > 0 && (
                <div className="text-center animate-in fade-in-up duration-500">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        Select a clearance type to continue
                        <Sparkles className="h-3 w-3 text-blue-500" />
                    </p>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes zoomIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-in {
                    animation-fill-mode: forwards;
                }
                
                .fade-in-up {
                    animation: fadeInUp 0.3s ease-out forwards;
                }
                
                .fade-in-left {
                    animation: fadeInLeft 0.3s ease-out forwards;
                }
                
                .zoom-in {
                    animation: zoomIn 0.2s ease-out forwards;
                }
                
                .slide-in-from-bottom {
                    animation: slideInFromBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                .slide-out-to-bottom {
                    animation: slideOutToBottom 0.2s ease-in forwards;
                }
                
                .fade-in-zoom {
                    animation: fadeInZoom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                @keyframes slideInFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideOutToBottom {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(100%);
                    }
                }
                
                @keyframes fadeInZoom {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .delay-150 {
                    animation-delay: 150ms;
                }
                
                .delay-200 {
                    animation-delay: 200ms;
                }
            `}</style>
        </div>
    );
}