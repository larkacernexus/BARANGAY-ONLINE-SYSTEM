// pages/admin/banners/index.tsx

import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Image as ImageIcon,
    Calendar,
    Users,
    ArrowUpDown,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types/breadcrumbs';

interface Banner {
    id: number;
    title: string;
    description: string | null;
    image_url: string;
    mobile_image_url: string;
    link_url: string | null;
    button_text: string;
    sort_order: number;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    target_audience: string;
    status: 'active' | 'scheduled' | 'expired' | 'inactive';
    is_currently_active: boolean;
    creator?: {
        first_name: string;
        last_name: string;
    };
    created_at: string;
}

interface Props {
    banners: {
        data: Banner[];
        links: any;
        meta: any;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Banners',
        href: '/admin/banners',
    },
];

const audienceLabels: Record<string, string> = {
    all: 'All Users',
    residents: 'All Residents',
    puroks: 'Specific Puroks',
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle },
    inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

export default function BannersIndex({ banners }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/admin/banners/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const handleToggleActive = (banner: Banner) => {
        setTogglingId(banner.id);
        router.post(`/admin/banners/${banner.id}/toggle`, {}, {
            onSuccess: () => setTogglingId(null),
            onError: () => setTogglingId(null),
        });
    };

    const getStatusBadge = (banner: Banner) => {
        const config = statusConfig[banner.status] || statusConfig.inactive;
        const Icon = config.icon;
        return (
            <Badge className={cn("gap-1", config.color)} variant="outline">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Banners" />

            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Banners</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manage homepage carousel banners and promotional content
                        </p>
                    </div>
                    <Link href="/admin/banners/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Banner
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Banners</CardTitle>
                        <CardDescription>
                            A list of all banners in the system. Drag to reorder (coming soon).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>
                                        <div className="flex items-center gap-1">
                                            Title
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Audience</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead className="w-[100px]">Active</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {banners.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <ImageIcon className="h-12 w-12 mb-3 opacity-50" />
                                                <p className="text-lg font-medium">No banners found</p>
                                                <p className="text-sm">Get started by creating your first banner.</p>
                                                <Link href="/admin/banners/create" className="mt-4">
                                                    <Button variant="outline" size="sm">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Create Banner
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    banners.data.map((banner) => (
                                        <TableRow key={banner.id}>
                                            <TableCell>
                                                {banner.image_url ? (
                                                    <img
                                                        src={banner.image_url}
                                                        alt={banner.title}
                                                        className="h-12 w-20 object-cover rounded-md border"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-20 bg-gray-100 rounded-md border flex items-center justify-center">
                                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {banner.title}
                                                    </p>
                                                    {banner.description && (
                                                        <p className="text-sm text-gray-500 truncate max-w-xs">
                                                            {banner.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(banner)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3 text-gray-500" />
                                                    <span className="text-sm">
                                                        {audienceLabels[banner.target_audience] || banner.target_audience}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {banner.start_date || banner.end_date ? (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {banner.start_date ? new Date(banner.start_date).toLocaleDateString() : 'Now'}
                                                            {' - '}
                                                            {banner.end_date ? new Date(banner.end_date).toLocaleDateString() : 'Forever'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Always active</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium">{banner.sort_order}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={banner.is_active}
                                                    onCheckedChange={() => handleToggleActive(banner)}
                                                    disabled={togglingId === banner.id}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <Link href={`/admin/banners/${banner.id}/edit`}>
                                                            <DropdownMenuItem>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        {banner.link_url && (
                                                            <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                                                                <DropdownMenuItem>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Preview Link
                                                                </DropdownMenuItem>
                                                            </a>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => setDeleteId(banner.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {banners.meta && banners.meta.total > banners.meta.per_page && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Showing {banners.meta.from} to {banners.meta.to} of {banners.meta.total} results
                                </p>
                                <div className="flex gap-2">
                                    {banners.links?.map((link: any, i: number) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this banner? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}