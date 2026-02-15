import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    FileText, 
    CheckCircle, 
    XCircle, 
    Folder,
    AlertCircle,
    HardDrive,
    FileType
} from 'lucide-react';

interface DocumentTypesStatsProps {
    stats: {
        total: number;
        active: number;
        required: number;
        optional: number;
        max_file_size_mb: number;
        has_formats: number;
    };
    categoryCounts: Record<number, number>;
    categories: Array<{ id: number; name: string; slug: string }>;
}

export default function DocumentTypesStats({ 
    stats, 
    categoryCounts, 
    categories 
}: DocumentTypesStatsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        Total Types
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.total.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.active} active • {stats.total - stats.active} inactive
                    </div>
                </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Required
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {stats.required.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.optional} optional
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <Folder className="h-4 w-4 mr-2 text-purple-500" />
                        Categories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">
                        {categories.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Active categories
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <FileType className="h-4 w-4 mr-2 text-indigo-500" />
                        Has Formats
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">
                        {stats.has_formats.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        With format restrictions
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <HardDrive className="h-4 w-4 mr-2 text-amber-500" />
                        Max Size
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">
                        {stats.max_file_size_mb} MB
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Maximum file size
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                        Inactive
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">
                        {(stats.total - stats.active).toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Disabled document types
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}