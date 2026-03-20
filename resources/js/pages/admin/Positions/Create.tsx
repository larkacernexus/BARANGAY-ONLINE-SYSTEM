// pages/admin/positions/create.tsx

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
    XCircle,
    AlertCircle,
    Hash,
    Tag,
    Award,
    BookOpen
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
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Positions', href: '/admin/positions' },
                { title: 'Create Position', href: '/admin/positions/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/positions">
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                        Create New Position
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Add a new official position for barangay officials
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white dark:from-indigo-700 dark:to-purple-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Position'}
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
                        {/* Left Column - Position Details */}
                        <div className="space-y-6">
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 flex items-center justify-center">
                                            <Shield className="h-3 w-3 text-white" />
                                        </div>
                                        Position Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Enter position details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="dark:text-gray-300">
                                                Position Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input 
                                                id="name" 
                                                placeholder="e.g., Barangay Captain, Kagawad - Peace and Order" 
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                onBlur={generateCodeFromName}
                                                required
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="code" className="dark:text-gray-300">
                                                Code <span className="text-red-500">*</span>
                                            </Label>
                                            <Input 
                                                id="code" 
                                                placeholder="captain, kagawad_peace" 
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value)}
                                                required
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Unique identifier for the position
                                            </p>
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
                                                    onChange={(e) => setData('order', parseInt(e.target.value))}
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Determines sorting in official lists
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role_id" className="dark:text-gray-300">System Role</Label>
                                            <Select 
                                                value={data.role_id?.toString() || "null"}
                                                onValueChange={handleRoleSelect}
                                            >
                                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                    <SelectValue placeholder="Select system role" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    <SelectItem value="null" className="dark:text-gray-300 dark:focus:bg-gray-700">No role</SelectItem>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.id} value={role.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Role assigned when creating user account
                                            </p>
                                        </div>
                                    </div>

                                    {/* Committee Selection */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="committee_id" className="dark:text-gray-300">Primary Committee</Label>
                                            <Select 
                                                value={data.committee_id?.toString() || "null"}
                                                onValueChange={handleCommitteeSelect}
                                            >
                                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                    <SelectValue placeholder="Select primary committee" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    <SelectItem value="null" className="dark:text-gray-300 dark:focus:bg-gray-700">No committee</SelectItem>
                                                    {committees.map((committee) => (
                                                        <SelectItem key={committee.value} value={committee.value.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                            <div className="flex items-center gap-2">
                                                                <Target className="h-3 w-3" />
                                                                <span>{committee.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {isKagawadPosition && !data.committee_id && (
                                                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Kagawad positions usually have a primary committee
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="dark:text-gray-300">Additional Committees</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {committees.map((committee) => {
                                                    const isPrimary = committee.value === data.committee_id;
                                                    const isSelected = data.additional_committees.includes(committee.value);
                                                    
                                                    return (
                                                        <div 
                                                            key={committee.value} 
                                                            className={`flex items-start space-x-2 p-2 border rounded-md ${
                                                                isPrimary 
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                                                    : isSelected
                                                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                                                                        : 'border-gray-200 dark:border-gray-700'
                                                            }`}
                                                        >
                                                            <Checkbox 
                                                                id={`committee_${committee.value}`}
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleAdditionalCommittee(committee.value)}
                                                                disabled={isPrimary}
                                                                className="mt-0.5 dark:border-gray-600"
                                                            />
                                                            <Label 
                                                                htmlFor={`committee_${committee.value}`} 
                                                                className={`cursor-pointer text-sm ${
                                                                    isPrimary 
                                                                        ? 'text-blue-700 dark:text-blue-400 font-medium' 
                                                                        : 'dark:text-gray-300'
                                                                }`}
                                                            >
                                                                {committee.label}
                                                                {isPrimary && (
                                                                    <Badge variant="outline" className="ml-1 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                                        Primary
                                                                    </Badge>
                                                                )}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Select additional committees this position belongs to
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            placeholder="Describe the position's responsibilities and duties..."
                                            rows={4}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2 p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Checkbox 
                                                id="requires_account" 
                                                checked={data.requires_account}
                                                onCheckedChange={(checked) => setData('requires_account', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="requires_account" className="cursor-pointer dark:text-gray-300">
                                                Requires system account
                                            </Label>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">
                                            Officials with this position will need a user account
                                        </p>

                                        <div className="flex items-center space-x-2 p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Checkbox 
                                                id="is_active" 
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="is_active" className="cursor-pointer dark:text-gray-300">
                                                Position is active
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Preview & Guidelines */}
                        <div className="space-y-6">
                            {/* Preview Card */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                            <Shield className="h-3 w-3 text-white" />
                                        </div>
                                        Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.name ? (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                                                    <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium dark:text-gray-100">{data.name}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {isKagawadPosition ? 'Kagawad Position' : 'Barangay Position'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t dark:border-gray-700 space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Code:</span>
                                                    <span className="font-mono font-medium dark:text-gray-300">{data.code || 'Not set'}</span>
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
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Account Required:</span>
                                                    <span className={`font-medium ${data.requires_account ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {data.requires_account ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Committees Preview */}
                                            {(data.committee_id || data.additional_committees.length > 0) && (
                                                <div className="pt-4 border-t dark:border-gray-700">
                                                    <h5 className="font-medium mb-2 dark:text-gray-300">Committees:</h5>
                                                    <div className="space-y-2">
                                                        {selectedCommittee && (
                                                            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                                                <div className="flex items-center gap-2">
                                                                    <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                                    <span className="text-sm dark:text-gray-300">{selectedCommittee.label}</span>
                                                                </div>
                                                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                                    Primary
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        
                                                        {getSelectedAdditionalCommittees().map((committee) => (
                                                            <div key={committee.value} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                                                                <Target className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                                <span className="text-sm dark:text-gray-300">{committee.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {data.description && (
                                                <div className="pt-4 border-t dark:border-gray-700">
                                                    <h5 className="font-medium mb-2 dark:text-gray-300">Description:</h5>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{data.description}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>Enter position details to see preview</p>
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
                                        Position Guidelines
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-medium dark:text-gray-200">Kagawad Positions:</span>
                                                <p className="text-gray-600 dark:text-gray-400">Should have a primary committee assigned (e.g., Kagawad - Peace and Order)</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-medium dark:text-gray-200">Account Requirements:</span>
                                                <p className="text-gray-600 dark:text-gray-400">Key positions like Captain, Secretary, Treasurer require system accounts</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-medium dark:text-gray-200">Multiple Committees:</span>
                                                <p className="text-gray-600 dark:text-gray-400">Some positions (e.g., SK Chairman) may belong to multiple committees</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-medium dark:text-gray-200">Display Order:</span>
                                                <p className="text-gray-600 dark:text-gray-400">Determines how officials are displayed on the barangay website</p>
                                            </div>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                        <Link href="/admin/positions">
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
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                Reset Form
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white dark:from-indigo-700 dark:to-purple-700"
                            >
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