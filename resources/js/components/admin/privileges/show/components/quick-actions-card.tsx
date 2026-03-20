// resources/js/Pages/Admin/Privileges/components/quick-actions-card.tsx
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Zap, Copy, Check, UserPlus, Share2, Mail, MessageSquare, Trash2 } from 'lucide-react';

interface Privilege {
    code: string;
    name: string;
    default_discount_percentage: string | number;
    is_active: boolean;
    discount_type?: {
        name: string;
    };
}

interface Props {
    privilege: Privilege;
    onDelete: () => void;
    onAssign: () => void;
}

export const QuickActionsCard = ({ 
    privilege, 
    onDelete,
    onAssign
}: Props) => {
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(privilege.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent(`Privilege: ${privilege.name}`);
        const body = encodeURIComponent(
            `Privilege: ${privilege.name}\n` +
            `Code: ${privilege.code}\n` +
            `Discount: ${privilege.default_discount_percentage}%\n` +
            `Type: ${privilege.discount_type?.name || 'N/A'}\n` +
            `Status: ${privilege.is_active ? 'Active' : 'Inactive'}`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={copyCode}
                >
                    {copied ? (
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                        <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copied ? 'Copied!' : 'Copy Code'}
                </Button>

                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={onAssign}
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign to Residents
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Share via</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={shareViaEmail}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={copyCode}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            SMS
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator className="dark:bg-gray-700 my-2" />

                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Privilege
                </Button>
            </CardContent>
        </Card>
    );
};