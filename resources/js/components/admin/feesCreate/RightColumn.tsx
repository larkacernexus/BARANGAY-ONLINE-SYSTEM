import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building, Home, Phone, MapPin, FileText, Info, Search } from 'lucide-react';
import { FeeFormData, Resident, Household } from '@/types/fees';
import { getEligibilityBadges } from '@/admin-utils/fees/discount-display-utils';
import { useState, useMemo, useEffect, useRef } from 'react';

interface RightColumnProps {
    data: FeeFormData;
    setData: (key: keyof FeeFormData, value: any) => void;
    selectedPayer: Resident | Household | null;
    residents: Resident[];
    households: Household[];
    puroks: string[];
    errors?: Record<string, string>;
    handlePayerTypeChange: (payerType: string) => void;
    handleResidentSelect: (residentId: string) => void;
    handleHouseholdSelect: (householdId: string) => void;
    hideIndividualSelection?: boolean;
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
    errors,
    handlePayerTypeChange,
    handleResidentSelect,
    handleHouseholdSelect,
    hideIndividualSelection = false
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

    const residentBadges = selectedPayer && 'is_senior' in selectedPayer 
        ? getEligibilityBadges(selectedPayer as Resident)
        : [];

    // Handle resident selection
    const handleResidentSelectWithSearch = (residentId: string) => {
        console.log('Selected resident ID:', residentId); // For debugging
        
        // Find the selected resident
        const selected = residents.find(r => r.id === residentId);
        if (selected) {
            // Update search input
            setResidentSearch(selected.full_name);
            
            // Directly set all the data
            setData('resident_id', residentId);
            setData('payer_name', selected.full_name);
            setData('contact_number', selected.contact_number || '');
            setData('purok', selected.purok || '');
            setData('payer_type', 'resident'); // Ensure payer type is set
            
            // Also call the parent handler for consistency
            handleResidentSelect(residentId);
            
            console.log('Set resident data:', {
                resident_id: residentId,
                payer_name: selected.full_name
            });
        } else {
            // Clear selection
            setData('resident_id', '');
            setData('payer_name', '');
            setData('contact_number', '');
            setData('purok', '');
            handleResidentSelect(residentId);
        }
        
        setShowResidentDropdown(false);
    };

    // Handle household selection
    const handleHouseholdSelectWithSearch = (householdId: string) => {
        console.log('Selected household ID:', householdId); // For debugging
        
        // Find the selected household
        const selected = households.find(h => h.id === householdId);
        if (selected) {
            // Update search input
            setHouseholdSearch(selected.name);
            
            // Directly set all the data
            setData('household_id', householdId);
            setData('payer_name', selected.name);
            setData('contact_number', selected.contact_number || '');
            setData('purok', selected.purok || '');
            setData('payer_type', 'household'); // Ensure payer type is set
            
            // Also call the parent handler for consistency
            handleHouseholdSelect(householdId);
            
            console.log('Set household data:', {
                household_id: householdId,
                payer_name: selected.name
            });
        } else {
            // Clear selection
            setData('household_id', '');
            setData('payer_name', '');
            setData('contact_number', '');
            setData('purok', '');
            handleHouseholdSelect(householdId);
        }
        
        setShowHouseholdDropdown(false);
    };

    // Handle clearing resident selection
    const handleClearResident = () => {
        setResidentSearch('');
        setShowResidentDropdown(false);
        // Clear selection properly
        setData('resident_id', '');
        setData('payer_name', '');
        setData('contact_number', '');
        setData('purok', '');
        handleResidentSelect('');
    };

