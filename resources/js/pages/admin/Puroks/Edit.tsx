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
    Calendar,
    Users,
    Home,
    AlertCircle,
    ExternalLink
} from 'lucide-react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PurokFormData {
    name: string;
    description: string;
    leader_name: string;
    leader_contact: string;
    status: string;
    google_maps_url?: string;
}

interface EditPurokProps extends PageProps {
    purok: {
        id: number;
        name: string;
        description?: string;
        leader_name?: string;
        leader_contact?: string;
        status: string;
        google_maps_url?: string;
        created_at: string;
        updated_at: string;
        households_count?: number;
        residents_count?: number;
    };
}

export default function EditPurok({ purok }: EditPurokProps) {
    const { data, setData, put, processing, errors, delete: deletePurok } = useForm<PurokFormData>({
        name: purok.name,
        description: purok.description || '',
        leader_name: purok.leader_name || '',
        leader_contact: purok.leader_contact || '',
        status: purok.status,
        google_maps_url: purok.google_maps_url || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/puroks/${purok.id}`);
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete purok "${purok.name}"? This action cannot be undone.`)) {
            deletePurok(`/puroks/${purok.id}`, {
                onSuccess: () => {
                    window.location.href = '/puroks';
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
                { title: 'Puroks', href: '/puroks' },
                { title: purok.name, href: `/puroks/${purok.id}` },
                { title: 'Edit Purok', href: `/puroks/${purok.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/puroks/${purok.id}`}>
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight">Edit Purok</h1>
                                    <Badge variant={purok.status === 'active' ? 'default' : 'secondary'}>
                                        {purok.status}
                                    </Badge>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Purok ID: {purok.id} • Last updated: {formatDate(purok.updated_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="destructive" 
                                type="button"
                                onClick={handleDelete}
                            >
                                Delete Purok
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Update Purok'}
                            </Button>
                        </div>
                    </div>

                    {/* Warning for active purok */}
                    {purok.status === 'active' && (purok.households_count || 0) > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                This purok has {purok.households_count} households and {purok.residents_count || 0} residents.
                                Changing the status to inactive may affect these records.
                            </AlertDescription>
                        </Alert>
                    )}

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
                        {/* Left Column - Basic Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update the purok's basic details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Purok Name *</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g., Purok 1, Zone 2" 
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Unique name for this purok/zone
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            placeholder="Describe the purok location, landmarks, boundaries, etc."
                                            rows={4}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
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
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-600">{errors.status}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Inactive puroks won't appear in dropdowns for new records
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Purok Leader</CardTitle>
                                    <CardDescription>
                                        Update the leader information for this purok
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="leader_name">Leader Name</Label>
                                        <Input 
                                            id="leader_name" 
                                            placeholder="Full name of purok leader"
                                            value={data.leader_name}
                                            onChange={(e) => setData('leader_name', e.target.value)}
                                        />
                                        {errors.leader_name && (
                                            <p className="text-sm text-red-600">{errors.leader_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="leader_contact">Contact Number</Label>
                                        <Input 
                                            id="leader_contact" 
                                            placeholder="09123456789"
                                            value={data.leader_contact}
                                            onChange={(e) => setData('leader_contact', e.target.value)}
                                        />
                                        {errors.leader_contact && (
                                            <p className="text-sm text-red-600">{errors.leader_contact}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Google Maps Location</CardTitle>
                                    <CardDescription>
                                        Update the Google Maps link for this purok
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="google_maps_url">Google Maps Link</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="google_maps_url" 
                                                placeholder="https://www.google.com/maps?q=14.5995,120.9842"
                                                value={data.google_maps_url}
                                                onChange={(e) => setData('google_maps_url', e.target.value)}
                                            />
                                            {data.google_maps_url && (
                                                <a 
                                                    href={data.google_maps_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button type="button" variant="outline" size="icon">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                        {errors.google_maps_url && (
                                            <p className="text-sm text-red-600">{errors.google_maps_url}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Go to Google Maps, pin the purok location, click "Share" and copy the link here
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Stats & Actions */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Purok Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Purok ID:</span>
                                            <span className="font-mono font-bold">#{purok.id}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Status:</span>
                                            <Badge variant={purok.status === 'active' ? 'default' : 'secondary'}>
                                                {purok.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Created:</span>
                                            <span className="text-sm">{formatDate(purok.created_at)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Last Updated:</span>
                                            <span className="text-sm">{formatDate(purok.updated_at)}</span>
                                        </div>
                                        
                                        <div className="border-t pt-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Home className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-500">Households:</span>
                                                    </div>
                                                    <Link 
                                                        href={`/households?purok=${encodeURIComponent(purok.name)}`}
                                                        className="font-bold text-blue-600 hover:underline"
                                                    >
                                                        {purok.households_count || 0}
                                                    </Link>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-500">Residents:</span>
                                                    </div>
                                                    <span className="font-bold">{purok.residents_count || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Map Location</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-500">Current Google Maps link:</div>
                                        {purok.google_maps_url ? (
                                            <div className="space-y-2">
                                                <div className="text-xs break-all bg-gray-50 p-3 rounded border">
                                                    {purok.google_maps_url}
                                                </div>
                                                <a 
                                                    href={purok.google_maps_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    Open in Google Maps
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 italic">
                                                No Google Maps link set
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Update in the textbox on the left
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Link href={`/households/create?purok=${encodeURIComponent(purok.name)}`}>
                                        <Button variant="outline" className="w-full justify-start" type="button">
                                            Add Household
                                        </Button>
                                    </Link>
                                    <Link href={`/residents/create?purok=${encodeURIComponent(purok.name)}`}>
                                        <Button variant="outline" className="w-full justify-start" type="button">
                                            Add Resident
                                        </Button>
                                    </Link>
                                    <Button variant="outline" className="w-full justify-start" type="button">
                                        Export Purok Data
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" type="button">
                                        View Activity Log
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className={`flex items-center justify-between ${data.name !== purok.name ? 'text-blue-600' : ''}`}>
                                            <span>Name changed:</span>
                                            <span>{data.name !== purok.name ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className={`flex items-center justify-between ${data.status !== purok.status ? 'text-blue-600' : ''}`}>
                                            <span>Status changed:</span>
                                            <span>{data.status !== purok.status ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className={`flex items-center justify-between ${data.leader_name !== (purok.leader_name || '') ? 'text-blue-600' : ''}`}>
                                            <span>Leader changed:</span>
                                            <span>{data.leader_name !== (purok.leader_name || '') ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className={`flex items-center justify-between ${data.google_maps_url !== (purok.google_maps_url || '') ? 'text-blue-600' : ''}`}>
                                            <span>Google Maps changed:</span>
                                            <span>{data.google_maps_url !== (purok.google_maps_url || '') ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex items-center justify-between font-medium">
                                                <span>Total changes:</span>
                                                <span>
                                                    {[
                                                        data.name !== purok.name,
                                                        data.description !== (purok.description || ''),
                                                        data.leader_name !== (purok.leader_name || ''),
                                                        data.leader_contact !== (purok.leader_contact || ''),
                                                        data.status !== purok.status,
                                                        data.google_maps_url !== (purok.google_maps_url || '')
                                                    ].filter(Boolean).length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <div className="flex items-center gap-2">
                            <Link href={`/puroks/${purok.id}`}>
                                <Button variant="ghost" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                type="button"
                                onClick={() => {
                                    // Reset form to original values
                                    setData({
                                        name: purok.name,
                                        description: purok.description || '',
                                        leader_name: purok.leader_name || '',
                                        leader_contact: purok.leader_contact || '',
                                        status: purok.status,
                                        google_maps_url: purok.google_maps_url || '',
                                    });
                                }}
                            >
                                Reset Changes
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                type="button"
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                Delete Purok
                            </Button>
                            <Button type="submit" disabled={processing}>
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