// components/admin/puroks/create/leadership-tab.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import axios, { CancelTokenSource } from 'axios';
import debounce from 'lodash/debounce';
import type { Resident, PaginationMeta } from '@/types/admin/puroks/purok';

interface LeadershipTabProps {
    formData: any;
    errors: Record<string, string>;
    onLeaderSelect: (leaderId: string) => void;
    isSubmitting: boolean;
}

export function LeadershipTab({ 
    formData, 
    errors, 
    onLeaderSelect, 
    isSubmitting 
}: LeadershipTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [residents, setResidents] = useState<Resident[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedLeader, setSelectedLeader] = useState<Resident | null>(null);
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

    // Fetch residents using Axios CancelToken
    const fetchResidents = useCallback(async (query: string = '', page: number = 1, append: boolean = false) => {
        // Cancel previous request if exists
        if (cancelTokenSourceRef.current) {
            cancelTokenSourceRef.current.cancel('Operation canceled due to new request.');
        }
        
        // Create new cancel token source
        const cancelTokenSource = axios.CancelToken.source();
        cancelTokenSourceRef.current = cancelTokenSource;
        
        if (!append) {
            setIsSearching(true);
        }
        setSearchError(null);
        
        try {
            const params = new URLSearchParams({
                search: query,
                page: String(page),
                per_page: '50',
            });
            
            const response = await axios.get(`/admin/puroks/search-residents?${params}`, {
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
        }
    }, []);

    // Debounced search
    const debouncedSearchRef = useRef(
        debounce((query: string) => {
            fetchResidents(query, 1, false);
        }, 300)
    );

    // Initial load and cleanup
    useEffect(() => {
        if (!selectedLeader) {
            fetchResidents('', 1, false);
        }
        return () => {
            debouncedSearchRef.current.cancel();
            if (cancelTokenSourceRef.current) {
                cancelTokenSourceRef.current.cancel('Component unmounted');
            }
        };
    }, [selectedLeader, fetchResidents]);

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

    // Handle search
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearchRef.current(value);
        if (value.trim()) {
            setShowDropdown(true);
        }
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchTerm('');
        setShowDropdown(false);
        fetchResidents('', 1, false);
        searchInputRef.current?.focus();
    };

    // Load more
    const loadMore = async () => {
        if (!pagination?.has_more || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = (pagination.current_page || 1) + 1;
        await fetchResidents(searchTerm, nextPage, true);
    };

    // Handle leader selection
    const handleLeaderSelect = (resident: Resident) => {
        onLeaderSelect(resident.id.toString());
        setSelectedLeader(resident);
        setShowDropdown(false);
        setSearchTerm('');
    };

    // Clear leader
    const clearLeader = () => {
        onLeaderSelect('');
        setSelectedLeader(null);
        setSearchTerm('');
        fetchResidents('', 1, false);
    };

    // Get initials
    const getInitials = (firstName: string, lastName: string) => {
        if (!firstName || !lastName) return '?';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Format full name
    const formatFullName = (resident: Resident) => {
        const lastName = resident.last_name || '';
        const firstName = resident.first_name || '';
        const middleName = resident.middle_name ? ` ${resident.middle_name.charAt(0)}.` : '';
        return `${lastName}, ${firstName}${middleName}`;
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="dark:text-gray-300">Purok Leader</Label>
                
                {!selectedLeader ? (
                    <div ref={dropdownRef} className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search residents by name, contact, or address..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => { if (residents.length > 0) setShowDropdown(true); }}
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
                        
                        {/* Dropdown */}
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
                                                {searchTerm ? `No residents found matching "${searchTerm}"` : 'No residents available'}
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
                                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                                            onClick={() => handleLeaderSelect(resident)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleLeaderSelect(resident);
                                                }
                                            }}
                                        >
                                            <Avatar className="h-10 w-10 flex-shrink-0">
                                                {resident.photo_url ? (
                                                    <AvatarImage src={resident.photo_url} alt={getInitials(resident.first_name, resident.last_name)} />
                                                ) : null}
                                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">
                                                    {getInitials(resident.first_name, resident.last_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-gray-200 truncate">
                                                    {formatFullName(resident)}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {resident.contact_number && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {resident.contact_number}
                                                        </span>
                                                    )}
                                                    {resident.email && (
                                                        <span className="flex items-center gap-1 truncate">
                                                            <Mail className="h-3 w-3" />
                                                            {resident.email}
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
                                            {resident.purok && (
                                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                                    Purok {resident.purok}
                                                </Badge>
                                            )}
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
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg opacity-20 group-hover:opacity-30 transition duration-300 blur"></div>
                        <div className="relative p-4 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12 flex-shrink-0">
                                    {selectedLeader.photo_url ? (
                                        <AvatarImage src={selectedLeader.photo_url} alt={getInitials(selectedLeader.first_name, selectedLeader.last_name)} />
                                    ) : null}
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-lg">
                                        {getInitials(selectedLeader.first_name, selectedLeader.last_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium dark:text-gray-200">
                                                {formatFullName(selectedLeader)}
                                            </p>
                                            {selectedLeader.contact_number && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {selectedLeader.contact_number}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearLeader}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 flex-shrink-0"
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
                
                {errors.leader_id && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.leader_id}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    The purok leader will be responsible for coordinating with barangay officials and organizing community activities.
                </p>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex-1">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Leadership Role</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                        <li>Representing the purok in barangay meetings</li>
                        <li>Organizing community activities and clean-ups</li>
                        <li>Acting as a liaison between residents and barangay officials</li>
                        <li>Maintaining peace and order within the purok</li>
                        <li>Reporting concerns and issues to the barangay</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}