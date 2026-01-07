import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Home,
    User,
    Phone,
    Mail,
    MapPin,
    Users,
    Building,
    Droplets,
    Zap,
    Wifi,
    Car,
    Calendar,
    FileText,
    Edit,
    Printer,
    ArrowLeft,
    Download,
    MoreVertical,
    ExternalLink,
    Camera,
    Image,
    Crown
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age: number;
    gender: string;
    civil_status: string;
    contact_number?: string;
    purok: string;
    purok_id?: number;
    photo_path?: string;
    photo_url?: string;
}

interface HouseholdMember {
    id: number;
    resident_id: number;
    relationship_to_head: string;
    is_head: boolean;
    resident: Resident;
}

interface Household {
    id: number;
    household_number: string;
    contact_number: string;
    email?: string;
    address: string;
    purok: string;
    purok_id?: number;
    member_count: number;
    income_range?: string;
    housing_type?: string;
    ownership_status?: string;
    water_source?: string;
    electricity: boolean;
    internet: boolean;
    vehicle: boolean;
    remarks?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    household_members: HouseholdMember[];
    head_resident?: Resident | null; // From backend
}

interface ShowHouseholdProps extends PageProps {
    household: Household;
}

// Helper function to get photo URL
const getPhotoUrl = (photoPath?: string, photoUrl?: string): string | null => {
    if (photoUrl) return photoUrl;
    if (!photoPath) return null;
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
    }
    
    const cleanPath = photoPath.replace('public/', '');
    
    if (cleanPath.startsWith('storage/')) {
        return `/${cleanPath}`;
    }
    
    if (cleanPath.includes('resident-photos') || cleanPath.includes('resident_photos')) {
        return `/storage/${cleanPath}`;
    }
    
    return `/storage/${cleanPath}`;
};

// Helper function to get head member from household members
const getHeadMember = (household: Household): HouseholdMember | null => {
    if (!household.household_members || household.household_members.length === 0) {
        return null;
    }
    
    // Find head member from household members
    const headMember = household.household_members.find(member => member.is_head);
    return headMember || null;
};

// Helper function to get head resident
const getHeadResident = (household: Household): Resident | null => {
    // First, try to use head_resident from backend
    if (household.head_resident) {
        return household.head_resident;
    }
    
    // Fallback: find head from household members
    const headMember = getHeadMember(household);
    if (headMember) {
        return headMember.resident;
    }
    
    return null;
};

// Helper function to get head of family name
const getHeadOfFamily = (household: Household): string => {
    const headResident = getHeadResident(household);
    if (headResident) {
        return getFullName(headResident);
    }
    
    // Fallback: find any member to show as head
    if (household.household_members && household.household_members.length > 0) {
        return getFullName(household.household_members[0].resident);
    }
    
    return 'No Head Assigned';
};

// Helper function to get head resident ID
const getHeadResidentId = (household: Household): number | null => {
    const headResident = getHeadResident(household);
    return headResident ? headResident.id : null;
};

const getFullName = (resident: Resident): string => {
    let name = `${resident.first_name}`;
    if (resident.middle_name) {
        name += ` ${resident.middle_name.charAt(0)}.`;
    }
    name += ` ${resident.last_name}`;
    return name;
};

