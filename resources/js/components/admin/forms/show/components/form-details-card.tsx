// resources/js/Pages/Admin/Forms/components/form-details-card.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Download,
    PackageOpen,
    Shield,
    Tag,
    FileCode,
    FileSpreadsheet,
    Image,
    File,
    Building,
    Landmark,
    Scale,
    Heart,
    BookOpen,
    Briefcase,
    Home,
    Globe,
    AlertCircle,
    CheckCircle,
    Lock,
    Eye,
    Star
} from 'lucide-react';
import { Form } from '@/types/admin/forms/forms.types';

interface Props {
    form: Form;
    onDownload: () => void;
}

// Helper functions
const formatFileSize = (bytes: number): string => {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType?: string): string => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📑';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📄';
};

const getFileTypeIconComponent = (fileType?: string): React.ReactNode => {
    if (!fileType) return <File className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('word')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileSpreadsheet className="h-4 w-4" />;
    if (fileType.includes('image')) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
};

const getCategoryColor = (category?: string): string => {
    const colors: Record<string, string> = {
        'Social Services': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        'Permits & Licenses': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'Health & Medical': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'Education': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'Legal & Police': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
        'Employment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        'Housing': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
        'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    };
    return colors[category || 'Other'] || colors['Other'];
};

const getAgencyIconComponent = (agency?: string): React.ReactNode => {
    if (!agency) return <Building className="h-4 w-4" />;
    const agencyLower = agency.toLowerCase();
    if (agencyLower.includes('barangay')) return <Home className="h-4 w-4" />;
    if (agencyLower.includes('municipal')) return <Building className="h-4 w-4" />;
    if (agencyLower.includes('city')) return <Landmark className="h-4 w-4" />;
    if (agencyLower.includes('provincial')) return <Scale className="h-4 w-4" />;
    if (agencyLower.includes('national')) return <Globe className="h-4 w-4" />;
    return <Building className="h-4 w-4" />;
};

const getAgencyLabel = (agency?: string): string => {
    const labels: Record<string, string> = {
        'Barangay': 'Barangay',
        'Municipal': 'Municipal',
        'City': 'City',
        'Provincial': 'Provincial',
        'National': 'National',
        'Other': 'Other'
    };
    return labels[agency || 'Other'] || agency || 'Other';
};

// Helper to safely get string value from mime_type
const getMimeTypeString = (mimeType: any): string => {
    if (!mimeType) return 'unknown';
    if (typeof mimeType === 'string') return mimeType;
    if (typeof mimeType === 'function') {
        try {
            const result = mimeType('dummy');
            return typeof result === 'string' ? result : 'unknown';
        } catch {
            return 'unknown';
        }
    }
    return 'unknown';
};

export const FormDetailsCard = ({ form, onDownload }: Props) => {
    // Safely access form properties with fallbacks
    const description = form.description || 'No description provided.';
    const fileName = form.file_name || 'Unknown file';
    const fileSize = form.file_size || 0;
    const fileType = form.file_type || 'unknown';
    const mimeTypeValue = getMimeTypeString(form.mime_type);
    const filePath = form.file_path || '';
    
    // Safe boolean conversion - since these are already boolean in the interface
    const isPublic = form.is_public === true;
    const requiresLogin = form.requires_login === true;
    const isActive = form.is_active === true;
    const isFeatured = form.is_featured === true;
    
    const category = form.category || 'Other';
    const issuingAgency = form.issuing_agency || 'Other';
    const version = form.version;
    const language = form.language;
    const pages = form.pages;
    const tags = Array.isArray(form.tags) ? form.tags : [];
    const downloadCount = form.download_count || 0;
    const viewCount = form.view_count || 0;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileText className="h-5 w-5" />
                    Form Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Complete details about this form
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Description */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{description}</p>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* File Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">File Information</h3>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="text-3xl">
                            {getFileIcon(fileType)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h4 className="font-medium dark:text-gray-100">{fileName}</h4>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {getFileTypeIconComponent(fileType)}
                                        <span>{formatFileSize(fileSize)}</span>
                                        <span>•</span>
                                        <span>{fileType.split('/').pop()?.toUpperCase() || fileType}</span>
                                        <span>•</span>
                                        <span>MIME: {mimeTypeValue}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onDownload}
                                    className="dark:border-gray-600 dark:text-gray-300"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">File Path</p>
                                    <p className="text-sm truncate dark:text-gray-300" title={filePath}>
                                        {filePath}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Security</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {isPublic ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                                <PackageOpen className="h-3 w-3 mr-1" />
                                                Public
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                                <Lock className="h-3 w-3 mr-1" />
                                                Restricted
                                            </Badge>
                                        )}
                                        {requiresLogin && (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Login Required
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Category & Agency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</h3>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getCategoryColor(category)}>
                                {category}
                            </Badge>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Issuing Agency</h3>
                        <div className="flex items-center gap-2 dark:text-gray-300">
                            {getAgencyIconComponent(issuingAgency)}
                            <span>{getAgencyLabel(issuingAgency)}</span>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                {(version || language || pages || tags.length > 0) && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {version && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Version</p>
                                        <div className="flex items-center gap-2">
                                            <FileCode className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <span className="text-sm dark:text-gray-300">{version}</span>
                                        </div>
                                    </div>
                                )}
                                {language && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Language</p>
                                        <span className="text-sm dark:text-gray-300">{language}</span>
                                    </div>
                                )}
                                {pages && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Pages</p>
                                        <span className="text-sm dark:text-gray-300">{typeof pages === 'number' ? pages : parseInt(pages as string)} pages</span>
                                    </div>
                                )}
                            </div>
                            {tags.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tags</p>
                                    <div className="flex flex-wrap gap-1">
                                        {tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                                <Tag className="h-2 w-2 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Download Statistics */}
                {(downloadCount > 0 || viewCount > 0) && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Statistics</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {downloadCount > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Downloads</p>
                                        <div className="flex items-center gap-2">
                                            <Download className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <span className="text-sm font-medium dark:text-gray-300">{downloadCount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                                {viewCount > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <span className="text-sm font-medium dark:text-gray-300">{viewCount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Form Status */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        {isActive ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Inactive
                            </Badge>
                        )}
                        {isFeatured && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};