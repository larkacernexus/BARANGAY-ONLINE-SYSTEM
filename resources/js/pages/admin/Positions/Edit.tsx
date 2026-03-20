import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft,
    Save,
    Shield,
    Target,
    Key,
    Users,
    CheckCircle,
    Trash2,
    X,
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';

interface CommitteeOption {
    value: number;
    label: string;
    code: string;
}

interface RoleOption {
    id: number;
    name: string;
}

interface Position {
    id: number;
    code: string;
    name: string;
    description: string;
    order: number;
    role_id: number | null;
    requires_account: boolean;
    is_active: boolean;
    committee_id: number | null;
    additional_committees: number[];
    created_at: string;
    updated_at: string;
    committee?: CommitteeOption;
    role?: RoleOption;
    officials_count?: number;
}

interface EditPositionProps extends PageProps {
    position: Position;
    committees: CommitteeOption[];
    roles: RoleOption[];
}

export default function EditPosition({ position, committees = [], roles = [] }: EditPositionProps) {
    const { data, setData, post, processing, errors, delete: destroy } = useForm({
        code: position.code || '',
        name: position.name || '',
        description: position.description || '',
        order: position.order || 0,
        role_id: position.role_id || null as number | null,
        requires_account: position.requires_account ?? false,
        is_active: position.is_active ?? true,
        committee_id: position.committee_id || null as number | null,
        additional_committees: position.additional_committees || [] as number[],
    });

    const [selectedCommittee, setSelectedCommittee] = useState<CommitteeOption | null>(
        position.committee || null
    );

    // Initialize form with current data
    useEffect(() => {
        setData({
            code: position.code || '',
            name: position.name || '',
            description: position.description || '',
            order: position.order || 0,
            role_id: position.role_id || null,
            requires_account: position.requires_account ?? false,
            is_active: position.is_active ?? true,
            committee_id: position.committee_id || null,
            additional_committees: position.additional_committees || [],
        });
        setSelectedCommittee(position.committee || null);
    }, [position]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/positions/${position.id}`, {
            preserveScroll: true,
            onError: () => {
                console.log('Error updating position:', errors);
            },
            onSuccess: () => {
                console.log('Position updated successfully');
            }
        });
    };

    const handleDelete = () => {
        if (position.officials_count && position.officials_count > 0) {
            alert('Cannot delete position that has assigned officials. Please reassign officials first.');
            return;
        }
        
        if (confirm('Are you sure you want to delete this position? This action cannot be undone.')) {
            destroy(`/admin/positions/${position.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // Redirect to positions list
                    window.location.href = '/admin/positions';
                }
            });
        }
    };

    const handleCommitteeSelect = (committeeId: string) => {
        if (committeeId === "null" || committeeId === "") {
            setData('committee_id', null);
            setSelectedCommittee(null);
        } else {
            const id = parseInt(committeeId);
            setData('committee_id', id);
            const committee = committees.find(c => c.value === id);
            setSelectedCommittee(committee || null);
        }
    };

    const handleRoleSelect = (roleId: string) => {
        if (roleId === "null" || roleId === "") {
            setData('role_id', null);
        } else {
            const id = parseInt(roleId);
            setData('role_id', id);
        }
    };

    const toggleAdditionalCommittee = (committeeId: number) => {
        const current = data.additional_committees;
        if (current.includes(committeeId)) {
            setData('additional_committees', current.filter(id => id !== committeeId));
        } else {
            setData('additional_committees', [...current, committeeId]);
        }
    };

    const getSelectedAdditionalCommittees = () => {
        return committees.filter(c => data.additional_committees.includes(c.value));
    };

    const isKagawadPosition = data.name.toLowerCase().includes('kagawad') || 
                              data.code.toLowerCase().includes('kagawad');

    const isFieldChanged = (field: keyof typeof data, original: any) => {
        const currentValue = data[field];
        const originalValue = original;
        
        // Handle array comparison
        if (Array.isArray(currentValue) && Array.isArray(originalValue)) {
            return JSON.stringify([...currentValue].sort()) !== JSON.stringify([...originalValue].sort());
        }
        
        // Handle null/undefined comparisons
        if (currentValue === null || currentValue === undefined) {
            return originalValue !== null && originalValue !== undefined;
        }
        
        if (originalValue === null || originalValue === undefined) {
            return currentValue !== null && currentValue !== undefined;
        }
        
        return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
    };

    const resetForm = () => {
        setData({
            code: position.code || '',
            name: position.name || '',
            description: position.description || '',
            order: position.order || 0,
            role_id: position.role_id || null,
            requires_account: position.requires_account ?? false,
            is_active: position.is_active ?? true,
            committee_id: position.committee_id || null,
            additional_committees: position.additional_committees || [],
        });
        setSelectedCommittee(position.committee || null);
    };

    const getChangedFieldsCount = () => {
        const fields: (keyof typeof data)[] = [
            'code', 'name', 'description', 'order', 'role_id', 
            'requires_account', 'is_active', 'committee_id', 'additional_committees'
        ];
        
        return fields.filter(field => isFieldChanged(field, position[field])).length;
    };

    // Safe committee access helper - filter out any invalid committees
    const safeCommittees = Array.isArray(committees) 
        ? committees.filter(committee => 
            committee && 
            typeof committee === 'object' && 
            committee.value && 
            typeof committee.value === 'number' &&
            committee.label && 
            typeof committee.label === 'string'
        ) 
        : [];

    // Safe roles helper
    const safeRoles = Array.isArray(roles) 
        ? roles.filter(role => 
            role && 
            typeof role === 'object' && 
            role.id && 
            typeof role.id === 'number' &&
            role.name && 
            typeof role.name === 'string'
        ) 
        : [];

    // Get current additional committees safely
    const getCurrentAdditionalCommittees = () => {
        return safeCommittees.filter(c => 
            position.additional_committees && 
            Array.isArray(position.additional_committees) && 
            position.additional_committees.includes(c.value)
        );
    };

    return (
        <AppLayout
            title={`Edit ${position.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Positions', href: '/admin/positions' },
                { title: position.name, href: `/admin/positions/${position.id}` },
                { title: 'Edit', href: `/admin/positions/${position.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/positions">
                                <Button variant="ghost" size="sm" type="button" className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight dark:text-white">Edit Position</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Update position information
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={processing || (position.officials_count && position.officials_count > 0)}
                                className="flex items-center gap-2 dark:bg-red-900 dark:hover:bg-red-800"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                            <Button type="submit" disabled={processing} className="flex items-center gap-2 dark:bg-blue-600 dark:hover:bg-blue-700">
                                <Save className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    {/* Changed fields indicator */}
                    {getChangedFieldsCount() > 0 && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded flex items-center gap-2 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400">
                            <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            <span className="font-medium">{getChangedFieldsCount()} field(s) modified</span>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={resetForm}
                                className="ml-auto text-blue-700 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/50"
                            >
                                Reset All
                            </Button>
                        </div>
                    )}

                    {/* Warning for positions with officials */}
                    {position.officials_count && position.officials_count > 0 && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <div>
                                    <p className="font-medium">This position has {position.officials_count} official(s) assigned</p>
                                    <p className="text-sm mt-1">
                                        Changing position details may affect assigned officials. Deleting is not allowed while officials are assigned.
                                    </p>
                                </div>
                            </div>
                        </div>
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
                        {/* Left Column - Position Details */}
                        <Card className="lg:col-span-2 dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Shield className="h-5 w-5" />
                                    Position Information
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Update position details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="dark:text-gray-300">Position Name *</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g., Barangay Captain, Kagawad - Peace and Order" 
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            className={`${isFieldChanged('name', position.name) ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                        />
                                        {isFieldChanged('name', position.name) && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                Was: {position.name}
                                            </p>
                                        )}
                                        {errors.name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code" className="dark:text-gray-300">Code *</Label>
                                        <Input 
                                            id="code" 
                                            placeholder="captain, kagawad_peace" 
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            required
                                            className={`${isFieldChanged('code', position.code) ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                        />
                                        {isFieldChanged('code', position.code) && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                Was: {position.code}
                                            </p>
                                        )}
                                        {errors.code && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="order" className="dark:text-gray-300">Display Order</Label>
                                        <Input 
                                            id="order" 
                                            type="number" 
                                            min="0"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                            className={`${isFieldChanged('order', position.order) ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                        />
                                        {isFieldChanged('order', position.order) && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                Was: {position.order}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role_id" className="dark:text-gray-300">System Role</Label>
                                        <Select 
                                            value={data.role_id?.toString() || "null"}
                                            onValueChange={handleRoleSelect}
                                        >
                                            <SelectTrigger className={`${isFieldChanged('role_id', position.role_id) ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}>
                                                <SelectValue placeholder="Select system role" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                <SelectItem value="null" className="dark:text-white dark:focus:bg-gray-700">No role</SelectItem>
                                                {safeRoles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()} className="dark:text-white dark:focus:bg-gray-700">
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {isFieldChanged('role_id', position.role_id) && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                Was: {position.role?.name || 'No role'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Committee Selection */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="dark:text-gray-300">Primary Committee</Label>
                                        <Select 
                                            value={data.committee_id?.toString() || "null"}
                                            onValueChange={handleCommitteeSelect}
                                        >
                                            <SelectTrigger className={`${isFieldChanged('committee_id', position.committee_id) ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}>
                                                <SelectValue placeholder="Select primary committee" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                <SelectItem value="null" className="dark:text-white dark:focus:bg-gray-700">No committee</SelectItem>
                                                {safeCommittees.map((committee) => (
                                                    <SelectItem key={committee.value} value={committee.value.toString()} className="dark:text-white dark:focus:bg-gray-700">
                                                        <div className="flex items-center gap-2">
                                                            <Target className="h-3 w-3" />
                                                            <span>{committee.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {isFieldChanged('committee_id', position.committee_id) && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                Was: {position.committee?.label || 'No committee'}
                                            </p>
                                        )}
                                        {isKagawadPosition && !data.committee_id && (
                                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                                Kagawad positions usually have a primary committee
                                            </p>
                                        )}
                                    </div>

                                    {safeCommittees.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="dark:text-gray-300">Additional Committees</Label>
                                                {isFieldChanged('additional_committees', position.additional_committees) && (
                                                    <span className="text-xs text-blue-600 dark:text-blue-400">
                                                        {(position.additional_committees?.length || 0)} → {data.additional_committees.length}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {safeCommittees.map((committee) => (
                                                    <div key={committee.value} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`committee_${committee.value}`}
                                                            checked={data.additional_committees.includes(committee.value)}
                                                            onCheckedChange={() => toggleAdditionalCommittee(committee.value)}
                                                            disabled={committee.value === data.committee_id}
                                                            className={`${((position.additional_committees?.includes(committee.value) || false) !== 
                                                                data.additional_committees.includes(committee.value)) ? 
                                                                'border-blue-300 dark:border-blue-600' : ''} dark:border-gray-600`}
                                                        />
                                                        <Label 
                                                            htmlFor={`committee_${committee.value}`} 
                                                            className="cursor-pointer text-sm dark:text-gray-300"
                                                        >
                                                            {committee.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Describe the position's responsibilities and duties..."
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className={`${isFieldChanged('description', position.description) ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                    />
                                    {isFieldChanged('description', position.description) && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            Description has been modified
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="requires_account" 
                                            checked={data.requires_account}
                                            onCheckedChange={(checked) => setData('requires_account', checked as boolean)}
                                            className={`${isFieldChanged('requires_account', position.requires_account) ? 'border-blue-300 dark:border-blue-600' : ''} dark:border-gray-600`}
                                        />
                                        <Label htmlFor="requires_account" className="cursor-pointer dark:text-gray-300">
                                            Requires system account
                                        </Label>
                                    </div>
                                    {isFieldChanged('requires_account', position.requires_account) && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            Was: {position.requires_account ? 'Required' : 'Not required'}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        className={`${isFieldChanged('is_active', position.is_active) ? 'border-blue-300 dark:border-blue-600' : ''} dark:border-gray-600`}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer dark:text-gray-300">
                                        Position is active
                                    </Label>
                                    {isFieldChanged('is_active', position.is_active) && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            Was: {position.is_active ? 'Active' : 'Inactive'}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column - Preview & Current Info */}
                        <div className="space-y-6">
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Current Position</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${isKagawadPosition ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                                            <Shield className={`h-6 w-6 ${isKagawadPosition ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium dark:text-white">{position.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {isKagawadPosition ? 'Kagawad Position' : 'Barangay Position'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t dark:border-gray-700 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Code:</span>
                                            <code className="font-mono font-medium bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-xs dark:text-gray-300">
                                                {position.code}
                                            </code>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Order:</span>
                                            <span className="font-medium dark:text-white">{position.order}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                            <span className={`font-medium ${position.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {position.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Account Required:</span>
                                            <span className={`font-medium ${position.requires_account ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {position.requires_account ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Officials:</span>
                                            <span className="font-medium flex items-center gap-1 dark:text-white">
                                                <Users className="h-3 w-3" />
                                                {position.officials_count || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">System Role:</span>
                                            <span className="font-medium dark:text-white">{position.role?.name || 'None'}</span>
                                        </div>
                                    </div>

                                    {/* Current Committees */}
                                    {(position.committee || (position.additional_committees && position.additional_committees.length > 0)) && (
                                        <div className="pt-4 border-t dark:border-gray-700">
                                            <h5 className="font-medium mb-2 dark:text-gray-300">Current Committees:</h5>
                                            <div className="space-y-2">
                                                {position.committee && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                            <span className="text-sm dark:text-gray-300">{position.committee.label}</span>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300">
                                                            Primary
                                                        </Badge>
                                                    </div>
                                                )}
                                                
                                                {getCurrentAdditionalCommittees().map((committee) => (
                                                    <div key={committee.value} className="flex items-center gap-2">
                                                        <Target className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                        <span className="text-sm dark:text-gray-300">{committee.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {position.description && (
                                        <div className="pt-4 border-t dark:border-gray-700">
                                            <h5 className="font-medium mb-2 dark:text-gray-300">Current Description:</h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{position.description}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Link href={`/admin/positions/${position.id}`}>
                                        <Button variant="outline" className="w-full justify-start dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                                            <Shield className="h-4 w-4 mr-2" />
                                            View Position Details
                                        </Button>
                                    </Link>
                                    
                                    {position.officials_count && position.officials_count > 0 && (
                                        <Link href={`/admin/officials?position=${position.id}`}>
                                            <Button variant="outline" className="w-full justify-start dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                                                <Users className="h-4 w-4 mr-2" />
                                                View Assigned Officials
                                            </Button>
                                        </Link>
                                    )}
                                    
                                    <div className="pt-4 border-t dark:border-gray-700">
                                        <h4 className="font-medium mb-2 dark:text-gray-300">Status Actions</h4>
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
                                                <X className="h-4 w-4 mr-2" />
                                                Set as Inactive
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t dark:border-gray-700">
                                        <h4 className="font-medium mb-2 dark:text-gray-300">Account Requirement</h4>
                                        <div className="space-y-2">
                                            <Button
                                                variant={data.requires_account ? "default" : "outline"}
                                                className="w-full justify-start"
                                                onClick={() => setData('requires_account', true)}
                                            >
                                                <Key className="h-4 w-4 mr-2" />
                                                Require Account
                                            </Button>
                                            <Button
                                                variant={!data.requires_account ? "default" : "outline"}
                                                className="w-full justify-start"
                                                onClick={() => setData('requires_account', false)}
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                No Account Needed
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Link href={`/admin/positions/${position.id}`}>
                                <Button variant="outline" type="button" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                                    View Details
                                </Button>
                            </Link>
                            <Link href="/admin/positions">
                                <Button variant="outline" type="button" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                                    Back to List
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                type="button"
                                onClick={resetForm}
                                disabled={processing}
                                className="flex items-center gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                                <X className="h-4 w-4" />
                                Reset Changes
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className={`flex items-center gap-2 ${Object.keys(errors).length === 0 ? '' : 'opacity-50'} dark:bg-blue-600 dark:hover:bg-blue-700`}
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}