import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Award,
    CheckCircle,
    Edit,
    Eye,
    MoreHorizontal,
    Plus,
    Search,
    Shield,
    Trash2,
    Users,
    XCircle,
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
    created_at: string;
    updated_at: string;
    discount_type?: DiscountType;
    residents_count?: number;
    active_residents_count?: number;
}

interface PrivilegesData {
    data: Privilege[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    privileges: PrivilegesData | null; // Allow null
    discountTypes: DiscountType[];
    filters: {
        search?: string;
        status?: string;
        discount_type?: string;
    };
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
        assign: boolean;
    };
}

export default function Index({ privileges, discountTypes, filters, can }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [discountType, setDiscountType] = useState(filters.discount_type || '');

    // CRITICAL FIX #1: Early return if privileges is null/undefined
    if (!privileges) {
        return (
            <AppLayout
                header={
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                                Privileges Management
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage resident privileges and discounts
                            </p>
                        </div>
                        {can?.create && (
                            <Link href={route('admin.privileges.create')}>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    New Privilege
                                </Button>
                            </Link>
                        )}
                    </div>
                }
            >
                <Head title="Privileges Management" />
                <div className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Card>
                            <CardContent className="py-10">
                                <div className="text-center text-gray-500">
                                    Loading privileges...
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // CRITICAL FIX #2: Safe data access with fallbacks
    const privilegeData = privileges?.data ?? [];
    const totalPrivileges = privileges?.total ?? 0;
    const currentPage = privileges?.current_page ?? 1;
    const lastPage = privileges?.last_page ?? 1;

    // Safe calculations
    const activePrivilegesCount = privilegeData.filter(p => p?.is_active ?? false).length;
    const totalAssignments = privilegeData.reduce((sum, p) => sum + (p?.residents_count || 0), 0);
    const activeAssignments = privilegeData.reduce((sum, p) => sum + (p?.active_residents_count || 0), 0);

    const handleSearch = () => {
        router.get(route('admin.privileges.index'), {
            search: search || undefined,
            status: status || undefined,
            discount_type: discountType || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setDiscountType('');
        router.get(route('admin.privileges.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this privilege?')) {
            router.delete(route('admin.privileges.destroy', id));
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
            </Badge>
        ) : (
            <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                <XCircle className="mr-1 h-3 w-3" />
                Inactive
            </Badge>
        );
    };

    const getRequirementBadges = (privilege: Privilege) => {
        return (
            <div className="flex gap-1">
                {privilege.requires_id_number && (
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        ID Required
                    </Badge>
                )}
                {privilege.requires_verification && (
                    <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        Needs Verification
                    </Badge>
                )}
            </div>
        );
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Privileges Management
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manage resident privileges and discounts
                        </p>
                    </div>
                    {can?.create && (
                        <Link href={route('admin.privileges.create')}>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Privilege
                            </Button>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Privileges Management" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters Card */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search privileges..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-9"
                                    />
                                </div>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                                >
                                    <option value="">All Discount Types</option>
                                    {discountTypes?.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <Button onClick={handleSearch} className="flex-1">
                                        Filter
                                    </Button>
                                    <Button variant="outline" onClick={handleReset} className="flex-1">
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Privileges</CardTitle>
                                <Award className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalPrivileges}</div>
                                <p className="text-xs text-gray-500">Across all categories</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Privileges</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activePrivilegesCount}</div>
                                <p className="text-xs text-gray-500">Currently available</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                                <Users className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalAssignments}</div>
                                <p className="text-xs text-gray-500">Residents with privileges</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                                <Shield className="h-4 w-4 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeAssignments}</div>
                                <p className="text-xs text-gray-500">Verified & active</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Privileges Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Privileges List</CardTitle>
                            <CardDescription>
                                Showing {privilegeData.length} of {totalPrivileges} privileges
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {privilegeData.length > 0 ? (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Discount Type</TableHead>
                                                <TableHead>Discount %</TableHead>
                                                <TableHead>Requirements</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Assignments</TableHead>
                                                <TableHead>Validity</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {privilegeData.map((privilege) => (
                                                <TableRow key={privilege.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                                                                <Award className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div>{privilege.name}</div>
                                                                {privilege.description && (
                                                                    <div className="text-xs text-gray-500">
                                                                        {privilege.description.substring(0, 30)}
                                                                        {privilege.description.length > 30 && '...'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono">
                                                            {privilege.code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {privilege.discount_type?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                                            {privilege.default_discount_percentage}%
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getRequirementBadges(privilege)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(privilege.is_active)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">
                                                                {privilege.active_residents_count || 0} active
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {privilege.residents_count || 0} total
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {privilege.validity_years ? (
                                                            <Badge variant="outline">
                                                                {privilege.validity_years} year(s)
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Lifetime</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('admin.privileges.show', privilege.id)} className="cursor-pointer">
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                {can?.edit && (
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={route('admin.privileges.edit', privilege.id)} className="cursor-pointer">
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {can?.assign && (
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={route('admin.privileges.assign', privilege.id)} className="cursor-pointer">
                                                                            <Users className="mr-2 h-4 w-4" />
                                                                            Assign to Residents
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                {can?.delete && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDelete(privilege.id)}
                                                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {lastPage > 1 && (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-sm text-gray-500">
                                                Page {currentPage} of {lastPage}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.get(route('admin.privileges.index', { page: currentPage - 1 }))}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.get(route('admin.privileges.index', { page: currentPage + 1 }))}
                                                    disabled={currentPage === lastPage}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-10 text-center text-gray-500">
                                    No privileges found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}