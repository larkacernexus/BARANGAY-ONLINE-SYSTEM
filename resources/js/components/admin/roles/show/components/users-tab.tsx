// resources/js/Pages/Admin/Roles/components/users-tab.tsx
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Users,
    Eye,
    Copy,
    UserCheck,
    Mail,
    Phone,
    Calendar,
    MoreVertical,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { route } from 'ziggy-js';
import { Role, User } from '@/types/admin/roles/roles';

interface UsersTabProps {
    role: Role;
    onCopyToClipboard: (text: string, label: string) => void;
    getStatusBadge: (status: string) => { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string };
    getInitials: (name: string) => string;
}

export const UsersTab = ({ role, onCopyToClipboard, getStatusBadge, getInitials }: UsersTabProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Safe access with fallbacks
    const usersCount = role.users_count ?? 0;
    const recentUsers = (role as any).recent_users ?? [];
    const hasUsers = usersCount > 0;
    const hasMoreUsers = usersCount > recentUsers.length;

    // Filter users based on search term
    const filteredUsers = searchTerm
        ? recentUsers.filter((user: User) => 
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user as any).username?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : recentUsers;

    const handleAssignUsers = () => {
        router.get(route('users.index'), { assign_role: role.id });
    };

    const handleViewAllUsers = () => {
        router.get(route('users.index'), { role: role.id });
    };

    const handleViewUser = (userId: number) => {
        router.get(route('users.show', userId));
    };

    const handleEditUser = (userId: number) => {
        router.get(route('users.edit', userId));
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return <CheckCircle className="h-3 w-3" />;
            case 'inactive':
                return <XCircle className="h-3 w-3" />;
            case 'suspended':
                return <AlertCircle className="h-3 w-3" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Users className="h-5 w-5 text-blue-500" />
                            Assigned Users
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            {usersCount} user{usersCount !== 1 ? 's' : ''} assigned to this role
                            {hasMoreUsers && ` (showing ${recentUsers.length} most recent)`}
                        </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {hasUsers && (
                            <div className="relative">
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 sm:w-60 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                                />
                            </div>
                        )}
                        
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleViewAllUsers}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View All
                        </Button>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent>
                {hasUsers ? (
                    filteredUsers.length > 0 ? (
                        <div className="space-y-4">
                            <div className="rounded-md border dark:border-gray-700 overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                                        <TableRow className="dark:border-gray-700">
                                            <TableHead className="dark:text-gray-300">User</TableHead>
                                            <TableHead className="dark:text-gray-300 hidden md:table-cell">Email</TableHead>
                                            <TableHead className="dark:text-gray-300 hidden lg:table-cell">Username</TableHead>
                                            <TableHead className="dark:text-gray-300">Status</TableHead>
                                            <TableHead className="dark:text-gray-300 hidden xl:table-cell">Joined</TableHead>
                                            <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user: User & { username?: string; status?: string }) => (
                                            <TableRow 
                                                key={user.id} 
                                                className="dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                                onClick={() => handleViewUser(user.id)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 dark:bg-gray-700">
                                                            {(user as any).avatar && (
                                                                <AvatarImage src={(user as any).avatar} alt={user.name} />
                                                            )}
                                                            <AvatarFallback className="dark:bg-gray-600 dark:text-gray-200 text-xs">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium dark:text-gray-200 text-sm">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                                                                {user.email}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                ID: {user.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="dark:text-gray-300 hidden md:table-cell">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3 text-gray-400" />
                                                        <span className="text-sm">{user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="dark:text-gray-300 hidden lg:table-cell">
                                                    {user.username || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {user.status && (
                                                        <div className="flex items-center gap-1">
                                                            {getStatusIcon(user.status)}
                                                            <Badge 
                                                                variant="outline"
                                                                className={`text-xs ${getStatusBadge(user.status).className}`}
                                                            >
                                                                {user.status}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="dark:text-gray-300 hidden xl:table-cell text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-gray-400" />
                                                        <span>{formatDate(user.created_at)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onCopyToClipboard(user.email, 'User email');
                                                                        }}
                                                                    >
                                                                        <Copy className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Copy email</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Profile
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                                                    <UserCheck className="h-4 w-4 mr-2" />
                                                                    Edit User
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => onCopyToClipboard(user.name, 'User name')}>
                                                                    <Copy className="h-4 w-4 mr-2" />
                                                                    Copy Name
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => onCopyToClipboard(user.email, 'User email')}>
                                                                    <Mail className="h-4 w-4 mr-2" />
                                                                    Copy Email
                                                                </DropdownMenuItem>
                                                                {(user as any).phone && (
                                                                    <DropdownMenuItem onClick={() => onCopyToClipboard((user as any).phone, 'Phone number')}>
                                                                        <Phone className="h-4 w-4 mr-2" />
                                                                        Copy Phone
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {hasMoreUsers && (
                                <div className="text-center pt-4">
                                    <Button 
                                        variant="outline"
                                        onClick={handleViewAllUsers}
                                        className="dark:border-gray-600 dark:text-gray-300"
                                    >
                                        View all {usersCount} users
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            )}

                            {searchTerm && filteredUsers.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No users match your search criteria.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                No users match your search criteria.
                            </p>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSearchTerm('')}
                                className="mt-2"
                            >
                                Clear Search
                            </Button>
                        </div>
                    )
                ) : (
                    <div className="text-center py-12">
                        <div className="h-20 w-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Users className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium dark:text-gray-100 mb-2">
                            No users assigned
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                            No users have been assigned to this role yet. 
                            Assign users to control who has these permissions.
                        </p>
                        {!role.is_system_role && (
                            <Button 
                                variant="outline"
                                onClick={handleAssignUsers}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Assign Users
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};