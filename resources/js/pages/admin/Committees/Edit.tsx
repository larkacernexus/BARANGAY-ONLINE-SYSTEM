// resources/js/Pages/admin/Committees/Edit.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft,
    Save,
    Target,
    CheckCircle,
    Lock,
    Trash2,
    Users,
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';

interface Committee {
    id: number;
    code: string;
    name: string;
    description: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    positions_count?: number;
}

interface EditCommitteeProps extends PageProps {
    committee: Committee;
}

export default function EditCommittee({ committee }: EditCommitteeProps) {
    const { data, setData, put, processing, errors, delete: destroy } = useForm({
        code: committee.code || '',
        name: committee.name || '',
        description: committee.description || '',
        order: committee.order || 0,
        is_active: committee.is_active ?? true,
    });

    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/committees/${committee.id}`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this committee? This action cannot be undone.')) {
            destroy(`/admin/committees/${committee.id}`);
        }
    };

    // Function to generate code from name
    const generateCode = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]+/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
    };

    // Auto-generate code when name changes
    useEffect(() => {
        if (data.name && !isCodeManuallyEdited && data.name !== committee.name) {
            const generatedCode = generateCode(data.name);
            setData('code', generatedCode);
        }
    }, [data.name, isCodeManuallyEdited]);

    const handleNameChange = (value: string) => {
        setData('name', value);
        if (!isCodeManuallyEdited && value !== committee.name) {
            const generatedCode = generateCode(value);
            setData('code', generatedCode);
        }
    };

    const handleCodeChange = (value: string) => {
        setData('code', value);
        setIsCodeManuallyEdited(true);
    };

    const resetCodeToAutoGenerate = () => {
        if (data.name) {
            const generatedCode = generateCode(data.name);
            setData('code', generatedCode);
            setIsCodeManuallyEdited(false);
        }
    };

    const isCodeChanged = data.code !== committee.code;
    const isNameChanged = data.name !== committee.name;

    return (
        <AppLayout
            title={`Edit ${committee.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Committees', href: '/admin/committees' },
                { title: committee.name, href: `/admin/committees/${committee.id}` },
                { title: 'Edit', href: `/admin/committees/${committee.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/committees">
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Edit Committee</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Update committee information
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={processing || (committee.positions_count && committee.positions_count > 0)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    {/* Warning for committees with positions */}
                    {committee.positions_count && committee.positions_count > 0 && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <div>
                                    <p className="font-medium">This committee has {committee.positions_count} position(s) assigned</p>
                                    <p className="text-sm mt-1">
                                        Deleting this committee will remove it from all assigned positions. Consider deactivating instead.
                                    </p>
                                </div>
                            </div>
                        </div>
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

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column - Committee Details */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Committee Information
                                </CardTitle>
                                <CardDescription>
                                    Update committee details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Committee Name *</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g., Peace and Order" 
                                            value={data.name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            required
                                            className={isNameChanged ? 'border-blue-300 bg-blue-50' : ''}
                                        />
                                        {isNameChanged && (
                                            <p className="text-xs text-blue-600 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Changed from "{committee.name}"
                                            </p>
                                        )}
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="code">Code *</Label>
                                            {isCodeManuallyEdited && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={resetCodeToAutoGenerate}
                                                    className="h-6 text-xs"
                                                >
                                                    Auto-generate
                                                </Button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input 
                                                id="code" 
                                                placeholder="peace_and_order" 
                                                value={data.code}
                                                onChange={(e) => handleCodeChange(e.target.value)}
                                                required
                                                readOnly={!isCodeManuallyEdited}
                                                className={`${!isCodeManuallyEdited ? "bg-gray-50 pr-10" : ""} ${isCodeChanged ? 'border-blue-300 bg-blue-50' : ''}`}
                                            />
                                            {!isCodeManuallyEdited && (
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <Lock className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            {isCodeManuallyEdited ? (
                                                <>
                                                    <Lock className="h-3 w-3" />
                                                    <span>Code is manually edited</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    <span>Auto-generated from name</span>
                                                </>
                                            )}
                                            {isCodeChanged && (
                                                <span className="ml-2 text-blue-600">
                                                    (Was: {committee.code})
                                                </span>
                                            )}
                                        </div>
                                        {errors.code && (
                                            <p className="text-sm text-red-600">{errors.code}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="order">Display Order</Label>
                                        <Input 
                                            id="order" 
                                            type="number" 
                                            min="0"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                            className={data.order !== committee.order ? 'border-blue-300 bg-blue-50' : ''}
                                        />
                                        <p className="text-xs text-gray-500">
                                            Determines sorting order in lists
                                        </p>
                                        {data.order !== committee.order && (
                                            <p className="text-xs text-blue-600">
                                                Changed from {committee.order}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Describe the committee's responsibilities and purpose..."
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className={data.description !== committee.description ? 'border-blue-300 bg-blue-50' : ''}
                                    />
                                    {data.description !== committee.description && (
                                        <p className="text-xs text-blue-600">
                                            Description has been modified
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        className={data.is_active !== committee.is_active ? 'border-blue-300' : ''}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Committee is active
                                    </Label>
                                    {data.is_active !== committee.is_active && (
                                        <span className="text-xs text-blue-600 ml-2">
                                            {committee.is_active ? 'Was active' : 'Was inactive'}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column - Preview & Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Target className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{committee.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            Committee
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Code:</span>
                                        <code className="font-mono font-medium bg-gray-100 px-2 py-0.5 rounded text-xs">
                                            {committee.code}
                                        </code>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Order:</span>
                                        <span className="font-medium">{committee.order}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Status:</span>
                                        <span className={`font-medium ${committee.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                            {committee.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Positions:</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {committee.positions_count || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Created:</span>
                                        <span className="font-medium">
                                            {new Date(committee.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Last Updated:</span>
                                        <span className="font-medium">
                                            {new Date(committee.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {committee.description && (
                                    <div className="pt-4 border-t">
                                        <h5 className="font-medium mb-2">Current Description:</h5>
                                        <p className="text-sm text-gray-600">{committee.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Link href={`/admin/committees/${committee.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Target className="h-4 w-4 mr-2" />
                                        View Committee Details
                                    </Button>
                                </Link>
                                
                                <Link href={`/admin/positions?committee=${committee.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Users className="h-4 w-4 mr-2" />
                                        View Assigned Positions
                                    </Button>
                                </Link>
                                
                                <div className="pt-4 border-t">
                                    <h4 className="font-medium mb-2">Status Actions</h4>
                                    <div className="space-y-2">
                                        <Button
                                            variant={data.is_active ? "default" : "outline"}
                                            className="w-full justify-start"
                                            onClick={() => setData('is_active', true)}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Set as Active
                                        </Button>
                                        <Button
                                            variant={!data.is_active ? "default" : "outline"}
                                            className="w-full justify-start"
                                            onClick={() => setData('is_active', false)}
                                        >
                                            <Lock className="h-4 w-4 mr-2" />
                                            Set as Inactive
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <div className="flex items-center gap-2">
                            <Link href={`/admin/committees/${committee.id}`}>
                                <Button variant="outline" type="button">
                                    View Details
                                </Button>
                            </Link>
                            <Link href="/admin/committees">
                                <Button variant="outline" type="button">
                                    Back to List
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                type="button"
                                onClick={() => {
                                    setData({
                                        code: committee.code,
                                        name: committee.name,
                                        description: committee.description,
                                        order: committee.order,
                                        is_active: committee.is_active,
                                    });
                                    setIsCodeManuallyEdited(false);
                                }}
                                disabled={processing}
                            >
                                Reset Changes
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className={Object.keys(errors).length === 0 ? '' : 'opacity-50'}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}