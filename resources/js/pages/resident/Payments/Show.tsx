import { useEffect, useState, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft,
    Download,
    Printer,
    FileText,
    XCircle,
    AlertCircle,
    DollarSign,
    User,
    FileCheck,
    MessageSquare,
    History,
    Loader2,
    Copy,
    Building,
    Layers,
    Receipt,
    Phone,
    MapPin,
    CreditCard,
    MoreVertical,
    Inbox,
    Calendar,
    Clock,
    CheckCircle,
    Banknote,
    Smartphone,
    Landmark,
    Wallet,
    TrendingUp,
    Gift,
    Hash,
    Eye,
    Plus,
    Tag,
    Database,
    RefreshCw,
    Edit,
    Trash2,
    Share2,
    Mail,
    Globe,
    Award,
    PieChart,
    Save,
    Upload,
    Paperclip,
    Link2,
    BadgeCheck,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Import from reusable UI library
import { formatCurrency, formatDate, formatDateTime, downloadFile } from '@/components/residentui/lib/resident-ui-utils';
import { useMobileDetect, useScrollSpy, useExpandableSections } from '@/components/residentui/hooks/useResidentUI';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernDocumentViewer, ModernDocumentThumbnail } from '@/components/residentui/modern-document-viewer';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernTabs } from '@/components/residentui/modern-tabs';
import { ModernPaymentSummary } from '@/components/residentui/modern-payment-summary';
import { ModernExpandableSection } from '@/components/residentui/modern-expandable-section';
import { ModernFloatingActionButton } from '@/components/residentui/modern-floating-action-button';
import { ModernMobileHeader } from '@/components/residentui/modern-mobile-header';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernFileUpload } from '@/components/residentui/modern-file-upload';

// Types
type PaymentStatus = 'completed' | 'paid' | 'pending' | 'overdue' | 'cancelled' | 'refunded' | 'partially_paid';
type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'bank' | 'check' | 'online' | 'card';

interface PaymentItem {
    id: number;
    item_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total: number;
    formatted_unit_price?: string;
    formatted_total?: string;
    fee_code?: string;
    fee_name?: string;
    category?: string;
    period_covered?: string;
}

interface PaymentAttachment {
    id: number;
    file_name: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    description?: string;
    uploaded_at: string;
    uploaded_by?: string;
    uploaded_by_name?: string;
}

interface PaymentNote {
    id: number;
    content: string;
    created_at: string;
    is_public: boolean;
    created_by?: {
        id: number;
        name: string;
        role: string;
    };
}

interface PaymentAuditLog {
    id: number;
    action: string;
    description: string;
    created_at: string;
    created_by?: {
        id: number;
        name: string;
        role: string;
    };
    ip_address?: string;
    user_agent?: string;
}

interface Purok {
    id: number;
    name: string;
}

interface Barangay {
    id: number;
    name: string;
}

interface PayerDetails {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    household_number?: string;
    purok?: string | Purok;
    zone?: string;
    barangay?: string | Barangay;
    city?: string;
    province?: string;
    zip_code?: string;
    profile_photo?: string;
}

interface RelatedPayment {
    id: number;
    or_number: string;
    purpose: string;
    total_amount: number;
    formatted_total: string;
    payment_date: string | null;
    formatted_date: string;
    status: PaymentStatus;
    payment_method: PaymentMethod;
}

interface Payment {
    id: number;
    or_number: string;
    reference_number?: string;
    purpose: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    payment_date: string | null;
    due_date?: string | null;
    status: PaymentStatus;
    payment_method: PaymentMethod;
    payment_method_display: string;
    is_cleared: boolean;
    certificate_type?: string;
    certificate_type_display?: string;
    collection_type: string;
    collection_type_display: string;
    remarks?: string;
    formatted_total: string;
    formatted_date: string;
    formatted_subtotal: string;
    formatted_surcharge: string;
    formatted_penalty: string;
    formatted_discount: string;
    
    payer_details?: PayerDetails;
    
    items?: PaymentItem[];
    attachments?: PaymentAttachment[];
    notes?: PaymentNote[];
    audit_log?: PaymentAuditLog[];
    related_payments?: RelatedPayment[];
    
    approved_by?: {
        id: number;
        name: string;
        role: string;
        date: string;
    };
    
    verified_by?: {
        id: number;
        name: string;
        role: string;
        date: string;
    };
    
    receipt?: {
        id: number;
        url: string;
        generated_at: string;
    };
    
    metadata?: Record<string, any>;
    tags?: string[];
    
    created_at: string | null;
    updated_at: string | null;
    created_by?: {
        id: number;
        name: string;
        role: string;
    };
}

interface PageProps {
    payment: Payment;
    canEdit?: boolean;
    canDelete?: boolean;
    canPrint?: boolean;
    canDownload?: boolean;
    canVerify?: boolean;
    canRefund?: boolean;
    canAddNote?: boolean;
    canUploadAttachment?: boolean;
    canPayOnline?: boolean;
    paymentMethods?: Record<string, string>;
    error?: string;
}

// Helper function to safely get string value from object or string
const getStringValue = (value: string | { name?: string } | null | undefined): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.name || '';
};

// Helper function to safely convert to number
const toNumber = (value: number | string | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value) || 0;
};

// Payment-specific utilities
const getPaymentStatusConfig = (status: PaymentStatus) => {
    const configs: Record<PaymentStatus, { label: string; color: string; icon: any; gradient: string; bgColor: string }> = {
        completed: {
            label: 'Completed',
            icon: CheckCircle,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
            gradient: 'from-emerald-500 to-teal-500'
        },
        paid: {
            label: 'Paid',
            icon: CheckCircle,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
            gradient: 'from-emerald-500 to-teal-500'
        },
        pending: {
            label: 'Pending',
            icon: Clock,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
            gradient: 'from-amber-500 to-orange-500'
        },
        overdue: {
            label: 'Overdue',
            icon: AlertCircle,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            gradient: 'from-red-500 to-pink-500'
        },
        cancelled: {
            label: 'Cancelled',
            icon: XCircle,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            gradient: 'from-gray-500 to-slate-500'
        },
        refunded: {
            label: 'Refunded',
            icon: RefreshCw,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            gradient: 'from-purple-500 to-pink-500'
        },
        partially_paid: {
            label: 'Partially Paid',
            icon: Wallet,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            gradient: 'from-blue-500 to-indigo-500'
        },
    };
    return configs[status] || configs.pending;
};

