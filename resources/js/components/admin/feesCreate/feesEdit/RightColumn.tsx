// components/admin/feesEdit/RightColumn.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building, Home, Phone, MapPin, FileText, Info, Search, Award, Calendar } from 'lucide-react';
import { FeeFormData, Resident, Household, Privilege } from '@/types/fees';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RightColumnProps {
    data: FeeFormData;
    setData: (key: keyof FeeFormData, value: any) => void;
    selectedPayer: Resident | Household | null;
    residents: Resident[];
    households: Household[];
    puroks: string[];
    allPrivileges?: Privilege[];
    errors?: Record<string, string>;
    handlePayerTypeChange: (payerType: string) => void;
    handleResidentSelect: (residentId: string) => void;
    handleHouseholdSelect: (householdId: string) => void;
}

const payerTypes = [
    { value: 'resident', icon: User, label: 'Resident' },
    { value: 'business', icon: Building, label: 'Business' },
    { value: 'household', icon: Home, label: 'Household' },
    { value: 'visitor', icon: User, label: 'Visitor' },
    { value: 'other', icon: User, label: 'Other' },
];

export default function RightColumn({
    data,
    setData,
    selectedPayer,
    residents,
    households,
    puroks,
    allPrivileges = [],
    errors,
    handlePayerTypeChange,
    handleResidentSelect,
    handleHouseholdSelect,
}: RightColumnProps) {
    const [residentSearch, setResidentSearch] = useState('');
    const [householdSearch, setHouseholdSearch] = useState('');
    const [showResidentDropdown, setShowResidentDropdown] = useState(false);
    const [showHouseholdDropdown, setShowHouseholdDropdown] = useState(false);
    
    // Refs for detecting clicks outside
    const residentDropdownRef = useRef<HTMLDivElement>(null);
    const householdDropdownRef = useRef<HTMLDivElement>(null);
    const residentInputRef = useRef<HTMLInputElement>(null);
    const householdInputRef = useRef<HTMLInputElement>(null);

    const safeString = (value: any): string => {
        if (value === null || value === undefined || value === 'null') return '';
        return String(value);
    };

    const parseNumber = (value: any): number => {
        if (value === null || value === undefined || value === '' || value === 'null') return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    // Filter residents based on search
    const filteredResidents = useMemo(() => {
        if (!residentSearch.trim()) return residents;
        
        const searchLower = residentSearch.toLowerCase();
        return residents.filter(resident => 
            resident.full_name.toLowerCase().includes(searchLower) ||
            (resident.purok && resident.purok.toLowerCase().includes(searchLower)) ||
            (resident.address && resident.address.toLowerCase().includes(searchLower))
        );
    }, [residents, residentSearch]);

    // Filter households based on search
    const filteredHouseholds = useMemo(() => {
        if (!householdSearch.trim()) return households;
        
        const searchLower = householdSearch.toLowerCase();
        return households.filter(household => 
            household.name.toLowerCase().includes(searchLower) ||
            (household.purok && household.purok.toLowerCase().includes(searchLower)) ||
            (household.address && household.address.toLowerCase().includes(searchLower))
        );
    }, [households, householdSearch]);

    // Handle click outside to close dropdowns
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (residentDropdownRef.current && !residentDropdownRef.current.contains(event.target as Node) &&
                residentInputRef.current && !residentInputRef.current.contains(event.target as Node)) {
                setShowResidentDropdown(false);
            }
            if (householdDropdownRef.current && !householdDropdownRef.current.contains(event.target as Node) &&
                householdInputRef.current && !householdInputRef.current.contains(event.target as Node)) {
                setShowHouseholdDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Get resident privileges badges
    const getResidentBadges = (resident: Resident) => {
        const badges = [];
        
        if (resident.privileges && resident.privileges.length > 0) {
            resident.privileges.forEach((rp: any) => {
                badges.push({
                    code: rp.code,
                    label: rp.name,
                    icon: getPrivilegeIcon(rp.code),
                    color: getPrivilegeColor(rp.code),
                    id_number: rp.id_number,
                    status: rp.status
                });
            });
        }
        
        return badges;
    };

    // Helper to get privilege icon
    const getPrivilegeIcon = (code: string): string => {
        const icons: Record<string, string> = {
            'SC': '👴',
            'OSP': '👴',
            'PWD': '♿',
            'SP': '👨‍👧',
            'IND': '🏠',
            '4PS': '📦',
            'IP': '🌿',
            'FRM': '🌾',
            'FSH': '🎣',
            'OFW': '✈️',
            'SCH': '📚',
            'UNE': '💼',
        };
        return icons[code] || '🎫';
    };

    // Helper to get privilege color
    const getPrivilegeColor = (code: string): string => {
        const colors: Record<string, string> = {
            'SC': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'OSP': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'PWD': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
            'SP': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'IND': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
            '4PS': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
            'IP': 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
            'FRM': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'FSH': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
            'OFW': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
            'SCH': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
            'UNE': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
        };
        return colors[code] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    };

    // Handle resident selection
    const handleResidentSelectWithSearch = (residentId: string) => {
        console.log('Selected resident ID:', residentId);
        
        const selected = residents.find(r => r.id === residentId);
        if (selected) {
            setResidentSearch(selected.full_name);
            setData('resident_id', residentId);
            setData('payer_name', selected.full_name);
            setData('contact_number', selected.contact_number || '');
            setData('purok', selected.purok || '');
            setData('address', selected.address || '');
            setData('payer_type', 'resident');
            
            handleResidentSelect(residentId);
        } else {
            setData('resident_id', '');
            setData('payer_name', '');
            setData('contact_number', '');
            setData('purok', '');
            setData('address', '');
            handleResidentSelect(residentId);
        }
        
        setShowResidentDropdown(false);
    };

    // Handle household selection
    const handleHouseholdSelectWithSearch = (householdId: string) => {
        console.log('Selected household ID:', householdId);
        
        const selected = households.find(h => h.id === householdId);
        if (selected) {
            setHouseholdSearch(selected.name);
            setData('household_id', householdId);
            setData('payer_name', selected.name);
            setData('contact_number', selected.contact_number || '');
            setData('purok', selected.purok || '');
            setData('address', selected.address || '');
            setData('payer_type', 'household');
            
            handleHouseholdSelect(householdId);
        } else {
            setData('household_id', '');
            setData('payer_name', '');
            setData('contact_number', '');
            setData('purok', '');
            setData('address', '');
            handleHouseholdSelect(householdId);
        }
        
        setShowHouseholdDropdown(false);
    };

    // Handle clearing resident selection
    const handleClearResident = () => {
        setResidentSearch('');
        setShowResidentDropdown(false);
        setData('resident_id', '');
        setData('payer_name', '');
        setData('contact_number', '');
        setData('purok', '');
        setData('address', '');
        handleResidentSelect('');
    };

    // Handle clearing household selection
    const handleClearHousehold = () => {
        setHouseholdSearch('');
        setShowHouseholdDropdown(false);
        setData('household_id', '');
        setData('payer_name', '');
        setData('contact_number', '');
        setData('purok', '');
        setData('address', '');
        handleHouseholdSelect('');
    };

    // Update search input when selectedPayer changes
    useEffect(() => {
        if (data.payer_type === 'resident' && selectedPayer && 'full_name' in selectedPayer) {
            setResidentSearch(selectedPayer.full_name);
        } else if (data.payer_type === 'resident' && !selectedPayer) {
            setResidentSearch('');
        }
    }, [selectedPayer, data.payer_type]);

    useEffect(() => {
        if (data.payer_type === 'household' && selectedPayer && 'name' in selectedPayer) {
            setHouseholdSearch(selectedPayer.name);
        } else if (data.payer_type === 'household' && !selectedPayer) {
            setHouseholdSearch('');
        }
    }, [selectedPayer, data.payer_type]);

    const residentBadges = selectedPayer && 'full_name' in selectedPayer 
        ? getResidentBadges(selectedPayer as Resident)
        : [];

    return (
        <div className="space-y-6">
            {/* Payer Information Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                            <User className="h-3 w-3 text-white" />
                        </div>
                        Payer Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Review and update payer details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <>
                        <div className="space-y-4">
                            <div>
                                <Label className="dark:text-gray-300">Payer Type *</Label>
                                <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                                    {payerTypes.map((type) => {
                                        const IconComponent = type.icon;
                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => {
                                                    handlePayerTypeChange(type.value);
                                                    if (type.value !== 'resident') {
                                                        handleClearResident();
                                                    }
                                                    if (type.value !== 'household') {
                                                        handleClearHousehold();
                                                    }
                                                }}
                                                className={`flex flex-col items-center justify-center rounded-md border p-3 transition-colors ${
                                                    data.payer_type === type.value
                                                        ? 'border-primary bg-primary/10 text-primary dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                                                }`}
                                            >
                                                <IconComponent className="mb-1 h-5 w-5 dark:text-gray-400" />
                                                <span className="text-xs font-medium dark:text-gray-300">
                                                    {type.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors?.payer_type && (
                                    <p className="text-sm text-red-500 dark:text-red-400">
                                        {errors.payer_type}
                                    </p>
                                )}
                            </div>

                            {/* Resident Selection with Search */}
                            {data.payer_type === 'resident' && (
                                <div className="space-y-2">
                                    <Label htmlFor="resident_search" className="dark:text-gray-300">
                                        Select Resident *
                                    </Label>
                                    
                                    {/* Search input */}
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <Input
                                            ref={residentInputRef}
                                            id="resident_search"
                                            type="text"
                                            placeholder="Search residents by name or purok..."
                                            value={residentSearch}
                                            onChange={(e) => {
                                                setResidentSearch(e.target.value);
                                                setShowResidentDropdown(true);
                                            }}
                                            onFocus={() => setShowResidentDropdown(true)}
                                            className="pl-8 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            autoComplete="off"
                                        />
                                        {residentSearch && (
                                            <button
                                                type="button"
                                                onClick={handleClearResident}
                                                className="absolute right-2 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>

                                    {/* Search results dropdown */}
                                    {showResidentDropdown && (
                                        <div 
                                            ref={residentDropdownRef}
                                            className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg"
                                            style={{ width: 'calc(100% - 2rem)' }}
                                        >
                                            {filteredResidents.length > 0 ? (
                                                filteredResidents.map((resident) => {
                                                    const badges = getResidentBadges(resident);
                                                    return (
                                                        <button
                                                            key={resident.id}
                                                            type="button"
                                                            onClick={() => handleResidentSelectWithSearch(resident.id)}
                                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none border-b dark:border-gray-700 last:border-b-0"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className="font-medium dark:text-gray-200">{resident.full_name}</span>
                                                                    {resident.purok && (
                                                                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                                            (Purok {resident.purok})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    {badges.slice(0, 3).map((badge, idx) => (
                                                                        <TooltipProvider key={idx}>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <span className="text-sm cursor-help" title={badge.label}>
                                                                                        {badge.icon}
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>{badge.label}</p>
                                                                                    {badge.id_number && <p className="text-xs">ID: {badge.id_number}</p>}
                                                                                    {badge.status === 'expiring_soon' && (
                                                                                        <p className="text-xs text-yellow-500">Expiring soon</p>
                                                                                    )}
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {resident.address && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {resident.address}
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                    No residents found matching "{residentSearch}"
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Hidden select for form submission */}
                                    <select
                                        id="resident_id"
                                        name="resident_id"
                                        required={data.payer_type === 'resident'}
                                        className="sr-only"
                                        value={safeString(data.resident_id)}
                                        onChange={(e) => handleResidentSelectWithSearch(e.target.value)}
                                        tabIndex={-1}
                                        aria-hidden="true"
                                    >
                                        <option value="">Select Resident</option>
                                        {residents.map((resident) => (
                                            <option key={resident.id} value={resident.id}>
                                                {resident.full_name}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Selected resident details */}
                                    {selectedPayer && 'full_name' in selectedPayer && data.resident_id && (
                                        <div className="mt-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                                                <span className="text-sm font-medium text-green-700 dark:text-green-400">Selected:</span>
                                            </div>
                                            <div className="mt-1 font-medium dark:text-gray-200">{selectedPayer.full_name}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {selectedPayer.purok && `Purok ${selectedPayer.purok}`}
                                                {selectedPayer.address && ` • ${selectedPayer.address}`}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Household Selection with Search */}
                            {data.payer_type === 'household' && (
                                <div className="space-y-2">
                                    <Label htmlFor="household_search" className="dark:text-gray-300">
                                        Select Household *
                                    </Label>
                                    
                                    {/* Search input */}
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <Input
                                            ref={householdInputRef}
                                            id="household_search"
                                            type="text"
                                            placeholder="Search households by name or purok..."
                                            value={householdSearch}
                                            onChange={(e) => {
                                                setHouseholdSearch(e.target.value);
                                                setShowHouseholdDropdown(true);
                                            }}
                                            onFocus={() => setShowHouseholdDropdown(true)}
                                            className="pl-8 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            autoComplete="off"
                                        />
                                        {householdSearch && (
                                            <button
                                                type="button"
                                                onClick={handleClearHousehold}
                                                className="absolute right-2 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>

                                    {/* Search results dropdown */}
                                    {showHouseholdDropdown && (
                                        <div 
                                            ref={householdDropdownRef}
                                            className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg"
                                            style={{ width: 'calc(100% - 2rem)' }}
                                        >
                                            {filteredHouseholds.length > 0 ? (
                                                filteredHouseholds.map((household) => (
                                                    <button
                                                        key={household.id}
                                                        type="button"
                                                        onClick={() => handleHouseholdSelectWithSearch(household.id)}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none border-b dark:border-gray-700 last:border-b-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="font-medium dark:text-gray-200">{household.name}</span>
                                                                {household.purok && (
                                                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                                        (Purok {household.purok})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {household.member_count && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {household.member_count} members
                                                                </span>
                                                            )}
                                                        </div>
                                                        {household.address && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {household.address}
                                                            </div>
                                                        )}
                                                        {/* Show head's privileges if any */}
                                                        {household.head_privileges && household.head_privileges.length > 0 && (
                                                            <div className="mt-1 flex gap-1">
                                                                {household.head_privileges.slice(0, 2).map((p: any, idx: number) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                                                        {p.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                    No households found matching "{householdSearch}"
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Hidden select for form submission */}
                                    <select
                                        id="household_id"
                                        name="household_id"
                                        required={data.payer_type === 'household'}
                                        className="sr-only"
                                        value={safeString(data.household_id)}
                                        onChange={(e) => handleHouseholdSelectWithSearch(e.target.value)}
                                        tabIndex={-1}
                                        aria-hidden="true"
                                    >
                                        <option value="">Select Household</option>
                                        {households.map((household) => (
                                            <option key={household.id} value={household.id}>
                                                {household.name}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Selected household details */}
                                    {selectedPayer && 'name' in selectedPayer && data.household_id && (
                                        <div className="mt-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                                                <span className="text-sm font-medium text-green-700 dark:text-green-400">Selected:</span>
                                            </div>
                                            <div className="mt-1 font-medium dark:text-gray-200">{selectedPayer.name}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {selectedPayer.purok && `Purok ${selectedPayer.purok}`}
                                                {selectedPayer.address && ` • ${selectedPayer.address}`}
                                                {selectedPayer.member_count && ` • ${selectedPayer.member_count} members`}
                                            </div>
                                            {selectedPayer.head_privileges && selectedPayer.head_privileges.length > 0 && (
                                                <div className="mt-2 flex gap-1">
                                                    {selectedPayer.head_privileges.map((p: any, idx: number) => (
                                                        <Badge key={idx} variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                                            {p.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Business Name */}
                            {data.payer_type === 'business' && (
                                <div className="space-y-2">
                                    <Label htmlFor="business_name" className="dark:text-gray-300">
                                        Business Name *
                                    </Label>
                                    <Input
                                        id="business_name"
                                        required
                                        value={safeString(data.business_name)}
                                        onChange={(e) => {
                                            setData('business_name', e.target.value);
                                            setData('payer_name', e.target.value);
                                        }}
                                        placeholder="Enter business name"
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                </div>
                            )}

                            {/* Manual Payer Name */}
                            {(data.payer_type === 'visitor' || data.payer_type === 'other') && (
                                <div className="space-y-2">
                                    <Label htmlFor="payer_name" className="dark:text-gray-300">
                                        Payer Name *
                                    </Label>
                                    <Input
                                        id="payer_name"
                                        required
                                        value={safeString(data.payer_name)}
                                        onChange={(e) => setData('payer_name', e.target.value)}
                                        placeholder="Enter payer's full name"
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                </div>
                            )}

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_number" className="flex items-center dark:text-gray-300">
                                        <Phone className="mr-1 h-4 w-4 dark:text-gray-400" />
                                        Contact Number
                                    </Label>
                                    <Input
                                        id="contact_number"
                                        value={safeString(data.contact_number)}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        placeholder="09XXXXXXXXX"
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purok" className="flex items-center dark:text-gray-300">
                                        <MapPin className="mr-1 h-4 w-4 dark:text-gray-400" />
                                        Purok
                                    </Label>
                                    <Select
                                        value={safeString(data.purok) || 'none'}
                                        onValueChange={(value) => setData('purok', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                            <SelectValue placeholder="Select Purok" />
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                            <SelectItem value="none" className="dark:text-gray-300 dark:focus:bg-gray-700">Select Purok</SelectItem>
                                            {puroks.map((purok) => (
                                                <SelectItem key={purok} value={purok} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                    Purok {purok}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="dark:text-gray-300">
                                    Address
                                </Label>
                                <Textarea
                                    id="address"
                                    rows={2}
                                    value={safeString(data.address)}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Complete address"
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                />
                            </div>
                        </div>

                        {/* Payer Eligibility Information - Dynamically from Privileges */}
                        {data.payer_type === 'resident' && selectedPayer && 'full_name' in selectedPayer && (
                            <div className="mt-4 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300">Active Privileges</h4>
                                </div>
                                
                                {residentBadges.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {residentBadges.map((badge, idx) => (
                                                <TooltipProvider key={idx}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge 
                                                                variant="outline"
                                                                className={`text-xs px-2 py-1 cursor-help ${badge.color}`}
                                                            >
                                                                <span className="mr-1">{badge.icon}</span>
                                                                {badge.label}
                                                                {badge.status === 'expiring_soon' && (
                                                                    <span className="ml-1 text-yellow-500">⚠️</span>
                                                                )}
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Privilege: {badge.code}</p>
                                                            {badge.id_number && <p>ID: {badge.id_number}</p>}
                                                            {badge.status === 'expiring_soon' && (
                                                                <p className="text-yellow-500">Expiring soon</p>
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ))}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            <p>
                                                <strong>Note:</strong> These privileges will be considered during payment processing.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No active privileges for this resident.
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                            <FileText className="h-3 w-3 text-white" />
                        </div>
                        Additional Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Update additional details and remarks
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="purpose" className="dark:text-gray-300">
                            Purpose / Description
                        </Label>
                        <Textarea
                            id="purpose"
                            rows={3}
                            value={safeString(data.purpose)}
                            onChange={(e) => setData('purpose', e.target.value)}
                            placeholder="Describe the purpose of this fee or provide additional details..."
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>

                    {data.payer_type === 'business' && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="business_type" className="dark:text-gray-300">
                                    Business Type
                                </Label>
                                <Input
                                    id="business_type"
                                    value={safeString(data.business_type)}
                                    onChange={(e) => setData('business_type', e.target.value)}
                                    placeholder="e.g., Retail, Restaurant, Service"
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area" className="dark:text-gray-300">
                                    Area (sq.m.)
                                </Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500 dark:text-gray-400">
                                        m²
                                    </span>
                                    <Input
                                        id="area"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        value={data.area}
                                        onChange={(e) =>
                                            setData('area', parseNumber(e.target.value))
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="property_description" className="dark:text-gray-300">
                            Property Description (for property-related fees)
                        </Label>
                        <Textarea
                            id="property_description"
                            rows={2}
                            value={safeString(data.property_description)}
                            onChange={(e) => setData('property_description', e.target.value)}
                            placeholder="Describe the property, lot, or structure..."
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks" className="dark:text-gray-300">
                            Remarks / Notes
                        </Label>
                        <Textarea
                            id="remarks"
                            rows={2}
                            value={safeString(data.remarks)}
                            onChange={(e) => setData('remarks', e.target.value)}
                            placeholder="Any additional remarks or instructions..."
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>

                    {/* Requirements Submitted Display */}
                    {data.requirements_submitted && data.requirements_submitted.length > 0 && (
                        <div className="space-y-2">
                            <Label className="dark:text-gray-300">Requirements Submitted</Label>
                            <div className="flex flex-wrap gap-2">
                                {data.requirements_submitted.map((req, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-green-50 dark:bg-green-900/30">
                                        {req}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Billing Period Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-lg bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700 flex items-center justify-center">
                                <Calendar className="h-3 w-3 text-white" />
                            </div>
                            Billing Period (Optional)
                        </div>
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Update billing period for recurring fees
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="billing_period" className="dark:text-gray-300">
                                Billing Period Description
                            </Label>
                            <Input
                                id="billing_period"
                                value={safeString(data.billing_period)}
                                onChange={(e) =>
                                    setData('billing_period', e.target.value)
                                }
                                placeholder="e.g., January 2024, Q1 2024"
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="period_start" className="dark:text-gray-300">
                                Period Start
                            </Label>
                            <Input
                                id="period_start"
                                type="date"
                                value={safeString(data.period_start)}
                                onChange={(e) =>
                                    setData('period_start', e.target.value)
                                }
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="period_end" className="dark:text-gray-300">
                                Period End
                            </Label>
                            <Input
                                id="period_end"
                                type="date"
                                value={safeString(data.period_end)}
                                onChange={(e) =>
                                    setData('period_end', e.target.value)
                                }
                                min={data.period_start}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}