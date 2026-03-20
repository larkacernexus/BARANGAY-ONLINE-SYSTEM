import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    ShieldAlert,
    Zap,
    UserX,
    FileText,
    Globe,
    AlertOctagon,
    RefreshCw,
} from 'lucide-react';

interface QuickFiltersProps {
    filters: {
        priorityFilter: string;
        safetyConcernFilter: boolean;
        urgencyFilter: string;
        assignedFilter: string;
        hasEvidencesFilter: boolean;
        affectedPeopleFilter: string;
        environmentalFilter: boolean;
        recurringFilter: boolean;
    };
    onFilterChange: {
        setPriorityFilter: (value: string) => void;
        setSafetyConcernFilter: (value: boolean) => void;
        setUrgencyFilter: (value: string) => void;
        setAssignedFilter: (value: string) => void;
        setHasEvidencesFilter: (value: boolean) => void;
        setAffectedPeopleFilter: (value: string) => void;
        setEnvironmentalFilter: (value: boolean) => void;
        setRecurringFilter: (value: boolean) => void;
        setStatusFilter: (value: string) => void;
    };
}

export default function QuickFilters({
    filters,
    onFilterChange
}: QuickFiltersProps) {
    const quickFilterActions = [
        {
            label: 'Critical Priority',
            icon: <AlertTriangle className="h-4 w-4" />,
            action: () => {
                onFilterChange.setPriorityFilter('critical');
                onFilterChange.setStatusFilter('all');
            },
            active: filters.priorityFilter === 'critical',
            lightColor: 'text-red-700 bg-red-50 border-red-200',
            darkColor: 'dark:text-red-400 dark:bg-red-950/50 dark:border-red-800'
        },
        {
            label: 'Safety Concerns',
            icon: <ShieldAlert className="h-4 w-4" />,
            action: () => {
                onFilterChange.setSafetyConcernFilter(true);
                onFilterChange.setPriorityFilter('all');
            },
            active: filters.safetyConcernFilter,
            lightColor: 'text-orange-700 bg-orange-50 border-orange-200',
            darkColor: 'dark:text-orange-400 dark:bg-orange-950/50 dark:border-orange-800'
        },
        {
            label: 'High Urgency',
            icon: <Zap className="h-4 w-4" />,
            action: () => {
                onFilterChange.setUrgencyFilter('high');
                onFilterChange.setStatusFilter('all');
            },
            active: filters.urgencyFilter === 'high',
            lightColor: 'text-red-700 bg-red-50 border-red-200',
            darkColor: 'dark:text-red-400 dark:bg-red-950/50 dark:border-red-800'
        },
        {
            label: 'Unassigned',
            icon: <UserX className="h-4 w-4" />,
            action: () => {
                onFilterChange.setAssignedFilter('unassigned');
                onFilterChange.setStatusFilter('all');
            },
            active: filters.assignedFilter === 'unassigned',
            lightColor: 'text-gray-700 bg-gray-50 border-gray-200',
            darkColor: 'dark:text-gray-400 dark:bg-gray-900/50 dark:border-gray-700'
        },
        {
            label: 'With Evidence',
            icon: <FileText className="h-4 w-4" />,
            action: () => {
                onFilterChange.setHasEvidencesFilter(true);
                onFilterChange.setStatusFilter('all');
            },
            active: filters.hasEvidencesFilter,
            lightColor: 'text-blue-700 bg-blue-50 border-blue-200',
            darkColor: 'dark:text-blue-400 dark:bg-blue-950/50 dark:border-blue-800'
        },
        {
            label: 'Community Impact',
            icon: <Globe className="h-4 w-4" />,
            action: () => {
                onFilterChange.setAffectedPeopleFilter('community');
                onFilterChange.setStatusFilter('all');
            },
            active: filters.affectedPeopleFilter === 'community',
            lightColor: 'text-purple-700 bg-purple-50 border-purple-200',
            darkColor: 'dark:text-purple-400 dark:bg-purple-950/50 dark:border-purple-800'
        },
        {
            label: 'Environmental Impact',
            icon: <AlertOctagon className="h-4 w-4" />,
            action: () => {
                onFilterChange.setEnvironmentalFilter(true);
                onFilterChange.setStatusFilter('all');
            },
            active: filters.environmentalFilter,
            lightColor: 'text-green-700 bg-green-50 border-green-200',
            darkColor: 'dark:text-green-400 dark:bg-green-950/50 dark:border-green-800'
        },
        {
            label: 'Recurring Issues',
            icon: <RefreshCw className="h-4 w-4" />,
            action: () => {
                onFilterChange.setRecurringFilter(true);
                onFilterChange.setStatusFilter('all');
            },
            active: filters.recurringFilter,
            lightColor: 'text-yellow-700 bg-yellow-50 border-yellow-200',
            darkColor: 'dark:text-yellow-400 dark:bg-yellow-950/50 dark:border-yellow-800'
        },
    ];

    return (
        <div className="flex flex-wrap gap-2">
            {quickFilterActions.map((filter, index) => (
                <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={filter.action}
                    className={`
                        h-7 text-xs
                        bg-white dark:bg-gray-900
                        text-gray-700 dark:text-gray-300
                        border-gray-200 dark:border-gray-700
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        ${filter.active ? `${filter.lightColor} ${filter.darkColor}` : ''}
                    `}
                >
                    {filter.icon}
                    <span className="ml-1">{filter.label}</span>
                </Button>
            ))}
        </div>
    );
}