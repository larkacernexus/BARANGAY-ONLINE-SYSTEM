// resources/js/components/admin/community-reports/show/components/similar-reports-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ChevronRight, Layers } from 'lucide-react';
import { CommunityReport } from '@/types/admin/reports/community-report';

interface SimilarReportsCardProps {
    similarReports: CommunityReport[];
    getStatusColor: (status: string | null | undefined) => string;
    formatDate: (date: string | null | undefined) => string;
}

export function SimilarReportsCard({ similarReports, getStatusColor, formatDate }: SimilarReportsCardProps) {
    if (!similarReports || similarReports.length === 0) {
        return null;
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 flex items-center justify-center">
                        <Layers className="h-3 w-3 text-white" />
                    </div>
                    Similar Reports
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Recently reported similar issues
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {similarReports.slice(0, 3).map((similar) => (
                    <Link
                        key={similar.id}
                        href={route('admin.community-reports.show', similar.id)}
                        className="block"
                    >
                        <div className="p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge className={`${getStatusColor(similar.status)} text-xs`}>
                                        {similar.status?.charAt(0).toUpperCase()}
                                    </Badge>
                                    <span className="text-xs font-medium truncate dark:text-gray-300">#{similar.report_number}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{similar.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatDate(similar.created_at)}</p>
                        </div>
                    </Link>
                ))}
                {similarReports.length > 3 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs sm:text-sm dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => router.visit(route('admin.community-reports.related', similarReports[0].id))}
                    >
                        View All ({similarReports.length})
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}