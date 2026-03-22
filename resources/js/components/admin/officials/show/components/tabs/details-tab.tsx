// components/admin/officials/show/components/tabs/details-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Mail, Phone, MapPin, Award, Clock, CheckCircle, XCircle, Shield, Hash } from 'lucide-react';

interface DetailsTabProps {
    official: any; // Replace with proper type
    formatDate: (date: string | null, includeTime?: boolean) => string;
    getStatusColor?: (status: string) => string;
    getStatusIcon?: (status: string) => React.ReactNode;
}

export const DetailsTab = ({ official, formatDate, getStatusColor, getStatusIcon }: DetailsTabProps) => {
    return (
        <div className="space-y-6">
            {/* Official Details Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <User className="h-5 w-5" />
                        Official Details
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Complete information about this official
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Position Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</p>
                            <div className="mt-1 flex items-center gap-2">
                                <Award className="h-4 w-4 text-gray-400" />
                                <p className="text-gray-900 dark:text-gray-100">{official.position?.name || 'N/A'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Position Code</p>
                            <div className="mt-1 flex items-center gap-2">
                                <Hash className="h-4 w-4 text-gray-400" />
                                <code className="text-sm">{official.position?.code || 'N/A'}</code>
                            </div>
                        </div>
                    </div>

                    {/* Status Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                            <div className="mt-1">
                                <Badge className={getStatusColor?.(official.status)}>
                                    {getStatusIcon?.(official.status)}
                                    <span className="ml-1 capitalize">{official.status}</span>
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Account</p>
                            <div className="mt-1 flex items-center gap-2">
                                {official.user ? (
                                    <>
                                        <Shield className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-gray-900 dark:text-gray-100">Linked</span>
                                        <span className="text-xs text-gray-500">({official.user.email})</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">No account linked</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeline</p>
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Started on:</span>
                                <span className="font-medium dark:text-gray-200">
                                    {formatDate(official.start_date, true)}
                                </span>
                            </div>
                            {official.end_date && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Ended on:</span>
                                    <span className="font-medium dark:text-gray-200">
                                        {formatDate(official.end_date, true)}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                <span className="font-medium dark:text-gray-200">
                                    {formatDate(official.created_at, true)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                <span className="font-medium dark:text-gray-200">
                                    {formatDate(official.updated_at, true)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};