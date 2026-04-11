// clearance-show/index.tsx
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { useMobileDetect, useScrollSpy, useExpandableSections } from '@/components/residentui/hooks/useResidentUI';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernFloatingActionButton } from '@/components/residentui/modern-floating-action-button';
import { ModernDocumentViewer } from '@/components/residentui/modern-document-viewer';
import { cn } from '@/lib/utils';

import { ClearanceHeader } from '@/components/portal/clearance/show/components/ClearanceHeader';
import { MobileClearanceHeader } from '@/components/portal/clearance/show/components/MobileClearanceHeader';
import { ClearanceStats } from '@/components/portal/clearance/show/components/ClearanceStats';
import { ClearanceTabs } from '@/components/portal/clearance/show/components/ClearanceTabs';
import { ClearanceSidebar } from '@/components/portal/clearance/show/components/ClearanceSidebar';
import { DetailsTab } from '@/components/portal/clearance/show/tabs/DetailsTab';
import { DocumentsTab } from '@/components/portal/clearance/show/tabs/DocumentsTab';
import { PaymentsTab } from '@/components/portal/clearance/show/tabs/PaymentsTab';
import { HistoryTab } from '@/components/portal/clearance/show/tabs/HistoryTab';

import { useClearanceActions } from '@/components/residentui/hooks/useClearanceActions';
import { useClearanceDialogs } from '@/components/residentui/hooks/useClearanceDialogs';

import { ClearanceRequest, ClearanceDocument, PaymentItem as ClearancePaymentItem } from '@/types/portal/clearances/clearance.types';
import { getStatusConfig, calculateTotalPaid, calculateBalance, isPaymentRequired as checkPaymentRequired } from '@/utils/portal/clearances/clearance-utils';
import { formatCurrency } from '@/components/residentui/clearances/clearance-utils';
import { AlertCircle, DollarSign, Download, Edit, Layers, MessageSquare, Paperclip, Receipt, Smartphone, XCircle } from 'lucide-react';

interface PageProps {
    clearance: ClearanceRequest;
    payment_items?: ClearancePaymentItem[];
}

