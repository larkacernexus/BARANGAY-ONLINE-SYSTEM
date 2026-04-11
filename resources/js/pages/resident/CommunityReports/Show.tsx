// ShowReport.tsx
import { Head } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Printer, Share2, Trash2 } from 'lucide-react';
import { Badge}  from '@/components/ui/badge';
import { useState } from 'react';

// Custom Hooks
import { useMobileDetection } from '@/components/residentui/hooks/useReport';
import { useReportActions } from '@/components/residentui/hooks/useReportActions';

// Components
import { StatusBanner } from '@/components/portal/community-report/show/StatusBanner';
import { ReportInfoCard } from '@/components/portal/community-report/show/ReportInfoCard';
import { EvidenceCard } from '@/components/portal/community-report/show/EvidenceCard';
import { TimelineCard } from '@/components/portal/community-report/show/TimelineCard';
import { ReporterInfoCard } from '@/components/portal/community-report/show/ReporterInfoCard';
import { QuickActionsCard } from '@/components/portal/community-report/show/QuickActionsCard';
import { HelpCard } from '@/components/portal/community-report/show/HelpCard';
import { MobileHeader } from '@/components/portal/community-report/show/MobileHeader';
import { MobileTabNavigation } from '@/components/portal/community-report/show/MobileTabNavigation';

// Utils
import { formatDateTime } from '@/components/residentui/reports/report-utils';
import { 
    STATUS_CONFIG, 
    PRIORITY_CONFIG, 
    URGENCY_CONFIG, 
    IMPACT_CONFIG 
} from '@/components/residentui/reports/constants';

// Types
import { CommunityReport } from '@/types/portal/reports/community-report';

interface Props {
    report: CommunityReport;
}

