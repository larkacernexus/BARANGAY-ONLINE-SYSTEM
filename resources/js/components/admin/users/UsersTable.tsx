import { JSX, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Mail,
  Copy,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  AlertTriangle,
  User as UserIcon,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square,
  Lock,
  Unlock,
  Key
} from 'lucide-react';
import UsersTableRow from './UsersTableRow';
import { User } from '@/types/admin/users/user-types';

interface UsersTableProps {
  users: User[];
  isBulkMode: boolean;
  selectedUsers: number[];
  isSelectAll: boolean;
  onItemSelect: (id: number) => void;
  onSelectAll: () => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
  onUserStatusChange?: (user: User, status: string) => void;
  onCopyToClipboard?: (text: string, label: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function UsersTable({
  users,
  isBulkMode,
  selectedUsers,
  isSelectAll,
  onItemSelect,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
  onUserEdit,
  onUserDelete,
  onUserStatusChange,
  onCopyToClipboard,
  canEdit = true,
  canDelete = true
}: UsersTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'active': 'default',
      'inactive': 'secondary',
      'suspended': 'destructive',
      'pending': 'outline'
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      'active': <CheckCircle className="h-4 w-4 text-green-500" />,
      'inactive': <XCircle className="h-4 w-4 text-gray-500" />,
      'suspended': <AlertTriangle className="h-4 w-4 text-red-500" />,
      'pending': <Clock className="h-4 w-4 text-amber-500" />
    };
    return icons[status] || null;
  };

  const getRoleBadgeVariant = (roleName: string | undefined) => {
    if (!roleName) return 'outline';
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Administrator': 'destructive',
      'Admin': 'destructive',
      'Super Admin': 'destructive',
      'Treasury': 'outline',
      'Treasury Officer': 'outline',
      'Records Clerk': 'outline',
      'Clearance Officer': 'outline',
      'Analyst': 'secondary',
      'Auditor': 'outline',
      'Viewer': 'outline',
      'User': 'outline'
    };
    return variants[roleName] || 'outline';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // FIXED: Safe truncate function that handles any input type
  const truncateText = (text: any, maxLength: number = 30): string => {
    // Handle null, undefined, or non-string values
    if (text === null || text === undefined) return '';
    
    // Convert to string if it's not already
    let stringValue = text;
    if (typeof text !== 'string') {
      stringValue = String(text);
    }
    
    // Now safely call substring
    if (stringValue.length <= maxLength) return stringValue;
    return stringValue.substring(0, maxLength) + '...';
  };

  // FIXED: Safe email truncation
  const truncateEmail = (email: any, maxLength: number = 25): string => {
    if (!email) return '';
    
    // Convert to string if needed
    let emailStr = typeof email === 'string' ? email : String(email);
    
    if (emailStr.length <= maxLength) return emailStr;
    const [local, domain] = emailStr.split('@');
    if (!domain) return truncateText(emailStr, maxLength);
    
    const maxLocal = Math.floor(maxLength / 2);
    const maxDomain = maxLength - maxLocal - 1;
    
    const truncatedLocal = truncateText(local, maxLocal);
    const truncatedDomain = truncateText(domain, maxDomain);
    
    return `${truncatedLocal}@${truncatedDomain}`;
  };

  const getFullName = (user: User): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.last_name) {
      return user.last_name;
    } else {
      return user.email;
    }
  };

  // Wrap status change handler to match UsersTableRow's expected signature
  const handleStatusChange = (user: User) => {
    if (onUserStatusChange) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      onUserStatusChange(user, newStatus);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-900">
            {isBulkMode && (
              <TableHead className="px-4 py-3 text-center w-12">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={isSelectAll && users.length > 0}
                    onCheckedChange={onSelectAll}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </div>
              </TableHead>
            )}
            <TableHead 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-1">
                User
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => onSort('role')}
            >
              <div className="flex items-center gap-1">
                Role
                {getSortIcon('role')}
              </div>
            </TableHead>
            <TableHead 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
            >
              Department
            </TableHead>
            <TableHead 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => onSort('status')}
            >
              <div className="flex items-center gap-1">
                Status
                {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
              Last Activity
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UsersTableRow
              key={user.id}
              user={user}
              isBulkMode={isBulkMode}
              isSelected={selectedUsers.includes(user.id)}
              onSelect={() => onItemSelect(user.id)}
              isExpanded={expandedRow === user.id}
              onToggleExpand={() => setExpandedRow(expandedRow === user.id ? null : user.id)}
              getFullName={getFullName}
              truncateText={truncateText}
              truncateEmail={truncateEmail}
              getStatusBadgeVariant={getStatusBadgeVariant}
              getStatusIcon={getStatusIcon}
              getRoleBadgeVariant={getRoleBadgeVariant}
              formatDate={formatDate}
              onDelete={onUserDelete}
              onToggleStatus={handleStatusChange}
              onCopyToClipboard={onCopyToClipboard}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}