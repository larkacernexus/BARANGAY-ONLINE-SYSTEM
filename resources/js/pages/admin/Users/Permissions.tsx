// resources/js/Pages/Admin/Users/Permissions.tsx
import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface UserPermissionsProps {
    user: {
        id: number;
        name: string;
        email: string;
        role_id: number | null;
        role_name: string | null;
    };
    roles: Array<{
        id: number;
        name: string;
        description: string | null;
        permissions_count: number;
    }>;
    userPermissions: Array<{
        id: number;
        name: string;
        display_name: string;
        module: string;
    }>;
    allPermissions: Array<{
        id: number;
        name: string;
        display_name: string;
        module: string;
    }>;
}

export default function UserPermissions({ user, roles, userPermissions, allPermissions }: UserPermissionsProps) {
    const [selectedRoleId, setSelectedRoleId] = useState(user.role_id);
    const [customPermissions, setCustomPermissions] = useState(
        userPermissions.map(p => p.id)
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        router.put(route('users.update-permissions', user.id), {
            role_id: selectedRoleId,
            custom_permissions: customPermissions,
        });
    };

    const toggleCustomPermission = (permissionId: number) => {
        setCustomPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    return (
        <AdminLayout>
            <Head title={`Permissions - ${user.name}`} />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                User Permissions: {user.name}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage permissions for {user.email}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User Role
                                </label>
                                <select
                                    value={selectedRoleId || ''}
                                    onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="">No Role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name} ({role.permissions_count} permissions)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Permissions */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Custom Permissions (Override)
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {customPermissions.length} selected
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allPermissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`permission-${permission.id}`}
                                                checked={customPermissions.includes(permission.id)}
                                                onChange={() => toggleCustomPermission(permission.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label
                                                htmlFor={`permission-${permission.id}`}
                                                className="ml-2 text-sm text-gray-700"
                                            >
                                                <div className="font-medium">{permission.display_name}</div>
                                                <div className="text-xs text-gray-500">{permission.module}</div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-6 border-t">
                                <Link
                                    href={route('users.show', user.id)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Save Permissions
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}