import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    ArrowLeft,
    Save,
    MapPin,
    Users,
    Home,
    AlertCircle,
    ExternalLink,
    Globe,
    User,
    Phone,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditPurokProps {
    purok: {
        id: number;
        name: string;
        description?: string;
        leader_name?: string;
        leader_contact?: string;
        status: string;
        google_maps_url?: string;
        latitude?: number | null;
        longitude?: number | null;
        created_at: string;
        updated_at: string;
        households_count?: number;
        residents_count?: number;
    };
}

export default function EditPurok({ purok }: EditPurokProps) {
    const { data, setData, put, processing, errors, delete: deletePurok } = useForm({
        name: purok.name,
        description: purok.description || '',
        leader_name: purok.leader_name || '',
        leader_contact: purok.leader_contact || '',
        status: purok.status,
        google_maps_url: purok.google_maps_url || '',
        latitude: purok.latitude?.toString() || '',
        longitude: purok.longitude?.toString() || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/puroks/${purok.id}`);
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete purok "${purok.name}"? This action cannot be undone.`)) {
            deletePurok(`/admin/puroks/${purok.id}`, {
                onSuccess: () => {
                    window.location.href = '/admin/puroks';
                }
            });
        }
    };

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

    return (
        <AppLayout
            title={`Edit Purok: ${purok.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Puroks', href: '/admin/puroks' },
                { title: purok.name, href: `/admin/puroks/${purok.id}` },
                { title: 'Edit', href: `/admin/puroks/${purok.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/admin/puroks/${purok.id}`}>
                                <Button variant="ghost" size="sm" type="button" className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight dark:text-white">Edit Purok</h1>
                                    <Badge variant={purok.status === 'active' ? 'default' : 'secondary'} 
                                        className={purok.status === 'active' 
                                            ? 'dark:bg-green-900 dark:text-green-200' 
                                            : 'dark:bg-gray-700 dark:text-gray-300'}>
                                        {purok.status}
                                    </Badge>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    ID: #{purok.id} • Last updated: {formatDate(purok.updated_at)}
                                </p>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing} className="dark:bg-blue-600 dark:hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Update Purok'}
                        </Button>
                    </div>

                    {/* Warning for active purok with data */}
                    {purok.status === 'active' && (purok.households_count || 0) > 0 && (
                        <Alert className="dark:bg-yellow-950 dark:border-yellow-800">
                            <AlertCircle className="h-4 w-4 dark:text-yellow-400" />
                            <AlertDescription className="dark:text-yellow-400">
                                This purok has {purok.households_count} households and {purok.residents_count || 0} residents.
                                Changing the status to inactive may affect these records.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-950 dark:border-red-800 dark:text-red-400">
                            <p className="font-bold">Please fix the following errors:</p>
                            <ul className="list-disc list-inside mt-2">
                                {Object.entries(errors).map(([field, error]) => (
                                    <li key={field}><strong>{field.replace('_', ' ')}:</strong> {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Basic Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <MapPin className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Update the purok's basic details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="dark:text-gray-300">Purok Name *</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g., Purok 1, Zone 2" 
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            placeholder="Describe the purok location, landmarks, boundaries, etc."
                                            rows={4}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="dark:text-gray-300">Status *</Label>
                                        <Select 
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                <SelectItem value="active" className="dark:text-white">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                        Active
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="inactive" className="dark:text-white">
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                        Inactive
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <User className="h-5 w-5" />
                                        Purok Leader
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Update the leader information for this purok (optional)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="leader_name" className="dark:text-gray-300">Leader Name</Label>
                                        <Input 
                                            id="leader_name" 
                                            placeholder="Full name of purok leader"
                                            value={data.leader_name}
                                            onChange={(e) => setData('leader_name', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                        {errors.leader_name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.leader_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="leader_contact" className="dark:text-gray-300">Contact Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input 
                                                id="leader_contact" 
                                                placeholder="09123456789"
                                                value={data.leader_contact}
                                                onChange={(e) => setData('leader_contact', e.target.value)}
                                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        {errors.leader_contact && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.leader_contact}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Globe className="h-5 w-5" />
                                        Google Maps Location
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Paste any Google Maps link - coordinates will be extracted automatically
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="google_maps_url" className="dark:text-gray-300">Google Maps Link</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="google_maps_url" 
                                                placeholder="https://maps.app.goo.gl/..."
                                                value={data.google_maps_url}
                                                onChange={(e) => setData('google_maps_url', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                            {data.google_maps_url && (
                                                <a href={data.google_maps_url} target="_blank" rel="noopener noreferrer">
                                                    <Button type="button" variant="outline" size="icon" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                        {errors.google_maps_url && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.google_maps_url}</p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Paste any Google Maps link (short or long). When you save, coordinates will be automatically extracted.
                                        </p>
                                    </div>

                                    {/* Hidden fields for coordinates */}
                                    <input type="hidden" name="latitude" value={data.latitude} />
                                    <input type="hidden" name="longitude" value={data.longitude} />

                                    {/* Show current coordinates if available */}
                                    {(purok.latitude || purok.longitude) && (
                                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Current Coordinates:</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Latitude:</span>
                                                    <code className="ml-2 text-gray-700 dark:text-gray-300 font-mono">
                                                        {purok.latitude?.toFixed(6) || 'N/A'}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Longitude:</span>
                                                    <code className="ml-2 text-gray-700 dark:text-gray-300 font-mono">
                                                        {purok.longitude?.toFixed(6) || 'N/A'}
                                                    </code>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                These coordinates were automatically extracted from your Google Maps link.
                                                If you change the link, new coordinates will be extracted on save.
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                                        <p>💡 <strong>How it works:</strong></p>
                                        <p>1. Paste any Google Maps share link (short or long)</p>
                                        <p>2. Click Save</p>
                                        <p>3. The system automatically extracts the coordinates</p>
                                        <p>4. The map will show the exact pinned location</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Stats & Actions */}
                        <div className="space-y-6">
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Purok Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Purok ID:</span>
                                            <span className="font-mono font-bold dark:text-white">#{purok.id}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                            <Badge variant={purok.status === 'active' ? 'default' : 'secondary'}
                                                className={purok.status === 'active' 
                                                    ? 'dark:bg-green-900 dark:text-green-200' 
                                                    : 'dark:bg-gray-700 dark:text-gray-300'}>
                                                {purok.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                            <span className="text-sm dark:text-gray-300">{formatDate(purok.created_at)}</span>
                                        </div>
                                        
                                        <div className="border-t dark:border-gray-700 pt-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Home className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        <span className="text-gray-500 dark:text-gray-400">Households:</span>
                                                    </div>
                                                    <span className="font-bold dark:text-white">{purok.households_count || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        <span className="text-gray-500 dark:text-gray-400">Residents:</span>
                                                    </div>
                                                    <span className="font-bold dark:text-white">{purok.residents_count || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Link href={`/households/create?purok=${encodeURIComponent(purok.name)}`}>
                                        <Button variant="outline" className="w-full justify-start dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" type="button">
                                            <Home className="h-4 w-4 mr-2" />
                                            Add Household
                                        </Button>
                                    </Link>
                                    <Link href={`/residents/create?purok=${encodeURIComponent(purok.name)}`}>
                                        <Button variant="outline" className="w-full justify-start dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" type="button">
                                            <Users className="h-4 w-4 mr-2" />
                                            Add Resident
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="destructive" 
                                        type="button"
                                        onClick={handleDelete}
                                        className="w-full justify-start dark:bg-red-900 dark:hover:bg-red-800"
                                    >
                                        Delete Purok
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                        <Link href={`/admin/puroks/${purok.id}`}>
                            <Button variant="ghost" type="button" className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                                Cancel
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                type="button"
                                onClick={() => {
                                    setData({
                                        name: purok.name,
                                        description: purok.description || '',
                                        leader_name: purok.leader_name || '',
                                        leader_contact: purok.leader_contact || '',
                                        status: purok.status,
                                        google_maps_url: purok.google_maps_url || '',
                                        latitude: purok.latitude?.toString() || '',
                                        longitude: purok.longitude?.toString() || '',
                                    });
                                }}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                                Reset Changes
                            </Button>
                            <Button type="submit" disabled={processing} className="dark:bg-blue-600 dark:hover:bg-blue-700">
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Updating...' : 'Update Purok'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}