// components/admin/blotters/create/components/InvolvedResidentsCard.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Search,
    X,
    User,
    Loader2,
    MapPin,
    AlertCircle,
    ChevronDown,
    CheckCircle2,
} from 'lucide-react';
import axios, { CancelTokenSource } from 'axios';
import debounce from 'lodash/debounce';
import type { Resident, PaginationMeta } from '@/types/admin/blotters/blotter';

interface InvolvedResidentsCardProps {
    selectedResidents: Resident[];
    onToggle: (resident: Resident) => void;
}

export const InvolvedResidentsCard = ({
    selectedResidents,
    onToggle,
}: InvolvedResidentsCardProps) => {
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
                const response = await axios.get(`/admin/blotters/search-residents?${params}`, {
                    cancelToken: cancelTokenSource.token,
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (response.data) {
                    const newData = response.data.data || [];
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
            } catch (error) {
                if (axios.isCancel(error)) return;
                setSearchError('Failed to search residents. Please try again.');
                if (!append) {
                    setResidents([]);
                    setPagination(null);
                }
            } finally {
                if (!append) setIsSearching(false);
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
        fetchResidents('', 1, false);
        return () => {
            debouncedSearchRef.current.cancel();
            if (cancelTokenSourceRef.current) {
                cancelTokenSourceRef.current.cancel('Component unmounted');
            }
        };
    }, [fetchResidents]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearchRef.current(value);
        if (value.trim()) setShowDropdown(true);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setShowDropdown(false);
        fetchResidents('', 1, false);
        searchInputRef.current?.focus();
    };

    const loadMore = async () => {
        if (!pagination?.has_more || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = (pagination.current_page || 1) + 1;
        await fetchResidents(searchTerm, nextPage, true);
    };

    const handleToggle = (resident: Resident) => {
        onToggle(resident);
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

    const isSelected = (residentId: number) => {
        return (selectedResidents as Resident[]).some((r: Resident) => r.id === residentId);
    };

    return (
        <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                    </div>
                    Other Involved Residents
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Add other residents involved in this incident (witnesses, victims, etc.)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Selected residents badges – explicit type assertion */}
                {selectedResidents.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Selected ({selectedResidents.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(selectedResidents as Resident[]).map((resident: Resident) => (
                                <Badge
                                    key={resident.id}
                                    variant="secondary"
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                    onClick={() => handleToggle(resident)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleToggle(resident);
                                        }
                                    }}
                                >
                                    <User className="h-3 w-3" />
                                    <span className="truncate max-w-[150px]">{resident.name}</span>
                                    <button
                                        type="button"
                                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggle(resident);
                                        }}
                                        aria-label={`Remove ${resident.name}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search input */}
                <div ref={dropdownRef} className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search residents to add..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => {
                                if (residents.length > 0) setShowDropdown(true);
                            }}
                            className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                        )}
                        {!isSearching && searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Clear search"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown results – explicit type assertion */}
                    {showDropdown && (
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
                                                ? 'Try a different name or address'
                                                : 'Start typing to search for residents'}
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
                                {(residents as Resident[]).map((resident: Resident) => (
                                    <div
                                        key={resident.id}
                                        className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                                            isSelected(resident.id)
                                                ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                        onClick={() => handleToggle(resident)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleToggle(resident);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            {resident.photo_url ? (
                                                <img
                                                    src={resident.photo_url}
                                                    alt={resident.name}
                                                    className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div
                                                    className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        isSelected(resident.id)
                                                            ? 'bg-blue-200 dark:bg-blue-700'
                                                            : 'bg-gray-100 dark:bg-gray-800'
                                                    }`}
                                                >
                                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                        {getInitials(resident.name)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-sm truncate ${
                                                            isSelected(resident.id)
                                                                ? 'text-blue-700 dark:text-blue-300 font-medium'
                                                                : 'text-gray-900 dark:text-gray-200'
                                                        }`}
                                                    >
                                                        {resident.name}
                                                    </span>
                                                    {isSelected(resident.id) && (
                                                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                                {resident.address && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                                        {resident.address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Checkbox
                                            checked={isSelected(resident.id)}
                                            onCheckedChange={() => handleToggle(resident)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="ml-3 flex-shrink-0 border-gray-300 dark:border-gray-600"
                                            aria-label={`Select ${resident.name}`}
                                        />
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

                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Click on a resident to select or deselect them. Selected residents appear as badges above.
                </p>
            </CardContent>
        </Card>
    );
};