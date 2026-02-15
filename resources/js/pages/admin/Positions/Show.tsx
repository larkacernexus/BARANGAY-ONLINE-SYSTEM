// resources/js/Pages/admin/Positions/Show.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    ArrowLeft,
    Edit,
    Shield,
    Target,
    Users,
    Key,
    CheckCircle,
    XCircle,
    Calendar,
    Clock,
    Copy,
    Trash2,
    UserCheck,
    AlertTriangle,
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Committee {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
}

interface Role {
    id: number;
    name: string;
    description: string;
}

interface Official {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    is_active: boolean;
    start_date: string;
    end_date: string | null;
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
    committee?: Committee;
    role?: Role;
    officials?: Official[];
    officials_count?: number;
    all_committees?: Committee[];
}

interface PositionShowProps extends PageProps {
    position: Position;
}

export default function PositionShow({ position }: PositionShowProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = () => {
        if (position.officials_count && position.officials_count > 0) {
            alert('Cannot delete position with assigned officials. Please reassign or remove officials first.');
            return;
        }
        
        if (confirm('Are you sure you want to delete this position? This action cannot be undone.')) {
            router.delete(`/admin/positions/${position.id}`);
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

    const isKagawadPosition = position.name.toLowerCase().includes('kagawad') || 
                              position.code.toLowerCase().includes('kagawad');

    const getPrimaryCommittee = () => {
        return position.committee;
    };

    const getAdditionalCommittees = () => {
        if (!position.all_committees || !position.additional_committees) return [];
        return position.all_committees.filter(c => 
            position.additional_committees.includes(c.id)
        );
    };

    const getActiveOfficials = () => {
        return position.officials?.filter(o => o.is_active) || [];
    };

    const getInactiveOfficials = () => {
        return position.officials?.filter(o => !o.is_active) || [];
    };

    return (
        <AppLayout
            title={position.name}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Positions', href: '/admin/positions' },
                { title: position.name, href: `/admin/positions/${position.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/positions">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Positions
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <Shield className={`h-8 w-8 ${isKagawadPosition ? 'text-amber-600' : 'text-blue-600'}`} />
                                {position.name}
                                {isKagawadPosition && (
                                    <Badge variant="outline" className="ml-2 border-amber-300 text-amber-700">
                                        Kagawad
                                    </Badge>
                                )}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={position.is_active ? "default" : "secondary"} className="gap-1">
                                    {position.is_active ? (
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
                                {position.requires_account && (
                                    <Badge variant="outline" className="gap-1">
                                        <Key className="h-3 w-3" />
                                        Requires Account
                                    </Badge>
                                )}
                                <Badge variant="outline" className="gap-1">
                                    <Users className="h-3 w-3" />
                                    {position.officials_count || 0} Officials
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                    Order: #{position.order}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={position.officials_count && position.officials_count > 0}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        <Link href={`/admin/positions/${position.id}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Position
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="committees" className="gap-2">
                            <Target className="h-4 w-4" />
                            Committees
                        </TabsTrigger>
                        <TabsTrigger value="officials" className="gap-2">
                            <Users className="h-4 w-4" />
                            Officials ({position.officials_count || 0})
                        </TabsTrigger>
                    </TabsList>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Main Details */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Position Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Code Section */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-500">Position Code</h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(position.code)}
                                                className="h-6 text-xs"
                                            >
                                                {copied ? 'Copied!' : <Copy className="h-3 w-3 mr-1" />}
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            <code className="font-mono text-sm flex-1">{position.code}</code>
                                        </div>
                                    </div>

                                    {/* Description Section */}
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                        {position.description ? (
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-gray-700 whitespace-pre-line">{position.description}</p>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-gray-50 rounded-lg text-gray-500 italic">
                                                No description provided
                                            </div>
                                        )}
                                    </div>

                                    {/* System Role */}
                                    {position.role && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-gray-500">System Role</h3>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{position.role.name}</p>
                                                        {position.role.description && (
                                                            <p className="text-sm text-gray-600 mt-1">{position.role.description}</p>
                                                        )}
                                                    </div>
                                                    <Badge variant="outline">
                                                        <Key className="h-3 w-3 mr-1" />
                                                        System Role
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timestamps */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                Created Date
                                            </div>
                                            <p className="font-medium">{formatDate(position.created_at)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="h-4 w-4" />
                                                Last Updated
                                            </div>
                                            <p className="font-medium">{formatDate(position.updated_at)}</p>
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
                                            <span className="text-sm text-gray-600">Total Officials</span>
                                            <span className="font-bold text-lg">{position.officials_count || 0}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Display Order</span>
                                            <span className="font-bold text-lg">{position.order}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Committees</span>
                                            <span className="font-bold text-lg">
                                                {(position.committee ? 1 : 0) + (position.additional_committees?.length || 0)}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Account Required</span>
                                            <span className={`font-bold text-lg ${position.requires_account ? 'text-green-600' : 'text-gray-500'}`}>
                                                {position.requires_account ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Status</span>
                                            <span className={`font-bold text-lg ${position.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                                {position.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Link href={`/admin/officials/create?position_id=${position.id}`}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Assign Official
                                            </Button>
                                        </Link>
                                        
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => copyToClipboard(position.code)}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Position Code
                                        </Button>

                                        {position.is_active ? (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50"
                                                onClick={() => {
                                                    if (confirm('Set this position as inactive? It will not appear in selection lists.')) {
                                                        router.put(`/admin/positions/${position.id}`, {
                                                            is_active: false,
                                                        });
                                                    }
                                                }}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Deactivate Position
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => {
                                                    if (confirm('Set this position as active?')) {
                                                        router.put(`/admin/positions/${position.id}`, {
                                                            is_active: true,
                                                        });
                                                    }
                                                }}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Activate Position
                                            </Button>
                                        )}

                                        {position.requires_account ? (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50"
                                                onClick={() => {
                                                    if (confirm('Remove account requirement? Officials won\'t need user accounts.')) {
                                                        router.put(`/admin/positions/${position.id}`, {
                                                            requires_account: false,
                                                        });
                                                    }
                                                }}
                                            >
                                                <Key className="h-4 w-4 mr-2" />
                                                Remove Account Requirement
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => {
                                                    if (confirm('Add account requirement? Officials will need user accounts.')) {
                                                        router.put(`/admin/positions/${position.id}`, {
                                                            requires_account: true,
                                                        });
                                                    }
                                                }}
                                            >
                                                <Key className="h-4 w-4 mr-2" />
                                                Require Account
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Committees Tab */}
                    <TabsContent value="committees" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Primary Committee */}
                            {getPrimaryCommittee() ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-blue-600" />
                                            Primary Committee
                                        </CardTitle>
                                        <CardDescription>
                                            Main committee this position belongs to
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <h4 className="font-medium">{getPrimaryCommittee()!.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                                {getPrimaryCommittee()!.code}
                                                            </code>
                                                            <Badge variant={getPrimaryCommittee()!.is_active ? "default" : "secondary"} className="gap-1">
                                                                {getPrimaryCommittee()!.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-blue-600">
                                                        Primary
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Link href={`/admin/committees/${getPrimaryCommittee()!.id}`}>
                                                <Button variant="outline" className="w-full">
                                                    <Target className="h-4 w-4 mr-2" />
                                                    View Committee Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-dashed">
                                    <CardHeader>
                                        <CardTitle>No Primary Committee</CardTitle>
                                        <CardDescription>
                                            This position is not assigned to any primary committee
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-6 space-y-3">
                                            <Target className="h-12 w-12 mx-auto text-gray-400" />
                                            <div>
                                                <h4 className="font-medium text-gray-700">No primary committee</h4>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {isKagawadPosition && (
                                                        <span className="text-amber-600 block">
                                                            Kagawad positions usually have a primary committee
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <Link href={`/admin/positions/${position.id}/edit`}>
                                                <Button>
                                                    <Target className="h-4 w-4 mr-2" />
                                                    Assign Committee
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Additional Committees */}
                            <Card className={getAdditionalCommittees().length > 0 ? '' : 'border-dashed'}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-gray-600" />
                                            Additional Committees
                                        </span>
                                        <Badge variant="outline">
                                            {getAdditionalCommittees().length}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Other committees this position belongs to
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {getAdditionalCommittees().length > 0 ? (
                                        <div className="space-y-3">
                                            {getAdditionalCommittees().map((committee) => (
                                                <div 
                                                    key={committee.id}
                                                    className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <h4 className="font-medium">{committee.name}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                                    {committee.code}
                                                                </code>
                                                                <Badge variant={committee.is_active ? "default" : "secondary"} className="gap-1">
                                                                    {committee.is_active ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Link href={`/admin/committees/${committee.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                            <Link href={`/admin/positions/${position.id}/edit`}>
                                                <Button variant="outline" className="w-full mt-2">
                                                    <Target className="h-4 w-4 mr-2" />
                                                    Manage Committees
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 space-y-3">
                                            <Target className="h-12 w-12 mx-auto text-gray-400" />
                                            <div>
                                                <h4 className="font-medium text-gray-700">No additional committees</h4>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    This position only belongs to its primary committee
                                                </p>
                                            </div>
                                            <Link href={`/admin/positions/${position.id}/edit`}>
                                                <Button variant="outline">
                                                    <Target className="h-4 w-4 mr-2" />
                                                    Add Committees
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Officials Tab */}
                    <TabsContent value="officials" className="space-y-6">
                        {position.officials && position.officials.length > 0 ? (
                            <>
                                {/* Active Officials */}
                                {getActiveOfficials().length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-green-700">
                                                    <UserCheck className="h-5 w-5" />
                                                    Active Officials ({getActiveOfficials().length})
                                                </span>
                                                <Link href={`/admin/officials/create?position_id=${position.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                        Assign Official
                                                    </Button>
                                                </Link>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {getActiveOfficials().map((official) => (
                                                    <Link 
                                                        key={official.id} 
                                                        href={`/admin/officials/${official.id}`}
                                                        className="block"
                                                    >
                                                        <Card className="hover:bg-gray-50 cursor-pointer transition-colors border-green-100">
                                                            <CardContent className="p-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-start justify-between">
                                                                        <h5 className="font-medium">{official.full_name}</h5>
                                                                        <Badge className="gap-1">
                                                                            <CheckCircle className="h-3 w-3" />
                                                                            Active
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="space-y-1 text-sm text-gray-600">
                                                                        {official.email && (
                                                                            <p className="flex items-center gap-1">
                                                                                Email: {official.email}
                                                                            </p>
                                                                        )}
                                                                        {official.phone && (
                                                                            <p className="flex items-center gap-1">
                                                                                Phone: {official.phone}
                                                                            </p>
                                                                        )}
                                                                        <p className="flex items-center gap-1">
                                                                            Since: {new Date(official.start_date).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </Link>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Inactive Officials */}
                                {getInactiveOfficials().length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-gray-500">
                                                <XCircle className="h-5 w-5" />
                                                Inactive Officials ({getInactiveOfficials().length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {getInactiveOfficials().map((official) => (
                                                    <Link 
                                                        key={official.id} 
                                                        href={`/admin/officials/${official.id}`}
                                                        className="block"
                                                    >
                                                        <Card className="hover:bg-gray-50 cursor-pointer transition-colors opacity-75">
                                                            <CardContent className="p-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-start justify-between">
                                                                        <h5 className="font-medium text-gray-500">{official.full_name}</h5>
                                                                        <Badge variant="secondary" className="gap-1">
                                                                            <XCircle className="h-3 w-3" />
                                                                            Inactive
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="space-y-1 text-sm text-gray-500">
                                                                        {official.email && (
                                                                            <p>Email: {official.email}</p>
                                                                        )}
                                                                        {official.phone && (
                                                                            <p>Phone: {official.phone}</p>
                                                                        )}
                                                                        <p>
                                                                            Period: {new Date(official.start_date).toLocaleDateString()} - 
                                                                            {official.end_date ? ` ${new Date(official.end_date).toLocaleDateString()}` : ' Present'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </Link>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>No Officials Assigned</CardTitle>
                                    <CardDescription>
                                        This position doesn't have any officials assigned yet
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 space-y-4">
                                        <Users className="h-12 w-12 mx-auto text-gray-400" />
                                        <div>
                                            <h4 className="font-medium text-gray-700">No officials found</h4>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Assign an official to this position
                                            </p>
                                        </div>
                                        <Link href={`/admin/officials/create?position_id=${position.id}`}>
                                            <Button>
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Assign First Official
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

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
                                    <h4 className="font-medium text-red-800">Delete Position</h4>
                                    <p className="text-sm text-red-600">
                                        This will permanently delete the position.
                                        {position.officials_count && position.officials_count > 0 && (
                                            <span className="font-bold">
                                                {' '}Cannot delete while officials are assigned.
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={position.officials_count && position.officials_count > 0}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Position
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}