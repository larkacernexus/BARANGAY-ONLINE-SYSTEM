// resources/js/Pages/Admin/Positions/components/committees-tab.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Target,
    Eye,
} from 'lucide-react';
import { Position } from '../types';

interface Props {
    position: Position;
}

export const CommitteesTab = ({ position }: Props) => {
    const getPrimaryCommittee = () => {
        return position.committee;
    };

    const getAdditionalCommittees = () => {
        if (!position.all_committees || !position.additional_committees) return [];
        return position.all_committees.filter(c => 
            position.additional_committees.includes(c.id)
        );
    };

    const isKagawadPosition = position.name.toLowerCase().includes('kagawad') || 
                              position.code.toLowerCase().includes('kagawad');

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Primary Committee */}
            <Card className={`dark:bg-gray-900 ${!getPrimaryCommittee() ? 'border-dashed dark:border-gray-700' : ''}`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Primary Committee
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Main committee this position belongs to
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {getPrimaryCommittee() ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-medium dark:text-blue-300">{getPrimaryCommittee()!.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                                                {getPrimaryCommittee()!.code}
                                            </code>
                                            <Badge variant={getPrimaryCommittee()!.is_active ? "default" : "secondary"} className="gap-1 dark:bg-gray-700 dark:text-gray-300">
                                                {getPrimaryCommittee()!.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Badge className="bg-blue-600 dark:bg-blue-700">
                                        Primary
                                    </Badge>
                                </div>
                            </div>
                            <Link href={`/admin/committees/${getPrimaryCommittee()!.id}`}>
                                <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Committee Details
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-6 space-y-3">
                            <Target className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                            <div>
                                <h4 className="font-medium text-gray-700 dark:text-gray-300">No primary committee</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    {isKagawadPosition && (
                                        <span className="text-amber-600 dark:text-amber-400 block">
                                            Kagawad positions usually have a primary committee
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
                    )}
                </CardContent>
            </Card>

            {/* Additional Committees */}
            <Card className={`dark:bg-gray-900 ${getAdditionalCommittees().length === 0 ? 'border-dashed dark:border-gray-700' : ''}`}>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2 dark:text-gray-100">
                            <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            Additional Committees
                        </span>
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            {getAdditionalCommittees().length}
                        </Badge>
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Other committees this position belongs to
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {getAdditionalCommittees().length > 0 ? (
                        <div className="space-y-3">
                            {getAdditionalCommittees().map((committee) => (
                                <div 
                                    key={committee.id}
                                    className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h4 className="font-medium dark:text-gray-200">{committee.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded dark:text-gray-300">
                                                    {committee.code}
                                                </code>
                                                <Badge variant={committee.is_active ? "default" : "secondary"} className="gap-1 dark:bg-gray-700 dark:text-gray-300">
                                                    {committee.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Link href={`/admin/committees/${committee.id}`}>
                                            <Button variant="ghost" size="sm" className="dark:text-gray-400 dark:hover:text-white">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            <Link href={`/admin/positions/${position.id}/edit`}>
                                <Button variant="outline" className="w-full mt-2 dark:border-gray-600 dark:text-gray-300">
                                    <Target className="h-4 w-4 mr-2" />
                                    Manage Committees
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-6 space-y-3">
                            <Target className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                            <div>
                                <h4 className="font-medium text-gray-700 dark:text-gray-300">No additional committees</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    This position only belongs to its primary committee
                                </p>
                            </div>
                            <Link href={`/admin/positions/${position.id}/edit`}>
                                <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                    <Target className="h-4 w-4 mr-2" />
                                    Add Committees
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};