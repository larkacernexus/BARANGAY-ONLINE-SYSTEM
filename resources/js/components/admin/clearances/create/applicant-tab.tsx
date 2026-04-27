// components/admin/clearances/create/applicant-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Search, 
    X, 
    User, 
    Home, 
    Building, 
    Info, 
    Loader2, 
    AlertCircle,
    ChevronDown,
    Users,
    Phone,
    MapPin,
    Mail,
    Calendar
} from 'lucide-react';
import { JSX, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import type { Resident, Household, Business } from '@/types/admin/clearances/clearance';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
}

interface ApplicantTabProps {
    payerType: 'resident' | 'household' | 'business';
    searchTerm: string;
    selectedPayerDisplay: { name: string; details: string; extra: string | null } | null;
    filteredResidents: Resident[];
    filteredHouseholds: Household[];
    filteredBusinesses: Business[];
    errors: Record<string, string>;
    isLocked?: boolean;
    isSubmitting: boolean;
    onPayerTypeChange: (type: 'resident' | 'household' | 'business') => void;
    onSearchChange: (value: string) => void;
    onClearSearch: () => void;
    onSelectResident: (resident: Resident) => void;
    onSelectHousehold: (household: Household) => void;
    onSelectBusiness: (business: Business) => void;
    onChangePayer: () => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    getPayerIcon: (type: string) => JSX.Element;
    formData: any;
}