export default function ShowReport({ report }: Props) {
    const [activeTab, setActiveTab] = useState('details');
    const [showActionsSheet, setShowActionsSheet] = useState(false);
    const { isMobile } = useMobileDetection();
    
    const {
        deletingEvidence,
        handlePrint,
        handleShare,
        handleDeleteEvidence,
        downloadEvidence
    } = useReportActions({ reportId: report.id });

    const getUrgencyBadge = (urgency: string) => {
        const config = URGENCY_CONFIG[urgency as keyof typeof URGENCY_CONFIG];
        if (!config) return null;
        
        return (
            <Badge variant="outline" className={`${config.color} border-0 flex items-center gap-1 text-xs`}>
                <span className={`h-2 w-2 rounded-full ${config.dot} mr-1`}></span>
                {config.label}
            </Badge>
        );
    };

    const getImpactBadge = (impact: string) => {
        const config = IMPACT_CONFIG[impact as keyof typeof IMPACT_CONFIG];
        if (!config) return null;
        
        return (
            <Badge className={`${config.color} border-0 text-xs`}>
                {config.label}
            </Badge>
        );
    };

    const handleViewEvidence = (url: string) => {
        window.open(url, '_blank');
    };

    const handleDeleteEvidenceWrapper = (evidenceId: number) => {
        handleDeleteEvidence(evidenceId);
    };

    const MobileTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <ReportInfoCard 
                            report={report} 
                            getUrgencyBadge={getUrgencyBadge}
                            getImpactBadge={getImpactBadge}
                        />
                        <ReporterInfoCard 
                            isAnonymous={report.is_anonymous}
                            reporterName={report.reporter_name}
                            reporterContact={report.reporter_contact}
                            reporterAddress={report.reporter_address}
                        />
                    </div>
                );
            case 'evidence':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <EvidenceCard
                            evidences={report.evidences}
                            canEdit={report.canEdit ?? false}
                            reportId={report.id}
                            onViewEvidence={handleViewEvidence}
                            onDownloadEvidence={downloadEvidence}
                            onDeleteEvidence={handleDeleteEvidenceWrapper}
                            deletingEvidenceId={deletingEvidence}
                        />
                    </div>
                );
            case 'timeline':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <TimelineCard report={report} />
                        {report.canEdit && (
                            <QuickActionsCard 
                                canEdit={report.canEdit ?? false}
                                reportId={report.id}
                                onPrint={handlePrint}
                                onShare={handleShare}
                            />
                        )}
                    </div>
                );
            case 'help':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <HelpCard />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Head title={`Report #${report.report_number}`} />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Reports', href: '/portal/community-reports' },
                    { title: `#${report.report_number}`, href: `/portal/community-reports/${report.id}` }
                ]}
            >
                <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <MobileHeader
                            reportNumber={report.report_number}
                            title={report.title}
                            canEdit={report.canEdit ?? false}
                            reportId={report.id}
                            onPrint={handlePrint}
                            onShare={handleShare}
                            isOpen={showActionsSheet}
                            onOpenChange={setShowActionsSheet}
                        />
                    )}

                    {/* Desktop Header */}
                    {!isMobile && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/portal/community-reports">
                                    <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Reports
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                        Report #{report.report_number}
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Filed on {formatDateTime(report.created_at, null, false)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 rounded-xl">
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 rounded-xl">
                                    <Share2 className="h-4 w-4" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Status Banner */}
                    <StatusBanner
                        status={report.status}
                        priority={report.priority}
                        assignedToUser={report.assigned_to_user}
                        createdAt={report.created_at}
                        updatedAt={report.updated_at}
                        acknowledgedAt={report.acknowledged_at}
                        resolvedAt={report.resolved_at}
                        resolutionNotes={report.resolution_notes}
                        formatDateTime={formatDateTime}
                    />

                    {/* Main Content */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                            {isMobile ? (
                                <>
                                    <MobileTabNavigation 
                                        activeTab={activeTab} 
                                        onTabChange={setActiveTab} 
                                    />
                                    <MobileTabContent />
                                </>
                            ) : (
                                <>
                                    <ReportInfoCard 
                                        report={report} 
                                        getUrgencyBadge={getUrgencyBadge}
                                        getImpactBadge={getImpactBadge}
                                    />
                                    <EvidenceCard
                                        evidences={report.evidences}
                                        canEdit={report.canEdit ?? false}
                                        reportId={report.id}
                                        onViewEvidence={handleViewEvidence}
                                        onDownloadEvidence={downloadEvidence}
                                        onDeleteEvidence={handleDeleteEvidenceWrapper}
                                        deletingEvidenceId={deletingEvidence}
                                    />
                                    <TimelineCard report={report} />
                                </>
                            )}
                        </div>

                        {/* Sidebar (Desktop Only) */}
                        {!isMobile && (
                            <div className="space-y-4">
                                <ReporterInfoCard 
                                    isAnonymous={report.is_anonymous}
                                    reporterName={report.reporter_name}
                                    reporterContact={report.reporter_contact}
                                    reporterAddress={report.reporter_address}
                                />
                                {report.canEdit && (
                                    <QuickActionsCard 
                                        canEdit={report.canEdit ?? false}
                                        reportId={report.id}
                                        onPrint={handlePrint}
                                        onShare={handleShare}
                                    />
                                )}
                                <HelpCard />
                            </div>
                        )}
                    </div>

                    {/* Mobile Bottom Actions */}
                    {isMobile && report.canEdit && (
                        <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom animate-slide-up">
                            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 p-3 shadow-lg">
                                <div className="flex gap-2">
                                    <Button 
                                        className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600"
                                        size="default"
                                        asChild
                                    >
                                        <Link href={`/portal/community-reports/${report.id}/edit`}>
                                            <FileText className="h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="default" 
                                        className="flex-1 gap-2 rounded-xl"
                                        asChild
                                    >
                                        <Link 
                                            href={`/portal/community-reports/${report.id}`} 
                                            method="delete"
                                            as="button"
                                            type="button"
                                            onClick={(e) => {
                                                if (!confirm('Are you sure you want to delete this report?')) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop Footer Actions */}
                    {!isMobile && report.canEdit && (
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <Link href={`/portal/community-reports/${report.id}/edit`}>
                                <Button className="gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                                    <FileText className="h-4 w-4" />
                                    Edit Report
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Print Styles */}
                <style>
                    {`
                        @media print {
                            .no-print,
                            .md\\:hidden,
                            .fixed,
                            button,
                            [role="button"],
                            .tabs-trigger,
                            a[href^="/portal/community-reports"]:not(.print-link) {
                                display: none !important;
                            }
                            
                            body {
                                font-size: 12pt;
                                padding: 0;
                                margin: 0;
                            }
                            
                            .print-content {
                                margin: 0;
                                padding: 20px;
                            }
                            
                            .border {
                                border: 1px solid #e5e7eb !important;
                            }
                            
                            .card {
                                break-inside: avoid;
                                margin-bottom: 16px !important;
                            }
                            
                            .grid {
                                display: block !important;
                            }
                            
                            .lg\\:col-span-2 {
                                width: 100% !important;
                            }
                            
                            .space-y-4 > * + * {
                                margin-top: 1rem !important;
                            }
                        }
                    `}
                </style>
            </ResidentLayout>
        </>
    );
}