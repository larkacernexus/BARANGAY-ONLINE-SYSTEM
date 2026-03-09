import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileCheck,
    Eye,
    Download,
    CheckCircle,
    Upload,
    FileText,
    Image as ImageIcon,
    File
} from 'lucide-react';
import { Document, DocumentStats } from '@/types/clearance';

interface DocumentsTabProps {
    documents: Document[];
    documentStats: DocumentStats;
    canProcess: boolean;
    onViewDocument: (doc: Document, index: number) => void;
    onDownloadDocument: (doc: Document) => void;
    onVerifyDocument: (documentId: number) => void;
    onVerifyAll: () => void;
    onRequestMore: () => void;
    onRequestDocuments: () => void;
    onUploadDocuments: () => void;
    formatDateTime: (date?: string) => string;
    formatFileSize: (bytes?: number) => string;
    getFileIcon: (document: Document) => JSX.Element;
    getDocumentStatusColor: (document: Document) => string;
    getDocumentStatusText: (document: Document) => string;
}

export function DocumentsTab({
    documents,
    documentStats,
    canProcess,
    onViewDocument,
    onDownloadDocument,
    onVerifyDocument,
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
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5" />
                        Submitted Documents
                    </CardTitle>
                    <CardDescription>
                        Documents submitted by the resident for this clearance request
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {documents && documents.length > 0 ? (
                        <div className="space-y-6">
                            {/* Document statistics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <p className="text-sm font-medium text-blue-600">Total Documents</p>
                                    <p className="text-2xl font-bold text-blue-700">{documentStats.total}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <p className="text-sm font-medium text-green-600">Verified</p>
                                    <p className="text-2xl font-bold text-green-700">{documentStats.verified}</p>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                    <p className="text-sm font-medium text-amber-600">Pending</p>
                                    <p className="text-2xl font-bold text-amber-700">{documentStats.pending}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                    <p className="text-sm font-medium text-red-600">Rejected</p>
                                    <p className="text-2xl font-bold text-red-700">{documentStats.rejected}</p>
                                </div>
                            </div>

                            {/* Documents list */}
                            <div className="space-y-3">
                                {documents.map((doc: Document, index: number) => {
                                    const isImage = doc.mime_type?.startsWith('image/') || 
                                                   doc.file_name?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
                                    const isPDF = doc.mime_type === 'application/pdf' || 
                                                  doc.file_name?.match(/\.pdf$/i);
                                    
                                    return (
                                        <div key={doc.id} className="border rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                                            <div className="flex items-start justify-between p-4">
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    <div className="flex-shrink-0">
                                                        {isImage && doc.thumbnail_url ? (
                                                            <img
                                                                src={doc.thumbnail_url}
                                                                alt={doc.name}
                                                                className="h-20 w-20 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity border"
                                                                onClick={() => onViewDocument(doc, index)}
                                                            />
                                                        ) : (
                                                            <div 
                                                                className={`h-20 w-20 rounded-md flex items-center justify-center cursor-pointer transition-colors border ${
                                                                    isImage ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' :
                                                                    isPDF ? 'bg-red-50 hover:bg-red-100 border-red-200' :
                                                                    'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                                                }`}
                                                                onClick={() => onViewDocument(doc, index)}
                                                            >
                                                                <div className="flex flex-col items-center">
                                                                    {getFileIcon(doc)}
                                                                    <span className="text-xs mt-1 text-gray-600">
                                                                        {isImage ? 'Image' : isPDF ? 'PDF' : 'File'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="min-w-0">
                                                                <h4 className="font-medium text-gray-900 truncate">{doc.name || doc.original_name || doc.file_name}</h4>
                                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                    <Badge 
                                                                        variant="outline"
                                                                        className={`${getDocumentStatusColor(doc)}`}
                                                                    >
                                                                        {getDocumentStatusText(doc)}
                                                                    </Badge>
                                                                    <span className="text-sm text-gray-500">{doc.description || 'Document'}</span>
                                                                    <span className="text-sm text-gray-500">•</span>
                                                                    <span className="text-sm text-gray-500">{formatFileSize(doc.file_size)}</span>
                                                                </div>
                                                                <div className="mt-2">
                                                                    <p className="text-sm text-gray-600">
                                                                        Uploaded {formatDateTime(doc.uploaded_at)}
                                                                    </p>
                                                                    {doc.verified_at && doc.is_verified && (
                                                                        <p className="text-sm text-green-600 mt-1">
                                                                            Verified on {formatDateTime(doc.verified_at)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => onViewDocument(doc, index)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onDownloadDocument(doc)}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {canProcess && !doc.is_verified && doc.status !== 'rejected' && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 px-2 text-xs"
                                                                onClick={() => doc.id && onVerifyDocument(doc.id)}
                                                            >
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Verify
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bulk actions */}
                            {canProcess && (
                                <div className="mt-6 pt-6 border-t">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Document Management</h4>
                                            <p className="text-sm text-gray-500">Apply actions to multiple documents</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={onVerifyAll}
                                                disabled={documentStats.pending === 0}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Verify All Pending
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={onRequestMore}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Request More
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
                                <FileText className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents submitted</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                The resident has not uploaded any documents for this request yet.
                                Documents may be required for processing this clearance request.
                            </p>
                            {canProcess && (
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button onClick={onRequestDocuments}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Request Documents
                                    </Button>
                                    <Button variant="outline" onClick={onUploadDocuments}>
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