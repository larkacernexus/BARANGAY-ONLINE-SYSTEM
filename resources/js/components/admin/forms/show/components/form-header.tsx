// resources/js/Pages/Admin/Forms/components/form-header.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Star,
    Eye,
    Download,
    Link as LinkIcon,
    Edit,
    Trash2,
    Check,
    Copy,
    FileText,
    MoreVertical,
    Tag,
    Clock,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Form } from '../types';

interface Props {
    form: Form;
    onToggleStatus: () => void;
    onToggleFeatured: () => void;
    onDownload: () => void;
    onCopyLink: () => void;
    onDelete: () => void;
}

const getCategoryColor = (category?: string): string => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
    const colors: Record<string, string> = {
        'Social Services': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        'Permits & Licenses': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'Health & Medical': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'Education': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'Legal & Police': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
        'Employment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        'Housing': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
        'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700',
    };
    return colors[category] || colors['Other'];
};

const getCategoryIcon = (category?: string) => {
    switch (category) {
        case 'Social Services':
            return <Sparkles className="h-3 w-3" />;
        case 'Permits & Licenses':
            return <FileText className="h-3 w-3" />;
        case 'Health & Medical':
            return <AlertCircle className="h-3 w-3" />;
        case 'Education':
            return <FileText className="h-3 w-3" />;
        case 'Legal & Police':
            return <FileText className="h-3 w-3" />;
        default:
            return <Tag className="h-3 w-3" />;
    }
};

const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />;
};

const getStatusColor = (isActive: boolean): string => {
    return isActive 
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
};

const getGradientByCategory = (category?: string): string => {
    switch (category) {
        case 'Social Services':
            return 'from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700';
        case 'Permits & Licenses':
            return 'from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700';
        case 'Health & Medical':
            return 'from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700';
        case 'Education':
            return 'from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700';
        case 'Legal & Police':
            return 'from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700';
        case 'Housing':
            return 'from-cyan-600 to-teal-600 dark:from-cyan-700 dark:to-teal-700';
        default:
            return 'from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700';
    }
};

export const FormHeader = ({
    form,
    onToggleStatus,
    onToggleFeatured,
    onDownload,
    onCopyLink,
    onDelete,
}: Props) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        onCopyLink();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href={route('admin.forms.index')}>
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Forms
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getGradientByCategory(form.category)}`}>
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight line-clamp-2 dark:text-gray-100">
                            {form.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* Status Badge */}
                            <Badge variant="outline" className={getStatusColor(form.is_active)}>
                                {getStatusIcon(form.is_active)}
                                <span className="ml-1">{form.is_active ? 'Active' : 'Inactive'}</span>
                            </Badge>

                            {/* Featured Badge */}
                            {form.is_featured && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                    <Star className="h-3 w-3 mr-1 fill-purple-600 dark:fill-purple-400" />
                                    Featured
                                </Badge>
                            )}

                            {/* Category Badge */}
                            <Badge variant="outline" className={`flex items-center gap-1 ${getCategoryColor(form.category)}`}>
                                {getCategoryIcon(form.category)}
                                <span className="ml-1">{form.category || 'Uncategorized'}</span>
                            </Badge>

                            {/* Stats Badges */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full cursor-default">
                                            <Eye className="h-3 w-3" />
                                            <span className="text-sm font-medium">{form.view_count}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Views</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full cursor-default">
                                            <Download className="h-3 w-3" />
                                            <span className="text-sm font-medium">{form.download_count}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Downloads</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Copy Link Button */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyLink}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy download link to clipboard</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Download Button - Primary Action */}
                <Button
                    onClick={onDownload}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                </Button>

                {/* 3-Dots Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                        <DropdownMenuLabel className="dark:text-gray-100">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                        
                        <DropdownMenuItem 
                            onClick={onToggleStatus} 
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {form.is_active ? (
                                <XCircle className="h-4 w-4 mr-2" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {form.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={onToggleFeatured} 
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Star className={`h-4 w-4 mr-2 ${form.is_featured ? 'text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400' : ''}`} />
                            {form.is_featured ? 'Unfeature' : 'Feature'}
                        </DropdownMenuItem>
                        
                        <Link href={route('admin.forms.edit', form.id)}>
                            <DropdownMenuItem className="dark:text-gray-300 dark:hover:bg-gray-700">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                        </Link>
                        
                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                        
                        <DropdownMenuItem 
                            onClick={onDelete} 
                            className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};