export default function ShowHousehold({ household }: ShowHouseholdProps) {
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    
    // Get computed values
    const headResident = getHeadResident(household);
    const headMember = getHeadMember(household);
    const headOfFamily = getHeadOfFamily(household);
    const headResidentId = getHeadResidentId(household);
    const hasHead = !!headResident;
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500">Active</Badge>;
            case 'inactive':
                return <Badge variant="destructive">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };
    
    const getRelationshipColor = (relationship: string) => {
        const rel = relationship.toLowerCase();
        if (rel === 'head') {
            return 'bg-blue-100 text-blue-800';
        }
        if (rel.includes('spouse')) {
            return 'bg-pink-100 text-pink-800';
        }
        if (rel.includes('son') || rel.includes('daughter') || rel.includes('child')) {
            return 'bg-green-100 text-green-800';
        }
        if (rel.includes('father') || rel.includes('mother') || rel.includes('parent')) {
            return 'bg-purple-100 text-purple-800';
        }
        if (rel.includes('brother') || rel.includes('sister') || rel.includes('sibling')) {
            return 'bg-yellow-100 text-yellow-800';
        }
        if (rel.includes('grand')) {
            return 'bg-amber-100 text-amber-800';
        }
        if (rel.includes('uncle') || rel.includes('aunt') || rel.includes('nephew') || rel.includes('niece')) {
            return 'bg-indigo-100 text-indigo-800';
        }
        if (rel.includes('in_law')) {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-gray-100 text-gray-800';
    };
    
    // Function to view photo
    const viewPhoto = (photoPath?: string, photoUrl?: string) => {
        const url = getPhotoUrl(photoPath, photoUrl);
        if (url) {
            window.open(url, '_blank');
        }
    };
    
    // Get photo URL for a resident
    const getResidentPhotoUrl = (resident: Resident) => {
        return getPhotoUrl(resident.photo_path, resident.photo_url);
    };
    
    return (
        <AppLayout
            title={`Household: ${household.household_number}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Households', href: '/households' },
                { title: household.household_number, href: `/households/${household.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header with Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/households">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Household {household.household_number}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(household.status)}
                                <span className="text-gray-500">
                                    Registered {formatDate(household.created_at)}
                                </span>
                                {hasHead && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                        <Crown className="h-3 w-3 mr-1" />
                                        Head: {getFullName(headResident!)}
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
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Link href={`/households/${household.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Household
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Household Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Household Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Home className="h-5 w-5" />
                                    Household Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Household Number</h3>
                                        <p className="mt-1 text-lg font-semibold">{household.household_number}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Registration Date</h3>
                                        <p className="mt-1">{formatDate(household.created_at)}</p>
                                    </div>
                                </div>

                                <Separator />

                                {hasHead && headResidentId && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-3">Head of Family</h3>
                                        <Link 
                                            href={`/residents/${headResidentId}`}
                                            className="block hover:no-underline"
                                        >
                                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer group">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 overflow-hidden flex-shrink-0">
                                                    {getResidentPhotoUrl(headResident!) ? (
                                                        <img 
                                                            src={getResidentPhotoUrl(headResident!)!}
                                                            alt={getFullName(headResident!)}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const parent = e.currentTarget.parentElement;
                                                                if (parent) {
                                                                    parent.innerHTML = '<svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold group-hover:text-blue-700">
                                                            {getFullName(headResident!)}
                                                        </p>
                                                        <ExternalLink className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span>{headResident.age} years old</span>
                                                        <span>•</span>
                                                        <span>{headResident.gender}</span>
                                                        <span>•</span>
                                                        <span>{headResident.civil_status}</span>
                                                        {getResidentPhotoUrl(headResident) && (
                                                            <>
                                                                <span>•</span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Camera className="h-2.5 w-2.5 mr-1" />
                                                                    Photo
                                                                </Badge>
                                                            </>
                                                        )}
                                                    </div>
                                                    {headResident.contact_number && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{headResident.contact_number}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Badge className="ml-auto bg-yellow-100 text-yellow-800">
                                                    <Crown className="h-3 w-3 mr-1" />
                                                    Head
                                                </Badge>
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <p>{household.contact_number || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    {household.email && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <p>{household.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                        <div>
                                            <p className="font-medium">{household.address}</p>
                                            <p className="text-gray-600">Purok {household.purok}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Household Members Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Household Members
                                        <Badge variant="outline" className="ml-2">
                                            {household.member_count} members
                                        </Badge>
                                    </div>
                                    <Link href={`/households/${household.id}/edit?tab=members`}>
                                        <Button variant="outline" size="sm">
                                            Manage Members
                                        </Button>
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {household.household_members && household.household_members.length > 0 ? (
                                        household.household_members.map((member) => {
                                            const photoUrl = getResidentPhotoUrl(member.resident);
                                            const hasPhoto = !!photoUrl;
                                            const isHead = member.is_head;
                                            const fullName = getFullName(member.resident);
                                            
                                            return (
                                                <Link 
                                                    key={member.id} 
                                                    href={`/residents/${member.resident_id}`}
                                                    className="block hover:no-underline"
                                                >
                                                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer group">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${
                                                                isHead ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                                            }`}>
                                                                {hasPhoto ? (
                                                                    <img 
                                                                        src={photoUrl}
                                                                        alt={fullName}
                                                                        className="h-full w-full object-cover"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                            const parent = e.currentTarget.parentElement;
                                                                            if (parent) {
                                                                                parent.innerHTML = '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                                                            }
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <User className="h-5 w-5" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-medium group-hover:text-blue-700">
                                                                        {fullName}
                                                                    </p>
                                                                    <ExternalLink className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <span>{member.resident.age} years old</span>
                                                                    <span>•</span>
                                                                    <span>{member.resident.gender}</span>
                                                                    <span>•</span>
                                                                    <span>{member.resident.civil_status}</span>
                                                                    {hasPhoto && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <Badge variant="outline" className="text-xs">
                                                                                <Camera className="h-2.5 w-2.5 mr-1" />
                                                                            </Badge>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                {member.resident.contact_number && (
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                                        <Phone className="h-3 w-3" />
                                                                        <span>{member.resident.contact_number}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge className={getRelationshipColor(member.relationship_to_head)}>
                                                                {member.relationship_to_head}
                                                            </Badge>
                                                            {isHead && (
                                                                <Badge className="bg-yellow-100 text-yellow-800">
                                                                    <Crown className="h-3 w-3 mr-1" />
                                                                    Head
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>No members added to this household yet.</p>
                                            <Link href={`/households/${household.id}/edit?tab=members`}>
                                                <Button variant="outline" size="sm" className="mt-3">
                                                    Add Members
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Housing & Economic Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Housing & Economic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Housing Type</h3>
                                        <p className="mt-1">{household.housing_type || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Ownership Status</h3>
                                        <p className="mt-1">{household.ownership_status || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Water Source</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Droplets className="h-4 w-4 text-gray-400" />
                                            <p>{household.water_source || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Monthly Income Range</h3>
                                        <p className="mt-1">{household.income_range || 'Not specified'}</p>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">Household Amenities</h3>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div className={`flex items-center gap-2 p-3 rounded-lg ${household.electricity ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                            <Zap className="h-4 w-4" />
                                            <span>Electricity</span>
                                            {household.electricity ? (
                                                <Badge className="ml-auto bg-green-100 text-green-800">Yes</Badge>
                                            ) : (
                                                <Badge variant="outline" className="ml-auto">No</Badge>
                                            )}
                                        </div>
                                        <div className={`flex items-center gap-2 p-3 rounded-lg ${household.internet ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                            <Wifi className="h-4 w-4" />
                                            <span>Internet</span>
                                            {household.internet ? (
                                                <Badge className="ml-auto bg-green-100 text-green-800">Yes</Badge>
                                            ) : (
                                                <Badge variant="outline" className="ml-auto">No</Badge>
                                            )}
                                        </div>
                                        <div className={`flex items-center gap-2 p-3 rounded-lg ${household.vehicle ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                            <Car className="h-4 w-4" />
                                            <span>Vehicle</span>
                                            {household.vehicle ? (
                                                <Badge className="ml-auto bg-green-100 text-green-800">Yes</Badge>
                                            ) : (
                                                <Badge variant="outline" className="ml-auto">No</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Remarks Card */}
                        {household.remarks && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Remarks & Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none">
                                        <p className="whitespace-pre-wrap">{household.remarks}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Summary & Actions */}
                    <div className="space-y-6">
                        {/* Quick Actions Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/households/${household.id}/edit`} className="w-full">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Household
                                    </Button>
                                </Link>
                                <Button variant="outline" className="w-full justify-start">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Household Profile
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export to PDF
                                </Button>
                                <Link href={`/residents/create?household_id=${household.id}`} className="w-full">
                                    <Button variant="outline" className="w-full justify-start">
                                        <User className="h-4 w-4 mr-2" />
                                        Add New Resident
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Household Statistics Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Household Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{household.member_count}</p>
                                        <p className="text-sm text-gray-600">Total Members</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                            {household.household_members?.filter(m => m.resident.age >= 60).length || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Seniors</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Male Members:</span>
                                        <span className="font-medium">
                                            {household.household_members?.filter(m => m.resident.gender.toLowerCase() === 'male').length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Female Members:</span>
                                        <span className="font-medium">
                                            {household.household_members?.filter(m => m.resident.gender.toLowerCase() === 'female').length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Average Age:</span>
                                        <span className="font-medium">
                                            {household.household_members && household.household_members.length > 0
                                                ? Math.round(household.household_members.reduce((sum, m) => sum + m.resident.age, 0) / household.household_members.length)
                                                : 0} years
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Members with Photos:</span>
                                        <span className="font-medium">
                                            {household.household_members?.filter(m => m.resident.photo_path || m.resident.photo_url).length || 0}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Clickable Member Statistics */}
                                <Separator />
                                <div className="pt-2">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">View Members by Category</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link 
                                            href={`/residents?household_id=${household.id}&gender=male`}
                                            className="block hover:no-underline"
                                        >
                                            <Button variant="outline" size="sm" className="w-full justify-start">
                                                <span className="text-blue-600">
                                                    {household.household_members?.filter(m => m.resident.gender.toLowerCase() === 'male').length || 0}
                                                </span>
                                                <span className="ml-2">Male</span>
                                            </Button>
                                        </Link>
                                        <Link 
                                            href={`/residents?household_id=${household.id}&gender=female`}
                                            className="block hover:no-underline"
                                        >
                                            <Button variant="outline" size="sm" className="w-full justify-start">
                                                <span className="text-pink-600">
                                                    {household.household_members?.filter(m => m.resident.gender.toLowerCase() === 'female').length || 0}
                                                </span>
                                                <span className="ml-2">Female</span>
                                            </Button>
                                        </Link>
                                        <Link 
                                            href={`/residents?household_id=${household.id}&age_from=60`}
                                            className="block hover:no-underline"
                                        >
                                            <Button variant="outline" size="sm" className="w-full justify-start">
                                                <span className="text-green-600">
                                                    {household.household_members?.filter(m => m.resident.age >= 60).length || 0}
                                                </span>
                                                <span className="ml-2">Seniors</span>
                                            </Button>
                                        </Link>
                                        <Link 
                                            href={`/residents?household_id=${household.id}&age_to=18`}
                                            className="block hover:no-underline"
                                        >
                                            <Button variant="outline" size="sm" className="w-full justify-start">
                                                <span className="text-yellow-600">
                                                    {household.household_members?.filter(m => m.resident.age <= 18).length || 0}
                                                </span>
                                                <span className="ml-2">Minors</span>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Household Timeline Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Household Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="relative pl-6">
                                        <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-200"></div>
                                        <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-blue-500"></div>
                                        <div>
                                            <p className="font-medium">Household Created</p>
                                            <p className="text-sm text-gray-500">{formatDate(household.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="relative pl-6">
                                        <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200"></div>
                                        <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-gray-400"></div>
                                        <div>
                                            <p className="font-medium">Last Updated</p>
                                            <p className="text-sm text-gray-500">{formatDate(household.updated_at)}</p>
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
                                    <h3 className="text-sm font-medium text-gray-500">Household ID</h3>
                                    <p className="mt-1 font-mono text-sm">{household.id}</p>
                                </div>
                                {hasHead && headResidentId && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Head Resident</h3>
                                        <div className="mt-1">
                                            <Link 
                                                href={`/residents/${headResidentId}`}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                <span>View Profile</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Purok</h3>
                                    <p className="mt-1">Purok {household.purok}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Members with Photos</h3>
                                    <p className="mt-1 text-sm">
                                        {household.household_members?.filter(m => m.resident.photo_path || m.resident.photo_url).length || 0} / {household.member_count}
                                    </p>
                                </div>
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
                                            <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                            <div className="mt-1">{getStatusBadge(household.status)}</div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                                            <p className="mt-1 text-sm">{new Date(household.created_at).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
                                            <p className="mt-1 text-sm">{new Date(household.updated_at).toLocaleString()}</p>
                                        </div>
                                        {household.purok_id && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Purok ID</h3>
                                                <p className="mt-1 text-sm">{household.purok_id}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}