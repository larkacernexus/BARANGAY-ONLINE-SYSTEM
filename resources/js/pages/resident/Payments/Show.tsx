// payment-show/index.tsx
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { toast } from 'sonner';
import { useMobileDetect, useScrollSpy, useExpandableSections } from '@/components/residentui/hooks/useResidentUI';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernFloatingActionButton } from '@/components/residentui/modern-floating-action-button';

import { PaymentHeader } from '@/components/portal/payments/show/components/PaymentHeader';
import { PaymentStats } from '@/components/portal/payments/show/components/PaymentStats';
import { PaymentTabs } from '@/components/portal/payments/show/components/PaymentTabs';
import { PaymentSidebar } from '@/components/portal/payments/show/components/PaymentSidebar';
import { MobilePaymentHeader } from '@/components/portal/payments/show/components/mobile/MobilePaymentHeader';
import { DetailsTab } from '@/components/portal/payments/show/tabs/DetailsTab';
import { ItemsTab } from '@/components/portal/payments/show/tabs/ItemsTab';
import { AttachmentsTab } from '@/components/portal/payments/show/tabs/AttachmentsTab';
import { NotesTab } from '@/components/portal/payments/show/tabs/NotesTab';
import { HistoryTab } from '@/components/portal/payments/show/tabs/HistoryTab';

import { AddNoteDialog } from '@/components/portal/payments/show/components/dialogs/AddNoteDialog';
import { UploadAttachmentDialog } from '@/components/portal/payments/show/components/dialogs/UploadAttachmentDialog';
import { ChangePaymentMethodDialog } from '@/components/portal/payments/show/components/dialogs/ChangePaymentMethodDialog';
import { CancelPaymentDialog } from '@/components/portal/payments/show/components/dialogs/CancelPaymentDialog';
import { ReceiptPreviewDialog } from '@/components/portal/payments/show/components/dialogs/ReceiptPreviewDialog';
import { DeletePaymentDialog } from '@/components/portal/payments/show/components/dialogs/DeletePaymentDialog';

import { usePaymentActions } from '@/components/residentui/hooks/usePaymentActions';
import { usePaymentDialogs } from '@/components/residentui/hooks/usePaymentDialogs';

