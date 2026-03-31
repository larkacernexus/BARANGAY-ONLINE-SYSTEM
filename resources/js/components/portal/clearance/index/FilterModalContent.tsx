// /components/residentui/reports/ReportFilterModalContent.tsx
import { ModernSelect } from '@/components/residentui/modern-select';
import { Flag, FileText, FolderOpen, AlertCircle } from 'lucide-react';
import { FilterOptions, ReportCategory, ReportStatus, UrgencyLevel } from '@/types/portal/reports/community-report';

interface ReportFilterModalContentProps {
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    selectedUrgency: string;
    onUrgencyChange: (urgency: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    selectedType: string;
    onTypeChange: (type: string) => void;
    loading: boolean;
    filterOptions: FilterOptions;
}

export const ReportFilterModalContent = ({
    selectedStatus,
    onStatusChange,
    selectedUrgency,
    onUrgencyChange,
    selectedCategory,
    onCategoryChange,
    selectedType,
    onTypeChange,
    loading,
    filterOptions
}: ReportFilterModalContentProps) => {
    // Map statuses to display labels
    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        ...(filterOptions.statuses || []).map(status => ({
            value: status,
            label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }))
    ];

    // Map urgency levels
    const urgencyOptions = [
        { value: 'all', label: 'All Urgency' },
        ...(filterOptions.priorities || ['low', 'medium', 'high']).map(urgency => ({
            value: urgency,
            label: urgency.charAt(0).toUpperCase() + urgency.slice(1)
        }))
    ];

    // Map categories
    const categoryOptions = [
        { value: 'all', label: 'All Categories' },
        ...(filterOptions.categories || []).map(category => ({
            value: category,
            label: category.charAt(0).toUpperCase() + category.slice(1)
        }))
    ];

    // Map report types
    const typeOptions = [
        { value: 'all', label: 'All Report Types' },
        ...(filterOptions.reportTypes || []).map(type => ({
            value: type.id.toString(),
            label: type.name
        }))
    ];

    return (
        <div className="space-y-4">
            {/* Status Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                </label>
                <ModernSelect
                    value={selectedStatus}
                    onValueChange={onStatusChange}
                    placeholder="All statuses"
                    options={statusOptions}
                    disabled={loading}
                    icon={AlertCircle}
                />
            </div>

            {/* Report Type Filter */}
            {filterOptions.reportTypes && filterOptions.reportTypes.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Report Type
                    </label>
                    <ModernSelect
                        value={selectedType}
                        onValueChange={onTypeChange}
                        placeholder="All report types"
                        options={typeOptions}
                        disabled={loading}
                        icon={FileText}
                    />
                </div>
            )}

            {/* Category Filter */}
            {filterOptions.categories && filterOptions.categories.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                    </label>
                    <ModernSelect
                        value={selectedCategory}
                        onValueChange={onCategoryChange}
                        placeholder="All categories"
                        options={categoryOptions}
                        disabled={loading}
                        icon={FolderOpen}
                    />
                </div>
            )}

            {/* Urgency Filter */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Urgency
                </label>
                <ModernSelect
                    value={selectedUrgency}
                    onValueChange={onUrgencyChange}
                    placeholder="All urgency"
                    options={urgencyOptions}
                    disabled={loading}
                    icon={Flag}
                />
            </div>
        </div>
    );
};