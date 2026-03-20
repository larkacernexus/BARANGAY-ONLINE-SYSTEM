import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface ActionDropdownProps {
    triggerIcon?: ReactNode;
    children: ReactNode;
    align?: 'start' | 'end' | 'center';
    className?: string;
}

export function ActionDropdown({
    triggerIcon = <MoreVertical className="h-4 w-4" />,
    children,
    align = 'end',
    className = 'w-48'
}: ActionDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                    <span className="sr-only">Open menu</span>
                    {triggerIcon}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className={className}>
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface ActionDropdownItemProps {
    icon?: ReactNode;
    children: ReactNode;
    onClick?: () => void;
    href?: string;
    className?: string;
    dangerous?: boolean;
}

export function ActionDropdownItem({
    icon,
    children,
    onClick,
    href,
    className = '',
    dangerous = false
}: ActionDropdownItemProps) {
    const content = (
        <div className="flex items-center">
            {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
            <span className={dangerous ? 'text-red-600' : ''}>{children}</span>
        </div>
    );

    if (href) {
        return (
            <DropdownMenuItem asChild className={className}>
                <a href={href} className="cursor-pointer">
                    {content}
                </a>
            </DropdownMenuItem>
        );
    }

    return (
        <DropdownMenuItem onClick={onClick} className={`cursor-pointer ${className} ${dangerous ? 'text-red-600 focus:text-red-700 focus:bg-red-50' : ''}`}>
            {content}
        </DropdownMenuItem>
    );
}

export function ActionDropdownSeparator() {
    return <DropdownMenuSeparator />;
}