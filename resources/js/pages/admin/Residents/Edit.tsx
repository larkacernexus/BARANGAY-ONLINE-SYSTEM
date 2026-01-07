import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload, Camera, User, Trash2, Calendar, Home, Phone, Mail, MapPin, Briefcase, GraduationCap, Church } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { PageProps } from '@/types';

interface Purok {
    id: number;
    name: string;
}

interface Resident {
    id: number;
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
    resident_id: string;
    household_id: number | null;
    occupation: string;
    education: string;
    religion: string;
    is_voter: boolean;
    is_pwd: boolean;
    is_senior: boolean;
    place_of_birth: string;
    remarks: string;
    status: string;
    photo_path: string | null;
    created_at: string;
    updated_at: string;
    
    // Relationships
    purok?: {
        id: number;
        name: string;
    };
    household_relation?: {
        id: number;
        household_number: string;
    };
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
    occupation: string;
    education: string;
    religion: string;
    is_voter: boolean;
    is_pwd: boolean;
    is_senior: boolean;
    place_of_birth: string;
    remarks: string;
    status: string;
    photo: File | null;
    _method: 'PUT';
}

interface EditResidentProps extends PageProps {
    resident: Resident;
    puroks: Purok[];
    civilStatusOptions: Array<{value: string, label: string}>;
    genderOptions: Array<{value: string, label: string}>;
    educationOptions: Array<{value: string, label: string}>;
}

// Helper functions
const formatDisplayDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

const calculateAgeFromDate = (birthDate: string): number => {
    try {
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) return 0;
        
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return Math.max(0, age); // Ensure age is not negative
    } catch {
        return 0;
    }
};

