import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FileCheck,
    Eye,
    Download,
    CheckCircle,
    Upload,
    FileText,
    Image as ImageIcon,
    File,
    XCircle,
    Clock,
    AlertCircle,
    FileImage,
    FileArchive,
    FileAudio,
    FileVideo,
    FileCode,
    MoreVertical,
    Trash2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClearanceDocument } from '@/types/admin/clearances/clearance'; // Fix import
import { JSX } from 'react';

interface DocumentStats {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    pendingCount?: number;
    verifiedCount?: number;
    rejectedCount?: number;
    pendingPercentage?: number;
    verifiedPercentage?: number;
    rejectedPercentage?: number;
}

interface DocumentsTabProps {
    documents: ClearanceDocument[];
    documentStats: DocumentStats;
    canProcess: boolean;
    onViewDocument: (doc: ClearanceDocument, index: number) => void;
    onDownloadDocument: (doc: ClearanceDocument) => void;
    onVerifyDocument: (documentId: number) => void;
    onRejectDocument?: (documentId: number, notes: string) => void;
    onVerifyAll: () => void;
    onRequestMore: () => void;
    onRequestDocuments: () => void;
    onUploadDocuments: () => void;
    formatDateTime: (date?: string) => string;
    formatFileSize: (bytes?: number) => string;
    getFileIcon: (document: ClearanceDocument) => JSX.Element;
    getDocumentStatusColor: (document: ClearanceDocument) => string;
    getDocumentStatusText: (document: ClearanceDocument) => string;
}

