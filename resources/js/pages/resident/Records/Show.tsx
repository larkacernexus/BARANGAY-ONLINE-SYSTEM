import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  Printer,
  Copy,
  Trash2,
  File,
  Folder,
  CheckCircle,
  XCircle,
  ArrowRight,
  ChevronLeft,
  Tag,
  Check,
  X,
  ExternalLink,
  Maximize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  X as CloseIcon,
  ChevronRight,
  ShieldCheck,
  FileLock,
  EyeOff,
  MoreVertical,
  Info,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Share,
  Bookmark,
  HardDrive,
  Key,
  Mail,
  Database,
  Search,
  Home,
  Bell,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';

// Interfaces
interface Document {
  id: number;
  name: string;
  file_name?: string;
  file_extension?: string;
  file_size?: number;
  file_size_human?: string;
  mime_type?: string;
  description?: string;
  reference_number?: string;
  issue_date?: string;
  expiry_date?: string;
  view_count?: number;
  download_count?: number;
  is_public?: boolean;
  requires_password: boolean;
  password?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  resident?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
  document_type?: {
    id: number;
    name: string;
    code: string;
  };
  file_path?: string;
  metadata?: Record<string, any> | null;
  tags?: string[];
  uploaded_by?: number;
  uploaded_at?: string;
  uploaded_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  preview_url?: string;
  security_options?: SecurityOptions;
}

interface SecurityOptions {
  add_watermark?: boolean;
  enable_encryption?: boolean;
  audit_log_access?: boolean;
  scan_quality?: 'low' | 'medium' | 'high' | 'original';
  restrict_download?: boolean;
  restrict_print?: boolean;
  max_downloads?: number;
  expiration_days?: number;
  ip_restriction?: string[];
  [key: string]: any;
}

interface RelatedDocument {
  id: number;
  name: string;
  file_extension?: string;
  file_size_human?: string;
  created_at?: string;
  category?: {
    name: string;
  };
  requires_password?: boolean;
}

interface PageProps {
  document: Document;
  relatedDocuments?: RelatedDocument[];
  canDownload?: boolean;
  canDelete?: boolean;
  error?: string;
  needsPassword?: boolean;
  sessionExpiry?: string;
  sessionData?: any;
  debugMode?: boolean;
}

