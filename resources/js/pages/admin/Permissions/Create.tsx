import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import { SystemModule, PermissionCreateProps } from '@/types/admin/permissions/permission.types';
import {
    ArrowLeft,
    Save,
    Key,
    Eye,
    AlertCircle,
    RefreshCw,
    Check,
    X,
    Copy,
    HelpCircle,
    FileText,
    LayoutDashboard,
    Users,
    Home,
    Calendar,
    File,
    Settings,
    Bell,
    BarChart3,
    Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { route } from 'ziggy-js';

export default function PermissionCreate({ 
    modules = [], 
    validation_errors 
}: PermissionCreateProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<string>('');
    const [suggestedPermissions, setSuggestedPermissions] = useState<Array<{
        name: string;
        display_name: string;
        description: string;
    }>>([]);

    const { data, setData, errors, processing, post, reset } = useForm({
        name: '',
        display_name: '',
        description: '',
        module: '',
        is_active: true,
    });

    // Generate suggested permissions based on selected module
    useEffect(() => {
        if (!selectedModule) {
            setSuggestedPermissions([]);
            return;
        }

        const module = modules.find(m => m.name === selectedModule);
        if (!module) {
            setSuggestedPermissions([]);
            return;
        }

        // Generate common permission patterns for the module
        const suggestions = [
            {
                name: `${selectedModule.toLowerCase()}.view`,
                display_name: `View ${module.display_name}`,
                description: `View ${module.display_name.toLowerCase()} records`,
            },
            {
                name: `${selectedModule.toLowerCase()}.create`,
                display_name: `Create ${module.display_name}`,
                description: `Create new ${module.display_name.toLowerCase()} records`,
            },
            {
                name: `${selectedModule.toLowerCase()}.edit`,
                display_name: `Edit ${module.display_name}`,
                description: `Edit existing ${module.display_name.toLowerCase()} records`,
            },
            {
                name: `${selectedModule.toLowerCase()}.delete`,
                display_name: `Delete ${module.display_name}`,
                description: `Delete ${module.display_name.toLowerCase()} records`,
            },
            {
                name: `${selectedModule.toLowerCase()}.manage`,
                display_name: `Manage ${module.display_name}`,
                description: `Full management of ${module.display_name.toLowerCase()}`,
            },
        ];

        // Add module-specific suggestions
        switch (selectedModule) {
            case 'Dashboard':
                suggestions.push(
                    {
                        name: 'dashboard.access',
                        display_name: 'Access Dashboard',
                        description: 'Access the main dashboard',
                    },
                    {
                        name: 'dashboard.view_stats',
                        display_name: 'View Statistics',
                        description: 'View statistical data on dashboard',
                    }
                );
                break;
            case 'Residents':
                suggestions.push(
                    {
                        name: 'residents.export',
                        display_name: 'Export Residents',
                        description: 'Export resident records to various formats',
                    },
                    {
                        name: 'residents.import',
                        display_name: 'Import Residents',
                        description: 'Import resident records from files',
                    }
                );
                break;
            case 'Fees':
                suggestions.push(
                    {
                        name: 'fees.collect',
                        display_name: 'Collect Fees',
                        description: 'Collect and record fee payments',
                    },
                    {
                        name: 'fees.reports',
                        display_name: 'Generate Fee Reports',
                        description: 'Generate fee collection reports',
                    }
                );
                break;
        }

        setSuggestedPermissions(suggestions);
    }, [selectedModule, modules]);

    // Auto-generate name when display name changes
    useEffect(() => {
        if (data.display_name && !data.name && selectedModule) {
            const baseName = data.display_name
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '.');
            
            const modulePrefix = selectedModule.toLowerCase();
            const suggestedName = `${modulePrefix}.${baseName}`;
            
            // Only auto-generate if user hasn't manually changed the name
            if (!data.name || data.name === suggestedName) {
                setData('name', suggestedName);
            }
        }
    }, [data.display_name, selectedModule, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        post(route('permissions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        });
    };

    const handleReset = () => {
        reset();
        setSelectedModule('');
        setSuggestedPermissions([]);
    };

    const handleModuleChange = (value: string) => {
        setSelectedModule(value);
        setData('module', value);
    };

    const handleUseSuggestion = (suggestion: typeof suggestedPermissions[0]) => {
        setData({
            ...data,
            name: suggestion.name,
            display_name: suggestion.display_name,
            description: suggestion.description,
            module: selectedModule,
        });
    };

    const getModuleIcon = (moduleName: string) => {
        const module = modules.find(m => m.name === moduleName);
        return module?.icon || getDefaultModuleIcon(moduleName);
    };

    const getDefaultModuleIcon = (moduleName: string) => {
        switch (moduleName) {
            case 'Dashboard': return <LayoutDashboard className="h-4 w-4" />;
            case 'Residents': return <Users className="h-4 w-4" />;
            case 'Households': return <Home className="h-4 w-4" />;
            case 'Fees': return <File className="h-4 w-4" />;
            case 'Calendar': return <Calendar className="h-4 w-4" />;
            case 'Settings': return <Settings className="h-4 w-4" />;
            case 'Notifications': return <Bell className="h-4 w-4" />;
            case 'Reports': return <BarChart3 className="h-4 w-4" />;
            case 'Database': return <Database className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getModuleDescription = (moduleName: string) => {
        const module = modules.find(m => m.name === moduleName);
        return module?.description || `Permissions for ${moduleName} module`;
    };

    return (
        <AdminLayout
            title="Create New Permission"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Permissions', href: route('permissions.index') },
                { title: 'Create', href: '#' }
            ]}
        >
            <Head title="Create New Permission" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.visit(route('permissions.index'))}
                                className="h-8 w-8 p-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create New Permission</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                    Define a new permission for access control
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={processing}
                            className="h-9"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Create Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Permission Details
                                </CardTitle>
                                <CardDescription>
                                    Define the basic information for the new permission
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-6">
                                    {/* Module Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="module">Module *</Label>
                                        {modules.length === 0 ? (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    No modules available. Please contact your administrator.
                                                </AlertDescription>
                                            </Alert>
                                        ) : (
                                            <Select
                                                value={selectedModule}
                                                onValueChange={handleModuleChange}
                                                disabled={processing}
                                            >
                                                <SelectTrigger className={errors.module ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a module" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {modules.map((module) => (
                                                        <SelectItem key={module.name} value={module.name}>
                                                            <div className="flex items-center gap-2">
                                                                {getModuleIcon(module.name)}
                                                                <div>
                                                                    <div className="font-medium">{module.display_name}</div>
                                                                    {module.description && (
                                                                        <div className="text-xs text-gray-500 truncate">
                                                                            {module.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {errors.module && (
                                            <p className="text-sm text-red-600">{errors.module}</p>
                                        )}
                                        {selectedModule && (
                                            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                                <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                                    <span className="font-medium">{getModuleDescription(selectedModule)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Display Name Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="display_name">
                                                Display Name *
                                                <span className="text-xs text-gray-500 font-normal ml-2">
                                                    (User-friendly name)
                                                </span>
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(data.display_name, 'display_name')}
                                                className="h-6 text-xs"
                                                disabled={!data.display_name}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                {copiedField === 'display_name' ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                        <Input
                                            id="display_name"
                                            value={data.display_name}
                                            onChange={(e) => setData('display_name', e.target.value)}
                                            placeholder="e.g., View Residents, Create Dashboard"
                                            className={errors.display_name ? 'border-red-500' : ''}
                                            disabled={processing}
                                        />
                                        {errors.display_name && (
                                            <p className="text-sm text-red-600">{errors.display_name}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            This is how the permission will appear to users
                                        </p>
                                    </div>

                                    {/* Permission Name Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="name" className="flex items-center gap-2">
                                                Permission Name *
                                                <span className="text-xs text-gray-500 font-normal">
                                                    (Technical name - used in code)
                                                </span>
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(data.name, 'name')}
                                                className="h-6 text-xs"
                                                disabled={!data.name}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                {copiedField === 'name' ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {selectedModule && (
                                                <span className="px-3 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-l-md border border-r-0 font-mono text-sm">
                                                    {selectedModule.toLowerCase()}.
                                                </span>
                                            )}
                                            <Input
                                                id="name"
                                                value={selectedModule ? data.name.replace(`${selectedModule.toLowerCase()}.`, '') : data.name}
                                                onChange={(e) => {
                                                    const value = selectedModule 
                                                        ? `${selectedModule.toLowerCase()}.${e.target.value}`
                                                        : e.target.value;
                                                    setData('name', value);
                                                }}
                                                placeholder={selectedModule ? "view, create, edit, delete" : "module.action"}
                                                className={`font-mono ${selectedModule ? 'rounded-l-none' : ''} ${errors.name ? 'border-red-500' : ''}`}
                                                disabled={processing || !selectedModule}
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Format: module.action (lowercase with dots). Example: residents.view
                                        </p>
                                    </div>

                                    {/* Description Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                            <span className="text-xs text-gray-500 font-normal ml-2">
                                                (Optional but recommended)
                                            </span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe what this permission allows..."
                                            className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                                            disabled={processing}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600">{errors.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Helps users understand the purpose of this permission
                                        </p>
                                    </div>

                                    {/* Suggested Permissions */}
                                    {suggestedPermissions.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <HelpCircle className="h-4 w-4 text-gray-500" />
                                                <Label className="text-sm font-medium">
                                                    Common permissions for {selectedModule}
                                                </Label>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {suggestedPermissions.map((suggestion, index) => (
                                                    <Button
                                                        key={index}
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-auto py-2 px-3 justify-start text-left"
                                                        onClick={() => handleUseSuggestion(suggestion)}
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-sm">{suggestion.display_name}</div>
                                                            <div className="text-xs text-gray-500 font-mono truncate">
                                                                {suggestion.name}
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                {suggestion.description}
                                                            </div>
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Advanced Settings */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <HelpCircle className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">Advanced Settings</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowAdvanced(!showAdvanced)}
                                                className="h-8"
                                            >
                                                {showAdvanced ? 'Hide' : 'Show'}
                                            </Button>
                                        </div>

                                        {showAdvanced && (
                                            <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                                                {/* Status */}
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label htmlFor="is_active">Status</Label>
                                                        <p className="text-sm text-gray-500">
                                                            Enable or disable this permission
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        id="is_active"
                                                        checked={data.is_active}
                                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                                        disabled={processing}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Validation Errors */}
                                    {validation_errors && Object.keys(validation_errors).length > 0 && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {Object.entries(validation_errors).map(([field, error]) => (
                                                        <li key={field}>
                                                            <span className="font-medium">{field}:</span> {error}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between border-t px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('permissions.index'))}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={processing || isSubmitting || !data.name || !data.display_name || !data.module}
                                    >
                                        {processing || isSubmitting ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Create Permission
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>

                    {/* Right Column - Information & Preview */}
                    <div className="space-y-6">
                        {/* Permission Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Preview
                                </CardTitle>
                                <CardDescription>
                                    How this permission will appear in the system
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{data.display_name || 'New Permission'}</div>
                                            <div className="text-sm text-gray-500 font-mono">
                                                {data.name || 'module.action'}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={data.is_active ? "default" : "secondary"}>
                                        {data.is_active ? (
                                            <Check className="mr-1 h-3 w-3" />
                                        ) : (
                                            <X className="mr-1 h-3 w-3" />
                                        )}
                                        {data.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Module</span>
                                        {selectedModule ? (
                                            <div className="flex items-center gap-2">
                                                {getModuleIcon(selectedModule)}
                                                <span className="text-sm font-medium">{selectedModule}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">Not selected</span>
                                        )}
                                    </div>
                                    {data.description && (
                                        <div>
                                            <span className="text-sm text-gray-500">Description</span>
                                            <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                                                {data.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HelpCircle className="h-5 w-5" />
                                    Naming Guidelines
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Permission Name Format</h4>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Check className="h-3 w-3 text-green-500" />
                                            <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">module.action</code>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-3 w-3 text-green-500" />
                                            <span>Use lowercase letters only</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-3 w-3 text-green-500" />
                                            <span>Separate words with dots</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <X className="h-3 w-3 text-red-500" />
                                            <span>Avoid spaces and special characters</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Common Actions</h4>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span>View/Read</span>
                                            <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">.view</code>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Create</span>
                                            <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">.create</code>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Edit/Update</span>
                                            <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">.edit</code>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Delete</span>
                                            <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">.delete</code>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Manage/Admin</span>
                                            <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">.manage</code>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('roles.index'))}
                                    className="w-full"
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Roles
                                </Button>
                                
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('permissions.index'))}
                                    className="w-full"
                                >
                                    <Key className="mr-2 h-4 w-4" />
                                    View All Permissions
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}