// resources/js/Pages/Admin/Positions/components/committees-tab.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Target,
    Eye,
    Building2,
    Calendar,
} from 'lucide-react';
import { Position } from '@/types/admin/positions/position.types';

interface Props {
    position: Position;
}

export const CommitteesTab = ({ position }: Props) => {
    const hasCommittee = position.committee !== null && position.committee !== undefined;

    const isKagawadPosition = position.name?.toLowerCase().includes('kagawad') || 
                              position.code?.toLowerCase().includes('kagawad');

    if (!hasCommittee) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        No Committee Assigned
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        This position is not assigned to any committee
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 space-y-3">
                        <Building2 className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                        <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">No committee assigned</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {isKagawadPosition && (
                                    <span className="text-amber-600 dark:text-amber-400 block">
                                        Kagawad positions should be assigned to a committee
                                    </span>
                                )}
                            </p>
                        </div>
                        <Link href={`/admin/positions/${position.id}/edit`}>
                            <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                <Target className="h-4 w-4 mr-2" />
                                Assign Committee
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Safe access with non-null assertion since we already checked
    const committee = position.committee!;

    return (
        <div className="grid gap-6">
            {/* Committee Information */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Committee Assignment
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Committee this position belongs to
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-lg dark:text-blue-300">
                                            {committee.name}
                                        </h4>
                                        <Badge 
                                            variant={committee.is_active ? "default" : "secondary"} 
                                            className="mt-2 gap-1 dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            {committee.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <Badge className="bg-blue-600 dark:bg-blue-700">
                                        Assigned
                                    </Badge>
                                </div>
                                
                                {committee.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {committee.description}
                                    </p>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-200 dark:border-blue-700">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Created
                                        </dt>
                                        <dd className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                            {new Date(committee.created_at).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Last Updated
                                        </dt>
                                        <dd className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                            {new Date(committee.updated_at).toLocaleDateString()}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link href={`/admin/committees/${committee.id}`}>
                            <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300">
                                <Eye className="h-4 w-4 mr-2" />
                                View Committee Details
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};