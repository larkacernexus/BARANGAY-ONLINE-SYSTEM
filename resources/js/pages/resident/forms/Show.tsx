// forms-show/index.tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernFloatingActionButton } from '@/components/residentui/modern-floating-action-button';
import { useMobileDetect, useScrollSpy } from '@/components/residentui/hooks/useResidentUI';
import { cn } from '@/lib/utils';

import { FormHeader } from '@/components/portal/forms/components/FormHeader';
import { MobileFormHeader } from '@/components/portal/forms/components/MobileFormHeader';
import { FormStats } from '@/components/portal/forms/components/FormStats';
import { FormTabs } from '@/components/portal/forms/components/FormTabs';
import { FormSidebar } from '@/components/portal/forms/components/FormSidebar';
import { FullscreenFormViewer } from '@/components/portal/forms/components/FullscreenFormViewer';
import { DetailsTab } from '@/components/portal/forms/tabs/DetailsTab';
import { PreviewTab } from '@/components/portal/forms/tabs/PreviewTab';
import { RelatedTab } from '@/components/portal/forms/tabs/RelatedTab';

import { useFormActions } from '@/components/residentui/hooks/useFormActions';
import { useFormPreview } from '@/components/residentui/hooks/useFormPreview';

import { Form, Permissions } from '@/types/portal/forms/form.types';
import { getFileIcon, getStatusConfig, getCategoryColor, getFileExtension, formatFileSize } from '@/utils/portal/forms/form-utils';
import { Info, Eye, FolderOpen, Download } from 'lucide-react';

interface FormsShowProps {
    form: Form;
    related_forms?: Form[];
    permissions?: Permissions;
}

export default function FormsShow({
    form,
    related_forms = [],
    permissions = {
        can_download: true,
        can_print: true,
        can_share: true,
    }
}: FormsShowProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [isFullscreenViewerOpen, setIsFullscreenViewerOpen] = useState(false);
    
    const { isMobile, isClient } = useMobileDetect();
    const showStickyActions = useScrollSpy(200);
    
    const {
        isDownloading,
        handleDownload,
        handleShare,
        copyFormLink,
        copyFormCode,
    } = useFormActions({ form, permissions });

    const {
        zoomLevel,
        setZoomLevel,
        isLoadingPdf,
        pdfError,
        handlePdfLoad,
        handlePdfError,
    } = useFormPreview();

    const FileIcon = getFileIcon(form.file_type);
    const statusConfig = getStatusConfig(form.is_active, form.is_featured);
    const previewUrl = `/storage/${form.file_path}`;
    const isPdf = form.file_type.includes('pdf') || form.mime_type.includes('pdf');
    const isImage = form.mime_type?.startsWith('image/') || 
                   ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(form.file_name.split('.').pop()?.toLowerCase() || '');

    const tabsConfig = [
        { id: 'details', label: 'Details', icon: Info },
        { id: 'preview', label: 'Preview', icon: Eye },
        { id: 'related', label: 'Related', icon: FolderOpen },
    ];

    const getTabCount = (tabId: string) => {
        if (tabId === 'related') return related_forms.length;
        return 0;
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFullscreen = () => {
        setIsFullscreenViewerOpen(true);
    };

    const getFABConfig = () => {
        if (permissions.can_download && form.is_active) {
            return {
                icon: <Download className="h-6 w-6 text-white" />,
                label: 'Download',
                color: 'blue' as const,
                onClick: handleDownload
            };
        }
        return null;
    };

    const fabConfig = getFABConfig();

    return (
        <>
            <FullscreenFormViewer
                form={form}
                previewUrl={previewUrl}
                isOpen={isFullscreenViewerOpen}
                onClose={() => setIsFullscreenViewerOpen(false)}
            />

            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Forms', href: '/forms' },
                    { title: form.title, href: `#` }
                ]}
                hideMobileFooter={isMobile}
            >
                <div className="space-y-3 md:space-y-6 px-4 md:px-6 pb-32 md:pb-6">
                    {isMobile ? (
                        <MobileFormHeader
                            form={form}
                            statusConfig={statusConfig}
                            showStickyActions={showStickyActions}
                            onCopyCode={copyFormCode}
                            onBack={() => router.get('/forms')}
                        />
                    ) : (
                        <FormHeader
                            form={form}
                            statusConfig={statusConfig}
                            permissions={permissions}
                            isDownloading={isDownloading}
                            onDownload={handleDownload}
                            onShare={handleShare}
                            onFullscreen={handleFullscreen}
                            onCopyLink={copyFormLink}
                            onCopyCode={copyFormCode}
                        />
                    )}

                    {!isMobile && (
                        <FormStats
                            form={form}
                            fileExtension={getFileExtension(form.file_name)}
                            fileSize={formatFileSize(form.file_size)}
                        />
                    )}

                    <div className={cn(
                        "grid gap-3 md:gap-6",
                        isMobile ? "grid-cols-1" : "lg:grid-cols-3"
                    )}>
                        <div className={isMobile ? "col-span-1" : "lg:col-span-2"}>
                            <FormTabs
                                tabs={tabsConfig}
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                                getTabCount={getTabCount}
                            />
                            
                            <div className="mt-3 space-y-3">
                                {activeTab === 'details' && (
                                    <DetailsTab form={form} />
                                )}
                                
                                {activeTab === 'preview' && (
                                    <PreviewTab
                                        form={form}
                                        previewUrl={previewUrl}
                                        isPdf={isPdf}
                                        isImage={isImage}
                                        zoomLevel={zoomLevel}
                                        setZoomLevel={setZoomLevel}
                                        isLoadingPdf={isLoadingPdf}
                                        pdfError={pdfError}
                                        onPdfLoad={handlePdfLoad}
                                        onPdfError={handlePdfError}
                                        onFullscreen={handleFullscreen}
                                        onDownload={handleDownload}
                                        isDownloading={isDownloading}
                                        permissions={permissions}
                                    />
                                )}
                                
                                {activeTab === 'related' && (
                                    <RelatedTab relatedForms={related_forms} />
                                )}
                            </div>
                        </div>

                        {!isMobile && (
                            <div className="space-y-4 lg:space-y-6">
                                <FormSidebar
                                    form={form}
                                    statusConfig={statusConfig}
                                    permissions={permissions}
                                    isDownloading={isDownloading}
                                    onDownload={handleDownload}
                                    onShare={handleShare}
                                    onFullscreen={handleFullscreen}
                                    onCopyLink={copyFormLink}
                                    onCopyCode={copyFormCode}
                                    onPreviewTab={() => setActiveTab('preview')}
                                    fileExtension={getFileExtension(form.file_name)}
                                    fileSize={formatFileSize(form.file_size)}
                                    isPdf={isPdf}
                                    isImage={isImage}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {isMobile && showStickyActions && fabConfig && (
                    <ModernFloatingActionButton
                        icon={fabConfig.icon}
                        label={fabConfig.label}
                        onClick={fabConfig.onClick}
                        color={fabConfig.color}
                    />
                )}

                <ModernLoadingOverlay loading={isDownloading} message="Downloading form..." />
            </ResidentLayout>
        </>
    );
}