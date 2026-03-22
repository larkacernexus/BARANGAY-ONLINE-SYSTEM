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
    ExternalLink
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';

interface Document {
    id: number;
    name: string;
    file_name: string;
    file_extension: string;
    file_size_human: string;
    description: string;
    reference_number: string;
    issue_date: string;
    expiry_date: string;
    tags: string[];
    status: string;
    resident: {
        id: number;
        full_name: string;
    };
    uploaded_at: string;
    view_count: number;
    download_count: number;
}

interface ResidentDocumentsTabProps {
    householdId: number;
    documents: Document[];
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
    const [filterStatus, setFilterStatus] = useState('all');

    const getFileIcon = (extension: string) => {
        switch (extension?.toLowerCase()) {
            case 'pdf':
                return <FilePdf className="h-8 w-8 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <FileImage className="h-8 w-8 text-blue-500" />;
            case 'xls':
            case 'xlsx':
                return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
            default:
                return <FileText className="h-8 w-8 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string, expiryDate?: string) => {
        if (status === 'expired') {
            return <Badge variant="destructive">Expired</Badge>;
        }
        
        if (expiryDate) {
            const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            if (daysUntilExpiry <= 30) {
                return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon ({daysUntilExpiry} days)</Badge>;
            }
        }
        
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = searchQuery === '' || 
            doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.reference_number?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <FileText className="h-8 w-8 text-blue-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{totalDocuments}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Documents</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <FileText className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{activeDocuments}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <FileText className="h-8 w-8 text-red-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{expiredDocuments}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Documents List */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="dark:text-gray-100">Resident Documents</CardTitle>
                          
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search documents..."
                                className="pl-9 dark:bg-gray-900 dark:border-gray-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Documents</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    {filteredDocuments.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No documents found</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No documents match your search.' : 'This household has no documents yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDocuments.map((doc) => (
                                <div key={doc.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700">
                                    <div className="flex items-start gap-4">
                                        {/* File Icon */}
                                        <div className="flex-shrink-0">
                                            {getFileIcon(doc.file_extension)}
                                        </div>

                                        {/* Document Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold dark:text-gray-100">{doc.name}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {doc.description || 'No description'}
                                                    </p>
                                                </div>
                                                {getStatusBadge(doc.status, doc.expiry_date)}
                                            </div>

                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <Link href={route('admin.residents.show', doc.resident.id)} className="hover:underline">
                                                        {doc.resident.full_name}
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
                                                        <span>Issued: {new Date(doc.issue_date).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                {doc.expiry_date && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Expires: {new Date(doc.expiry_date).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    <span>{doc.file_size_human}</span>
                                                </div>
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
                                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                                <span>{doc.view_count} views</span>
                                                <span>{doc.download_count} downloads</span>
                                                <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Link href={route('admin.residents.show', doc.resident.id)}>
                                                <Button variant="ghost" size="sm">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};