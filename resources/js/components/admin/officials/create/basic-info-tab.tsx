// components/admin/officials/create/basic-info-tab.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
    Search, 
    X, 
    Loader2, 
    Phone, 
    Mail, 
    MapPin, 
    AlertCircle,
    ChevronDown,
    Home,
    Users
} from 'lucide-react';
import axios, { CancelTokenSource } from 'axios';
import debounce from 'lodash/debounce';
import type { Resident, PaginationMeta } from '@/types/admin/officials/officials';

interface BasicInfoTabProps {
    formData: any;
    errors: Record<string, string>;
    selectedResident: Resident | null;
    onResidentSelect: (residentId: number | null) => void;
    isSubmitting: boolean;
}

export function BasicInfoTab({ 
    formData, 
    errors, 
    selectedResident: initialSelectedResident,
    onResidentSelect, 
    isSubmitting 
}: BasicInfoTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [residents, setResidents] = useState<Resident[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [localSelectedResident, setLocalSelectedResident] = useState<Resident | null>(initialSelectedResident);
    const [hasLoaded, setHasLoaded] = useState(false);
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

    // Sync with parent's selectedResident
    useEffect(() => {
        setLocalSelectedResident(initialSelectedResident);
    }, [initialSelectedResident]);

    const fetchResidents = useCallback(async (query: string = '', page: number = 1, append: boolean = false) => {
        // Cancel any in-flight request
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
            
            const response = await axios.get(`/admin/officials/search-residents?${params}`, {
                cancelToken: cancelTokenSource.token,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            if (response.data) {
                const newData = response.data.data || [];
                
                if (append && page > 1) {
                    setResidents(prev => {
                        const existingIds = new Set(prev.map(r => r.id));
                        const unique = newData.filter((r: Resident) => !existingIds.has(r.id));
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
            if (!append) {
                setIsSearching(false);
            }
            setIsLoadingMore(false);
            setHasLoaded(true);
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
        if (!localSelectedResident) {
            fetchResidents('', 1, false);
        }
        
        return () => {
            debouncedSearchRef.current.cancel();
            if (cancelTokenSourceRef.current) {
                cancelTokenSourceRef.current.cancel('Component unmounted');
            }
        };
    }, [localSelectedResident, fetchResidents]);

    // Close dropdown on outside click
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
        if (value.trim()) {
            setShowDropdown(true);
            debouncedSearchRef.current(value);
        } else {
            fetchResidents('', 1, false);
            if (residents.length > 0) {
                setShowDropdown(true);
            }
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setShowDropdown(false);
        searchInputRef.current?.focus();
    };

    const loadMore = async () => {
        if (!pagination?.has_more || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = (pagination.current_page || 1) + 1;
        await fetchResidents(searchTerm, nextPage, true);
    };

    const handleResidentSelect = (resident: Resident) => {
        setLocalSelectedResident(resident);
        onResidentSelect(resident.id);
        setShowDropdown(false);
        setSearchTerm('');
    };

    const clearResident = () => {
        setLocalSelectedResident(null);
        onResidentSelect(null);
        setSearchTerm('');
    };

    const getInitials = (firstName: string, lastName: string) => {
        if (!firstName || !lastName) return '?';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatFullName = (resident: Resident) => {
        const lastName = resident.last_name || '';
        const firstName = resident.first_name || '';
        const middleName = resident.middle_name ? ` ${resident.middle_name.charAt(0)}.` : '';
        return `${lastName}, ${firstName}${middleName}`;
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="dark:text-gray-300">
                    Select Resident <span className="text-red-500">*</span>
                </Label>
                
                {!localSelectedResident ? (
                    <div ref={dropdownRef} className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search residents by name, contact, or address..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => {
                                    if (residents.length > 0) {
                                        setShowDropdown(true);
                                    } else if (!isSearching && !hasLoaded) {
                                        fetchResidents('', 1, false);
                                    }
                                }}
                                disabled={isSubmitting}
                                className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                            )}
                            {!isSearching && searchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        
                        {showDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
                                <div className="overflow-y-auto flex-1">
                                    {isSearching && residents.length === 0 && !searchError && (
                                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin" />
                                            <p className="text-sm">Searching residents...</p>
                                        </div>
                                    )}
                                    
                                    {!isSearching && !searchError && hasLoaded && residents.length === 0 && (
                                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                                            <p className="text-sm">
                                                {searchTerm 
                                                    ? `No residents found matching "${searchTerm}"` 
                                                    : 'No eligible residents available'
                                                }
                                            </p>
                                            <p className="text-xs mt-1">
                                                {searchTerm 
                                                    ? 'Try a different name or check if the resident already holds a position' 
                                                    : 'All residents may already hold official positions'
                                                }
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
                                    
                                    {residents.map((resident) => (
                                        <div
                                            key={resident.id}
                                            className="flex items-start gap-3 px-3 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                                            onClick={() => handleResidentSelect(resident)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleResidentSelect(resident);
                                                }
                                            }}
                                        >
                                            <Avatar className="h-10 w-10 flex-shrink-0">
                                                {resident.photo_url ? (
                                                    <AvatarImage src={resident.photo_url} alt={getInitials(resident.first_name, resident.last_name)} />
                                                ) : null}
                                                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">
                                                    {getInitials(resident.first_name, resident.last_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900 dark:text-gray-200 truncate">
                                                        {formatFullName(resident)}
                                                    </span>
                                                    {resident.age && (
                                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                                            {resident.age} yrs
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {resident.contact_number && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3 flex-shrink-0" />
                                                            {resident.contact_number}
                                                        </span>
                                                    )}
                                                    {resident.email && (
                                                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                                                            <Mail className="h-3 w-3 flex-shrink-0" />
                                                            {resident.email}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    {resident.address && (
                                                        <span className="flex items-center gap-1 truncate">
                                                            <MapPin className="h-3 w-3 flex-shrink-0" />
                                                            {resident.address}
                                                        </span>
                                                    )}
                                                    {resident.purok && (
                                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                                            Purok {resident.purok.name}
                                                        </Badge>
                                                    )}
                                                    {resident.household && (
                                                        <span className="flex items-center gap-1">
                                                            <Home className="h-3 w-3 flex-shrink-0" />
                                                            HH #{resident.household.household_number}
                                                        </span>
                                                    )}
                                                </div>
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
                ) : (
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg opacity-20 group-hover:opacity-30 transition duration-300 blur"></div>
                        <div className="relative p-4 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12 flex-shrink-0">
                                    {localSelectedResident.photo_url ? (
                                        <AvatarImage src={localSelectedResident.photo_url} alt={getInitials(localSelectedResident.first_name, localSelectedResident.last_name)} />
                                    ) : null}
                                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-lg">
                                        {getInitials(localSelectedResident.first_name, localSelectedResident.last_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-200">
                                                {formatFullName(localSelectedResident)}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {localSelectedResident.age && (
                                                    <span>{localSelectedResident.age} yrs • {localSelectedResident.gender || 'N/A'}</span>
                                                )}
                                            </div>
                                            {localSelectedResident.contact_number && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {localSelectedResident.contact_number}
                                                </p>
                                            )}
                                            {localSelectedResident.address && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                                    <span className="truncate">{localSelectedResident.address}</span>
                                                </p>
                                            )}
                                            {localSelectedResident.household && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                    <Home className="h-3.5 w-3.5 flex-shrink-0" />
                                                    Household #{localSelectedResident.household.household_number}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearResident}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 flex-shrink-0 ml-2"
                                            disabled={isSubmitting}
                                        >
                                            <X className="h-4 w-4" />
                                            Change
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {errors.resident_id && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.resident_id}</p>
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Resident Requirements</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Must be a registered resident of the barangay</li>
                            <li>Must be at least 18 years old</li>
                            <li>Must have no pending legal cases</li>
                            <li>Should be in good standing within the community</li>
                            <li>Cannot already hold an active official position</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}