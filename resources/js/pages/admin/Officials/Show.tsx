import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Shield,
    Phone,
    Mail,
    Home,
    Calendar,
    Users,
    User,
    Edit,
    Trash2,
    Copy,
    Award,
    Target,
    Building,
    Clock,
    CheckCircle,
    XCircle,
    Crown,
    ChevronLeft,
    Printer,
    Download,
    ExternalLink,
    FileText,
    Star,
    Trophy,
    Briefcase,
    GraduationCap,
    MapPin,
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Resident {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age: number;
    gender: string;
    birth_date?: string;
    civil_status: string;
    contact_number?: string;
    email?: string;
    address: string;
    photo_path?: string;
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

interface Official {
    id: number;
    position: string;
    full_position: string;
    committee?: string;
    committee_name?: string;
    term_start: string;
    term_end: string;
    term_duration: string;
    status: string;
    order: number;
    responsibilities?: string;
    contact_number?: string;
    email?: string;
    achievements?: string;
    photo_path?: string;
    photo_url?: string;
    is_regular: boolean;
    is_current: boolean;
    created_at: string;
    updated_at: string;
    resident?: Resident;
}

interface ShowOfficialProps extends PageProps {
    official: Official;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
}

export default function ShowOfficial({ official }: ShowOfficialProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = () => {
        if (official.is_current) {
            return <Badge className="bg-green-100 text-green-800">Current</Badge>;
        }
        switch (official.status) {
            case 'active':
                return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
            case 'former':
                return <Badge className="bg-amber-100 text-amber-800">Former</Badge>;
            default:
                return <Badge variant="outline">{official.status}</Badge>;
        }
    };

    const getPositionIcon = () => {
        switch (official.position) {
            case 'captain':
                return <Crown className="h-5 w-5 text-amber-600" />;
            case 'kagawad':
                return <Building className="h-5 w-5 text-blue-600" />;
            case 'secretary':
                return <FileText className="h-5 w-5 text-purple-600" />;
            case 'treasurer':
                return <Award className="h-5 w-5 text-green-600" />;
            default:
                return <Shield className="h-5 w-5 text-gray-600" />;
        }
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete this official record? This action cannot be undone.`)) {
            router.delete(`/officials/${official.id}`, {
                onSuccess: () => {
                    router.visit('/officials');
                }
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    };

    const calculateTermProgress = () => {
        const start = new Date(official.term_start).getTime();
        const end = new Date(official.term_end).getTime();
        const now = new Date().getTime();
        
        if (now < start) return 0;
        if (now > end) return 100;
        
        const total = end - start;
        const elapsed = now - start;
        return Math.round((elapsed / total) * 100);
    };

    const termProgress = calculateTermProgress();
    const isTermActive = termProgress > 0 && termProgress < 100;

    return (
        <AppLayout
            title={`Official: ${official.resident?.full_name || 'Unknown'}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Officials', href: '/officials' },
                { title: official.resident?.full_name || 'Official', href: `/officials/${official.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header with Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/officials">
                            <Button variant="ghost" size="sm">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {official.full_position}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge()}
                                <span className="text-gray-500">
                                    Official ID: {official.id}
                                </span>
                                {official.is_regular ? (
                                    <Badge className="bg-green-100 text-green-800">Regular</Badge>
                                ) : (
                                    <Badge className="bg-gray-100 text-gray-800">Ex-Officio</Badge>
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
                            onClick={() => copyToClipboard(official.id.toString())}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy ID
                        </Button>
                        <Link href={`/officials/${official.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Official
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
                    {/* Left Column - Official Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Official Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {getPositionIcon()}
                                    Official Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Position</h3>
                                        <p className="mt-1 text-lg font-semibold">
                                            {official.full_position}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Official ID</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="font-mono">{official.id}</p>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(official.id.toString())}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Committee</h3>
                                        {official.committee ? (
                                            <Badge className="mt-1 bg-blue-100 text-blue-800">
                                                <Target className="h-3 w-3 mr-1" />
                                                {official.committee_name || official.committee}
                                            </Badge>
                                        ) : (
                                            <p className="mt-1 text-gray-500">No committee assignment</p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Official Type</h3>
                                        <div className="mt-1">
                                            {official.is_regular ? (
                                                <Badge className="bg-green-100 text-green-800">
                                                    <Award className="h-3 w-3 mr-1" />
                                                    Regular Official
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    Ex-Officio
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Responsibilities</h3>
                                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                        <p className="whitespace-pre-wrap">
                                            {official.responsibilities || 'No responsibilities specified'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Term Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Term Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Term Start</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p>{formatDate(official.term_start)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Term End</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p>{formatDate(official.term_end)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Term Duration & Progress</h3>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>{official.term_duration}</span>
                                            <span>{termProgress}% complete</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    isTermActive 
                                                        ? 'bg-green-500' 
                                                        : termProgress === 100 
                                                            ? 'bg-blue-500' 
                                                            : 'bg-gray-400'
                                                }`}
                                                style={{ width: `${termProgress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Started: {formatDate(official.term_start)}</span>
                                            <span>Ends: {formatDate(official.term_end)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-lg ${
                                    official.is_current 
                                        ? 'bg-green-50 border border-green-200' 
                                        : 'bg-gray-50 border border-gray-200'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        {official.is_current ? (
                                            <>
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <span className="font-medium text-green-700">Currently Serving</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-5 w-5 text-gray-600" />
                                                <span className="font-medium text-gray-700">Not Currently Serving</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {official.is_current 
                                            ? 'This official is currently serving their term.'
                                            : 'This official is not currently serving an active term.'}
                                    </p>
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
                                            <p>{official.contact_number || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <p>{official.email || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Achievements Card */}
                        {official.achievements && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5" />
                                        Achievements & Recognition
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none">
                                        <p className="whitespace-pre-wrap">{official.achievements}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Summary & Actions */}
                    <div className="space-y-6">
                        {/* Profile Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center">
                                    {official.photo_url ? (
                                        <div className="relative h-32 w-32">
                                            <img 
                                                src={official.photo_url}
                                                alt={official.resident?.full_name || 'Official'}
                                                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `
                                                            <div class="h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                                                                <Shield className="h-16 w-16 text-blue-600" />
                                                            </div>
                                                        `;
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
                                        </div>
                                    ) : (
                                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                                            <Shield className="h-16 w-16 text-blue-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold">{official.resident?.full_name || 'Unknown Resident'}</h3>
                                    <p className="text-gray-500">{official.full_position}</p>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Status:</span>
                                        <div>{getStatusBadge()}</div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Term:</span>
                                        <span className="font-medium">{official.term_duration}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="font-medium">
                                            {official.is_regular ? 'Regular' : 'Ex-Officio'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Committee:</span>
                                        <span className="font-medium">
                                            {official.committee_name || 'None'}
                                        </span>
                                    </div>
                                    {official.resident && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Resident:</span>
                                            <Link 
                                                href={`/residents/${official.resident.id}`}
                                                className="font-medium hover:text-primary hover:underline flex items-center gap-1"
                                            >
                                                View
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/officials/${official.id}/edit`} className="w-full">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Official
                                    </Button>
                                </Link>
                                {official.resident && (
                                    <Link href={`/residents/${official.resident.id}`} className="w-full">
                                        <Button variant="outline" className="w-full justify-start">
                                            <User className="h-4 w-4 mr-2" />
                                            View Resident
                                        </Button>
                                    </Link>
                                )}
                                <Button variant="outline" className="w-full justify-start">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Profile
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export to PDF
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Official
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Timeline Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="relative pl-6">
                                        <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-200"></div>
                                        <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-blue-500"></div>
                                        <div>
                                            <p className="font-medium">Official Appointed</p>
                                            <p className="text-sm text-gray-500">{formatDate(official.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="relative pl-6">
                                        <div className="absolute left-0 top-0 h-full w-0.5 bg-green-200"></div>
                                        <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-green-500"></div>
                                        <div>
                                            <p className="font-medium">Term Started</p>
                                            <p className="text-sm text-gray-500">{formatDate(official.term_start)}</p>
                                        </div>
                                    </div>
                                    <div className="relative pl-6">
                                        <div className="absolute left-0 top-0 h-full w-0.5 bg-amber-200"></div>
                                        <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-amber-500"></div>
                                        <div>
                                            <p className="font-medium">Term Ends</p>
                                            <p className="text-sm text-gray-500">{formatDate(official.term_end)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statistics Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{official.order}</p>
                                    <p className="text-sm text-gray-600">Display Order</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${official.is_current ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span className="text-sm">Currently Serving: {official.is_current ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${official.is_regular ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                        <span className="text-sm">Type: {official.is_regular ? 'Regular' : 'Ex-Officio'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${official.contact_number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span className="text-sm">Contact: {official.contact_number ? 'Available' : 'Not Available'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${official.photo_url ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                                        <span className="text-sm">Photo: {official.photo_url ? 'Available' : 'Not Available'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                                        <span className="text-sm">Term Progress: {termProgress}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}