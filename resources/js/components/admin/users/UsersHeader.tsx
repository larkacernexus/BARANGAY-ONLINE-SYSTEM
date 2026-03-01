import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Plus, Layers, MousePointer } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface UsersHeaderProps {
  isBulkMode: boolean;
  setIsBulkMode: (value: boolean) => void;
}

export default function UsersHeader({ isBulkMode, setIsBulkMode }: UsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          Manage user accounts and access permissions
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
            <p className="text-xs text-gray-500">Select multiple users for batch operations</p>
          </TooltipContent>
        </Tooltip>
        <Link href="/admin/users/create">
          <Button className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}