export default function EditResident({ 
    resident,
    puroks, 
    civilStatusOptions, 
    genderOptions, 
    educationOptions
}: EditResidentProps) {
    const { data, setData, post, processing, errors } = useForm<ResidentFormData>({
        first_name: resident.first_name || '',
        last_name: resident.last_name || '',
        middle_name: resident.middle_name || '',
        suffix: resident.suffix || '',
        birth_date: resident.birth_date || '',
        age: resident.age || 0,
        gender: resident.gender || 'male',
        civil_status: resident.civil_status || 'single',
        contact_number: resident.contact_number || '',
        email: resident.email || '',
        address: resident.address || '',
        purok_id: resident.purok_id,
        occupation: resident.occupation || '',
        education: resident.education || '',
        religion: resident.religion || '',
        is_voter: resident.is_voter || false,
        is_pwd: resident.is_pwd || false,
        is_senior: resident.is_senior || false,
        place_of_birth: resident.place_of_birth || '',
        remarks: resident.remarks || '',
        status: resident.status || 'active',
        photo: null,
        _method: 'PUT',
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        resident.photo_path ? `/storage/${resident.photo_path}` : null
    );

    // Calculate age when birth date changes
    useEffect(() => {
        if (data.birth_date) {
            const age = calculateAgeFromDate(data.birth_date);
            setData('age', age);
            
            // Auto-check senior citizen if age >= 60
            if (age >= 60) {
                setData('is_senior', true);
            }
        }
    }, [data.birth_date]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate birth date
        const age = calculateAgeFromDate(data.birth_date);
        if (age < 0) {
            alert('Birth date cannot be in the future');
            return;
        }
        
        post(`/residents/${resident.id}`, {
            ...data,
            _method: 'PUT',
            preserveScroll: true,
            onError: (errors) => {
                console.error('Update errors:', errors);
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setData('photo', null);
        setPhotoPreview(null);
    };

    // Calculate form completion percentage
    const requiredFields = [
        'first_name', 'last_name', 'birth_date', 'gender', 
        'civil_status', 'contact_number', 'address', 'purok_id'
    ];
    
    const optionalFields = [
        'middle_name', 'suffix', 'email', 'occupation', 
        'education', 'religion', 'place_of_birth', 'remarks', 'status'
    ];

    const completedRequired = requiredFields.filter(field => {
        const value = data[field as keyof ResidentFormData];
        if (field === 'purok_id') {
            return value !== null && value !== undefined && value !== 0;
        }
        if (field === 'birth_date') {
            return value && calculateAgeFromDate(value) >= 0;
        }
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const completedOptional = optionalFields.filter(field => {
        const value = data[field as keyof ResidentFormData];
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const totalFields = requiredFields.length + optionalFields.length;
    const totalCompleted = completedRequired + completedOptional;
    const totalProgress = Math.round((totalCompleted / totalFields) * 100);

    return (
        <AppLayout
            title={`Edit Resident: ${resident.first_name} ${resident.last_name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Residents', href: '/residents' },
                { title: `Resident #${resident.resident_id}`, href: `/residents/${resident.id}` },
                { title: 'Edit Resident', href: `/residents/${resident.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/residents/${resident.id}`}>
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Profile
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Edit Resident: {resident.first_name} {resident.last_name}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Resident ID: <span className="font-mono font-semibold">{resident.resident_id}</span> • 
                                    Status: <span className={`font-semibold ${resident.status === 'active' ? 'text-green-600' : resident.status === 'inactive' ? 'text-amber-600' : 'text-red-600'}`}>
                                        {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
                                    </span> • 
                                    Created: {formatDisplayDate(resident.created_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Update Resident'}
                            </Button>
                        </div>
                    </div>

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            <p className="font-bold">Please fix the following errors:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                {Object.entries(errors).map(([field, error]) => (
                                    <li key={field} className="capitalize">
                                        <strong>{field.replace(/_/g, ' ')}:</strong> {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>
                                        Basic details of the resident
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name *</Label>
                                            <Input 
                                                id="first_name" 
                                                placeholder="Juan" 
                                                required 
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                className={errors.first_name ? 'border-red-500' : ''}
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
                                                className={errors.last_name ? 'border-red-500' : ''}
                                            />
                                            {errors.last_name && (
                                                <p className="text-sm text-red-600">{errors.last_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="suffix">Suffix</Label>
                                            <Input 
                                                id="suffix" 
                                                placeholder="Jr., Sr., III" 
                                                value={data.suffix}
                                                onChange={(e) => setData('suffix', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="birth_date" className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Date of Birth *
                                            </Label>
                                            <Input 
                                                id="birth_date" 
                                                type="date" 
                                                required 
                                                value={data.birth_date}
                                                onChange={(e) => setData('birth_date', e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                                className={errors.birth_date ? 'border-red-500' : ''}
                                            />
                                            {errors.birth_date && (
                                                <p className="text-sm text-red-600">{errors.birth_date}</p>
                                            )}
                                            {data.birth_date && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDisplayDate(data.birth_date)} • {data.age} years old
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="age">Age</Label>
                                            <Input 
                                                id="age" 
                                                type="number" 
                                                min="0"
                                                max="120"
                                                value={data.age || ''}
                                                readOnly
                                                className="bg-gray-50 dark:bg-gray-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender *</Label>
                                            <Select 
                                                value={data.gender}
                                                onValueChange={(value) => setData('gender', value)}
                                            >
                                                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
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
                                        <div className="flex flex-wrap gap-4">
                                            {civilStatusOptions.map((option) => (
                                                <div key={option.value} className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        id={`civil_status_${option.value}`}
                                                        name="civil_status"
                                                        value={option.value}
                                                        checked={data.civil_status === option.value}
                                                        onChange={() => setData('civil_status', option.value)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                    <Label htmlFor={`civil_status_${option.value}`} className="cursor-pointer">
                                                        {option.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.civil_status && (
                                            <p className="text-sm text-red-600">{errors.civil_status}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select 
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value)}
                                        >
                                            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active" className="text-green-600">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="inactive" className="text-amber-600">
                                                    Inactive
                                                </SelectItem>
                                                <SelectItem value="deceased" className="text-red-600">
                                                    Deceased
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-600">{errors.status}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        Contact Information
                                    </CardTitle>
                                    <CardDescription>
                                        How to reach the resident
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_number" className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Contact Number *
                                            </Label>
                                            <Input 
                                                id="contact_number" 
                                                placeholder="09123456789" 
                                                required 
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                                className={errors.contact_number ? 'border-red-500' : ''}
                                            />
                                            {errors.contact_number && (
                                                <p className="text-sm text-red-600">{errors.contact_number}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email Address
                                            </Label>
                                            <Input 
                                                id="email" 
                                                type="email" 
                                                placeholder="juan@example.com" 
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Complete Address *
                                        </Label>
                                        <Textarea 
                                            id="address" 
                                            placeholder="House No., Street, Purok, Barangay Kibawe" 
                                            required 
                                            rows={3}
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className={errors.address ? 'border-red-500' : ''}
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-600">{errors.address}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="purok_id" className="flex items-center gap-2">
                                            <Home className="h-4 w-4" />
                                            Purok *
                                        </Label>
                                        <Select 
                                            value={data.purok_id?.toString() || ''}
                                            onValueChange={(value) => setData('purok_id', value ? parseInt(value) : null)}
                                        >
                                            <SelectTrigger className={errors.purok_id ? 'border-red-500' : ''}>
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
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                    <CardDescription>
                                        Other relevant details about the resident
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="occupation" className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                Occupation
                                            </Label>
                                            <Input 
                                                id="occupation" 
                                                placeholder="Farmer/Business Owner/Employee" 
                                                value={data.occupation}
                                                onChange={(e) => setData('occupation', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="education" className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4" />
                                                Highest Education
                                            </Label>
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
                                        <Label htmlFor="religion" className="flex items-center gap-2">
                                            <Church className="h-4 w-4" />
                                            Religion
                                        </Label>
                                        <Input 
                                            id="religion" 
                                            placeholder="Roman Catholic, Protestant, Muslim, etc." 
                                            value={data.religion}
                                            onChange={(e) => setData('religion', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Special Attributes</Label>
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    id="is_voter"
                                                    checked={data.is_voter}
                                                    onChange={(e) => setData('is_voter', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <Label htmlFor="is_voter" className="cursor-pointer">
                                                    Registered Voter
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    id="is_pwd"
                                                    checked={data.is_pwd}
                                                    onChange={(e) => setData('is_pwd', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <Label htmlFor="is_pwd" className="cursor-pointer">
                                                    Person with Disability
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    id="is_senior"
                                                    checked={data.is_senior}
                                                    onChange={(e) => setData('is_senior', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <Label htmlFor="is_senior" className="cursor-pointer">
                                                    Senior Citizen
                                                </Label>
                                            </div>
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
                                        <p className="text-xs text-gray-500">
                                            Any additional information or special notes about this resident.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Photo & Summary */}
                        <div className="space-y-6">
                            {/* Photo Upload */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Resident Photo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                                        {photoPreview ? (
                                            <div className="relative">
                                                <img 
                                                    src={photoPreview} 
                                                    alt={`${resident.first_name} ${resident.last_name}`}
                                                    className="mx-auto h-48 w-48 rounded-full object-cover border-4 border-white shadow-lg"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-0 right-0 h-8 w-8 rounded-full"
                                                    onClick={removePhoto}
                                                    type="button"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="mx-auto h-48 w-48 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                                <Camera className="h-16 w-16 text-gray-400" />
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-500 mb-2 mt-4">
                                            {photoPreview ? 'Change resident photo' : 'Upload resident photo (2x2 ID size recommended)'}
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
                                                {photoPreview ? 'Change Photo' : 'Upload Photo'}
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

                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <Label>Resident ID</Label>
                                            <Input 
                                                readOnly
                                                className="bg-gray-50 dark:bg-gray-800 font-mono font-bold"
                                                value={resident.resident_id}
                                            />
                                            <p className="text-xs text-gray-500">
                                                This ID is auto-generated and cannot be changed
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Registration Date</Label>
                                            <Input 
                                                readOnly
                                                className="bg-gray-50 dark:bg-gray-800"
                                                value={formatDisplayDate(resident.created_at)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Last Updated</Label>
                                            <Input 
                                                readOnly
                                                className="bg-gray-50 dark:bg-gray-800"
                                                value={formatDisplayDate(resident.updated_at)}
                                            />
                                        </div>

                                        {resident.household_relation && (
                                            <div className="space-y-2">
                                                <Label>Household Information</Label>
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                                    <p className="font-medium">
                                                        Household #{resident.household_relation.household_number}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Note: To manage household membership, please visit the household page.
                                                    </p>
                                                    <Link href={`/households/${resident.household_relation.id}`}>
                                                        <Button variant="outline" size="sm" className="w-full mt-2">
                                                            Go to Household
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Progress */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Progress</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">Completion</span>
                                                <span className="text-sm font-bold">{totalProgress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-300 ${
                                                        totalProgress === 100 ? 'bg-green-500' : 
                                                        totalProgress >= 75 ? 'bg-blue-500' : 
                                                        totalProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`} 
                                                    style={{ width: `${totalProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Required</span>
                                                    <span className={`font-medium ${completedRequired === requiredFields.length ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {completedRequired}/{requiredFields.length}
                                                    </span>
                                                </div>
                                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-blue-500" 
                                                        style={{ width: `${(completedRequired / requiredFields.length) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Optional</span>
                                                    <span className="font-medium">
                                                        {completedOptional}/{optionalFields.length}
                                                    </span>
                                                </div>
                                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gray-400" 
                                                        style={{ width: `${(completedOptional / optionalFields.length) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                <span className="font-medium">Fields completed:</span> {totalCompleted}/{totalFields}
                                            </p>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                    <span>Required fields ({requiredFields.length})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                                    <span>Optional fields ({optionalFields.length})</span>
                                                </div>
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
                                    <Link href={`/residents/${resident.id}`}>
                                        <Button variant="outline" className="w-full justify-start" type="button">
                                            View Resident Profile
                                        </Button>
                                    </Link>
                                    <Link href="/residents">
                                        <Button variant="outline" className="w-full justify-start" type="button">
                                            Back to Residents List
                                        </Button>
                                    </Link>
                                    {!resident.household_id && (
                                        <Link href="/households/create">
                                            <Button variant="outline" className="w-full justify-start" type="button">
                                                Create New Household
                                            </Button>
                                        </Link>
                                    )}
                                    <Button variant="outline" className="w-full justify-start" type="button" onClick={() => window.print()}>
                                        Print This Form
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <div className="flex items-center gap-2">
                            <Link href={`/residents/${resident.id}`}>
                                <Button variant="ghost" type="button">
                                    Discard Changes
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                type="button" 
                                onClick={() => {
                                    if (confirm('Are you sure you want to reset all changes?')) {
                                        window.location.reload();
                                    }
                                }}
                            >
                                Reset Form
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/residents">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={processing || totalProgress < 80}
                                className="bg-blue-600 hover:bg-blue-700"
                                title={totalProgress < 80 ? 'Please complete at least 80% of required fields' : ''}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving Changes...' : 'Update Resident'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}