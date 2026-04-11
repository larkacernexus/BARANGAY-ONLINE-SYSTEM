import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import { toast } from 'sonner';

// Import components
import { HeaderWithActions } from '@/components/admin/clearances/show/HeaderWithActions';
import { StatusBanner } from '@/components/admin/clearances/show/StatusBanner';
import { TabNavigation } from '@/components/admin/clearances/show/TabNavigation';
import { DetailsTab } from '@/components/admin/clearances/show/tabs/DetailsTab';
import { DocumentsTab } from '@/components/admin/clearances/show/tabs/DocumentsTab';
import { PaymentTab } from '@/components/admin/clearances/show/tabs/PaymentTab';
import { HistoryTab } from '@/components/admin/clearances/show/tabs/HistoryTab';
import { StatusSummaryCard } from '@/components/admin/clearances/show/StatusSummaryCard';
import { ActionsPanel } from '@/components/admin/clearances/show/ActionsPanel';
import { QuickInfoCard } from '@/components/admin/clearances/show/QuickInfoCard';
import { DocumentViewer } from '@/components/admin/clearances/show/DocumentViewer';
import { PrintPreviewModal } from '@/components/admin/clearances/show/PrintPreviewModal';

// Import hooks
import { useClearanceActions } from '@/hooks/useClearanceActions';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import { useClearanceUtils } from '@/hooks/useClearanceUtils';
import { usePrintClearance } from '@/hooks/usePrintClearance';

// Import types
import { ClearanceRequest, ActivityLog } from '@/types/admin/clearances/clearance';

interface ShowClearanceProps {
    clearance: ClearanceRequest;
    activityLogs?: ActivityLog[];
    canEdit: boolean;
    canDelete: boolean;
    canProcess: boolean;
    canIssue: boolean;
    canApprove: boolean;
    canPrint: boolean;
}

