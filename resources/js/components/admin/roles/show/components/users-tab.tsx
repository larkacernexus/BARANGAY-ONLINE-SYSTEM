// resources/js/Pages/Admin/Roles/components/users-tab.tsx
import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Role } from '../types';

interface Props {
    role: Role;
    onCopyToClipboard: (text: string, label: string) => void;
    getStatusBadge: (status: string) => React.ReactNode;
    getInitials: (name: string) => string;
}

export const UsersTab = ({ role, onCopyToClipboard, getStatusBadge, getInitials }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Users className="h-5 w-5" />
                            Assigned Users
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            {role.users_count || 0} users assigned to this role
                        </CardDescription>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                            router.get(route('users.index'), { role: role.id });
                        }}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        View All Users
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {role.recent_users && role.recent_users.length > 0 ? (
                    <div className="space-y-4">
                        <div className="rounded-md border dark:border-gray-700">
                            <Table>
                                <TableHeader className="dark:bg-gray-900">
                                    <TableRow className="dark:border-gray-700">
                                        <TableHead className="dark:text-gray-300">User</TableHead>
                                        <TableHead className="dark:text-gray-300">Email</TableHead>
                                        <TableHead className="dark:text-gray-300">Username</TableHead>
                                        <TableHead className="dark:text-gray-300">Status</TableHead>
                                        <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {role.recent_users.map(user => (
                                        <TableRow key={user.id} className="dark:border-gray-700">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 dark:bg-gray-700">
                                                        <AvatarFallback className="dark:bg-gray-600 dark:text-gray-200">
                                                            {getInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium dark:text-gray-200">{user.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            ID: {user.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">{user.email}</TableCell>
                                            <TableCell className="dark:text-gray-300">{user.username}</TableCell>
                                            <TableCell>
                                                {getStatusBadge(user.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/users/${user.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 dark:text-gray-400 dark:hover:text-white">
                                                            <Eye className="h-3 w-3" />
                                                            <span className="sr-only">View</span>
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 dark:text-gray-400 dark:hover:text-white"
                                                        onClick={() => onCopyToClipboard(user.email, 'User email')}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                        <span className="sr-only">Copy email</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {role.users_count && role.users_count > (role.recent_users?.length || 0) && (
                            <div className="text-center pt-4">
                                <Button 
                                    variant="outline"
                                    onClick={() => {
                                        router.get(route('users.index'), { role: role.id });
                                    }}
                                    className="dark:border-gray-600 dark:text-gray-300"
                                >
                                    View all {role.users_count} users
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium dark:text-gray-100 mb-2">
                            No users assigned
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            No users have been assigned to this role yet.
                        </p>
                        <Button 
                            variant="outline"
                            onClick={() => {
                                router.get(route('users.index'), { assign_role: role.id });
                            }}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Assign Users
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};