// /components/residentui/reports/FilterModalContent.tsx
import { ModernSelect } from '@/components/residentui/modern-select';
import { Filter } from 'lucide-react';

interface FilterModalContentProps {
    statusFilter: string;
    onStatusChange: (value: string) => void;
    urgencyFilter: string;
    onUrgencyChange: (value: string) => void;
    categoryFilter: string;
    onCategoryChange: (value: string) => void;
    typeFilter: string;
    onTypeChange: (value: string) => void;
    loading: boolean;
    filterOptions: {
        categories: string[];
        reportTypes: Array<{ id: number; name: string }>;
    };
}

export const FilterModalContent = ({
    statusFilter,
    onStatusChange,
    urgencyFilter,
    onUrgencyChange,
    categoryFilter,
    onCategoryChange,
    typeFilter,
    onTypeChange,
    loading,
    filterOptions
}: FilterModalContentProps) => (
    <>
        {/* Status Filter */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
            </label>
            <ModernSelect
                value={statusFilter}
                onValueChange={onStatusChange}
                placeholder="All status"
                options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'under_review', label: 'Under Review' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'resolved', label: 'Resolved' },
                    { value: 'rejected', label: 'Rejected' },
                ]}
                disabled={loading}
                icon={Filter}
            />
        </div>

        {/* Urgency Filter */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Urgency
            </label>
            <ModernSelect
                value={urgencyFilter}
                onValueChange={onUrgencyChange}
                placeholder="All urgency"
                options={[
                    { value: 'all', label: 'All Urgency' },
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                ]}
                disabled={loading}
            />
        </div>

        {/* Category Filter */}
        {filterOptions?.categories?.length > 0 && (
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                </label>
                <ModernSelect
                    value={categoryFilter}
                    onValueChange={onCategoryChange}
                    placeholder="All categories"
                    options={[
                        { value: 'all', label: 'All Categories' },
                        ...filterOptions.categories.map(cat => ({
                            value: cat,
                            label: cat
                        }))
                    ]}
                    disabled={loading}
                />
            </div>
        )}

        {/* Report Type Filter */}
        {filterOptions?.reportTypes?.length > 0 && (
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Report Type
                </label>
                <ModernSelect
                    value={typeFilter}
                    onValueChange={onTypeChange}
                    placeholder="All types"
                    options={[
                        { value: 'all', label: 'All Types' },
                        ...filterOptions.reportTypes.map(type => ({
                            value: type.id.toString(),
                            label: type.name
                        }))
                    ]}
                    disabled={loading}
                />
            </div>
        )}
    </>
);