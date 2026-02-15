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
    Upload,
    Camera,
    UserPlus,
    Shield,
    Calendar,
    Users,
    Target,
    Award,
    Mail,
    Phone,
    Home,
    Crown,
    Building,
    Key,
    UserCheck,
    Check,
    X,
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types';

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age: number;
    gender: string;
    birth_date?: string;
    civil_status?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    photo_url?: string;
    purok?: {
        id: number;
        name: string;
    };
    household?: {
        id: number;
        household_number: string;
        address: string;
    };
}

interface PositionOption {
    value: string;
    label: string;
    order: number;
    role_id: number;
    requires_account: boolean;
}

interface CommitteeOption {
    value: string;
    label: string;
}

interface CreateOfficialProps extends PageProps {
    positions: PositionOption[];
    committees: CommitteeOption[];
    availableResidents: Resident[];
    defaultTermStart: string;
    defaultTermEnd: string;
    roles: Array<{
        id: number;
        name: string;
    }>;
}

interface OfficialFormData {
    resident_id: number | null;
    position: string;
    committee: string;
    term_start: string;
    term_end: string;
    status: string;
    order: number;
    responsibilities: string;
    contact_number: string;
    email: string;
    achievements: string;
    photo: File | null;
    use_resident_photo: boolean;
    is_regular: boolean;
    create_user_account: boolean;
    role_id: number;
    username: string;
    password: string;
    password_confirmation: string;
}

