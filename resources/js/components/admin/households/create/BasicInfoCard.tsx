// components/admin/households/create/BasicInfoCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Home, Phone, Mail, Key, AlertCircle, Users, ArrowRight, Info, Search, Loader2, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';

interface Resident {
    age: import("react/jsx-runtime").JSX.Element;
    address: import("react/jsx-runtime").JSX.Element;
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    full_name?: string;
    household_status?: 'none' | 'member' | 'head';
    status_label?: string;
    status_color?: string;
    current_household?: {
        id: number;
        number: string;
        relationship: string;
    } | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
}

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

export default function BasicInfoCard({ data, setData, errors }: Props) {
    const [heads, setHeads] = useState<Resident[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedHeadDetails, setSelectedHeadDetails] = useState<Resident | null>(null);
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch heads from server
    const fetchHeads = useCallback(async (query: string = '', page: number = 1, append: boolean = false) => {
        setIsSearching(true);
        
        try {
            const params = new URLSearchParams({
                search: query,
                page: String(page),
                per_page: '50',
            });
            
            const response = await axios.get(`/admin/households/search-heads?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });
            
            if (response.data) {
                if (append && page > 1) {
                    setHeads(prev => {
                        const existingIds = new Set(prev.map(h => h.id));
                        const newHeads = (response.data.data || []).filter((h: Resident) => !existingIds.has(h.id));
                        return [...prev, ...newHeads];
                    });
                } else {
                    setHeads(response.data.data || []);
                }
                setPagination(response.data.pagination || null);
            }
        } catch (error: any) {
            if (axios.isCancel(error)) return;
            if (!append) setHeads([]);
        } finally {
            setIsSearching(false);
            setIsLoadingMore(false);
        }
    }, []);

    // Debounced search using useRef to persist the debounced function
    const debouncedSearchRef = useRef(
        debounce((query: string) => {
            fetchHeads(query, 1, false);
        }, 300)
    );

    // Initial load
    useEffect(() => {
        fetchHeads('', 1, false);
        
        return () => {
            debouncedSearchRef.current.cancel();
        };
    }, []);

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedSearchRef.current(value);
    };

    // Load more
    const loadMore = async () => {
        if (!pagination?.has_more || isLoadingMore) return;
        setIsLoadingMore(true);
        await fetchHeads(searchQuery, (pagination.current_page || 1) + 1, true);
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

    // Handle head selection
    const handleHeadChange = (head: Resident) => {
        const fullName = head.full_name || `${head.first_name} ${head.last_name}`.trim();
        setData('head_of_family', fullName);
        setData('head_resident_id', head.id);
        setSelectedHeadDetails(head);
        setShowDropdown(false);
        setSearchQuery(fullName);
    };

    // Clear selection
    const clearSelection = () => {
        setData('head_of_family', '');
        setData('head_resident_id', null);
        setSelectedHeadDetails(null);
        setSearchQuery('');
        fetchHeads('', 1, false);
    };

    // Get head status indicator
    const getHeadStatusIndicator = () => {
        if (!selectedHeadDetails) return null;

        if (selectedHeadDetails.household_status === 'member') {
            return {
                type: 'info',
                icon: <ArrowRight className="h-4 w-4 text-purple-500" />,
                title: 'Currently in Another Household',
                message: selectedHeadDetails.current_household 
                    ? `Currently a member of Household #${selectedHeadDetails.current_household.number} as ${selectedHeadDetails.current_household.relationship}. Will be transferred to become head of this new household.`
                    : 'Currently a member of another household. Will be transferred to become head of this new household.',
                className: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300',
                iconBg: 'bg-purple-100 dark:bg-purple-900/30'
            };
        }

        return {
            type: 'none',
            icon: <Users className="h-4 w-4 text-gray-500" />,
            title: 'Not in Any Household',
            message: 'This person is not currently part of any household.',
            className: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
            iconBg: 'bg-gray-100 dark:bg-gray-700'
        };
    };

    const statusIndicator = getHeadStatusIndicator();

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                        <Home className="h-3 w-3 text-white" />
                    </div>
                    Basic Household Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Enter the household's basic details
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="householdNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Household Number
                        </Label>
                        <Input 
                            id="householdNumber" 
                            placeholder="Auto-generated if empty"
                            value={data.household_number}
                            onChange={(e) => setData('household_number', e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                        {errors.household_number && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.household_number}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Format: HH-YYYY-XXXXX
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="registrationDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Registration Date <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            id="registrationDate" 
                            type="date" 
                            required 
                            defaultValue={new Date().toISOString().split('T')[0]}
                            readOnly
                            className="bg-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Head of Family <span className="text-red-500">*</span>
                    </Label>
                    
                    {/* Searchable Dropdown */}
                    <div ref={dropdownRef} className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search for head of family..."
                                value={searchQuery}
                                onChange={(e) => {
                                    handleSearchChange(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                            )}
                            {!isSearching && (searchQuery || selectedHeadDetails) && (
                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        
                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {heads.length === 0 && !isSearching ? (
                                    <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                                        <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                                        No available residents found
                                    </div>
                                ) : (
                                    <>
                                        {heads.map((head) => {
                                            const fullName = head.full_name || `${head.first_name} ${head.last_name}`.trim();
                                            const isMemberOfOther = head.household_status === 'member';
                                            
                                            return (
                                                <button
                                                    key={head.id}
                                                    type="button"
                                                    onClick={() => handleHeadChange(head)}
                                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                                                        selectedHeadDetails?.id === head.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="font-medium text-gray-900 dark:text-gray-200">
                                                                {fullName}
                                                            </span>
                                                            {head.age && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                                    ({head.age} yrs)
                                                                </span>
                                                            )}
                                                        </div>
                                                        {isMemberOfOther && head.current_household && (
                                                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 text-xs">
                                                                <Users className="h-3 w-3 mr-1" />
                                                                HH #{head.current_household.number}
                                                            </Badge>
                                                        )}
                                                        {!isMemberOfOther && (
                                                            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 text-xs">
                                                                Available
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {head.address && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {head.address}
                                                        </p>
                                                    )}
                                                </button>
                                            );
                                        })}
                                        
                                        {/* Load More */}
                                        {pagination?.has_more && (
                                            <div className="p-2 text-center">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={loadMore}
                                                    disabled={isLoadingMore}
                                                    className="text-xs text-blue-600 dark:text-blue-400"
                                                >
                                                    {isLoadingMore ? (
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                    ) : null}
                                                    Load More ({heads.length} of {pagination.total})
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {errors.head_resident_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.head_resident_id}</p>
                    )}
                    
                    {/* Status Indicator for Selected Head */}
                    {statusIndicator && (
                        <TooltipProvider>
                            <div className={`mt-3 p-3 rounded-lg border ${statusIndicator.className}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`h-8 w-8 rounded-full ${statusIndicator.iconBg} flex items-center justify-center flex-shrink-0`}>
                                        {statusIndicator.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-medium">{statusIndicator.title}</h4>
                                            {selectedHeadDetails?.current_household && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        <p className="font-medium mb-1">Household Details:</p>
                                                        <p>Number: #{selectedHeadDetails.current_household.number}</p>
                                                        <p>Relationship: {selectedHeadDetails.current_household.relationship}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                        <p className="text-xs mt-1 opacity-90">{statusIndicator.message}</p>
                                    </div>
                                </div>
                            </div>
                        </TooltipProvider>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Link href="/admin/residents/create" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Create a new resident
                        </Link>
                    </div>
                    
                    {/* Manual Entry Option */}
                    <div className="relative mt-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                                Or enter manually
                            </span>
                        </div>
                    </div>
                    
                    <Input 
                        value={data.head_of_family}
                        onChange={(e) => {
                            setData('head_of_family', e.target.value);
                            if (data.head_resident_id) {
                                setData('head_resident_id', null);
                                setSelectedHeadDetails(null);
                                setSearchQuery('');
                            }
                        }}
                        placeholder="Enter head of family name manually"
                        className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    {errors.head_of_family && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.head_of_family}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Manual entry is useful if the resident is not yet registered in the system.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Contact Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input 
                                id="contactNumber" 
                                placeholder="09123456789" 
                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" 
                                required 
                                value={data.contact_number}
                                onChange={(e) => setData('contact_number', e.target.value)}
                            />
                        </div>
                        {errors.contact_number && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.contact_number}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="family@example.com" 
                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" 
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                        )}
                    </div>
                </div>
                
                {/* User Account Creation */}
                <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="create_user_account" 
                            checked={data.create_user_account}
                            onCheckedChange={(checked) => setData('create_user_account', checked as boolean)}
                            className="dark:border-gray-600"
                        />
                        <Label htmlFor="create_user_account" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                Create User Account for Head
                            </div>
                        </Label>
                    </div>
                    
                    {data.create_user_account && (
                        <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                User Account Details:
                            </p>
                            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                                <li>Username: Generated from name</li>
                                <li>Initial password: Full contact number</li>
                                <li>Will be required to change password on first login</li>
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}