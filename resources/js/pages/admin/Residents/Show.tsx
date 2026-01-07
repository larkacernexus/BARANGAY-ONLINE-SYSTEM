import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    User,
    Phone,
    Mail,
    Home,
    Calendar,
    MapPin,
    Building,
    Book,
    Church,
    Vote,
    Users,
    FileText,
    Edit,
    Printer,
    ArrowLeft,
    Download,
    Trash2,
    Copy,
    Briefcase,
    GraduationCap,
    CheckCircle,
    XCircle,
    Crown,
    Heart,
    Shield,
    UserCheck,
    UserX,
    Camera,
    Eye,
    UserCog,
    Link as LinkIcon,
    ExternalLink,
    Users2,
    UserPlus
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface HouseholdHead {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age: number;
    gender: string;
    civil_status: string;
    contact_number?: string;
    purok?: string;
    purok_id?: number;
    photo_path?: string;
    photo_url?: string;
}

interface HouseholdMember {
    id: number;
    resident_id: number;
    relationship_to_head: string;
    is_head: boolean;
    resident: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        age: number;
        gender: string;
        civil_status: string;
        contact_number?: string;
        purok?: string;
        purok_id?: number;
        photo_path?: string;
        photo_url?: string;
    };
}

interface Household {
    id: number;
    household_number: string;
    contact_number: string;
    email?: string;
    address: string;
    purok?: string;
    purok_id: number;
    member_count: number;
    income_range?: string;
    housing_type?: string;
    ownership_status?: string;
    water_source?: string;
    electricity: boolean;
    internet: boolean;
    vehicle: boolean;
    remarks?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
    head_resident?: HouseholdHead;
}

interface HouseholdMembership {
    id: number;
    household_id: number;
    relationship_to_head: string;
    is_head: boolean;
}

interface RelatedHouseholdMember {
    id: number;
    resident_id: number;
    relationship_to_head: string;
    relationship_to_current?: string;
    is_head: boolean;
    resident: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        age: number;
        gender: string;
        civil_status: string;
        contact_number?: string;
        purok?: string;
        purok_id?: number;
        photo_path?: string;
        photo_url?: string;
    };
}

interface Resident {
    id: number;
    resident_id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    full_name?: string;
    birth_date: string;
    age: number;
    gender: string;
    civil_status: string;
    contact_number?: string;
    email?: string;
    address: string;
    purok_id: number;
    purok_name?: string;
    household_id?: number;
    occupation?: string;
    education?: string;
    religion?: string;
    is_voter: boolean;
    is_pwd: boolean;
    is_senior: boolean;
    place_of_birth?: string;
    remarks?: string;
    status: string;
    photo_path?: string;
    photo_url?: string;
    created_at: string;
    updated_at: string;
    
    // Backend-provided data
    household?: Household | null;
    household_membership?: HouseholdMembership | null;
    related_household_members?: RelatedHouseholdMember[];
}

interface ShowResidentProps extends PageProps {
    resident: Resident;
    household?: Household | null;
    household_membership?: HouseholdMembership | null;
    related_household_members?: RelatedHouseholdMember[];
}

