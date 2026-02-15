// resources/js/Pages/admin/Committees/Show.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft,
    Edit,
    Target,
    Users,
    CheckCircle,
    XCircle,
    Calendar,
    Clock,
    Link as LinkIcon,
    Copy,
    Trash2,
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Position {
    id: number;
    code: string;
    name: string;
    is_active: boolean;
    requires_account: boolean;
    officials_count: number;
}

interface Committee {
    id: number;
    code: string;
    name: string;
    description: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    positions?: Position[];
    positions_count?: number;
}

interface CommitteeShowProps extends PageProps {
    committee: Committee;
}

export default function CommitteeShow({ committee }: CommitteeShowProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = () => {
        if (committee.positions_count && committee.positions_count > 0) {
            alert('Cannot delete committee with assigned positions. Please reassign or delete positions first.');
            return;
        }
        
        if (confirm('Are you sure you want to delete this committee? This action cannot be undone.')) {
            router.delete(`/admin/committees/${committee.id}`);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActivePositions = () => {
        return committee.positions?.filter(p => p.is_active) || [];
    };

    const getInactivePositions = () => {
        return committee.positions?.filter(p => !p.is_active) || [];
    };

    return (
        <AppLayout
            title={committee.name}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Committees', href: '/admin/committees' },
                { title: committee.name, href: `/admin/committees/${committee.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/committees">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Committees
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <Target className="h-8 w-8 text-blue-600" />
                                {committee.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={committee.is_active ? "default" : "secondary"} className="gap-1">
                                    {committee.is_active ? (
                                        <>
                                            <CheckCircle className="h-3 w-3" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-3 w-3" />
                                            Inactive
                                        </>
                                    )}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <Users className="h-3 w-3" />
                                    {committee.positions_count || 0} Positions
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={committee.positions_count && committee.positions_count > 0}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        <Link href={`/admin/committees/${committee.id}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Committee
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Committee Details */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Details Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Committee Details</span>
                                <Badge variant="outline" className="text-sm">
                                    Order: #{committee.order}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Code Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-500">Committee Code</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(committee.code)}
                                        className="h-6 text-xs"
                                    >
                                        {copied ? 'Copied!' : <Copy className="h-3 w-3 mr-1" />}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <code className="font-mono text-sm flex-1">{committee.code}</code>
                                    <LinkIcon className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                {committee.description ? (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-700 whitespace-pre-line">{committee.description}</p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-lg text-gray-500 italic">
                                        No description provided
                                    </div>
                                )}
                            </div>

                            {/* Timestamps */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        Created Date
                                    </div>
                                    <p className="font-medium">{formatDate(committee.created_at)}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        Last Updated
                                    </div>
                                    <p className="font-medium">{formatDate(committee.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats & Actions */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Positions</span>
                                    <span className="font-bold text-lg">{committee.positions_count || 0}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Active Positions</span>
                                    <span className="font-bold text-lg text-green-600">
                                        {getActivePositions().length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Inactive Positions</span>
                                    <span className="font-bold text-lg text-gray-500">
                                        {getInactivePositions().length}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Display Order</span>
                                    <span className="font-bold text-lg">{committee.order}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href={`/admin/positions/create?committee_id=${committee.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Users className="h-4 w-4 mr-2" />
                                        Add Position to Committee
                                    </Button>
                                </Link>
                                
                                <Link href={`/admin/positions?committee=${committee.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Target className="h-4 w-4 mr-2" />
                                        View All Positions
                                    </Button>
                                </Link>
                                
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => copyToClipboard(committee.code)}
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Committee Code
                                </Button>

                                {committee.is_active ? (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50"
                                        onClick={() => {
                                            if (confirm('Set this committee as inactive? It will not appear in selection lists.')) {
                                                router.put(`/admin/committees/${committee.id}`, {
                                                    is_active: false,
                                                });
                                            }
                                        }}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Deactivate Committee
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                                        onClick={() => {
                                            if (confirm('Set this committee as active?')) {
                                                router.put(`/admin/committees/${committee.id}`, {
                                                    is_active: true,
                                                });
                                            }
                                        }}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Activate Committee
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Positions Section */}
                {committee.positions && committee.positions.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Assigned Positions ({committee.positions.length})
                                </span>
                                <Link href={`/admin/positions/create?committee_id=${committee.id}`}>
                                    <Button variant="outline" size="sm">
                                        <Users className="h-4 w-4 mr-2" />
                                        Add Position
                                    </Button>
                                </Link>
                            </CardTitle>
                            <CardDescription>
                                Positions that are assigned to this committee
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Active Positions */}
                                {getActivePositions().length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-green-700 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Active Positions ({getActivePositions().length})
                                        </h4>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {getActivePositions().map((position) => (
                                                <Link 
                                                    key={position.id} 
                                                    href={`/admin/positions/${position.id}`}
                                                    className="block"
                                                >
                                                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors border-green-100">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="space-y-1">
                                                                    <h5 className="font-medium">{position.name}</h5>
                                                                    <div className="flex items-center gap-2">
                                                                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                                            {position.code}
                                                                        </code>
                                                                        {position.requires_account && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Requires Account
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <Badge className="gap-1">
                                                                    <Users className="h-3 w-3" />
                                                                    {position.officials_count}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Inactive Positions */}
                                {getInactivePositions().length > 0 && (
                                    <div className="space-y-3 pt-4 border-t">
                                        <h4 className="font-medium text-gray-500 flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            Inactive Positions ({getInactivePositions().length})
                                        </h4>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {getInactivePositions().map((position) => (
                                                <Link 
                                                    key={position.id} 
                                                    href={`/admin/positions/${position.id}`}
                                                    className="block"
                                                >
                                                    <Card className="hover:bg-gray-50 cursor-pointer transition-colors opacity-75">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="space-y-1">
                                                                    <h5 className="font-medium text-gray-500">{position.name}</h5>
                                                                    <div className="flex items-center gap-2">
                                                                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                                            {position.code}
                                                                        </code>
                                                                        {position.requires_account && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Requires Account
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <Badge variant="secondary" className="gap-1">
                                                                    <Users className="h-3 w-3" />
                                                                    {position.officials_count}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Positions Assigned</CardTitle>
                            <CardDescription>
                                This committee doesn't have any positions assigned yet
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 space-y-4">
                                <Target className="h-12 w-12 mx-auto text-gray-400" />
                                <div>
                                    <h4 className="font-medium text-gray-700">No positions found</h4>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Create a new position and assign it to this committee
                                    </p>
                                </div>
                                <Link href={`/admin/positions/create?committee_id=${committee.id}`}>
                                    <Button>
                                        <Users className="h-4 w-4 mr-2" />
                                        Create First Position
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Danger Zone */}
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-700">Danger Zone</CardTitle>
                        <CardDescription className="text-red-600">
                            Irreversible actions. Proceed with caution.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div className="space-y-1">
                                    <h4 className="font-medium text-red-800">Delete Committee</h4>
                                    <p className="text-sm text-red-600">
                                        This will permanently delete the committee and remove it from all assigned positions.
                                        {committee.positions_count && committee.positions_count > 0 && (
                                            <span className="font-bold">
                                                {' '}Cannot delete while positions are assigned.
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={committee.positions_count && committee.positions_count > 0}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Committee
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}