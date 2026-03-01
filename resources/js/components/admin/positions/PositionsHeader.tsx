import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    Shield,
    MousePointer,
    Layers,
    Plus
} from 'lucide-react';

interface PositionsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
}

export default function PositionsHeader({ 
    isBulkMode, 
    setIsBulkMode, 
    isMobile
}: PositionsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Position Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Manage barangay official positions and their committee assignments
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
                <Link href="/admin/positions/create">
                    <Button className="h-9">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add Position</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}