export default function ShowClearance({
    clearance,
    activityLogs = [],
    canEdit = false,
    canDelete = false,
    canProcess = false,
    canIssue = false,
    canApprove = false,
    canPrint = false
}: ShowClearanceProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'payment' | 'history'>('details');
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // Custom hooks
    const {
        formatDate,
        formatDateTime,
        formatFileSize,
        formatCurrency,
        getFileIcon,
        getStatusVariant,
        getStatusIcon,
        getUrgencyVariant,
        getDocumentStatusColor,
        getDocumentStatusText,
        getValidityStatus,
        getDocumentStats
    } = useClearanceUtils();

    const {
        isProcessing,
        isPrinting,
        setIsPrinting,
        handlePrint,
        handleDownload,
        handleMarkAsProcessing,
        handleApprove,
        handleIssue,
        handleReject,
        handleCancel,
        handleDelete,
        handleEdit,
        handleVerifyPayment,
        handleRequestPayment,
        handleSendReminder,
        copyReferenceNumber
    } = useClearanceActions(clearance);

    const {
        viewedDocument,
        isViewerOpen,
        currentDocumentIndex,
        openDocument,
        closeDocumentViewer,
        navigateDocument,
        handleVerifyDocument,
        handleRejectDocument
    } = useDocumentViewer(clearance.documents);

    const { handlePrintClearance } = usePrintClearance(printRef);

    // Create wrapper function for print button
    const handlePrintButton = () => {
        handlePrintClearance(clearance);
    };

    // Derived data
    const validityStatus = getValidityStatus(clearance);
    const documentStats = getDocumentStats(clearance.documents);
    const clearanceType = clearance.clearance_type as any;
    const resident = clearance.resident as any;
    const payment = clearance.payment as any;

    // Check if ref has content
    useEffect(() => {
        if (showPrintPreview) {
            setTimeout(() => {
                if (printRef.current) {
                    console.log('Print ref has content:', printRef.current.innerHTML ? 'Yes' : 'No');
                } else {
                    console.log('Print ref is null');
                }
            }, 200);
        }
    }, [showPrintPreview]);

    // Document action handlers
    const onVerifyDocument = (documentId: number) => {
        handleVerifyDocument(documentId);
    };

    const onRejectDocument = (documentId: number, notes: string) => {
        handleRejectDocument(documentId, notes);
    };

    const onDownloadDocument = (doc: any) => {
        const link = window.document.createElement('a');
        link.href = doc.url || '#';
        link.download = doc.file_name || 'document';
        link.target = '_blank';
        link.click();
    };

    // Bulk document actions
    const handleVerifyAllDocuments = () => {
        if (confirm('Verify all pending documents?')) {
            router.post(`/admin/clearances/${clearance.id}/verify-all-documents`);
        }
    };

    const handleRequestMoreDocuments = () => {
        const reason = prompt('Enter reason for requesting more documents:');
        if (reason) {
            router.post(`/admin/clearances/${clearance.id}/request-more-documents`, { reason });
        }
    };

    const handleRequestDocuments = () => {
        router.post(`/admin/clearances/${clearance.id}/request-documents`);
    };

    const handleUploadDocuments = () => {
        router.visit(`/admin/clearances/${clearance.id}/upload`);
    };

    // Payment action handlers
    const onViewPaymentDetails = () => {
        if (payment?.id) {
            window.open(`/payments/${payment.id}`, '_blank');
        }
    };

    const onViewReceipt = () => {
        if (payment?.id) {
            window.open(`/payments/${payment.id}/receipt`, '_blank');
        }
    };

    // Note handler
    const handleAddNote = () => {
        toast.info('Add note feature coming soon');
    };

    return (
        <AppLayout
            title={`Clearance Request: ${clearance.reference_number}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearances', href: '/admin/clearances' },
                { title: clearance.reference_number, href: `/admin/clearances/${clearance.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header with Actions */}
                <HeaderWithActions
                    clearance={clearance}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canPrint={canPrint}
                    isPrinting={isPrinting}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPrint={handlePrintButton}
                    onPreview={() => setShowPrintPreview(true)}
                    onCopyReference={copyReferenceNumber}
                    getStatusVariant={getStatusVariant}
                    getStatusIcon={getStatusIcon}
                />

                {/* Status Banner */}
                <StatusBanner
                    clearance={clearance}
                    validityStatus={validityStatus}
                    formatDate={formatDate}
                    onPreview={() => setShowPrintPreview(true)}
                    onPrint={handlePrintButton}
                    onDownload={handleDownload}
                />

                {/* Main Content */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Request Details with Tabs */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Tab Navigation */}
                        <TabNavigation
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            clearance={clearance}
                        />

                        {/* Tab Content */}
                        <div className="pt-2">
                            {activeTab === 'details' && (
                                <DetailsTab
                                    clearance={clearance}
                                    clearanceType={clearanceType}
                                    resident={resident}
                                    formatDate={formatDate}
                                    formatCurrency={formatCurrency}
                                    getUrgencyVariant={getUrgencyVariant}
                                />
                            )}

                            {activeTab === 'documents' && (
                                <DocumentsTab
                                    documents={clearance.documents || []}
                                    documentStats={documentStats}
                                    canProcess={canProcess}
                                    onViewDocument={openDocument}
                                    onDownloadDocument={onDownloadDocument}
                                    onVerifyDocument={onVerifyDocument}
                                    onVerifyAll={handleVerifyAllDocuments}
                                    onRequestMore={handleRequestMoreDocuments}
                                    onRequestDocuments={handleRequestDocuments}
                                    onUploadDocuments={handleUploadDocuments}
                                    formatDateTime={formatDateTime}
                                    formatFileSize={formatFileSize}
                                    getFileIcon={getFileIcon}
                                    getDocumentStatusColor={getDocumentStatusColor}
                                    getDocumentStatusText={getDocumentStatusText}
                                />
                            )}

                            {activeTab === 'payment' && (
                                <PaymentTab
                                    clearance={clearance}
                                    clearanceType={clearanceType}
                                    payment={payment}
                                    canProcess={canProcess}
                                    onVerifyPayment={handleVerifyPayment}
                                    onSendReminder={handleSendReminder}
                                    onRequestPayment={handleRequestPayment}
                                    onViewPaymentDetails={onViewPaymentDetails}
                                    onViewReceipt={onViewReceipt}
                                    formatCurrency={formatCurrency}
                                    formatDateTime={formatDateTime}
                                />
                            )}

                            {activeTab === 'history' && (
                                <HistoryTab
                                    activityLogs={activityLogs}
                                    formatDateTime={formatDateTime}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right Column - Status & Actions */}
                    <div className="space-y-6">
                        <StatusSummaryCard
                            clearance={clearance}
                            formatDate={formatDate}
                            formatDateTime={formatDateTime}
                            formatCurrency={formatCurrency}
                            getStatusVariant={getStatusVariant}
                            getStatusIcon={getStatusIcon}
                        />

                        <ActionsPanel
                            clearance={clearance}
                            clearanceType={clearanceType}
                            canProcess={canProcess}
                            canApprove={canApprove}
                            canIssue={canIssue}
                            isProcessing={isProcessing}
                            onMarkAsProcessing={handleMarkAsProcessing}
                            onVerifyPayment={handleVerifyPayment}
                            onSendReminder={handleSendReminder}
                            onApprove={handleApprove}
                            onIssue={handleIssue}
                            onReject={handleReject}
                            onCancel={handleCancel}
                            onAddNote={handleAddNote}
                        />

                        <QuickInfoCard
                            clearance={clearance}
                            formatDate={formatDate}
                        />
                    </div>
                </div>
            </div>

            {/* Print Preview Modal */}
            <PrintPreviewModal
                showPrintPreview={showPrintPreview}
                onClose={() => setShowPrintPreview(false)}
                onPrint={() => {
                    handlePrintClearance(clearance, () => {
                        setIsPrinting(false);
                        setShowPrintPreview(false);
                    });
                }}
                isPrinting={isPrinting}
                clearance={clearance}
                printRef={printRef}
            />

            {/* Document Viewer Modal */}
            {isViewerOpen && viewedDocument && (
                <DocumentViewer
                    document={viewedDocument}
                    isOpen={isViewerOpen}
                    onClose={closeDocumentViewer}
                    onNext={() => navigateDocument('next')}
                    onPrev={() => navigateDocument('prev')}
                    hasNext={currentDocumentIndex < (clearance.documents?.length || 0) - 1}
                    hasPrev={currentDocumentIndex > 0}
                    onVerify={onVerifyDocument}
                    onReject={onRejectDocument}
                    canVerify={canProcess}
                />
            )}
        </AppLayout>
    );
}