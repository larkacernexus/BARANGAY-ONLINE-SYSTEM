// resources/js/Pages/Admin/Forms/Show.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format, parseISO } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
    ArrowLeft,
    Loader2,
    FileText,
    FileType,
    BarChart3,
    ImageIcon,
    Building,
    Users,
    Shield,
    AlertCircle,
    Bookmark
} from 'lucide-react';

// Import components
import { FormHeader } from '@/components/admin/forms/show/components/form-header';
import { FormTabs } from '@/components/admin/forms/show/components/form-tabs';
import { FormMetadataSidebar } from '@/components/admin/forms/show/components/form-metadata-sidebar';
import { FullScreenFormViewer } from '@/components/admin/forms/show/components/fullscreen-form-viewer';
import { DeleteFormDialog } from '@/components/admin/forms/show/components/delete-form-dialog';

// Import types
import { Form, PageProps } from '@/types/admin/forms/forms.types';
import { FormDetailsCard } from '@/components/admin/forms/show/components/form-details-card';
import { FormPreviewCard } from '@/components/admin/forms/show/components/form-preview-card';
import { StatisticsCard } from '@/components/admin/forms/show/components/statistics-card';
import { RelatedFormsCard } from '@/components/admin/forms/show/components/related-forms-card';


// ==================== HELPER FUNCTIONS ====================
export const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
        return 'Invalid date';
    }
};

export const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

export const getFileIcon = (fileType?: string) => {
    if (!fileType) return '📎';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
};

export const getFileTypeIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    if (fileType.includes('pdf')) return <FileType className="h-5 w-5 text-red-500 dark:text-red-400" />;
    if (fileType.includes('word') || fileType.includes('doc')) return <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <BarChart3 className="h-5 w-5 text-green-500 dark:text-green-400" />;
    if (fileType.includes('image')) return <ImageIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
    return <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
};

export const getCategoryColor = (category?: string): string => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    const colors: Record<string, string> = {
        'Social Services': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        'Permits & Licenses': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        'Health & Medical': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        'Education': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        'Legal & Police': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
        'Employment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
        'Housing': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
        'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
    };
    return colors[category] || colors['Other'];
};

export const getAgencyIcon = (agency?: string) => {
    if (!agency) return <Building className="h-4 w-4" />;
    if (agency.includes('Mayor')) return <Building className="h-4 w-4" />;
    if (agency.includes('DSWD')) return <Users className="h-4 w-4" />;
    if (agency.includes('PNP') || agency.includes('Police')) return <Shield className="h-4 w-4" />;
    if (agency.includes('Health')) return <AlertCircle className="h-4 w-4" />;
    if (agency.includes('Education')) return <Bookmark className="h-4 w-4" />;
    return <Building className="h-4 w-4" />;
};

