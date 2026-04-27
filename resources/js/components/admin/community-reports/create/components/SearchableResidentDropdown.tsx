// components/community-report/SearchableResidentDropdown.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Search, 
    X, 
    Loader2, 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    AlertCircle,
    ChevronDown,
    CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { Resident } from '@/types/admin/reports/community-report';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
}

interface SearchableResidentDropdownProps {
    residents?: Resident[];
    onSelect: (resident: Resident) => void;
    selectedResident: Resident | null;
    onClear: () => void;
    placeholder?: string;
}

export const SearchableResidentDropdown = ({ 
    residents: externalResidents = [],
    onSelect,
    selectedResident,
    onClear,
    placeholder = "Search for resident..."
}: SearchableResidentDropdownProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [residents, setResidents] = useState<Resident[]>(externalResidents);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [hasInitialized, setHasInitialized] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Fetch residents from server
    const fetchResidents = useCallback(async (query: string = '', page: number = 1, append: boolean = false) => {
        // Cancel any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        setIsSearching(true);
        setSearchError(null);
        
        try {
            const params = new URLSearchParams({
                search: query,
                page: String(page),
                per_page: '50',
            });
            
            const response = await axios({
                method: 'GET',
                url: `/admin/community-reports/search-residents?${params}`,
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            } as any);
            
            if (response.data) {
                const newData: Resident[] = response.data.data || [];
                
                if (append && page > 1) {
                    setResidents((prev: Resident[]) => {
                        const existingIds = new Set(prev.map((r: Resident) => r.id));
                        const unique: Resident[] = newData.filter((r: Resident) => !existingIds.has(r.id));
                        return [...prev, ...unique];
                    });
                } else {
                    setResidents(newData);
                }
                
                setPagination(response.data.pagination || null);
            }
        } catch (error: any) {
            if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return;
            
            console.error('Search error:', error);
            setSearchError('Failed to search residents. Please try again.');
            
            if (!append) {
                setResidents([]);
            }
        } finally {
            setIsSearching(false);
            setIsLoadingMore(false);
            setHasInitialized(true);
        }
    }, []);

    // Debounced search
    const debouncedSearchRef = useRef(
        debounce((query: string) => {
            fetchResidents(query, 1, false);
        }, 300)
    );

    // Initial load
    useEffect(() => {
        if (!selectedResident && !hasInitialized) {
            fetchResidents('', 1, false);
        }
        
        return () => {
            debouncedSearchRef.current.cancel();
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [selectedResident, hasInitialized, fetchResidents]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearchRef.current(value);
        
        if (value.trim()) {
            setShowDropdown(true);
        }
        
        if (!value && selectedResident) {
            onClear();
        }
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchTerm('');
        setShowDropdown(false);
        onClear();
        
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Load more
    const loadMore = async () => {
        if (!pagination?.has_more || isLoadingMore) return;
        setIsLoadingMore(true);
        await fetchResidents(searchTerm, (pagination.current_page || 1) + 1, true);
    };

    // Handle resident selection
    const handleSelect = (resident: Resident) => {
        onSelect(resident);
        setSearchTerm(resident.name);
        setShowDropdown(false);
    };

    // Get resident initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => {
                        if (residents.length > 0 && !selectedResident) {
                            setShowDropdown(true);
                        }
                    }}
                    disabled={!!selectedResident}
                    className={`pl-10 pr-10 h-11 rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 ${
                        selectedResident ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''
                    }`}
                />
                {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                )}
                {!isSearching && (searchTerm || selectedResident) && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Clear selection"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            
            {/* Dropdown Results */}
            {showDropdown && !selectedResident && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-[32rem] overflow-hidden flex flex-col">
                    <div className="overflow-y-auto flex-1">
                        {/* Loading state */}
                        {isSearching && residents.length === 0 && !searchError && (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin" />
                                <p className="text-sm">Searching residents...</p>
                            </div>
                        )}
                        
                        {/* No results state */}
                        {!isSearching && residents.length === 0 && !searchError && hasInitialized && (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                                <p className="text-sm">
                                    {searchTerm 
                                        ? `No residents found matching "${searchTerm}"`
                                        : 'No residents available'
                                    }
                                </p>
                                <p className="text-xs mt-1">
                                    {searchTerm 
                                        ? 'Try a different name, email, phone number, or address'
                                        : 'Try searching with a different term'
                                    }
                                </p>
                            </div>
                        )}
                        
                        {/* Initial load state */}
                        {!isSearching && residents.length === 0 && !searchError && !hasInitialized && (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin" />
                                <p className="text-sm">Loading residents...</p>
                            </div>
                        )}
                        
                        {/* Error state */}
                        {searchError && (
                            <div className="px-4 py-8 text-center text-red-500 dark:text-red-400">
                                <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                                <p className="text-sm">{searchError}</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchResidents(searchTerm, 1, false)}
                                    className="mt-2 text-xs"
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}
                        
                        {/* Results */}
                        {residents.map((resident: Resident) => (
                            <div
                                key={resident.id}
                                className="px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                                onClick={() => handleSelect(resident)}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    {resident.photo_path ? (
                                        <img 
                                            src={resident.photo_path} 
                                            alt={resident.name}
                                            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            resident.photo_path ? 'hidden' : ''
                                        } ${
                                            selectedResident?.id === resident.id
                                                ? 'bg-blue-100 dark:bg-blue-900/50'
                                                : 'bg-gray-100 dark:bg-gray-800'
                                        }`}
                                    >
                                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium truncate ${
                                                selectedResident?.id === resident.id
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-gray-900 dark:text-gray-100'
                                            }`}>
                                                {resident.name}
                                            </span>
                                            {selectedResident?.id === resident.id && (
                                                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                            )}
                                            {resident.purok && (
                                                <Badge variant="outline" className="text-xs flex-shrink-0 ml-auto">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    Purok {resident.purok}
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {resident.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate max-w-[150px]">{resident.email}</span>
                                                </span>
                                            )}
                                            {resident.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                                    {resident.phone}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {resident.address && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate flex items-center gap-1">
                                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                                {resident.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Load More Button */}
                    {pagination?.has_more && (
                        <div className="p-2 text-center border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 w-full"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-3 w-3 mr-1" />
                                        Load More ({residents.length} of {pagination.total})
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
            
            {/* Selected Resident Display */}
            {selectedResident && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                        {selectedResident.photo_path ? (
                            <img 
                                src={selectedResident.photo_path} 
                                alt={selectedResident.name}
                                className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    {getInitials(selectedResident.name)}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {selectedResident.name}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-sm">
                                        {selectedResident.email && (
                                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="truncate">{selectedResident.email}</span>
                                            </p>
                                        )}
                                        {selectedResident.phone && (
                                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                                {selectedResident.phone}
                                            </p>
                                        )}
                                        {selectedResident.address && (
                                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 col-span-2">
                                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="truncate">{selectedResident.address}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0 ml-2"
                                    onClick={handleClearSearch}
                                    title="Remove selection"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Resident information will be used for this report
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};