// resources/js/Pages/admin/Positions/Create.tsx
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
    X,
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';

interface CommitteeOption {
    value: number;
    label: string;
    code: string;
}

interface RoleOption {
    id: number;
    name: string;
}

interface CreatePositionProps extends PageProps {
    committees: CommitteeOption[];
    roles: RoleOption[];
    nextOrder: number;
}

export default function CreatePosition({ committees, roles, nextOrder }: CreatePositionProps) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        committee_id: null as number | null,
        additional_committees: [] as number[],
        description: '',
        order: nextOrder,
        role_id: null as number | null,
        requires_account: false,
        is_active: true,
    });

    const [selectedCommittee, setSelectedCommittee] = useState<CommitteeOption | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/positions');
    };

    const generateCodeFromName = () => {
        if (!data.code && data.name) {
            const code = data.name
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
            setData('code', code);
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

    return (
        <AppLayout
            title="Create Position"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Positions', href: '/admin/positions' },
                { title: 'Create Position', href: '/admin/positions/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/positions">
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Create New Position</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Add a new official position for barangay officials
                                </p>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Position'}
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
                        {/* Left Column - Position Details */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Position Information
                                </CardTitle>
                                <CardDescription>
                                    Enter position details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Position Name *</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g., Barangay Captain, Kagawad - Peace and Order" 
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            onBlur={generateCodeFromName}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Code *</Label>
                                        <Input 
                                            id="code" 
                                            placeholder="captain, kagawad_peace" 
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            required
                                        />
                                        <p className="text-xs text-gray-500">
                                            Unique identifier for the position
                                        </p>
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
                                            onChange={(e) => setData('order', parseInt(e.target.value))}
                                        />
                                        <p className="text-xs text-gray-500">
                                            Determines sorting in official lists
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role_id">System Role</Label>
                                        <Select 
                                            value={data.role_id?.toString() || "null"}
                                            onValueChange={handleRoleSelect}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select system role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="null">No role</SelectItem>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">
                                            Role assigned when creating user account
                                        </p>
                                    </div>
                                </div>

                                {/* Committee Selection */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Primary Committee</Label>
                                        <Select 
                                            value={data.committee_id?.toString() || "null"}
                                            onValueChange={handleCommitteeSelect}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select primary committee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="null">No committee</SelectItem>
                                                {committees.map((committee) => (
                                                    <SelectItem key={committee.value} value={committee.value.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <Target className="h-3 w-3" />
                                                            <span>{committee.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {isKagawadPosition && !data.committee_id && (
                                            <p className="text-sm text-amber-600">
                                                Kagawad positions usually have a primary committee
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Additional Committees</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {committees.map((committee) => (
                                                <div key={committee.value} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`committee_${committee.value}`}
                                                        checked={data.additional_committees.includes(committee.value)}
                                                        onCheckedChange={() => toggleAdditionalCommittee(committee.value)}
                                                        disabled={committee.value === data.committee_id}
                                                    />
                                                    <Label 
                                                        htmlFor={`committee_${committee.value}`} 
                                                        className="cursor-pointer text-sm"
                                                    >
                                                        {committee.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Select additional committees this position belongs to
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Describe the position's responsibilities and duties..."
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="requires_account" 
                                            checked={data.requires_account}
                                            onCheckedChange={(checked) => setData('requires_account', checked as boolean)}
                                        />
                                        <Label htmlFor="requires_account" className="cursor-pointer">
                                            Requires system account
                                        </Label>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Officials with this position will need a user account
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Position is active
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
                                                <Shield className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{data.name}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {isKagawadPosition ? 'Kagawad Position' : 'Barangay Position'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Code:</span>
                                                <span className="font-mono font-medium">{data.code || 'Not set'}</span>
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
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Account Required:</span>
                                                <span className={`font-medium ${data.requires_account ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {data.requires_account ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Committees Preview */}
                                        {(data.committee_id || data.additional_committees.length > 0) && (
                                            <div className="pt-4 border-t">
                                                <h5 className="font-medium mb-2">Committees:</h5>
                                                <div className="space-y-2">
                                                    {selectedCommittee && (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Target className="h-3 w-3 text-blue-600" />
                                                                <span className="text-sm">{selectedCommittee.label}</span>
                                                            </div>
                                                            <Badge variant="outline" className="text-xs">
                                                                Primary
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    
                                                    {getSelectedAdditionalCommittees().map((committee) => (
                                                        <div key={committee.value} className="flex items-center gap-2">
                                                            <Target className="h-3 w-3 text-gray-400" />
                                                            <span className="text-sm">{committee.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {data.description && (
                                            <div className="pt-4 border-t">
                                                <h5 className="font-medium mb-2">Description:</h5>
                                                <p className="text-sm text-gray-600">{data.description}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <Shield className="h-12 w-12 mx-auto mb-2" />
                                        <p>Enter position details to see preview</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Position Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <span className="font-medium">Kagawad Positions:</span>
                                            <p className="text-gray-600">Should have a primary committee assigned (e.g., Kagawad - Peace and Order)</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <span className="font-medium">Account Requirements:</span>
                                            <p className="text-gray-600">Key positions like Captain, Secretary, Treasurer require system accounts</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <span className="font-medium">Multiple Committees:</span>
                                            <p className="text-gray-600">Some positions (e.g., SK Chairman) may belong to multiple committees</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <span className="font-medium">Display Order:</span>
                                            <p className="text-gray-600">Determines how officials are displayed on the barangay website</p>
                                        </div>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <Link href="/admin/positions">
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
                                        committee_id: null,
                                        additional_committees: [],
                                        description: '',
                                        order: nextOrder,
                                        role_id: null,
                                        requires_account: false,
                                        is_active: true,
                                    });
                                    setSelectedCommittee(null);
                                }}
                            >
                                Reset Form
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Position'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}