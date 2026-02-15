// components/admin/roles/RolesHeader.tsx
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Layers, MousePointer, Plus, Shield, Key } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RolesHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
}

export default function RolesHeader({
    isBulkMode,
    setIsBulkMode,
    isMobile
}: RolesHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Roles Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Manage user roles and their permissions
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
                        <p className="text-xs text-gray-500">Select multiple roles for batch operations</p>
                    </TooltipContent>
                </Tooltip>
                <Link href="/permissions">
                    <Button variant="outline" className="h-9">
                        <Key className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Permissions</span>
                        <span className="sm:hidden">Perms</span>
                    </Button>
                </Link>
                <Link href="/roles/create">
                    <Button className="h-9">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Create Role</span>
                        <span className="sm:hidden">Create</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}