import { PaymentShowPageProps, PaymentAttachment } from '@/types/portal/payments/payment.types';
import { getPaymentStatusConfig, calculateProgress } from '@/utils/portal/payments/payment-utils';
import { 
    AlertCircle, 
    DollarSign, 
    Download, 
    Edit, 
    Layers, 
    MessageSquare, 
    Paperclip, 
    Receipt, 
    Smartphone,
    History  // Add History here
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModernDocumentViewer } from '@/components/residentui/modern-document-viewer';

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
}: PaymentShowPageProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [viewingAttachment, setViewingAttachment] = useState<PaymentAttachment | null>(null);
    
    const { isMobile, isClient } = useMobileDetect();
    const showStickyActions = useScrollSpy(200);
    const { expandedSections, toggleSection } = useExpandableSections({
        paymentInfo: true,
        payerInfo: true,
        breakdownInfo: true
    });
    
    const {
        loading,
        isDownloadingReceipt,
        isPrinting,
        isSavingReceipt,
        handlePrintReceipt,
        handleDownloadReceipt,
        handleSaveReceipt,
        handleShare,
        handleEdit,
        handleDelete,
        handleCancel,
        handleUpdatePaymentMethod,
        handleAddNote,
        handleUploadAttachment,
        handleDownloadAttachment,
        handleDeleteAttachment,
        handleGetPaymentLink,
        copyOrNumber,
        setLoading
    } = usePaymentActions({ payment, canEdit, canDelete, canAddNote, canUploadAttachment, canPayOnline });

    const {
        showDeleteDialog,
        showCancelDialog,
        showRefundDialog,
        showReceiptPreview,
        showAddNoteDialog,
        showUploadDialog,
        showPaymentMethodDialog,
        noteContent,
        setNoteContent,
        isPublicNote,
        setIsPublicNote,
        uploadFile,
        setUploadFile,
        uploadDescription,
        setUploadDescription,
        cancelReason,
        setCancelReason,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        referenceNumber,
        setReferenceNumber,
        setShowDeleteDialog,
        setShowCancelDialog,
        setShowRefundDialog,
        setShowReceiptPreview,
        setShowAddNoteDialog,
        setShowUploadDialog,
        setShowPaymentMethodDialog,
        resetDialogs
    } = usePaymentDialogs();

    useEffect(() => {
        if (isClient) {
            document.title = `Payment OR #${payment.or_number} | Barangay System`;
        }
    }, [payment.or_number, isClient]);

    const statusConfig = getPaymentStatusConfig(payment.status);
    const progress = calculateProgress(payment);

    // Wrapper functions for dialogs
    const handleAddNoteWrapper = () => {
        handleAddNote(noteContent, isPublicNote);
    };

    const handleUploadWrapper = () => {
        if (uploadFile) {
            handleUploadAttachment(uploadFile, uploadDescription);
        }
    };

    const handleCancelWrapper = () => {
        handleCancel(cancelReason);
    };

    const handleUpdatePaymentMethodWrapper = () => {
        handleUpdatePaymentMethod(selectedPaymentMethod, referenceNumber);
    };

    const handleViewAttachment = (attachment: PaymentAttachment) => {
        setViewingAttachment(attachment);
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
                color: 'purple' as const,
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

    const tabsConfig = [
        { id: 'details', label: 'Details', icon: Receipt },
        { id: 'items', label: 'Items', icon: Layers },
        { id: 'attachments', label: 'Attachments', icon: Paperclip },
        { id: 'notes', label: 'Notes', icon: MessageSquare },
        { id: 'history', label: 'History', icon: History }, // Now History is imported
    ];

    const getTabCount = (tabId: string) => {
        switch(tabId) {
            case 'items': return payment.items?.length || 0;
            case 'attachments': return payment.attachments?.length || 0;
            case 'notes': return payment.notes?.length || 0;
            case 'history': return payment.audit_log?.length || 0;
            default: return 0;
        }
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'details':
                return (
                    <DetailsTab
                        payment={payment}
                        expandedSections={expandedSections}
                        toggleSection={toggleSection}
                        isMobile={isMobile}
                        onCopyOrNumber={copyOrNumber}
                    />
                );
            case 'items':
                return <ItemsTab items={payment.items || []} />;
            case 'attachments':
                return (
                    <AttachmentsTab
                        attachments={payment.attachments || []}
                        canUpload={canUploadAttachment && payment.status === 'pending'}
                        onUpload={() => setShowUploadDialog(true)}
                        onView={handleViewAttachment}
                        onDownload={handleDownloadAttachment}
                        onDelete={handleDeleteAttachment}
                    />
                );
            case 'notes':
                return (
                    <NotesTab
                        notes={payment.notes || []}
                        canAdd={canAddNote}
                        onAdd={() => setShowAddNoteDialog(true)}
                    />
                );
            case 'history':
                return <HistoryTab auditLog={payment.audit_log || []} />;
            default:
                return null;
        }
    };

    if (error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/payments' },
                    { title: 'Error', href: '#' }
                ]}
            >
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <ModernEmptyState
                        status="default"
                        title="Error Loading Payment"
                        message={error}
                        icon={AlertCircle}
                        actionLabel="Back to Payments"
                        onAction={() => router.get('/payments')}
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
                    { title: 'My Payments', href: '/portal/payments' }
                ]}
            >
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <ModernEmptyState
                        status="default"
                        title="Payment Not Found"
                        message="The payment you're looking for doesn't exist or has been deleted."
                        icon={Receipt}
                        actionLabel="Back to Payments"
                        onAction={() => router.get('/payments')}
                    />
                </div>
            </ResidentLayout>
        );
    }

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Payments', href: '/portal/payments' },
                { title: `OR #${payment.or_number}`, href: '#' }
            ]}
            hideMobileFooter={isMobile}
        >
            <div className="space-y-3 md:space-y-6 px-4 md:px-6 pb-32 md:pb-6">
                {isMobile ? (
                    <MobilePaymentHeader
                        payment={payment}
                        statusConfig={statusConfig}
                        showStickyActions={showStickyActions}
                        canPrint={canPrint}
                        canDownload={canDownload}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        canAddNote={canAddNote}
                        canUploadAttachment={canUploadAttachment}
                        canPayOnline={canPayOnline}
                        isPrinting={isPrinting}
                        isDownloadingReceipt={isDownloadingReceipt}
                        isSavingReceipt={isSavingReceipt}
                        onPrint={handlePrintReceipt}
                        onDownload={handleDownloadReceipt}
                        onSaveReceipt={handleSaveReceipt}
                        onShare={handleShare}
                        onEdit={handleEdit}
                        onDelete={() => setShowDeleteDialog(true)}
                        onCancel={() => setShowCancelDialog(true)}
                        onAddNote={() => setShowAddNoteDialog(true)}
                        onUpload={() => setShowUploadDialog(true)}
                        onChangePaymentMethod={() => setShowPaymentMethodDialog(true)}
                        onPayOnline={handleGetPaymentLink}
                        onCopyOrNumber={copyOrNumber}
                    />
                ) : (
                    <PaymentHeader
                        payment={payment}
                        statusConfig={statusConfig}
                        canPrint={canPrint}
                        canDownload={canDownload}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        canAddNote={canAddNote}
                        canUploadAttachment={canUploadAttachment}
                        canPayOnline={canPayOnline}
                        isPrinting={isPrinting}
                        isDownloadingReceipt={isDownloadingReceipt}
                        isSavingReceipt={isSavingReceipt}
                        onPrint={handlePrintReceipt}
                        onDownload={handleDownloadReceipt}
                        onSaveReceipt={handleSaveReceipt}
                        onShare={handleShare}
                        onEdit={handleEdit}
                        onDelete={() => setShowDeleteDialog(true)}
                        onCancel={() => setShowCancelDialog(true)}
                        onAddNote={() => setShowAddNoteDialog(true)}
                        onUpload={() => setShowUploadDialog(true)}
                        onChangePaymentMethod={() => setShowPaymentMethodDialog(true)}
                        onPayOnline={handleGetPaymentLink}
                        onCopyOrNumber={copyOrNumber}
                    />
                )}

                {!isMobile && <PaymentStats payment={payment} progress={progress} />}

                <div className={cn("grid gap-3 md:gap-6", isMobile ? "grid-cols-1" : "lg:grid-cols-3")}>
                    <div className={isMobile ? "col-span-1" : "lg:col-span-2"}>
                        <PaymentTabs
                            tabs={tabsConfig}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            getTabCount={getTabCount}
                        />
                        <div className="mt-3 space-y-3">
                            {renderTabContent()}
                        </div>
                    </div>

                    {!isMobile && (
                        <div className="space-y-4 lg:space-y-6">
                            <PaymentSidebar payment={payment} />
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <AddNoteDialog
                open={showAddNoteDialog}
                onOpenChange={setShowAddNoteDialog}
                noteContent={noteContent}
                setNoteContent={setNoteContent}
                isPublic={isPublicNote}
                setIsPublic={setIsPublicNote}
                onSave={handleAddNoteWrapper}
                loading={loading}
            />

            <UploadAttachmentDialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
                file={uploadFile}
                setFile={setUploadFile}
                description={uploadDescription}
                setDescription={setUploadDescription}
                onUpload={handleUploadWrapper}
                loading={loading}
            />

            <ChangePaymentMethodDialog
                open={showPaymentMethodDialog}
                onOpenChange={setShowPaymentMethodDialog}
                paymentMethod={selectedPaymentMethod}
                setPaymentMethod={setSelectedPaymentMethod}
                referenceNumber={referenceNumber}
                setReferenceNumber={setReferenceNumber}
                onUpdate={handleUpdatePaymentMethodWrapper}
                loading={loading}
            />

            <CancelPaymentDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
                reason={cancelReason}
                setReason={setCancelReason}
                onConfirm={handleCancelWrapper}
                loading={loading}
            />

            <ReceiptPreviewDialog
                open={showReceiptPreview}
                onOpenChange={setShowReceiptPreview}
                payment={payment}
                onPrint={handlePrintReceipt}
                onDownload={handleDownloadReceipt}
                onSave={handleSaveReceipt}
                isPrinting={isPrinting}
                isDownloading={isDownloadingReceipt}
                isSaving={isSavingReceipt}
            />

            <DeletePaymentDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                loading={loading}
            />

            {/* Document Viewer */}
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