import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft,
    Save,
    Upload,
    Camera,
    UserPlus
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { PageProps } from '@/types';

interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    head_resident_id: number | null;
}

interface Purok {
    id: number;
    name: string;
}

interface ResidentFormData {
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    birth_date: string;
    age: number;
    gender: string;
    civil_status: string;
    contact_number: string;
    email: string;
    address: string;
    purok_id: number | null;
    household_id: number | null;
    relationship_to_head: string; // ADDED
    occupation: string;
    education: string;
    religion: string;
    is_voter: boolean;
    is_pwd: boolean;
    is_senior: boolean;
    place_of_birth: string;
    remarks: string;
    photo: File | null;
}

interface CreateResidentProps extends PageProps {
    households: Household[];
    puroks: Purok[];
    civilStatusOptions: Array<{value: string, label: string}>;
    genderOptions: Array<{value: string, label: string}>;
    educationOptions: Array<{value: string, label: string}>;
    relationshipOptions: Array<{value: string, label: string}>; // ADDED
}

export default function CreateResident({ 
    households, 
    puroks, 
    civilStatusOptions, 
    genderOptions, 
    educationOptions,
    relationshipOptions // ADDED
}: CreateResidentProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResidentFormData>({
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix: '',
        birth_date: '',
        age: 0,
        gender: 'male',
        civil_status: 'single',
        contact_number: '',
        email: '',
        address: '',
        purok_id: null,
        household_id: null,
        relationship_to_head: 'son', // ADDED with default value
        occupation: '',
        education: '',
        religion: '',
        is_voter: false,
        is_pwd: false,
        is_senior: false,
        place_of_birth: '',
        remarks: '',
        photo: null,
    });

    // Calculate age when birth date changes
    useEffect(() => {
        if (data.birth_date) {
            const birthDate = new Date(data.birth_date);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            setData('age', age);
            
            // Auto-check senior citizen if age >= 60
            if (age >= 60) {
                setData('is_senior', true);
            }
        }
    }, [data.birth_date]);

    // Auto-set relationship based on gender when household is selected
    useEffect(() => {
        if (data.household_id && !data.relationship_to_head) {
            // If household selected but no relationship set, set default based on gender
            if (data.gender === 'female') {
                setData('relationship_to_head', 'daughter');
            } else {
                setData('relationship_to_head', 'son');
            }
        }
        
        // If household is cleared, also clear relationship
        if (!data.household_id) {
            setData('relationship_to_head', 'son');
        }
    }, [data.household_id, data.gender]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/residents', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('photo', file);
    };

    const clearForm = () => {
        reset({
            first_name: '',
            last_name: '',
            middle_name: '',
            suffix: '',
            birth_date: '',
            age: 0,
            gender: 'male',
            civil_status: 'single',
            contact_number: '',
            email: '',
            address: '',
            purok_id: null,
            household_id: null,
            relationship_to_head: 'son',
            occupation: '',
            education: '',
            religion: '',
            is_voter: false,
            is_pwd: false,
            is_senior: false,
            place_of_birth: '',
            remarks: '',
            photo: null,
        });
    };

    // Get selected household
    const selectedHousehold = households.find(h => h.id === data.household_id);
    
    // Check if selected household has no head (this resident could be the head)
    const canBeHead = selectedHousehold && !selectedHousehold.head_resident_id;

    // Calculate form completion percentage
    const requiredFields = [
        'first_name', 'last_name', 'birth_date', 'gender', 
        'civil_status', 'contact_number', 'address', 'purok_id'
    ];
    
    // Add relationship_to_head to required fields if household is selected
    if (data.household_id) {
        requiredFields.push('relationship_to_head');
    }
    
    const optionalFields = [
        'middle_name', 'suffix', 'email', 'household_id', 'relationship_to_head', 'occupation', 
        'education', 'religion', 'place_of_birth', 'remarks'
    ];

    const completedRequired = requiredFields.filter(field => {
        const value = data[field as keyof ResidentFormData];
        if (field === 'purok_id' || field === 'household_id') {
            return value !== null && value !== undefined && value !== 0;
        }
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const completedOptional = optionalFields.filter(field => {
        const value = data[field as keyof ResidentFormData];
        if (field === 'household_id') {
            return value !== null && value !== undefined && value !== 0;
        }
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const totalProgress = Math.round(
        ((completedRequired + completedOptional) / (requiredFields.length + optionalFields.length)) * 100
    );

    return (
        <AppLayout
            title="Add Resident"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Residents', href: '/residents' },
                { title: 'Add Resident', href: '/residents/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/residents">
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Add New Resident</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Register a new resident in the barangay database
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/residents/import">
                                <Button variant="outline" type="button">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Resident'}
                            </Button>
                        </div>
                    </div>

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            <p className="font-bold">Please fix the following errors:</p>
                            <ul className="list-disc list-inside mt-2">
                                {Object.entries(errors).map(([field, error]) => (
                                    <li key={field}><strong>{field.replace('_', ' ')}:</strong> {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Personal Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>
                                        Basic details of the resident
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name *</Label>
                                            <Input 
                                                id="first_name" 
                                                placeholder="Juan" 
                                                required 
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                            />
                                            {errors.first_name && (
                                                <p className="text-sm text-red-600">{errors.first_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="middle_name">Middle Name</Label>
                                            <Input 
                                                id="middle_name" 
                                                placeholder="Santos" 
                                                value={data.middle_name}
                                                onChange={(e) => setData('middle_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name *</Label>
                                            <Input 
                                                id="last_name" 
                                                placeholder="Dela Cruz" 
                                                required 
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                            />
                                            {errors.last_name && (
                                                <p className="text-sm text-red-600">{errors.last_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="suffix">Suffix</Label>
                                            <Input 
                                                id="suffix" 
                                                placeholder="Jr." 
                                                value={data.suffix}
                                                onChange={(e) => setData('suffix', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="birth_date">Date of Birth *</Label>
                                            <Input 
                                                id="birth_date" 
                                                type="date" 
                                                required 
                                                value={data.birth_date}
                                                onChange={(e) => setData('birth_date', e.target.value)}
                                            />
                                            {errors.birth_date && (
                                                <p className="text-sm text-red-600">{errors.birth_date}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="age">Age</Label>
                                            <Input 
                                                id="age" 
                                                type="number" 
                                                placeholder="35" 
                                                value={data.age || ''}
                                                readOnly
                                                className="bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender *</Label>
                                            <Select 
                                                value={data.gender}
                                                onValueChange={(value) => setData('gender', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {genderOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.gender && (
                                                <p className="text-sm text-red-600">{errors.gender}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="place_of_birth">Place of Birth</Label>
                                        <Input 
                                            id="place_of_birth" 
                                            placeholder="City/Municipality, Province" 
                                            value={data.place_of_birth}
                                            onChange={(e) => setData('place_of_birth', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Civil Status *</Label>
                                        <RadioGroup className="flex flex-wrap gap-4">
                                            {civilStatusOptions.map((option) => (
                                                <div key={option.value} className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        id={`civil_status_${option.value}`}
                                                        value={option.value}
                                                        checked={data.civil_status === option.value}
                                                        onChange={(e) => setData('civil_status', e.target.value)}
                                                    />
                                                    <Label htmlFor={`civil_status_${option.value}`} className="cursor-pointer">
                                                        {option.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                        {errors.civil_status && (
                                            <p className="text-sm text-red-600">{errors.civil_status}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                    <CardDescription>
                                        How to reach the resident
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_number">Contact Number *</Label>
                                            <Input 
                                                id="contact_number" 
                                                placeholder="09123456789" 
                                                required 
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                            />
                                            {errors.contact_number && (
                                                <p className="text-sm text-red-600">{errors.contact_number}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input 
                                                id="email" 
                                                type="email" 
                                                placeholder="juan@example.com" 
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Complete Address *</Label>
                                        <Textarea 
                                            id="address" 
                                            placeholder="House No., Street, Purok, Barangay Kibawe" 
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
                                            <Label htmlFor="purok_id">Purok *</Label>
                                            <Select 
                                                value={data.purok_id?.toString() || ''}
                                                onValueChange={(value) => setData('purok_id', value ? parseInt(value) : null)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select purok" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {puroks.length === 0 ? (
                                                        <div className="px-2 py-4 text-center text-gray-500 text-sm">
                                                            No puroks available. Please create puroks first.
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
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="household_id">Household</Label>
                                            <Select 
                                                value={data.household_id?.toString() || 'none'}
                                                onValueChange={(value) => setData('household_id', value === 'none' ? null : parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select household (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem key="none" value="none">No Household</SelectItem>
                                                    {households.map((household) => (
                                                        <SelectItem key={household.id} value={household.id.toString()}>
                                                            {household.household_number} - {household.head_of_family || 'No Head'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* ADDED: Relationship to Head Dropdown */}
                                    {data.household_id && (
                                        <div className="space-y-2">
                                            <Label htmlFor="relationship_to_head">
                                                Relationship to Head of Household *
                                                {canBeHead && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        This household has no head. Select "Head of Household" to set this resident as head.
                                                    </span>
                                                )}
                                            </Label>
                                            <Select 
                                                value={data.relationship_to_head}
                                                onValueChange={(value) => setData('relationship_to_head', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select relationship" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {relationshipOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.relationship_to_head && (
                                                <p className="text-sm text-red-600">{errors.relationship_to_head}</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="occupation">Occupation</Label>
                                            <Input 
                                                id="occupation" 
                                                placeholder="Farmer/Business Owner/Employee" 
                                                value={data.occupation}
                                                onChange={(e) => setData('occupation', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="education">Highest Education</Label>
                                            <Select 
                                                value={data.education}
                                                onValueChange={(value) => setData('education', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select education" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {educationOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="religion">Religion</Label>
                                        <Input 
                                            id="religion" 
                                            placeholder="Roman Catholic" 
                                            value={data.religion}
                                            onChange={(e) => setData('religion', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="is_voter" 
                                                checked={data.is_voter}
                                                onCheckedChange={(checked) => setData('is_voter', checked as boolean)}
                                            />
                                            <Label htmlFor="is_voter">Registered Voter in this Barangay</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Checkbox 
                                                id="is_pwd" 
                                                checked={data.is_pwd}
                                                onCheckedChange={(checked) => setData('is_pwd', checked as boolean)}
                                            />
                                            <Label htmlFor="is_pwd">Person with Disability (PWD)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Checkbox 
                                                id="is_senior" 
                                                checked={data.is_senior}
                                                onCheckedChange={(checked) => setData('is_senior', checked as boolean)}
                                            />
                                            <Label htmlFor="is_senior">Senior Citizen</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="remarks">Remarks/Notes</Label>
                                        <Textarea 
                                            id="remarks" 
                                            placeholder="Additional notes about the resident..."
                                            rows={3}
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Photo Upload & Preview */}
                        <div className="space-y-6">
                            {/* Photo Upload */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resident Photo</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                        <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                            <Camera className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">
                                            Upload resident's photo (2x2 ID size recommended)
                                        </p>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="photo"
                                                accept=".jpg,.jpeg,.png"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={handleFileChange}
                                            />
                                            <Button variant="outline" size="sm">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload Photo
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            JPG, PNG up to 2MB
                                        </p>
                                        {data.photo && (
                                            <p className="text-sm text-green-600 mt-2">
                                                Selected: {data.photo.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="resident_id">Resident ID Number</Label>
                                        <Input 
                                            id="resident_id" 
                                            placeholder="BRGY-2024-001" 
                                            readOnly
                                            className="bg-gray-50"
                                            value="Auto-generated upon save"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Required Fields:</span>
                                            <span className={`font-medium ${completedRequired === requiredFields.length ? 'text-green-600' : 'text-amber-600'}`}>
                                                {completedRequired}/{requiredFields.length} completed
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Optional Fields:</span>
                                            <span className="font-medium">
                                                {completedOptional}/{optionalFields.length} completed
                                            </span>
                                        </div>
                                        <div className="pt-3 border-t">
                                            <div className="flex items-center justify-between font-medium">
                                                <span>Total Progress</span>
                                                <span>{totalProgress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-300 ${
                                                        totalProgress === 100 ? 'bg-green-500' : 
                                                        totalProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                                    }`} 
                                                    style={{ width: `${totalProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-xs text-gray-500 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                <span>Required fields completed</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                <span>Optional fields completed</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Link href="/households/create">
                                        <Button variant="outline" className="w-full justify-start" type="button">
                                            Create New Household
                                        </Button>
                                    </Link>
                                    <Button variant="outline" className="w-full justify-start" type="button">
                                        Print Registration Form
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" type="button">
                                        Save as Template
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <div>
                            <Button variant="ghost" type="button" onClick={clearForm}>
                                Clear Form
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/residents">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save & Register Resident'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}