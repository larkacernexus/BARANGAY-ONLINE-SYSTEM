import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Mail,
  Copy,
  User as UserIcon,
  CheckSquare,
  Square,
  Lock,
  Unlock,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/types/admin/users/user-types';
import { JSX } from 'react';

interface UsersTableRowProps {
  user: User;
  isBulkMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  getFullName: (user: User) => string;
  truncateText: (text: any, maxLength?: number) => string;
  truncateEmail: (email: any, maxLength?: number) => string;
  getStatusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
  getStatusIcon: (status: string) => JSX.Element | null;
  getRoleBadgeVariant: (roleName: string | undefined) => "default" | "secondary" | "destructive" | "outline";
  formatDate: (dateString: string | null) => string;
  onDelete?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onSendMessage?: (user: User) => void;
  onCopyToClipboard?: (text: string, label: string) => void;
}

export default function UsersTableRow({
  user,
  isBulkMode,
  isSelected,
  onSelect,
  isExpanded,
  onToggleExpand,
  getFullName,
  truncateText,
  truncateEmail,
  getStatusBadgeVariant,
  getStatusIcon,
  getRoleBadgeVariant,
  formatDate,
  onDelete,
  onToggleStatus,
  onSendMessage,
  onCopyToClipboard
}: UsersTableRowProps) {
  const fullName = getFullName(user);
  const roleName = user.role?.name || 'N/A';
  const departmentName = user.department?.name || 'N/A';

  // Safe text display with fallback for any type
  const safeTruncate = (value: any, maxLength?: number): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return truncateText(value, maxLength);
    if (typeof value === 'number') return truncateText(String(value), maxLength);
    if (typeof value === 'boolean') return truncateText(String(value), maxLength);
    if (typeof value === 'object') {
      try {
        return truncateText(JSON.stringify(value), maxLength);
      } catch {
        return truncateText(String(value), maxLength);
      }
    }
    return truncateText(String(value), maxLength);
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    if (onCopyToClipboard) {
      onCopyToClipboard(text, label);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        toast.success(`${label} copied to clipboard`);
      }).catch(() => {
        toast.error('Failed to copy to clipboard');
      });
    }
  };

  return (
    <TableRow 
      className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={(e) => {
        if (isBulkMode && e.target instanceof HTMLElement && 
            !e.target.closest('a') && 
            !e.target.closest('button') &&
            !e.target.closest('[role="menuitem"]') &&
            !e.target.closest('[data-radix-menu-content]') &&
            !e.target.closest('input[type="checkbox"]')) {
          onSelect();
        }
      }}
    >
      {isBulkMode && (
        <TableCell className="px-4 py-3 text-center">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        </TableCell>
      )}
      <TableCell className="px-4 py-3 whitespace-nowrap">
        <div 
          className="flex items-center gap-3 cursor-text select-text"
          onDoubleClick={(e) => {
            const selection = window.getSelection();
            if (selection) {
              const range = document.createRange();
              range.selectNodeContents(e.currentTarget);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }}
          title={`Double-click to select all\nName: ${fullName}\nEmail: ${user.email}`}
        >
          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
            <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="min-w-0">
            <div className="font-medium">
              <div 
                className="truncate"
                data-full-text={fullName}
              >
                {safeTruncate(fullName, 30)}
              </div>
            </div>
            <div 
              className="text-sm text-gray-500 truncate flex items-center gap-1 mt-1"
              data-full-text={user.email}
            >
              <Mail className="h-3 w-3 flex-shrink-0" />
              {truncateEmail(user.email, 35)}
            </div>
            {user.username && (
              <div className="text-xs text-gray-400 truncate mt-1">
                @{safeTruncate(user.username, 15)}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3">
        <Badge 
          variant={getRoleBadgeVariant(roleName)}
          className="truncate max-w-full"
          title={roleName}
        >
          {safeTruncate(roleName, 20)}
        </Badge>
        {user.two_factor_confirmed_at && (
          <div className="mt-1">
            <Badge 
              variant="outline" 
              className="text-xs flex items-center gap-1"
              title="Two-Factor Authentication Enabled"
            >
              <CheckCircle className="h-2 w-2" />
              2FA
            </Badge>
          </div>
        )}
      </TableCell>
      <TableCell className="px-4 py-3">
        <div 
          className="text-sm truncate"
          title={departmentName}
        >
          {safeTruncate(departmentName, 20)}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3">
        <Badge 
          variant={getStatusBadgeVariant(user.status)} 
          className={`flex items-center gap-1 truncate max-w-full ${
            user.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : user.status === 'inactive'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              : user.status === 'suspended'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}
          title={user.status}
        >
          {getStatusIcon(user.status)}
          <span className="truncate capitalize">
            {user.status}
          </span>
        </Badge>
        {user.email_verified_at && (
          <div className="mt-1">
            <Badge 
              variant="outline" 
              className="text-xs flex items-center gap-1"
              title="Email Verified"
            >
              <CheckCircle className="h-2 w-2" />
              Verified
            </Badge>
          </div>
        )}
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="space-y-1">
          <div className="text-sm text-gray-500 truncate">
            {user.last_login_at ? formatDate(user.last_login_at) : 'Never logged in'}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
            Created: {formatDate(user.created_at)}
          </div>
          {user.position && (
            <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
              Position: {safeTruncate(user.position, 15)}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                <span>View Profile</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${user.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                <Edit className="h-4 w-4" />
                <span>Edit User</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                handleCopyToClipboard(user.email, 'Email');
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Copy className="h-4 w-4" />
              <span>Copy Email</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                handleCopyToClipboard(fullName, 'Name');
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Copy className="h-4 w-4" />
              <span>Copy Name</span>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <a 
                href={`mailto:${user.email}`}
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="h-4 w-4" />
                <span>Send Email</span>
              </a>
            </DropdownMenuItem>

            {onSendMessage && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  onSendMessage(user);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Send Message</span>
              </DropdownMenuItem>
            )}

            {isBulkMode && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect();
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {isSelected ? (
                    <>
                      <CheckSquare className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Deselect</span>
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" />
                      <span>Select for Bulk</span>
                    </>
                  )}
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
            
            {onToggleStatus && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  onToggleStatus(user);
                }}
                className={`flex items-center gap-2 cursor-pointer ${
                  user.status === 'active' 
                    ? 'text-amber-600 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-300 focus:bg-amber-50 dark:focus:bg-amber-950/30' 
                    : 'text-green-600 dark:text-green-400 focus:text-green-700 dark:focus:text-green-300 focus:bg-green-50 dark:focus:bg-green-950/30'
                }`}
              >
                {user.status === 'active' 
                  ? <Lock className="h-4 w-4" /> 
                  : <Unlock className="h-4 w-4" />
                }
                <span>{user.status === 'active' ? 'Deactivate User' : 'Activate User'}</span>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            {onDelete && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(user);
                }}
                className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete User</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}