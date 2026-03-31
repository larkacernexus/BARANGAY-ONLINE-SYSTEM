// resources/js/components/admin/blotters/show/components/blotter-tabs.tsx

import { AdminTabsWithContent, AdminTabPanel } from '@/components/adminui/admin-tabs';
import { FileText, Info, Users, Download, FileCheck, AlertCircle } from 'lucide-react';
import { Blotter, InvolvedResident } from '@/types/admin/blotters/blotter';
import { DisplayAttachment } from '@/types/admin/blotters/display-attachment';
import { OverviewTab } from '@/components/admin/blotters/show/tabs/overview-tab';
import { DetailsTab } from '@/components/admin/blotters/show/tabs/details-tab';
import { ResidentsTab } from '@/components/admin/blotters/show/tabs/residents-tab';
import { AttachmentsTab } from '@/components/admin/blotters/show/tabs/attachments-tab';
import { ActionTab } from '@/components/admin/blotters/show/tabs/action-tab';

interface BlotterTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    blotter: Blotter;
    attachments: DisplayAttachment[];
    involvedResidents: InvolvedResident[];
    isLoadingAttachments: boolean;
    hasActionTaken: boolean;
    onDownload: (attachment: DisplayAttachment, index: number) => void;
}

export function BlotterTabs({
    activeTab,
    onTabChange,
    blotter,
    attachments,
    involvedResidents,
    isLoadingAttachments,
    hasActionTaken,
    onDownload
}: BlotterTabsProps) {
    // Helper function to get attachment count safely
    const getAttachmentCount = (): number => {
        if (isLoadingAttachments) return 0;
        return Array.isArray(attachments) ? attachments.length : 0;
    };

    // Helper function to get residents count safely
    const getResidentsCount = (): number => {
        return Array.isArray(involvedResidents) ? involvedResidents.length : 0;
    };

    const tabs = [
        { 
            id: 'overview', 
            label: 'Overview', 
            icon: <Info className="h-4 w-4" />,
            disabled: false
        },
        { 
            id: 'details', 
            label: 'Details', 
            icon: <FileText className="h-4 w-4" />,
            disabled: false
        },
        { 
            id: 'residents', 
            label: 'Residents', 
            icon: <Users className="h-4 w-4" />,
            count: getResidentsCount(),
            disabled: getResidentsCount() === 0
        },
        { 
            id: 'attachments', 
            label: 'Attachments', 
            icon: <Download className="h-4 w-4" />,
            count: getAttachmentCount(),
            disabled: getAttachmentCount() === 0 && !isLoadingAttachments
        },
        { 
            id: 'action', 
            label: 'Action Taken', 
            icon: <FileCheck className="h-4 w-4" />,
            disabled: !hasActionTaken
        },
    ];

    // If there are no attachments, show a message in the attachments tab
    const renderAttachmentsTab = () => {
        if (isLoadingAttachments) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading attachments...</p>
                    </div>
                </div>
            );
        }

        if (getAttachmentCount() === 0) {
            return (
                <div className="text-center py-12">
                    <Download className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold dark:text-gray-100 mb-2">No Attachments</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        No files have been attached to this blotter record.
                    </p>
                </div>
            );
        }

        return (
            <AttachmentsTab
                attachments={attachments}
                isLoading={isLoadingAttachments}
                onDownload={onDownload}
                blotterId={blotter.id}
            />
        );
    };

    // If there are no involved residents, show a message in the residents tab
    const renderResidentsTab = () => {
        if (getResidentsCount() === 0) {
            return (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold dark:text-gray-100 mb-2">No Involved Residents</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        No residents have been listed as involved in this incident.
                    </p>
                </div>
            );
        }

        return (
            <ResidentsTab 
                blotter={blotter}
                involvedResidents={involvedResidents}
            />
        );
    };

    // If no action taken, show a message in the action tab
    const renderActionTab = () => {
        if (!hasActionTaken) {
            return (
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold dark:text-gray-100 mb-2">No Action Taken Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        This blotter is still pending investigation. Action will be recorded once the investigation is complete.
                    </p>
                </div>
            );
        }

        return <ActionTab blotter={blotter} />;
    };

    return (
        <AdminTabsWithContent
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            variant="underlined"
            size="md"
            scrollable={true}
            showCountBadges={true}
            lazyLoad={true}
        >
            <AdminTabPanel value="overview">
                <OverviewTab
                    blotter={blotter}
                    involvedResidents={involvedResidents}
                    attachmentsCount={getAttachmentCount()}
                    onViewResidents={() => onTabChange('residents')}
                    onViewDetails={() => onTabChange('details')}
                />
            </AdminTabPanel>

            <AdminTabPanel value="details">
                <DetailsTab blotter={blotter} />
            </AdminTabPanel>

            <AdminTabPanel value="residents">
                {renderResidentsTab()}
            </AdminTabPanel>

            <AdminTabPanel value="attachments">
                {renderAttachmentsTab()}
            </AdminTabPanel>

            <AdminTabPanel value="action">
                {renderActionTab()}
            </AdminTabPanel>
        </AdminTabsWithContent>
    );
}