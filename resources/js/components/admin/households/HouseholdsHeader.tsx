import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Layers, MousePointer, Plus } from 'lucide-react';

interface HouseholdsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
}

export default function HouseholdsHeader({
    isBulkMode,
    setIsBulkMode,
    isMobile
}: HouseholdsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Household Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    Manage household registrations and information
                </p>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className={`h-8 sm:h-9 flex-1 sm:flex-none ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                >
                    {isBulkMode ? (
                        <>
                            <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Bulk Mode</span>
                            <span className="sm:hidden">Bulk</span>
                        </>
                    ) : (
                        <>
                            <MousePointer className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Bulk Select</span>
                            <span className="sm:hidden">Select</span>
                        </>
                    )}
                </Button>
                <Link href="/households/create">
                    <Button className="h-8 sm:h-9 px-2 sm:px-4">
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Register Household</span>
                        <span className="sm:hidden">Register</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}