const getPaymentMethodIcon = (method: PaymentMethod) => {
    const icons: Record<PaymentMethod, any> = {
        cash: Banknote,
        gcash: Smartphone,
        maya: Smartphone,
        bank: Landmark,
        check: FileText,
        online: Globe,
        card: CreditCard,
    };
    return icons[method] || CreditCard;
};

const getPaymentMethodColor = (method: PaymentMethod): string => {
    const colors: Record<PaymentMethod, string> = {
        cash: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        gcash: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        maya: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        bank: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        check: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        online: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        card: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return colors[method] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
};

const calculateProgress = (payment: Payment): number => {
    if (payment.status === 'completed' || payment.status === 'paid') return 100;
    if (payment.status === 'partially_paid') {
        const paid = payment.total_amount - (payment.subtotal || 0);
        return Math.min(Math.round((paid / payment.total_amount) * 100), 100);
    }
    return 0;
};

// Helper function to convert number to words
const numberToWords = (num: number | string): string => {
    const numericValue = toNumber(num);
    if (numericValue === 0) return 'Zero Pesos Only';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convert = (n: number): string => {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
        if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        return '';
    };

    const whole = Math.floor(numericValue);
    const cents = Math.round((numericValue - whole) * 100);

    if (cents === 0) {
        return convert(whole) + ' Pesos Only';
    }
    return convert(whole) + ' Pesos and ' + convert(cents) + ' Centavos Only';
};

// Format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function PaymentShow({ 
    payment, 
    canEdit = false, 
    canDelete = false, 
    canPrint = true, 
    canDownload = true, 
    canVerify = false, 
    canRefund = false, 
    canAddNote = false, 
    canUploadAttachment = false,
    canPayOnline = false,
    paymentMethods = {},
    error 
}: PageProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [viewingAttachment, setViewingAttachment] = useState<PaymentAttachment | null>(null);
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showRefundDialog, setShowRefundDialog] = useState(false);
    const [showReceiptPreview, setShowReceiptPreview] = useState(false);
    const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
    const [isSavingReceipt, setIsSavingReceipt] = useState(false);
    
    // Form states
    const [noteContent, setNoteContent] = useState('');
    const [isPublicNote, setIsPublicNote] = useState(true);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadDescription, setUploadDescription] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(payment.payment_method);
    const [referenceNumber, setReferenceNumber] = useState(payment.reference_number || '');
    
    const { isMobile, isClient } = useMobileDetect();
    const showStickyActions = useScrollSpy(200);
    const { expandedSections, toggleSection } = useExpandableSections({
        paymentInfo: true,
        payerInfo: true,
        breakdownInfo: true
    });
    
    const headerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isClient) {
            document.title = `Payment OR #${payment.or_number} | Barangay System`;
        }
    }, [payment.or_number, isClient]);

    if (error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/my-payments' },
                    { title: 'Error', href: '#' }
                ]}
            >
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <ModernEmptyState
                        status="error"
                        title="Error Loading Payment"
                        description={error}
                        icon={AlertCircle}
                        action={{
                            label: "Back to Payments",
                            onClick: () => router.get('/my-payments')
                        }}
                    />
                </div>
            </ResidentLayout>
        );
    }

    if (!payment) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/my-payments' }
                ]}
            >
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <ModernEmptyState
                        status="empty"
                        title="Payment Not Found"
                        description="The payment you're looking for doesn't exist or has been deleted."
                        icon={Receipt}
                        action={{
                            label: "Back to Payments",
                            onClick: () => router.get('/my-payments')
                        }}
                    />
                </div>
            </ResidentLayout>
        );
    }

    const statusConfig = getPaymentStatusConfig(payment.status);
    const StatusIcon = statusConfig.icon;
    const MethodIcon = getPaymentMethodIcon(payment.payment_method);
    const progress = calculateProgress(payment);

    const handlePrintReceipt = () => {
        if (!isClient) return;
        
        setIsPrinting(true);
        
        // Open print window with receipt
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Popup blocked. Please allow popups for this site.');
            setIsPrinting(false);
            return;
        }

        // Use the PDF view route
        router.get(route('portal.resident.payments.receipt.view', payment.id), {}, {
            preserveState: false,
            onSuccess: () => {
                setIsPrinting(false);
            },
            onError: () => {
                toast.error('Failed to generate receipt');
                setIsPrinting(false);
            }
        });
    };

    const handleDownloadReceipt = () => {
        if (!isClient) return;
        
        setIsDownloadingReceipt(true);
        
        // Use the download route
        window.location.href = route('portal.resident.payments.receipt.download', payment.id);
        
        // Reset loading state after a delay
        setTimeout(() => {
            setIsDownloadingReceipt(false);
        }, 3000);
    };

    const handleSaveReceipt = () => {
        setIsSavingReceipt(true);
        
        router.post(route('portal.resident.payments.receipt.save', payment.id), {
            receipt_number: `RCP-${payment.or_number}-${new Date().getFullYear()}`,
            or_number: payment.or_number,
            receipt_type: payment.collection_type || 'payment',
            payer_name: payment.payer_details?.name || 'Unknown',
            payer_address: payment.payer_details?.address || null,
            subtotal: toNumber(payment.subtotal),
            surcharge: toNumber(payment.surcharge),
            penalty: toNumber(payment.penalty),
            discount: toNumber(payment.discount),
            total_amount: toNumber(payment.total_amount),
            amount_paid: payment.status === 'paid' || payment.status === 'completed' ? toNumber(payment.total_amount) : 0,
            change_due: 0,
            payment_method: payment.payment_method,
            reference_number: payment.reference_number,
            payment_date: payment.payment_date || new Date().toISOString(),
            issued_date: new Date().toISOString(),
            issued_by: 'Resident',
            fee_breakdown: payment.items?.map(item => ({
                fee_name: item.item_name || item.fee_name || 'Payment Item',
                fee_code: item.fee_code,
                base_amount: item.unit_price,
                total_amount: item.total
            })) || [],
            notes: payment.remarks,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Receipt saved successfully!');
                setIsSavingReceipt(false);
            },
            onError: (errors) => {
                console.error('Failed to save receipt:', errors);
                toast.error('Failed to save receipt. Please try again.');
                setIsSavingReceipt(false);
            }
        });
    };

    const handleViewReceipt = () => {
        setShowReceiptPreview(true);
    };

    const handleShare = () => {
        if (!isClient) return;
        
        if (navigator.share) {
            navigator.share({
                title: `Payment Receipt - OR #${payment.or_number}`,
                text: `Payment of ${payment.formatted_total} for ${payment.purpose}`,
                url: window.location.href,
            }).catch(() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        }
    };

    const copyOrNumber = () => {
        if (!isClient) return;
        
        navigator.clipboard.writeText(payment.or_number)
            .then(() => {
                toast.success('OR number copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                toast.error('Failed to copy');
            });
    };

    const handleEdit = () => {
        router.get(`/portal/my-payments/${payment.id}/edit`);
    };

    const handleDelete = () => {
        setLoading(true);
        router.delete(route('portal.resident.payments.destroy', payment.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Payment deleted successfully');
                router.get('/my-payments');
            },
            onError: () => {
                toast.error('Failed to delete payment');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleCancel = () => {
        if (!cancelReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }
        
        setLoading(true);
        router.put(route('portal.resident.payments.cancel', payment.id), {
            reason: cancelReason
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Payment cancelled successfully');
                setShowCancelDialog(false);
                router.reload();
            },
            onError: () => {
                toast.error('Failed to cancel payment');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleUpdatePaymentMethod = () => {
        setLoading(true);
        router.put(route('portal.resident.payments.update-method', payment.id), {
            payment_method: selectedPaymentMethod,
            reference_number: referenceNumber
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Payment method updated successfully');
                setShowPaymentMethodDialog(false);
                router.reload();
            },
            onError: (errors) => {
                console.error('Failed to update payment method:', errors);
                toast.error('Failed to update payment method');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleAddNote = () => {
        if (!noteContent.trim()) {
            toast.error('Please enter a note');
            return;
        }
        
        setLoading(true);
        router.post(route('portal.resident.payments.notes.store', payment.id), {
            content: noteContent,
            is_public: isPublicNote
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Note added successfully');
                setShowAddNoteDialog(false);
                setNoteContent('');
                setIsPublicNote(true);
                router.reload();
            },
            onError: (errors) => {
                console.error('Failed to add note:', errors);
                toast.error('Failed to add note');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleUploadAttachment = () => {
        if (!uploadFile) {
            toast.error('Please select a file');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('description', uploadDescription);
        
        setLoading(true);
        router.post(route('portal.resident.payments.attachments.store', payment.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('File uploaded successfully');
                setShowUploadDialog(false);
                setUploadFile(null);
                setUploadDescription('');
                router.reload();
            },
            onError: (errors) => {
                console.error('Failed to upload file:', errors);
                toast.error('Failed to upload file');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleDownloadAttachment = (attachment: PaymentAttachment) => {
        window.location.href = route('portal.resident.payments.attachments.download', [payment.id, attachment.id]);
    };

    const handleDeleteAttachment = (attachment: PaymentAttachment) => {
        if (!confirm('Are you sure you want to delete this attachment?')) return;
        
        setLoading(true);
        router.delete(route('portal.resident.payments.attachments.destroy', [payment.id, attachment.id]), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Attachment deleted successfully');
                router.reload();
            },
            onError: () => {
                toast.error('Failed to delete attachment');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleViewAttachment = (attachment: PaymentAttachment) => {
        setViewingAttachment(attachment);
    };

    const handleGetPaymentLink = () => {
        setLoading(true);
        router.get(route('portal.resident.payments.payment-link', payment.id), {}, {
            preserveScroll: true,
            onSuccess: (response) => {
                // Handle payment link response
                console.log('Payment link:', response);
                setLoading(false);
            },
            onError: () => {
                toast.error('Failed to generate payment link');
                setLoading(false);
            },
        });
    };

    const tabsConfig = [
        { id: 'details', label: 'Details', icon: Receipt },
        { id: 'items', label: 'Items', icon: Layers },
        { id: 'attachments', label: 'Attachments', icon: Paperclip },
        { id: 'notes', label: 'Notes', icon: MessageSquare },
        { id: 'history', label: 'History', icon: History },
    ];

    const getTabCount = (tabId: string) => {
        switch(tabId) {
            case 'items': 
                return payment.items?.length || 0;
            case 'attachments': 
                return payment.attachments?.length || 0;
            case 'notes': 
                return payment.notes?.length || 0;
            case 'history': 
                return payment.audit_log?.length || 0;
            default: 
                return 0;
        }
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getFABConfig = () => {
        if (payment.status === 'pending' && canPayOnline) {
            return {
                icon: <Smartphone className="h-6 w-6 text-white" />,
                label: 'Pay Online',
                color: 'blue' as const,
                onClick: handleGetPaymentLink
            };
        } else if (payment.status === 'pending' && canEdit) {
            return {
                icon: <Edit className="h-6 w-6 text-white" />,
                label: 'Edit Payment',
                color: 'amber' as const,
                onClick: handleEdit
            };
        } else if (payment.status === 'paid' || payment.status === 'completed') {
            return {
                icon: <Download className="h-6 w-6 text-white" />,
                label: 'Download Receipt',
                color: 'green' as const,
                onClick: handleDownloadReceipt
            };
        } else if (payment.status === 'overdue') {
            return {
                icon: <DollarSign className="h-6 w-6 text-white" />,
                label: 'Pay Now',
                color: 'red' as const,
                onClick: () => toast.info('Payment instructions would appear here')
            };
        }
        return null;
    };

    const fabConfig = getFABConfig();

    const payerInitials = payment.payer_details?.first_name && payment.payer_details?.last_name
        ? `${payment.payer_details.first_name[0]}${payment.payer_details.last_name[0]}`
        : payment.payer_details?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U';

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Payments', href: '/portal/my-payments' },
                { title: `OR #${payment.or_number}`, href: '#' }
            ]}
            hideMobileFooter={isMobile}
        >
            <div ref={scrollContainerRef} className="space-y-3 md:space-y-6 px-4 md:px-6 pb-32 md:pb-6">
                {/* Mobile Header */}
                {isMobile && (
                    <div ref={headerRef}>
                        <ModernMobileHeader
                            title={`OR #${payment.or_number}`}
                            subtitle="Payment Receipt"
                            referenceNumber={payment.reference_number || payment.or_number}
                            onCopyReference={copyOrNumber}
                            onBack={() => router.get('/my-payments')}
                            showSticky={showStickyActions}
                            actions={
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        {canPrint && payment.status === 'completed' && (
                                            <DropdownMenuItem onClick={handlePrintReceipt} disabled={isPrinting}>
                                                <Printer className="h-4 w-4 mr-2" />
                                                Print Receipt
                                            </DropdownMenuItem>
                                        )}
                                        {canDownload && payment.status === 'completed' && (
                                            <DropdownMenuItem onClick={handleDownloadReceipt} disabled={isDownloadingReceipt}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Receipt
                                            </DropdownMenuItem>
                                        )}
                                        {payment.status === 'completed' && (
                                            <DropdownMenuItem onClick={handleViewReceipt}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Receipt
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={handleShare}>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Share
                                        </DropdownMenuItem>
                                        {payment.status === 'completed' && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={handleSaveReceipt} disabled={isSavingReceipt}>
                                                    {isSavingReceipt ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Save className="h-4 w-4 mr-2" />
                                                    )}
                                                    Save Receipt
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={copyOrNumber}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy OR Number
                                        </DropdownMenuItem>
                                        {payment.reference_number && (
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.reference_number!)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Reference
                                            </DropdownMenuItem>
                                        )}
                                        
                                        {payment.status === 'pending' && (
                                            <>
                                                <DropdownMenuSeparator />
                                                {canEdit && (
                                                    <DropdownMenuItem onClick={handleEdit}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => setShowPaymentMethodDialog(true)}>
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Change Payment Method
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-amber-600">
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Cancel Payment
                                                </DropdownMenuItem>
                                                {canDelete && (
                                                    <DropdownMenuItem 
                                                        onClick={() => setShowDeleteDialog(true)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </>
                                        )}
                                        
                                        {canAddNote && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setShowAddNoteDialog(true)}>
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    Add Note
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        
                                        {canUploadAttachment && payment.status === 'pending' && (
                                            <DropdownMenuItem onClick={() => setShowUploadDialog(true)}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload File
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            }
                        />

                        <div className={cn(
                            "sticky z-10 -mx-4 px-4 py-2 transition-all duration-200",
                            showStickyActions ? "top-[73px]" : "top-[73px]"
                        )}>
                            <Alert className={cn(
                                "border-0 rounded-xl shadow-lg py-2",
                                statusConfig.bgColor
                            )}>
                                <div className="flex items-center gap-2">
                                    <StatusIcon className={cn("h-4 w-4 flex-shrink-0", statusConfig.color)} />
                                    <div className="flex-1 min-w-0">
                                        <AlertTitle className="font-semibold text-xs">
                                            Status: {statusConfig.label}
                                        </AlertTitle>
                                        <AlertDescription className="text-[10px] truncate">
                                            {payment.status === 'paid' && 'Payment completed'}
                                            {payment.status === 'completed' && 'Payment completed'}
                                            {payment.status === 'pending' && 'Awaiting verification'}
                                            {payment.status === 'overdue' && 'Payment overdue'}
                                            {payment.status === 'cancelled' && 'Payment cancelled'}
                                            {payment.status === 'refunded' && 'Payment refunded'}
                                        </AlertDescription>
                                    </div>
                                    <Badge variant="outline" className={cn(
                                        "text-[10px]",
                                        getPaymentMethodColor(payment.payment_method)
                                    )}>
                                        {payment.payment_method_display}
                                    </Badge>
                                </div>
                            </Alert>
                        </div>

                        <ModernPaymentSummary
                            due={payment.total_amount}
                            paid={payment.status === 'paid' || payment.status === 'completed' ? payment.total_amount : 0}
                            balance={payment.status === 'paid' || payment.status === 'completed' ? 0 : payment.total_amount}
                            showCompact={true}
                        />
                    </div>
                )}

                {/* Desktop Header */}
                {!isMobile && (
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <Link href="/portal/my-payments">
                                <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                            
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center",
                                    getPaymentMethodColor(payment.payment_method)
                                )}>
                                    <MethodIcon className="h-6 w-6" />
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                            OR #{payment.or_number}
                                        </h1>
                                        <Badge className={cn(
                                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                            statusConfig.bgColor,
                                            statusConfig.color
                                        )}>
                                            <StatusIcon className="h-3 w-3" />
                                            {statusConfig.label}
                                        </Badge>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                                        {payment.purpose}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {payment.payment_date ? formatDate(payment.payment_date) : 'N/A'}
                                        </div>
                                        {payment.reference_number && (
                                            <div className="flex items-center gap-1">
                                                <Hash className="h-4 w-4" />
                                                Ref: {payment.reference_number}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 rounded-lg"
                                                onClick={copyOrNumber}
                                                disabled={!isClient}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {payment.status === 'pending' && canPayOnline && (
                                <Button
                                    className="gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                    onClick={handleGetPaymentLink}
                                >
                                    <Smartphone className="h-4 w-4" />
                                    Pay Online
                                </Button>
                            )}
                            
                            {payment.status === 'completed' && canPrint && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="gap-2 rounded-xl"
                                                onClick={handlePrintReceipt}
                                                disabled={isPrinting || !isClient}
                                            >
                                                {isPrinting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Printer className="h-4 w-4" />
                                                )}
                                                Print
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Print receipt</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            
                            {payment.status === 'completed' && canDownload && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="gap-2 rounded-xl"
                                                onClick={handleDownloadReceipt}
                                                disabled={isDownloadingReceipt || !isClient}
                                            >
                                                {isDownloadingReceipt ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                                Download
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Download receipt</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            
                            {payment.status === 'completed' && (
                                <Button
                                    variant="outline"
                                    className="gap-2 rounded-xl"
                                    onClick={handleViewReceipt}
                                    disabled={!isClient}
                                >
                                    <Eye className="h-4 w-4" />
                                    View
                                </Button>
                            )}

                            {payment.status === 'completed' && (
                                <Button
                                    variant="outline"
                                    className="gap-2 rounded-xl"
                                    onClick={handleSaveReceipt}
                                    disabled={isSavingReceipt || !isClient}
                                >
                                    {isSavingReceipt ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Save
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                className="gap-2 rounded-xl"
                                onClick={handleShare}
                                disabled={!isClient}
                            >
                                <Share2 className="h-4 w-4" />
                                Share
                            </Button>

                            {(canEdit || canDelete || canAddNote || canUploadAttachment || payment.status === 'pending') && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="rounded-xl">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        {payment.status === 'pending' && (
                                            <>
                                                <DropdownMenuItem onClick={() => setShowPaymentMethodDialog(true)}>
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Change Payment Method
                                                </DropdownMenuItem>
                                                {canEdit && (
                                                    <DropdownMenuItem onClick={handleEdit}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Payment
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-amber-600">
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Cancel Payment
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        
                                        {canAddNote && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setShowAddNoteDialog(true)}>
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    Add Note
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        
                                        {canUploadAttachment && payment.status === 'pending' && (
                                            <DropdownMenuItem onClick={() => setShowUploadDialog(true)}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload File
                                            </DropdownMenuItem>
                                        )}
                                        
                                        {canDelete && payment.status === 'pending' && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => setShowDeleteDialog(true)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Payment
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats Section - Desktop Only */}
                {!isMobile && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <ModernCard className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                            <div className="flex items-center justify-between mb-2">
                                <Receipt className="h-5 w-5 text-blue-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {payment.formatted_total}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                        </ModernCard>

                        <ModernCard className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                            <div className="flex items-center justify-between mb-2">
                                <Wallet className="h-5 w-5 text-emerald-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {payment.formatted_subtotal}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Base Amount</p>
                        </ModernCard>

                        {(payment.surcharge > 0 || payment.penalty > 0) && (
                            <ModernCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="h-5 w-5 text-amber-600" />
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(payment.surcharge + payment.penalty)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Surcharge + Penalty</p>
                            </ModernCard>
                        )}

                        {payment.discount > 0 && (
                            <ModernCard className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                                <div className="flex items-center justify-between mb-2">
                                    <Gift className="h-5 w-5 text-purple-600" />
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {payment.formatted_discount}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Discount</p>
                            </ModernCard>
                        )}

                        <ModernCard className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
                            <div className="flex items-center justify-between mb-2">
                                <PieChart className="h-5 w-5 text-rose-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {progress}%
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Payment Progress</p>
                            <Progress value={progress} className="h-1.5 mt-2 bg-rose-200 dark:bg-rose-900" />
                        </ModernCard>
                    </div>
                )}

                {/* Main Content */}
                <div className={cn(
                    "grid gap-3 md:gap-6",
                    isMobile ? "grid-cols-1" : "lg:grid-cols-3"
                )}>
                    {/* Left Column */}
                    <div className={cn(
                        isMobile ? "col-span-1" : "lg:col-span-2"
                    )}>
                        <ModernTabs
                            tabs={tabsConfig}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            getTabCount={getTabCount}
                            className="mb-3"
                        />

                        <div className="mt-3 space-y-3">
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <>
                                    {isMobile ? (
                                        <>
                                            <ModernExpandableSection
                                                title="Payment Information"
                                                icon={
                                                    <div className="h-6 w-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                        <Receipt className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                }
                                                isExpanded={expandedSections.paymentInfo}
                                                onToggle={() => toggleSection('paymentInfo')}
                                            >
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <p className="text-[10px] text-gray-500">OR Number</p>
                                                            <p className="text-xs font-mono truncate">{payment.or_number}</p>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <p className="text-[10px] text-gray-500">Payment Date</p>
                                                            <p className="text-xs">{payment.payment_date ? formatDate(payment.payment_date) : 'N/A'}</p>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <p className="text-[10px] text-gray-500">Method</p>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <div className={cn("p-0.5 rounded", getPaymentMethodColor(payment.payment_method))}>
                                                                    <MethodIcon className="h-3 w-3" />
                                                                </div>
                                                                <span className="text-xs">{payment.payment_method_display}</span>
                                                            </div>
                                                        </div>
                                                        {payment.reference_number && (
                                                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                                <p className="text-[10px] text-gray-500">Reference</p>
                                                                <p className="text-xs font-mono truncate">{payment.reference_number}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                        <p className="text-[10px] text-gray-500 mb-1">Purpose</p>
                                                        <p className="text-xs">{payment.purpose}</p>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <p className="text-[10px] text-gray-500">Collection Type</p>
                                                            <p className="text-xs">{payment.collection_type_display}</p>
                                                        </div>
                                                        {payment.certificate_type && (
                                                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                                <p className="text-[10px] text-gray-500">Certificate</p>
                                                                <p className="text-xs">{payment.certificate_type_display}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </ModernExpandableSection>

                                            <ModernExpandableSection
                                                title="Payer Information"
                                                icon={
                                                    <div className="h-6 w-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                        <User className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                }
                                                isExpanded={expandedSections.payerInfo}
                                                onToggle={() => toggleSection('payerInfo')}
                                            >
                                                {payment.payer_details ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 rounded-lg">
                                                                {payment.payer_details.profile_photo ? (
                                                                    <AvatarImage src={payment.payer_details.profile_photo} />
                                                                ) : (
                                                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                                                        {payerInitials}
                                                                    </AvatarFallback>
                                                                )}
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {payment.payer_details.name}
                                                                </p>
                                                                {payment.payer_details.contact_number && (
                                                                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                                                                        <Phone className="h-3 w-3" />
                                                                        {payment.payer_details.contact_number}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {payment.payer_details.address && (
                                                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                                <p className="text-[10px] text-gray-500 mb-1">Address</p>
                                                                <div className="flex items-start gap-2">
                                                                    <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                    <p className="text-xs">{payment.payer_details.address}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {(payment.payer_details.household_number || payment.payer_details.purok || payment.payer_details.zone) && (
                                                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                                <p className="text-[10px] text-gray-500 mb-1">Location Details</p>
                                                                <div className="space-y-1 text-xs">
                                                                    {payment.payer_details.household_number && (
                                                                        <p>Household #{payment.payer_details.household_number}</p>
                                                                    )}
                                                                    {payment.payer_details.purok && (
                                                                        <p>
                                                                            Purok {getStringValue(payment.payer_details.purok)}
                                                                        </p>
                                                                    )}
                                                                    {payment.payer_details.zone && (
                                                                        <p>
                                                                            Zone {payment.payer_details.zone}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500">No payer information available</p>
                                                )}
                                            </ModernExpandableSection>

                                            <ModernExpandableSection
                                                title="Amount Breakdown"
                                                icon={
                                                    <div className="h-6 w-6 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                        <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                }
                                                isExpanded={expandedSections.breakdownInfo}
                                                onToggle={() => toggleSection('breakdownInfo')}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                        <span className="text-xs text-gray-600">Base Amount</span>
                                                        <span className="text-sm font-medium">{payment.formatted_subtotal}</span>
                                                    </div>
                                                    
                                                    {payment.surcharge > 0 && (
                                                        <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <span className="text-xs text-gray-600">Surcharge</span>
                                                            <span className="text-sm font-medium text-amber-600">{payment.formatted_surcharge}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {payment.penalty > 0 && (
                                                        <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <span className="text-xs text-gray-600">Penalty</span>
                                                            <span className="text-sm font-medium text-red-600">{payment.formatted_penalty}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {payment.discount > 0 && (
                                                        <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <span className="text-xs text-gray-600">Discount</span>
                                                            <span className="text-sm font-medium text-green-600">-{payment.formatted_discount}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <Separator className="my-1" />
                                                    
                                                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                        <span className="text-xs font-semibold">Total Amount</span>
                                                        <span className="text-base font-bold text-gray-900 dark:text-white">
                                                            {payment.formatted_total}
                                                        </span>
                                                    </div>
                                                </div>
                                            </ModernExpandableSection>

                                            {payment.remarks && (
                                                <ModernCard title="Remarks" className="p-3">
                                                    <p className="text-xs whitespace-pre-line">{payment.remarks}</p>
                                                </ModernCard>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <ModernCard
                                                title="Payment Information"
                                                icon={Receipt}
                                                iconColor="from-blue-500 to-blue-600"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">OR Number</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <p className="font-mono font-medium">{payment.or_number}</p>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-5 w-5 p-0"
                                                                onClick={copyOrNumber}
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Payment Date</p>
                                                        <p className="font-medium mt-1">{payment.payment_date ? formatDate(payment.payment_date) : 'N/A'}</p>
                                                    </div>
                                                    {payment.due_date && (
                                                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                            <p className="text-xs text-gray-500">Due Date</p>
                                                            <p className={cn(
                                                                "font-medium mt-1",
                                                                payment.status === 'overdue' && "text-red-600"
                                                            )}>
                                                                {formatDate(payment.due_date)}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Payment Method</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className={cn("p-1 rounded-lg", getPaymentMethodColor(payment.payment_method))}>
                                                                <MethodIcon className="h-4 w-4" />
                                                            </div>
                                                            <span className="font-medium">{payment.payment_method_display}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                    <p className="text-xs text-gray-500 mb-1">Purpose</p>
                                                    <p className="font-medium">{payment.purpose}</p>
                                                </div>
                                                
                                                {payment.reference_number && (
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                                                        <div className="flex items-center gap-1">
                                                            <p className="font-mono font-medium">{payment.reference_number}</p>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-5 w-5 p-0"
                                                                onClick={() => navigator.clipboard.writeText(payment.reference_number!)}
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Collection Type</p>
                                                        <p className="font-medium mt-1">{payment.collection_type_display}</p>
                                                    </div>
                                                    {payment.certificate_type && (
                                                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                            <p className="text-xs text-gray-500">Certificate Type</p>
                                                            <p className="font-medium mt-1">{payment.certificate_type_display}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ModernCard>

                                            <ModernCard
                                                title="Payer Information"
                                                icon={User}
                                                iconColor="from-green-500 to-emerald-500"
                                            >
                                                {payment.payer_details ? (
                                                    <>
                                                        <div className="flex items-start gap-4 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                            <Avatar className="h-12 w-12 rounded-xl">
                                                                {payment.payer_details.profile_photo ? (
                                                                    <AvatarImage src={payment.payer_details.profile_photo} />
                                                                ) : (
                                                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                                                                        {payerInitials}
                                                                    </AvatarFallback>
                                                                )}
                                                            </Avatar>
                                                            
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                    {payment.payer_details.name}
                                                                </h3>
                                                                {payment.payer_details.contact_number && (
                                                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                                        <Phone className="h-3.5 w-3.5" />
                                                                        {payment.payer_details.contact_number}
                                                                    </div>
                                                                )}
                                                                {payment.payer_details.email && (
                                                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                                        <Mail className="h-3.5 w-3.5" />
                                                                        {payment.payer_details.email}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {payment.payer_details.address && (
                                                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                                <p className="text-xs text-gray-500 mb-1">Address</p>
                                                                <div className="flex items-start gap-2">
                                                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-sm">{payment.payer_details.address}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {(payment.payer_details.household_number || payment.payer_details.purok || payment.payer_details.zone) && (
                                                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                                <p className="text-xs text-gray-500 mb-1">Location Details</p>
                                                                <div className="space-y-1 text-sm">
                                                                    {payment.payer_details.household_number && (
                                                                        <p>Household #{payment.payer_details.household_number}</p>
                                                                    )}
                                                                    {payment.payer_details.purok && (
                                                                        <p>
                                                                            Purok {getStringValue(payment.payer_details.purok)}
                                                                        </p>
                                                                    )}
                                                                    {payment.payer_details.zone && (
                                                                        <p>
                                                                            Zone {payment.payer_details.zone}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <ModernEmptyState
                                                        status="info"
                                                        title="No Payer Information"
                                                        description="Payer details are not available"
                                                        icon={User}
                                                        className="py-4"
                                                    />
                                                )}
                                            </ModernCard>

                                            <ModernCard
                                                title="Amount Breakdown"
                                                icon={DollarSign}
                                                iconColor="from-purple-500 to-pink-500"
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <span className="text-gray-600 dark:text-gray-400">Base Amount</span>
                                                        <span className="font-semibold">{payment.formatted_subtotal}</span>
                                                    </div>
                                                    
                                                    {payment.surcharge > 0 && (
                                                        <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                            <span className="text-gray-600 dark:text-gray-400">Surcharge</span>
                                                            <span className="font-semibold text-amber-600">{payment.formatted_surcharge}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {payment.penalty > 0 && (
                                                        <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                            <span className="text-gray-600 dark:text-gray-400">Penalty</span>
                                                            <span className="font-semibold text-red-600">{payment.formatted_penalty}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {payment.discount > 0 && (
                                                        <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                            <span className="text-gray-600 dark:text-gray-400">Discount</span>
                                                            <span className="font-semibold text-green-600">-{payment.formatted_discount}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <Separator />
                                                    
                                                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <span className="font-semibold">Total Amount</span>
                                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                            {payment.formatted_total}
                                                        </span>
                                                    </div>
                                                </div>
                                            </ModernCard>

                                            {payment.remarks && (
                                                <ModernCard title="Remarks" icon={MessageSquare} iconColor="from-amber-500 to-orange-500">
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="whitespace-pre-line">{payment.remarks}</p>
                                                    </div>
                                                </ModernCard>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {/* Items Tab */}
                            {activeTab === 'items' && (
                                <ModernCard
                                    title="Payment Items"
                                    description={`${payment.items?.length || 0} item(s)`}
                                >
                                    {payment.items && payment.items.length > 0 ? (
                                        <div className="space-y-3">
                                            {payment.items.map((item, index) => (
                                                <div key={item.id || index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                {item.fee_code && (
                                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                                                                        {item.fee_code}
                                                                    </Badge>
                                                                )}
                                                                {item.category && (
                                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                                                        {item.category}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-medium">{item.item_name || item.fee_name}</p>
                                                            {item.description && (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                            {item.period_covered && (
                                                                <p className="text-[10px] text-gray-500 mt-1">
                                                                    Period: {item.period_covered}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-sm font-bold">{item.formatted_total || formatCurrency(item.total)}</p>
                                                            {item.quantity > 1 && (
                                                                <p className="text-[10px] text-gray-500">
                                                                    {item.quantity} x {item.formatted_unit_price || formatCurrency(item.unit_price)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <ModernEmptyState
                                            status="empty"
                                            title="No Items"
                                            description="No payment items found"
                                            icon={Layers}
                                            className="py-8"
                                        />
                                    )}
                                </ModernCard>
                            )}

                            {/* Attachments Tab */}
                            {activeTab === 'attachments' && (
                                <ModernCard
                                    title="Attachments"
                                    description={`${payment.attachments?.length || 0} file(s)`}
                                    action={canUploadAttachment && payment.status === 'pending' && (
                                        <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => setShowUploadDialog(true)}>
                                            <Plus className="h-4 w-4" />
                                            Upload
                                        </Button>
                                    )}
                                >
                                    {payment.attachments && payment.attachments.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {payment.attachments.map((attachment) => (
                                                <div key={attachment.id} className="relative group">
                                                    <ModernDocumentThumbnail
                                                        document={{
                                                            ...attachment,
                                                            name: attachment.original_name,
                                                            size: formatFileSize(attachment.file_size),
                                                            type: attachment.mime_type,
                                                            url: `/storage/${attachment.file_path}`
                                                        }}
                                                        onView={() => handleViewAttachment(attachment)}
                                                        onDownload={() => handleDownloadAttachment(attachment)}
                                                    />
                                                    {payment.status === 'pending' && (
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleDeleteAttachment(attachment)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <ModernEmptyState
                                            status="empty"
                                            title="No Attachments"
                                            description="No attachments uploaded"
                                            icon={Inbox}
                                            className="py-8"
                                        />
                                    )}
                                </ModernCard>
                            )}

                            {/* Notes Tab */}
                            {activeTab === 'notes' && (
                                <ModernCard
                                    title="Notes"
                                    description={`${payment.notes?.length || 0} note(s)`}
                                    action={canAddNote && (
                                        <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => setShowAddNoteDialog(true)}>
                                            <Plus className="h-4 w-4" />
                                            Add Note
                                        </Button>
                                    )}
                                >
                                    {payment.notes && payment.notes.length > 0 ? (
                                        <div className="space-y-3">
                                            {payment.notes.map((note) => (
                                                <div key={note.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                                                    {note.created_by?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-xs font-medium">
                                                                    {note.created_by?.name || 'System'}
                                                                    {!note.is_public && (
                                                                        <Badge variant="outline" className="ml-2 text-[8px] px-1 py-0">
                                                                            Private
                                                                        </Badge>
                                                                    )}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500">{note.created_at ? formatDateTime(note.created_at) : 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs whitespace-pre-line">{note.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <ModernEmptyState
                                            status="empty"
                                            title="No Notes"
                                            description="No notes available"
                                            icon={MessageSquare}
                                            className="py-8"
                                        />
                                    )}
                                </ModernCard>
                            )}

                            {/* History Tab */}
                            {activeTab === 'history' && (
                                <ModernCard title="Audit Log">
                                    {payment.audit_log && payment.audit_log.length > 0 ? (
                                        <div className="relative">
                                            {payment.audit_log
                                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                .map((log, index) => (
                                                    <div key={log.id || index} className="relative pb-4 last:pb-0">
                                                        {index < payment.audit_log!.length - 1 && (
                                                            <div className="absolute left-3.5 top-5 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700"></div>
                                                        )}
                                                        <div className="relative flex items-start gap-2">
                                                            <div className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                                <History className="h-3.5 w-3.5 text-gray-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="text-xs font-medium">{log.action}</p>
                                                                    <p className="text-[10px] text-gray-500 flex-shrink-0">
                                                                        {log.created_at ? formatDateTime(log.created_at) : 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                    {log.description}
                                                                </p>
                                                                {log.created_by && (
                                                                    <p className="text-[10px] text-gray-500 mt-1">
                                                                        By: {log.created_by.name} ({log.created_by.role})
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <ModernEmptyState
                                            status="empty"
                                            title="No History"
                                            description="No audit log available"
                                            icon={History}
                                            className="py-8"
                                        />
                                    )}
                                </ModernCard>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Desktop Only */}
                    {!isMobile && (
                        <div className="space-y-4 lg:space-y-6">
                            <ModernCard title="Payment Summary">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                        <p className="text-sm text-gray-500">Status</p>
                                        <Badge className={cn(
                                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                            statusConfig.bgColor,
                                            statusConfig.color
                                        )}>
                                            <StatusIcon className="h-3 w-3" />
                                            {statusConfig.label}
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                        <p className="text-sm text-gray-500">Payment Method</p>
                                        <div className="flex items-center gap-1">
                                            <div className={cn("p-1 rounded", getPaymentMethodColor(payment.payment_method))}>
                                                <MethodIcon className="h-3 w-3" />
                                            </div>
                                            <span className="text-sm">{payment.payment_method_display}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="font-bold text-lg">{payment.formatted_total}</p>
                                    </div>
                                    
                                    {payment.is_cleared && (
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                            <p className="text-sm text-gray-500">Clearance</p>
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Cleared
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                        <p className="text-sm font-medium">{payment.updated_at ? formatDateTime(payment.updated_at) : 'N/A'}</p>
                                    </div>
                                </div>
                            </ModernCard>

                            {payment.approved_by && (
                                <ModernCard title="Approval Status" icon={ShieldCheck} iconColor="from-indigo-500 to-purple-500">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Approved by {payment.approved_by.name}</p>
                                                <p className="text-xs text-gray-500">{payment.approved_by.role}</p>
                                                <p className="text-xs text-gray-400 mt-1">{payment.approved_by.date ? formatDateTime(payment.approved_by.date) : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </ModernCard>
                            )}

                            {payment.verified_by && (
                                <ModernCard title="Verification Status" icon={BadgeCheck} iconColor="from-blue-500 to-cyan-500">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <BadgeCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Verified by {payment.verified_by.name}</p>
                                                <p className="text-xs text-gray-500">{payment.verified_by.role}</p>
                                                <p className="text-xs text-gray-400 mt-1">{payment.verified_by.date ? formatDateTime(payment.verified_by.date) : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </ModernCard>
                            )}

                            {payment.tags && payment.tags.length > 0 && (
                                <ModernCard title="Tags" icon={Tag} iconColor="from-pink-500 to-rose-500">
                                    <div className="flex flex-wrap gap-2">
                                        {payment.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="px-3 py-1.5">
                                                <Tag className="h-3 w-3 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </ModernCard>
                            )}

                            {payment.metadata && Object.keys(payment.metadata).length > 0 && (
                                <ModernCard title="Metadata" icon={Database} iconColor="from-cyan-500 to-blue-500">
                                    <div className="space-y-2">
                                        {Object.entries(payment.metadata).map(([key, value]) => (
                                            <div key={key} className="flex items-start gap-2 p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                <span className="text-xs font-medium text-gray-500 min-w-[100px]">
                                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                                </span>
                                                <span className="text-sm">
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </ModernCard>
                            )}

                            {payment.related_payments && payment.related_payments.length > 0 && (
                                <ModernCard title="Related Payments" icon={Link2} iconColor="from-teal-500 to-emerald-500">
                                    <div className="space-y-2">
                                        {payment.related_payments.map((related) => {
                                            const RelatedIcon = getPaymentMethodIcon(related.payment_method);
                                            return (
                                                <Link
                                                    key={related.id}
                                                    href={`/portal/my-payments/${related.id}`}
                                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                                                >
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        getPaymentMethodColor(related.payment_method)
                                                    )}>
                                                        <RelatedIcon className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            OR #{related.or_number}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {related.purpose}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">{related.formatted_total}</p>
                                                        <p className="text-xs text-gray-500">{related.formatted_date}</p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </ModernCard>
                            )}

                            <ModernCard title="Contact Information">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Barangay Hall</p>
                                            <p className="text-xs text-gray-500">Open Mon-Fri, 8AM-5PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Contact Us</p>
                                            <p className="text-xs text-gray-500">0999-999-9999</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Location</p>
                                            <p className="text-xs text-gray-500">Barangay Hall, Main Street</p>
                                        </div>
                                    </div>
                                </div>
                            </ModernCard>
                        </div>
                    )}
                </div>
            </div>

            {/* Receipt Preview Dialog */}
            <Dialog open={showReceiptPreview} onOpenChange={setShowReceiptPreview}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Payment Receipt - OR #{payment.or_number}</DialogTitle>
                        <DialogDescription>
                            Preview of the official receipt
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-4">
                        <iframe 
                            src={route('portal.resident.payments.receipt.view', payment.id)} 
                            className="w-full h-[600px] border-0 rounded-lg"
                            title="Receipt Preview"
                        />
                    </div>
                    
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowReceiptPreview(false)}>
                            Close
                        </Button>
                        <Button onClick={handlePrintReceipt} disabled={isPrinting}>
                            {isPrinting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Printer className="h-4 w-4 mr-2" />
                            )}
                            Print
                        </Button>
                        <Button onClick={handleDownloadReceipt} disabled={isDownloadingReceipt}>
                            {isDownloadingReceipt ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-2" />
                            )}
                            Download
                        </Button>
                        <Button onClick={handleSaveReceipt} disabled={isSavingReceipt}>
                            {isSavingReceipt ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Note Dialog */}
            <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogDescription>
                            Add a note to this payment. Notes can be public or private.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="note">Note Content</Label>
                            <Textarea
                                id="note"
                                placeholder="Enter your note here..."
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                rows={4}
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={isPublicNote}
                                onChange={(e) => setIsPublicNote(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="isPublic">Make this note public</Label>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddNote} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Add Note
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upload Attachment Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Attachment</DialogTitle>
                        <DialogDescription>
                            Upload a file related to this payment. Max file size: 10MB
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">File</Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                            />
                            <p className="text-xs text-gray-500">
                                Accepted formats: JPG, PNG, PDF, DOC, DOCX
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter a description for this file..."
                                value={uploadDescription}
                                onChange={(e) => setUploadDescription(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUploadAttachment} disabled={loading || !uploadFile}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Upload
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Payment Method Dialog */}
            <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Payment Method</DialogTitle>
                        <DialogDescription>
                            Update the payment method for this transaction.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="payment_method">Payment Method</Label>
                            <select
                                id="payment_method"
                                value={selectedPaymentMethod}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                                className="w-full rounded-md border border-gray-300 p-2"
                            >
                                <option value="cash">Cash</option>
                                <option value="gcash">GCash</option>
                                <option value="maya">Maya</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="online">Online Payment</option>
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="reference_number">Reference Number (Optional)</Label>
                            <Input
                                id="reference_number"
                                placeholder="Enter reference number"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentMethodDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdatePaymentMethod} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Payment Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this payment? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cancel_reason">Reason for Cancellation</Label>
                            <Textarea
                                id="cancel_reason"
                                placeholder="Please provide a reason for cancellation..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            No, Keep Payment
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleCancel}
                            disabled={loading || !cancelReason.trim()}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Yes, Cancel Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this payment? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <style>{`
                footer.fixed.bottom-0 {
                    z-index: 45 !important;
                }
            `}</style>

            {viewingAttachment && (
                <ModernDocumentViewer
                    document={{
                        ...viewingAttachment,
                        name: viewingAttachment.original_name,
                        url: `/storage/${viewingAttachment.file_path}`
                    }}
                    isOpen={!!viewingAttachment}
                    onClose={() => setViewingAttachment(null)}
                />
            )}

            {/* Mobile Floating Action Button */}
            {isMobile && showStickyActions && fabConfig && (
                <ModernFloatingActionButton
                    icon={fabConfig.icon}
                    label={fabConfig.label}
                    onClick={fabConfig.onClick}
                    color={fabConfig.color}
                />
            )}

            <ModernLoadingOverlay loading={loading} message="Processing..." />
        </ResidentLayout>
    );
}