export default function FormsShow({ form, related_forms = [], download_stats, view_stats }: PageProps) {
    // Add null check at the beginning
    if (!form) {
        return (
            <AppLayout
                title="Loading Form..."
                breadcrumbs={[
                    { title: 'Dashboard', href: route('admin.dashboard') },
                    { title: 'Forms', href: route('admin.forms.index') },
                    { title: 'Loading...', href: '#' }
                ]}
            >
                <Head title="Loading Form..." />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500 dark:text-blue-400 mx-auto" />
                        <p className="text-gray-600 dark:text-gray-400">Loading form details...</p>
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('forms.index'))}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Forms
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [isFullscreenViewerOpen, setIsFullscreenViewerOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null!);
    const iframeRef = useRef<HTMLIFrameElement>(null!);

    // Determine file types
    const isPdf = form.mime_type?.includes('pdf') || form.file_type?.includes('pdf');
    const isImage = form.mime_type?.startsWith('image/') || 
                   ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].some(ext => 
                       form.file_type?.includes(ext) || form.file_name?.endsWith(ext)
                   );
    const isOfficeDoc = ['word', 'doc', 'excel', 'sheet', 'powerpoint', 'presentation'].some(term => 
        form.mime_type?.includes(term) || form.file_type?.includes(term)
    );

    // Generate preview URL
    const getPreviewUrl = () => {
        if (!form?.file_path) return '';
        return `/storage/${form.file_path}`;
    };

    const previewUrl = getPreviewUrl();

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('forms.destroy', form.id), {
            preserveScroll: false,
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleToggleStatus = () => {
        router.post(route('forms.toggle-status', form.id), {}, {
            preserveScroll: true,
        });
    };

    const handleToggleFeatured = () => {
        router.post(route('forms.toggle-featured', form.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDownload = () => {
        window.open(route('forms.download', form.id), '_blank');
    };

    const handleCopyLink = () => {
        const link = route('forms.download', form.id);
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleCopyDetails = () => {
        const details = `
Form: ${form.title}
Category: ${form.category}
Agency: ${form.issuing_agency}
Description: ${form.description}
Views: ${form.view_count}
Downloads: ${form.download_count}
Download Link: ${route('forms.download', form.id)}
        `.trim();
        
        navigator.clipboard.writeText(details);
    };

    const handlePrint = () => {
        window.print();
    };

    // Preview controls
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
    const handleZoomReset = () => {
        setZoomLevel(100);
        setRotation(0);
    };
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    // Handle fullscreen
    const handleFullscreen = () => {
        setIsFullscreenViewerOpen(true);
    };

    // Handle iframe loading
    const handleIframeLoad = () => {
        setIsLoadingPreview(false);
        setPreviewError(null);
    };

    const handleIframeError = () => {
        setIsLoadingPreview(false);
        setPreviewError('Failed to load preview. The file may be corrupted or the format is not supported.');
    };

    const handleImageLoad = () => {
        setIsLoadingPreview(false);
        setPreviewError(null);
    };

    const handleImageError = () => {
        setIsLoadingPreview(false);
        setPreviewError('Failed to load image. The file may be corrupted or the format is not supported.');
    };

    // Reset loading state when tab changes
    useEffect(() => {
        if (activeTab === 'preview') {
            setIsLoadingPreview(true);
            setPreviewError(null);
        } else {
            setIsLoadingPreview(false);
        }
    }, [activeTab]);

    return (
        <>
            {/* Fullscreen Viewer */}
            <FullScreenFormViewer
                form={form}
                previewUrl={previewUrl}
                isOpen={isFullscreenViewerOpen}
                onClose={() => setIsFullscreenViewerOpen(false)}
                isPdf={isPdf}
                isImage={isImage}
                formatFileSize={formatFileSize}
            />

            <AppLayout
                title={`${form.title} - Form Details`}
                breadcrumbs={[
                    { title: 'Dashboard', href: route('admin.dashboard') },
                    { title: 'Forms', href: route('admin.forms.index') },
                    { title: form.title, href: route('admin.forms.show', form.id) }
                ]}
            >
                <Head title={`${form.title} - Form Details`} />
                
                <TooltipProvider>
                    <div className="space-y-6">
                        {/* Header with Actions */}
                        <FormHeader
                            form={form}
                            onToggleStatus={handleToggleStatus}
                            onToggleFeatured={handleToggleFeatured}
                            onDownload={handleDownload}
                            onCopyLink={handleCopyLink}
                            onDelete={() => setShowDeleteDialog(true)}
                        />

                        {/* Tabs */}
                        <FormTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            tabs={[
                                { id: 'details', label: 'Form Details', icon: 'FileText' },
                                { id: 'preview', label: 'Preview', icon: 'Eye' },
                                { id: 'stats', label: 'Statistics', icon: 'BarChart3' },
                                { id: 'related', label: 'Related Forms', icon: 'FolderOpen' },
                            ]}
                        />

                        {/* Main Content */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Form Details & Preview */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Form Details Card */}
                                {activeTab === 'details' && (
                                    <FormDetailsCard
                                        form={form}
                                        onDownload={handleDownload}
                                        getFileIcon={getFileIcon}
                                        getFileTypeIcon={getFileTypeIcon}
                                        getCategoryColor={getCategoryColor}
                                        getAgencyIcon={getAgencyIcon}
                                        formatFileSize={formatFileSize}
                                    />
                                )}

                                {/* Preview Tab */}
                                {activeTab === 'preview' && (
                                    <FormPreviewCard
                                        form={form}
                                        previewUrl={previewUrl}
                                        isPdf={isPdf}
                                        isImage={isImage}
                                        isOfficeDoc={isOfficeDoc}
                                        isLoadingPreview={isLoadingPreview}
                                        previewError={previewError}
                                        zoomLevel={zoomLevel}
                                        rotation={rotation}
                                        iframeRef={iframeRef}
                                        previewContainerRef={previewContainerRef}
                                        onZoomIn={handleZoomIn}
                                        onZoomOut={handleZoomOut}
                                        onZoomReset={handleZoomReset}
                                        onRotate={handleRotate}
                                        onFullscreen={handleFullscreen}
                                        onDownload={handleDownload}
                                        onPrint={handlePrint}
                                        onIframeLoad={handleIframeLoad}
                                        onIframeError={handleIframeError}
                                        onImageLoad={handleImageLoad}
                                        onImageError={handleImageError}
                                        formatFileSize={formatFileSize}
                                    />
                                )}

                                {/* Statistics Tab */}
                                {activeTab === 'stats' && (
                                    <StatisticsCard
                                        form={form}
                                        download_stats={download_stats}
                                        view_stats={view_stats}
                                        formatDateTime={formatDateTime}
                                    />
                                )}

                                {/* Related Forms */}
                                {activeTab === 'related' && (
                                    <RelatedFormsCard
                                        related_forms={related_forms}
                                        getFileTypeIcon={getFileTypeIcon}
                                        getCategoryColor={getCategoryColor}
                                        formatFileSize={formatFileSize}
                                    />
                                )}
                            </div>

                            {/* Right Column - Metadata & Actions */}
                            <FormMetadataSidebar
                                form={form}
                                copied={copied}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                onDownload={handleDownload}
                                onFullscreen={handleFullscreen}
                                onCopyLink={handleCopyLink}
                                onCopyDetails={handleCopyDetails}
                                onPrint={handlePrint}
                                onDelete={() => setShowDeleteDialog(true)}
                                formatFileSize={formatFileSize}
                                formatDate={formatDate}
                            />
                        </div>
                    </div>
                </TooltipProvider>

                {/* Delete Confirmation Dialog */}
                <DeleteFormDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    form={form}
                    isDeleting={isDeleting}
                    onDelete={handleDelete}
                />
            </AppLayout>
        </>
    );
}