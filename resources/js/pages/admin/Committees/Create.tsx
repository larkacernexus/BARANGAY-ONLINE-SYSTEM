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
    Users,
    Target,
    CheckCircle,
    Lock,
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';

interface CreateCommitteeProps extends PageProps {
    nextOrder: number;
}

export default function CreateCommittee({ nextOrder }: CreateCommitteeProps) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        description: '',
        order: nextOrder,
        is_active: true,
    });

    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/committees'); // Make sure this is the correct route
    };

    // Function to generate code from name
    const generateCode = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]+/g, '') // Remove special characters
            .trim()
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/_+/g, '_') // Remove duplicate underscores
            .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
    };

    // Auto-generate code when name changes
    useEffect(() => {
        if (data.name && !isCodeManuallyEdited) {
            const generatedCode = generateCode(data.name);
            setData('code', generatedCode);
        }
    }, [data.name, isCodeManuallyEdited]);

    const handleNameChange = (value: string) => {
        setData('name', value);
        if (!isCodeManuallyEdited) {
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

    return (
        <AppLayout
            title="Create Committee"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Committees', href: '/committees' },
                { title: 'Create Committee', href: '/committees/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/committees">
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Create New Committee</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Add a new committee for barangay officials
                                </p>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Committee'}
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
                        {/* Left Column - Committee Details */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Committee Information
                                </CardTitle>
                                <CardDescription>
                                    Enter committee details
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
                                        />
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
                                                className={!isCodeManuallyEdited ? "bg-gray-50 pr-10" : ""}
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
                                        />
                                        <p className="text-xs text-gray-500">
                                            Determines sorting order in lists
                                        </p>
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
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Committee is active
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column - Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.name ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Target className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{data.name}</h4>
                                                <p className="text-sm text-gray-500">
                                                    Committee
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Code:</span>
                                                <div className="flex items-center gap-1">
                                                    <code className="font-mono font-medium bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                        {data.code || 'Not set'}
                                                    </code>
                                                    {!isCodeManuallyEdited && (
                                                        <span className="text-xs text-green-600">(auto)</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Order:</span>
                                                <span className="font-medium">{data.order}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Status:</span>
                                                <span className={`font-medium ${data.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {data.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>

                                        {data.description && (
                                            <div className="pt-4 border-t">
                                                <h5 className="font-medium mb-2">Description:</h5>
                                                <p className="text-sm text-gray-600">{data.description}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <Target className="h-12 w-12 mx-auto mb-2" />
                                        <p>Enter committee details to see preview</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Tips</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <span className="font-medium">Committee Name:</span>
                                            <p className="text-gray-600">Should be clear and descriptive (e.g., "Peace and Order")</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <span className="font-medium">Code Generation:</span>
                                            <p className="text-gray-600">Auto-generated from name (lowercase with underscores)</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <span className="font-medium">Display Order:</span>
                                            <p className="text-gray-600">Lower numbers appear first in dropdowns and lists</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <span className="font-medium">Active Status:</span>
                                            <p className="text-gray-600">Inactive committees won't appear in selection lists</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <span className="font-medium">Manual Override:</span>
                                            <p className="text-gray-600">Click on the code field to edit manually if needed</p>
                                        </div>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <Link href="/committees">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                type="button"
                                onClick={() => {
                                    setData({
                                        code: '',
                                        name: '',
                                        description: '',
                                        order: nextOrder,
                                        is_active: true,
                                    });
                                    setIsCodeManuallyEdited(false);
                                }}
                            >
                                Reset Form
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Committee'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}