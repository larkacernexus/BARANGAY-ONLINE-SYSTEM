// resources/js/Pages/Admin/Households/Show/tabs/ResidentDocumentsTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    FileText, 
    Plus, 
    Eye, 
    Download,
    Search,
    File as FilePdf,
    FileImage,
    FileSpreadsheet,
    Calendar,
    User,
    Tag,
    ExternalLink,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useMemo } from 'react';

// Import types from shared types file
import { ResidentDocument, ResidentDocumentStatus } from '@/types/admin/households/household.types';
import { formatDate, formatDateTime, getFullName } from '@/types/admin/households/household.types';

// Extended document type for display
interface ExtendedDocument extends ResidentDocument {
    reference_number?: string;
    description?: string;
    file_name?: string;
    file_extension?: string;
    file_size_human?: string;
    resident?: {
        id: number;
        full_name?: string;
        first_name?: string;
        last_name?: string;
        middle_name?: string;
    };
    view_count?: number;
    download_count?: number;
    tags?: string[];
}

interface ResidentDocumentsTabProps {
    householdId: number;
    documents: ExtendedDocument[];
    totalDocuments: number;
    activeDocuments: number;
    expiredDocuments: number;
}

export const ResidentDocumentsTab = ({ 
    householdId, 
    documents, 
    totalDocuments, 
    activeDocuments, 
    expiredDocuments 
}: ResidentDocumentsTabProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const getFileIcon = (extension?: string) => {
        switch (extension?.toLowerCase()) {
            case 'pdf':
                return <FilePdf className="h-8 w-8 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return <FileImage className="h-8 w-8 text-blue-500" />;
            case 'xls':
            case 'xlsx':
            case 'csv':
                return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
            default:
                return <FileText className="h-8 w-8 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: ResidentDocumentStatus, expiryDate?: string) => {
        switch (status) {
            case 'expired':
                return <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Expired
                </Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                </Badge>;
            case 'rejected':
                return <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Rejected
                </Badge>;
            case 'active':
            default:
                // Check if expiring soon
                if (expiryDate) {
                    try {
                        const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                            return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Expires in {daysUntilExpiry} days
                            </Badge>;
                        }
                    } catch {
                        // Invalid date, just show active
                    }
                }
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                </Badge>;
        }
    };

    const getResidentName = (doc: ExtendedDocument): string => {
        if (doc.resident?.full_name) return doc.resident.full_name;
        if (doc.resident?.first_name) {
            return getFullName(
                doc.resident.first_name, 
                doc.resident.last_name || '', 
                doc.resident.middle_name || ''
            );
        }
        return 'N/A';
    };
    
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = searchQuery === '' || 
                doc.document_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.document_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
            
            return matchesSearch && matchesStatus;
        });
    }, [documents, searchQuery, filterStatus]);

    const stats = useMemo(() => {
        return {
            total: totalDocuments,
            active: activeDocuments,
            expired: expiredDocuments,
            pending: documents.filter(d => d.status === 'pending').length,
            rejected: documents.filter(d => d.status === 'rejected').length
        };
    }, [documents, totalDocuments, activeDocuments, expiredDocuments]);

    // Safe route function that checks if route exists and handles parameters correctly
    const safeRoute = (name: string, params?: Record<string, any> | number) => {
        try {
            // Handle case where params is a number (ID) instead of an object
            let routeParams: Record<string, any> | undefined;
            if (typeof params === 'number') {
                routeParams = { id: params };
            } else {
                routeParams = params;
            }
            return route(name, routeParams);
        } catch {
            console.warn(`Route '${name}' not found`);
            return '#';
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <FileText className="h-8 w-8 text-blue-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{stats.total}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{stats.active}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{stats.expired}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Clock className="h-8 w-8 text-yellow-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{stats.pending}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <AlertCircle className="h-8 w-8 text-orange-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{stats.rejected}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Documents List */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="dark:text-gray-100">Resident Documents</CardTitle>
                        <Link href={safeRoute('admin.resident-documents.create', { household_id: householdId })}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Upload Document
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 relative min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by document type, number, or description..."
                                className="pl-9 dark:bg-gray-900 dark:border-gray-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Documents</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {filteredDocuments.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No documents found</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No documents match your search.' : 'This household has no documents yet.'}
                            </p>
                            {!searchQuery && (
                                <Link href={safeRoute('admin.resident-documents.create', { household_id: householdId })}>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Upload First Document
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDocuments.map((doc) => {
                                // Create safe route URLs
                                const residentShowUrl = safeRoute('admin.residents.show', doc.resident_id);
                                const docShowUrl = safeRoute('admin.resident-documents.show', doc.id);
                                
                                return (
                                    <div key={doc.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700">
                                        <div className="flex flex-col md:flex-row items-start gap-4">
                                            {/* File Icon */}
                                            <div className="flex-shrink-0">
                                                {getFileIcon(doc.file_extension)}
                                            </div>

                                            {/* Document Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-semibold dark:text-gray-100">
                                                            {doc.document_type || 'Document'}
                                                            {doc.document_number && ` - ${doc.document_number}`}
                                                        </h3>
                                                        {doc.description && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                {doc.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {getStatusBadge(doc.status, doc.expiry_date)}
                                                </div>

                                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <Link 
                                                            href={residentShowUrl}
                                                            className="hover:underline hover:text-blue-600"
                                                        >
                                                            {getResidentName(doc)}
                                                        </Link>
                                                    </div>
                                                    {doc.reference_number && (
                                                        <div className="flex items-center gap-1">
                                                            <Tag className="h-3 w-3" />
                                                            <span>Ref: {doc.reference_number}</span>
                                                        </div>
                                                    )}
                                                    {doc.issue_date && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Issued: {formatDate(doc.issue_date)}</span>
                                                        </div>
                                                    )}
                                                    {doc.expiry_date && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Expires: {formatDate(doc.expiry_date)}</span>
                                                        </div>
                                                    )}
                                                    {doc.file_size_human && (
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" />
                                                            <span>{doc.file_size_human}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tags */}
                                                {doc.tags && doc.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {doc.tags.map((tag, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Stats */}
                                                {(doc.view_count !== undefined || doc.download_count !== undefined) && (
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                                        {doc.view_count !== undefined && <span>{doc.view_count} views</span>}
                                                        {doc.download_count !== undefined && <span>{doc.download_count} downloads</span>}
                                                        <span>Uploaded {formatDate(doc.created_at)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Link href={docShowUrl}>
                                                    <Button variant="ghost" size="sm" title="View Document">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {doc.file_path && (
                                                    <Button variant="ghost" size="sm" title="Download Document">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Link href={residentShowUrl}>
                                                    <Button variant="ghost" size="sm" title="View Resident Profile">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};