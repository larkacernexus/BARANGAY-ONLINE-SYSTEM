// resources/js/Pages/Admin/Permissions/components/access-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Shield,
    Users,
    Eye,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props {
    permission: any;
    roles: any[];
    users: any[];
    onContactDeveloper: () => void;
}

export const AccessTab = ({ permission, roles, users, onContactDeveloper }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Shield className="h-5 w-5" />
                            Access Information
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Who has access to this permission
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="roles" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 dark:bg-gray-700">
                        <TabsTrigger value="roles" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-300">
                            <Shield className="h-4 w-4 mr-2" />
                            Roles ({roles.length})
                        </TabsTrigger>
                        <TabsTrigger value="users" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-300">
                            <Users className="h-4 w-4 mr-2" />
                            Users ({users.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="roles">
                        {roles.length === 0 ? (
                            <div className="text-center py-8">
                                <Shield className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No roles have this permission</p>
                                <Button
                                    variant="outline"
                                    className="mt-4 dark:border-gray-600 dark:text-gray-300"
                                    onClick={() => router.visit(route('admin.roles.index'))}
                                >
                                    Go to Role Management
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                        onClick={() => router.visit(route('admin.roles.show', role.id))}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Shield className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium dark:text-gray-200">{role.display_name || role.name}</p>
                                                {role.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                                                )}
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {role.users_count || 0} users in this role
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="dark:text-gray-400 dark:hover:text-white">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Role
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="users">
                        {users.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No users have direct access to this permission</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                    Users gain access through their assigned roles
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                        onClick={() => router.visit(route('admin.users.show', user.id))}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 dark:bg-gray-700">
                                                <AvatarFallback className="dark:bg-gray-600 dark:text-gray-200">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium dark:text-gray-200">{user.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                                {user.position && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">{user.position}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {user.role_name && (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                                    {user.role_name}
                                                </Badge>
                                            )}
                                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? '' : 'dark:bg-gray-700 dark:text-gray-300'}>
                                                {user.status || 'Active'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};