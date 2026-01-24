// components/ui/table-actions.tsx
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Eye,
    Edit,
    Trash2,
    Copy,
    MoreVertical,
    FileText,
    Download
} from 'lucide-react';

interface TableAction {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
}

interface TableActionsProps {
    actions: TableAction[];
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onCopy?: () => void;
    customActions?: TableAction[];
    size?: 'sm' | 'md';
}

export function TableActions({
    actions,
    onView,
    onEdit,
    onDelete,
    onCopy,
    customActions = [],
    size = 'sm'
}: TableActionsProps) {
    const allActions = [
        ...actions,
        ...(onView ? [{
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: onView
        }] : []),
        ...(onEdit ? [{
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: onEdit
        }] : []),
        ...(onCopy ? [{
            label: 'Copy',
            icon: <Copy className="h-4 w-4" />,
            onClick: onCopy
        }] : []),
        ...customActions,
        ...(onDelete ? [{
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: onDelete,
            variant: 'destructive' as const
        }] : [])
    ];

    if (allActions.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size={size === 'sm' ? 'icon' : 'default'} className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {allActions.map((action, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={action.variant === 'destructive' ? 'text-destructive' : ''}
                    >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}