// resources/js/Pages/Admin/Reports/ReportTypes/components/requirement-badges.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Image, User } from 'lucide-react';
import { ReportType } from '../types';

interface Props {
    reportType: ReportType;
}

export const RequirementBadges = ({ reportType }: Props) => {
    const getRequirementBadges = () => {
        const badges = [];

        if (reportType.requires_immediate_action) {
            badges.push(
                <Badge key="immediate" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Immediate Action
                </Badge>
            );
        }

        if (reportType.requires_evidence) {
            badges.push(
                <Badge key="evidence" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                    <Image className="h-3 w-3 mr-1" />
                    Evidence Required
                </Badge>
            );
        }

        if (reportType.allows_anonymous) {
            badges.push(
                <Badge key="anonymous" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                    <User className="h-3 w-3 mr-1" />
                    Anonymous Allowed
                </Badge>
            );
        }

        return badges;
    };

    const badges = getRequirementBadges();

    if (badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {badges}
        </div>
    );
};