export default function ClearanceDetail({ clearance, payment_items = [] }: PageProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [viewingDocument, setViewingDocument] = useState<ClearanceDocument | null>(null);
    
    const { isMobile, isClient } = useMobileDetect();
    const showStickyActions = useScrollSpy(200);
    const { expandedSections, toggleSection } = useExpandableSections({
        requestInfo: true,
        clearanceInfo: true,
        paymentSummary: true
    });
    
    const {
        loading,
        isDownloadingClearance,
        isPrinting,
        handleClearanceDownload,
        handleDocumentDownload,
        handlePrint,
        handleCancelRequest,
        copyReferenceNumber,
        setLoading
    } = useClearanceActions({ clearance });

    const {
        showCancelDialog,
        setShowCancelDialog
    } = useClearanceDialogs();

    useEffect(() => {
        if (isClient) {
            document.title = `Clearance #${clearance.reference_number} | Barangay System`;
        }
    }, [clearance.reference_number, isClient]);

    const paymentItems = payment_items || clearance.payment_items || [];
    const totalPaid = calculateTotalPaid(paymentItems);
    const feeAmount = typeof clearance.fee_amount === 'string' ? parseFloat(clearance.fee_amount) : clearance.fee_amount;
    const balance = calculateBalance(feeAmount, totalPaid);
    const isPaymentRequired = checkPaymentRequired(clearance);
    const isReadyForPayment = clearance.status === 'pending_payment' || clearance.status === 'processing';

    const tabsConfig = [
        { id: 'details', label: 'Details', icon: Layers },
        { id: 'documents', label: 'Documents', icon: Paperclip },
        { id: 'payments', label: 'Payments', icon: DollarSign },
        { id: 'history', label: 'History', icon: MessageSquare },
    ];

    const getTabCount = (tabId: string) => {
        switch(tabId) {
            case 'documents': return clearance.documents?.length || 0;
            case 'payments': return paymentItems.length;
            case 'history': return clearance.status_history?.length || 0;
            default: return 0;
        }
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getFABConfig = () => {
        if (clearance.status === 'pending') {
            return {
                icon: <XCircle className="h-6 w-6 text-white" />,
                label: 'Cancel Request',
                color: 'red' as const,
                onClick: () => handleCancelRequest()
            };
        } else if (clearance.status === 'issued' && clearance.clearance_number) {
            return {
                icon: <Download className="h-6 w-6 text-white" />,
                label: 'Download Clearance',
                color: 'blue' as const,
                onClick: handleClearanceDownload
            };
        } else if (isReadyForPayment && isPaymentRequired) {
            return {
                icon: <DollarSign className="h-6 w-6 text-white" />,
                label: 'Pay Now',
                color: 'green' as const,
                onClick: () => alert(`Pay ${formatCurrency(balance)} at Barangay Hall`)
            };
        }
        return null;
    };

    const fabConfig = getFABConfig();

    const renderTabContent = () => {
        switch(activeTab) {
            case 'details':
                return (
                    <DetailsTab
                        clearance={clearance}
                        expandedSections={expandedSections}
                        toggleSection={toggleSection}
                        isMobile={isMobile}
                        onCopyReference={copyReferenceNumber}
                    />
                );
            case 'documents':
                return (
                    <DocumentsTab
                        documents={clearance.documents || []}
                        onView={setViewingDocument}
                        onDownload={handleDocumentDownload}
                    />
                );
            case 'payments':
                return (
                    <PaymentsTab
                        paymentItems={paymentItems}
                        feeAmount={feeAmount}
                        totalPaid={totalPaid}
                        balance={balance}
                        isPaymentRequired={isPaymentRequired}
                    />
                );
            case 'history':
                return <HistoryTab statusHistory={clearance.status_history || []} />;
            default:
                return null;
        }
    };

    if (!clearance) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Clearances', href: '/portal/my-clearances' }
                ]}
            >
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <ModernEmptyState
                        status="empty"
                        title="Clearance Not Found"
                        message="The clearance request you're looking for doesn't exist or has been deleted."
                        icon={AlertCircle}
                        actionLabel="Back to Clearances"
                        onAction={() => router.get('/my-clearances')}
                    />
                </div>
            </ResidentLayout>
        );
    }

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Clearances', href: '/portal/my-clearances' },
                { title: `#${clearance.reference_number}`, href: '#' }
            ]}
        >
            <div className="space-y-3 md:space-y-6 px-4 md:px-6 pb-32 md:pb-6">
                {isMobile ? (
                    <MobileClearanceHeader
                        clearance={clearance}
                        showStickyActions={showStickyActions}
                        isDownloadingClearance={isDownloadingClearance}
                        isPrinting={isPrinting}
                        onDownload={handleClearanceDownload}
                        onPrint={handlePrint}
                        onCopyReference={copyReferenceNumber}
                        onCancel={handleCancelRequest}
                    />
                ) : (
                    <ClearanceHeader
                        clearance={clearance}
                        isDownloadingClearance={isDownloadingClearance}
                        isPrinting={isPrinting}
                        onDownload={handleClearanceDownload}
                        onPrint={handlePrint}
                        onCopyReference={copyReferenceNumber}
                        onCancel={handleCancelRequest}
                    />
                )}

                {!isMobile && (
                    <ClearanceStats
                        clearance={clearance}
                        feeAmount={feeAmount}
                        totalPaid={totalPaid}
                        balance={balance}
                    />
                )}

                <div className={cn("grid gap-3 md:gap-6", isMobile ? "grid-cols-1" : "lg:grid-cols-3")}>
                    <div className={isMobile ? "col-span-1" : "lg:col-span-2"}>
                        <ClearanceTabs
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
                            <ClearanceSidebar
                                clearance={clearance}
                                feeAmount={feeAmount}
                                totalPaid={totalPaid}
                                balance={balance}
                                isPaymentRequired={isPaymentRequired}
                                isReadyForPayment={isReadyForPayment}
                                onDownload={handleClearanceDownload}
                                onPrint={handlePrint}
                                onCancel={handleCancelRequest}
                                isDownloadingClearance={isDownloadingClearance}
                                isPrinting={isPrinting}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Floating Action Button */}
            {isMobile && showStickyActions && fabConfig && (
                <ModernFloatingActionButton
                    icon={fabConfig.icon}
                    label={fabConfig.label}
                    onClick={fabConfig.onClick}
                    color={fabConfig.color}
                />
            )}

            {/* Document Viewer */}
            {viewingDocument && (
                <ModernDocumentViewer
                    document={viewingDocument}
                    isOpen={!!viewingDocument}
                    onClose={() => setViewingDocument(null)}
                />
            )}

            <ModernLoadingOverlay loading={loading} message="Loading..." />
        </ResidentLayout>
    );
}