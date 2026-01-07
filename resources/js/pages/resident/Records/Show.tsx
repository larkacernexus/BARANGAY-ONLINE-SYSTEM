import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  Clock,
  Lock,
  Globe,
  Shield,
  AlertCircle,
  ArrowLeft,
  Share2,
  Printer,
  Copy,
  Trash2,
  File,
  Folder,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Document {
  id: number;
  name: string;
  file_name: string;
  file_extension: string;
  file_size_human: string;
  mime_type: string;
  description?: string;
  reference_number?: string;
  issue_date?: string;
  expiry_date?: string;
  view_count: number;
  download_count: number;
  is_public: boolean;
  requires_password: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  resident: {
    id: number;
    first_name: string;
    last_name: string;
  };
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
}

interface RelatedDocument {
  id: number;
  name: string;
  file_extension: string;
  file_size_human: string;
  created_at: string;
}

interface PageProps {
  document: Document;
  relatedDocuments: RelatedDocument[];
  canDownload: boolean;
  canDelete: boolean;
}

export default function DocumentShow({ document, relatedDocuments, canDownload, canDelete }: PageProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      expired: { label: 'Expired', color: 'bg-red-100 text-red-800', icon: XCircle },
      revoked: { label: 'Revoked', color: 'bg-gray-100 text-gray-800', icon: XCircle },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    }[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };

    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border-0 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getFileIcon = (extension: string) => {
    const icons: Record<string, any> = {
      pdf: FileText,
      doc: FileText,
      docx: FileText,
      xls: FileText,
      xlsx: FileText,
      jpg: File,
      jpeg: File,
      png: File,
      gif: File,
    };
    return icons[extension.toLowerCase()] || File;
  };

  const FileIcon = getFileIcon(document.file_extension);

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      window.location.href = `/my-records/${document.id}/download`;
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    router.delete(`/my-records/${document.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        router.visit('/my-records');
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  const handleCopyReference = () => {
    if (document.reference_number) {
      navigator.clipboard.writeText(document.reference_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isExpired = document.status === 'expired' || 
    (document.expiry_date && new Date(document.expiry_date) < new Date());

  return (
    <ResidentLayout
      title={`Document: ${document.name}`}
      breadcrumbs={[
        { title: 'Dashboard', href: '/resident/dashboard' },
        { title: 'My Records', href: '/my-records' },
        { title: document.name, href: '#' },
      ]}
    >
      <Head title={`Document: ${document.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/my-records">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{document.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="gap-1">
                  <Folder className="h-3 w-3" />
                  {document.category.name}
                </Badge>
                {getStatusBadge(document.status)}
                {document.is_public && (
                  <Badge variant="outline" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Public
                  </Badge>
                )}
                {document.requires_password && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Protected
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Implement share functionality
                alert('Share functionality coming soon!');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {canDownload && (
              <Button
                onClick={handleDownload}
                disabled={isDownloading || document.requires_password}
              >
                {isDownloading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {isExpired && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Document Expired</AlertTitle>
            <AlertDescription>
              This document expired on {formatDate(document.expiry_date)}. Please contact the issuing authority for an updated version.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Document Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gray-100">
                    <FileIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{document.file_name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <File className="h-3 w-3" />
                        {document.file_extension.toUpperCase()} File
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {document.file_size_human}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {document.view_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {document.download_count} downloads
                      </span>
                    </div>
                  </div>
                </div>

                {document.description && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-2">Description</h4>
                    <p className="text-gray-700 whitespace-pre-line">{document.description}</p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Reference Number</h4>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {document.reference_number || 'N/A'}
                      </code>
                      {document.reference_number && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyReference}
                          className="h-7 w-7 p-0"
                        >
                          {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Uploaded By</h4>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{document.resident.first_name} {document.resident.last_name}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Issue Date</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(document.issue_date)}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Expiry Date</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(document.expiry_date)}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Upload Date</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Last Updated</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(document.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={isDownloading || document.requires_password}
                    className="justify-start gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Document
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Implement preview functionality
                      router.get(`/my-records/${document.id}/preview`);
                    }}
                    className="justify-start gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Document
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Implement share functionality
                      router.get(`/my-records/${document.id}/share`);
                    }}
                    className="justify-start gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Document
                  </Button>
                  {canDelete && (
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="justify-start gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? 'Deleting...' : 'Delete Document'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Related Documents */}
          <div className="space-y-6">
            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Access Level</span>
                  <Badge variant={document.is_public ? 'default' : 'secondary'}>
                    {document.is_public ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Password Protected</span>
                  <Badge variant={document.requires_password ? 'default' : 'secondary'}>
                    {document.requires_password ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Document Status</span>
                  {getStatusBadge(document.status)}
                </div>
                {document.requires_password && (
                  <Alert className="mt-4">
                    <Lock className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      This document is password protected. You'll need the password to access it.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Related Documents */}
            {relatedDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Documents</CardTitle>
                  <CardDescription>
                    Other documents in the same category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedDocuments.map((relatedDoc) => {
                      const RelatedFileIcon = getFileIcon(relatedDoc.file_extension);
                      return (
                        <Link
                          key={relatedDoc.id}
                          href={`/my-records/${relatedDoc.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                        >
                          <div className="p-2 rounded-md bg-gray-100">
                            <RelatedFileIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{relatedDoc.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{relatedDoc.file_extension.toUpperCase()}</span>
                              <span>•</span>
                              <span>{relatedDoc.file_size_human}</span>
                            </div>
                          </div>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Document Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{document.view_count}</div>
                    <div className="text-sm text-gray-500">Views</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{document.download_count}</div>
                    <div className="text-sm text-gray-500">Downloads</div>
                  </div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold">{document.file_size_human}</div>
                  <div className="text-sm text-gray-500">File Size</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResidentLayout>
  );
}