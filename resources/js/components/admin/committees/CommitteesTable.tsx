import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, router } from '@inertiajs/react';
import { Committee } from '@/types/admin/committees/committees';
import { 
    MoreVertical, 
    Eye, 
    Edit, 
    Target, 
    Copy, 
    Printer, 
    Trash2, 
    CheckSquare, 
    Square,
    CheckCircle,
    XCircle,
    Users
} from 'lucide-react';
import { truncateText, getTruncationLength } from '@/lib/committeeutils';
import { toast } from 'sonner';

interface CommitteesTableProps {
    committees: Committee[];
    selectedIds: number[];
    isBulkMode: boolean;
    isSelectAll: boolean;
    onItemSelect: (id: number) => void;
    onSelectAllOnPage: () => void;
    onDelete?: (committee: Committee) => void;
    onToggleStatus?: (committee: Committee) => void;
}

export function CommitteesTable({
    committees,
    selectedIds,
    isBulkMode,
    isSelectAll,
    onItemSelect,
    onSelectAllOnPage,
    onDelete,
    onToggleStatus
}: CommitteesTableProps) {
    const handleDelete = (committee: Committee) => {
        if (confirm('Are you sure you want to delete this committee?')) {
            if (onDelete) {
                onDelete(committee);
            } else {
                router.delete(`/admin/committees/${committee.id}`, {
                    preserveScroll: true,
                });
            }
        }
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        });
    };

    const getStatusBadgeVariant = (isActive: boolean) => {
        return isActive ? 'default' : 'secondary';
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        {isBulkMode && (
                            <TableHead className="px-4 py-3 text-center w-12">
                                <div className="flex items-center justify-center">
                                    <Checkbox
                                        checked={isSelectAll && committees.length > 0}
                                        onCheckedChange={onSelectAllOnPage}
                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                            </TableHead>
                        )}
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">
                            Committee
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                            Code
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                            Order
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                            Positions
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                            Status
                        </TableHead>
                        <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800/50 min-w-[80px]">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {committees.map((committee) => {
                        const nameLength = getTruncationLength('name');
                        const descLength = getTruncationLength('description');
                        const codeLength = getTruncationLength('code');
                        const isSelected = selectedIds.includes(committee.id);
                        const hasPositions = (committee.positions_count || 0) > 0;
                        
                        return (
                            <TableRow 
                                key={committee.id} 
                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                                }`}
                            >
                                {isBulkMode && (
                                    <TableCell className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onItemSelect(committee.id)}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                            />
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full ${hasPositions ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center flex-shrink-0`}>
                                            <Target className={`h-4 w-4 ${hasPositions ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {truncateText(committee.name, nameLength)}
                                            </div>
                                            {committee.description && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                    {truncateText(committee.description, descLength)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-800 dark:text-gray-300">
                                        {truncateText(committee.code, codeLength)}
                                    </code>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {committee.order}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <Badge variant={hasPositions ? "default" : "outline"} className={hasPositions ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" : "dark:text-gray-400 dark:border-gray-600"}>
                                            {committee.positions_count || 0}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <Badge 
                                        variant={getStatusBadgeVariant(committee.is_active)} 
                                        className={committee.is_active 
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                                        }
                                    >
                                        {committee.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                            <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800">
                                                <Link href={`/admin/committees/${committee.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800">
                                                <Link href={`/admin/committees/${committee.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleCopyToClipboard(committee.name, 'Committee Name')}
                                                className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800"
                                            >
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy Name
                                            </DropdownMenuItem>
                                            {onToggleStatus && (
                                                <DropdownMenuItem 
                                                    onClick={() => onToggleStatus(committee)}
                                                    className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800"
                                                >
                                                    {committee.is_active ? (
                                                        <>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                            {isBulkMode && (
                                                <DropdownMenuItem 
                                                    onClick={() => onItemSelect(committee.id)}
                                                    className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800"
                                                >
                                                    {isSelected ? (
                                                        <>
                                                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                                                            Deselect
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Square className="mr-2 h-4 w-4" />
                                                            Select
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem 
                                                onClick={() => handleDelete(committee)} 
                                                className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}