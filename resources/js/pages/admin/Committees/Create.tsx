// pages/admin/committees/create.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft,
    Save,
    Users,
    Target,
    CheckCircle,
    Lock,
    Hash,
    AlertCircle,
    BookOpen
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
        post('/admin/committees'); // Make sure this is the correct route
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
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Committees', href: '/admin/committees' },
                { title: 'Create Committee', href: '/admin/committees/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/committees">
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Target className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                        Create New Committee
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Add a new committee for barangay officials
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white dark:from-purple-700 dark:to-pink-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Committee'}
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
                        {/* Left Column - Committee Details */}
                        <div className="space-y-6">
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                            <Target className="h-3 w-3 text-white" />
                                        </div>
                                        Committee Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Enter committee details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="dark:text-gray-300">
                                                Committee Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input 
                                                id="name" 
                                                placeholder="e.g., Peace and Order" 
                                                value={data.name}
                                                onChange={(e) => handleNameChange(e.target.value)}
                                                required
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="code" className="dark:text-gray-300">
                                                    Code <span className="text-red-500">*</span>
                                                </Label>
                                                {isCodeManuallyEdited && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={resetCodeToAutoGenerate}
                                                        className="h-6 text-xs dark:text-gray-400 dark:hover:text-white"
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
                                                    className={`${!isCodeManuallyEdited ? "bg-gray-50 dark:bg-gray-700 pr-10" : "dark:bg-gray-900"} dark:border-gray-700 dark:text-gray-300`}
                                                />
                                                {!isCodeManuallyEdited && (
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                {isCodeManuallyEdited ? (
                                                    <>
                                                        <Lock className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                                        <span className="text-gray-500 dark:text-gray-400">Code is manually edited</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
                                                        <span className="text-gray-500 dark:text-gray-400">Auto-generated from name</span>
                                                    </>
                                                )}
                                            </div>
                                            {errors.code && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="order" className="dark:text-gray-300">Display Order</Label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input 
                                                    id="order" 
                                                    type="number" 
                                                    min="0"
                                                    value={data.order}
                                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Determines sorting order in lists
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            placeholder="Describe the committee's responsibilities and purpose..."
                                            rows={4}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <Checkbox 
                                            id="is_active" 
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                            className="dark:border-gray-600"
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer dark:text-gray-300">
                                            Committee is active
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Preview & Tips */}
                        <div className="space-y-6">
                            {/* Preview Card */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                            <Target className="h-3 w-3 text-white" />
                                        </div>
                                        Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.name ? (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                                                    <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium dark:text-gray-100">{data.name}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Committee
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t dark:border-gray-700 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Code:</span>
                                                    <div className="flex items-center gap-1">
                                                        <code className="font-mono font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs dark:text-gray-300">
                                                            {data.code || 'Not set'}
                                                        </code>
                                                        {!isCodeManuallyEdited && (
                                                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                                                Auto
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Order:</span>
                                                    <span className="font-medium dark:text-gray-300">{data.order}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                    <span className={`font-medium ${data.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {data.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>

                                            {data.description && (
                                                <div className="pt-4 border-t dark:border-gray-700">
                                                    <h5 className="font-medium mb-2 dark:text-gray-300">Description:</h5>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{data.description}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>Enter committee details to see preview</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Tips */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                                            <BookOpen className="h-3 w-3 text-white" />
                                        </div>
                                        Quick Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-medium dark:text-gray-200">Committee Name:</span>
                                                <p className="text-gray-600 dark:text-gray-400">Should be clear and descriptive (e.g., "Peace and Order")</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-medium dark:text-gray-200">Code Generation:</span>
                                                <p className="text-gray-600 dark:text-gray-400">Auto-generated from name (lowercase with underscores)</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-medium dark:text-gray-200">Display Order:</span>
                                                <p className="text-gray-600 dark:text-gray-400">Lower numbers appear first in dropdowns and lists</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-medium dark:text-gray-200">Active Status:</span>
                                                <p className="text-gray-600 dark:text-gray-400">Inactive committees won't appear in selection lists</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-medium dark:text-gray-200">Manual Override:</span>
                                                <p className="text-gray-600 dark:text-gray-400">Click on the code field to edit manually if needed</p>
                                            </div>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                        <Link href="/admin/committees">
                            <Button variant="outline" type="button" className="dark:border-gray-600 dark:text-gray-300">
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
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                Reset Form
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white dark:from-purple-700 dark:to-pink-700"
                            >
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