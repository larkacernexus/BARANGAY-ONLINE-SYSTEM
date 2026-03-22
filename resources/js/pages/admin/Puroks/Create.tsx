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
    ExternalLink,
    User,
    Phone,
    Globe,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';

export default function CreatePurok() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        leader_name: '',
        leader_contact: '',
        status: 'active',
        google_maps_url: '',
        latitude: '',
        longitude: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/puroks');
    };

    return (
        <AppLayout
            title="Add Purok"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Puroks', href: '/admin/puroks' },
                { title: 'Add Purok', href: '/admin/puroks/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/puroks">
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <MapPin className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                        Add New Purok
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Register a new purok/zone in the barangay
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white dark:from-emerald-700 dark:to-teal-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Purok'}
                        </Button>
                    </div>

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            {Object.entries(errors).map(([field, error]) => (
                                                <li key={field} className="text-sm text-red-600 dark:text-red-400">
                                                    <span className="font-medium capitalize">{field.replace('_', ' ')}:</span> {error}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column - Basic Information */}
                        <div className="space-y-6">
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 flex items-center justify-center">
                                            <MapPin className="h-3 w-3 text-white" />
                                        </div>
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Enter the purok's basic details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="dark:text-gray-300">
                                            Purok Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g., Purok 1, Zone 2" 
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            placeholder="Describe the purok location, landmarks, etc."
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                <SelectItem value="active" className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                        Active
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="inactive" className="dark:text-gray-300 dark:focus:bg-gray-700">
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
                        </div>

                        {/* Right Column - Leader & Location */}
                        <div className="space-y-6">
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                            <User className="h-3 w-3 text-white" />
                                        </div>
                                        Purok Leader
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Assign a leader for this purok (optional)
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
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                        </div>
                                        {errors.leader_contact && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.leader_contact}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700 flex items-center justify-center">
                                            <Globe className="h-3 w-3 text-white" />
                                        </div>
                                        Google Maps Location
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Paste a Google Maps link - coordinates will be extracted automatically
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="google_maps_url" className="dark:text-gray-300">Google Maps Link</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input 
                                                    id="google_maps_url" 
                                                    placeholder="https://maps.app.goo.gl/..."
                                                    value={data.google_maps_url}
                                                    onChange={(e) => setData('google_maps_url', e.target.value)}
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                />
                                            </div>
                                            {data.google_maps_url && (
                                                <a 
                                                    href={data.google_maps_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="icon"
                                                        className="dark:border-gray-600 dark:text-gray-300"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Paste any Google Maps link (short or long). Coordinates will be extracted automatically when you save.
                                        </p>
                                        {errors.google_maps_url && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.google_maps_url}</p>
                                        )}
                                    </div>

                                    {/* Hidden fields for coordinates - automatically populated by the model on save */}
                                    <input type="hidden" name="latitude" value={data.latitude} />
                                    <input type="hidden" name="longitude" value={data.longitude} />
                                    
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <p>💡 <strong>How it works:</strong></p>
                                        <p>1. Paste any Google Maps share link</p>
                                        <p>2. Click Save</p>
                                        <p>3. The system automatically extracts coordinates</p>
                                        <p>4. The map will show the exact pinned location</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Preview */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                            <Save className="h-3 w-3 text-white" />
                                        </div>
                                        Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Purok Name:</span>
                                            <span className="font-medium dark:text-gray-200">{data.name || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Leader:</span>
                                            <span className="font-medium dark:text-gray-200">{data.leader_name || 'Not assigned'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                            <span className={`font-medium ${
                                                data.status === 'active' 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-500 dark:text-gray-400">Google Maps:</span>
                                            <span className="font-medium">
                                                {data.google_maps_url ? (
                                                    <span className="text-green-600 dark:text-green-400">✓ Will be processed</span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500">Not set</span>
                                                )}
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