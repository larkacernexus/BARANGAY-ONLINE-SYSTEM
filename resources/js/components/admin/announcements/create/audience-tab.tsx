// components/admin/announcements/create/audience-tab.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    Users, 
    Search, 
    X, 
    Loader2, 
    AlertCircle,
    ChevronDown,
    CheckCircle
} from 'lucide-react';
import axios, { CancelTokenSource } from 'axios';
import debounce from 'lodash/debounce';
import type { AudienceType, Role, Purok, Household, Business, User } from '@/types/admin/announcements/announcement.types';
import { LucideIcon } from 'lucide-react';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
}

interface AudienceTabProps {
    formData: {
        audience_type: AudienceType;
        target_roles: number[];
        target_puroks: number[];
        target_households: number[];
        target_businesses: number[];
        target_users: number[];
        [key: string]: any;
    };
    errors: Record<string, string>;
    audienceOptions: Array<{ value: AudienceType; label: string }>;
    roles: Role[];
    puroks: Purok[];
    households: Household[];
    businesses: Business[];
    users: User[];
    getAudienceIcon: (type: AudienceType) => LucideIcon;
    onSelectChange: (name: string, value: string) => void;
    onMultiSelectChange: (name: string, value: number[]) => void;
    isSubmitting: boolean;
}

