// app/pages/admin/document-types/show.tsx
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Copy,
    CheckCircle,
    XCircle,
    FileText,
    Folder,
    Calendar,
    HardDrive,
    FileCode,
    ListOrdered,
    AlertCircle,
    Download,
    Eye,
    Clock,
    Users,
    FileCheck,
    FileX
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface DocumentType {
    id: number;
    code: string;
    name: string;
    description: string | null;
    document_category_id: number;
    is_required: boolean;
    is_active: boolean;
    accepted_formats: string[] | string;
    accepted_formats_list: string;
    max_file_size: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    category?: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
    };
    clearanceRequirements?: any[];
    requiredByClearanceTypes?: any[];
}

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    document_requirements_count?: number;
    pivot?: {
        is_required: boolean;
        sort_order: number;
    };
}

interface PageProps {
    documentType: DocumentType;
    requiredClearanceTypes: ClearanceType[];
    recentApplications: any[];
    max_file_size_mb: number;
}

export default function DocumentTypeShow() {
    const { props } = usePage<PageProps>();
    const { 
        documentType, 
        requiredClearanceTypes = [], 
        recentApplications = [],
        max_file_size_mb = 0
    } = props;
    
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format file size
    const formatFileSize = (kb: number) => {
        if (kb < 1024) return `${kb} KB`;
        if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(2)} MB`;
        return `${(kb / 1024 / 1024).toFixed(2)} GB`;
    };

    // Handle back navigation
    const handleBack = () => {
        router.visit(route('admin.document-types.index'));
    };

    // Handle edit
    const handleEdit = () => {
        router.visit(route('admin.document-types.edit', documentType.id));
    };

    // Handle delete
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.document-types.destroy', documentType.id), {
            onSuccess: () => {
                toast.success('Document type deleted successfully');
                router.visit(route('admin.document-types.index'));
            },
            onError: () => {
                toast.error('Failed to delete document type');
                setIsDeleting(false);
                setShowDeleteDialog(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            }
        });
    };

    // Handle duplicate
    const handleDuplicate = () => {
        setIsDuplicating(true);
        router.post(route('document-types.duplicate', documentType.id), {}, {
            onSuccess: (response: any) => {
                toast.success('Document type duplicated successfully');
                if (response.props?.documentType?.id) {
                    router.visit(route('admin.document-types.show', response.props.documentType.id));
                } else {
                    router.visit(route('admin.document-types.index'));
                }
            },
            onError: () => {
                toast.error('Failed to duplicate document type');
                setIsDuplicating(false);
                setShowDuplicateDialog(false);
            },
            onFinish: () => {
                setIsDuplicating(false);
            }
        });
    };

    // Handle toggle status
    const handleToggleStatus = () => {
        router.post(route('document-types.toggle-status', documentType.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Document type ${documentType.is_active ? 'deactivated' : 'activated'} successfully`);
            },
            onError: () => {
                toast.error('Failed to toggle status');
            }
        });
    };

    // Handle toggle required
    const handleToggleRequired = () => {
        router.post(route('document-types.toggle-required', documentType.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Document type ${documentType.is_required ? 'marked as optional' : 'marked as required'} successfully`);
            },
            onError: () => {
                toast.error('Failed to toggle required status');
            }
        });
    };

    // Get status badge
    const getStatusBadge = () => {
        if (documentType.is_active) {
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
            </Badge>
        );
    };

    // Get required badge
    const getRequiredBadge = () => {
        if (documentType.is_required) {
            return (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                    <FileCheck className="h-3 w-3 mr-1" />
                    Required
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                <FileX className="h-3 w-3 mr-1" />
                Optional
            </Badge>
        );
    };

    return (
        <AppLayout
            title={`Document Type: ${documentType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Document Types', href: '/document-types' },
                { title: documentType.name, href: `/document-types/${documentType.id}` }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                className="h-8 w-8"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{documentType.name}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Code: <span className="font-mono">{documentType.code}</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleRequired}
                                className="gap-2"
                            >
                                {documentType.is_required ? (
                                    <>
                                        <FileX className="h-4 w-4" />
                                        Mark as Optional
                                    </>
                                ) : (
                                    <>
                                        <FileCheck className="h-4 w-4" />
                                        Mark as Required
                                    </>
                                )}
                            </Button>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleStatus}
                                className="gap-2"
                            >
                                {documentType.is_active ? (
                                    <>
                                        <XCircle className="h-4 w-4" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        Activate
                                    </>
                                )}
                            </Button>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDuplicateDialog(true)}
                                className="gap-2"
                            >
                                <Copy className="h-4 w-4" />
                                Duplicate
                            </Button>
                            
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleEdit}
                                className="gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                            
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDeleteDialog(true)}
                                className="gap-2"
                                disabled={requiredClearanceTypes.length > 0}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    {/* Status Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <div className="mt-1">
                                            {getStatusBadge()}
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                        <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Requirement</p>
                                        <div className="mt-1">
                                            {getRequiredBadge()}
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                                        <p className="text-2xl font-bold mt-1">
                                            {documentType.category?.name || 'Uncategorized'}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <Folder className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Sort Order</p>
                                        <p className="text-2xl font-bold mt-1">{documentType.sort_order}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                        <ListOrdered className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="requirements">Requirements</TabsTrigger>
                            <TabsTrigger value="applications">Recent Applications</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                        <CardDescription>
                                            General information about this document type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">ID</p>
                                                <p className="text-sm font-mono mt-1">{documentType.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Code</p>
                                                <p className="text-sm font-mono mt-1">{documentType.code}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                                <p className="text-sm mt-1">{documentType.name}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                                <p className="text-sm mt-1">
                                                    {documentType.description || 'No description provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* File Specifications */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>File Specifications</CardTitle>
                                        <CardDescription>
                                            Accepted formats and file size limits
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                                Accepted Formats
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {Array.isArray(documentType.accepted_formats) 
                                                    ? documentType.accepted_formats.map((format, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            <FileCode className="h-3 w-3 mr-1" />
                                                            {format.toUpperCase()}
                                                        </Badge>
                                                    ))
                                                    : typeof documentType.accepted_formats === 'string' 
                                                        ? documentType.accepted_formats.split(',').map((format, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                <FileCode className="h-3 w-3 mr-1" />
                                                                {format.trim().toUpperCase()}
                                                            </Badge>
                                                        ))
                                                        : <p className="text-sm text-muted-foreground">All formats accepted</p>
                                                }
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Max File Size
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-lg font-semibold">
                                                        {max_file_size_mb} MB
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({formatFileSize(documentType.max_file_size)})
                                                    </span>
                                                </div>
                                            </div>
                                            <Progress value={75} className="w-24 h-2" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Timestamps */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Timeline</CardTitle>
                                        <CardDescription>
                                            Creation and modification history
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        Created
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {formatDate(documentType.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        Last Updated
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {formatDate(documentType.updated_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Requirements Tab */}
                        <TabsContent value="requirements" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Clearance Types Requiring This Document</CardTitle>
                                    <CardDescription>
                                        {requiredClearanceTypes.length} clearance type(s) require this document
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {requiredClearanceTypes.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Sort Order</TableHead>
                                                    <TableHead>Required</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {requiredClearanceTypes.map((type) => (
                                                    <TableRow key={type.id}>
                                                        <TableCell className="font-mono text-sm">
                                                            {type.code}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {type.name}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {type.description || '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {type.is_active ? (
                                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                    Active
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                                                    Inactive
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{type.pivot?.sort_order || 0}</TableCell>
                                                        <TableCell>
                                                            {type.pivot?.is_required ? (
                                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-red-600" />
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                                <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">No Requirements Found</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                This document type is not required for any clearance types yet.
                                            </p>
                                            <Button variant="outline" asChild>
                                                <a href={route('clearance-types.index')}>
                                                    Manage Clearance Types
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Recent Applications Tab */}
                        <TabsContent value="applications" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Applications</CardTitle>
                                    <CardDescription>
                                        Latest clearance applications using this document
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentApplications.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Clearance Type</TableHead>
                                                    <TableHead>Applicant</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Submitted</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentApplications.map((app: any) => (
                                                    <TableRow key={app.id}>
                                                        <TableCell>#{app.id}</TableCell>
                                                        <TableCell>{app.clearance_type?.name}</TableCell>
                                                        <TableCell>{app.applicant?.name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={
                                                                app.status === 'approved' ? 'default' :
                                                                app.status === 'rejected' ? 'destructive' :
                                                                'outline'
                                                            }>
                                                                {app.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{formatDate(app.created_at)}</TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <a href={route('clearance-applications.show', app.id)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                                <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                                            <p className="text-sm text-muted-foreground">
                                                This document type hasn't been used in any applications.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Document Type Settings</CardTitle>
                                    <CardDescription>
                                        Configure additional settings for this document type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Status</p>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge()}
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={handleToggleStatus}
                                                >
                                                    Toggle Status
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Requirement</p>
                                            <div className="flex items-center gap-2">
                                                {getRequiredBadge()}
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={handleToggleRequired}
                                                >
                                                    Toggle Requirement
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-destructive">Danger Zone</p>
                                        <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium">Delete Document Type</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Once deleted, this action cannot be undone. 
                                                        {requiredClearanceTypes.length > 0 && (
                                                            <span className="text-destructive block mt-1">
                                                                Cannot delete because it is required by {requiredClearanceTypes.length} clearance type(s).
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setShowDeleteDialog(true)}
                                                disabled={requiredClearanceTypes.length > 0}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </TooltipProvider>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Document Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{documentType.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {requiredClearanceTypes.length > 0 && (
                        <div className="bg-destructive/10 p-3 rounded-lg">
                            <p className="text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 inline mr-1" />
                                This document type is required by {requiredClearanceTypes.length} clearance type(s). 
                                You must remove these requirements first.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting || requiredClearanceTypes.length > 0}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Duplicate Confirmation Dialog */}
            <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Duplicate Document Type</DialogTitle>
                        <DialogDescription>
                            Create a copy of "{documentType.name}"? The new document type will have "(Copy)" appended to its name.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDuplicateDialog(false)}
                            disabled={isDuplicating}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleDuplicate}
                            disabled={isDuplicating}
                        >
                            {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}