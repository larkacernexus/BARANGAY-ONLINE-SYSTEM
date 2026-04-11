// components/admin/users/UsersHeader.tsx
import { Button } from '@/components/ui/button';
import { Plus, Layers, MousePointer } from 'lucide-react';

interface UsersHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile?: boolean;
}

export default function UsersHeader({
    isBulkMode,
    setIsBulkMode,
    isMobile = false
}: UsersHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage user accounts and access permissions
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsBulkMode(!isBulkMode);
                    }}
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
                <Button asChild>
                    <a href="/admin/users/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </a>
                </Button>
            </div>
        </div>
    );
}