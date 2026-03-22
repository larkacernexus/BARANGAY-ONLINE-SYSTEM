// resources/js/components/admin/households/HouseholdsHeader.tsx
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Users, Plus, CheckSquare, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface HouseholdsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    // Remove isMobile if not needed, or add it if the component uses it
    // isMobile?: boolean;
}

export default function HouseholdsHeader({ isBulkMode, setIsBulkMode }: HouseholdsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Households</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage and organize all households in the community
                </p>
            </div>
            <div className="flex items-center gap-2">
                {!isBulkMode ? (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBulkMode(true)}
                            className="gap-2"
                        >
                            <CheckSquare className="h-4 w-4" />
                            Bulk Actions
                        </Button>
                        <Link href="/admin/households/create">
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Household
                            </Button>
                        </Link>
                    </>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsBulkMode(false)}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Exit Bulk Mode
                    </Button>
                )}
            </div>
        </div>
    );
}