export function ApplicantTab({
    payerType,
    searchTerm: externalSearchTerm,
    selectedPayerDisplay,
    filteredResidents: externalResidents,
    filteredHouseholds: externalHouseholds,
    filteredBusinesses: externalBusinesses,
    errors,
    isLocked = false,
    isSubmitting,
    onPayerTypeChange,
    onSearchChange,
    onClearSearch: externalClearSearch,
    onSelectResident,
    onSelectHousehold,
    onSelectBusiness,
    onChangePayer,
    onInputChange,
    getPayerIcon,
    formData
}: ApplicantTabProps) {
    // Internal state for server-side search
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [residents, setResidents] = useState<Resident[]>([]);
    const [households, setHouseholds] = useState<Household[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const hasSelection = !!selectedPayerDisplay;

    // Fetch data based on payer type
    const fetchData = useCallback(async (query: string = '', page: number = 1, append: boolean = false) => {
        if (isLocked) return;
        
        setIsSearching(true);
        setSearchError(null);
        
        try {
            let endpoint = '';
            if (payerType === 'resident') {
                endpoint = '/admin/clearances/search-residents';
            } else if (payerType === 'household') {
                endpoint = '/admin/clearances/search-households';
            } else {
                endpoint = '/admin/clearances/search-businesses';
            }
            
            const params = new URLSearchParams({
                search: query,
                page: String(page),
                per_page: '50',
            });
            
            const response = await axios.get(`${endpoint}?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            if (response.data) {
                const newData = response.data.data || [];
                
                if (append && page > 1) {
                    if (payerType === 'resident') {
                        setResidents(prev => {
                            const existingIds = new Set(prev.map(r => r.id));
                            const unique = newData.filter((r: Resident) => !existingIds.has(r.id));
                            return [...prev, ...unique];
                        });
                    } else if (payerType === 'household') {
                        setHouseholds(prev => {
                            const existingIds = new Set(prev.map(h => h.id));
                            const unique = newData.filter((h: Household) => !existingIds.has(h.id));
                            return [...prev, ...unique];
                        });
                    } else {
                        setBusinesses(prev => {
                            const existingIds = new Set(prev.map(b => b.id));
                            const unique = newData.filter((b: Business) => !existingIds.has(b.id));
                            return [...prev, ...unique];
                        });
                    }
                } else {
                    if (payerType === 'resident') {
                        setResidents(newData);
                    } else if (payerType === 'household') {
                        setHouseholds(newData);
                    } else {
                        setBusinesses(newData);
                    }
                }
                
                setPagination(response.data.pagination || null);
            }
        } catch (error: any) {
            if (axios.isCancel(error)) return;
            console.error('Search error:', error);
            setSearchError('Failed to search. Please try again.');
            if (!append) {
                if (payerType === 'resident') setResidents([]);
                else if (payerType === 'household') setHouseholds([]);
                else setBusinesses([]);
            }
        } finally {
            setIsSearching(false);
            setIsLoadingMore(false);
        }
    }, [payerType, isLocked]);

    // Debounced search
    const debouncedSearchRef = useRef(
        debounce((query: string) => {
            fetchData(query, 1, false);
        }, 300)
    );

    // Initial load and when payer type changes
    useEffect(() => {
        if (!hasSelection) {
            fetchData('', 1, false);
        }
        
        return () => {
            debouncedSearchRef.current.cancel();
        };
    }, [payerType, hasSelection]);

    // Sync external search term
    useEffect(() => {
        if (externalSearchTerm !== localSearchTerm) {
            setLocalSearchTerm(externalSearchTerm);
        }
    }, [externalSearchTerm]);

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setLocalSearchTerm(value);
        onSearchChange(value);
        debouncedSearchRef.current(value);
        if (value.trim()) {
            setShowDropdown(true);
        }
    };

    // Clear search
    const handleClearSearch = () => {
        setLocalSearchTerm('');
        onSearchChange('');
        setShowDropdown(false);
        fetchData('', 1, false);
        
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // Load more
    const loadMore = async () => {
        if (!pagination?.has_more || isLoadingMore || isLocked) return;
        setIsLoadingMore(true);
        await fetchData(localSearchTerm, (pagination.current_page || 1) + 1, true);
    };

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

    // Handle select with feedback
    const handleSelectResident = (resident: Resident) => {
        onSelectResident(resident);
        setShowDropdown(false);
    };

    const handleSelectHousehold = (household: Household) => {
        onSelectHousehold(household);
        setShowDropdown(false);
    };

    const handleSelectBusiness = (business: Business) => {
        onSelectBusiness(business);
        setShowDropdown(false);
    };

    // Get current list based on payer type
    const currentList = payerType === 'resident' ? residents : 
                       payerType === 'household' ? households : 
                       businesses;

    // Get placeholder text based on payer type
    const getSearchPlaceholder = () => {
        switch (payerType) {
            case 'resident':
                return 'Search residents by name, address, or contact number...';
            case 'household':
                return 'Search households by number, head name, or address...';
            case 'business':
                return 'Search businesses by name, owner, or address...';
        }
    };

    return (
        <div className="space-y-4">
            {/* Payer Type Selection */}
            <div className="space-y-2">
                <Label className="dark:text-gray-300">
                    Payer Type <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={payerType === 'resident' ? 'default' : 'outline'}
                        onClick={() => onPayerTypeChange('resident')}
                        disabled={isLocked || isSubmitting}
                        className={`flex-1 ${
                            payerType === 'resident' 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-700' 
                                : 'dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800'
                        }`}
                    >
                        <User className="h-4 w-4 mr-2" />
                        Resident
                    </Button>
                    <Button
                        type="button"
                        variant={payerType === 'household' ? 'default' : 'outline'}
                        onClick={() => onPayerTypeChange('household')}
                        disabled={isLocked || isSubmitting}
                        className={`flex-1 ${
                            payerType === 'household' 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-700' 
                                : 'dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800'
                        }`}
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Household
                    </Button>
                    <Button
                        type="button"
                        variant={payerType === 'business' ? 'default' : 'outline'}
                        onClick={() => onPayerTypeChange('business')}
                        disabled={isLocked || isSubmitting}
                        className={`flex-1 ${
                            payerType === 'business' 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-700' 
                                : 'dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800'
                        }`}
                    >
                        <Building className="h-4 w-4 mr-2" />
                        Business
                    </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select who will be paying for this clearance
                </p>
            </div>

            {/* Search Section - Only show when no selection */}
            {!hasSelection && (
                <div className="space-y-2">
                    <Label htmlFor="payer-search" className="dark:text-gray-300">
                        Search {payerType === 'resident' ? 'Resident' : payerType === 'household' ? 'Household' : 'Business'} 
                        <span className="text-red-500"> *</span>
                    </Label>
                    <div ref={dropdownRef} className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                ref={searchInputRef}
                                id="payer-search"
                                placeholder={getSearchPlaceholder()}
                                className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                value={localSearchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => {
                                    if (currentList.length > 0) setShowDropdown(true);
                                }}
                                disabled={isLocked || isSubmitting}
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                            )}
                            {!isSearching && localSearchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    disabled={isLocked || isSubmitting}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        
                        {/* Dropdown Results */}
                        {showDropdown && !hasSelection && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                {currentList.length === 0 && !isSearching && !searchError && (
                                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                                        <p className="text-sm">
                                            {localSearchTerm 
                                                ? `No ${payerType}s found matching "${localSearchTerm}"`
                                                : `Start typing to search for ${payerType}s`
                                            }
                                        </p>
                                        <p className="text-xs mt-1">
                                            {localSearchTerm 
                                                ? 'Try a different search term or check spelling'
                                                : 'Search by name, address, or contact number'
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
                                            onClick={() => fetchData(localSearchTerm, 1, false)}
                                            className="mt-2"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                )}
                                
                                {/* Resident Results */}
                                {payerType === 'resident' && residents.map((resident) => (
                                    <button
                                        key={resident.id}
                                        type="button"
                                        onClick={() => handleSelectResident(resident)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {resident.photo_path ? (
                                                    <img 
                                                        src={resident.photo_path} 
                                                        alt={resident.full_name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-gray-200">
                                                        {resident.full_name}
                                                    </span>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {resident.contact_number && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {resident.contact_number}
                                                            </span>
                                                        )}
                                                        {resident.email && (
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {resident.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {resident.purok && (
                                                <Badge variant="outline" className="text-xs">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    Purok {resident.purok}
                                                </Badge>
                                            )}
                                        </div>
                                        {resident.address && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-[52px]">
                                                {resident.address}
                                            </p>
                                        )}
                                    </button>
                                ))}
                                
                                {/* Household Results */}
                                {payerType === 'household' && households.map((household) => (
                                    <button
                                        key={household.id}
                                        type="button"
                                        onClick={() => handleSelectHousehold(household)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                                    {household.head_of_family}
                                                </span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    #{household.household_number}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {household.purok && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        Purok {household.purok}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {household.total_members} members
                                                </Badge>
                                            </div>
                                        </div>
                                        {household.address && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {household.address}
                                            </p>
                                        )}
                                    </button>
                                ))}
                                
                                {/* Business Results */}
                                {payerType === 'business' && businesses.map((business) => (
                                    <button
                                        key={business.id}
                                        type="button"
                                        onClick={() => handleSelectBusiness(business)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                                    {business.business_name}
                                                </span>
                                                {business.business_permit_number && (
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                        Permit: {business.business_permit_number}
                                                    </Badge>
                                                )}
                                            </div>
                                            {business.purok && (
                                                <Badge variant="outline" className="text-xs">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    Purok {business.purok}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Owner: {business.owner_name}
                                            {business.contact_number && ` • ${business.contact_number}`}
                                        </div>
                                        {business.address && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {business.address}
                                            </p>
                                        )}
                                    </button>
                                ))}
                                
                                {/* Load More Button */}
                                {pagination?.has_more && (
                                    <div className="p-3 text-center border-t border-gray-100 dark:border-gray-800">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={loadMore}
                                            disabled={isLoadingMore}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                        >
                                            {isLoadingMore ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="h-3 w-3 mr-1" />
                                                    Load More ({currentList.length} of {pagination.total})
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {errors.payer_id && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.payer_id}</p>
                    )}
                </div>
            )}

            {/* Selected Payer Display */}
            {hasSelection && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                            {getPayerIcon(payerType)}
                        </div>
                        <div>
                            <div className="font-medium text-lg dark:text-gray-200">
                                {selectedPayerDisplay.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedPayerDisplay.details}
                            </div>
                            {selectedPayerDisplay.extra && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                    {selectedPayerDisplay.extra}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onChangePayer}
                        disabled={isLocked || isSubmitting}
                        className="dark:text-gray-400 dark:hover:text-white"
                    >
                        Change
                    </Button>
                </div>
            )}

            {errors.payer_id && hasSelection && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.payer_id}</p>
            )}

            {/* Remarks Card */}
            <div className="pt-4">
                <div className="space-y-2">
                    <Label htmlFor="remarks" className="dark:text-gray-300">Remarks/Notes</Label>
                    <Textarea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks || ''}
                        onChange={onInputChange}
                        placeholder="Additional notes or special conditions..."
                        rows={3}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        disabled={isLocked || isSubmitting}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Optional: Add any internal notes about this request
                    </p>
                </div>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                            👤 Applicant Information
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Select the correct payer type (Resident, Household, or Business)</li>
                            <li>Search by name, address, or contact number</li>
                            <li>Verify all information before proceeding</li>
                            <li>Add remarks for special instructions or notes</li>
                            <li>Business applicants need valid business permit</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}