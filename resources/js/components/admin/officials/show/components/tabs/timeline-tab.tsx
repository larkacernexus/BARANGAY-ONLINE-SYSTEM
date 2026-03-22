// resources/js/Pages/Admin/Officials/components/timeline-tab.tsx
import React from 'react';
import { TimelineCard } from '../timeline-card';
import { SystemInfoCard } from '../system-info-card';

interface Props {
    official: any;
    formatDate: (date: string, includeTime?: boolean) => string;
}

export const TimelineTab = ({ official, formatDate }: Props) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <TimelineCard official={official} formatDate={formatDate} />
            <SystemInfoCard official={official} formatDate={formatDate} />
        </div>
    );
};