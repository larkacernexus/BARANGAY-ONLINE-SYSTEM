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
    AlertCircle,
    Key,
    Shield,
    Check,
    ChevronDown,
    Filter,
    Square,
    CheckSquare
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
    purok?: string;
}

interface Purok {
    id: number;
    name: string;
}

interface HouseholdFormData {
    household_number?: string;
    head_of_family: string;
    head_resident_id?: number | null;
    contact_number: string;
    email?: string;
    address: string;
    purok_id: number | null;
    purok_name?: string;
    total_members: number;
    income_range?: string;
    housing_type?: string;
    ownership_status?: string;
    water_source?: string;
    electricity: boolean;
    internet: boolean;
    vehicle: boolean;
    remarks?: string;
    members: Array<{
        id: number;
        name: string;
        relationship: string;
        age: number;
        resident_id?: number;
    }>;
    create_user_account: boolean;
}

interface CreateHouseholdProps extends PageProps {
    heads: Resident[];
    puroks: Purok[];
    available_residents?: Resident[];
}

export default function CreateHousehold({ heads, puroks, available_residents = [] }: CreateHouseholdProps) {
    const [members, setMembers] = useState<Array<{
        id: number;
        name: string;
        relationship: string;
        age: number;
        resident_id?: number;
    }>>([]);
    const [showMemberSearch, setShowMemberSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Resident[]>(available_residents);
    const [selectedResidents, setSelectedResidents] = useState<number[]>([]);
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [bulkRelationship, setBulkRelationship] = useState<string>('Other Relative');
    const [showBulkOptions, setShowBulkOptions] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{
        username: string;
        password: string;
        name: string;
        email?: string;
    } | null>(null);

    const { data, setData, post, processing, errors } = useForm<HouseholdFormData>({
        household_number: '',
        head_of_family: '',
        head_resident_id: null,
        contact_number: '',
        email: '',
        address: '',
        purok_id: null,
        purok_name: '',
        total_members: 0,
        income_range: '',
        housing_type: '',
        ownership_status: '',
        water_source: '',
        electricity: false,
        internet: false,
        vehicle: false,
        remarks: '',
        members: [],
        create_user_account: true,
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

    // Update form data when members change
    useEffect(() => {
        setData('total_members', members.length);
        setData('members', members.map(member => ({
            id: member.id,
            name: member.name,
            relationship: member.relationship,
            age: member.age,
            resident_id: member.resident_id
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

    // Reset selected residents when modal closes
    useEffect(() => {
        if (!showMemberSearch) {
            setSelectedResidents([]);
            setSearchQuery('');
            setIsMultiSelectMode(false);
            setShowBulkOptions(false);
        }
    }, [showMemberSearch]);

    const removeMember = (id: number) => {
        const memberToRemove = members.find(m => m.id === id);
        if (memberToRemove?.relationship === 'Head') {
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

    const toggleResidentSelection = (residentId: number) => {
        setSelectedResidents(prev => 
            prev.includes(residentId)
                ? prev.filter(id => id !== residentId)
                : [...prev, residentId]
        );
    };

    const addSingleResident = (resident: Resident) => {
        // Check if already added
        const isAlreadyAdded = members.some(m => m.resident_id === resident.id);
        if (isAlreadyAdded) {
            alert('This resident is already added to the household.');
            return;
        }

        // Check if is head
        if (resident.id === data.head_resident_id) {
            alert('This resident is already the head of family.');
            return;
        }

        const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        const fullName = `${resident.first_name} ${resident.last_name}`.trim();
        
        setMembers(prev => [...prev, { 
            id: newId, 
            name: fullName, 
            relationship: 'Other Relative', 
            age: resident.age || 0,
            resident_id: resident.id
        }]);
        
        setShowMemberSearch(false);
        setSearchQuery('');
    };

    const addMultipleResidents = () => {
        if (selectedResidents.length === 0) {
            alert('Please select at least one resident to add.');
            return;
        }

        const existingResidentIds = members.map(m => m.resident_id).filter(id => id !== undefined);
        
        const residentsToAdd = available_residents.filter(resident => 
            selectedResidents.includes(resident.id) && 
            !existingResidentIds.includes(resident.id) &&
            resident.id !== data.head_resident_id
        );

        if (residentsToAdd.length === 0) {
            alert('Selected residents are already added or are the head of family.');
            return;
        }

        const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        const newMembers = residentsToAdd.map((resident, index) => {
            const fullName = `${resident.first_name} ${resident.last_name}`.trim();
            return {
                id: newId + index,
                name: fullName,
                relationship: bulkRelationship,
                age: resident.age || 0,
                resident_id: resident.id
            };
        });

        setMembers(prev => [...prev, ...newMembers]);
        setSelectedResidents([]);
        setShowBulkOptions(false);
        setShowMemberSearch(false);
        setSearchQuery('');
        setIsMultiSelectMode(false);
    };

    const selectAllResults = () => {
        const selectableResidents = searchResults.filter(resident => 
            resident.id !== data.head_resident_id &&
            !members.some(m => m.resident_id === resident.id)
        );
        
        if (selectableResidents.length === 0) {
            alert('No selectable residents in the current results.');
            return;
        }
        
        setSelectedResidents(selectableResidents.map(r => r.id));
    };

    const clearSelection = () => {
        setSelectedResidents([]);
    };

    const handleHeadChange = (value: string) => {
        if (!value) {
            // Clear head selection
            setData('head_of_family', '');
            setData('head_resident_id', null);
            
            // Remove head from members if exists
            const headMemberIndex = members.findIndex(m => m.relationship === 'Head');
            if (headMemberIndex !== -1) {
                const newMembers = [...members];
                newMembers.splice(headMemberIndex, 1);
                setMembers(newMembers);
            }
            return;
        }

        const selectedHead = heads.find(head => head.id.toString() === value);
        if (selectedHead) {
            const fullName = `${selectedHead.first_name} ${selectedHead.last_name}`.trim();
            setData('head_of_family', fullName);
            setData('head_resident_id', parseInt(value));
            
            // Check if head already exists in members
            const existingHeadIndex = members.findIndex(m => m.relationship === 'Head');
            
            if (existingHeadIndex !== -1) {
                // Update existing head
                const updatedMembers = [...members];
                updatedMembers[existingHeadIndex] = {
                    ...updatedMembers[existingHeadIndex],
                    name: fullName,
                    resident_id: selectedHead.id,
                    age: selectedHead.age || 0,
                    relationship: 'Head'
                };
                setMembers(updatedMembers);
            } else {
                // Add new head as first member
                const newHeadMember = { 
                    id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1, 
                    name: fullName, 
                    relationship: 'Head', 
                    age: selectedHead.age || 0,
                    resident_id: selectedHead.id 
                };
                
                // Add head as first member in the list
                setMembers([newHeadMember, ...members.filter(m => m.relationship !== 'Head')]);
            }
        }
    };

    const handlePurokChange = (value: string) => {
        const purokId = parseInt(value);
        const selectedPurok = puroks.find(p => p.id === purokId);
        setData('purok_id', purokId);
        if (selectedPurok) {
            setData('purok_name', selectedPurok.name);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/households', {
            preserveScroll: true,
            onSuccess: (page) => {
                setMembers([]);
                if (page.props.flash?.user_credentials) {
                    setCreatedCredentials(page.props.flash.user_credentials);
                }
            }
        });
    };

    const clearForm = () => {
        setMembers([]);
        setData({
            household_number: '',
            head_of_family: '',
            head_resident_id: null,
            contact_number: '',
            email: '',
            address: '',
            purok_id: null,
            purok_name: '',
            total_members: 0,
            income_range: '',
            housing_type: '',
            ownership_status: '',
            water_source: '',
            electricity: false,
            internet: false,
            vehicle: false,
            remarks: '',
            members: [],
            create_user_account: true,
        });
    };

    const EmptyState = ({ icon: Icon, title, description, action }: { 
        icon: React.ElementType; 
        title: string; 
        description: string; 
        action?: React.ReactNode;
    }) => (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Icon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">{title}</h3>
            <p className="text-gray-500 mb-4">{description}</p>
            {action}
        </div>
    );

    return (
        <AppLayout
            title="Register Household"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Households', href: '/households' },
                { title: 'Register Household', href: '/households/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/households">
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Register New Household</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Register a new household in the barangay database
                                </p>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Household'}
                        </Button>
                    </div>

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Home className="h-5 w-5" />
                                        Basic Household Information
                                    </CardTitle>
                                    <CardDescription>
                                        Enter the household's basic details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="householdNumber">Household Number</Label>
                                            <Input 
                                                id="householdNumber" 
                                                placeholder="Auto-generated if empty"
                                                value={data.household_number}
                                                onChange={(e) => setData('household_number', e.target.value)}
                                            />
                                            {errors.household_number && (
                                                <p className="text-sm text-red-600">{errors.household_number}</p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Format: HH-YYYY-XXXXX
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="registrationDate">Registration Date *</Label>
                                            <Input 
                                                id="registrationDate" 
                                                type="date" 
                                                required 
                                                defaultValue={new Date().toISOString().split('T')[0]}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="head_resident_id">Head of Family *</Label>
                                        <Select 
                                            value={data.head_resident_id?.toString() || ''}
                                            onValueChange={handleHeadChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select or search for head of family" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {heads.length === 0 ? (
                                                    <div className="px-2 py-4 text-center text-gray-500 text-sm">
                                                        <AlertCircle className="h-4 w-4 inline-block mr-1" />
                                                        No available residents to select as head
                                                    </div>
                                                ) : (
                                                    heads.map((head) => {
                                                        const fullName = `${head.first_name} ${head.last_name}`.trim();
                                                        return (
                                                            <SelectItem key={head.id} value={head.id.toString()}>
                                                                {fullName}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.head_resident_id && (
                                            <p className="text-sm text-red-600">{errors.head_resident_id}</p>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            {heads.length === 0 && (
                                                <div className="flex items-center gap-1 text-amber-600">
                                                    <AlertCircle className="h-3 w-3" />
                                                    All residents already belong to households. <Link href="/residents/create" className="text-blue-600 hover:underline">Create a new resident</Link>
                                                </div>
                                            )}
                                        </div>
                                        <Input 
                                            value={data.head_of_family}
                                            onChange={(e) => setData('head_of_family', e.target.value)}
                                            placeholder="Or enter name manually"
                                            className="mt-2"
                                        />
                                        {errors.head_of_family && (
                                            <p className="text-sm text-red-600">{errors.head_of_family}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="contactNumber">Contact Number *</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input 
                                                    id="contactNumber" 
                                                    placeholder="09123456789" 
                                                    className="pl-10" 
                                                    required 
                                                    value={data.contact_number}
                                                    onChange={(e) => setData('contact_number', e.target.value)}
                                                />
                                            </div>
                                            {errors.contact_number && (
                                                <p className="text-sm text-red-600">{errors.contact_number}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input 
                                                    id="email" 
                                                    type="email" 
                                                    placeholder="family@example.com" 
                                                    className="pl-10" 
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* User Account Creation */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="create_user_account" 
                                                checked={data.create_user_account}
                                                onCheckedChange={(checked) => setData('create_user_account', checked as boolean)}
                                            />
                                            <Label htmlFor="create_user_account" className="text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Key className="h-4 w-4" />
                                                    Create User Account for Head
                                                </div>
                                            </Label>
                                        </div>
                                        
                                        {data.create_user_account && (
                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                <p className="text-sm text-blue-700 mb-2">
                                                    <strong>Note:</strong> A user account will be created with:
                                                </p>
                                                <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
                                                    <li>Username: Generated from name (e.g., juan.delacruz)</li>
                                                    <li>Initial password: Full contact number</li>
                                                    <li>Will be required to change password on first login</li>
                                                    <li>Email notifications will be sent if email is provided</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Address Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Address Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="completeAddress">Complete Address *</Label>
                                        <Textarea 
                                            id="completeAddress" 
                                            placeholder="House No., Street, Barangay Kibawe" 
                                            required 
                                            rows={3}
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-600">{errors.address}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="purok">Purok *</Label>
                                            <Select 
                                                value={data.purok_id?.toString() || ''}
                                                onValueChange={handlePurokChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select purok" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {puroks.length === 0 ? (
                                                        <div className="px-2 py-4 text-center text-gray-500 text-sm">
                                                            <AlertCircle className="h-4 w-4 inline-block mr-1" />
                                                            No puroks available
                                                        </div>
                                                    ) : (
                                                        puroks.map((purok) => (
                                                            <SelectItem key={purok.id} value={purok.id.toString()}>
                                                                {purok.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.purok_id && (
                                                <p className="text-sm text-red-600">{errors.purok_id}</p>
                                            )}
                                            {puroks.length === 0 && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    <AlertCircle className="h-3 w-3 inline mr-1" />
                                                    Please create puroks first in the system settings.
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nearestLandmark">Nearest Landmark</Label>
                                            <Input 
                                                id="nearestLandmark" 
                                                placeholder="e.g., Near barangay hall, beside school" 
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Household Members */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Household Members
                                            <span className="text-sm font-normal text-gray-500">
                                                ({members.length} member{members.length !== 1 ? 's' : ''})
                                            </span>
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setShowMemberSearch(true)}
                                            disabled={available_residents.length === 0}
                                        >
                                            <Search className="h-4 w-4 mr-2" />
                                            Add Other Members
                                        </Button>
                                    </CardTitle>
                                    <CardDescription>
                                        The head of family will appear here automatically when selected above. Add other family members below.
                                    </CardDescription>
                                    {available_residents.length === 0 && (
                                        <div className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            All residents already belong to households. <Link href="/residents/create" className="text-blue-600 hover:underline">Create new residents</Link>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                   {/* Enhanced Member Search Modal */}
{showMemberSearch && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold dark:text-gray-100">Add Family Members</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {isMultiSelectMode 
                                ? "Select multiple residents to add to this household" 
                                : "Add individual residents to this household"
                            }
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setShowMemberSearch(false);
                            setSearchQuery('');
                        }}
                        className="h-8 w-8 p-0"
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by name..." 
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    <Button
                        type="button"
                        variant={isMultiSelectMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setIsMultiSelectMode(!isMultiSelectMode);
                            if (isMultiSelectMode) {
                                setSelectedResidents([]);
                            }
                        }}
                        className="whitespace-nowrap"
                    >
                        {isMultiSelectMode ? (
                            <>
                                <CheckSquare className="h-4 w-4 mr-2" />
                                Multi-Select Mode
                            </>
                        ) : (
                            <>
                                <Square className="h-4 w-4 mr-2" />
                                Enable Multi-Select
                            </>
                        )}
                    </Button>
                </div>
                
                {/* Multi-select options */}
                {isMultiSelectMode && (
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                            {searchResults.length} available resident{searchResults.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {selectedResidents.length} selected
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={selectAllResults}
                                disabled={searchResults.length === 0}
                                className="h-7 px-2"
                            >
                                Select All
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearSelection}
                                disabled={selectedResidents.length === 0}
                                className="h-7 px-2"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Bulk Options Panel for Multi-select */}
            {isMultiSelectMode && selectedResidents.length > 0 && !showBulkOptions && (
                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b dark:border-blue-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                {selectedResidents.length} resident{selectedResidents.length !== 1 ? 's' : ''} selected
                            </span>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setShowBulkOptions(true)}
                        >
                            Set Relationship & Add
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
            
            {showBulkOptions && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-b dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium dark:text-gray-200">Add Multiple Residents</h4>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBulkOptions(false)}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="bulk-relationship" className="text-sm mb-2 block">
                                Set relationship for all selected residents:
                            </Label>
                            <Select
                                value={bulkRelationship}
                                onValueChange={setBulkRelationship}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    {relationshipTypes.map((relationship) => (
                                        <SelectItem key={relationship} value={relationship}>
                                            {relationship}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2">
                            <Button
                                type="button"
                                onClick={addMultipleResidents}
                                className="flex-1"
                            >
                                Add {selectedResidents.length} Resident{selectedResidents.length !== 1 ? 's' : ''}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowBulkOptions(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Resident List */}
            <div className="flex-1 overflow-hidden">
                {available_residents.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No Available Residents</h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            All residents already belong to households. You need to create new residents first.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link 
                                href="/residents/create?return_to=/households/create"
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
                                    href={`/residents/create?return_to=/households/create&name=${encodeURIComponent(searchQuery)}&household_head_id=${data.head_resident_id || ''}`}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    onClick={() => setShowMemberSearch(false)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Resident
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y dark:divide-gray-700">
                                {searchResults.map((resident) => {
                                    const fullName = `${resident.first_name} ${resident.last_name}`.trim();
                                    const isAlreadyAdded = members.some(m => m.resident_id === resident.id);
                                    const isHead = resident.id === data.head_resident_id;
                                    const isSelected = selectedResidents.includes(resident.id);
                                    const isSelectable = !isAlreadyAdded && !isHead;
                                    
                                    return (
                                        <div 
                                            key={resident.id} 
                                            className={`p-4 transition-colors ${
                                                isMultiSelectMode && isSelectable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''
                                            } ${
                                                !isSelectable ? 'opacity-60' : ''
                                            } ${
                                                isMultiSelectMode && isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                                            }`}
                                            onClick={() => isMultiSelectMode && isSelectable && toggleResidentSelection(resident.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="relative">
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                                            isHead 
                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                                                                : isAlreadyAdded
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                                                        }`}>
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                        {isMultiSelectMode && isSelected && (
                                                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                                                <Check className="h-3 w-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2 dark:text-gray-100">
                                                            {fullName}
                                                            {isHead && (
                                                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                                                    Head
                                                                </span>
                                                            )}
                                                            {isAlreadyAdded && !isHead && (
                                                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                                                                    Added
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                                                            {resident.age ? `${resident.age} years old` : 'Age not specified'}
                                                            {resident.purok && ` • Purok ${resident.purok}`}
                                                            {resident.address && (
                                                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-md">
                                                                    {resident.address}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {!isSelectable ? (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
                                                            {isHead ? 'Head of Family' : 'Already Added'}
                                                        </div>
                                                    ) : isMultiSelectMode ? (
                                                        <Button 
                                                            size="sm" 
                                                            variant={isSelected ? "default" : "outline"}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleResidentSelection(resident.id);
                                                            }}
                                                            type="button"
                                                        >
                                                            {isSelected ? 'Selected' : 'Select'}
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => addSingleResident(resident)}
                                                            type="button"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {isMultiSelectMode ? (
                            selectedResidents.length > 0 ? (
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    {selectedResidents.length} resident{selectedResidents.length !== 1 ? 's' : ''} selected
                                </span>
                            ) : (
                                'Click "Enable Multi-Select" to select multiple residents at once'
                            )
                        ) : (
                            'Click "Add" to add individual residents'
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowMemberSearch(false);
                                setSearchQuery('');
                            }}
                            type="button"
                        >
                            Cancel
                        </Button>
                        {isMultiSelectMode && selectedResidents.length > 0 && (
                            <Button
                                variant="default"
                                onClick={() => setShowBulkOptions(true)}
                                type="button"
                            >
                                Add Selected ({selectedResidents.length})
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
)}

                                    <div className="space-y-4">
                                        {members.length === 0 ? (
                                            <EmptyState
                                                icon={User}
                                                title="No members added"
                                                description="Select a head of family from the dropdown above to start. Once selected, they will appear here automatically."
                                            />
                                        ) : (
                                            members.map((member) => (
                                                <div key={member.id} className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                                member.relationship === 'Head' 
                                                                    ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                            }`}>
                                                                {member.relationship === 'Head' ? (
                                                                    <Home className="h-4 w-4" />
                                                                ) : (
                                                                    <User className="h-4 w-4" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium flex items-center gap-2">
                                                                    {member.name || `Member #${member.id}`}
                                                                    {member.relationship === 'Head' && (
                                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                                            Head of Family
                                                                        </span>
                                                                    )}
                                                                    {data.create_user_account && member.relationship === 'Head' && (
                                                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                                                            User Account
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {member.relationship}
                                                                    {member.age > 0 && ` • ${member.age} years old`}
                                                                    {member.resident_id && member.relationship !== 'Head' && (
                                                                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                                            Existing Resident
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {member.relationship !== 'Head' && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeMember(member.id)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Relationship Selection for non-head members */}
                                                    {member.relationship !== 'Head' && (
                                                        <div className="mt-4">
                                                            <Label htmlFor={`relationship-${member.id}`}>Relationship to Head</Label>
                                                            <Select 
                                                                value={member.relationship}
                                                                onValueChange={(value) => updateMember(member.id, 'relationship', value)}
                                                            >
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue placeholder="Select relationship" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {relationshipTypes.map((relationship) => (
                                                                        <SelectItem key={relationship} value={relationship}>
                                                                            {relationship}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                    
                                                    {!member.resident_id && member.name && member.relationship !== 'Head' && (
                                                        <div className="mt-3 pt-3 border-t border-dashed">
                                                            <div className="text-sm text-gray-600 mb-2">
                                                                This member is not in the residents database yet.
                                                            </div>
                                                            <Link 
                                                                href={`/residents/create?return_to=/households/create&name=${encodeURIComponent(member.name)}&age=${member.age}&relationship=${encodeURIComponent(member.relationship)}&household_head_id=${data.head_resident_id || ''}`}
                                                                target="_blank"
                                                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                                Add to Residents Database
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Housing & Economic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Housing & Economic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="housingType">Housing Type</Label>
                                            <Select 
                                                value={data.housing_type}
                                                onValueChange={(value) => setData('housing_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select housing type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {housingTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ownershipStatus">Ownership Status</Label>
                                            <Select 
                                                value={data.ownership_status}
                                                onValueChange={(value) => setData('ownership_status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ownership status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ownershipStatuses.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="waterSource">Water Source</Label>
                                            <Select 
                                                value={data.water_source}
                                                onValueChange={(value) => setData('water_source', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select water source" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {waterSources.map((source) => (
                                                        <SelectItem key={source} value={source}>
                                                            {source}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="incomeRange">Monthly Income Range</Label>
                                            <Select 
                                                value={data.income_range}
                                                onValueChange={(value) => setData('income_range', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select income range" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {incomeRanges.map((range) => (
                                                        <SelectItem key={range} value={range}>
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
                                            />
                                            <Label htmlFor="electricity" className="text-sm">
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
                                            />
                                            <Label htmlFor="internet" className="text-sm">
                                                Has internet connection
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="vehicle" 
                                                checked={data.vehicle}
                                                onCheckedChange={(checked) => setData('vehicle', checked as boolean)}
                                            />
                                            <Label htmlFor="vehicle" className="text-sm">
                                                Owns a vehicle
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="remarks">Remarks/Notes</Label>
                                        <Textarea 
                                            id="remarks" 
                                            placeholder="Any additional information about this household..."
                                            rows={3}
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Summary & Actions */}
                        <div className="space-y-6">
                            {/* Household Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Household Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Total Members:</span>
                                            <span className="font-bold text-lg">{members.length}</span>
                                        </div>
                                        <div className="border-t pt-4">
                                            <div className="text-sm font-medium text-gray-700 mb-2">Members Breakdown:</div>
                                            <div className="space-y-2">
                                                {members.length === 0 ? (
                                                    <div className="text-center py-4 text-gray-500 text-sm">
                                                        No members added
                                                    </div>
                                                ) : (
                                                    members.map((member) => (
                                                        <div key={member.id} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-3 w-3 text-gray-400" />
                                                                <span className="truncate">{member.name || `Member ${member.id}`}</span>
                                                            </div>
                                                            <div className="text-gray-500">{member.relationship}</div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Registration Checklist */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registration Checklist</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className={`flex items-center space-x-2 ${data.head_of_family ? 'text-green-600' : 'text-gray-400'}`}>
                                            <div className={`h-5 w-5 rounded-full ${data.head_of_family ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${data.head_of_family ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                                            </div>
                                            <span className="text-sm">Head of family information</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${data.address ? 'text-green-600' : 'text-gray-400'}`}>
                                            <div className={`h-5 w-5 rounded-full ${data.address ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${data.address ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                                            </div>
                                            <span className="text-sm">Complete address</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${data.contact_number ? 'text-green-600' : 'text-gray-400'}`}>
                                            <div className={`h-5 w-5 rounded-full ${data.contact_number ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${data.contact_number ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                                            </div>
                                            <span className="text-sm">Contact information</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${members.length > 1 ? 'text-green-600' : 'text-amber-600'}`}>
                                            <div className={`h-5 w-5 rounded-full ${members.length > 1 ? 'bg-green-100' : 'bg-amber-100'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${members.length > 1 ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                                            </div>
                                            <span className="text-sm">Household members ({members.length})</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${data.housing_type ? 'text-green-600' : 'text-gray-400'}`}>
                                            <div className={`h-5 w-5 rounded-full ${data.housing_type ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${data.housing_type ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                                            </div>
                                            <span className="text-sm">Housing information</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${data.purok_id ? 'text-green-600' : 'text-gray-400'}`}>
                                            <div className={`h-5 w-5 rounded-full ${data.purok_id ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                                                <div className={`h-2 w-2 rounded-full ${data.purok_id ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                                            </div>
                                            <span className="text-sm">Purok selected</span>
                                        </div>
                                        {data.create_user_account && (
                                            <div className="flex items-center space-x-2 text-purple-600">
                                                <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                                                </div>
                                                <span className="text-sm">User account creation enabled</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start" type="button">
                                        Print Registration Form
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" type="button">
                                        Save as Template
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" type="button">
                                        Generate Household ID
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" type="button">
                                        Check Duplicates
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Water Source Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Droplets className="h-5 w-5" />
                                        Water Source Guide
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                            <span>Level I: Point Source (Well, Spring)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                            <span>Level II: Communal Faucet</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                            <span>Level III: Waterworks System</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <div>
                            <Button 
                                variant="ghost" 
                                type="button" 
                                onClick={clearForm}
                            >
                                Clear Form
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" type="button">
                                Save as Draft
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Register Household'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Credentials Modal */}
            {createdCredentials && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold dark:text-gray-100">User Account Created</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCreatedCredentials(null)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                A user account has been created for the household head.
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Name:</span>
                                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                                        {createdCredentials.name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Username:</span>
                                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                                        {createdCredentials.username}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Initial Password:</span>
                                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                                        {createdCredentials.password}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                                            Important Security Notice
                                        </p>
                                        <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                                            <li>User must change password on first login</li>
                                            <li>Credentials are only shown once</li>
                                            <li>Store this information securely</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setCreatedCredentials(null)}
                                    className="flex-1 w-full"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}