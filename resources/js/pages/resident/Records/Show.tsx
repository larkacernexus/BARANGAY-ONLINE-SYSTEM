// pages/portal/my-records/show.tsx
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { useMobileDetect } from '@/components/residentui/hooks/useResidentUI';
import { FullscreenViewer } from '@/components/portal/records/show/components/fullscreen-viewer';
import { PasswordForm } from '@/components/portal/records/show/components/password-form';
import { getPreviewUrl } from '@/utils/portal/records/document.utils';

// Mobile Components
import { MobileHeader } from '@/components/portal/records/show/components/mobile/mobile-header';
import { MobileStats } from '@/components/portal/records/show/components/mobile/mobile-stats';
import { MobilePreview } from '@/components/portal/records/show/components/mobile/mobile-preview';
import { MobileDetails } from '@/components/portal/records/show/components/mobile/mobile-details';
import { MobileSecurity } from '@/components/portal/records/show/components/mobile/mobile-security';
import { MobileRelated } from '@/components/portal/records/show/components/mobile/mobile-related';
import { MobileBottomBar } from '@/components/portal/records/show/components/mobile/mobile-bottom-bar';

// Desktop Components
import { DesktopHeader } from '@/components/portal/records/show/components/desktop/desktop-header';
import { DesktopStats } from '@/components/portal/records/show/components/desktop/desktop-stats';
import { DesktopPreview } from '@/components/portal/records/show/components/desktop/desktop-preview';
import { DesktopDetails } from '@/components/portal/records/show/components/desktop/desktop-details';
import { DesktopSidebar } from '@/components/portal/records/show/components/desktop/desktop-sidebar';
import { RelatedDocument, Document } from '@/types/portal/records/records';

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
    const { isMobile } = useMobileDetect();
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleDownload = () => {
        if (isDownloading) return;
        setIsDownloading(true);
        window.open(`/my-records/${document.id}/download`, '_blank');
        setTimeout(() => setIsDownloading(false), 1000);
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
        setIsDeleting(true);
        router.delete(`/my-records/${document.id}`, {
            preserveScroll: true,
            onSuccess: () => router.visit('/my-records'),
            onFinish: () => setIsDeleting(false),
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        router.post(`/my-records/${document.id}/verify-password`, { password }, {
            preserveScroll: true,
            preserveState: false,
            onError: (errors) => {
                setPasswordError(errors.password || 'Invalid password');
                setIsVerifying(false);
            },
            onFinish: () => setIsVerifying(false),
        });
    };

    const previewUrl = getPreviewUrl(document);
    const showPasswordForm = needsPassword || (document.requires_password && !sessionExpiry);

    // Password Form View
    if (showPasswordForm) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Records', href: '/portal/my-records' },
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

    // Mobile Layout
    if (isMobile) {
        return (
            <>
                <FullscreenViewer
                    document={document}
                    previewUrl={previewUrl}
                    isOpen={isFullscreenViewerOpen}
                    onClose={() => setIsFullscreenViewerOpen(false)}
                    onDownload={handleDownload}
                />

                <ResidentLayout
                    breadcrumbs={[
                        { title: 'Dashboard', href: '/portal/dashboard' },
                        { title: 'My Records', href: '/portal/my-records' },
                        { title: document.name, href: '#' },
                    ]}
                    hideMobileFooter={true}
                >
                    <Head title={`${document.name} - My Records`} />

                    <div className="min-h-screen pb-24">
                        <MobileHeader
                            document={document}
                            onFullscreen={() => setIsFullscreenViewerOpen(true)}
                            onDownload={handleDownload}
                            canDownload={canDownload}
                        />

                        <MobileStats document={document} />

                        <div className="space-y-4 py-4">
                            <MobilePreview
                                document={document}
                                previewUrl={previewUrl}
                                onFullscreen={() => setIsFullscreenViewerOpen(true)}
                            />
                            <MobileDetails document={document} />
                            <MobileSecurity document={document} />
                            <MobileRelated relatedDocuments={relatedDocuments} />
                        </div>

                        <MobileBottomBar
                            document={document}
                            onDownload={handleDownload}
                            onFullscreen={() => setIsFullscreenViewerOpen(true)}
                            canDownload={canDownload}
                        />
                    </div>
                </ResidentLayout>
            </>
        );
    }

    // Desktop Layout
    return (
        <>
            <FullscreenViewer
                document={document}
                previewUrl={previewUrl}
                isOpen={isFullscreenViewerOpen}
                onClose={() => setIsFullscreenViewerOpen(false)}
                onDownload={handleDownload}
            />

            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Records', href: '/portal/my-records' },
                    { title: document.name, href: '#' },
                ]}
            >
                <Head title={`${document.name} - My Records`} />

                <div className="pb-8">
                    <DesktopHeader
                        document={document}
                        onFullscreen={() => setIsFullscreenViewerOpen(true)}
                        onDownload={handleDownload}
                        canDownload={canDownload}
                        isDownloading={isDownloading}
                    />

                    <div className="px-8 py-6 space-y-6">
                        <DesktopStats document={document} />

                        <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-2 space-y-6">
                                <DesktopPreview
                                    document={document}
                                    previewUrl={previewUrl}
                                    onFullscreen={() => setIsFullscreenViewerOpen(true)}
                                />
                                <DesktopDetails document={document} />
                            </div>

                            <div className="col-span-1">
                                <DesktopSidebar
                                    document={document}
                                    relatedDocuments={relatedDocuments}
                                    onFullscreen={() => setIsFullscreenViewerOpen(true)}
                                    onDownload={handleDownload}
                                    canDownload={canDownload}
                                    isDownloading={isDownloading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <ModernLoadingOverlay loading={isDeleting} message="Deleting document..." />
            </ResidentLayout>
        </>
    );
}