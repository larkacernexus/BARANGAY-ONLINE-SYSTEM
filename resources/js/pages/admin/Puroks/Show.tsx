import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    MapPin,
    Users,
    Home,
    Phone,
    Mail,
    Calendar,
    FileText,
    Edit,
    ArrowLeft,
    BarChart3,
    Activity,
    UserPlus,
    Download,
    Printer,
    Share2,
    Eye,
    MoreHorizontal,
    ChevronRight,
    Building2,
    Navigation,
    Target,
    Clock,
    PlusCircle,
    ExternalLink,
    Globe,
    Map
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    member_count: number;
    address: string;
    contact_number: string;
    created_at: string;
}

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age: number;
    gender: string;
    contact_number: string;
    address: string;
    created_at: string;
}

interface Stat {
    label: string;
    value: string | number;
    icon: string;
    color: string;
}

interface Demographics {
    gender: {
        male: number;
        female: number;
        other: number;
    };
    age_groups: {
        children: number;
        adults: number;
        seniors: number;
    };
}

interface PurokShowProps extends PageProps {
    purok: {
        id: number;
        name: string;
        slug: string;
        description: string;
        leader_name: string;
        leader_contact: string;
        google_maps_url: string;
        latitude: number;
        longitude: number;
        total_households: number;
        total_residents: number;
        status: string;
        created_at: string;
        updated_at: string;
    };
    stats: Stat[];
    recentHouseholds: Household[];
    recentResidents: Resident[];
    demographics: Demographics;
    households: {
        data: Household[];
        current_page: number;
        last_page: number;
        total: number;
    };
    residents: {
        data: Resident[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function PurokShow({ 
    purok, 
    stats, 
    recentHouseholds, 
    recentResidents, 
    demographics,
    households,
    residents 
}: PurokShowProps) {
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            default: return 'outline';
        }
    };

    const getFullName = (resident: Resident) => {
        let name = `${resident.first_name}`;
        if (resident.middle_name) {
            name += ` ${resident.middle_name.charAt(0)}.`;
        }
        name += ` ${resident.last_name}`;
        return name;
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete purok "${purok.name}"? This action cannot be undone.`)) {
            router.delete(`/admin/puroks/${purok.id}`);
        }
    };

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'home': return <Home className="h-4 w-4" />;
            case 'users': return <Users className="h-4 w-4" />;
            case 'bar-chart-3': return <BarChart3 className="h-4 w-4" />;
            case 'activity': return <Activity className="h-4 w-4" />;
            case 'globe': return <Globe className="h-4 w-4" />;
            default: return <MapPin className="h-4 w-4" />;
        }
    };

    const getColorClass = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'gray': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
            case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        }
    };

    const formatCoordinates = () => {
        if (purok.latitude && purok.longitude) {
            return `${purok.latitude.toFixed(6)}, ${purok.longitude.toFixed(6)}`;
        }
        return 'Not available';
    };

    const truncateUrl = (url: string, maxLength: number = 50) => {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    };

    return (
        <AppLayout
            title={`Purok: ${purok.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Puroks', href: '/admin/puroks' },
                { title: purok.name, href: `/admin/puroks/${purok.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/puroks">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Puroks
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <MapPin className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">{purok.name}</h1>
                                    <div className="flex items-center gap-3 mt-1">
                                        <Badge variant={getStatusBadgeVariant(purok.status)}>
                                            {purok.status.charAt(0).toUpperCase() + purok.status.slice(1)}
                                        </Badge>
                                        <span className="text-sm text-gray-500">
                                            Created {formatDate(purok.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {purok.google_maps_url && (
                            <a 
                                href={purok.google_maps_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" size="sm">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open in Maps
                                </Button>
                            </a>
                        )}
                        <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Link href={`/admin/puroks/${purok.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Purok
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {stats.map((stat, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getColorClass(stat.color)}`}>
                                        {getIconComponent(stat.icon)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Purok Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Purok Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Purok Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Purok Name</Label>
                                        <p className="text-base">{purok.name}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Slug/Code</Label>
                                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {purok.slug}
                                        </code>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                                    <p className="text-base text-gray-700 dark:text-gray-300">
                                        {purok.description || 'No description provided.'}
                                    </p>
                                </div>

                               {/* Google Maps Section - Fixed Directions */}
<div className="space-y-3">
    <Label className="text-sm font-medium text-gray-500">Google Maps Location</Label>
    {purok.google_maps_url ? (
        <div className="space-y-3">
            {/* Simple URL Display */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="font-medium">Google Maps Link</p>
                            <p className="text-sm text-gray-500 break-all">
                                {purok.google_maps_url}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
                <a 
                    href={purok.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    <Button className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Maps
                    </Button>
                </a>
                {purok.latitude && purok.longitude ? (
                    <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${purok.latitude},${purok.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" className="w-full">
                            <Navigation className="h-4 w-4 mr-2" />
                            Get Directions
                        </Button>
                    </a>
                ) : (
                    <a 
                        href={purok.google_maps_url} 
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" className="w-full">
                            <Navigation className="h-4 w-4 mr-2" />
                            Open & Get Directions
                        </Button>
                    </a>
                )}
            </div>

            {/* Coordinates Display Only */}
            {(purok.latitude || purok.longitude) && (
                <div className="border-t pt-3 mt-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Latitude</Label>
                            <div className="text-sm font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">
                                {purok.latitude?.toFixed(6) || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Longitude</Label>
                            <div className="text-sm font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">
                                {purok.longitude?.toFixed(6) || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800 text-center">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No Google Maps location set</p>
            <Link href={`/admin/puroks/${purok.id}/edit`}>
                <Button size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Add Map Location
                </Button>
            </Link>
        </div>
    )}
</div>
                            </CardContent>
                        </Card>

                        {/* Purok Leader */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Purok Leader
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {purok.leader_name ? (
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <span className="font-bold text-blue-600 dark:text-blue-300">
                                                {purok.leader_name.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{purok.leader_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="h-3 w-3 text-gray-500" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {purok.leader_contact || 'No contact provided'}
                                                </span>
                                            </div>
                                        </div>
                                        {purok.leader_contact && (
                                            <a href={`tel:${purok.leader_contact}`}>
                                                <Button variant="outline" size="sm">
                                                    Call
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No leader assigned</p>
                                        <Link href={`/admin/puroks/${purok.id}/edit`}>
                                            <Button variant="outline" size="sm" className="mt-2">
                                                Assign Leader
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Households Table */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Home className="h-5 w-5" />
                                        Households in this Purok
                                    </CardTitle>
                                    <CardDescription>
                                        {households.total} household{households.total !== 1 ? 's' : ''} registered
                                    </CardDescription>
                                </div>
                                <Link href={`/households?purok=${encodeURIComponent(purok.name)}`}>
                                    <Button variant="outline" size="sm">
                                        View All
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Household No.</TableHead>
                                            <TableHead>Head of Family</TableHead>
                                            <TableHead>Members</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {households.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                    No households in this purok yet.
                                                    <div className="mt-2">
                                                        <Link href="/households/create">
                                                            <Button size="sm">
                                                                <PlusCircle className="h-3 w-3 mr-1" />
                                                                Register Household
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            households.data.map((household) => (
                                                <TableRow key={household.id}>
                                                    <TableCell className="font-medium">
                                                        <Link href={`/households/${household.id}`} className="hover:text-primary hover:underline">
                                                            {household.household_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{household.head_of_family}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-3 w-3 text-gray-500" />
                                                            {household.member_count}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{household.contact_number || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Link href={`/households/${household.id}`}>
                                                            <Button size="sm" variant="ghost">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                                
                                {/* Pagination for households */}
                                {households.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        <div className="text-sm text-gray-500">
                                            Showing {households.data.length} of {households.total} households
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(households.current_page > 1 ? `/admin/puroks/${purok.id}?household_page=${households.current_page - 1}` : '#')}
                                                disabled={households.current_page === 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(households.current_page < households.last_page ? `/admin/puroks/${purok.id}?household_page=${households.current_page + 1}` : '#')}
                                                disabled={households.current_page === households.last_page}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Demographics & Quick Actions */}
                    <div className="space-y-6">
                        {/* Purok Statistics Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Purok Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Avg. Household Size</span>
                                        <span className="font-bold">
                                            {purok.total_households > 0 
                                                ? (purok.total_residents / purok.total_households).toFixed(1)
                                                : '0.0'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Population Density</span>
                                        <span className="font-bold">
                                            {purok.total_residents} residents
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Status</span>
                                        <Badge variant={getStatusBadgeVariant(purok.status)}>
                                            {purok.status.charAt(0).toUpperCase() + purok.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Map Link</span>
                                        <Badge variant={purok.google_maps_url ? "outline" : "secondary"}>
                                            {purok.google_maps_url ? 'Available' : 'Not Set'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Demographics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Demographics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Gender Distribution</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Male</span>
                                                <span className="font-medium">{demographics.gender.male}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Female</span>
                                                <span className="font-medium">{demographics.gender.female}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Other</span>
                                                <span className="font-medium">{demographics.gender.other}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Age Groups</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Children (&lt;18)</span>
                                                <span className="font-medium">{demographics.age_groups.children}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Adults (18-59)</span>
                                                <span className="font-medium">{demographics.age_groups.adults}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Seniors (60+)</span>
                                                <span className="font-medium">{demographics.age_groups.seniors}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Recent Activities
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Recent Households</h4>
                                        {recentHouseholds.length === 0 ? (
                                            <p className="text-sm text-gray-500">No recent households</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {recentHouseholds.map((household) => (
                                                    <div key={household.id} className="flex items-center justify-between text-sm">
                                                        <div className="truncate">
                                                            <Link href={`/households/${household.id}`} className="hover:text-primary hover:underline">
                                                                {household.household_number}
                                                            </Link>
                                                            <div className="text-xs text-gray-500 truncate">{household.head_of_family}</div>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(household.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Recent Residents</h4>
                                        {recentResidents.length === 0 ? (
                                            <p className="text-sm text-gray-500">No recent residents</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {recentResidents.map((resident) => (
                                                    <div key={resident.id} className="flex items-center justify-between text-sm">
                                                        <div className="truncate">
                                                            <Link href={`/residents/${resident.id}`} className="hover:text-primary hover:underline">
                                                                {getFullName(resident)}
                                                            </Link>
                                                            <div className="text-xs text-gray-500">{resident.age}y • {resident.gender}</div>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(resident.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Link href={`/residents/create?purok=${encodeURIComponent(purok.name)}`}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Add Resident to this Purok
                                        </Button>
                                    </Link>
                                    <Link href={`/households/create?purok=${encodeURIComponent(purok.name)}`}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <PlusCircle className="h-4 w-4 mr-2" />
                                            Register Household in this Purok
                                        </Button>
                                    </Link>
                                    {purok.google_maps_url && (
                                        <a 
                                            href={purok.google_maps_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-full"
                                        >
                                            <Button variant="outline" className="w-full justify-start">
                                                <Share2 className="h-4 w-4 mr-2" />
                                                Share Map Location
                                            </Button>
                                        </a>
                                    )}
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={handleDelete}
                                    >
                                        Delete Purok
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>System Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Created:</span>
                                        <span>{formatDate(purok.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Last Updated:</span>
                                        <span>{formatDate(purok.updated_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">ID:</span>
                                        <code className="text-xs">{purok.id}</code>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Coordinates:</span>
                                        <span className="text-xs font-mono">{formatCoordinates()}</span>
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

// Helper Label component
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`text-sm font-medium text-gray-500 ${className}`}>
            {children}
        </div>
    );
}