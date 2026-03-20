import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Layers, MousePointer, Plus } from 'lucide-react';

interface HouseholdsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
}

export default function HouseholdsHeader({
    isBulkMode,
    setIsBulkMode,
}: HouseholdsHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Household Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Manage household registrations and information
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className={isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
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
                <Link href="/admin/households/create">
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Register Household
                    </Button>
                </Link>
            </div>
        </div>
    );
}