export function DocumentsTab({
    documents,
    documentStats,
    canProcess,
    onViewDocument,
    onDownloadDocument,
    onVerifyDocument,
    onRejectDocument,
    onVerifyAll,
    onRequestMore,
    onRequestDocuments,
    onUploadDocuments,
    formatDateTime,
    formatFileSize,
    getFileIcon,
    getDocumentStatusColor,
    getDocumentStatusText
}: DocumentsTabProps) {
    
    const getStatusIcon = (doc: ClearanceDocument) => {
        const status = doc.verification_status;
        if (status === 'verified') return <CheckCircle className="h-3 w-3" />;
        if (status === 'rejected') return <XCircle className="h-3 w-3" />;
        if (status === 'pending') return <Clock className="h-3 w-3" />;
        return <AlertCircle className="h-3 w-3" />;
    };

    const getDocumentName = (doc: ClearanceDocument): string => {
        return doc.original_name || doc.file_name || 'Document';
    };

    return (
        <div>
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                    <FileCheck className="h-3 w-3 text-white" />
                                </div>
                                Submitted Documents
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Documents submitted by the resident for this clearance request
                            </CardDescription>
                        </div>
                        {canProcess && documents.length > 0 && documentStats.pending > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onVerifyAll}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify All
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {documents && documents.length > 0 ? (
                        <div className="space-y-6">
                            {/* Document Statistics Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{documentStats.total}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Verified</p>
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{documentStats.verified}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending</p>
                                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{documentStats.pending}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejected</p>
                                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{documentStats.rejected}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Verification Progress</span>
                                    <span className="font-medium dark:text-gray-300">
                                        {documentStats.total > 0 ? Math.round((documentStats.verified / documentStats.total) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 h-2 rounded-full"
                                        style={{ width: `${documentStats.total > 0 ? (documentStats.verified / documentStats.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            <Separator className="dark:bg-gray-700" />

                            {/* Documents List */}
                            <div className="space-y-3">
                                {documents.map((doc: ClearanceDocument, index: number) => {
                                    const isImage = doc.is_image || 
                                                   doc.mime_type?.startsWith('image/') || 
                                                   doc.file_name?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
                                    const isPDF = doc.mime_type === 'application/pdf' || 
                                                  doc.file_name?.match(/\.pdf$/i);
                                    
                                    return (
                                        <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-900/50">
                                            <div className="flex items-start justify-between p-4">
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    <div className="flex-shrink-0">
                                                        {isImage && doc.file_path ? (
                                                            <img
                                                                src={doc.file_path}
                                                                alt={getDocumentName(doc)}
                                                                className="h-20 w-20 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity border border-gray-200 dark:border-gray-700"
                                                                onClick={() => onViewDocument(doc, index)}
                                                            />
                                                        ) : (
                                                            <div 
                                                                className={`h-20 w-20 rounded-md flex items-center justify-center cursor-pointer transition-colors border ${
                                                                    isImage ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' :
                                                                    isPDF ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' :
                                                                    'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                                }`}
                                                                onClick={() => onViewDocument(doc, index)}
                                                            >
                                                                <div className="flex flex-col items-center">
                                                                    {getFileIcon(doc)}
                                                                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                                                                        {isImage ? 'Image' : isPDF ? 'PDF' : 'File'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="min-w-0">
                                                                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                    {getDocumentName(doc)}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                    <Badge 
                                                                        variant="outline"
                                                                        className={`flex items-center gap-1 ${getDocumentStatusColor(doc)}`}
                                                                    >
                                                                        {getStatusIcon(doc)}
                                                                        {getDocumentStatusText(doc)}
                                                                    </Badge>
                                                                    {doc.document_type && (
                                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                            {doc.document_type.name}
                                                                        </span>
                                                                    )}
                                                                    {doc.description && (
                                                                        <>
                                                                            <span className="text-sm text-gray-400 dark:text-gray-600">•</span>
                                                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                                {doc.description}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    <span className="text-sm text-gray-400 dark:text-gray-600">•</span>
                                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {formatFileSize(doc.file_size)}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-2 space-y-1">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Uploaded {formatDateTime(doc.created_at)}
                                                                    </p>
                                                                    {doc.verified_at && doc.verification_status === 'verified' && (
                                                                        <p className="text-xs text-green-600 dark:text-green-400">
                                                                            Verified on {formatDateTime(doc.verified_at)}
                                                                        </p>
                                                                    )}
                                                                    {doc.rejection_reason && doc.verification_status === 'rejected' && (
                                                                        <p className="text-xs text-red-600 dark:text-red-400">
                                                                            Rejected: {doc.rejection_reason}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onViewDocument(doc, index)}
                                                        className="dark:border-gray-600 dark:text-gray-300"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDownloadDocument(doc)}
                                                        className="dark:text-gray-400 dark:hover:text-white"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    
                                                    {canProcess && doc.verification_status !== 'verified' && doc.verification_status !== 'rejected' && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="dark:text-gray-400 dark:hover:text-white">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="dark:bg-gray-900 dark:border-gray-700">
                                                                <DropdownMenuItem 
                                                                    onClick={() => doc.id && onVerifyDocument(doc.id)}
                                                                    className="text-green-600 dark:text-green-400"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Verify
                                                                </DropdownMenuItem>
                                                                {onRejectDocument && (
                                                                    <DropdownMenuItem 
                                                                        onClick={() => {
                                                                            const reason = prompt('Enter rejection reason:');
                                                                            if (reason && doc.id) {
                                                                                onRejectDocument(doc.id, reason);
                                                                            }
                                                                        }}
                                                                        className="text-red-600 dark:text-red-400"
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-2" />
                                                                        Reject
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bulk Actions */}
                            {canProcess && (
                                <>
                                    <Separator className="dark:bg-gray-700" />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Document Management</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Apply actions to multiple documents</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={onRequestMore}
                                                className="dark:border-gray-600 dark:text-gray-300"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Request More
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={onUploadDocuments}
                                                className="dark:border-gray-600 dark:text-gray-300"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No documents submitted</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                The resident has not uploaded any documents for this request yet.
                            </p>
                            {canProcess && (
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button onClick={onRequestDocuments} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Request Documents
                                    </Button>
                                    <Button variant="outline" onClick={onUploadDocuments} className="dark:border-gray-600 dark:text-gray-300">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Documents
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}