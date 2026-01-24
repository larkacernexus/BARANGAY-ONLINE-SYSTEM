import { useEffect, useState, useCallback } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft,
    Download,
    Printer,
    FileText,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    DollarSign,
    User,
    FileCheck,
    MessageSquare,
    History,
    Loader2,
    Eye,
    Copy,
    Shield,
    Building,
    Zap,
    FileType,
    Layers,
    Receipt,
    X,
    Image as ImageIcon,
    FileImage,
    Phone,
    MapPin,
    CreditCard,
    Banknote,
    Store
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';

// Import mobile footer
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';

// Status configuration - Simplified since no online payment
const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
    ready_for_payment: { label: 'Ready for Payment', color: 'bg-orange-100 text-orange-800', icon: DollarSign },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    issued: { label: 'Issued', color: 'bg-purple-100 text-purple-800', icon: FileCheck },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

// Urgency configuration
const URGENCY_CONFIG = {
    normal: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    rush: { label: 'Rush', color: 'bg-orange-100 text-orange-800' },
    express: { label: 'Express', color: 'bg-red-100 text-red-800' },
};

// Define interfaces based on your database schema
interface DocumentType {
    id: number;
    name: string;
}

interface ClearanceDocument {
    id: number;
    file_path: string;
    file_name: string;
    original_name?: string;
    description?: string;
    file_size: number;
    file_type?: string;
    mime_type?: string;
    is_verified: boolean;
    document_type_id?: number;
    clearance_request_id: number;
    created_at: string;
    updated_at: string;
    document_type?: DocumentType;
}

interface Payment {
    id: number;
    or_number: string;
    payment_method: string;
    reference_number?: string;
    total_amount: number | string;
    payment_date: string;
    status: string;
    payer_name: string;
    purpose: string;
    remarks?: string;
}

interface PaymentItem {
    id: number;
    payment_id: number;
    clearance_request_id: number;
    fee_name: string;
    fee_code: string;
    base_amount: number | string;
    surcharge: number | string;
    penalty: number | string;
    total_amount: number | string;
    description?: string;
    category: string;
    period_covered?: string;
    created_at: string;
    updated_at: string;
    payment?: Payment;
}

interface StatusHistory {
    id: number;
    clearance_request_id: number;
    status: string;
    remarks?: string;
    created_at: string;
    updated_at: string;
    causer?: {
        id: number;
        name: string;
        type: string;
    };
}

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description?: string;
    fee: number | string;
    processing_days: number;
    validity_days?: number;
    requires_payment: boolean;
    requires_approval: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    household_id: number;
}

interface ClearanceRequest {
    id: number;
    resident_id: number;
    clearance_type_id?: number;
    reference_number: string;
    clearance_number?: string;
    status: string;
    purpose: string;
    specific_purpose?: string;
    urgency: 'normal' | 'rush' | 'express';
    needed_date: string;
    additional_requirements?: string;
    fee_amount: number | string;
    issue_date?: string;
    valid_until?: string;
    remarks?: string;
    issuing_officer_name?: string;
    created_at: string;
    updated_at: string;
    
    // Relationships
    clearance_type?: ClearanceType;
    resident?: Resident;
    documents?: ClearanceDocument[];
    status_history?: StatusHistory[];
    payment_items?: PaymentItem[];
}

interface PageProps {
    clearance: ClearanceRequest;
    payment_items?: PaymentItem[];
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get file type
const getFileType = (document: ClearanceDocument): 'image' | 'pdf' | 'other' => {
    const { mime_type, file_name, file_type } = document;
    
    // Check for images
    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    if (mime_type && imageMimeTypes.includes(mime_type.toLowerCase())) {
        return 'image';
    }
    
    if (file_name && imageExtensions.some(ext => file_name.toLowerCase().endsWith(ext))) {
        return 'image';
    }
    
    if (file_type && file_type.toLowerCase().includes('image')) {
        return 'image';
    }
    
    // Check for PDF
    if (mime_type && mime_type.toLowerCase() === 'application/pdf') {
        return 'pdf';
    }
    
    if (file_name && file_name.toLowerCase().endsWith('.pdf')) {
        return 'pdf';
    }
    
    if (file_type && file_type.toLowerCase().includes('pdf')) {
        return 'pdf';
    }
    
    return 'other';
};

// Helper function to download file
const downloadFile = async (url: string, filename: string) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        }, 100);
        
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
};

