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
    ExternalLink
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';

export default function CreatePurok() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        leader_name: '',
        leader_contact: '',
        status: 'active',
        google_maps_url: '', // Changed from boundaries to google_maps_url
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/puroks');
    };

    return (
        <AppLayout
            title="Add Purok"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Puroks', href: '/puroks' },
                { title: 'Add Purok', href: '/puroks/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/puroks">
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Add New Purok</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Register a new purok/zone in the barangay
                                </p>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Purok'}
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

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column - Basic Information */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Enter the purok's basic details
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            placeholder="Describe the purok location, landmarks, etc."
                                            rows={3}
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
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Leader Information */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Purok Leader</CardTitle>
                                    <CardDescription>
                                        Assign a leader for this purok (optional)
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
                                        <p className="text-xs text-gray-500">
                                            Go to Google Maps, pin the purok location, click "Share" and copy the link here
                                        </p>
                                        {errors.google_maps_url && (
                                            <p className="text-sm text-red-600">{errors.google_maps_url}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Purok Name:</span>
                                            <span className="font-medium">{data.name || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Leader:</span>
                                            <span className="font-medium">{data.leader_name || 'Not assigned'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status:</span>
                                            <span className={`font-medium ${data.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>
                                                {data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Google Maps:</span>
                                            <span className="font-medium">
                                                {data.google_maps_url ? (
                                                    <a 
                                                        href={data.google_maps_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        View Map
                                                    </a>
                                                ) : 'Not set'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}