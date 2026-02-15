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
            color: 'text-red-700 bg-red-50 border-red-200'
        },
        {
            label: 'Safety Concerns',
            icon: <ShieldAlert className="h-4 w-4" />,
            action: () => {
                onFilterChange.setSafetyConcernFilter(true);
                onFilterChange.setPriorityFilter('all');
            },
            active: filters.safetyConcernFilter,
            color: 'text-orange-700 bg-orange-50 border-orange-200'
        },
        {
            label: 'High Urgency',
            icon: <Zap className="h-4 w-4" />,
            action: () => {
                onFilterChange.setUrgencyFilter('high');
                onFilterChange.setStatusFilter('all');
            },
            active: filters.urgencyFilter === 'high',
            color: 'text-red-700 bg-red-50 border-red-200'
        },
        {
            label: 'Unassigned',
            icon: <UserX className="h-4 w-4" />,
            action: () => {
                onFilterChange.setAssignedFilter('unassigned');
                onFilterChange.setStatusFilter('all');
            },
            active: filters.assignedFilter === 'unassigned',
            color: 'text-gray-700 bg-gray-50 border-gray-200'
        },
        {
            label: 'With Evidence',
            icon: <FileText className="h-4 w-4" />,
            action: () => {
                onFilterChange.setHasEvidencesFilter(true);
                onFilterChange.setStatusFilter('all');
            },
            active: filters.hasEvidencesFilter,
            color: 'text-blue-700 bg-blue-50 border-blue-200'
        },
        {
            label: 'Community Impact',
            icon: <Globe className="h-4 w-4" />,
            action: () => {
                onFilterChange.setAffectedPeopleFilter('community');
                onFilterChange.setStatusFilter('all');
            },
            active: filters.affectedPeopleFilter === 'community',
            color: 'text-purple-700 bg-purple-50 border-purple-200'
        },
        {
            label: 'Environmental Impact',
            icon: <AlertOctagon className="h-4 w-4" />,
            action: () => {
                onFilterChange.setEnvironmentalFilter(true);
                onFilterChange.setStatusFilter('all');
            },
            active: filters.environmentalFilter,
            color: 'text-green-700 bg-green-50 border-green-200'
        },
        {
            label: 'Recurring Issues',
            icon: <RefreshCw className="h-4 w-4" />,
            action: () => {
                onFilterChange.setRecurringFilter(true);
                onFilterChange.setStatusFilter('all');
            },
            active: filters.recurringFilter,
            color: 'text-yellow-700 bg-yellow-50 border-yellow-200'
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
                    className={`h-7 text-xs ${filter.active ? filter.color : ''}`}
                >
                    {filter.icon}
                    <span className="ml-1">{filter.label}</span>
                </Button>
            ))}
        </div>
    );
}