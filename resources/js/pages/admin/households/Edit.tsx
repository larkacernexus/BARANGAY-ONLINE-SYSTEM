// pages/admin/households/edit.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft,
    Save,
    Home,
    User,
    Phone,
    Mail,
    MapPin,
    Users,
    Building,
    Droplets,
    Zap,
    Plus,
    Search,
    X,
    Trash2,
    Camera,
    Globe,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { Badge } from '@/components/ui/badge';
import { 
    PageProps, 
    Resident, 
    Purok, 
    HouseholdMember,
    getFullName,
    getPhotoUrl,
    hasPhoto
} from '@/types/admin/households/household.types';

// ============================================================================
// Constants
// ============================================================================

const INCOME_RANGES = [
    'Below ₱10,000',
    '₱10,000 - ₱20,000',
    '₱20,000 - ₱30,000',
    '₱30,000 - ₱50,000',
    '₱50,000 - ₱100,000',
    'Above ₱100,000'
] as const;

const HOUSING_TYPES = [
    'Concrete',
    'Semi-concrete',
    'Wood',
    'Nipa/Bamboo',
    'Mixed Materials',
    'Others'
] as const;

const OWNERSHIP_STATUSES = [
    'Owned',
    'Rented',
    'Free Use',
    'With Consent',
    'Government Housing'
] as const;

const WATER_SOURCES = [
    'Level I (Point Source)',
    'Level II (Communal Faucet)',
    'Level III (Waterworks System)',
    'Deep Well',
    'Shallow Well',
    'Spring',
    'Others'
] as const;

const RELATIONSHIP_TYPES = [
    'Head',
    'Spouse',
    'Son',
    'Daughter',
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Grandparent',
    'Grandchild',
    'Other Relative',
    'Non-relative'
] as const;

// ============================================================================
// Type Definitions
// ============================================================================

interface HouseholdFormData {
    household_number: string;
    contact_number: string;
    email?: string;
    address: string;
    purok_id: number | null;
    total_members: number;
    income_range?: string;
    housing_type?: string;
    ownership_status?: string;
    water_source?: string;
    electricity: boolean;
    internet: boolean;
    vehicle: boolean;
    remarks?: string;
    members: HouseholdMember[];
    google_maps_url?: string;
    latitude?: number | null;
    longitude?: number | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
}

interface EditHouseholdProps extends PageProps {
    household: {
        id: number;
        household_number: string;
        contact_number: string;
        email?: string;
        address: string;
        purok_id: number | null;
        purok_name?: string;
        member_count: number;
        income_range?: string;
        housing_type?: string;
        ownership_status?: string;
        water_source?: string;
        electricity: boolean;
        internet: boolean;
        vehicle: boolean;
        remarks?: string;
        google_maps_url?: string;
        latitude?: number | null;
        longitude?: number | null;
    };
    puroks: Purok[];
    current_members: HouseholdMember[];
}

// ============================================================================
// Helper Components
// ============================================================================

interface MemberCardProps {
    member: HouseholdMember;
    isHead: boolean;
    onRemove?: (id: number) => void;
    onUpdateRelationship?: (id: number, relationship: string) => void;
    householdId: number;
    purokId: number | null;
    relationshipTypes: readonly string[];
}

