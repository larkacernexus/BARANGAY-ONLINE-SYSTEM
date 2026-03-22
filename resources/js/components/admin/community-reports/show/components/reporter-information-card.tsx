// resources/js/components/admin/community-reports/show/components/reporter-information-card.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, Home, EyeOff, Shield, ShieldAlert } from 'lucide-react';
import { CommunityReport } from '@/components/admin/community-reports/show/components/types';

interface ReporterInformationCardProps {
    report: CommunityReport;
    getDisplayName: (person: any) => string;
}

export function ReporterInformationCard({ report, getDisplayName }: ReporterInformationCardProps) {
    if (!report.is_anonymous && report.user) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                            <User className="h-3 w-3 text-white" />
                        </div>
                        Reporter Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Details of the resident who submitted the report
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0">
                            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium dark:text-gray-200">
                                {getDisplayName(report.user)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {report.user.purok ? `Purok ${report.user.purok}` : 'No purok specified'}
                                {report.user.username && <span className="ml-2 text-blue-500 dark:text-blue-400">@{report.user.username}</span>}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.user.contact_number && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <p className="text-sm dark:text-gray-300">{report.user.contact_number}</p>
                            </div>
                        )}
                        {report.user.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <p className="text-sm dark:text-gray-300">{report.user.email}</p>
                            </div>
                        )}
                        {report.user.address && (
                            <div className="flex items-center gap-2 md:col-span-2">
                                <Home className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <p className="text-sm dark:text-gray-300">{report.user.address}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end border-t dark:border-gray-700 pt-4">
                    {report.user.contact_number && (
                        <a href={`tel:${report.user.contact_number}`}>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300">
                                <Phone className="h-4 w-4 mr-2" />
                                Call Reporter
                            </Button>
                        </a>
                    )}
                    {report.user.email && (
                        <a href={`mailto:${report.user.email}`}>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                            </Button>
                        </a>
                    )}
                </CardFooter>
            </Card>
        );
    }

    if (report.is_anonymous && (report.reporter_name || report.reporter_contact || report.reporter_address)) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700 flex items-center justify-center">
                            <EyeOff className="h-3 w-3 text-white" />
                        </div>
                        Anonymous Reporter
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Limited contact information provided
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {report.reporter_name && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</p>
                            <p className="text-sm dark:text-gray-300">{report.reporter_name}</p>
                        </div>
                    )}
                    {report.reporter_contact && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact</p>
                            <p className="text-sm dark:text-gray-300">{report.reporter_contact}</p>
                        </div>
                    )}
                    {report.reporter_address && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address</p>
                            <p className="text-sm dark:text-gray-300">{report.reporter_address}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                        <Shield className="h-3 w-3 text-white" />
                    </div>
                    Completely Anonymous
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    No contact information provided
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                        This report was submitted completely anonymously. No personal information is available.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}