export default function CreateOfficial({ 
    positions, 
    committees, 
    availableResidents,
    defaultTermStart,
    defaultTermEnd,
    roles,
}: CreateOfficialProps) {
    const { data, setData, post, processing, errors } = useForm<OfficialFormData>({
        resident_id: null,
        position: '',
        committee: '',
        term_start: defaultTermStart,
        term_end: defaultTermEnd,
        status: 'active',
        order: 0,
        responsibilities: '',
        contact_number: '',
        email: '',
        achievements: '',
        photo: null,
        use_resident_photo: false,
        is_regular: true,
        create_user_account: true,
        role_id: 6,
        username: '',
        password: '',
        password_confirmation: '',
    });

    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [passwordSource, setPasswordSource] = useState<'random' | 'phone' | 'manual'>('random');
    const [currentPosition, setCurrentPosition] = useState<PositionOption | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Effect to handle position changes
    useEffect(() => {
        if (data.position) {
            const positionData = positions.find(p => p.value === data.position);
            setCurrentPosition(positionData || null);
            
            if (positionData) {
                setData('order', positionData.order);
                setData('role_id', positionData.role_id);
                
                if (positionData.requires_account) {
                    setData('create_user_account', true);
                    setShowPasswordFields(true);
                }
            }
        }
    }, [data.position]);

    // Effect to handle photo preview
    useEffect(() => {
        if (selectedResident?.photo_url && data.use_resident_photo) {
            setPhotoPreview(selectedResident.photo_url);
        } else if (data.photo) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(data.photo);
        } else {
            setPhotoPreview(null);
        }
    }, [selectedResident, data.use_resident_photo, data.photo]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/officials', {
            preserveScroll: true,
            onSuccess: () => {
                // Handle success
            }
        });
    };

    const handleResidentSelect = (residentId: number) => {
        setData('resident_id', residentId);
        const resident = availableResidents.find(r => r.id === residentId);
        setSelectedResident(resident || null);
        
        // Auto-enable resident photo if available
        if (resident?.photo_url) {
            setData('use_resident_photo', true);
        }
        
        if (resident) {
            if (resident.contact_number && !data.contact_number) {
                setData('contact_number', resident.contact_number);
            }
            
            if (resident.email && !data.email) {
                setData('email', resident.email);
            }
            
            if (!data.username) {
                const username = generateUsername(resident);
                setData('username', username);
            }
        }
    };

    const generateUsername = (resident: Resident): string => {
        const firstName = resident.first_name.toLowerCase().replace(/\s+/g, '');
        const lastName = resident.last_name.toLowerCase().replace(/\s+/g, '');
        const randomNum = Math.floor(Math.random() * 100);
        return `${firstName}.${lastName}${randomNum}`;
    };

    const generatePassword = (source: 'random' | 'phone') => {
        let password = '';
        
        if (source === 'random') {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            for (let i = 0; i < 12; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } else if (source === 'phone' && selectedResident?.contact_number) {
            const phone = selectedResident.contact_number.replace(/\D/g, '');
            const lastSix = phone.slice(-6);
            const currentYear = new Date().getFullYear().toString().slice(-2);
            password = `${lastSix}@${currentYear}`;
        }
        
        if (password) {
            setData('password', password);
            setData('password_confirmation', password);
            setGeneratedPassword(password);
            setPasswordSource(source);
        }
    };

    const handlePositionSelect = (position: string) => {
        setData('position', position);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('photo', file);
        if (file) {
            setData('use_resident_photo', false);
        }
    };

    const handleUseResidentPhoto = (checked: boolean) => {
        setData('use_resident_photo', checked);
        if (checked && selectedResident?.photo_url) {
            setData('photo', null);
        }
    };

    const clearPhoto = () => {
        setData('photo', null);
        setData('use_resident_photo', false);
        setPhotoPreview(null);
    };

    const getRoleName = (roleId: number) => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : 'Viewer';
    };

    const isCaptain = data.position === 'captain';
    const requiresAccount = currentPosition?.requires_account || false;
    const isKeyPosition = ['captain', 'secretary', 'treasurer', 'sk_chairman'].includes(data.position);

    return (
        <AppLayout
            title="Add Official"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Officials', href: '/officials' },
                { title: 'Add Official', href: '/officials/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/officials">
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Add New Official</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Register a new barangay official
                                </p>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Official'}
                        </Button>
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
                        {/* Left Column - Official Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Resident Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5" />
                                        Select Resident
                                    </CardTitle>
                                    <CardDescription>
                                        Choose a resident to appoint as official
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="resident_id">Resident *</Label>
                                        <Select 
                                            value={data.resident_id?.toString() || ''}
                                            onValueChange={(value) => handleResidentSelect(parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select resident" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableResidents.length === 0 ? (
                                                    <div className="px-2 py-4 text-center text-gray-500 text-sm">
                                                        No available residents. All active residents may already hold positions.
                                                    </div>
                                                ) : (
                                                    availableResidents.map((resident) => (
                                                        <SelectItem key={resident.id} value={resident.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                {resident.photo_url ? (
                                                                    <img 
                                                                        src={resident.photo_url} 
                                                                        alt={`${resident.first_name} ${resident.last_name}`}
                                                                        className="h-6 w-6 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                                        <Users className="h-3 w-3 text-gray-600" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="font-medium">
                                                                        {resident.last_name}, {resident.first_name}
                                                                        {resident.middle_name && ` ${resident.middle_name.charAt(0)}.`}
                                                                    </span>
                                                                    <span className="text-gray-500 text-sm ml-2">
                                                                        ({resident.age} years, {resident.gender})
                                                                    </span>
                                                                    {resident.photo_url && (
                                                                        <span className="text-xs text-green-600 ml-2">
                                                                            Has photo
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.resident_id && (
                                            <p className="text-sm text-red-600">{errors.resident_id}</p>
                                        )}
                                    </div>

                                    {selectedResident && (
                                        <div className="p-4 border rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                {selectedResident.photo_url ? (
                                                    <img 
                                                        src={selectedResident.photo_url} 
                                                        alt={`${selectedResident.first_name} ${selectedResident.last_name}`}
                                                        className="h-12 w-12 rounded-full object-cover border"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border">
                                                        <Users className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-medium">
                                                        {selectedResident.last_name}, {selectedResident.first_name}
                                                        {selectedResident.middle_name && ` ${selectedResident.middle_name.charAt(0)}.`}
                                                    </h4>
                                                    <div className="text-sm text-gray-500 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Home className="h-3 w-3" />
                                                            {selectedResident.age} years old • {selectedResident.gender}
                                                            {selectedResident.civil_status && ` • ${selectedResident.civil_status}`}
                                                        </div>
                                                        {selectedResident.contact_number && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="h-3 w-3" />
                                                                {selectedResident.contact_number}
                                                            </div>
                                                        )}
                                                        {selectedResident.email && (
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="h-3 w-3" />
                                                                {selectedResident.email}
                                                            </div>
                                                        )}
                                                        {selectedResident.address && (
                                                            <div className="flex items-center gap-2">
                                                                <Home className="h-3 w-3" />
                                                                {selectedResident.address}
                                                            </div>
                                                        )}
                                                        {selectedResident.purok && (
                                                            <div className="flex items-center gap-2">
                                                                <Home className="h-3 w-3" />
                                                                Purok: {selectedResident.purok.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Position Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Position Information
                                    </CardTitle>
                                    <CardDescription>
                                        Official position and details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="position">Position *</Label>
                                            <Select 
                                                value={data.position}
                                                onValueChange={handlePositionSelect}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {positions.map((position) => (
                                                        <SelectItem key={position.value} value={position.value}>
                                                            <div className="flex items-center gap-2">
                                                                {position.value === 'captain' && <Crown className="h-3 w-3 text-amber-600" />}
                                                                {position.value === 'secretary' && <Award className="h-3 w-3 text-purple-600" />}
                                                                {position.value === 'treasurer' && <Shield className="h-3 w-3 text-green-600" />}
                                                                {position.value === 'sk_chairman' && <UserCheck className="h-3 w-3 text-blue-600" />}
                                                                {position.value === 'kagawad' && <Building className="h-3 w-3 text-blue-600" />}
                                                                <span>{position.label}</span>
                                                                {position.requires_account && (
                                                                    <span className="text-xs text-green-600 ml-1">*</span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.position && (
                                                <p className="text-sm text-red-600">{errors.position}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="committee">Committee</Label>
                                            <Select 
                                                value={data.committee}
                                                onValueChange={(value) => setData('committee', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select committee" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {committees.map((committee) => (
                                                        <SelectItem key={committee.value} value={committee.value}>
                                                            <div className="flex items-center gap-2">
                                                                <Target className="h-3 w-3 text-blue-600" />
                                                                <span>{committee.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="term_start">Term Start *</Label>
                                            <Input 
                                                id="term_start" 
                                                type="date" 
                                                required 
                                                value={data.term_start}
                                                onChange={(e) => setData('term_start', e.target.value)}
                                            />
                                            {errors.term_start && (
                                                <p className="text-sm text-red-600">{errors.term_start}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="term_end">Term End *</Label>
                                            <Input 
                                                id="term_end" 
                                                type="date" 
                                                required 
                                                value={data.term_end}
                                                onChange={(e) => setData('term_end', e.target.value)}
                                            />
                                            {errors.term_end && (
                                                <p className="text-sm text-red-600">{errors.term_end}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select 
                                                value={data.status}
                                                onValueChange={(value) => setData('status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="former">Former</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="order">Display Order</Label>
                                            <Input 
                                                id="order" 
                                                type="number" 
                                                min="0"
                                                value={data.order}
                                                onChange={(e) => setData('order', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="responsibilities">Responsibilities</Label>
                                        <Textarea 
                                            id="responsibilities" 
                                            placeholder="Describe the official's responsibilities and duties..."
                                            rows={4}
                                            value={data.responsibilities}
                                            onChange={(e) => setData('responsibilities', e.target.value)}
                                        />
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
                                        These fields are pre-filled from resident details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_number">Contact Number</Label>
                                            <Input 
                                                id="contact_number" 
                                                placeholder="09123456789" 
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                            />
                                            {selectedResident?.contact_number && (
                                                <p className="text-xs text-gray-500">
                                                    Pre-filled from resident record
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input 
                                                id="email" 
                                                type="email" 
                                                placeholder="official@barangay.gov.ph" 
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                            {selectedResident?.email && (
                                                <p className="text-xs text-gray-500">
                                                    Pre-filled from resident record
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Account Creation */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5" />
                                        System Access Account
                                    </CardTitle>
                                    <CardDescription>
                                        {requiresAccount ? (
                                            <span className="text-amber-600 font-medium">
                                                This position requires a system account
                                            </span>
                                        ) : (
                                            'Create a user account for this official to access the system'
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {requiresAccount ? (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-4">
                                            <div className="flex items-center gap-2 text-amber-800">
                                                <UserCheck className="h-4 w-4" />
                                                <span className="font-medium">Mandatory Account Creation</span>
                                            </div>
                                            <p className="text-sm text-amber-700 mt-1">
                                                {data.position === 'captain' && 'Barangay Captain requires system access for official duties.'}
                                                {data.position === 'secretary' && 'Barangay Secretary requires system access for records management.'}
                                                {data.position === 'treasurer' && 'Barangay Treasurer requires system access for financial management.'}
                                                {data.position === 'sk_chairman' && 'SK Chairman requires system access for youth programs.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id="create_user_account" 
                                                    checked={data.create_user_account}
                                                    onCheckedChange={(checked) => {
                                                        setData('create_user_account', checked as boolean);
                                                        if (checked) {
                                                            setShowPasswordFields(true);
                                                        }
                                                    }}
                                                    disabled={requiresAccount}
                                                />
                                                <Label htmlFor="create_user_account" className="cursor-pointer">
                                                    Create system user account for this official
                                                </Label>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Uncheck if you don't want to create a user account
                                            </p>
                                        </div>
                                    )}

                                    {(data.create_user_account || requiresAccount) && (
                                        <>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="username">Username *</Label>
                                                    <Input 
                                                        id="username" 
                                                        placeholder="juan.dela.cruz123"
                                                        value={data.username}
                                                        onChange={(e) => setData('username', e.target.value)}
                                                    />
                                                    {errors.username && (
                                                        <p className="text-sm text-red-600">{errors.username}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="role_id">System Role *</Label>
                                                    <Select 
                                                        value={data.role_id.toString()}
                                                        onValueChange={(value) => setData('role_id', parseInt(value))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {roles.map((role) => (
                                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                                    {role.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-xs text-gray-500">
                                                        Auto-selected based on position: {getRoleName(data.role_id)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label>Password Generation</Label>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            type="button" 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => generatePassword('random')}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Key className="h-3 w-3" />
                                                            Random
                                                        </Button>
                                                        <Button 
                                                            type="button" 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => generatePassword('phone')}
                                                            disabled={!selectedResident?.contact_number}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Phone className="h-3 w-3" />
                                                            Use Phone
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Input 
                                                            type={showPasswordFields ? "text" : "password"}
                                                            placeholder="Enter password"
                                                            value={data.password}
                                                            onChange={(e) => {
                                                                setData('password', e.target.value);
                                                                setPasswordSource('manual');
                                                            }}
                                                        />
                                                        {generatedPassword && passwordSource === 'random' && (
                                                            <p className="text-xs text-green-600">
                                                                Generated random password
                                                            </p>
                                                        )}
                                                        {generatedPassword && passwordSource === 'phone' && (
                                                            <p className="text-xs text-blue-600">
                                                                Generated from phone number
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Input 
                                                            type={showPasswordFields ? "text" : "password"}
                                                            placeholder="Confirm password"
                                                            value={data.password_confirmation}
                                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id="show_password" 
                                                        checked={showPasswordFields}
                                                        onCheckedChange={(checked) => setShowPasswordFields(checked as boolean)}
                                                    />
                                                    <Label htmlFor="show_password" className="cursor-pointer">
                                                        Show password
                                                    </Label>
                                                </div>

                                                {passwordSource === 'phone' && selectedResident?.contact_number && (
                                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                        <p className="text-xs text-blue-700">
                                                            <strong>Password format:</strong> Last 6 digits of phone number + @ + current year<br />
                                                            <strong>Example:</strong> {selectedResident.contact_number.replace(/\D/g, '').slice(-6)}@{new Date().getFullYear().toString().slice(-2)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="achievements">Achievements & Recognition</Label>
                                        <Textarea 
                                            id="achievements" 
                                            placeholder="List any achievements, awards, or recognition received..."
                                            rows={4}
                                            value={data.achievements}
                                            onChange={(e) => setData('achievements', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="is_regular" 
                                                checked={data.is_regular}
                                                onCheckedChange={(checked) => setData('is_regular', checked as boolean)}
                                            />
                                            <Label htmlFor="is_regular" className="cursor-pointer">
                                                Regular Official (elected)
                                            </Label>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Uncheck for ex-officio or appointed positions
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Photo & Preview */}
                        <div className="space-y-6">
                            {/* Photo Upload */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Official Photo</CardTitle>
                                    <CardDescription>
                                        Upload a new photo or use the resident's existing photo
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Photo Preview */}
                                    <div className="flex justify-center">
                                        <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                            {photoPreview ? (
                                                <img 
                                                    src={photoPreview} 
                                                    alt="Official preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                                    <Camera className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}
                                            {photoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={clearPhoto}
                                                    className="absolute top-2 right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Photo Source Options */}
                                    <div className="space-y-3">
                                        {/* Option 1: Use Resident Photo */}
                                        {selectedResident?.photo_url && (
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id="use_resident_photo" 
                                                        checked={data.use_resident_photo}
                                                        onCheckedChange={handleUseResidentPhoto}
                                                    />
                                                    <Label htmlFor="use_resident_photo" className="cursor-pointer">
                                                        Use resident's existing photo
                                                    </Label>
                                                </div>
                                                {data.use_resident_photo && (
                                                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                                        <div className="flex items-center gap-2 text-green-700">
                                                            <Check className="h-4 w-4" />
                                                            <span className="text-sm font-medium">Using resident's photo</span>
                                                        </div>
                                                        <p className="text-xs text-green-600 mt-1">
                                                            The photo will be copied from resident record
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Divider */}
                                        {(selectedResident?.photo_url && !data.use_resident_photo) || !selectedResident?.photo_url ? (
                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-300"></div>
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-white px-2 text-gray-500">OR</span>
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Option 2: Upload New Photo */}
                                        {(!data.use_resident_photo || !selectedResident?.photo_url) && (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <div className="mx-auto h-12 w-12 flex items-center justify-center mb-3">
                                                    <Upload className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3">
                                                    Upload a new portrait photo
                                                </p>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id="photo"
                                                        accept=".jpg,.jpeg,.png,.webp"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={handleFileChange}
                                                        disabled={data.use_resident_photo}
                                                    />
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        disabled={data.use_resident_photo}
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Upload New Photo
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    JPG, PNG, WEBP up to 2MB
                                                </p>
                                                {data.photo && !data.use_resident_photo && (
                                                    <div className="mt-3 p-2 bg-blue-50 rounded-md">
                                                        <p className="text-xs text-blue-600">
                                                            <span className="font-medium">Selected:</span> {data.photo.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* No Photo Option */}
                                        {selectedResident && !selectedResident.photo_url && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                                <div className="flex items-center gap-2 text-amber-700">
                                                    <Camera className="h-4 w-4" />
                                                    <span className="text-sm font-medium">No resident photo available</span>
                                                </div>
                                                <p className="text-xs text-amber-600 mt-1">
                                                    This resident doesn't have a photo in their record. Please upload one.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Preview Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {selectedResident && (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {photoPreview ? (
                                                        <img 
                                                            src={photoPreview} 
                                                            alt="Official preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <Shield className="h-8 w-8 text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">
                                                        {selectedResident.last_name}, {selectedResident.first_name}
                                                        {selectedResident.middle_name && ` ${selectedResident.middle_name.charAt(0)}.`}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        Selected Resident
                                                    </p>
                                                </div>
                                            </div>

                                            {data.position && (
                                                <div className="pt-4 border-t">
                                                    <h4 className="font-medium mb-2">Position Details:</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Position:</span>
                                                            <span className="font-medium">
                                                                {positions.find(p => p.value === data.position)?.label || data.position}
                                                            </span>
                                                        </div>
                                                        {data.committee && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Committee:</span>
                                                                <span className="font-medium">
                                                                    {committees.find(c => c.value === data.committee)?.label || data.committee}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Term:</span>
                                                            <span className="font-medium">
                                                                {new Date(data.term_start).toLocaleDateString()} - {new Date(data.term_end).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Photo Source:</span>
                                                            <span className="font-medium">
                                                                {data.use_resident_photo ? "Resident's Photo" : 
                                                                 data.photo ? "Uploaded Photo" : "No Photo"}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Type:</span>
                                                            <span className="font-medium">
                                                                {data.is_regular ? 'Regular Official' : 'Ex-Officio'}
                                                            </span>
                                                        </div>
                                                        {(data.create_user_account || requiresAccount) && (
                                                            <>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">User Account:</span>
                                                                    <span className="font-medium text-green-600">
                                                                        {requiresAccount ? 'Required' : 'Yes'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">System Role:</span>
                                                                    <span className="font-medium">
                                                                        {getRoleName(data.role_id)}
                                                                    </span>
                                                                </div>
                                                                {generatedPassword && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">Password Source:</span>
                                                                        <span className="font-medium">
                                                                            {passwordSource === 'random' ? 'Random' : 
                                                                             passwordSource === 'phone' ? 'Phone Number' : 
                                                                             'Manual Entry'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {!selectedResident && !data.position && (
                                        <div className="text-center py-8 text-gray-400">
                                            <Shield className="h-12 w-12 mx-auto mb-2" />
                                            <p>Select a resident and position to see preview</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Available Residents:</span>
                                            <span className="font-medium">{availableResidents.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">With Photos:</span>
                                            <span className="font-medium">
                                                {availableResidents.filter(r => r.photo_url).length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Active Officials:</span>
                                            <span className="font-medium">{positions.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Committees:</span>
                                            <span className="font-medium">{committees.length}</span>
                                        </div>
                                        {isCaptain && (
                                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                                <div className="flex items-center gap-2 text-yellow-800">
                                                    <Crown className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Barangay Captain Position</span>
                                                </div>
                                                <p className="text-xs text-yellow-600 mt-1">
                                                    This is the highest position. Only one resident can be captain at a time.
                                                </p>
                                            </div>
                                        )}
                                        {isKeyPosition && (
                                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                                                <div className="flex items-center gap-2 text-green-800">
                                                    <UserCheck className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Key Position</span>
                                                </div>
                                                <p className="text-xs text-green-600 mt-1">
                                                    System account is required for this position.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <Link href="/officials">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                type="button"
                                onClick={() => {
                                    // Reset form
                                    setData({
                                        resident_id: null,
                                        position: '',
                                        committee: '',
                                        term_start: defaultTermStart,
                                        term_end: defaultTermEnd,
                                        status: 'active',
                                        order: 0,
                                        responsibilities: '',
                                        contact_number: '',
                                        email: '',
                                        achievements: '',
                                        photo: null,
                                        use_resident_photo: false,
                                        is_regular: true,
                                        create_user_account: true,
                                        role_id: 6,
                                        username: '',
                                        password: '',
                                        password_confirmation: '',
                                    });
                                    setSelectedResident(null);
                                    setGeneratedPassword('');
                                    setShowPasswordFields(false);
                                    setPasswordSource('random');
                                    setCurrentPosition(null);
                                    setPhotoPreview(null);
                                }}
                            >
                                Reset Form
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Official'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}