// ==================== HELPER FUNCTIONS ====================
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'Not specified';
  try {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

function formatDateTime(dateString?: string): string {
  if (!dateString) return 'Not specified';
  try {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

function getDocumentStatus(doc: Document): string {
  if (doc.status) return doc.status;
  if (doc.expiry_date && new Date(doc.expiry_date) < new Date()) {
    return 'expired';
  }
  return 'active';
}

function getStatusConfig(status: string) {
  const configs: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
    active: { 
      label: 'Active', 
      color: 'text-green-600', 
      icon: CheckCircle, 
      bgColor: 'bg-green-50 border-green-200' 
    },
    expired: { 
      label: 'Expired', 
      color: 'text-red-600', 
      icon: XCircle, 
      bgColor: 'bg-red-50 border-red-200' 
    },
    revoked: { 
      label: 'Revoked', 
      color: 'text-gray-600', 
      icon: XCircle, 
      bgColor: 'bg-gray-50 border-gray-200' 
    },
    pending: { 
      label: 'Pending', 
      color: 'text-amber-600', 
      icon: AlertCircle, 
      bgColor: 'bg-amber-50 border-amber-200' 
    },
  };
  return configs[status] || { 
    label: status, 
    color: 'text-gray-600', 
    icon: AlertCircle, 
    bgColor: 'bg-gray-50 border-gray-200' 
  };
}

function getFileIcon(extension: string) {
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
    txt: FileText,
    csv: FileText,
    zip: File,
    rar: File,
    mp4: File,
    mp3: File,
  };
  return icons[extension.toLowerCase()] || File;
}

// ==================== FULLSCREEN DOCUMENT VIEWER ====================
function FullScreenDocumentViewer({
  document,
  previewUrl,
  isOpen,
  onClose,
}: {
  document: Document;
  previewUrl: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const safeFileExtension = document.file_extension || '';
  const safeFileSizeHuman = document.file_size_human || formatBytes(document.file_size || 0);
  const isPdf = safeFileExtension.toLowerCase() === 'pdf' || 
                document.mime_type?.includes('pdf') || 
                previewUrl.includes('.pdf');
  const isImage = document.mime_type?.startsWith('image/') || 
                  ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(safeFileExtension.toLowerCase());

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleZoomReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load document preview');
  };

  const handleDownload = () => {
    const downloadUrl = `/my-records/${document.id}/download`;
    window.open(downloadUrl, '_blank');
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    } else if (isImage && previewUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print - ${document.name}</title>
              <style>
                body { margin: 0; padding: 20px; }
                img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              <img src="${previewUrl}" alt="${document.name}" />
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => window.close(), 1000);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleZoomReset = () => setZoom(100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800 text-white">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-300 hover:text-white hover:bg-gray-800 p-2"
          >
            <CloseIcon className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate" title={document.name}>
              {document.name}
            </h2>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <span>{safeFileExtension?.toUpperCase() || 'DOCUMENT'}</span>
              <span>•</span>
              <span>{safeFileSizeHuman}</span>
              <span>•</span>
              <span>{isPdf ? 'PDF' : isImage ? 'Image' : 'Document'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-900 rounded-lg px-2 py-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
              className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
              title="Zoom Out (Ctrl -)"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium px-1 min-w-[45px] text-center cursor-default" title="Zoom Level">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 300}
              className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
              title="Zoom In (Ctrl +)"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomReset}
              className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
              title="Reset Zoom (Ctrl 0)"
            >
              <RotateCw className="h-3 w-3" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 bg-gray-700 mx-1" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
                  title="Print (Ctrl+P)"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-white text-sm">Loading document...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center p-6 max-w-md space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Preview Unavailable</h3>
                <p className="text-gray-300 text-sm">{error}</p>
              </div>
              <Button 
                onClick={handleDownload}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download Instead
              </Button>
            </div>
          </div>
        )}

        {isPdf ? (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            title={`Fullscreen: ${document.name}`}
            className="w-full h-full border-0"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: '0 0',
              width: `${10000 / zoom}%`,
              height: `${10000 / zoom}%`,
            }}
            allow="fullscreen"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        ) : isImage ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={previewUrl}
              alt={document.name}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
              }}
              onLoad={() => {
                setIsLoading(false);
                setError(null);
              }}
              onError={() => {
                setIsLoading(false);
                setError('Failed to load image');
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center p-8 max-w-md space-y-6">
              <div className="inline-block p-6 rounded-full bg-gray-800">
                <FileText className="h-16 w-16 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{document.name}</h3>
                <div className="flex flex-col items-center gap-1 text-gray-300">
                  {safeFileExtension && (
                    <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                      {safeFileExtension.toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm">{safeFileSizeHuman}</span>
                </div>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={handleDownload}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Download Document
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Document View
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-t border-gray-800 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span className="truncate max-w-[200px]" title={document.name}>
            {document.name}
          </span>
          {document.reference_number && (
            <>
              <Separator orientation="vertical" className="h-3 bg-gray-700" />
              <span>Ref: {document.reference_number}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Press ESC to exit fullscreen</span>
          <Separator orientation="vertical" className="h-3 bg-gray-700" />
          <span>Ctrl + +/- to zoom</span>
        </div>
      </div>
    </div>
  );
}

// ==================== MOBILE COMPONENTS ====================
function MobileQuickStats({ document }: { document: Document }) {
  const safeViewCount = document.view_count || 0;
  const safeDownloadCount = document.download_count || 0;
  const safeFileSizeHuman = document.file_size_human || formatBytes(document.file_size || 0);

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <div className="text-center p-3 border rounded-lg bg-blue-50">
        <div className="text-sm font-bold text-blue-600">{safeViewCount}</div>
        <div className="text-[10px] text-gray-600">Views</div>
      </div>
      <div className="text-center p-3 border rounded-lg bg-green-50">
        <div className="text-sm font-bold text-green-600">{safeDownloadCount}</div>
        <div className="text-[10px] text-gray-600">Downloads</div>
      </div>
      <div className="text-center p-3 border rounded-lg bg-gray-50">
        <div className="text-sm font-bold text-gray-600">{safeFileSizeHuman}</div>
        <div className="text-[10px] text-gray-600">Size</div>
      </div>
    </div>
  );
}

function MobileDocumentActions({
  document,
  onDownload,
  onFullscreen,
  onNewTab,
  onPrint,
  onDelete,
  canDownload,
  canDelete,
  isPdf,
  restrictDownload,
  restrictPrint,
}: {
  document: Document;
  onDownload: () => void;
  onFullscreen: () => void;
  onNewTab: () => void;
  onPrint: () => void;
  onDelete: () => void;
  canDownload: boolean;
  canDelete: boolean;
  isPdf: boolean;
  restrictDownload: boolean;
  restrictPrint: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden safe-bottom">
      <div className="flex items-center justify-around py-3 px-2">
        {canDownload && !restrictDownload && (
          <Button
            variant="ghost"
            onClick={onDownload}
            className="flex flex-col items-center p-2 min-w-[60px]"
          >
            <Download className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Download</span>
          </Button>
        )}
        
        <Button
          variant="ghost"
          onClick={onFullscreen}
          className="flex flex-col items-center p-2 min-w-[60px]"
        >
          <Maximize2 className="h-5 w-5 mb-1" />
          <span className="text-[10px]">Fullscreen</span>
        </Button>
        
        {!restrictPrint && (
          <Button
            variant="ghost"
            onClick={onPrint}
            className="flex flex-col items-center p-2 min-w-[60px]"
          >
            <Printer className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Print</span>
          </Button>
        )}
        
        <Link href="/my-records" className="flex flex-col items-center p-2 min-w-[60px]">
          <Button variant="ghost" className="flex flex-col items-center p-0">
            <ArrowLeft className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Back</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MobileDocumentDetails({ document }: { document: Document }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const safeReferenceNumber = document.reference_number || 'N/A';
  const safeResidentName = document.resident ? 
    `${document.resident.first_name} ${document.resident.last_name}` : 
    'Unknown Resident';
  const safeCategoryName = document.category?.name || 'Uncategorized';
  const isExpired = document.status === 'expired' || 
    (document.expiry_date && new Date(document.expiry_date) < new Date());

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
        <span className="font-medium text-gray-900">Document Details</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
              Reference Number
            </label>
            <div className="flex items-center gap-2">
              <code className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono flex-1 truncate">
                {safeReferenceNumber}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (document.reference_number) {
                    navigator.clipboard.writeText(document.reference_number);
                  }
                }}
                className="h-9 w-9 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
              Document Owner
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium truncate">{safeResidentName}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {document.issue_date && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                  Issue Date
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">{formatDate(document.issue_date)}</span>
                </div>
              </div>
            )}

            {document.expiry_date && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                  Expiry Date
                </label>
                <div className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  isExpired 
                    ? "bg-red-50 text-red-700 border border-red-200" 
                    : "bg-gray-50"
                )}>
                  <Clock className="h-3 w-3" />
                  <span className={isExpired ? "font-medium" : ""}>
                    {formatDate(document.expiry_date)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
              Upload Details
            </label>
            <div className="space-y-1">
              {document.created_at && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Upload Date:</span>
                  <span className="font-medium">{formatDate(document.created_at)}</span>
                </div>
              )}
              {document.updated_at && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{formatDate(document.updated_at)}</span>
                </div>
              )}
              {document.uploaded_by_user && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Uploaded By:</span>
                  <span className="font-medium truncate max-w-[50%]">
                    {document.uploaded_by_user.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {document.category && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                Category
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Folder className="h-4 w-4 text-gray-400" />
                <span>{safeCategoryName}</span>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function MobileSecurityInfo({ document, securityOptions }: { document: Document; securityOptions: SecurityOptions }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const safeIsPublic = document.is_public || false;
  const safeRestrictDownload = securityOptions.restrict_download || false;
  const safeRestrictPrint = securityOptions.restrict_print || false;
  const safeAddWatermark = securityOptions.add_watermark || false;
  const safeEnableEncryption = securityOptions.enable_encryption || false;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
        <span className="font-medium text-gray-900">Security & Restrictions</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Access Level</span>
            <Badge variant={safeIsPublic ? 'default' : 'secondary'}>
              {safeIsPublic ? 'Public' : 'Private'}
            </Badge>
          </div>

          {document.requires_password && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Password Protected</span>
              <Check className="h-4 w-4 text-green-600" />
            </div>
          )}

          {(safeAddWatermark || safeEnableEncryption) && (
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Advanced Security</h4>
              <div className="space-y-2">
                {safeAddWatermark && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                      <FileText className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-gray-600">Watermark Protection</span>
                  </div>
                )}
                {safeEnableEncryption && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                      <FileLock className="h-3 w-3 text-purple-600" />
                    </div>
                    <span className="text-gray-600">File Encryption</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(safeRestrictDownload || safeRestrictPrint) && (
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Restrictions</h4>
              <div className="space-y-2">
                {safeRestrictDownload && (
                  <div className="flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600">Download Restricted</span>
                  </div>
                )}
                {safeRestrictPrint && (
                  <div className="flex items-center gap-2 text-sm">
                    <Printer className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600">Print Restricted</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ==================== PASSWORD FORM COMPONENT ====================
function PasswordForm({ document, error, onSubmit, isVerifying }: {
  document: Document;
  error?: string;
  onSubmit: (e: React.FormEvent) => void;
  isVerifying: boolean;
}) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('Please enter a password');
      return;
    }
    onSubmit(e);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Password Required</CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Enter the password to access "{document.name}"
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">Access Expired</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          <Alert className="bg-blue-50 border-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-sm font-medium text-blue-800">
              Protected Document
            </AlertTitle>
            <AlertDescription className="text-sm text-blue-700">
              This document is protected with a password. Access will be granted for 30 minutes.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Document Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                required
                className={cn(
                  "w-full px-3 py-3 text-base border rounded-lg transition-colors",
                  passwordError 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                )}
                placeholder="Enter document password"
                disabled={isVerifying}
                autoComplete="current-password"
              />
              {passwordError && (
                <p className="text-sm text-red-600 mt-1">{passwordError}</p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/my-records" className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-gray-300 hover:bg-gray-50 py-3"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="text-sm">Back</span>
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isVerifying} 
                className="flex-1 py-3"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span className="text-sm">Verifying...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span className="text-sm">Access Document</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function DocumentShow({ 
  document, 
  relatedDocuments = [], 
  canDownload = false, 
  canDelete = false,
  error,
  needsPassword = false,
  sessionExpiry,
  sessionData,
  debugMode = false,
}: PageProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFullscreenViewerOpen, setIsFullscreenViewerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const safeFileExtension = document.file_extension || '';
  const safeFileName = document.file_name || document.name || 'Document';
  const safeFileSizeHuman = document.file_size_human || formatBytes(document.file_size || 0);
  const safeStatus = document.status || getDocumentStatus(document);
  const safeViewCount = document.view_count || 0;
  const safeDownloadCount = document.download_count || 0;
  const safeIsPublic = document.is_public || false;
  const safeDescription = document.description || '';
  const safeReferenceNumber = document.reference_number || 'N/A';
  const safeCategoryName = document.category?.name || 'Uncategorized';
  const safeResidentName = document.resident ? 
    `${document.resident.first_name} ${document.resident.last_name}` : 
    'Unknown Resident';
  const safeMimeType = document.mime_type || '';
  const safeFilePath = document.file_path || '';
  const safeTags = document.tags || [];
  const safeMetadata = document.metadata || {};
  const safeSecurityOptions = document.security_options || {} as SecurityOptions;
  
  const safeScanQuality = safeSecurityOptions.scan_quality || 'Not specified';
  const safeAddWatermark = safeSecurityOptions.add_watermark || false;
  const safeEnableEncryption = safeSecurityOptions.enable_encryption || false;
  const safeAuditLogAccess = safeSecurityOptions.audit_log_access || false;
  const safeRestrictDownload = safeSecurityOptions.restrict_download || false;
  const safeRestrictPrint = safeSecurityOptions.restrict_print || false;

  const isPdf = safeFileExtension.toLowerCase() === 'pdf' || safeMimeType.includes('pdf');
  const isExpired = safeStatus === 'expired' || 
    (document.expiry_date && new Date(document.expiry_date) < new Date());
  const isImage = safeMimeType.startsWith('image/') || 
                  ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(safeFileExtension.toLowerCase());
  const FileIcon = getFileIcon(safeFileExtension);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        handleFullscreen();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        handleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!sessionExpiry || !document.requires_password) return;

    const updateCountdown = () => {
      const expiryTime = new Date(sessionExpiry).getTime();
      const now = new Date().getTime();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeRemaining('00:00');
        setIsSessionExpired(true);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [sessionExpiry, document.requires_password]);

  const handlePdfLoadStart = useCallback(() => {
    setIsLoadingPdf(true);
    setPdfError(null);
  }, []);

  const handlePdfLoad = useCallback(() => {
    setIsLoadingPdf(false);
  }, []);

  const handlePdfError = useCallback(() => {
    setIsLoadingPdf(false);
    setPdfError('Failed to load PDF preview. Please try downloading the file instead.');
  }, []);

  const getPreviewUrl = () => {
    if (document.preview_url) {
      return document.preview_url;
    }
    if (document.file_path) {
      return `/storage/${document.file_path}`;
    }
    return `/my-records/${document.id}/preview`;
  };

  const handleDownload = () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    const downloadUrl = `/my-records/${document.id}/download`;
    window.open(downloadUrl, '_blank');
    
    setTimeout(() => setIsDownloading(false), 1000);
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('Please enter a password');
      return;
    }

    setIsVerifying(true);
    setPasswordError('');

    router.post(`/my-records/${document.id}/verify-password`, {
      password: password,
    }, {
      preserveScroll: true,
      preserveState: false,
      onError: (errors) => {
        setPasswordError(errors.password || 'Invalid password. Please try again.');
        setIsVerifying(false);
      },
      onFinish: () => setIsVerifying(false),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const openPdfInNewTab = () => {
    window.open(getPreviewUrl(), '_blank');
  };

  const handleFullscreen = () => {
    setIsFullscreenViewerOpen(true);
  };

  const showPasswordForm = needsPassword || 
                          (document.requires_password && !sessionExpiry);

  if (showPasswordForm) {
    return (
      <ResidentLayout
        title="Password Required"
        breadcrumbs={[
          { title: 'Dashboard', href: '/resident/dashboard' },
          { title: 'My Records', href: '/my-records' },
          { title: 'Password Required', href: '#' },
        ]}
      >
        <Head title="Password Required" />
        <PasswordForm
          document={document}
          error={error}
          onSubmit={handlePasswordSubmit}
          isVerifying={isVerifying}
        />
      </ResidentLayout>
    );
  }

  // MOBILE LAYOUT
  if (isMobile) {
    return (
      <>
        <FullScreenDocumentViewer
          document={document}
          previewUrl={getPreviewUrl()}
          isOpen={isFullscreenViewerOpen}
          onClose={() => setIsFullscreenViewerOpen(false)}
        />

        <ResidentLayout
          title={`${document.name} - My Records`}
          breadcrumbs={[
            { title: 'Dashboard', href: '/resident/dashboard' },
            { title: 'My Records', href: '/my-records' },
            { title: document.name, href: '#' },
          ]}
          hideMobileFooter={true}
        >
          <Head title={`${document.name} - My Records`} />

          <div className="min-h-screen pb-24">
            <div className="sticky top-0 z-40 bg-white border-b">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <Link href="/my-records" className="flex-shrink-0">
                    <Button variant="ghost" size="sm" className="gap-1 p-2">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-50">
                        <FileIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <h1 className="text-sm font-bold text-gray-900 truncate" title={document.name}>
                        {document.name}
                      </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                        <Folder className="h-2.5 w-2.5 mr-1" />
                        {safeCategoryName}
                      </Badge>
                      
                      <div className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                        getStatusConfig(safeStatus).bgColor,
                        getStatusConfig(safeStatus).color
                      )}>
                        {(() => {
                          const Icon = getStatusConfig(safeStatus).icon;
                          return <Icon className="h-2.5 w-2.5" />;
                        })()}
                        {getStatusConfig(safeStatus).label}
                      </div>
                    </div>
                  </div>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-xl">
                      <SheetHeader className="text-left">
                        <SheetTitle>Document Actions</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4 space-y-2">
                        {canDownload && !safeRestrictDownload && (
                          <Button
                            onClick={handleDownload}
                            className="w-full justify-start gap-3 h-12"
                            variant="outline"
                          >
                            <Download className="h-5 w-5" />
                            <span>Download</span>
                          </Button>
                        )}
                        
                        <Button
                          onClick={handleFullscreen}
                          className="w-full justify-start gap-3 h-12"
                          variant="outline"
                        >
                          <Maximize2 className="h-5 w-5" />
                          <span>Fullscreen View</span>
                        </Button>
                        
                        {!safeRestrictPrint && (
                          <Button
                            onClick={handlePrint}
                            className="w-full justify-start gap-3 h-12"
                            variant="outline"
                          >
                            <Printer className="h-5 w-5" />
                            <span>Print</span>
                          </Button>
                        )}
                        
                        {canDelete && (
                          <Button
                            onClick={handleDelete}
                            className="w-full justify-start gap-3 h-12 text-red-600"
                            variant="outline"
                          >
                            <Trash2 className="h-5 w-5" />
                            <span>Delete</span>
                          </Button>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            <div className="px-4 py-4">
              <MobileQuickStats document={document} />

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      {isPdf ? (
                        <div className="space-y-3">
                          <div className="border rounded-lg overflow-hidden bg-gray-50 h-[300px]">
                            {isLoadingPdf && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 z-10">
                                <div className="text-center space-y-2">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                                  <p className="text-gray-600 font-medium text-sm">Loading PDF...</p>
                                </div>
                              </div>
                            )}
                            
                            {pdfError && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 z-10">
                                <div className="text-center p-4 max-w-md space-y-3">
                                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                                  <div>
                                    <h3 className="text-base font-medium text-gray-900 mb-1">Preview Unavailable</h3>
                                    <p className="text-gray-600 text-sm">{pdfError}</p>
                                  </div>
                                  {!safeRestrictDownload && (
                                    <Button onClick={handleDownload} className="gap-2 text-sm">
                                      <Download className="h-4 w-4" />
                                      Download Instead
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <iframe
                              src={getPreviewUrl()}
                              title={document.name}
                              className="w-full h-full"
                              style={{
                                transform: `scale(${zoomLevel / 100})`,
                                transformOrigin: '0 0',
                                width: `${10000 / zoomLevel}%`,
                                height: `${10000 / zoomLevel}%`,
                              }}
                              onLoad={handlePdfLoad}
                              onLoadStart={handlePdfLoadStart}
                              onError={handlePdfError}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setZoomLevel(prev => Math.max(prev - 25, 50))}
                                disabled={zoomLevel <= 50}
                                className="h-7 w-7 p-0"
                              >
                                <ZoomOut className="h-3 w-3" />
                              </Button>
                              <span className="text-xs font-medium px-1">{zoomLevel}%</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setZoomLevel(prev => Math.min(prev + 25, 200))}
                                disabled={zoomLevel >= 200}
                                className="h-7 w-7 p-0"
                              >
                                <ZoomIn className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleFullscreen}
                              className="h-7 px-2 text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              <Maximize2 className="h-3 w-3 mr-1" />
                              Fullscreen
                            </Button>
                          </div>
                        </div>
                      ) : isImage && safeFilePath ? (
                        <div className="border rounded-lg overflow-hidden bg-gray-50">
                          <img 
                            src={`/storage/${safeFilePath}`}
                            alt={document.name}
                            className="w-full h-auto max-h-[50vh] object-contain mx-auto"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                          <div className="inline-block p-3 rounded-full bg-white border-4 border-gray-100 mb-3">
                            <FileIcon className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="font-semibold text-base text-gray-900 mb-2">{safeFileName}</h3>
                          <div className="flex flex-col items-center gap-1 text-sm text-gray-600 mb-4">
                            {safeFileExtension && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {safeFileExtension.toUpperCase()}
                              </span>
                            )}
                            <span className="text-xs">{safeFileSizeHuman}</span>
                          </div>
                          {!safeRestrictDownload && (
                            <Button 
                              onClick={handleDownload}
                              disabled={isDownloading}
                              className="gap-2 text-sm"
                            >
                              <Download className="h-4 w-4" />
                              {isDownloading ? 'Downloading...' : 'Download File'}
                            </Button>
                          )}
                        </div>
                      )}

                      {safeDescription && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium text-gray-700 text-sm mb-2">Description</h4>
                          <p className="text-gray-600 text-sm">{safeDescription}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <MobileSecurityInfo document={document} securityOptions={safeSecurityOptions} />
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <MobileDocumentDetails document={document} />

                  {relatedDocuments.length > 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Related Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {relatedDocuments.slice(0, 3).map((relatedDoc) => {
                            const RelatedFileIcon = getFileIcon(relatedDoc.file_extension || '');
                            return (
                              <Link
                                key={relatedDoc.id}
                                href={`/my-records/${relatedDoc.id}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="p-2 rounded-md bg-gray-100">
                                  <RelatedFileIcon className="h-4 w-4 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate" title={relatedDoc.name}>
                                    {relatedDoc.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                    {relatedDoc.file_extension && (
                                      <span>{relatedDoc.file_extension.toUpperCase()}</span>
                                    )}
                                    {relatedDoc.file_size_human && (
                                      <>
                                        <span>•</span>
                                        <span>{relatedDoc.file_size_human}</span>
                                      </>
                                    )}
                                    {relatedDoc.requires_password && (
                                      <Lock className="h-3 w-3 text-amber-500" />
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </Link>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {safeTags.length > 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Tags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {safeTags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              <Tag className="h-3 w-3" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <MobileDocumentActions
              document={document}
              onDownload={handleDownload}
              onFullscreen={handleFullscreen}
              onNewTab={openPdfInNewTab}
              onPrint={handlePrint}
              onDelete={handleDelete}
              canDownload={canDownload}
              canDelete={canDelete}
              isPdf={isPdf}
              restrictDownload={safeRestrictDownload}
              restrictPrint={safeRestrictPrint}
            />
          </div>
        </ResidentLayout>
      </>
    );
  }

  // DESKTOP LAYOUT
  return (
    <>
      <FullScreenDocumentViewer
        document={document}
        previewUrl={getPreviewUrl()}
        isOpen={isFullscreenViewerOpen}
        onClose={() => setIsFullscreenViewerOpen(false)}
      />

      <ResidentLayout
        title={`${document.name} - My Records`}
        breadcrumbs={[
          { title: 'Dashboard', href: '/resident/dashboard' },
          { title: 'My Records', href: '/my-records' },
          { title: document.name, href: '#' },
        ]}
      >
        <Head title={`${document.name} - My Records`} />

        <div className="pb-6">
          <div className="bg-white border-b">
            <div className="px-6 py-6">
              <div className="flex items-start gap-3">
                <Link href="/my-records">
                  <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <FileIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 truncate" title={document.name}>
                      {document.name}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "gap-1.5 border",
                      document.category ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    )}>
                      <Folder className="h-3 w-3" />
                      {safeCategoryName}
                    </Badge>
                    
                    {safeIsPublic && (
                      <Badge variant="outline" className="gap-1.5 bg-green-50 text-green-700 border-green-200">
                        <Globe className="h-3 w-3" />
                        Public
                      </Badge>
                    )}
                    
                    {document.requires_password && (
                      <Badge variant="outline" className="gap-1.5 bg-amber-50 text-amber-700 border-amber-200">
                        <Lock className="h-3 w-3" />
                        Protected
                        {timeRemaining && !isSessionExpired && (
                          <span className="ml-1 font-mono">{timeRemaining}</span>
                        )}
                      </Badge>
                    )}

                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
                      getStatusConfig(safeStatus).bgColor,
                      getStatusConfig(safeStatus).color
                    )}>
                      {(() => {
                        const Icon = getStatusConfig(safeStatus).icon;
                        return <Icon className="h-3 w-3" />;
                      })()}
                      {getStatusConfig(safeStatus).label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={handleFullscreen}
                          className="gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Maximize2 className="h-4 w-4" />
                          Fullscreen
                          <kbd className="ml-2 text-xs bg-white border border-blue-300 rounded px-1 py-0.5">
                            F11
                          </kbd>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Open in fullscreen mode (F11 or Ctrl+F)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {canDownload && !safeRestrictDownload && (
                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="gap-2"
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Downloading</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="icon" className="hidden lg:inline-flex">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
           
            {(safeRestrictDownload || safeRestrictPrint) && (
              <div className="mb-4 space-y-2">
                {safeRestrictDownload && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-sm font-medium text-amber-800">
                      Download Restricted
                    </AlertTitle>
                    <AlertDescription className="text-sm text-amber-700">
                      Downloading this document is not permitted.
                    </AlertDescription>
                  </Alert>
                )}
                {safeRestrictPrint && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <Printer className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-sm font-medium text-amber-800">
                      Print Restricted
                    </AlertTitle>
                    <AlertDescription className="text-sm text-amber-700">
                      Printing this document is not permitted.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Document Preview</CardTitle>
                      {isPdf && (
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setZoomLevel(prev => Math.max(prev - 25, 50))}
                                  disabled={zoomLevel <= 50}
                                  className="h-8 w-8 p-0"
                                >
                                  <ZoomOut className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Zoom Out</TooltipContent>
                            </Tooltip>

                            <span className="text-sm font-medium px-2">{zoomLevel}%</span>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setZoomLevel(prev => Math.min(prev + 25, 200))}
                                  disabled={zoomLevel >= 200}
                                  className="h-8 w-8 p-0"
                                >
                                  <ZoomIn className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Zoom In</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setZoomLevel(100)}
                                  className="h-8 w-8 p-0"
                                >
                                  <RotateCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reset Zoom</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isPdf ? (
                      <div className="relative border rounded-lg overflow-hidden bg-gray-50 h-[500px]">
                        {isLoadingPdf && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 z-10">
                            <div className="text-center space-y-3">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                              <p className="text-gray-600 font-medium text-base">Loading PDF preview...</p>
                            </div>
                          </div>
                        )}
                        
                        {pdfError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 z-10">
                            <div className="text-center p-6 max-w-md space-y-4">
                              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Unavailable</h3>
                                <p className="text-gray-600 text-base">{pdfError}</p>
                              </div>
                              {!safeRestrictDownload && (
                                <Button onClick={handleDownload} className="gap-2 text-base">
                                  <Download className="h-4 w-4" />
                                  Download Instead
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <iframe
                          src={getPreviewUrl()}
                          title={document.name}
                          className="w-full h-full"
                          style={{
                            transform: `scale(${zoomLevel / 100})`,
                            transformOrigin: '0 0',
                            width: `${10000 / zoomLevel}%`,
                            height: `${10000 / zoomLevel}%`,
                          }}
                          onLoad={handlePdfLoad}
                          onLoadStart={handlePdfLoadStart}
                          onError={handlePdfError}
                        />
                      </div>
                    ) : isImage && safeFilePath ? (
                      <div className="border rounded-lg overflow-hidden bg-gray-50">
                        <img 
                          src={`/storage/${safeFilePath}`}
                          alt={document.name}
                          className="w-full h-auto max-h-[400px] object-contain mx-auto"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <div className="inline-block p-4 rounded-full bg-white border-4 border-gray-100 mb-4">
                          <FileIcon className="h-16 w-16 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{safeFileName}</h3>
                        <div className="flex flex-col items-center gap-1 text-sm text-gray-600 mb-6">
                          {safeFileExtension && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                              {safeFileExtension.toUpperCase()}
                            </span>
                          )}
                          <span className="text-sm">{safeFileSizeHuman}</span>
                          {safeViewCount > 0 && (
                            <span className="flex items-center gap-1 text-sm">
                              <Eye className="h-4 w-4" />
                              {safeViewCount} views
                            </span>
                          )}
                        </div>
                        {!safeRestrictDownload && (
                          <Button 
                            onClick={handleDownload}
                            disabled={isDownloading}
                            size="lg"
                            className="gap-2 text-base"
                          >
                            <Download className="h-5 w-5" />
                            {isDownloading ? 'Downloading...' : 'Download File'}
                          </Button>
                        )}
                      </div>
                    )}

                    {safeDescription && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-medium text-gray-700 text-base mb-2">Description</h4>
                        <p className="text-gray-600 whitespace-pre-line text-base">{safeDescription}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Document Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                            Reference Number
                          </label>
                          <div className="flex items-center gap-2">
                            <code className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono flex-1 truncate">
                              {safeReferenceNumber}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (document.reference_number) {
                                  navigator.clipboard.writeText(document.reference_number);
                                }
                              }}
                              className="h-9 w-9 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                            Document Owner
                          </label>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-base truncate">{safeResidentName}</span>
                          </div>
                        </div>

                        {document.issue_date && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                              Issue Date
                            </label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-base">{formatDate(document.issue_date)}</span>
                            </div>
                          </div>
                        )}

                        {document.document_type && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                              Document Type
                            </label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-base">{document.document_type.name}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                            Expiry Date
                          </label>
                          <div className={cn(
                            "flex items-center gap-2 p-3 rounded-lg text-base",
                            isExpired 
                              ? "bg-red-50 text-red-700 border border-red-200" 
                              : "bg-gray-50"
                          )}>
                            <Clock className="h-4 w-4" />
                            <span className={isExpired ? "font-medium" : ""}>
                              {formatDate(document.expiry_date)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                            Upload Details
                          </label>
                          <div className="space-y-2">
                            {document.created_at && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Upload Date:</span>
                                <span className="font-medium">{formatDate(document.created_at)}</span>
                              </div>
                            )}
                            {document.uploaded_at && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Upload Time:</span>
                                <span className="font-medium">{formatDateTime(document.uploaded_at)}</span>
                              </div>
                            )}
                            {document.updated_at && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Last Updated:</span>
                                <span className="font-medium">{formatDate(document.updated_at)}</span>
                              </div>
                            )}
                            {document.uploaded_by_user && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Uploaded By:</span>
                                <span className="font-medium truncate max-w-[50%]">
                                  {document.uploaded_by_user.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {safeScanQuality && safeScanQuality !== 'Not specified' && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                              Scan Quality
                            </label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <Shield className="h-4 w-4 text-gray-400" />
                              <span className="text-base capitalize">{safeScanQuality.replace('_', ' ')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {safeMetadata && Object.keys(safeMetadata).length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-700 text-base">Metadata</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {}}
                            className="text-xs"
                          >
                            Show Metadata
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500">
                          {Object.keys(safeMetadata).length} metadata fields available
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                      Security & Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {document.requires_password && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Password Protection</span>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            {timeRemaining && !isSessionExpired && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                {timeRemaining}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Access Level</span>
                        <Badge variant={safeIsPublic ? 'default' : 'secondary'}>
                          {safeIsPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Document Status</span>
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                          getStatusConfig(safeStatus).bgColor,
                          getStatusConfig(safeStatus).color
                        )}>
                          {(() => {
                            const Icon = getStatusConfig(safeStatus).icon;
                            return <Icon className="h-3 w-3" />;
                          })()}
                          {getStatusConfig(safeStatus).label}
                        </div>
                      </div>
                    </div>

                    {(safeAddWatermark || safeEnableEncryption || safeAuditLogAccess) && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Security</h4>
                        <div className="space-y-2">
                          {safeAddWatermark && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                                <FileText className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="text-gray-600">Watermark Protection</span>
                            </div>
                          )}
                          {safeEnableEncryption && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                                <FileLock className="h-3 w-3 text-purple-600" />
                              </div>
                              <span className="text-gray-600">File Encryption</span>
                            </div>
                          )}
                          {safeAuditLogAccess && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center">
                                <EyeOff className="h-3 w-3 text-amber-600" />
                              </div>
                              <span className="text-gray-600">Access Audit Log</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(safeRestrictDownload || safeRestrictPrint) && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Restrictions</h4>
                        <div className="space-y-2">
                          {safeRestrictDownload && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                                <Download className="h-3 w-3 text-red-600" />
                              </div>
                              <span className="text-gray-600">Download Restricted</span>
                            </div>
                          )}
                          {safeRestrictPrint && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                                <Printer className="h-3 w-3 text-red-600" />
                              </div>
                              <span className="text-gray-600">Print Restricted</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Document Statistics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 border rounded-lg bg-blue-50 border-blue-100">
                          <div className="text-xl font-bold text-blue-600">{safeViewCount}</div>
                          <div className="text-xs text-gray-600">Total Views</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg bg-green-50 border-green-100">
                          <div className="text-xl font-bold text-green-600">{safeDownloadCount}</div>
                          <div className="text-xs text-gray-600">Downloads</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {canDownload && !safeRestrictDownload && (
                      <Button
                        variant="outline"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full justify-start gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Document
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={handleFullscreen}
                      className="w-full justify-start gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      <Maximize2 className="h-4 w-4" />
                      Fullscreen View
                      <span className="ml-auto text-xs text-blue-500">F11</span>
                    </Button>
                    
                    {isPdf && !safeRestrictPrint && (
                      <Button
                        variant="outline"
                        onClick={openPdfInNewTab}
                        className="w-full justify-start gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in New Tab
                      </Button>
                    )}
                    
                    {!safeRestrictPrint && (
                      <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="w-full justify-start gap-2"
                      >
                        <Printer className="h-4 w-4" />
                        Print
                      </Button>
                    )}
                    
                    <Link href="/my-records" className="block">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to All Documents
                      </Button>
                    </Link>
                    
                    {document.requires_password && isSessionExpired && (
                      <Button
                        variant="destructive"
                        onClick={() => window.location.reload()}
                        className="w-full justify-start gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Re-enter Password
                      </Button>
                    )}
                    
                    {canDelete && (
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full justify-start gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting ? 'Deleting...' : 'Delete Document'}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {relatedDocuments.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold">Related Documents</CardTitle>
                      <CardDescription className="text-sm">
                        Other documents in {safeCategoryName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {relatedDocuments.map((relatedDoc) => {
                          const RelatedFileIcon = getFileIcon(relatedDoc.file_extension || '');
                          const isRelatedPdf = relatedDoc.file_extension?.toLowerCase() === 'pdf';
                          
                          return (
                            <Link
                              key={relatedDoc.id}
                              href={`/my-records/${relatedDoc.id}`}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className={cn(
                                "p-2 rounded-md flex-shrink-0",
                                isRelatedPdf 
                                  ? "bg-blue-50 group-hover:bg-blue-100" 
                                  : "bg-gray-100 group-hover:bg-gray-200"
                              )}>
                                <RelatedFileIcon className="h-4 w-4 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate" title={relatedDoc.name}>
                                  {relatedDoc.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                  {relatedDoc.file_extension && (
                                    <span>{relatedDoc.file_extension.toUpperCase()}</span>
                                  )}
                                  {relatedDoc.file_size_human && (
                                    <>
                                      <span>•</span>
                                      <span>{relatedDoc.file_size_human}</span>
                                    </>
                                  )}
                                  {relatedDoc.requires_password && (
                                    <Lock className="h-3 w-3 text-amber-500" />
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </Link>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {safeTags.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {safeTags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </ResidentLayout>
    </>
  );
}