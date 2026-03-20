// resources/js/Pages/Admin/Positions/components/officials-tab.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    UserPlus,
    UserCheck,
    XCircle,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
} from 'lucide-react';
import { Position, Official } from '../types';
import { formatShortDate } from '@/components/admin/positions/show/utils/helpers';

interface Props {
    position: Position;
}

export const OfficialsTab = ({ position }: Props) => {
    const getActiveOfficials = (): Official[] => {
        return position.officials?.filter(o => o.is_active) || [];
    };

    const getInactiveOfficials = (): Official[] => {
        return position.officials?.filter(o => !o.is_active) || [];
    };

    if (!position.officials || position.officials.length === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Users className="h-5 w-5" />
                        No Officials Assigned
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        This position doesn't have any officials assigned yet
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 space-y-4">
                        <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                        <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">No officials found</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Assign an official to this position
                            </p>
                        </div>
                        <Link href={`/admin/officials/create?position_id=${position.id}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign First Official
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const activeOfficials = getActiveOfficials();
    const inactiveOfficials = getInactiveOfficials();

    return (
        <div className="space-y-6">
            {/* Active Officials */}
            {activeOfficials.length > 0 && (
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <UserCheck className="h-5 w-5" />
                                Active Officials ({activeOfficials.length})
                            </span>
                            <Link href={`/admin/officials/create?position_id=${position.id}`}>
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Assign Official
                                </Button>
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {activeOfficials.map((official) => (
                                <Link 
                                    key={official.id} 
                                    href={`/admin/officials/${official.id}`}
                                    className="block"
                                >
                                    <Card className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border-green-100 dark:border-green-900">
                                        <CardContent className="p-4">
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <h5 className="font-medium dark:text-gray-200">{official.full_name}</h5>
                                                    <Badge className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Active
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    {official.email && (
                                                        <p className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {official.email}
                                                        </p>
                                                    )}
                                                    {official.phone && (
                                                        <p className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {official.phone}
                                                        </p>
                                                    )}
                                                    <p className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Since: {formatShortDate(official.start_date)}
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
            {inactiveOfficials.length > 0 && (
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <XCircle className="h-5 w-5" />
                            Inactive Officials ({inactiveOfficials.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {inactiveOfficials.map((official) => (
                                <Link 
                                    key={official.id} 
                                    href={`/admin/officials/${official.id}`}
                                    className="block"
                                >
                                    <Card className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors opacity-75">
                                        <CardContent className="p-4">
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <h5 className="font-medium text-gray-500 dark:text-gray-400">{official.full_name}</h5>
                                                    <Badge variant="secondary" className="gap-1 dark:bg-gray-700 dark:text-gray-300">
                                                        <XCircle className="h-3 w-3" />
                                                        Inactive
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-500">
                                                    {official.email && (
                                                        <p className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {official.email}
                                                        </p>
                                                    )}
                                                    {official.phone && (
                                                        <p className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {official.phone}
                                                        </p>
                                                    )}
                                                    <p className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Period: {formatShortDate(official.start_date)} - 
                                                        {official.end_date ? ` ${formatShortDate(official.end_date)}` : ' Present'}
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
        </div>
    );
};