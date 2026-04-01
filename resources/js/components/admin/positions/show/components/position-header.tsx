// resources/js/Pages/Admin/Positions/components/position-header.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ArrowLeft,
    Edit,
    Copy,
    Check,
    Trash2,
    Key,
    Hash,
    Users,
    Crown,
    Shield,
} from 'lucide-react';
import { Position } from '@/types/admin/positions/position.types';

interface Props {
    position: Position;
    copied: boolean;
    isCaptainPosition: boolean;
    isKagawadPosition: boolean;
    onCopyLink: () => void;
    onCopyCode: () => void;
    onDelete: () => void;
    canDelete: boolean;
}

export const PositionHeader = ({
    position,
    copied,
    isCaptainPosition,
    isKagawadPosition,
    onCopyLink,
    onCopyCode,
    onDelete,
    canDelete
}: Props) => {
    const getPositionIcon = () => {
        if (isCaptainPosition) {
            return <Crown className="h-6 w-6 text-amber-100" />;
        }
        if (isKagawadPosition) {
            return <Shield className="h-6 w-6 text-amber-100" />;
        }
        return <Shield className="h-6 w-6 text-white" />;
    };

    const getStatusVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
        return isActive ? 'default' : 'secondary';
    };

    const getStatusIcon = (isActive: boolean) => {
        return isActive ? 
            <div className="h-3 w-3 rounded-full bg-green-500 mr-1" /> : 
            <div className="h-3 w-3 rounded-full bg-gray-400 mr-1" />;
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/admin/positions">
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Positions
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${isCaptainPosition ? 'from-amber-600 to-amber-800' : isKagawadPosition ? 'from-amber-500 to-amber-700' : 'from-blue-600 to-blue-800'} flex items-center justify-center shadow-lg`}>
                        {getPositionIcon()}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                            {position.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge 
                                variant={getStatusVariant(position.is_active)}
                                className="flex items-center gap-1"
                            >
                                {getStatusIcon(position.is_active)}
                                {position.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {position.requires_account && (
                                <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
                                    <Key className="h-3 w-3" />
                                    Requires Account
                                </Badge>
                            )}
                            <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
                                <Hash className="h-3 w-3" />
                                Order #{position.order}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
                                <Users className="h-3 w-3" />
                                {position.officials_count ?? 0} Officials
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCopyCode}
                                className="h-6 px-2 text-xs"
                            >
                                <Copy className="h-3 w-3 mr-1" />
                                {position.code}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onCopyLink}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                            ) : (
                                <Copy className="h-4 w-4 mr-2" />
                            )}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy position link to clipboard</TooltipContent>
                </Tooltip>

                <Link href={`/admin/positions/${position.id}/edit`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Position
                    </Button>
                </Link>

                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    disabled={!canDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </div>
        </div>
    );
};