const MemberCard = ({ 
    member, 
    isHead, 
    onRemove, 
    onUpdateRelationship, 
    householdId, 
    purokId,
    relationshipTypes 
}: MemberCardProps) => {
    const photoUrl = getPhotoUrl(member.photo_path, member.photo_url);
    
    return (
        <div className="border rounded-lg p-4 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 transition-colors dark:bg-gray-900/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${
                        isHead
                            ? 'border-2 border-blue-500 dark:border-blue-400' 
                            : 'border border-gray-300 dark:border-gray-600'
                    }`}>
                        {photoUrl ? (
                            <img 
                                src={photoUrl}
                                alt={member.full_name || member.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className={`h-full w-full flex items-center justify-center ${
                                isHead
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                                {isHead ? <Home className="h-5 w-5" /> : <User className="h-5 w-5" />}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium flex items-center gap-2 dark:text-white">
                            {member.full_name || member.name}
                            {isHead && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                    Head of Family
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.relationship}
                            {member.age && member.age > 0 && ` • ${member.age} years old`}
                        </div>
                    </div>
                </div>
                {!isHead && onRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            
            {!isHead && onUpdateRelationship && (
                <div className="mt-4">
                    <Label htmlFor={`relationship-${member.id}`} className="dark:text-gray-300">Relationship to Head</Label>
                    <Select 
                        value={member.relationship}
                        onValueChange={(value) => onUpdateRelationship(member.id, value)}
                    >
                        <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                            <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {relationshipTypes
                                .filter(rel => rel !== 'Head')
                                .map((relationship) => (
                                    <SelectItem key={relationship} value={relationship} className="dark:text-white">
                                        {relationship}
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
};

interface ChecklistItemProps {
    completed: boolean;
    label: string;
    subLabel?: string;
    warning?: boolean;
}

const ChecklistItem = ({ completed, label, subLabel, warning = false }: ChecklistItemProps) => {
    const getStatusClass = () => {
        if (completed) return 'text-green-600 dark:text-green-400';
        if (warning) return 'text-amber-600 dark:text-amber-400';
        return 'text-gray-400 dark:text-gray-600';
    };
    
    const getDotClass = () => {
        if (completed) return 'bg-green-600 dark:bg-green-400';
        if (warning) return 'bg-amber-600 dark:bg-amber-400';
        return 'bg-gray-400 dark:bg-gray-500';
    };
    
    const getBgClass = () => {
        if (completed) return 'bg-green-100 dark:bg-green-900/30';
        if (warning) return 'bg-amber-100 dark:bg-amber-900/30';
        return 'bg-gray-100 dark:bg-gray-700';
    };
    
    return (
        <div className={`flex items-center space-x-2 ${getStatusClass()}`}>
            <div className={`h-5 w-5 rounded-full ${getBgClass()} flex items-center justify-center`}>
                <div className={`h-2 w-2 rounded-full ${getDotClass()}`}></div>
            </div>
            <div>
                <span className="text-sm">{label}</span>
                {subLabel && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{subLabel}</span>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// Main Component
// ============================================================================

export default function EditHousehold({ 
    household, 
    puroks, 
    current_members 
}: EditHouseholdProps) {
    // State
    const [members, setMembers] = useState<HouseholdMember[]>(() => {
        return (current_members || []).map(member => ({
            ...member,
            relationship: (member.is_head || member.relationship === 'Head') ? 'Head' : (member.relationship || 'Other Relative'),
            is_head: member.is_head || member.relationship === 'Head',
        }));
    });
    
    const [showMemberSearch, setShowMemberSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Resident[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [memberPagination, setMemberPagination] = useState<PaginationMeta | null>(null);
    const [isLoadingMoreMembers, setIsLoadingMoreMembers] = useState(false);
    
    // Head search state
    const [heads, setHeads] = useState<Resident[]>([]);
    const [headSearchQuery, setHeadSearchQuery] = useState('');
    const [isSearchingHeads, setIsSearchingHeads] = useState(false);
    const [headPagination, setHeadPagination] = useState<PaginationMeta | null>(null);
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debouncedSearchRef = useRef(
        debounce((query: string) => fetchResidents(query, 1, false), 300)
    );
    
    // Form
    const { data, setData, put, processing, errors, reset } = useForm<HouseholdFormData>({
        household_number: household.household_number,
        contact_number: household.contact_number,
        email: household.email || '',
        address: household.address,
        purok_id: household.purok_id,
        total_members: household.member_count,
        income_range: household.income_range || '',
        housing_type: household.housing_type || '',
        ownership_status: household.ownership_status || '',
        water_source: household.water_source || '',
        electricity: household.electricity,
        internet: household.internet,
        vehicle: household.vehicle,
        remarks: household.remarks || '',
        members: members,
        google_maps_url: household.google_maps_url || '',
        latitude: household.latitude || null,
        longitude: household.longitude || null,
    });

    // Fetch heads from server
    const fetchHeads = useCallback(async (query: string = '', page: number = 1) => {
        setIsSearchingHeads(true);
        
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
                if (page > 1) {
                    setHeads(prev => {
                        const existingIds = new Set(prev.map(h => h.id));
                        const newHeads = (response.data.data || []).filter((h: Resident) => !existingIds.has(h.id));
                        return [...prev, ...newHeads];
                    });
                } else {
                    setHeads(response.data.data || []);
                }
                setHeadPagination(response.data.pagination || null);
            }
        } catch (error) {
            // Handle silently
        } finally {
            setIsSearchingHeads(false);
        }
    }, []);

    // Fetch residents for member search
    const fetchResidents = useCallback(async (query: string = '', page: number = 1, append: boolean = false) => {
        setIsSearching(true);
        
        try {
            const params = new URLSearchParams({
                search: query,
                page: String(page),
                per_page: '50',
            });
            
            const response = await axios.get(`/admin/households/search-residents?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });
            
            if (response.data) {
                if (append && page > 1) {
                    setSearchResults(prev => {
                        const existingIds = new Set(prev.map(r => r.id));
                        const newResidents = (response.data.data || []).filter((r: Resident) => !existingIds.has(r.id));
                        return [...prev, ...newResidents];
                    });
                } else {
                    setSearchResults(response.data.data || []);
                }
                setMemberPagination(response.data.pagination || null);
            }
        } catch (error) {
            if (!append) setSearchResults([]);
        } finally {
            setIsSearching(false);
            setIsLoadingMoreMembers(false);
        }
    }, []);

    // Initial loads
    useEffect(() => {
        fetchHeads('', 1);
        return () => debouncedSearchRef.current.cancel();
    }, []);

    // Computed values
    const headMember = useMemo(() => members.find(m => m.relationship === 'Head' || m.is_head), [members]);
    const currentHeadResident = useMemo(() => 
        headMember?.resident_id 
            ? heads.find(h => h.id === headMember.resident_id)
            : null,
        [headMember, heads]
    );

    // Handle member search
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedSearchRef.current(value);
    };

    const loadMoreMembers = async () => {
        if (!memberPagination?.has_more || isLoadingMoreMembers) return;
        setIsLoadingMoreMembers(true);
        await fetchResidents(searchQuery, (memberPagination.current_page || 1) + 1, true);
    };

    // Update form data when members change
    useEffect(() => {
        setData('total_members', members.length);
        setData('members', members);
    }, [members, setData]);

    // Handlers
    const handleRemoveMember = useCallback((id: number) => {
        const memberToRemove = members.find(m => m.id === id);
        if (memberToRemove?.relationship === 'Head' || memberToRemove?.is_head) {
            alert('Cannot remove the head of family. Change the head first.');
            return;
        }
        
        if (members.length > 1) {
            setMembers(prev => prev.filter(member => member.id !== id));
        }
    }, [members]);

    const handleUpdateMemberRelationship = useCallback((id: number, relationship: string) => {
        setMembers(prev => prev.map(member => 
            member.id === id ? { ...member, relationship } : member
        ));
    }, []);

    const handleAddExistingResident = useCallback((resident: Resident) => {
        const isAlreadyAdded = members.some(m => m.resident_id === resident.id);
        if (isAlreadyAdded) {
            alert('This resident is already added to the household.');
            return;
        }

        const newId = Date.now();
        const fullName = getFullName(resident.first_name, resident.last_name, resident.middle_name);
        
        setMembers(prev => [...prev, { 
            id: newId,
            household_id: household.id,
            name: fullName,
            first_name: resident.first_name,
            last_name: resident.last_name,
            middle_name: resident.middle_name,
            relationship: 'Other Relative',
            age: resident.age || 0,
            resident_id: resident.id,
            purok_id: resident.purok_id,
            purok_name: resident.purok_name,
            photo_path: resident.photo_path,
            photo_url: resident.photo_url,
            is_head: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }]);
        
        setShowMemberSearch(false);
        setSearchQuery('');
    }, [members, household.id]);

    const handleHeadChange = useCallback((value: string) => {
        if (!value) {
            setMembers(prev => prev.filter(m => m.relationship !== 'Head' && !m.is_head));
            return;
        }

        const selectedHead = heads.find(head => head.id.toString() === value);
        if (selectedHead) {
            const fullName = getFullName(selectedHead.first_name, selectedHead.last_name, selectedHead.middle_name);
            
            if (selectedHead.purok_id) {
                setData('purok_id', selectedHead.purok_id);
            }
            
            const existingHeadIndex = members.findIndex(m => m.relationship === 'Head' || m.is_head);
            
            if (existingHeadIndex !== -1) {
                setMembers(prev => {
                    const updated = [...prev];
                    updated[existingHeadIndex] = {
                        ...updated[existingHeadIndex],
                        id: selectedHead.id,
                        name: fullName,
                        first_name: selectedHead.first_name,
                        last_name: selectedHead.last_name,
                        middle_name: selectedHead.middle_name,
                        resident_id: selectedHead.id,
                        age: selectedHead.age || 0,
                        relationship: 'Head',
                        purok_id: selectedHead.purok_id,
                        purok_name: selectedHead.purok_name,
                        photo_path: selectedHead.photo_path,
                        photo_url: selectedHead.photo_url,
                        is_head: true,
                    };
                    return updated;
                });
            } else {
                const newHeadMember: HouseholdMember = { 
                    id: selectedHead.id,
                    household_id: household.id,
                    name: fullName,
                    first_name: selectedHead.first_name,
                    last_name: selectedHead.last_name,
                    middle_name: selectedHead.middle_name,
                    relationship: 'Head',
                    age: selectedHead.age || 0,
                    resident_id: selectedHead.id,
                    purok_id: selectedHead.purok_id,
                    purok_name: selectedHead.purok_name,
                    photo_path: selectedHead.photo_path,
                    photo_url: selectedHead.photo_url,
                    is_head: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                
                setMembers(prev => [newHeadMember, ...prev.filter(m => !(m.relationship === 'Head' || m.is_head))]);
            }
        }
    }, [heads, members, setData, household.id]);

    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to reset all changes?')) {
            const resetMembers = (current_members || []).map(member => ({
                ...member,
                relationship: (member.is_head || member.relationship === 'Head') ? 'Head' : (member.relationship || 'Other Relative'),
                is_head: member.is_head || member.relationship === 'Head',
            }));
            setMembers(resetMembers);
            reset();
        }
    }, [current_members, reset]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        const headMembers = members.filter(m => m.relationship === 'Head' || m.is_head);
        if (headMembers.length !== 1) {
            alert(`Household must have exactly one head member. Found ${headMembers.length} head(s).`);
            return;
        }
        
        put(`/admin/households/${household.id}`, {
            preserveScroll: true,
        });
    }, [members, put, household.id]);

    const handleDelete = useCallback(() => {
        if (confirm('Are you sure you want to delete this household? This action cannot be undone.')) {
            window.location.href = `/admin/households/${household.id}/delete`;
        }
    }, [household.id]);

    return (
        <AppLayout
            title={`Edit Household: ${household.household_number}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Households', href: '/admin/households' },
                { title: household.household_number, href: `/admin/households/${household.id}` },
                { title: 'Edit Household', href: `/admin/households/${household.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/households/${household.id}`}>
                            <Button variant="ghost" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight dark:text-white">Edit Household</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Household #{household.household_number}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            type="button"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Update Household
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Error Messages */}
                {Object.keys(errors).length > 0 && (
                    <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        {Object.entries(errors).map(([field, error]) => (
                                            <li key={field} className="text-sm text-red-600 dark:text-red-400">
                                                <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span> {error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Household Information */}
                        <Card className="dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Home className="h-5 w-5" />
                                    Basic Household Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="householdNumber" className="dark:text-gray-300">Household Number</Label>
                                        <Input 
                                            id="householdNumber" 
                                            value={data.household_number}
                                            onChange={(e) => setData('household_number', e.target.value)}
                                            required
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="registrationDate" className="dark:text-gray-300">Registration Date</Label>
                                        <Input 
                                            id="registrationDate" 
                                            type="date" 
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                            readOnly
                                            className="bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="head_resident_id" className="dark:text-gray-300">Head of Family *</Label>
                                    <Select 
                                        value={currentHeadResident?.id?.toString() || ''}
                                        onValueChange={handleHeadChange}
                                        onOpenChange={(open) => {
                                            if (open) fetchHeads('', 1);
                                        }}
                                    >
                                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                            <SelectValue placeholder="Select or search for head of family">
                                                {currentHeadResident ? (
                                                    <div className="flex items-center gap-2">
                                                        {getFullName(currentHeadResident.first_name, currentHeadResident.last_name, currentHeadResident.middle_name)}
                                                    </div>
                                                ) : 'Select head of family'}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700 max-h-60">
                                            {heads.length === 0 ? (
                                                <div className="px-2 py-4 text-center text-gray-500 text-sm">
                                                    No available residents found
                                                </div>
                                            ) : (
                                                heads.map((head) => {
                                                    const fullName = getFullName(head.first_name, head.last_name, head.middle_name);
                                                    return (
                                                        <SelectItem key={head.id} value={head.id.toString()} className="dark:text-white">
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>{fullName}</span>
                                                                {head.household_status === 'member' && (
                                                                    <Badge variant="outline" className="ml-2 text-xs bg-purple-100 text-purple-800">
                                                                        HH #{head.current_household?.number}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber" className="dark:text-gray-300">Contact Number *</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input 
                                                id="contactNumber" 
                                                placeholder="09123456789" 
                                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white" 
                                                required 
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="dark:text-gray-300">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input 
                                                id="email" 
                                                type="email" 
                                                placeholder="family@example.com" 
                                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white" 
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address Information */}
                        <Card className="dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <MapPin className="h-5 w-5" />
                                    Address Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="completeAddress" className="dark:text-gray-300">Complete Address *</Label>
                                    <Textarea 
                                        id="completeAddress" 
                                        rows={3}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="purok_id" className="dark:text-gray-300">Purok *</Label>
                                        <Select 
                                            value={data.purok_id?.toString() || ''}
                                            onValueChange={(value) => setData('purok_id', value ? parseInt(value) : null)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                <SelectValue placeholder="Select purok" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                {puroks.map((purok) => (
                                                    <SelectItem key={purok.id} value={purok.id.toString()} className="dark:text-white">
                                                        {purok.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="google_maps_url" className="flex items-center gap-2 dark:text-gray-300">
                                        <Globe className="h-4 w-4" />
                                        Google Maps Link
                                    </Label>
                                    <Input 
                                        id="google_maps_url" 
                                        placeholder="https://maps.app.goo.gl/..." 
                                        value={data.google_maps_url || ''}
                                        onChange={(e) => setData('google_maps_url', e.target.value)}
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-white font-mono text-sm"
                                    />
                                </div>

                                {(data.latitude || data.longitude) && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">📍 Current Coordinates</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-green-600 dark:text-green-400">Latitude:</span>
                                                <code className="ml-2 text-green-800 dark:text-green-300 font-mono">
                                                    {data.latitude?.toFixed(6)}
                                                </code>
                                            </div>
                                            <div>
                                                <span className="text-green-600 dark:text-green-400">Longitude:</span>
                                                <code className="ml-2 text-green-800 dark:text-green-300 font-mono">
                                                    {data.longitude?.toFixed(6)}
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Household Members */}
                        <Card className="dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 dark:text-white">
                                        <Users className="h-5 w-5" />
                                        Household Members
                                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                            ({members.length})
                                        </span>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            setShowMemberSearch(true);
                                            if (searchResults.length === 0) fetchResidents('', 1, false);
                                        }}
                                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        <Search className="h-4 w-4 mr-2" />
                                        Add Members
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Member Search Modal */}
                                {showMemberSearch && (
                                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col dark:border dark:border-gray-700">
                                            <div className="p-6 border-b dark:border-gray-700">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold dark:text-white">Add Family Members</h3>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowMemberSearch(false);
                                                            setSearchQuery('');
                                                        }}
                                                        type="button"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    <Input
                                                        placeholder="Search residents..." 
                                                        className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                        value={searchQuery}
                                                        onChange={(e) => handleSearchChange(e.target.value)}
                                                        autoFocus
                                                    />
                                                    {isSearching && (
                                                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 overflow-y-auto">
                                                {searchResults.length === 0 && !isSearching ? (
                                                    <div className="p-8 text-center">
                                                        <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No Residents Found</h4>
                                                        <Link 
                                                            href={`/admin/residents/create?return_to=/households/${household.id}/edit&purok_id=${data.purok_id || ''}`}
                                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                                            onClick={() => setShowMemberSearch(false)}
                                                        >
                                                            Create New Resident
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y dark:divide-gray-700">
                                                        {searchResults.map((resident) => {
                                                            const fullName = getFullName(resident.first_name, resident.last_name, resident.middle_name);
                                                            const isAlreadyAdded = members.some(m => m.resident_id === resident.id);
                                                            const isHead = currentHeadResident?.id === resident.id;
                                                            
                                                            return (
                                                                <div key={resident.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <div className="font-medium dark:text-white">{fullName}</div>
                                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                                {resident.age && `${resident.age} yrs • `}
                                                                                {resident.purok_name || 'No purok'}
                                                                            </div>
                                                                        </div>
                                                                        {isHead ? (
                                                                            <Badge className="bg-blue-100 text-blue-800">Current Head</Badge>
                                                                        ) : isAlreadyAdded ? (
                                                                            <Badge className="bg-green-100 text-green-800">Already Added</Badge>
                                                                        ) : (
                                                                            <Button 
                                                                                size="sm" 
                                                                                onClick={() => handleAddExistingResident(resident)}
                                                                                type="button"
                                                                            >
                                                                                <Plus className="h-4 w-4 mr-1" />
                                                                                Add
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        
                                                        {memberPagination?.has_more && (
                                                            <div className="p-4 text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={loadMoreMembers}
                                                                    disabled={isLoadingMoreMembers}
                                                                    type="button"
                                                                >
                                                                    {isLoadingMoreMembers ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                                                    Load More ({searchResults.length} of {memberPagination.total})
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-4 border-t dark:border-gray-700">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => { setShowMemberSearch(false); setSearchQuery(''); }}
                                                    type="button"
                                                >
                                                    Close
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {members.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed rounded-lg dark:border-gray-700">
                                            <User className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400">No head of family selected</p>
                                        </div>
                                    ) : (
                                        members.map((member) => (
                                            <MemberCard
                                                key={member.id}
                                                member={member}
                                                isHead={member.relationship === 'Head' || member.is_head === true}
                                                onRemove={handleRemoveMember}
                                                onUpdateRelationship={handleUpdateMemberRelationship}
                                                householdId={household.id}
                                                purokId={data.purok_id}
                                                relationshipTypes={RELATIONSHIP_TYPES}
                                            />
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Housing & Economic Information */}
                        <Card className="dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Building className="h-5 w-5" />
                                    Housing & Economic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="housingType" className="dark:text-gray-300">Housing Type</Label>
                                        <Select 
                                            value={data.housing_type}
                                            onValueChange={(value) => setData('housing_type', value)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                <SelectValue placeholder="Select housing type" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                {HOUSING_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type} className="dark:text-white">{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ownershipStatus" className="dark:text-gray-300">Ownership Status</Label>
                                        <Select 
                                            value={data.ownership_status}
                                            onValueChange={(value) => setData('ownership_status', value)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                <SelectValue placeholder="Select ownership status" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                {OWNERSHIP_STATUSES.map((status) => (
                                                    <SelectItem key={status} value={status} className="dark:text-white">{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="waterSource" className="dark:text-gray-300">Water Source</Label>
                                        <Select 
                                            value={data.water_source}
                                            onValueChange={(value) => setData('water_source', value)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                <SelectValue placeholder="Select water source" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                {WATER_SOURCES.map((source) => (
                                                    <SelectItem key={source} value={source} className="dark:text-white">{source}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="incomeRange" className="dark:text-gray-300">Monthly Income Range</Label>
                                        <Select 
                                            value={data.income_range}
                                            onValueChange={(value) => setData('income_range', value)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                <SelectValue placeholder="Select income range" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                {INCOME_RANGES.map((range) => (
                                                    <SelectItem key={range} value={range} className="dark:text-white">{range}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="electricity" 
                                            checked={data.electricity}
                                            onCheckedChange={(checked) => setData('electricity', checked as boolean)}
                                        />
                                        <Label htmlFor="electricity" className="flex items-center gap-2"><Zap className="h-4 w-4" />Has electricity</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="internet" 
                                            checked={data.internet}
                                            onCheckedChange={(checked) => setData('internet', checked as boolean)}
                                        />
                                        <Label htmlFor="internet">Has internet</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="vehicle" 
                                            checked={data.vehicle}
                                            onCheckedChange={(checked) => setData('vehicle', checked as boolean)}
                                        />
                                        <Label htmlFor="vehicle">Owns a vehicle</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Remarks */}
                        <Card className="dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="remarks" className="dark:text-gray-300">Remarks/Notes</Label>
                                    <Textarea 
                                        id="remarks" 
                                        rows={3}
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <Card className="dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader><CardTitle className="dark:text-white">Household Summary</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Household #:</span>
                                        <span className="font-mono font-bold">{household.household_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Members:</span>
                                        <span className="font-bold text-lg">{members.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Purok:</span>
                                        <span>{data.purok_id ? puroks.find(p => p.id === data.purok_id)?.name || 'Not set' : 'Not set'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader><CardTitle className="dark:text-white">Edit Checklist</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <ChecklistItem completed={!!headMember} label="Head of family" />
                                    <ChecklistItem completed={!!data.address} label="Complete address" />
                                    <ChecklistItem completed={!!data.contact_number} label="Contact information" />
                                    <ChecklistItem completed={!!data.purok_id} label="Purok selection" warning={!data.purok_id} />
                                    <ChecklistItem completed={members.length > 1} label={`Household members (${members.length})`} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t dark:border-gray-700">
                    <div className="flex gap-2">
                        <Link href={`/admin/households/${household.id}`}>
                            <Button variant="ghost" type="button">Cancel</Button>
                        </Link>
                        <Button variant="outline" type="button" onClick={handleReset}>Reset Changes</Button>
                    </div>
                    <Button type="submit" disabled={processing}>
                        <Save className="h-4 w-4 mr-2" />
                        {processing ? 'Updating...' : 'Update Household'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}