export default function ShowResident({ 
    resident, 
    household, 
    household_membership, 
    related_household_members = [] 
}: ShowResidentProps) {
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    
    // Use the backend-provided data
    const actualHousehold = household || null;
    const actualHouseholdMembership = household_membership || null;
    const actualRelatedMembers = related_household_members || [];
    
    const isHeadOfHousehold = actualHouseholdMembership?.is_head || false;
    const hasHousehold = !!actualHousehold;
    const hasRelatedMembers = actualRelatedMembers.length > 0;
    
    const fullName = `${resident.first_name} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name}${resident.suffix ? ' ' + resident.suffix : ''}`;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPhotoUrl = (photoPath?: string, photoUrl?: string): string | null => {
        // Use photo_url if provided (from backend)
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

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
            case 'deceased':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Deceased</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getCivilStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'married':
                return <Badge className="bg-blue-100 text-blue-800">Married</Badge>;
            case 'single':
                return <Badge className="bg-gray-100 text-gray-800">Single</Badge>;
            case 'widowed':
                return <Badge className="bg-purple-100 text-purple-800">Widowed</Badge>;
            case 'separated':
                return <Badge className="bg-orange-100 text-orange-800">Separated</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getGenderBadge = (gender: string) => {
        switch (gender.toLowerCase()) {
            case 'male':
                return <Badge className="bg-blue-100 text-blue-800">Male</Badge>;
            case 'female':
                return <Badge className="bg-pink-100 text-pink-800">Female</Badge>;
            case 'other':
                return <Badge className="bg-purple-100 text-purple-800">Other</Badge>;
            default:
                return <Badge variant="outline">{gender}</Badge>;
        }
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete resident ${resident.first_name} ${resident.last_name}? This action cannot be undone.`)) {
            router.delete(`/residents/${resident.id}`, {
                onSuccess: () => {
                    router.visit('/residents');
                }
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    };

    const calculateAge = (birthDate: string) => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getRelationshipColor = (relationship: string) => {
        const rel = relationship.toLowerCase();
        if (rel.includes('head')) {
            return 'bg-blue-100 text-blue-800 border-blue-200';
        }
        if (rel.includes('spouse')) {
            return 'bg-pink-100 text-pink-800 border-pink-200';
        }
        if (rel.includes('son') || rel.includes('daughter') || rel.includes('child')) {
            return 'bg-green-100 text-green-800 border-green-200';
        }
        if (rel.includes('father') || rel.includes('mother') || rel.includes('parent')) {
            return 'bg-purple-100 text-purple-800 border-purple-200';
        }
        if (rel.includes('brother') || rel.includes('sister') || rel.includes('sibling')) {
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
        if (rel.includes('grand')) {
            return 'bg-amber-100 text-amber-800 border-amber-200';
        }
        if (rel.includes('uncle') || rel.includes('aunt') || rel.includes('nephew') || rel.includes('niece')) {
            return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        }
        if (rel.includes('in_law')) {
            return 'bg-red-100 text-red-800 border-red-200';
        }
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatRelationship = (relationship?: string) => {
        if (!relationship) return 'Member';
        return relationship.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const viewFullPhoto = () => {
        const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
        if (photoUrl) {
            window.open(photoUrl, '_blank');
        }
    };

    return (
        <AppLayout
            title={`Resident: ${resident.first_name} ${resident.last_name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Residents', href: '/residents' },
                { title: `${resident.first_name} ${resident.last_name}`, href: `/residents/${resident.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header with Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/residents">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {fullName}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(resident.status)}
                                <span className="text-gray-500">
                                    Resident ID: {resident.resident_id}
                                </span>
                                {isHeadOfHousehold && (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        <Crown className="h-3 w-3 mr-1" />
                                        Head of Household
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(resident.resident_id)}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy ID
                        </Button>
                        <Link href={`/residents/${resident.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Resident
                            </Button>
                        </Link>
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Resident Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                                        <p className="mt-1 text-lg font-semibold">
                                            {fullName}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Resident ID</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="font-mono">{resident.resident_id}</p>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(resident.resident_id)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p>{formatDate(resident.birth_date)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Age</h3>
                                        <p className="mt-1 text-xl font-semibold">{resident.age} years old</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                                        <div className="mt-1">
                                            {getGenderBadge(resident.gender)}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Civil Status</h3>
                                        <div className="mt-1">
                                            {getCivilStatusBadge(resident.civil_status)}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Place of Birth</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <p>{resident.place_of_birth || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <p>{resident.contact_number || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <p>{resident.email || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Complete Address</h3>
                                    <div className="flex items-start gap-2 mt-1">
                                        <Home className="h-4 w-4 text-gray-400 mt-1" />
                                        <div>
                                            <p className="font-medium">{resident.address}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Building className="h-3 w-3 text-gray-400" />
                                                <p className="text-gray-600">{resident.purok_name || 'No purok assigned'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Household Information Card */}
                        {hasHousehold && actualHousehold && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Home className="h-5 w-5" />
                                        Household Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Household Number</h3>
                                            <Link 
                                                href={`/households/${actualHousehold.id}`}
                                                className="group hover:text-primary hover:underline"
                                            >
                                                <p className="mt-1 font-semibold group-hover:text-primary flex items-center gap-2">
                                                    {actualHousehold.household_number}
                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </p>
                                            </Link>
                                        </div>
                                        {actualHouseholdMembership && (
                                            <Badge className={getRelationshipColor(actualHouseholdMembership.relationship_to_head)}>
                                                {formatRelationship(actualHouseholdMembership.relationship_to_head)}
                                                {actualHouseholdMembership.is_head && ' (Head)'}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Head of Family</h3>
                                            <p className="mt-1">
                                                {actualHousehold.head_resident ? 
                                                    `${actualHousehold.head_resident.first_name} ${actualHousehold.head_resident.last_name}` : 
                                                    'No head assigned'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
                                            <p className="mt-1">
                                                {actualHousehold.member_count || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Household Address</h3>
                                        <div className="flex items-start gap-2 mt-1">
                                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                            <p className="text-gray-600">{actualHousehold.address}</p>
                                        </div>
                                    </div>
                                    
                                    {actualHousehold.income_range && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Income Range</h3>
                                            <p className="mt-1">{actualHousehold.income_range}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Related Household Members Card */}
                        {hasRelatedMembers && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users2 className="h-5 w-5" />
                                            Related Household Members
                                            <Badge variant="outline" className="ml-2">
                                                {actualRelatedMembers.length} member{actualRelatedMembers.length !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        {actualHousehold && (
                                            <Link href={`/households/${actualHousehold.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Full Household
                                                </Button>
                                            </Link>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {actualRelatedMembers.map((member) => {
                                            const memberResident = member.resident;
                                            const memberPhotoUrl = getPhotoUrl(memberResident.photo_path, memberResident.photo_url);
                                            const isCurrentResident = memberResident.id === resident.id;
                                            
                                            return (
                                                <Link 
                                                    key={member.id} 
                                                    href={`/residents/${memberResident.id}`}
                                                    className="block hover:no-underline"
                                                >
                                                    <div className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer group ${
                                                        isCurrentResident ? 'bg-blue-50 border-blue-200' : ''
                                                    }`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${
                                                                member.is_head 
                                                                    ? 'border-2 border-blue-500 group-hover:border-blue-600' 
                                                                    : 'border border-gray-300 group-hover:border-gray-400'
                                                            }`}>
                                                                {memberPhotoUrl ? (
                                                                    <img 
                                                                        src={memberPhotoUrl}
                                                                        alt={`${memberResident.first_name} ${memberResident.last_name}`}
                                                                        className="h-full w-full object-cover"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                            const parent = e.currentTarget.parentElement;
                                                                            if (parent) {
                                                                                parent.innerHTML = `
                                                                                    <div class="h-full w-full flex items-center justify-center ${
                                                                                        member.is_head 
                                                                                            ? 'bg-blue-100 text-blue-600' 
                                                                                            : 'bg-gray-100 text-gray-600'
                                                                                    }">
                                                                                        <User className="h-5 w-5" />
                                                                                    </div>
                                                                                `;
                                                                            }
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className={`h-full w-full flex items-center justify-center ${
                                                                        member.is_head 
                                                                            ? 'bg-blue-100 text-blue-600' 
                                                                            : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                        <User className="h-5 w-5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="font-medium flex items-center gap-2 group-hover:text-blue-700">
                                                                    {memberResident.first_name} {memberResident.last_name}
                                                                    {isCurrentResident && (
                                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                                            Current
                                                                        </span>
                                                                    )}
                                                                    <ExternalLink className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </div>
                                                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        {memberResident.age} years old
                                                                        <span>•</span>
                                                                        {memberResident.gender}
                                                                    </div>
                                                                    {memberPhotoUrl && (
                                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                            <Camera className="h-3 w-3" />
                                                                            Has photo
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col items-end gap-2">
                                                            <Badge className={getRelationshipColor(member.relationship_to_head)}>
                                                                {formatRelationship(member.relationship_to_head)}
                                                            </Badge>
                                                            {member.is_head && (
                                                                <Badge className="bg-yellow-100 text-yellow-800">
                                                                    <Crown className="h-3 w-3 mr-1" />
                                                                    Head
                                                                </Badge>
                                                            )}
                                                            {/* Show relationship to current resident */}
                                                            {member.relationship_to_current && (
                                                                <div className="text-xs text-gray-500 text-right">
                                                                    {member.relationship_to_current}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                    
                                    {actualHousehold && actualRelatedMembers.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>Showing {actualRelatedMembers.length} related members</span>
                                                <Link 
                                                    href={`/households/${actualHousehold.id}`}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    View complete household
                                                    <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Additional Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Occupation</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Briefcase className="h-4 w-4 text-gray-400" />
                                            <p>{resident.occupation || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Highest Education</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <GraduationCap className="h-4 w-4 text-gray-400" />
                                            <p>{resident.education || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Religion</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Church className="h-4 w-4 text-gray-400" />
                                            <p>{resident.religion || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Photo Status</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Camera className="h-4 w-4 text-gray-400" />
                                            <p>{(resident.photo_path || resident.photo_url) ? 'Photo Available' : 'No Photo'}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">Special Categories</h3>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div className={`flex items-center gap-2 p-3 rounded-lg ${resident.is_voter ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                            <Vote className="h-4 w-4" />
                                            <span>Registered Voter</span>
                                            {resident.is_voter ? (
                                                <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 ml-auto text-gray-400" />
                                            )}
                                        </div>
                                        <div className={`flex items-center gap-2 p-3 rounded-lg ${resident.is_pwd ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'}`}>
                                            <Shield className="h-4 w-4" />
                                            <span>Person with Disability</span>
                                            {resident.is_pwd ? (
                                                <CheckCircle className="h-4 w-4 ml-auto text-blue-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 ml-auto text-gray-400" />
                                            )}
                                        </div>
                                        <div className={`flex items-center gap-2 p-3 rounded-lg ${resident.is_senior ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-500'}`}>
                                            <Users className="h-4 w-4" />
                                            <span>Senior Citizen</span>
                                            {resident.is_senior ? (
                                                <CheckCircle className="h-4 w-4 ml-auto text-purple-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 ml-auto text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Remarks Card */}
                        {resident.remarks && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Remarks & Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none">
                                        <p className="whitespace-pre-wrap">{resident.remarks}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Summary & Actions */}
                    <div className="space-y-6">
                        {/* Profile Summary Card with Photo */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center">
                                    {(resident.photo_path || resident.photo_url) ? (
                                        <div className="relative h-32 w-32">
                                            <img 
                                                src={getPhotoUrl(resident.photo_path, resident.photo_url) || ''}
                                                alt={`${resident.first_name} ${resident.last_name}`}
                                                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `
                                                            <div class="h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                                                                <User className="h-16 w-16 text-blue-600" />
                                                            </div>
                                                        `;
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
                                        </div>
                                    ) : (
                                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                                            <User className="h-16 w-16 text-blue-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold">{fullName}</h3>
                                    <p className="text-gray-500">Resident ID: {resident.resident_id}</p>
                                    {isHeadOfHousehold && (
                                        <div className="mt-2">
                                            <Badge className="bg-yellow-100 text-yellow-800">
                                                <Crown className="h-3 w-3 mr-1" />
                                                Head of Household
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Status:</span>
                                        <div>{getStatusBadge(resident.status)}</div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Age:</span>
                                        <span className="font-medium">{resident.age} years</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Gender:</span>
                                        <div>{getGenderBadge(resident.gender)}</div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Civil Status:</span>
                                        <div>{getCivilStatusBadge(resident.civil_status)}</div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Purok:</span>
                                        <span className="font-medium">{resident.purok_name || 'None'}</span>
                                    </div>
                                    {hasHousehold && actualHousehold && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Household:</span>
                                            <Link 
                                                href={`/households/${actualHousehold.id}`}
                                                className="font-medium hover:text-primary hover:underline flex items-center gap-1"
                                            >
                                                {actualHousehold.household_number}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    )}
                                    {hasRelatedMembers && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Related Members:</span>
                                            <span className="font-medium">{actualRelatedMembers.length}</span>
                                        </div>
                                    )}
                                </div>
                                {(resident.photo_path || resident.photo_url) && (
                                    <>
                                        <Separator />
                                        <div className="text-center">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="text-xs w-full"
                                                onClick={viewFullPhoto}
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                View Full Photo
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/residents/${resident.id}/edit`} className="w-full">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Resident
                                    </Button>
                                </Link>
                                <Button variant="outline" className="w-full justify-start">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Profile
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export to PDF
                                </Button>
                                {(resident.photo_path || resident.photo_url) && (
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start"
                                        onClick={viewFullPhoto}
                                    >
                                        <Camera className="h-4 w-4 mr-2" />
                                        View Photo
                                    </Button>
                                )}
                                {!hasHousehold && (
                                    <Link href={`/residents/${resident.id}/edit`} className="w-full">
                                        <Button variant="outline" className="w-full justify-start">
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Add to Household
                                        </Button>
                                    </Link>
                                )}
                                {hasHousehold && !isHeadOfHousehold && actualHousehold && (
                                    <Link href={`/households/${actualHousehold.id}`} className="w-full">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Users className="h-4 w-4 mr-2" />
                                            View Household
                                        </Button>
                                    </Link>
                                )}
                                {hasRelatedMembers && actualHousehold && (
                                    <Link href={`/households/${actualHousehold.id}`} className="w-full">
                                        <Button variant="outline" className="w-full justify-start">
                                            <UserCog className="h-4 w-4 mr-2" />
                                            Manage Household
                                        </Button>
                                    </Link>
                                )}
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Resident
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Timeline Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Resident Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="relative pl-6">
                                        <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-200"></div>
                                        <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-blue-500"></div>
                                        <div>
                                            <p className="font-medium">Resident Registered</p>
                                            <p className="text-sm text-gray-500">{formatDate(resident.created_at)}</p>
                                        </div>
                                    </div>
                                    {hasHousehold && actualHouseholdMembership && (
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-0 h-full w-0.5 bg-green-200"></div>
                                            <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-green-500"></div>
                                            <div>
                                                <p className="font-medium">
                                                    {isHeadOfHousehold ? 'Became Head of Household' : 'Added to Household'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {actualHousehold?.household_number}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatRelationship(actualHouseholdMembership.relationship_to_head)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="relative pl-6">
                                        <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200"></div>
                                        <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-gray-400"></div>
                                        <div>
                                            <p className="font-medium">Last Updated</p>
                                            <p className="text-sm text-gray-500">{formatDate(resident.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Database ID</h3>
                                    <p className="mt-1 font-mono text-sm">{resident.id}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Photo Status</h3>
                                    <p className="mt-1 text-sm">
                                        {(resident.photo_path || resident.photo_url) ? 'Available' : 'Not Available'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Purok ID</h3>
                                    <p className="mt-1">{resident.purok_id}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Household ID</h3>
                                    <p className="mt-1">{resident.household_id || 'None'}</p>
                                </div>
                                {hasRelatedMembers && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Related Members</h3>
                                        <p className="mt-1 text-sm">{actualRelatedMembers.length}</p>
                                    </div>
                                )}
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                                >
                                    {showMoreDetails ? 'Show Less' : 'Show More Details'}
                                </Button>
                                
                                {showMoreDetails && (
                                    <div className="pt-3 space-y-3 border-t">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                                            <p className="mt-1 text-sm">{formatDateTime(resident.created_at)}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
                                            <p className="mt-1 text-sm">{formatDateTime(resident.updated_at)}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                                            <p className="mt-1 text-sm">{resident.birth_date}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Calculated Age</h3>
                                            <p className="mt-1 text-sm">{calculateAge(resident.birth_date)} years old</p>
                                        </div>
                                        {actualHouseholdMembership && (
                                            <>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Household Member ID</h3>
                                                    <p className="mt-1 text-sm">{actualHouseholdMembership.id}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Is Head?</h3>
                                                    <p className="mt-1 text-sm">{actualHouseholdMembership.is_head ? 'Yes' : 'No'}</p>
                                                </div>
                                            </>
                                        )}
                                        {(resident.photo_path || resident.photo_url) && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Photo URL</h3>
                                                <p className="mt-1 text-sm break-all font-mono text-xs">
                                                    {getPhotoUrl(resident.photo_path, resident.photo_url)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Statistics Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{resident.age}</p>
                                        <p className="text-sm text-gray-600">Current Age</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                            {new Date().getFullYear() - new Date(resident.birth_date).getFullYear()}
                                        </p>
                                        <p className="text-sm text-gray-600">Years in Database</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${resident.is_voter ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span className="text-sm">Registered Voter: {resident.is_voter ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${resident.is_pwd ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                        <span className="text-sm">PWD: {resident.is_pwd ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${resident.is_senior ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                                        <span className="text-sm">Senior Citizen: {resident.is_senior ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${(resident.photo_path || resident.photo_url) ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                                        <span className="text-sm">Photo: {(resident.photo_path || resident.photo_url) ? 'Available' : 'Not Available'}</span>
                                    </div>
                                    {hasRelatedMembers && (
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                                            <span className="text-sm">Related Members: {actualRelatedMembers.length}</span>
                                        </div>
                                    )}
                                    {hasHousehold && (
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                                            <span className="text-sm">Household: {actualHousehold?.household_number}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}