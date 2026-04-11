import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface ActionMenuItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
}

interface ModernActionMenuProps {
    items: ActionMenuItem[];
    trigger?: React.ReactNode;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
}

export const ModernActionMenu = ({
    items,
    trigger,
    align = 'end',
    side = 'bottom',
}: ModernActionMenuProps) => {
    const [open, setOpen] = useState(false);

    const defaultTrigger = (
        <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-xl"
        >
            <MoreHorizontal className="h-4 w-4" />
        </Button>
    );

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                {trigger || defaultTrigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} side={side} className="w-48">
                {items.map((item, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={() => {
                            item.onClick();
                            setOpen(false);
                        }}
                        disabled={item.disabled}
                        className={item.danger ? 'text-red-600 focus:text-red-600' : ''}
                    >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};