import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Zap, DownloadIcon, FolderOpen } from 'lucide-react';

interface FormsStatsProps {
    stats: {
        total: number;
        active: number;
        downloads: number;
        categories_count: number;
        agencies_count: number;
    };
}

export default function FormsStats({ stats }: FormsStatsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Total Forms
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Add fallback value */}
                    <div className="text-xl sm:text-2xl font-bold">
                        {(stats.total || 0).toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.categories_count || 0} categories • {stats.agencies_count || 0} agencies
                    </div>
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Active Forms
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Add fallback here too */}
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {stats.active || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Available for download
                    </div>
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <DownloadIcon className="h-4 w-4" />
                        Total Downloads
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Add fallback here */}
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {(stats.downloads || 0).toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        All time downloads
                    </div>
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Categories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Add fallback here */}
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">
                        {stats.categories_count || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Different form categories
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}