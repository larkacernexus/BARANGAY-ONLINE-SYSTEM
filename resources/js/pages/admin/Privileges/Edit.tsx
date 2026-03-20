// resources/js/Pages/Admin/Privileges/Edit.tsx

import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/admin-app-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Save,
    Award,
    Percent,
    Shield,
    IdCard,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Tag,
    Clock,
    FileText,
    Edit3
} from 'lucide-react';

interface DiscountType {
    id: number;
    name: string;
    code: string;
}

interface Privilege {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    discount_type_id: number;
    default_discount_percentage: string | number;
    requires_id_number: boolean;
    requires_verification: boolean;
    validity_years: number | null;
    discount_type?: DiscountType; // 👈 Added for eager loading
}

interface Props {
    privilege: Privilege;
    discountTypes: DiscountType[];
}

export default function Edit({ privilege, discountTypes }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: privilege.name || '',
        code: privilege.code || '',
        description: privilege.description || '',
        discount_type_id: privilege.discount_type_id?.toString() || '',
        default_discount_percentage: privilege.default_discount_percentage?.toString() || '',
        requires_id_number: privilege.requires_id_number,
        requires_verification: privilege.requires_verification,
        validity_years: privilege.validity_years?.toString() || '',
        is_active: privilege.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.privileges.update', privilege.id));
    };

    // Helper to get discount type name by ID with null safety
    const getDiscountTypeName = (id: string | null | undefined) => {
        if (!id) return 'N/A';
        const type = discountTypes.find(t => t.id.toString() === id);
        return type?.name || 'N/A';
    };

    return (
        <AppLayout
            title={`Edit: ${privilege.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Privileges', href: '/admin/privileges' },
                { title: privilege.name, href: `/admin/privileges/${privilege.id}` },
                { title: 'Edit', href: `/admin/privileges/${privilege.id}/edit` }
            ]}
        >
            <Head title={`Edit ${privilege.name}`} />

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={`/admin/privileges/${privilege.id}`}>
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <Edit3 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                        Edit Privilege
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Updating: {privilege.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white dark:from-amber-700 dark:to-orange-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Privilege'}
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
                        {/* Left Column - Basic Information & Discount Settings */}
                        <div className="space-y-6">
                            {/* Basic Information Card */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                            <FileText className="h-3 w-3 text-white" />
                                        </div>
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Edit the privilege's basic details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="dark:text-gray-300">
                                            Privilege Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g., Senior Citizen Discount" 
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="code" className="dark:text-gray-300">
                                                Code <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input 
                                                    id="code" 
                                                    placeholder="e.g., SENIOR_DISCOUNT"
                                                    value={data.code}
                                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 font-mono"
                                                />
                                            </div>
                                            {errors.code && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="discount_type_id" className="dark:text-gray-300">
                                                Discount Type <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={data.discount_type_id}
                                                onValueChange={(value) => setData('discount_type_id', value)}
                                            >
                                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    {discountTypes.map((type) => (
                                                        <SelectItem 
                                                            key={type.id} 
                                                            value={type.id.toString()}
                                                            className="dark:text-gray-300 dark:focus:bg-gray-700"
                                                        >
                                                            {type.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.discount_type_id && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.discount_type_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            placeholder="Describe the privilege, eligibility criteria, and benefits..."
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Discount Settings Card */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                                            <Percent className="h-3 w-3 text-white" />
                                        </div>
                                        Discount Settings
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Update the discount amount
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="default_discount_percentage" className="dark:text-gray-300">
                                            Default Discount (%) <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input 
                                                id="default_discount_percentage"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                placeholder="e.g., 20"
                                                value={data.default_discount_percentage}
                                                onChange={(e) => setData('default_discount_percentage', e.target.value)}
                                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Enter a percentage between 0 and 100
                                        </p>
                                        {errors.default_discount_percentage && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.default_discount_percentage}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Requirements & Settings */}
                        <div className="space-y-6">
                            {/* Requirements Card */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 flex items-center justify-center">
                                            <Shield className="h-3 w-3 text-white" />
                                        </div>
                                        Requirements & Verification
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Update the requirements for this privilege
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <IdCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <Label htmlFor="requires_id_number" className="font-medium dark:text-gray-200">
                                                    Require ID Number
                                                </Label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Resident must provide an ID number
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            id="requires_id_number"
                                            checked={data.requires_id_number}
                                            onCheckedChange={(checked) => setData('requires_id_number', checked)}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <Label htmlFor="requires_verification" className="font-medium dark:text-gray-200">
                                                    Requires Verification
                                                </Label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Privilege needs to be verified before use
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            id="requires_verification"
                                            checked={data.requires_verification}
                                            onCheckedChange={(checked) => setData('requires_verification', checked)}
                                            className="data-[state=checked]:bg-purple-600"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Validity & Status Card */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 flex items-center justify-center">
                                            <Calendar className="h-3 w-3 text-white" />
                                        </div>
                                        Validity & Status
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Update validity period and status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="validity_years" className="dark:text-gray-300">Validity Period</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <Input 
                                                id="validity_years"
                                                type="number"
                                                min="0"
                                                placeholder="Leave empty for lifetime"
                                                value={data.validity_years}
                                                onChange={(e) => setData('validity_years', e.target.value)}
                                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Number of years the privilege remains valid. Leave empty for no expiration.
                                        </p>
                                        {errors.validity_years && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.validity_years}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="is_active" className="dark:text-gray-300">Status</Label>
                                        <Select
                                            value={data.is_active ? '1' : '0'}
                                            onValueChange={(value) => setData('is_active', value === '1')}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                <SelectItem value="1" className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                        Active
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="0" className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                        Inactive
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Current Values Preview Card */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                            <Award className="h-3 w-3 text-white" />
                                        </div>
                                        Current Values
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Privilege Name:</span>
                                            <span className="font-medium dark:text-gray-200">{privilege.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Code:</span>
                                            <span className="font-mono font-medium dark:text-gray-200">{privilege.code}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Discount Type:</span>
                                            <span className="font-medium dark:text-gray-200">
                                                {privilege.discount_type?.name || getDiscountTypeName(privilege.discount_type_id?.toString())}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                                {privilege.default_discount_percentage}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Requirements:</span>
                                            <span className="font-medium dark:text-gray-200">
                                                {privilege.requires_id_number && privilege.requires_verification 
                                                    ? 'ID + Verification'
                                                    : privilege.requires_id_number 
                                                        ? 'ID Only'
                                                        : privilege.requires_verification
                                                            ? 'Verification Only'
                                                            : 'None'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Validity:</span>
                                            <span className="font-medium dark:text-gray-200">
                                                {privilege.validity_years ? `${privilege.validity_years} year(s)` : 'Lifetime'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                            <span className={`font-medium ${
                                                privilege.is_active 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {privilege.is_active ? 'Active' : 'Inactive'}
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