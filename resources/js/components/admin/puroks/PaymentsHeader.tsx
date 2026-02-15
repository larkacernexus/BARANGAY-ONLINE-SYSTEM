import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    MapPin,
    MousePointer,
    Layers,
    Plus,
    RefreshCw
} from 'lucide-react';

interface PuroksHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
    onUpdateStatistics: () => void;
}

export default function PuroksHeader({ 
    isBulkMode, 
    setIsBulkMode, 
    isMobile,
    onUpdateStatistics 
}: PuroksHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Purok Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Manage barangay puroks/zones and their information
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className={`h-9 ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                >
                    {isBulkMode ? (
                        <>
                            <Layers className="h-4 w-4 mr-2" />
                            Bulk Mode
                        </>
                    ) : (
                        <>
                            <MousePointer className="h-4 w-4 mr-2" />
                            Bulk Select
                        </>
                    )}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={onUpdateStatistics}
                    className="h-9"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Update Stats</span>
                    <span className="sm:hidden">Stats</span>
                </Button>
                <Link href="/puroks/create">
                    <Button className="h-9">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add Purok</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}