    // Handle clearing household selection
    const handleClearHousehold = () => {
        setHouseholdSearch('');
        setShowHouseholdDropdown(false);
        // Clear selection properly
        setData('household_id', '');
        setData('payer_name', '');
        setData('contact_number', '');
        setData('purok', '');
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

    return (
        <div className="space-y-6">
            {/* Payer Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Payer Information
                    </CardTitle>
                    <CardDescription>
                        Select or enter payer details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {hideIndividualSelection ? (
                        <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-700">
                                    <p className="font-medium">Bulk Fee Mode Active</p>
                                    <p className="mt-1">
                                        Payer selection is managed in the bulk selection panel. 
                                        Use the "Edit Selection" button in the Fee Creation Mode section 
                                        to manage multiple payers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <Label>Payer Type *</Label>
                                    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                                        {payerTypes.map((type) => {
                                            const IconComponent = type.icon;
                                            return (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => {
                                                        handlePayerTypeChange(type.value);
                                                        // Clear any previous selections
                                                        if (type.value !== 'resident') {
                                                            handleClearResident();
                                                        }
                                                        if (type.value !== 'household') {
                                                            handleClearHousehold();
                                                        }
                                                    }}
                                                    className={`flex flex-col items-center justify-center rounded-md border p-3 transition-colors ${
                                                        data.payer_type === type.value
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <IconComponent className="mb-1 h-5 w-5" />
                                                    <span className="text-xs font-medium">
                                                        {type.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors?.payer_type && (
                                        <p className="text-sm text-red-500">
                                            {errors.payer_type}
                                        </p>
                                    )}
                                </div>

                                {/* Resident Selection with Search */}
                                {data.payer_type === 'resident' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="resident_search">
                                            Select Resident *
                                        </Label>
                                        
                                        {/* Search input */}
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
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
                                                className="pl-8"
                                                autoComplete="off"
                                            />
                                            {residentSearch && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearResident}
                                                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>

                                        {/* Search results dropdown */}
                                        {showResidentDropdown && (
                                            <div 
                                                ref={residentDropdownRef}
                                                className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
                                                style={{ width: 'calc(100% - 2rem)' }}
                                            >
                                                {filteredResidents.length > 0 ? (
                                                    filteredResidents.map((resident) => (
                                                        <button
                                                            key={resident.id}
                                                            type="button"
                                                            onClick={() => handleResidentSelectWithSearch(resident.id)}
                                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b last:border-b-0"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className="font-medium">{resident.full_name}</span>
                                                                    {resident.purok && (
                                                                        <span className="ml-2 text-sm text-gray-500">
                                                                            (Purok {resident.purok})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    {resident.is_senior && <span className="text-sm" title="Senior Citizen">👵</span>}
                                                                    {resident.is_pwd && <span className="text-sm" title="PWD">♿</span>}
                                                                    {resident.is_solo_parent && <span className="text-sm" title="Solo Parent">👨‍👧‍👦</span>}
                                                                    {resident.is_indigent && <span className="text-sm" title="Indigent">🏠</span>}
                                                                </div>
                                                            </div>
                                                            {resident.address && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {resident.address}
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-500">
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
                                            <div className="mt-2 rounded-md bg-green-50 border border-green-200 p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    <span className="text-sm font-medium text-green-700">Selected:</span>
                                                </div>
                                                <div className="mt-1 font-medium">{selectedPayer.full_name}</div>
                                                <div className="text-sm text-gray-600 mt-1">
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
                                        <Label htmlFor="household_search">
                                            Select Household *
                                        </Label>
                                        
                                        {/* Search input */}
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
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
                                                className="pl-8"
                                                autoComplete="off"
                                            />
                                            {householdSearch && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearHousehold}
                                                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>

                                        {/* Search results dropdown */}
                                        {showHouseholdDropdown && (
                                            <div 
                                                ref={householdDropdownRef}
                                                className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
                                                style={{ width: 'calc(100% - 2rem)' }}
                                            >
                                                {filteredHouseholds.length > 0 ? (
                                                    filteredHouseholds.map((household) => (
                                                        <button
                                                            key={household.id}
                                                            type="button"
                                                            onClick={() => handleHouseholdSelectWithSearch(household.id)}
                                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b last:border-b-0"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className="font-medium">{household.name}</span>
                                                                    {household.purok && (
                                                                        <span className="ml-2 text-sm text-gray-500">
                                                                            (Purok {household.purok})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {household.member_count && (
                                                                    <span className="text-xs text-gray-500">
                                                                        {household.member_count} members
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {household.address && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {household.address}
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-500">
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
                                            <div className="mt-2 rounded-md bg-green-50 border border-green-200 p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    <span className="text-sm font-medium text-green-700">Selected:</span>
                                                </div>
                                                <div className="mt-1 font-medium">{selectedPayer.name}</div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {selectedPayer.purok && `Purok ${selectedPayer.purok}`}
                                                    {selectedPayer.address && ` • ${selectedPayer.address}`}
                                                    {selectedPayer.member_count && ` • ${selectedPayer.member_count} members`}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Business Name */}
                                {data.payer_type === 'business' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="business_name">
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
                                        />
                                    </div>
                                )}

                                {/* Manual Payer Name */}
                                {(data.payer_type === 'visitor' || data.payer_type === 'other') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="payer_name">
                                            Payer Name *
                                        </Label>
                                        <Input
                                            id="payer_name"
                                            required
                                            value={safeString(data.payer_name)}
                                            onChange={(e) => setData('payer_name', e.target.value)}
                                            placeholder="Enter payer's full name"
                                        />
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_number" className="flex items-center">
                                            <Phone className="mr-1 h-4 w-4" />
                                            Contact Number
                                        </Label>
                                        <Input
                                            id="contact_number"
                                            value={safeString(data.contact_number)}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            placeholder="09XXXXXXXXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purok" className="flex items-center">
                                            <MapPin className="mr-1 h-4 w-4" />
                                            Purok
                                        </Label>
                                        <Select
                                            value={safeString(data.purok) || 'none'}
                                            onValueChange={(value) => setData('purok', value === 'none' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Purok" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Select Purok</SelectItem>
                                                {puroks.map((purok) => (
                                                    <SelectItem key={purok} value={purok}>
                                                        Purok {purok}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">
                                        Address
                                    </Label>
                                    <Textarea
                                        id="address"
                                        rows={2}
                                        value={safeString(data.address)}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Complete address"
                                    />
                                </div>
                            </div>

                            {/* Payer Eligibility Information - Informational Only */}
                            {data.payer_type === 'resident' && selectedPayer && 'is_senior' in selectedPayer && (
                                <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        <h4 className="font-medium text-sm text-blue-700">Payer Eligibility Information</h4>
                                    </div>
                                    
                                    {residentBadges.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {residentBadges.map((badge, idx) => (
                                                    <Badge 
                                                        key={idx} 
                                                        variant="outline"
                                                        className={`text-xs px-2 py-1 ${badge.color}`}
                                                    >
                                                        <span className="mr-1">{badge.icon}</span>
                                                        {badge.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                <p>
                                                    <strong>Note:</strong> These eligibility markers are for reference only. 
                                                    Actual discounts will be applied during payment processing upon presentation 
                                                    of valid government-issued IDs, as required by Philippine law.
                                                </p>
                                                <p className="mt-1 italic">
                                                    RA 9994 (Senior Citizens) • RA 10754 (PWDs) • RA 8972 (Solo Parents)
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            No special eligibility markers for this resident.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Additional Information
                    </CardTitle>
                    <CardDescription>
                        Provide additional details and remarks
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="purpose">
                            Purpose / Description
                        </Label>
                        <Textarea
                            id="purpose"
                            rows={3}
                            value={safeString(data.purpose)}
                            onChange={(e) => setData('purpose', e.target.value)}
                            placeholder="Describe the purpose of this fee or provide additional details..."
                        />
                    </div>

                    {data.payer_type === 'business' && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="business_type">
                                    Business Type
                                </Label>
                                <Input
                                    id="business_type"
                                    value={safeString(data.business_type)}
                                    onChange={(e) => setData('business_type', e.target.value)}
                                    placeholder="e.g., Retail, Restaurant, Service"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area">
                                    Area (sq.m.)
                                </Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
                                        m²
                                    </span>
                                    <Input
                                        id="area"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="pl-10"
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
                        <Label htmlFor="property_description">
                            Property Description (for property-related fees)
                        </Label>
                        <Textarea
                            id="property_description"
                            rows={2}
                            value={safeString(data.property_description)}
                            onChange={(e) => setData('property_description', e.target.value)}
                            placeholder="Describe the property, lot, or structure..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">
                            Remarks / Notes
                        </Label>
                        <Textarea
                            id="remarks"
                            rows={2}
                            value={safeString(data.remarks)}
                            onChange={(e) => setData('remarks', e.target.value)}
                            placeholder="Any additional remarks or instructions..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Billing Period Card */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Billing Period (Optional)
                    </CardTitle>
                    <CardDescription>
                        Set the billing period for recurring fees
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="billing_period">
                                Billing Period Description
                            </Label>
                            <Input
                                id="billing_period"
                                value={safeString(data.billing_period)}
                                onChange={(e) =>
                                    setData('billing_period', e.target.value)
                                }
                                placeholder="e.g., January 2024, Q1 2024"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="period_start">
                                Period Start
                            </Label>
                            <Input
                                id="period_start"
                                type="date"
                                value={safeString(data.period_start)}
                                onChange={(e) =>
                                    setData('period_start', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="period_end">
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
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}