// resources/js/components/admin/blotters/show/components/blotter-tabs.tsx

import { AdminTabsWithContent, AdminTabPanel } from '@/components/adminui/admin-tabs';
import { FileText, Info, Users, Download, FileCheck } from 'lucide-react';
import { Blotter, Attachment, InvolvedResident } from '../types';
import { OverviewTab } from '@/components/admin/blotters/show/tabs/overview-tab';
import { DetailsTab } from '@/components/admin/blotters/show/tabs/details-tab';
import { ResidentsTab } from '@/components/admin/blotters/show/tabs/residents-tab';
import { AttachmentsTab } from '@/components/admin/blotters/show/tabs/attachments-tab';
import { ActionTab } from '@/components/admin/blotters/show/tabs/action-tab';

interface BlotterTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    blotter: Blotter;
    attachments: Attachment[];
    involvedResidents: InvolvedResident[];
    isLoadingAttachments: boolean;
    hasActionTaken: boolean;
    onDownload: (attachment: Attachment, index: number) => void;
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
    const tabs = [
        { 
            id: 'overview', 
            label: 'Overview', 
            icon: <Info className="h-4 w-4" />,
        },
        { 
            id: 'details', 
            label: 'Details', 
            icon: <FileText className="h-4 w-4" />,
        },
        { 
            id: 'residents', 
            label: 'Residents', 
            icon: <Users className="h-4 w-4" />,
            count: involvedResidents.length 
        },
        { 
            id: 'attachments', 
            label: 'Attachments', 
            icon: <Download className="h-4 w-4" />,
            count: attachments.length 
        },
        { 
            id: 'action', 
            label: 'Action Taken', 
            icon: <FileCheck className="h-4 w-4" />,
            disabled: !hasActionTaken
        },
    ];

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
                    attachmentsCount={attachments.length}
                    onViewResidents={() => onTabChange('residents')}
                    onViewDetails={() => onTabChange('details')}
                />
            </AdminTabPanel>

            <AdminTabPanel value="details">
                <DetailsTab blotter={blotter} />
            </AdminTabPanel>

            <AdminTabPanel value="residents">
                <ResidentsTab 
                    blotter={blotter}
                    involvedResidents={involvedResidents}
                />
            </AdminTabPanel>

            <AdminTabPanel value="attachments">
                <AttachmentsTab
                    attachments={attachments}
                    isLoading={isLoadingAttachments}
                    onDownload={onDownload}
                    blotterId={blotter.id}
                />
            </AdminTabPanel>

            <AdminTabPanel value="action">
                <ActionTab blotter={blotter} />
            </AdminTabPanel>
        </AdminTabsWithContent>
    );
}