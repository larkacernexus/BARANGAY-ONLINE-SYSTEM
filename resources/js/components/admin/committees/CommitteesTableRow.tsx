// components/admin/committees/CommitteesTableRow.tsx
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { Committee } from '@/types/committees';
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
    Users
} from 'lucide-react';
import { truncateText, getTruncationLength } from '@/lib/committeeutils';
import { toast } from 'sonner';

interface CommitteesTableRowProps {
    committee: Committee;
    isSelected: boolean;
    isBulkMode: boolean;
    onItemSelect: (id: number) => void;
}

export function CommitteesTableRow({ committee, isSelected, isBulkMode, onItemSelect }: CommitteesTableRowProps) {
    const nameLength = getTruncationLength('name');
    const descLength = getTruncationLength('description');
    const codeLength = getTruncationLength('code');
    const hasPositions = (committee.positions_count || 0) > 0;

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this committee?')) {
            router.delete(`/committees/${committee.id}`, {
                preserveScroll: true,
            });
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
        <TableRow 
            className={`hover:bg-gray-50 ${
                isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
            onClick={(e) => {
                if (isBulkMode && e.target instanceof HTMLElement && 
                    !e.target.closest('a') && 
                    !e.target.closest('button') &&
                    !e.target.closest('.dropdown-menu-content') &&
                    !e.target.closest('input[type="checkbox"]')) {
                    onItemSelect(committee.id);
                }
            }}
        >
            {isBulkMode && (
                <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onItemSelect(committee.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                    </div>
                </TableCell>
            )}
            
            <TableCell className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full ${hasPositions ? 'bg-purple-100' : 'bg-blue-100'} flex items-center justify-center`}>
                        <Target className={`h-4 w-4 ${hasPositions ? 'text-purple-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                            {truncateText(committee.name, nameLength)}
                        </div>
                        {committee.description && (
                            <div className="text-xs text-gray-500 truncate mt-1">
                                {truncateText(committee.description, descLength)}
                            </div>
                        )}
                    </div>
                </div>
            </TableCell>
            
            <TableCell className="px-4 py-3">
                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                    {truncateText(committee.code, codeLength)}
                </code>
            </TableCell>
            
            <TableCell className="px-4 py-3">
                <div className="flex items-center justify-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-sm font-medium">
                        {committee.order}
                    </span>
                </div>
            </TableCell>
            
            <TableCell className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <Badge variant={hasPositions ? "default" : "outline"}>
                        {committee.positions_count || 0}
                    </Badge>
                </div>
            </TableCell>
            
            <TableCell className="px-4 py-3">
                <Badge variant={getStatusBadgeVariant(committee.is_active)}>
                    {committee.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </TableCell>
            
            <TableCell className="px-4 py-3 text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/committees/${committee.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/committees/${committee.id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Committee
                            </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/positions?committee_id=${committee.id}`} className="cursor-pointer">
                                <Target className="mr-2 h-4 w-4" />
                                View Positions
                            </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {isBulkMode && (
                            <>
                                <DropdownMenuItem 
                                    onClick={() => onItemSelect(committee.id)}
                                    className="cursor-pointer"
                                >
                                    {isSelected ? (
                                        <>
                                            <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                            <span className="text-green-600">Deselect</span>
                                        </>
                                    ) : (
                                        <>
                                            <Square className="mr-2 h-4 w-4" />
                                            <span>Select for Bulk</span>
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        
                        <DropdownMenuItem 
                            onClick={() => handleCopyToClipboard(committee.name, 'Committee Name')}
                            className="cursor-pointer"
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy Name</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={() => handleCopyToClipboard(committee.code, 'Committee Code')}
                            className="cursor-pointer"
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy Code</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/committees/${committee.id}/print`} className="cursor-pointer">
                                <Printer className="mr-2 h-4 w-4" />
                                <span>Print Details</span>
                            </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                            onClick={handleDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Committee</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}