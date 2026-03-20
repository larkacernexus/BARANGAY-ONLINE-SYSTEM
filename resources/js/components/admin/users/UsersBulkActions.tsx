import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  Send,
  Trash2,
  Edit,
  Mail,
  Shield,
  Key,
  X,
  PackageCheck,
  PackageX,
  ClipboardCopy,
  Layers
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { toast } from 'sonner';

interface UsersBulkActionsProps {
  selectedUsers: number[];
  selectedUsersData: any[];
  setShowBulkDeleteDialog: (show: boolean) => void;
  setShowBulkStatusDialog: (show: boolean) => void;
  setShowBulkRoleDialog: (show: boolean) => void;
  setIsBulkMode: (value: boolean) => void;
  bulkActions: any;
  onClearSelection: () => void;
  onSelectAllOnPage: () => void;
}

export default function UsersBulkActions({
  selectedUsers,
  selectedUsersData,
  setShowBulkDeleteDialog,
  setShowBulkStatusDialog,
  setShowBulkRoleDialog,
  setIsBulkMode,
  bulkActions,
  onClearSelection,
  onSelectAllOnPage
}: UsersBulkActionsProps) {
  const [showMoreActions, setShowMoreActions] = useState(false);

  const selectionStats = {
    total: selectedUsersData.length,
    active: selectedUsersData.filter(u => u.status === 'active').length,
    inactive: selectedUsersData.filter(u => u.status === 'inactive').length,
    admins: selectedUsersData.filter(u => u.role_id === 1).length,
    twoFactorEnabled: selectedUsersData.filter(u => u.two_factor_confirmed_at !== null).length,
    differentRoles: new Set(selectedUsersData.map(u => u.role?.name)).size,
  };

  const handleCopyData = () => {
    if (selectedUsersData.length === 0) {
      toast.error('No data to copy');
      return;
    }
    
    const data = selectedUsersData.map(user => ({
      Name: user.first_name ? `${user.first_name} ${user.last_name}`.trim() : user.email,
      Email: user.email,
      Role: user.role?.name || 'N/A',
      Department: user.department?.name || 'N/A',
      Status: user.status,
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    navigator.clipboard.writeText(csv).then(() => {
      toast.success('Selected data copied to clipboard as CSV');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border">
            <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-sm">
              {selectedUsers.length} selected
            </span>
            <Badge variant="outline" className="ml-1 h-5 text-xs">
              Page
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <PackageX className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyData}
                  className="h-7"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Copy selected data as CSV
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSelectAllOnPage}
                  className="h-7"
                >
                  <Layers className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Select/Deselect Page
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            {bulkActions.primary.map((action: any, index: number) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={action.onClick}
                    className="h-8"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {action.tooltip}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          
          <div className="relative">
            <Button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Layers className="h-3.5 w-3.5 mr-1" />
              More
            </Button>
            
            {showMoreActions && (
              <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-900 border rounded-md shadow-lg">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                    BULK ACTIONS
                  </div>
                  {bulkActions.secondary.map((action: any, index: number) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-8 text-sm"
                      onClick={action.onClick}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                  <div className="border-t my-1"></div>
                  {bulkActions.destructive.map((action: any, index: number) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={action.onClick}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            className="h-8"
            onClick={() => setIsBulkMode(false)}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Exit
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      {selectedUsersData.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectionStats.total} users</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{selectionStats.active} active</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{selectionStats.admins} admins</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{selectionStats.twoFactorEnabled} 2FA</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}