// Searchable list component for households, businesses, users
function SearchableList({
    selectedIds,
    onToggle,
    searchPlaceholder,
    fetchUrl,
    renderItem,
    isSubmitting,
}: {
    items: any[];
    selectedIds: number[];
    onToggle: (id: number) => void;
    searchPlaceholder: string;
    fetchUrl: string;
    renderItem: (item: any) => React.ReactNode;
    isSubmitting: boolean;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    
    const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const fetchItems = useCallback(async (query: string = '', page: number = 1, append: boolean = false) => {
        // Cancel previous request if exists
        if (cancelTokenSourceRef.current) {
            cancelTokenSourceRef.current.cancel('Operation canceled due to new request.');
        }
        
        // Create new cancel token source
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
            
            const response = await axios.get(`${fetchUrl}?${params}`, {
                cancelToken: cancelTokenSource.token,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            if (response.data) {
                const newData = response.data.data || [];
                
                if (append && page > 1) {
                    setResults(prev => {
                        const existingIds = new Set(prev.map((r: any) => r.id));
                        const unique = newData.filter((r: any) => !existingIds.has(r.id));
                        return [...prev, ...unique];
                    });
                } else {
                    setResults(newData);
                }
                
                setPagination(response.data.pagination || null);
            }
        } catch (error) {
            if (axios.isCancel(error)) return;
            setSearchError('Failed to search. Please try again.');
            if (!append) {
                setResults([]);
                setPagination(null);
            }
        } finally {
            if (!append) {
                setIsSearching(false);
            }
            setIsLoadingMore(false);
        }
    }, [fetchUrl]);

    const debouncedSearchRef = useRef(
        debounce((query: string) => {
            fetchItems(query, 1, false);
        }, 300)
    );

    useEffect(() => {
        fetchItems('', 1, false);
        return () => {
            debouncedSearchRef.current.cancel();
            if (cancelTokenSourceRef.current) {
                cancelTokenSourceRef.current.cancel('Component unmounted');
            }
        };
    }, [fetchItems]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearchRef.current(value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        fetchItems('', 1, false);
        searchInputRef.current?.focus();
    };

    const loadMore = async () => {
        if (!pagination?.has_more || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = (pagination.current_page || 1) + 1;
        await fetchItems(searchTerm, nextPage, true);
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                    ref={searchInputRef}
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
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
            
            <div className="border rounded-lg dark:border-gray-700 max-h-60 overflow-y-auto">
                {isSearching && results.length === 0 && !searchError && (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin" />
                        <p className="text-sm">Searching...</p>
                    </div>
                )}
                
                {!isSearching && results.length === 0 && !searchError && (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                        <p className="text-sm">
                            {searchTerm ? `No results found for "${searchTerm}"` : 'No results found'}
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
                            onClick={() => fetchItems(searchTerm, 1, false)}
                            className="mt-2 text-xs"
                        >
                            Try Again
                        </Button>
                    </div>
                )}
                
                <div className="divide-y dark:divide-gray-700">
                    {results.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                selectedIds.includes(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                            onClick={() => onToggle(item.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onToggle(item.id);
                                }
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(item.id)}
                                onChange={() => onToggle(item.id)}
                                className="rounded border-gray-300 dark:border-gray-600"
                                disabled={isSubmitting}
                                onClick={(e) => e.stopPropagation()}
                            />
                            {renderItem(item)}
                        </div>
                    ))}
                </div>
                
                {pagination?.has_more && (
                    <div className="p-2 text-center border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={loadMore}
                            disabled={isLoadingMore}
                            className="text-xs text-blue-600 dark:text-blue-400 w-full"
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    Load More ({results.length} of {pagination.total})
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function AudienceTab({
    formData,
    errors,
    audienceOptions,
    roles,
    puroks,
    households: initialHouseholds,
    businesses: initialBusinesses,
    users: initialUsers,
    getAudienceIcon,
    onSelectChange,
    onMultiSelectChange,
    isSubmitting
}: AudienceTabProps) {
    
    const handleRoleToggle = (roleId: number) => {
        const newValue = formData.target_roles.includes(roleId)
            ? formData.target_roles.filter((id: number) => id !== roleId)
            : [...formData.target_roles, roleId];
        onMultiSelectChange('target_roles', newValue);
    };

    const handlePurokToggle = (purokId: number) => {
        const newValue = formData.target_puroks.includes(purokId)
            ? formData.target_puroks.filter((id: number) => id !== purokId)
            : [...formData.target_puroks, purokId];
        onMultiSelectChange('target_puroks', newValue);
    };

    const handleHouseholdToggle = (householdId: number) => {
        const newValue = formData.target_households.includes(householdId)
            ? formData.target_households.filter((id: number) => id !== householdId)
            : [...formData.target_households, householdId];
        onMultiSelectChange('target_households', newValue);
    };

    const handleBusinessToggle = (businessId: number) => {
        const newValue = formData.target_businesses.includes(businessId)
            ? formData.target_businesses.filter((id: number) => id !== businessId)
            : [...formData.target_businesses, businessId];
        onMultiSelectChange('target_businesses', newValue);
    };

    const handleUserToggle = (userId: number) => {
        const newValue = formData.target_users.includes(userId)
            ? formData.target_users.filter((id: number) => id !== userId)
            : [...formData.target_users, userId];
        onMultiSelectChange('target_users', newValue);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="audience_type" className="dark:text-gray-300">
                    Audience Type <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.audience_type}
                    onValueChange={(value) => onSelectChange('audience_type', value as AudienceType)}
                    disabled={isSubmitting}
                >
                    <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                        <SelectValue placeholder="Select audience type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {audienceOptions.map((audience) => {
                            const IconComponent = getAudienceIcon(audience.value);
                            return (
                                <SelectItem key={audience.value} value={audience.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                        {audience.label}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* Role Selection - Static list (usually small) */}
            {formData.audience_type === 'roles' && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Select Roles</Label>
                    <div className="border rounded-lg dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`role-${role.id}`}
                                        checked={formData.target_roles.includes(role.id)}
                                        onChange={() => handleRoleToggle(role.id)}
                                        className="rounded border-gray-300 dark:border-gray-600"
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor={`role-${role.id}`} className="cursor-pointer dark:text-gray-300">
                                        {role.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Purok Selection - Static list (usually small) */}
            {formData.audience_type === 'puroks' && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Select Puroks</Label>
                    <div className="border rounded-lg dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                            {puroks.map((purok) => (
                                <div key={purok.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`purok-${purok.id}`}
                                        checked={formData.target_puroks.includes(purok.id)}
                                        onChange={() => handlePurokToggle(purok.id)}
                                        className="rounded border-gray-300 dark:border-gray-600"
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor={`purok-${purok.id}`} className="cursor-pointer dark:text-gray-300">
                                        Purok {purok.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Household Selection - Server-side search */}
            {(formData.audience_type === 'households' || formData.audience_type === 'household_members') && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">
                        Select Households
                        {formData.audience_type === 'household_members' && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                (All members of selected households)
                            </span>
                        )}
                    </Label>
                    <SearchableList
                        items={initialHouseholds}
                        selectedIds={formData.target_households}
                        onToggle={handleHouseholdToggle}
                        searchPlaceholder="Search households by number or purok..."
                        fetchUrl="/admin/announcements/search-households"
                        renderItem={(household) => (
                            <Label className="cursor-pointer dark:text-gray-300 flex-1">
                                {household.household_number}
                                {household.purok && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                        (Purok {household.purok.name})
                                    </span>
                                )}
                            </Label>
                        )}
                        isSubmitting={isSubmitting}
                    />
                </div>
            )}

            {/* Business Selection - Server-side search */}
            {formData.audience_type === 'businesses' && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Select Businesses</Label>
                    <SearchableList
                        items={initialBusinesses}
                        selectedIds={formData.target_businesses}
                        onToggle={handleBusinessToggle}
                        searchPlaceholder="Search businesses by name or owner..."
                        fetchUrl="/admin/announcements/search-businesses"
                        renderItem={(business) => (
                            <Label className="cursor-pointer dark:text-gray-300 flex-1">
                                {business.business_name}
                                {business.owner_name && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                        ({business.owner_name})
                                    </span>
                                )}
                            </Label>
                        )}
                        isSubmitting={isSubmitting}
                    />
                </div>
            )}

            {/* User Selection - Server-side search */}
            {formData.audience_type === 'specific_users' && (
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Select Users</Label>
                    <SearchableList
                        items={initialUsers}
                        selectedIds={formData.target_users}
                        onToggle={handleUserToggle}
                        searchPlaceholder="Search users by name or email..."
                        fetchUrl="/admin/announcements/search-users"
                        renderItem={(user) => (
                            <Label className="cursor-pointer dark:text-gray-300 flex-1">
                                {user.first_name} {user.last_name}
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                    ({user.email})
                                </span>
                            </Label>
                        )}
                        isSubmitting={isSubmitting}
                    />
                </div>
            )}

            {/* Selection Summary */}
            {(formData.audience_type !== 'all' && (
                formData.target_roles.length > 0 ||
                formData.target_puroks.length > 0 ||
                formData.target_households.length > 0 ||
                formData.target_businesses.length > 0 ||
                formData.target_users.length > 0
            )) && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="text-sm text-green-700 dark:text-green-300">
                            <span className="font-medium">Targeted Audience:</span>{' '}
                            {formData.target_roles.length > 0 && `${formData.target_roles.length} role(s)`}
                            {formData.target_puroks.length > 0 && ` ${formData.target_puroks.length} purok(s)`}
                            {formData.target_households.length > 0 && ` ${formData.target_households.length} household(s)`}
                            {formData.target_businesses.length > 0 && ` ${formData.target_businesses.length} business(es)`}
                            {formData.target_users.length > 0 && ` ${formData.target_users.length} user(s)`}
                            {' will receive this announcement'}
                        </div>
                    </div>
                </div>
            )}

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Audience Targeting Guide</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li><strong>All Users:</strong> Announcement visible to everyone</li>
                            <li><strong>Roles:</strong> Target specific user roles (e.g., Admin, Staff)</li>
                            <li><strong>Puroks:</strong> Target residents in specific puroks</li>
                            <li><strong>Households:</strong> Target specific households</li>
                            <li><strong>Household Members:</strong> Target all members of selected households</li>
                            <li><strong>Businesses:</strong> Target registered business owners</li>
                            <li><strong>Specific Users:</strong> Target individual users by name</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}