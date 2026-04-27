// components/admin/blotters/create/components/SearchableResidentSelect.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Search,
    X,
    Loader2,
    MapPin,
    Phone,
    AlertCircle,
    ChevronDown,
    CheckCircle2,
} from 'lucide-react';
import axios, { type CancelTokenSource } from 'axios';
import debounce from 'lodash/debounce';
import type { Resident } from '@/types/admin/blotters/blotter';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
}

interface SearchableResidentSelectProps {
    label?: string;
    selectedResident: Resident | null;
    onSelect: (resident: Resident) => void;
    onClear: () => void;
    required?: boolean;
    error?: string;
    showContact?: boolean;
    placeholder?: string;
}

export const SearchableResidentSelect = ({
    label = 'Select Resident',
    selectedResident,
    onSelect,
    onClear,
    required = false,
    error,
    showContact = false,
    placeholder = 'Search residents...',
}: SearchableResidentSelectProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [residents, setResidents] = useState<Resident[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

    const fetchResidents = useCallback(
        async (query: string = '', page: number = 1, append: boolean = false) => {
            if (cancelTokenSourceRef.current) {
                cancelTokenSourceRef.current.cancel('Operation canceled due to new request.');
            }

            const cancelTokenSource = axios.CancelToken.source();
            cancelTokenSourceRef.current = cancelTokenSource;

            if (!append) {
                setIsSearching(true);
                setSearchError(null);
            }

            try {
                const params = new URLSearchParams({
                    search: query,
                    page: String(page),
                    per_page: '50',
                });

                const response = await axios.get(
                    `/admin/blotters/search-residents?${params}`,
                    {
                        cancelToken: cancelTokenSource.token,
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    }
                );

                if (response.data) {
                    const newData: Resident[] = response.data.data || [];

                    if (append && page > 1) {
                        setResidents((prev) => {
                            const existingIds = new Set(prev.map((r) => r.id));
                            const unique = newData.filter(
                                (r: Resident) => !existingIds.has(r.id)
                            );
                            return [...prev, ...unique];
                        });
                    } else {
                        setResidents(newData);
                    }

                    setPagination(response.data.pagination || null);
                }
            } catch (error: unknown) {
                if (axios.isCancel(error)) {
                    return;
                }
                setSearchError('Failed to search residents. Please try again.');
                if (!append) {
                    setResidents([]);
                    setPagination(null);
                }
            } finally {
                if (!append) {
                    setIsSearching(false);
                }
                setIsLoadingMore(false);
            }
        },
        []
    );

    const debouncedSearchRef = useRef(
        debounce((query: string) => {
            fetchResidents(query, 1, false);
        }, 300)
    );

    useEffect(() => {
        if (!selectedResident) {
            fetchResidents('', 1, false);
        }
        return () => {
            debouncedSearchRef.current.cancel();
            if (cancelTokenSourceRef.current) {
                cancelTokenSourceRef.current.cancel('Component unmounted');
            }
        };
    }, [selectedResident, fetchResidents]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearchRef.current(value);
        if (value.trim()) {
            setShowDropdown(true);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setShowDropdown(false);
        onClear();
        fetchResidents('', 1, false);
        searchInputRef.current?.focus();
    };

    const loadMore = async () => {
        if (!pagination?.has_more || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = (pagination.current_page || 1) + 1;
        await fetchResidents(searchTerm, nextPage, true);
    };

    const handleSelect = (resident: Resident) => {
        onSelect(resident);
        setSearchTerm(resident.name);
        setShowDropdown(false);
    };

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .filter(Boolean)
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-2">
            {label && (
                <Label className="dark:text-gray-300">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
            )}
            <div ref={dropdownRef} className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        ref={searchInputRef}
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
                            selectedResident
                                ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                                : ''
                        } ${error ? 'border-red-500 dark:border-red-500' : ''}`}
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
                            aria-label="Clear selection"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {showDropdown && !selectedResident && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
                        <div className="overflow-y-auto flex-1">
                            {isSearching && residents.length === 0 && !searchError && (
                                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin" />
                                    <p className="text-sm">Searching residents...</p>
                                </div>
                            )}

                            {!isSearching && residents.length === 0 && !searchError && (
                                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                                    <p className="text-sm">
                                        {searchTerm
                                            ? `No residents found matching "${searchTerm}"`
                                            : 'No residents available'}
                                    </p>
                                    <p className="text-xs mt-1">
                                        {searchTerm
                                            ? 'Try a different name, address, or contact number'
                                            : 'Try searching with a different term'}
                                    </p>
                                </div>
                            )}

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

                            {(residents as Resident[]).map((resident) => (
                                <div
                                    key={resident.id}
                                    className="px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                                    onClick={() => handleSelect(resident)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleSelect(resident);
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        {resident.photo_path ? (
                                            <img
                                                src={resident.photo_path}
                                                alt={resident.name}
                                                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {getInitials(resident.name)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-gray-200 truncate">
                                                    {resident.name}
                                                </span>
                                                {selectedResident?.id === resident.id && (
                                                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                )}
                                            </div>

                                            {resident.address && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                                    {resident.address}
                                                </p>
                                            )}

                                            {showContact && resident.contact_number && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                                    {resident.contact_number}
                                                </p>
                                            )}
                                        </div>

                                        {resident.purok && (
                                            <Badge variant="outline" className="text-xs flex-shrink-0">
                                                Purok {resident.purok}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

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
            </div>

            {selectedResident && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                        {selectedResident.photo_path ? (
                            <img
                                src={selectedResident.photo_path}
                                alt={selectedResident.name}
                                className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                                loading="lazy"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    {getInitials(selectedResident.name)}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {selectedResident.name}
                            </p>
                            <div className="grid grid-cols-1 gap-y-0.5 mt-1 text-sm">
                                {selectedResident.address && (
                                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="truncate">{selectedResident.address}</span>
                                    </p>
                                )}
                                {showContact && selectedResident.contact_number && (
                                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                        {selectedResident.contact_number}
                                    </p>
                                )}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Resident selected
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};