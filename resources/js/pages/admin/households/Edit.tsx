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
    Image
} from 'lucide-react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types';

interface Resident {
    id: number;
    name: string;
    age?: number;
    address?: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    purok_id?: number;
    purok_name?: string;
    photo_path?: string;
    photo_url?: string;
}

interface HouseholdMember {
    id: number;
    name: string;
    relationship: string;
    age: number;
    resident_id?: number;
    household_member_id?: number;
    purok_id?: number;
    purok_name?: string;
    photo_path?: string;
    photo_url?: string;
    is_head?: boolean;
}

interface Purok {
    id: number;
    name: string;
}

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
    };
    heads: Resident[];
    puroks: Purok[];
    available_residents?: Resident[];
    current_members: HouseholdMember[];
}

// Helper function to get photo URL
const getPhotoUrl = (photoPath?: string, photoUrl?: string): string | null => {
    // Use photo_url if provided (direct URL from backend)
    if (photoUrl) {
        // If photoUrl is already a full URL, return it
        if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('/')) {
            return photoUrl;
        }
        // If it's relative, prepend with base URL
        return `/${photoUrl.replace(/^\/+/, '')}`;
    }
    
    // If only photo_path exists
    if (photoPath) {
        // Remove 'public/' prefix if present
        const cleanPath = photoPath.replace('public/', '');
        
        // Return with /storage prefix
        return `/storage/${cleanPath}`;
    }
    
    return null;
};