// Mobile-friendly Document viewer modal component
function DocumentViewerModal({ 
    document: doc,
    isOpen, 
    onClose 
}: { 
    document: ClearanceDocument;
    isOpen: boolean; 
    onClose: () => void 
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    const fileType = getFileType(doc);
    const documentUrl = `/storage/${doc.file_path}`;
    
    // Handle download
    const handleDownload = useCallback(async () => {
        setIsDownloading(true);
        setError(null);
        
        try {
            await downloadFile(documentUrl, doc.original_name || doc.file_name);
        } catch (error) {
            console.error('Download failed:', error);
            setError('Failed to download document. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    }, [documentUrl, doc.original_name, doc.file_name]);
    
    // Handle iframe load
    const handleIframeLoad = () => {
        setIsLoading(false);
    };
    
    // Handle image load/error
    const handleImageLoad = () => {
        setIsLoading(false);
    };
    
    const handleImageError = () => {
        setError('Failed to load image');
        setIsLoading(false);
    };
    
    // Set mounted state
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    // Handle keyboard events
    useEffect(() => {
        if (!isMounted || !isOpen) return;
        
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            if (typeof window !== 'undefined' && typeof document !== 'undefined') {
                document.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = 'unset';
            }
        };
    }, [isMounted, isOpen, onClose]);
    
    // Reset states when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setError(null);
        }
    }, [isOpen]);
    
    if (!isMounted || !isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {fileType === 'image' ? (
                                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            ) : fileType === 'pdf' ? (
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            ) : (
                                <FileType className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                                {doc.original_name || doc.file_name}
                            </h3>
                            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 flex-wrap">
                                <span className="truncate">{formatFileSize(doc.file_size)}</span>
                                {doc.document_type && (
                                    <>
                                        <span>•</span>
                                        <span className="truncate">{doc.document_type.name}</span>
                                    </>
                                )}
                                {fileType === 'image' && <span>• Image</span>}
                                {fileType === 'pdf' && <span>• PDF</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="gap-1 h-8 px-2 sm:px-3"
                        >
                            {isDownloading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Download className="h-3 w-3" />
                            )}
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-auto touch-pan-y">
                    {error ? (
                        <div className="h-full flex items-center justify-center p-4 sm:p-8">
                            <div className="text-center">
                                <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-red-400" />
                                <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-base">{error}</p>
                                <div className="mt-4 sm:mt-6 space-y-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="gap-2 w-full sm:w-auto"
                                    >
                                        {isDownloading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4" />
                                        )}
                                        Try Downloading Instead
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        onClick={onClose}
                                        className="w-full sm:w-auto"
                                    >
                                        Close Viewer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : fileType === 'image' ? (
                        <div className="h-full flex items-center justify-center p-2 sm:p-4">
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src={documentUrl}
                                    alt={doc.original_name || doc.file_name}
                                    className="max-w-full max-h-full object-contain rounded-lg touch-pan-x touch-pan-y"
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                    style={{ display: isLoading ? 'none' : 'block' }}
                                />
                                {isLoading && (
                                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-400" />
                                        <p className="text-xs sm:text-sm text-gray-500">Loading image...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : fileType === 'pdf' ? (
                        <div className="h-full relative">
                            <iframe
                                src={documentUrl}
                                title={doc.original_name || doc.file_name}
                                className="w-full h-full border-0"
                                onLoad={handleIframeLoad}
                                onError={() => {
                                    setError('Failed to load PDF');
                                    setIsLoading(false);
                                }}
                            />
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white">
                                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-400" />
                                        <p className="text-xs sm:text-sm text-gray-500">Loading PDF...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-4 sm:p-8">
                            <div className="text-center">
                                <FileType className="h-10 w-10 sm:h-16 sm:w-16 mx-auto text-gray-400" />
                                <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-base">
                                    Preview not available for this file type
                                </p>
                                <div className="mt-4 sm:mt-6 space-y-2">
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        File type: {doc.mime_type || doc.file_type || 'Unknown'}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        File size: {formatFileSize(doc.file_size)}
                                    </p>
                                    <Button
                                        variant="default"
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="gap-2 w-full sm:w-auto"
                                    >
                                        {isDownloading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4" />
                                        )}
                                        Download File
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                {doc.description && (
                    <div className="p-3 sm:p-4 border-t bg-gray-50">
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                            <span className="font-medium">Description:</span> {doc.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Mobile-friendly Document thumbnail component
function DocumentThumbnail({ 
    document: doc,
    onView 
}: { 
    document: ClearanceDocument;
    onView: () => void;
}) {
    const fileType = getFileType(doc);
    const documentUrl = `/storage/${doc.file_path}`;
    const [imageError, setImageError] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    if (!isMounted) {
        return (
            <div className="h-32 sm:h-48 w-full border border-gray-200 rounded-lg bg-gray-100 animate-pulse" />
        );
    }
    
    return (
        <div 
            className="relative group cursor-pointer active:scale-[0.98] transition-transform touch-manipulation"
            onClick={onView}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onView();
                }
            }}
        >
            {fileType === 'image' ? (
                <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <img
                        src={documentUrl}
                        alt={doc.original_name || doc.file_name}
                        className="h-32 sm:h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                    {imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <FileImage className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 text-white p-1 sm:p-2 rounded-full">
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-32 sm:h-48 w-full border border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center p-2 sm:p-4 group-hover:bg-gray-100 transition-colors duration-300">
                    {fileType === 'pdf' ? (
                        <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-red-400 mb-1 sm:mb-2" />
                    ) : (
                        <FileType className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-1 sm:mb-2" />
                    )}
                    <p className="text-xs sm:text-sm text-gray-600 text-center truncate w-full px-1">
                        {doc.original_name || doc.file_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                        {formatFileSize(doc.file_size)}
                    </p>
                </div>
            )}
            
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                {fileType === 'image' ? (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-white/90 px-1.5 py-0.5">
                        Image
                    </Badge>
                ) : fileType === 'pdf' ? (
                    <Badge variant="destructive" className="text-[10px] sm:text-xs bg-white/90 px-1.5 py-0.5">
                        PDF
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-[10px] sm:text-xs bg-white/90 px-1.5 py-0.5">
                        Document
                    </Badge>
                )}
            </div>
        </div>
    );
}

// Payment Methods Component
function PaymentMethodsInfo() {
    return (
        <Card>
            <CardHeader className="py-3 lg:py-4">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <Banknote className="h-4 w-4 lg:h-5 lg:w-5" />
                    Payment Methods
                </CardTitle>
            </CardHeader>
            <CardContent className="py-3 lg:py-4 space-y-3 lg:space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start gap-3">
                        <Store className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm lg:text-base">Over-the-Counter</p>
                            <p className="text-xs lg:text-sm text-gray-500">
                                Pay at the Barangay Treasurer's Office during office hours
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm lg:text-base">Accepted Payments</p>
                            <p className="text-xs lg:text-sm text-gray-500">
                                • Cash<br />
                                • Manager's Check<br />
                                • Postal Money Order
                            </p>
                        </div>
                    </div>
                    
                    <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-700 text-xs lg:text-sm">
                            Please bring your valid ID and this reference number when paying.
                        </AlertDescription>
                    </Alert>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ClearanceDetail({ clearance, payment_items = [] }: PageProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [isDownloadingClearance, setIsDownloadingClearance] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [viewingDocument, setViewingDocument] = useState<ClearanceDocument | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Use payment_items from props or from clearance object
    const paymentItems = payment_items || clearance.payment_items || [];

    // Calculate total paid amount from payment items
    const calculateTotalPaid = (): number => {
        let total = 0;
        paymentItems.forEach(item => {
            const amount = typeof item.total_amount === 'string' 
                ? parseFloat(item.total_amount) 
                : item.total_amount;
            if (!isNaN(amount)) {
                total += amount;
            }
        });
        return total;
    };

    // Set client state
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Set document title
    useEffect(() => {
        if (isClient) {
            document.title = `Clearance #${clearance.reference_number} | Barangay System`;
        }
    }, [clearance.reference_number, isClient]);

    // Helper function to format currency
    const formatCurrency = (amount: any): string => {
        if (amount == null) return '₱0.00';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return isNaN(num) ? '₱0.00' : `₱${num.toFixed(2)}`;
    };

    // Helper function to format date safely
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string | null | undefined): string => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    };

    const getUrgencyBadge = (urgency: string) => {
        const config = URGENCY_CONFIG[urgency as keyof typeof URGENCY_CONFIG];
        if (!config) return null;
        
        return (
            <Badge className={`${config.color} flex items-center gap-1 text-xs sm:text-sm`}>
                {urgency === 'rush' || urgency === 'express' ? (
                    <Zap className="h-3 w-3" />
                ) : null}
                {config.label}
            </Badge>
        );
    };

    // Handle document download
    const handleDocumentDownload = async (document: ClearanceDocument) => {
        if (!isClient) return;
        
        try {
            await downloadFile(
                `/storage/${document.file_path}`,
                document.original_name || document.file_name
            );
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download document. Please try again.');
        }
    };

    // Handle clearance download
    const handleClearanceDownload = async () => {
        if (!isClient) return;
        
        setIsDownloadingClearance(true);
        try {
            await downloadFile(
                `/my-clearances/${clearance.id}/download`,
                `clearance-${clearance.reference_number}.pdf`
            );
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download clearance. Please try again.');
        } finally {
            setIsDownloadingClearance(false);
        }
    };

    // Handle print
    const handlePrint = () => {
        if (!isClient) return;
        
        setIsPrinting(true);
        try {
            const printWindow = window.open(`/my-clearances/${clearance.id}/print`, '_blank');
            if (!printWindow) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }
            
            printWindow.onload = () => {
                setIsPrinting(false);
            };
            
            setTimeout(() => {
                setIsPrinting(false);
            }, 3000);
        } catch (error) {
            console.error('Print failed:', error);
            alert('Failed to open print window. Please check popup blocker settings.');
            setIsPrinting(false);
        }
    };

    const copyReferenceNumber = () => {
        if (!isClient) return;
        
        navigator.clipboard.writeText(clearance.reference_number)
            .then(() => {
                alert('Reference number copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    };

    // Calculate balance
    const feeAmount = typeof clearance.fee_amount === 'string' 
        ? parseFloat(clearance.fee_amount) 
        : clearance.fee_amount;
    const totalPaid = calculateTotalPaid();
    const balance = feeAmount - totalPaid;

    // Check if payment is required
    const isPaymentRequired = clearance.clearance_type?.requires_payment && balance > 0;
    const isReadyForPayment = clearance.status === 'ready_for_payment' || clearance.status === 'processing';

    // Mobile action buttons
    const MobileActionButtons = () => (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t p-3 shadow-lg lg:hidden">
            <div className="flex gap-2">
                {clearance.status === 'issued' && clearance.clearance_number && (
                    <>
                        <Button
                            variant="default"
                            className="flex-1 gap-2"
                            onClick={handleClearanceDownload}
                            disabled={isDownloadingClearance || !isClient}
                            size="sm"
                        >
                            {isDownloadingClearance ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Download
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={handlePrint}
                            disabled={isPrinting || !isClient}
                            size="sm"
                        >
                            {isPrinting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Printer className="h-4 w-4" />
                            )}
                            Print
                        </Button>
                    </>
                )}
                
                {isReadyForPayment && isPaymentRequired && (
                    <Button
                        variant="default"
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                            // Show payment instructions
                            alert(`Please proceed to Barangay Hall to pay the fee of ${formatCurrency(balance)}.\n\nBring your valid ID and this reference number: ${clearance.reference_number}`);
                        }}
                        disabled={!isClient}
                        size="sm"
                    >
                        <DollarSign className="h-4 w-4" />
                        Pay Now
                    </Button>
                )}
                
                {clearance.status === 'pending' && (
                    <Button
                        variant="destructive"
                        className="flex-1 gap-2"
                        onClick={() => {
                            if (isClient && confirm('Are you sure you want to cancel this request?')) {
                                router.delete(`/my-clearances/${clearance.id}`);
                            }
                        }}
                        disabled={!isClient}
                        size="sm"
                    >
                        <XCircle className="h-4 w-4" />
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Clearances', href: '/my-clearances' },
                { title: `#${clearance.reference_number}`, href: '#' }
            ]}
        >
            <div className="space-y-4 lg:space-y-6 pb-20 lg:pb-0">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-30 bg-white border-b pb-3 pt-2">
                    <div className="flex items-center gap-2">
                        <Link href="/my-clearances">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold truncate">
                                {clearance.clearance_type?.name || 'Clearance'}
                            </h1>
                            <div className="flex items-center gap-1">
                                <p className="text-xs text-gray-500 truncate">
                                    #{clearance.reference_number}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0"
                                    onClick={copyReferenceNumber}
                                    disabled={!isClient}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/my-clearances">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                                {clearance.clearance_type?.name || 'Clearance Request'}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Reference Number: {clearance.reference_number}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={copyReferenceNumber}
                                    disabled={!isClient}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {clearance.status === 'issued' && clearance.clearance_number && (
                            <>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={handleClearanceDownload}
                                    disabled={isDownloadingClearance || !isClient}
                                >
                                    {isDownloadingClearance ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    Download Clearance
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={handlePrint}
                                    disabled={isPrinting || !isClient}
                                >
                                    {isPrinting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Printer className="h-4 w-4" />
                                    )}
                                    Print
                                </Button>
                            </>
                        )}
                        {clearance.status === 'pending' && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (isClient && confirm('Are you sure you want to cancel this request?')) {
                                        router.delete(`/my-clearances/${clearance.id}`);
                                    }
                                }}
                                disabled={!isClient}
                            >
                                Cancel Request
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Banner */}
                <Alert className={`${getStatusConfig(clearance.status).color} border-0 py-3`}>
                    <AlertCircle className="h-4 w-4" />
                    <div className="flex-1">
                        <AlertTitle className="font-semibold text-sm sm:text-base">
                            Status: {getStatusConfig(clearance.status).label}
                        </AlertTitle>
                        <AlertDescription className="text-xs sm:text-sm">
                            {clearance.status === 'pending' && 'Your request is pending review by barangay officials.'}
                            {clearance.status === 'processing' && 'Your request is being processed.'}
                            {clearance.status === 'ready_for_payment' && 'Your request is ready for payment. Please proceed to Barangay Hall to pay the fee.'}
                            {clearance.status === 'paid' && 'Payment received. Your request will now be processed for issuance.'}
                            {clearance.status === 'approved' && 'Your request has been approved and will be issued soon.'}
                            {clearance.status === 'issued' && `Your clearance has been issued with number: ${clearance.clearance_number}`}
                            {clearance.status === 'rejected' && `Reason: ${clearance.remarks || 'No reason provided'}`}
                            {clearance.status === 'cancelled' && 'This request has been cancelled.'}
                        </AlertDescription>
                    </div>
                </Alert>

                {/* Mobile Status Summary Card */}
                <div className="lg:hidden">
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-base">Request Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <Badge className={`${getStatusConfig(clearance.status).color} mt-1 text-xs`}>
                                        {getStatusConfig(clearance.status).label}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Urgency</p>
                                    <div className="mt-1">{getUrgencyBadge(clearance.urgency)}</div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Amount Due</p>
                                    <p className="font-medium text-sm">{formatCurrency(clearance.fee_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Amount Paid</p>
                                    <p className="font-medium text-green-600 text-sm">{formatCurrency(totalPaid)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                        {/* Mobile Tab Headers - Horizontal Scroll */}
          <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
                    <div className="flex space-x-1 border-b min-w-max">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-3 py-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${
                                activeTab === 'details'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <FileText className="h-3.5 w-3.5" />
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`px-3 py-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${
                                activeTab === 'documents'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <FileCheck className="h-3.5 w-3.5" />
                            Docs
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`px-3 py-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${
                                activeTab === 'payments'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="text-base font-bold">₱</span>
                            Payments
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-3 py-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${
                                activeTab === 'history'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <History className="h-3.5 w-3.5" />
                            History
                        </button>
                    </div>
                </div>

                        {/* Desktop Tab Headers */}
                        <div className="hidden lg:block space-y-6">
                            <div className="flex space-x-1 border-b">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                        activeTab === 'details'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Details
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('documents')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                        activeTab === 'documents'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileCheck className="h-4 w-4" />
                                        Documents
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('payments')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                        activeTab === 'payments'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">₱</span>
                                        <span>Payments</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                        activeTab === 'history'
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <History className="h-4 w-4" />
                                        History
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-4 lg:space-y-6">
                            {/* Details Tab Content */}
                            {activeTab === 'details' && (
                                <div className="space-y-4 lg:space-y-6">
                                    {/* Request Information */}
                                    <Card>
                                        <CardHeader className="py-3 lg:py-4">
                                            <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                                                <Layers className="h-4 w-4 lg:h-5 lg:w-5" />
                                                Request Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-3 lg:py-4 space-y-3 lg:space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Reference Number</p>
                                                    <p className="font-medium text-sm lg:text-base">{clearance.reference_number}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Date Requested</p>
                                                    <p className="font-medium text-sm lg:text-base">{formatDate(clearance.created_at)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Date Needed</p>
                                                    <p className="font-medium text-sm lg:text-base">{formatDate(clearance.needed_date)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Urgency</p>
                                                    <div className="mt-1">
                                                        {getUrgencyBadge(clearance.urgency)}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <p className="text-xs lg:text-sm text-gray-500">Purpose</p>
                                                <p className="font-medium text-sm lg:text-base mt-1">{clearance.purpose}</p>
                                            </div>
                                            
                                            {clearance.specific_purpose && (
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Specific Purpose Details</p>
                                                    <p className="font-medium text-sm lg:text-base mt-1">{clearance.specific_purpose}</p>
                                                </div>
                                            )}
                                            
                                            {clearance.additional_requirements && (
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Additional Requirements</p>
                                                    <p className="font-medium text-sm lg:text-base mt-1">{clearance.additional_requirements}</p>
                                                </div>
                                            )}
                                            
                                            {/* Resident Information */}
                                            <div className="pt-3 lg:pt-4 border-t">
                                                <p className="text-xs lg:text-sm text-gray-500 mb-2">Requested By</p>
                                                <div className="flex items-center gap-2 lg:gap-3">
                                                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm lg:text-base">
                                                            {clearance.resident?.first_name} {clearance.resident?.last_name}
                                                        </p>
                                                        {clearance.resident?.middle_name && (
                                                            <p className="text-xs lg:text-sm text-gray-500">
                                                                {clearance.resident.middle_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Clearance Information */}
                                    <Card>
                                        <CardHeader className="py-3 lg:py-4">
                                            <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                                                <FileCheck className="h-4 w-4 lg:h-5 lg:w-5" />
                                                Clearance Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-3 lg:py-4 space-y-3 lg:space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Type</p>
                                                    <p className="font-medium text-sm lg:text-base">{clearance.clearance_type?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Processing Time</p>
                                                    <p className="font-medium text-sm lg:text-base">{clearance.clearance_type?.processing_days || 0} days</p>
                                                </div>
                                                {clearance.clearance_type?.fee && (
                                                    <div>
                                                        <p className="text-xs lg:text-sm text-gray-500">Standard Fee</p>
                                                        <p className="font-medium text-sm lg:text-base">
                                                            {formatCurrency(clearance.clearance_type.fee)}
                                                        </p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Amount Due</p>
                                                    <p className="font-medium text-sm lg:text-base">
                                                        {formatCurrency(clearance.fee_amount)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {clearance.issue_date && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                                    <div>
                                                        <p className="text-xs lg:text-sm text-gray-500">Issued Date</p>
                                                        <p className="font-medium text-sm lg:text-base">{formatDate(clearance.issue_date)}</p>
                                                    </div>
                                                    {clearance.valid_until && (
                                                        <div>
                                                            <p className="text-xs lg:text-sm text-gray-500">Valid Until</p>
                                                            <p className="font-medium text-sm lg:text-base">{formatDate(clearance.valid_until)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {clearance.clearance_number && (
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Clearance Number</p>
                                                    <p className="font-medium text-sm lg:text-base">{clearance.clearance_number}</p>
                                                </div>
                                            )}
                                            
                                            {clearance.issuing_officer_name && (
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Signed By</p>
                                                    <p className="font-medium text-sm lg:text-base">{clearance.issuing_officer_name}</p>
                                                </div>
                                            )}
                                            
                                            {clearance.remarks && (
                                                <div>
                                                    <p className="text-xs lg:text-sm text-gray-500">Remarks</p>
                                                    <p className="font-medium text-sm lg:text-base mt-1">{clearance.remarks}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Documents Tab Content */}
                            {activeTab === 'documents' && (
                                <div className="space-y-4 lg:space-y-6">
                                    <Card>
                                        <CardHeader className="py-3 lg:py-4">
                                            <CardTitle className="text-base lg:text-lg">Uploaded Documents</CardTitle>
                                            <CardDescription className="text-xs lg:text-sm">
                                                Documents submitted with this request
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="py-3 lg:py-4">
                                            {clearance.documents && clearance.documents.length > 0 ? (
                                                <div className="space-y-4 lg:space-y-6">
                                                    {/* Grid view for thumbnails */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                                        {clearance.documents.map((doc) => (
                                                            <div key={doc.id} className="space-y-2">
                                                                <DocumentThumbnail 
                                                                    document={doc} 
                                                                    onView={() => setViewingDocument(doc)}
                                                                />
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-xs lg:text-sm font-medium truncate">
                                                                            {doc.original_name || doc.file_name}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-1 lg:gap-2 text-xs text-gray-500">
                                                                        <span>{formatFileSize(doc.file_size)}</span>
                                                                        {doc.document_type && (
                                                                            <Badge variant="outline" className="text-[10px] lg:text-xs">
                                                                                {doc.document_type.name}
                                                                            </Badge>
                                                                        )}
                                                                        <Badge variant={doc.is_verified ? "default" : "outline"} className="text-[10px] lg:text-xs">
                                                                            {doc.is_verified ? 'Verified' : 'Pending'}
                                                                        </Badge>
                                                                    </div>
                                                                    {doc.description && (
                                                                        <p className="text-xs text-gray-600 line-clamp-2">
                                                                            {doc.description}
                                                                        </p>
                                                                    )}
                                                                    <div className="flex gap-1 lg:gap-2 pt-1">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="gap-1 text-xs h-7 lg:h-8"
                                                                            onClick={() => handleDocumentDownload(doc)}
                                                                            disabled={!isClient}
                                                                        >
                                                                            <Download className="h-3 w-3" />
                                                                            <span className="hidden sm:inline">Download</span>
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="gap-1 text-xs h-7 lg:h-8"
                                                                            onClick={() => setViewingDocument(doc)}
                                                                            disabled={!isClient}
                                                                        >
                                                                            <Eye className="h-3 w-3" />
                                                                            <span className="hidden sm:inline">View</span>
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 lg:py-8">
                                                    <FileText className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-400" />
                                                    <p className="mt-2 lg:mt-4 text-gray-500 text-sm lg:text-base">No documents uploaded</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Payments Tab Content */}
                            {activeTab === 'payments' && (
                                <div className="space-y-4 lg:space-y-6">
                                    <Card>
                                        <CardHeader className="py-3 lg:py-4">
                                            <CardTitle className="text-base lg:text-lg">Payment Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-3 lg:py-4 space-y-4 lg:space-y-6">
                                            {/* Payment Summary */}
                                            <div className="grid grid-cols-3 gap-2 lg:gap-4">
                                                <div className="text-center p-2 lg:p-4 border rounded-lg">
                                                    <p className="text-xs lg:text-sm text-gray-500">Amount Due</p>
                                                    <p className="text-lg lg:text-2xl font-bold text-gray-900">
                                                        {formatCurrency(clearance.fee_amount)}
                                                    </p>
                                                </div>
                                                <div className="text-center p-2 lg:p-4 border rounded-lg">
                                                    <p className="text-xs lg:text-sm text-gray-500">Amount Paid</p>
                                                    <p className="text-lg lg:text-2xl font-bold text-green-600">
                                                        {formatCurrency(totalPaid)}
                                                    </p>
                                                </div>
                                                <div className="text-center p-2 lg:p-4 border rounded-lg">
                                                    <p className="text-xs lg:text-sm text-gray-500">Balance</p>
                                                    <p className="text-lg lg:text-2xl font-bold text-red-600">
                                                        {formatCurrency(balance)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment Status */}
                                            <div className="p-3 lg:p-4 border rounded-lg">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div>
                                                        <p className="font-medium text-sm lg:text-base">Payment Status</p>
                                                        <Badge className={`mt-1 text-xs lg:text-sm ${
                                                            balance <= 0 
                                                                ? 'bg-green-100 text-green-800'
                                                                : totalPaid > 0
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {balance <= 0 
                                                                ? 'Paid' 
                                                                : totalPaid > 0
                                                                ? 'Partial Payment'
                                                                : 'Payment Required'
                                                            }
                                                        </Badge>
                                                    </div>
                                                    {isPaymentRequired && isReadyForPayment && (
                                                        <Button 
                                                            onClick={() => {
                                                                alert(`Please proceed to Barangay Hall to pay the fee of ${formatCurrency(balance)}.\n\nBring your valid ID and this reference number: ${clearance.reference_number}`);
                                                            }}
                                                            disabled={!isClient}
                                                            size="sm"
                                                            className="w-full sm:w-auto"
                                                        >
                                                            Payment Instructions
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Payment History */}
                                            {paymentItems.length > 0 ? (
                                                <div>
                                                    <h3 className="font-medium text-sm lg:text-base mb-3 lg:mb-4">Payment History</h3>
                                                    <div className="space-y-2 lg:space-y-3">
                                                        {paymentItems.map((item) => (
                                                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 border rounded-lg gap-3 lg:gap-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
                                                                        <Receipt className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                                                                        <div>
                                                                            <p className="font-medium text-sm lg:text-base">{item.fee_name}</p>
                                                                            <p className="text-xs lg:text-sm text-gray-500">{item.description}</p>
                                                                        </div>
                                                                    </div>
                                                                    {item.payment && (
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 lg:gap-2 text-xs lg:text-sm">
                                                                            <p className="text-gray-600">
                                                                                OR #: {item.payment.or_number}
                                                                            </p>
                                                                            <p className="text-gray-600">
                                                                                Method: {item.payment.payment_method}
                                                                            </p>
                                                                            <p className="text-gray-600">
                                                                                Date: {formatDate(item.payment.payment_date)}
                                                                            </p>
                                                                            <p className="text-gray-600">
                                                                                Status: {item.payment.status}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-base lg:text-lg font-bold">{formatCurrency(item.total_amount)}</p>
                                                                    {item.payment?.reference_number && (
                                                                        <p className="text-xs lg:text-sm text-gray-500">
                                                                            Ref: {item.payment.reference_number}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                               <div className="text-center py-6 lg:py-8 border rounded-lg">
    <span className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-400 text-2xl lg:text-4xl font-bold inline-flex items-center justify-center">
        ₱
    </span>
    <p className="mt-2 lg:mt-4 text-gray-500 text-sm lg:text-base">No payment records found</p>
    {isPaymentRequired && isReadyForPayment && (
        <Button 
            className="mt-3 lg:mt-4"
            onClick={() => {
                alert(`Please proceed to Barangay Hall to pay the fee of ${formatCurrency(balance)}.\n\nBring your valid ID and this reference number: ${clearance.reference_number}`);
            }}
            disabled={!isClient}
            size="sm"
        >
            Pay at Barangay Hall
        </Button>
    )}
</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* History Tab Content */}
                            {activeTab === 'history' && (
                                <div className="space-y-4 lg:space-y-6">
                                    <Card>
                                        <CardHeader className="py-3 lg:py-4">
                                            <CardTitle className="text-base lg:text-lg">Status History</CardTitle>
                                            <CardDescription className="text-xs lg:text-sm">
                                                Timeline of your request
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="py-3 lg:py-4">
                                            {clearance.status_history && clearance.status_history.length > 0 ? (
                                                <div className="relative">
                                                    {clearance.status_history
                                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                        .map((history, index) => (
                                                        <div key={history.id || index} className="relative pb-6 lg:pb-8 last:pb-0">
                                                            {index < clearance.status_history!.length - 1 && (
                                                                <div className="absolute left-4 lg:left-5 top-4 lg:top-5 -ml-px h-full w-0.5 bg-gray-200"></div>
                                                            )}
                                                            <div className="relative flex items-start">
                                                                <div className="relative flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-gray-100">
                                                                    <History className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                                                                </div>
                                                                <div className="ml-3 lg:ml-4 flex-1">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 lg:gap-2">
                                                                        <Badge className={`${getStatusConfig(history.status).color} text-xs lg:text-sm`}>
                                                                            {getStatusConfig(history.status).label}
                                                                        </Badge>
                                                                        <p className="text-xs lg:text-sm text-gray-500">
                                                                            {formatDateTime(history.created_at)}
                                                                        </p>
                                                                    </div>
                                                                    {history.causer && (
                                                                        <p className="text-xs lg:text-sm text-gray-500 mt-1">
                                                                            By: {typeof history.causer === 'object' ? history.causer.name : history.causer}
                                                                        </p>
                                                                    )}
                                                                    {history.remarks && (
                                                                        <div className="mt-2 p-2 lg:p-3 bg-gray-50 rounded-lg">
                                                                            <p className="text-xs lg:text-sm">{history.remarks}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 lg:py-8">
                                                    <History className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-400" />
                                                    <p className="mt-2 lg:mt-4 text-gray-500 text-sm lg:text-base">No history available</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Summary & Actions (Desktop only) */}
                    <div className="hidden lg:block space-y-4 lg:space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardHeader className="py-3 lg:py-4">
                                <CardTitle className="text-base lg:text-lg">Request Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="py-3 lg:py-4 space-y-3 lg:space-y-4">
                                <div className="space-y-2 lg:space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs lg:text-sm text-gray-500">Status</p>
                                        <Badge className={`${getStatusConfig(clearance.status).color} text-xs lg:text-sm`}>
                                            {getStatusConfig(clearance.status).label}
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs lg:text-sm text-gray-500">Urgency</p>
                                        {getUrgencyBadge(clearance.urgency)}
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs lg:text-sm text-gray-500">Fee Amount</p>
                                        <p className="font-medium text-sm lg:text-base">{formatCurrency(clearance.fee_amount)}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs lg:text-sm text-gray-500">Amount Paid</p>
                                        <p className="font-medium text-green-600 text-sm lg:text-base">{formatCurrency(totalPaid)}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs lg:text-sm text-gray-500">Balance</p>
                                        <p className={`font-medium text-sm lg:text-base ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(balance)}
                                        </p>
                                    </div>
                                    
                                    {clearance.clearance_number && (
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs lg:text-sm text-gray-500">Clearance No.</p>
                                            <p className="font-medium text-sm lg:text-base">{clearance.clearance_number}</p>
                                        </div>
                                    )}
                                    
                                    <div className="pt-2 lg:pt-3 border-t">
                                        <p className="text-xs lg:text-sm text-gray-500 mb-1">Last Updated</p>
                                        <p className="text-xs lg:text-sm font-medium">{formatDateTime(clearance.updated_at)}</p>
                                    </div>
                                </div>
                                
                                {/* Status-specific messages */}
                                {clearance.status === 'pending' && (
                                    <Alert className="bg-yellow-50 border-yellow-200 py-2 lg:py-3">
                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                        <AlertDescription className="text-yellow-700 text-xs lg:text-sm">
                                            Your request is in queue. Expected processing time: {clearance.clearance_type?.processing_days || 0} days.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {isReadyForPayment && isPaymentRequired && (
                                    <Alert className="bg-orange-50 border-orange-200 py-2 lg:py-3">
                                        <AlertCircle className="h-4 w-4 text-orange-600" />
                                        <AlertDescription className="text-orange-700 text-xs lg:text-sm">
                                            Payment required: {formatCurrency(balance)}. Please proceed to Barangay Hall.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {clearance.status === 'processing' && !isPaymentRequired && (
                                    <Alert className="bg-blue-50 border-blue-200 py-2 lg:py-3">
                                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                                        <AlertDescription className="text-blue-700 text-xs lg:text-sm">
                                            Your request is being processed. Check back soon for updates.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {clearance.status === 'issued' && (
                                    <Alert className="bg-green-50 border-green-200 py-2 lg:py-3">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-700 text-xs lg:text-sm">
                                            Your clearance has been issued and is ready for download.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {clearance.status === 'rejected' && (
                                    <Alert className="bg-red-50 border-red-200 py-2 lg:py-3">
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-700 text-xs lg:text-sm">
                                            This request has been rejected. Please check remarks for details.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader className="py-3 lg:py-4">
                                <CardTitle className="text-base lg:text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="py-3 lg:py-4 space-y-2 lg:space-y-3">
                                {clearance.status === 'issued' && clearance.clearance_number && (
                                    <>
                                        <Button
                                            variant="default"
                                            className="w-full justify-start gap-2"
                                            onClick={handleClearanceDownload}
                                            disabled={isDownloadingClearance || !isClient}
                                            size="sm"
                                        >
                                            {isDownloadingClearance ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                            Download Clearance
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2"
                                            onClick={handlePrint}
                                            disabled={isPrinting || !isClient}
                                            size="sm"
                                        >
                                            {isPrinting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Printer className="h-4 w-4" />
                                            )}
                                            Print Clearance
                                        </Button>
                                    </>
                                )}
                                
                                {isReadyForPayment && isPaymentRequired && (
                                    <Button
                                        variant="default"
                                        className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                            alert(`Please proceed to Barangay Hall to pay the fee of ${formatCurrency(balance)}.\n\nBring your valid ID and this reference number: ${clearance.reference_number}`);
                                        }}
                                        disabled={!isClient}
                                        size="sm"
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        Payment Instructions
                                    </Button>
                                )}
                                
                                {['pending', 'ready_for_payment', 'processing'].includes(clearance.status) && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            if (isClient && confirm('Are you sure you want to cancel this request?')) {
                                                router.patch(`/my-clearances/${clearance.id}`, {
                                                    status: 'cancelled'
                                                });
                                            }
                                        }}
                                        disabled={!isClient}
                                        size="sm"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Cancel Request
                                    </Button>
                                )}
                                
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => {
                                        router.get(`/my-clearances/${clearance.id}/message`);
                                    }}
                                    disabled={!isClient}
                                    size="sm"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Send Message
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Payment Methods */}
                        {isPaymentRequired && <PaymentMethodsInfo />}

                        {/* Contact Information */}
                        <Card>
                            <CardHeader className="py-3 lg:py-4">
                                <CardTitle className="text-base lg:text-lg">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="py-3 lg:py-4 space-y-2 lg:space-y-3">
                                <div className="flex items-start gap-2 lg:gap-3">
                                    <Building className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm lg:text-base">Barangay Hall</p>
                                        <p className="text-xs lg:text-sm text-gray-500">Open Mon-Fri, 8AM-5PM</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 lg:gap-3">
                                    <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm lg:text-base">Contact Us</p>
                                        <p className="text-xs lg:text-sm text-gray-500">
                                            For inquiries: 0999-999-9999
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 lg:gap-3">
                                    <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm lg:text-base">Location</p>
                                        <p className="text-xs lg:text-sm text-gray-500">
                                            Barangay Hall, Main Street
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Mobile Action Buttons */}
            <MobileActionButtons />

            {/* Document Viewer Modal */}
            {viewingDocument && (
                <DocumentViewerModal
                    document={viewingDocument}
                    isOpen={!!viewingDocument}
                    onClose={() => setViewingDocument(null)}
                />
            )}

            {/* Mobile Footer */}
            <div className="lg:hidden">
                <ResidentMobileFooter />
            </div>
        </ResidentLayout>
    );
}