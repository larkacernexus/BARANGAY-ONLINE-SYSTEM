// resources/js/Pages/Admin/DocumentTypes/components/document-type-header.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Edit,
    Copy,
    Check,
    Printer,
    Settings,
    XCircle,
    CheckCircle,
    FileCheck,
    FileX,
    Trash2,
    Award,
    Hash,
    FileText,
    MoreVertical,
    Download,
    Sparkles,
    Clock,
    Tag
} from 'lucide-react';
import { DocumentType } from '../types';

interface Props {
    documentType: DocumentType;
    isNew: boolean;
    onBack: () => void;
    onCopyLink: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onToggleStatus: () => void;
    onToggleRequired: () => void;
    onDelete: () => void;
    onPrint?: () => void;
    onExport?: () => void;
    canDelete: boolean;
    getStatusIcon: (isActive: boolean) => React.ReactNode;
    getStatusVariant: (isActive: boolean) => string;
    getStatusBadge: (isActive: boolean) => React.ReactNode;
    getRequiredBadge: (isRequired: boolean) => React.ReactNode;
}

const getDocumentTypeGradient = (): string => {
    return 'from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700';
};

const getStatusBadgeColor = (isActive: boolean): string => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
};

const getRequiredBadgeColor = (isRequired: boolean): string => {
    return isRequired
        ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
        : 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
};

export const DocumentTypeHeader = ({
    documentType,
    isNew,
    onBack,
    onCopyLink,
    onEdit,
    onDuplicate,
    onToggleStatus,
    onToggleRequired,
    onDelete,
    onPrint,
    onExport,
    canDelete,
    getStatusIcon,
    getStatusVariant,
    getStatusBadge,
    getRequiredBadge
}: Props) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        onCopyLink();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBack}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Document Types
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getDocumentTypeGradient()}`}>
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                {documentType.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Status Badge */}
                                <Badge variant="outline" className={getStatusBadgeColor(documentType.is_active)}>
                                    {getStatusIcon(documentType.is_active)}
                                    <span className="ml-1">{documentType.is_active ? 'Active' : 'Inactive'}</span>
                                </Badge>

                                {/* New Badge */}
                                {isNew && (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        New
                                    </Badge>
                                )}

                                {/* Document Code with Copy */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                            onClick={handleCopyLink}
                                        >
                                            <Hash className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                {documentType.code}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3 w-3 ml-1" />
                                            ) : (
                                                <Copy className="h-3 w-3 ml-1" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy document code</TooltipContent>
                                </Tooltip>

                                {/* Required/Optional Badge */}
                                <Badge variant="outline" className={getRequiredBadgeColor(documentType.is_required)}>
                                    {documentType.is_required ? (
                                        <FileCheck className="h-3 w-3 mr-1" />
                                    ) : (
                                        <FileX className="h-3 w-3 mr-1" />
                                    )}
                                    {documentType.is_required ? 'Required' : 'Optional'}
                                </Badge>

                                {/* Stats Badge - Replace with actual data */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full cursor-default">
                                            <FileText className="h-3 w-3" />
                                            <span className="text-sm font-medium">0</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Documents submitted</TooltipContent>
                                </Tooltip>

                                {/* Processing Time Badge - if available */}
                                {documentType.processing_days && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 rounded-full cursor-default">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-sm font-medium">{documentType.processing_days} days</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Processing time</TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Edit Button - Primary Action */}
                    <Button
                        size="sm"
                        onClick={onEdit}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>

                    {/* 3-Dots Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 dark:bg-gray-900 dark:border-gray-700">
                            <DropdownMenuLabel className="dark:text-gray-100">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            <DropdownMenuItem 
                                onClick={handleCopyLink}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={handlePrint}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </DropdownMenuItem>
                            
                            {onExport && (
                                <DropdownMenuItem 
                                    onClick={onExport}
                                    className="dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                                onClick={onDuplicate}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            <DropdownMenuItem 
                                onClick={onToggleStatus}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {documentType.is_active ? (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Activate
                                    </>
                                )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={onToggleRequired}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {documentType.is_required ? (
                                    <>
                                        <FileX className="h-4 w-4 mr-2" />
                                        Mark as Optional
                                    </>
                                ) : (
                                    <>
                                        <FileCheck className="h-4 w-4 mr-2" />
                                        Mark as Required
                                    </>
                                )}
                            </DropdownMenuItem>
                            
                            {canDelete && (
                                <>
                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                    <DropdownMenuItem 
                                        onClick={onDelete}
                                        className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </TooltipProvider>
    );
};