export default function EditHousehold({ 
    household, 
    heads, 
    puroks, 
    available_residents = [],
    current_members 
}: EditHouseholdProps) {
    const [members, setMembers] = useState<HouseholdMember[]>(current_members || []);
    const [showMemberSearch, setShowMemberSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Resident[]>(available_residents);

    const { data, setData, put, processing, errors } = useForm<HouseholdFormData>({
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
        members: current_members || [],
    });

    const incomeRanges = [
        'Below ₱10,000',
        '₱10,000 - ₱20,000',
        '₱20,000 - ₱30,000',
        '₱30,000 - ₱50,000',
        '₱50,000 - ₱100,000',
        'Above ₱100,000'
    ];

    const housingTypes = [
        'Concrete',
        'Semi-concrete',
        'Wood',
        'Nipa/Bamboo',
        'Mixed Materials',
        'Others'
    ];

    const ownershipStatuses = [
        'Owned',
        'Rented',
        'Free Use',
        'With Consent',
        'Government Housing'
    ];

    const waterSources = [
        'Level I (Point Source)',
        'Level II (Communal Faucet)',
        'Level III (Waterworks System)',
        'Deep Well',
        'Shallow Well',
        'Spring',
        'Others'
    ];

    const relationshipTypes = [
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
    ];

    // Get the current head member
    const headMember = members.find(m => m.relationship === 'Head' || m.is_head);
    
    // Get the current head resident from heads list
    const currentHeadResident = headMember?.resident_id 
        ? heads.find(h => h.id === headMember.resident_id)
        : null;

    // Update form data when members change
    useEffect(() => {
        setData('total_members', members.length);
        setData('members', members.map(member => ({
            id: member.id,
            name: member.name,
            relationship: member.relationship,
            age: member.age,
            resident_id: member.resident_id,
            household_member_id: member.household_member_id,
            purok_id: member.purok_id,
            photo_path: member.photo_path,
            photo_url: member.photo_url,
            is_head: member.relationship === 'Head' || member.is_head,
        })));
    }, [members]);

    // Filter search results based on query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults(available_residents);
        } else {
            const filtered = available_residents.filter(resident => {
                const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase();
                const searchLower = searchQuery.toLowerCase();
                return fullName.includes(searchLower) ||
                    resident.first_name.toLowerCase().includes(searchLower) ||
                    resident.last_name.toLowerCase().includes(searchLower);
            });
            setSearchResults(filtered);
        }
    }, [searchQuery, available_residents]);

    const removeMember = (id: number) => {
        const memberToRemove = members.find(m => m.id === id);
        if (memberToRemove?.relationship === 'Head' || memberToRemove?.is_head) {
            alert('Cannot remove the head of family. Change the head first.');
            return;
        }
        
        if (members.length > 1) {
            setMembers(members.filter(member => member.id !== id));
        }
    };

    const updateMember = (id: number, field: string, value: string | number | undefined) => {
        setMembers(members.map(member => 
            member.id === id ? { ...member, [field]: value } : member
        ));
    };

    const addExistingResident = (resident: Resident) => {
        const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        
        // Check if this resident is already added
        const isAlreadyAdded = members.some(m => m.resident_id === resident.id);
        if (isAlreadyAdded) {
            alert('This resident is already added to the household.');
            return;
        }

        const fullName = `${resident.first_name} ${resident.last_name}`.trim();
        
        // Default relationship for new members (not head)
        const relationship = 'Other Relative';
        
        setMembers([...members, { 
            id: newId, 
            name: fullName, 
            relationship: relationship, 
            age: resident.age || 0,
            resident_id: resident.id,
            purok_id: resident.purok_id,
            purok_name: resident.purok_name,
            photo_path: resident.photo_path,
            photo_url: resident.photo_url,
            is_head: false,
        }]);
        
        setShowMemberSearch(false);
        setSearchQuery('');
    };

    const handleHeadChange = (value: string) => {
        if (!value) {
            // Clear head selection by removing any head member
            const newMembers = members.filter(m => m.relationship !== 'Head' && !m.is_head);
            setMembers(newMembers);
            return;
        }

        const selectedHead = heads.find(head => head.id.toString() === value);
        if (selectedHead) {
            const fullName = `${selectedHead.first_name} ${selectedHead.last_name}`.trim();
            
            // Update purok_id based on selected head
            if (selectedHead.purok_id) {
                setData('purok_id', selectedHead.purok_id);
            }
            
            // Check if head already exists in members
            const existingHeadIndex = members.findIndex(m => m.relationship === 'Head' || m.is_head);
            
            if (existingHeadIndex !== -1) {
                // Update existing head
                const updatedMembers = [...members];
                updatedMembers[existingHeadIndex] = {
                    ...updatedMembers[existingHeadIndex],
                    id: selectedHead.id,
                    name: fullName,
                    resident_id: selectedHead.id,
                    age: selectedHead.age || 0,
                    relationship: 'Head',
                    purok_id: selectedHead.purok_id,
                    purok_name: selectedHead.purok_name,
                    photo_path: selectedHead.photo_path,
                    photo_url: selectedHead.photo_url,
                    is_head: true,
                };
                setMembers(updatedMembers);
            } else {
                // Add new head as first member in the list
                const newHeadMember = { 
                    id: selectedHead.id, 
                    name: fullName, 
                    relationship: 'Head', 
                    age: selectedHead.age || 0,
                    resident_id: selectedHead.id,
                    purok_id: selectedHead.purok_id,
                    purok_name: selectedHead.purok_name,
                    photo_path: selectedHead.photo_path,
                    photo_url: selectedHead.photo_url,
                    is_head: true,
                };
                
                // Add head as first member in the list
                setMembers([newHeadMember, ...members.filter(m => !(m.relationship === 'Head' || m.is_head))]);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate that we have exactly one head member
        const headMembers = members.filter(m => m.relationship === 'Head' || m.is_head);
        if (headMembers.length !== 1) {
            alert('Household must have exactly one head member. Please select a head of family.');
            return;
        }
        
        put(`/admin/households/${household.id}`, {
            preserveScroll: true,
        });
    };

    const deleteHousehold = () => {
        if (confirm('Are you sure you want to delete this household? This action cannot be undone.')) {
            window.location.href = `/admin/households/${household.id}/delete`;
        }
    };

    // Get photo URL for a resident
    const getResidentPhotoUrl = (resident: Resident | HouseholdMember) => {
        return getPhotoUrl(resident.photo_path, resident.photo_url);
    };

    // Check if resident has photo
    const hasPhoto = (resident: Resident | HouseholdMember): boolean => {
        return !!(resident.photo_path || resident.photo_url);
    };

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
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
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
                                    Household #{household.household_number} • Last updated {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                type="button"
                                onClick={deleteHousehold}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Update Household'}
                            </Button>
                        </div>
                    </div>

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                            <p className="font-bold">Please fix the following errors:</p>
                            <ul className="list-disc list-inside mt-2">
                                {Object.entries(errors).map(([field, error]) => (
                                    <li key={field}><strong>{field}:</strong> {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Household Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Household Information */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Home className="h-5 w-5" />
                                        Basic Household Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Edit the household's basic details
                                    </CardDescription>
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
                                            {errors.household_number && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.household_number}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="registrationDate" className="dark:text-gray-300">Registration Date</Label>
                                            <Input 
                                                id="registrationDate" 
                                                type="date" 
                                                defaultValue={new Date().toISOString().split('T')[0]}
                                                readOnly
                                                className="bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:read-only:bg-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="head_resident_id" className="dark:text-gray-300">Head of Family *</Label>
                                        <Select 
                                            value={currentHeadResident?.id?.toString() || ''}
                                            onValueChange={handleHeadChange}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                <SelectValue placeholder="Select or search for head of family">
                                                    {currentHeadResident ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full overflow-hidden">
                                                                {hasPhoto(currentHeadResident) ? (
                                                                    <img 
                                                                        src={getResidentPhotoUrl(currentHeadResident)!}
                                                                        alt={currentHeadResident.first_name + ' ' + currentHeadResident.last_name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                                        <User className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span>{currentHeadResident.first_name} {currentHeadResident.last_name}</span>
                                                            {currentHeadResident.age && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    ({currentHeadResident.age} years)
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : 'Select head of family'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                {heads.map((head) => {
                                                    const fullName = `${head.first_name} ${head.last_name}`.trim();
                                                    return (
                                                        <SelectItem key={head.id} value={head.id.toString()} className="dark:text-white dark:focus:bg-gray-700 dark:hover:bg-gray-700">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-full overflow-hidden">
                                                                    {hasPhoto(head) ? (
                                                                        <img 
                                                                            src={getResidentPhotoUrl(head)!}
                                                                            alt={fullName}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                                            <User className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span>{fullName}</span>
                                                                {head.age && (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        ({head.age} years)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Select the head of family from available residents. The head will be added as the first household member.
                                        </p>
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
                                            {errors.contact_number && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.contact_number}</p>
                                            )}
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
                                            {errors.email && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                            )}
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
                                            placeholder="House No., Street, Barangay Kibawe" 
                                            required 
                                            rows={3}
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="purok_id" className="dark:text-gray-300">Purok *</Label>
                                            <Select 
                                                value={data.purok_id?.toString() || ''}
                                                onValueChange={(value) => setData('purok_id', value ? parseInt(value) : null)}
                                            >
                                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                    <SelectValue placeholder="Select purok">
                                                        {data.purok_id ? (
                                                            puroks.find(p => p.id === data.purok_id)?.name || 'Select purok'
                                                        ) : 'Select purok'}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    {puroks.map((purok) => (
                                                        <SelectItem key={purok.id} value={purok.id.toString()} className="dark:text-white dark:focus:bg-gray-700 dark:hover:bg-gray-700">
                                                            {purok.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.purok_id && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.purok_id}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nearestLandmark" className="dark:text-gray-300">Nearest Landmark</Label>
                                            <Input 
                                                id="nearestLandmark" 
                                                placeholder="e.g., Near barangay hall, beside school" 
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
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
                                                ({members.length} member{members.length !== 1 ? 's' : ''})
                                            </span>
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setShowMemberSearch(true)}
                                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            <Search className="h-4 w-4 mr-2" />
                                            Add Other Members
                                        </Button>
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        The head of family will appear here automatically when selected above. Add other family members below.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                   {/* Member Search Modal */}
                                   {showMemberSearch && (
                                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col dark:border dark:border-gray-700">
                                            <div className="p-6 border-b dark:border-gray-700">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold dark:text-white">Add Other Family Members</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            Search and select residents to add to this household
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowMemberSearch(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-white"
                                                        type="button"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    <Input
                                                        placeholder="Search by name, purok, or address..." 
                                                        className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 overflow-hidden">
                                                {available_residents.length === 0 ? (
                                                    <div className="p-8 text-center">
                                                        <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No Available Residents</h4>
                                                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                                            All residents already belong to households. You can create new residents or check if existing residents can be transferred.
                                                        </p>
                                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                            <Link 
                                                                href={`/admin/residents/create?return_to=/households/${household.id}/edit&purok_id=${data.purok_id || ''}`}
                                                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                                onClick={() => setShowMemberSearch(false)}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Create New Resident
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setShowMemberSearch(false)}
                                                                type="button"
                                                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full overflow-y-auto">
                                                        {searchQuery && searchResults.length === 0 ? (
                                                            <div className="p-8 text-center">
                                                                <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No Results Found</h4>
                                                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                                    No residents found for "<span className="font-medium">{searchQuery}</span>"
                                                                </p>
                                                                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                                                                    Try a different search term or create a new resident.
                                                                </p>
                                                                <Link 
                                                                    href={`/admin/residents/create?return_to=/households/${household.id}/edit&name=${encodeURIComponent(searchQuery)}&household_id=${household.id}&purok_id=${data.purok_id || ''}`}
                                                                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                                    onClick={() => setShowMemberSearch(false)}
                                                                >
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Create New Resident
                                                                </Link>
                                                            </div>
                                                        ) : (
                                                            <div className="divide-y dark:divide-gray-700">
                                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-gray-600 dark:text-gray-400">
                                                                            {searchQuery ? `${searchResults.length} results found` : `${available_residents.length} available residents`}
                                                                        </span>
                                                                        <span className="text-gray-500 dark:text-gray-400">
                                                                            {members.length} member{members.length !== 1 ? 's' : ''} in household
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                
                                                                {searchResults.map((resident) => {
                                                                    const fullName = `${resident.first_name} ${resident.last_name}`.trim();
                                                                    const isAlreadyAdded = members.some(m => m.resident_id === resident.id);
                                                                    const isHead = currentHeadResident?.id === resident.id;
                                                                    const currentPurok = resident.purok_name || 'No purok';
                                                                    const photoUrl = getResidentPhotoUrl(resident);
                                                                    
                                                                    return (
                                                                        <div 
                                                                            key={resident.id} 
                                                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                                                                isAlreadyAdded || isHead ? 'opacity-75' : ''
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-start gap-3">
                                                                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center overflow-hidden ${
                                                                                        isHead 
                                                                                            ? 'border-2 border-blue-500 dark:border-blue-400' 
                                                                                            : isAlreadyAdded
                                                                                            ? 'border-2 border-green-500 dark:border-green-400'
                                                                                            : 'border border-gray-300 dark:border-gray-600'
                                                                                    }`}>
                                                                                        {photoUrl ? (
                                                                                            <img 
                                                                                                src={photoUrl}
                                                                                                alt={fullName}
                                                                                                className="h-full w-full object-cover"
                                                                                                onError={(e) => {
                                                                                                    e.currentTarget.style.display = 'none';
                                                                                                    const parent = e.currentTarget.parentElement;
                                                                                                    if (parent) {
                                                                                                        parent.innerHTML = `
                                                                                                            <div class="h-full w-full flex items-center justify-center ${
                                                                                                                isHead 
                                                                                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                                                                                                    : isAlreadyAdded
                                                                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                                                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                                                                            }">
                                                                                                                <User class="h-6 w-6" />
                                                                                                            </div>
                                                                                                        `;
                                                                                                    }
                                                                                                }}
                                                                                            />
                                                                                        ) : (
                                                                                            <div className={`h-full w-full flex items-center justify-center ${
                                                                                                isHead 
                                                                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                                                                                    : isAlreadyAdded
                                                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                                                            }`}>
                                                                                                <User className="h-6 w-6" />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="font-medium flex items-center gap-2 dark:text-white">
                                                                                            {fullName}
                                                                                            {isHead && (
                                                                                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                                                                                    Current Head
                                                                                                </span>
                                                                                            )}
                                                                                            {isAlreadyAdded && !isHead && (
                                                                                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                                                                                                    Already in Household
                                                                                                </span>
                                                                                            )}
                                                                                            {photoUrl && (
                                                                                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded flex items-center gap-1">
                                                                                                    <Camera className="h-3 w-3" />
                                                                                                    Photo
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                                                                                            {resident.age ? `${resident.age} years old` : 'Age not specified'}
                                                                                            {currentPurok && ` • Purok: ${currentPurok}`}
                                                                                            {resident.address && (
                                                                                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-md">
                                                                                                    {resident.address}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                <div className="flex items-center gap-2">
                                                                                    {isHead ? (
                                                                                        <div className="text-sm text-blue-600 dark:text-blue-400 px-3 py-1 border border-blue-200 dark:border-blue-800 rounded bg-blue-50 dark:bg-blue-900/30">
                                                                                            Current Head
                                                                                        </div>
                                                                                    ) : isAlreadyAdded ? (
                                                                                        <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900">
                                                                                            Already Added
                                                                                        </div>
                                                                                    ) : (
                                                                                        <Button 
                                                                                            size="sm" 
                                                                                            onClick={() => addExistingResident(resident)}
                                                                                            type="button"
                                                                                            className="whitespace-nowrap dark:bg-blue-600 dark:hover:bg-blue-700"
                                                                                        >
                                                                                            <Plus className="h-4 w-4 mr-2" />
                                                                                            Add to Household
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {/* Show if resident is from different purok */}
                                                                            {!isHead && !isAlreadyAdded && resident.purok_id && resident.purok_id !== data.purok_id && (
                                                                                <div className="mt-3 pt-3 border-t border-dashed border-amber-200 dark:border-amber-800">
                                                                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                                                                                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                                                                        <span>
                                                                                            Note: This resident is from Purok {currentPurok}. Adding them will transfer them to this household's purok.
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                                
                                                                {/* Show message if no residents match search */}
                                                                {!searchQuery && searchResults.length === 0 && (
                                                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                                        <User className="h-8 w-8 mx-auto mb-3" />
                                                                        No available residents to add.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setShowMemberSearch(false);
                                                                setSearchQuery('');
                                                            }}
                                                            type="button"
                                                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                                        >
                                                            Close
                                                        </Button>
                                                        {available_residents.length > 0 && (
                                                            <Link 
                                                                href={`/admin/residents/create?return_to=/households/${household.id}/edit&purok_id=${data.purok_id || ''}`}
                                                                className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                                onClick={() => setShowMemberSearch(false)}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Create New Resident
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                    <div className="space-y-4">
                                        {members.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg dark:border-gray-700">
                                                <User className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No head of family selected</h3>
                                                <p className="text-gray-500 dark:text-gray-500 mb-4">
                                                    Select a head of family from the dropdown above to start
                                                </p>
                                                <div className="text-sm text-gray-400 dark:text-gray-600">
                                                    Once selected, they will appear here automatically
                                                </div>
                                            </div>
                                        ) : (
                                            members.map((member) => {
                                                const photoUrl = getResidentPhotoUrl(member);
                                                const isHead = member.relationship === 'Head' || member.is_head;
                                                return (
                                                    <div key={member.id} className="border rounded-lg p-4 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 transition-colors dark:bg-gray-900/50">
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
                                                                            alt={member.name}
                                                                            className="h-full w-full object-cover"
                                                                            onError={(e) => {
                                                                                e.currentTarget.style.display = 'none';
                                                                                const parent = e.currentTarget.parentElement;
                                                                                if (parent) {
                                                                                    parent.innerHTML = `
                                                                                        <div class="h-full w-full flex items-center justify-center ${
                                                                                            isHead
                                                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                                                        }">
                                                                                            ${isHead ? '<Home class="h-5 w-5" />' : '<User class="h-5 w-5" />'}
                                                                                        </div>
                                                                                    `;
                                                                                }
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className={`h-full w-full flex items-center justify-center ${
                                                                            isHead
                                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                                        }`}>
                                                                            {isHead ? (
                                                                                <Home className="h-5 w-5" />
                                                                            ) : (
                                                                                <User className="h-5 w-5" />
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium flex items-center gap-2 dark:text-white">
                                                                        {member.name || `Member #${member.id}`}
                                                                        {isHead ? (
                                                                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                                                                Head of Family
                                                                            </span>
                                                                        ) : null}
                                                                        {photoUrl && (
                                                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded flex items-center gap-1">
                                                                                <Camera className="h-3 w-3" />
                                                                                Photo
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {member.relationship}
                                                                        {member.age > 0 && ` • ${member.age} years old`}
                                                                        {member.resident_id && !isHead && (
                                                                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                                                                                Existing Resident
                                                                            </span>
                                                                        )}
                                                                        {member.purok_name && (
                                                                            <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                                                                                Purok: {member.purok_name}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {!isHead && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeMember(member.id)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Relationship Selection for non-head members */}
                                                        {!isHead && (
                                                            <div className="mt-4">
                                                                <Label htmlFor={`relationship-${member.id}`} className="dark:text-gray-300">Relationship to Head</Label>
                                                                <Select 
                                                                    value={member.relationship}
                                                                    onValueChange={(value) => updateMember(member.id, 'relationship', value)}
                                                                >
                                                                    <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                                        <SelectValue placeholder="Select relationship" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                                        {relationshipTypes
                                                                            .filter(rel => rel !== 'Head') // Remove Head option for non-head members
                                                                            .map((relationship) => (
                                                                                <SelectItem key={relationship} value={relationship} className="dark:text-white dark:focus:bg-gray-700 dark:hover:bg-gray-700">
                                                                                    {relationship}
                                                                                </SelectItem>
                                                                            ))
                                                                        }
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}
                                                        
                                                        {!member.resident_id && member.name && !isHead && (
                                                            <div className="mt-3 pt-3 border-t border-dashed dark:border-gray-700">
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                    This member is not in the residents database yet.
                                                                </div>
                                                                <Link 
                                                                    href={`/admin/residents/create?return_to=/households/${household.id}/edit&name=${encodeURIComponent(member.name)}&age=${member.age}&relationship=${encodeURIComponent(member.relationship)}&household_id=${household.id}&purok_id=${data.purok_id || ''}`}
                                                                    target="_blank"
                                                                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                    Add to Residents Database
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
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
                                                    {housingTypes.map((type) => (
                                                        <SelectItem key={type} value={type} className="dark:text-white dark:focus:bg-gray-700 dark:hover:bg-gray-700">
                                                            {type}
                                                        </SelectItem>
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
                                                    {ownershipStatuses.map((status) => (
                                                        <SelectItem key={status} value={status} className="dark:text-white dark:focus:bg-gray-700 dark:hover:bg-gray-700">
                                                            {status}
                                                        </SelectItem>
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
                                                    {waterSources.map((source) => (
                                                        <SelectItem key={source} value={source} className="dark:text-white dark:focus:bg-gray-700 dark:hover:bg-gray-700">
                                                            {source}
                                                        </SelectItem>
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
                                                    {incomeRanges.map((range) => (
                                                        <SelectItem key={range} value={range} className="dark:text-white dark:focus:bg-gray-700 dark:hover:bg-gray-700">
                                                            {range}
                                                        </SelectItem>
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
                                                className="dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                                            />
                                            <Label htmlFor="electricity" className="text-sm dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4" />
                                                    Has electricity connection
                                                </div>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="internet" 
                                                checked={data.internet}
                                                onCheckedChange={(checked) => setData('internet', checked as boolean)}
                                                className="dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                                            />
                                            <Label htmlFor="internet" className="text-sm dark:text-gray-300">
                                                Has internet connection
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="vehicle" 
                                                checked={data.vehicle}
                                                onCheckedChange={(checked) => setData('vehicle', checked as boolean)}
                                                className="dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                                            />
                                            <Label htmlFor="vehicle" className="text-sm dark:text-gray-300">
                                                Owns a vehicle
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="remarks" className="dark:text-gray-300">Remarks/Notes</Label>
                                        <Textarea 
                                            id="remarks" 
                                            placeholder="Any additional information about this household..."
                                            rows={3}
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Summary & Actions */}
                        <div className="space-y-6">
                            {/* Household Summary */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Household Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Household #:</span>
                                            <span className="font-mono font-bold dark:text-white">{household.household_number}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Total Members:</span>
                                            <span className="font-bold text-lg dark:text-white">{members.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Purok:</span>
                                            <span className="font-medium dark:text-white">
                                                {data.purok_id ? (
                                                    puroks.find(p => p.id === data.purok_id)?.name || 'Not set'
                                                ) : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="border-t dark:border-gray-700 pt-4">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Members with Photos:</div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {members.filter(m => hasPhoto(m)).length} of {members.length} members
                                                </span>
                                                <span className="text-sm font-medium dark:text-white">
                                                    {Math.round((members.filter(m => hasPhoto(m)).length / Math.max(members.length, 1)) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <div 
                                                    className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" 
                                                    style={{ width: `${(members.filter(m => hasPhoto(m)).length / Math.max(members.length, 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Registration Checklist */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Edit Checklist</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className={`flex items-center space-x-2 ${headMember ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                            <div className={`h-5 w-5 rounded-full ${headMember ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${headMember ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-500'}`}></div>
                                            </div>
                                            <span className="text-sm">Head of family information</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${data.address ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                            <div className={`h-5 w-5 rounded-full ${data.address ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${data.address ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-500'}`}></div>
                                            </div>
                                            <span className="text-sm">Complete address</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${data.contact_number ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                            <div className={`h-5 w-5 rounded-full ${data.contact_number ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${data.contact_number ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-500'}`}></div>
                                            </div>
                                            <span className="text-sm">Contact information</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${data.purok_id ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            <div className={`h-5 w-5 rounded-full ${data.purok_id ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${data.purok_id ? 'bg-green-600 dark:bg-green-400' : 'bg-amber-600 dark:bg-amber-400'}`}></div>
                                            </div>
                                            <span className="text-sm">Purok selection</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${members.length > 1 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            <div className={`h-5 w-5 rounded-full ${members.length > 1 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${members.length > 1 ? 'bg-green-600 dark:bg-green-400' : 'bg-amber-600 dark:bg-amber-400'}`}></div>
                                            </div>
                                            <span className="text-sm">Household members ({members.length})</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" type="button">
                                        Print Household Profile
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" type="button">
                                        View History
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" type="button">
                                        Generate Report
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" type="button">
                                        Check Duplicates
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Water Source Info */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Droplets className="h-5 w-5" />
                                        Water Source Guide
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                            <span className="dark:text-gray-300">Level I: Point Source (Well, Spring)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                            <span className="dark:text-gray-300">Level II: Communal Faucet</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                            <span className="dark:text-gray-300">Level III: Waterworks System</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Link href={`/admin/households/${household.id}`}>
                                <Button variant="ghost" type="button" className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                type="button"
                                onClick={() => {
                                    // Reset form to original values
                                    setData({
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
                                        members: current_members || [],
                                    });
                                    setMembers(current_members || []);
                                }}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                                Reset Changes
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={processing} className="dark:bg-blue-600 dark:hover:bg-blue-700">
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Updating...' : 'Update Household'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}